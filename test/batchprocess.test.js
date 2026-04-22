const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildHostList,
  getDeploymentCommand,
  parseCliArgs,
  processHost,
  processHosts,
} = require('../batchprocess.js');

function createLogger() {
  const logs = [];
  const errors = [];

  return {
    logs,
    errors,
    logger: {
      log(message) {
        logs.push(message);
      },
      error(message) {
        errors.push(message);
      },
    },
  };
}

test('parseCliArgs supports a dry-run single-domain execution', () => {
  assert.deepEqual(parseCliArgs(['--dry-run', 'books.allwomenstalk.com']), {
    dryRun: true,
    requestedDomain: 'books.allwomenstalk.com',
  });
});

test('buildHostList returns a single requested domain', () => {
  const hosts = buildHostList({
    requestedDomain: 'books.allwomenstalk.com',
    cfHosts: [{ domain: 'ignored.allwomenstalk.com' }],
    s3Hosts: ['allwomenstalk.com'],
  });

  assert.deepEqual(hosts, ['books.allwomenstalk.com']);
});

test('buildHostList merges and deduplicates configured domains', () => {
  const hosts = buildHostList({
    cfHosts: [
      { domain: 'books.allwomenstalk.com' },
      { domain: 'fitness.allwomenstalk.com' },
      { domain: 'allwomenstalk.com' },
    ],
    s3Hosts: ['allwomenstalk.com', 'lifestyle.allwomenstalk.com'],
  });

  assert.deepEqual(hosts, [
    'books.allwomenstalk.com',
    'fitness.allwomenstalk.com',
    'allwomenstalk.com',
    'lifestyle.allwomenstalk.com',
  ]);
});

test('getDeploymentCommand selects git for non-s3 domains and s3 for s3 domains', () => {
  assert.deepEqual(
    getDeploymentCommand('books.allwomenstalk.com', ['allwomenstalk.com']),
    {
      type: 'git',
      command: 'sh',
      args: ['batchcommitforce.sh', 'books.allwomenstalk.com'],
    },
  );

  assert.deepEqual(
    getDeploymentCommand('allwomenstalk.com', ['allwomenstalk.com']),
    {
      type: 's3',
      command: 'aws',
      args: [
        's3',
        'cp',
        '_site/allwomenstalk.com',
        's3://allwomenstalk.com',
        '--recursive',
      ],
    },
  );
});

test('processHost runs generate, deploy, and cleanup once for a git host', async () => {
  const runCalls = [];
  const cleanups = [];
  const { logger, errors } = createLogger();

  const result = await processHost({
    domain: 'books.allwomenstalk.com',
    index: 1,
    total: 1,
    s3Hosts: ['allwomenstalk.com'],
    logger,
    logDir: '/tmp/batchprocess-tests',
    createLogFileImpl: (domain) => `/tmp/${domain}.log`,
    appendLogLineImpl: () => {},
    runCommandImpl: async (command, args, options) => {
      runCalls.push({ command, args, options });
    },
    cleanupSiteDirImpl: (domain) => {
      cleanups.push(domain);
    },
  });

  assert.equal(result.status, 'ok');
  assert.deepEqual(runCalls, [
    {
      command: 'node',
      args: ['batchgeneratehost.js', 'books.allwomenstalk.com'],
      options: { logFilePath: '/tmp/books.allwomenstalk.com.log' },
    },
    {
      command: 'sh',
      args: ['batchcommitforce.sh', 'books.allwomenstalk.com'],
      options: { logFilePath: '/tmp/books.allwomenstalk.com.log' },
    },
  ]);
  assert.deepEqual(cleanups, ['books.allwomenstalk.com']);
  assert.deepEqual(errors, []);
});

test('processHost runs s3 deployment for s3 hosts', async () => {
  const runCalls = [];
  const { logger } = createLogger();

  const result = await processHost({
    domain: 'allwomenstalk.com',
    index: 1,
    total: 1,
    s3Hosts: ['allwomenstalk.com'],
    logger,
    logDir: '/tmp/batchprocess-tests',
    createLogFileImpl: (domain) => `/tmp/${domain}.log`,
    appendLogLineImpl: () => {},
    runCommandImpl: async (command, args, options) => {
      runCalls.push({ command, args, options });
    },
    cleanupSiteDirImpl: () => {},
  });

  assert.equal(result.status, 'ok');
  assert.deepEqual(runCalls, [
    {
      command: 'node',
      args: ['batchgeneratehost.js', 'allwomenstalk.com'],
      options: { logFilePath: '/tmp/allwomenstalk.com.log' },
    },
    {
      command: 'aws',
      args: ['s3', 'cp', '_site/allwomenstalk.com', 's3://allwomenstalk.com', '--recursive'],
      options: { logFilePath: '/tmp/allwomenstalk.com.log' },
    },
  ]);
});

test('processHosts continues after a host failure and reports it in the summary', async () => {
  const { logger, errors } = createLogger();

  const summary = await processHosts(['ok.allwomenstalk.com', 'bad.allwomenstalk.com'], {
    s3Hosts: ['allwomenstalk.com'],
    logger,
    logDir: '/tmp/batchprocess-tests',
    createLogFileImpl: (domain) => `/tmp/${domain}.log`,
    appendLogLineImpl: () => {},
    cleanupSiteDirImpl: () => {},
    runCommandImpl: async (command, args, options) => {
      if (args[1] === 'bad.allwomenstalk.com') {
        const error = new Error('simulated failure');
        error.logFilePath = options.logFilePath;
        error.tail = 'last error line';
        throw error;
      }
    },
  });

  assert.equal(summary.successful.length, 1);
  assert.equal(summary.failed.length, 1);
  assert.match(errors.join('\n'), /bad\.allwomenstalk\.com/);
  assert.match(errors.join('\n'), /last error line/);
});

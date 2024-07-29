// DEPLY TO CLOUDFLARE PAGES

require('dotenv').config();
const fs = require('fs').promises; // Use the promise-based version of fs
const util = require('util');
const exec = util.promisify(require('child_process').exec); // Promisify exec

// Path to the JSON file
const filePath = './cloudflare/hosts.json';

// Check if command line argument is provided
if (process.argv.length >= 3) {
    var host = process.argv[2];
  } else {
    // If not, try using the environment variable
    var host = process.env.HOST;
    if (!host) {
        // If environment variable is also not available, log usage and exit
        console.log('Usage: node batchgeneratehost.js <host>');
        process.exit(1);
    }
  }

// Function to update a specific host
async function deployHost(hostName) {
    const start_time = new Date();

    try {
        const data = await fs.readFile(filePath, 'utf8');
        const hosts = JSON.parse(data);
        const host = hosts.find(h => h.subdomain.startsWith('allwomenstalk-'+hostName.split('.')[0]));
        
        if (host) {
            const newHostName = `${hostName}`;
            // const command = `npx wrangler pages deploy ./_site/${newHostName} --branch main --project-name ${host.name} --commit-dirty=true`;
            const command = `npx wrangler pages deploy ./_site/${newHostName} --branch main --project-name ${host.name}`;
            console.log(`Deploying ${host.name} at ${newHostName}.`);
            console.log(`Command: ${command}`);

            try {
                const { stdout, stderr } = await exec(command);
                if (stderr) {
                    console.error(`Error in deployment output for ${host.name} (${newHostName}):`, stderr);
                } else {
                    console.log(`Deployment output for ${host.name} (${newHostName}):`, stdout);
                }
            } catch (error) {
                console.error(`Error executing deploy for ${host.name} (${newHostName}):`, error);
            }
        } else {
            console.error(`No host found with the name ${hostName}`);
        }
    } catch (err) {
        console.error('Error reading the hosts.json file or processing data:', err);
    }
    end_time = new Date();
    duration = Math.round((end_time - start_time) / 1000);
    console.log('Duration (seconds):', duration);
}

// Function to deploy all hosts
async function deployHosts() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const hosts = JSON.parse(data);

        for (const host of hosts) {
            await deployHost(host['domain']);
        }
    } catch (err) {
        console.error('Error reading the hosts.json file or processing data:', err);
    }
}



if (host) {
    deployHost(host);
} else {
    deployHosts();
}

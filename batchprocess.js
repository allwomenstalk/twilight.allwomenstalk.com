const fs = require('fs');
const { execSync } = require('child_process');

// Read the JSON file
const data = fs.readFileSync('./cloudflare/hosts.json', 'utf8');
const hosts = JSON.parse(data);

// Function to run commands for each host
function runCommandsForHost(domain) {
    try {
        console.log(`Running commands for: ${domain}`);
        execSync(`node batchgeneratehost.js ${domain}`, { stdio: 'inherit' });
        execSync(`node batchdeploy.js ${domain}`, { stdio: 'inherit' });
        execSync(`rm -rf _site/${domain}`, { stdio: 'inherit' });
        console.log(`Commands completed for: ${domain}`);
    } catch (error) {
        console.error(`Error executing commands for ${domain}: ${error}`);
    }
}

// Loop through each host and run the commands
hosts.forEach(host => {
    runCommandsForHost(host.domain);
});

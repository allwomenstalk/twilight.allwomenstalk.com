const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');


// Read the JSON file
const data = fs.readFileSync('./cloudflare/hosts.json', 'utf8');
const hosts = JSON.parse(data);
// reset profile - write into src/_data/profiles.json "[]"
fs.writeFileSync('./src/_data/profiles.json', '[]', 'utf8');

// Function to run commands for each host
function runCommandsForHost(domain) {
    try {
        console.log(`Running commands for: ${domain}`);
        execSync(`node batchgeneratehost.js ${domain}`, { stdio: 'inherit' });
        // removing the deploy to make only git deploy
        // execSync(`node batchdeploy.js ${domain}`, { stdio: 'inherit' });
        execSync(`sh batchcommitforce.sh ${domain}`, { stdio: 'inherit' });
        execSync(`rm -rf _site/${domain}`, { stdio: 'inherit' });
        console.log(`Commands completed for: ${domain}`);
    } catch (error) {
        console.error(`Error executing commands for ${domain}: ${error}`);
    }
}

// Loop through each host and run the commands
function runCommandsForHostWithDelay(hosts, delay) {
    hosts.forEach((host, index) => {
        setTimeout(() => {
            runCommandsForHost(host.domain);
        }, index * delay);
    });
}

const delay = 10000; // 10 seconds in milliseconds
runCommandsForHostWithDelay(hosts, delay);

// runCommandsForHost('apps.allwomenstalk.com')
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');


// Read the JSON file
const data = fs.readFileSync('./cloudflare/hosts.json', 'utf8');
const hosts = JSON.parse(data);
const s3hosts = ['allwomenstalk.com', 
    "love.allwomenstalk.com",
    "lifestyle.allwomenstalk.com",
]
// reset profile - write into src/_data/profiles.json "[]"
fs.writeFileSync('./src/_data/profiles.json', '[]', 'utf8');

// Function to run commands for each host
function runCommandsForHost(domain) {
    try {
        console.log(`Running commands for: ${domain}`);
        execSync(`node batchgeneratehost.js ${domain}`, { stdio: 'inherit' });
        // removing the deploy to make only git deploy
        // execSync(`node batchdeploy.js ${domain}`, { stdio: 'inherit' });
        // if not s3host then run the git commands
        if (!s3hosts.includes(domain)) {
            execSync(`sh batchcommitforce.sh ${domain}`, { stdio: 'inherit' });
            execSync(`rm -rf _site/${domain}`, { stdio: 'inherit' });
        } else {
            // aws s3 cp _site/allwomenstalk.com s3://allwomenstalk.com --recursive
            execSync(`aws s3 cp _site/${domain} s3://${domain} --recursive`, { stdio: 'inherit' });
        }
        console.log(`Commands completed for: ${domain}`);
    } catch (error) {
        console.error(`Error executing commands for ${domain}: ${error}`);
    }
}

// Loop through each host and run the commands
function runCommandsForHostWithDelay(hosts, delay) {
    s3hosts.forEach((host, index) => {
        console.log(`Running commands for: ${host}`);
        setTimeout(() => {
            runCommandsForHost(host.domain);
        }, index * delay);
    });
}

const delay = 10000; // 10 seconds in milliseconds
runCommandsForHostWithDelay(hosts, delay);

// runCommandsForHost('apps.allwomenstalk.com')
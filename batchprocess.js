const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');


// Read the JSON file
const data = fs.readFileSync('./cloudflare/hosts.json', 'utf8');
const cfhosts = JSON.parse(data);
const s3hosts = ['allwomenstalk.com', 
    "lifestyle.allwomenstalk.com",
]
// combine hosts
// const hosts = [...cfhosts, ...s3hosts.map(el=>{
//     return {
//         domain: el,
//     }
// })];
hosts = [
    {
        domain: "love.allwomenstalk.com",
    }
]
console.log(hosts)
// 
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
async function runCommandsForHostWithDelay(hosts, delay) {
    for (const host of hosts) {
        h = host.domain;
        // h = host
        console.log(`Processing... ${h}`);
        await runCommandsForHost(h);
        // run clean up
        execSync(`rm -rf _site/${h}`, { stdio: 'inherit' });
    };
}

const delay = 10000; // 10 seconds in milliseconds
runCommandsForHostWithDelay(hosts, delay);

// runCommandsForHost('apps.allwomenstalk.com')
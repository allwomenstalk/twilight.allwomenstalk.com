require('dotenv').config();
const fs = require('fs').promises; // Use the promise-based version of fs
const util = require('util');
const exec = util.promisify(require('child_process').exec); // Promisify exec

// Path to the JSON file
const filePath = './hosts.json';

// Function to update a specific host
async function updateHost(hostName) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const hosts = JSON.parse(data);
        const host = hosts.find(h => h.subdomain.startsWith('allwomenstalk-'+hostName.split('.')[0]));
        
        if (host) {
            const newHostName = `${hostName}`;
            const command = `npx wrangler pages deploy ../_site/${newHostName} --branch main --project-name ${host.name} --commit-dirty=true`;
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
}

// Function to deploy all hosts
async function deployHosts() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const hosts = JSON.parse(data);

        for (const host of hosts) {
            const subdomainPrefix = host.subdomain.split('.')[0];
            const newHostName = `${subdomainPrefix.split('-')[1]}.allwomenstalk.com`;
            await updateHost(newHostName);
        }
    } catch (err) {
        console.error('Error reading the hosts.json file or processing data:', err);
    }
}

// Check if a specific host is passed as a command-line argument
const specificHost = process.argv[2]; // expects format 'cooking.allwomenstalk.com'
if (specificHost) {
    updateHost(specificHost);
} else {
    deployHosts();
}

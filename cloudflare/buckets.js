require('dotenv').config();
const fs = require('fs').promises;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Path to the JSON file
const filePath = './hosts.json';

async function updateRoute53CNAMEs() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        let hosts = JSON.parse(data);
        // hosts = hosts.slice(1,2)

        for (const host of hosts) {
            if (host.domains && host.domains.length > 0) {
                const domain = host.domains[0]; // Use the first domain as the CNAME value
                const cnameComponent = host.subdomain.split('-')[1].split('.')[0]; // Extract 'running' from 'allwomenstalk-running.pages.dev'
                const cnameValue = `${cnameComponent}.allwomenstalk.com`; // Construct CNAME as 'running.allwomenstalk.com'

                console.log(`Removing ${cnameValue}...`);
                
                
                console.log(`Removing bucket: ${cnameValue}`);
                try {
                    console.log(`Deleting all objects in bucket ${cnameValue}...`);
                    // await exec(`aws s3 rm s3://${cnameValue} --recursive`);

                    await exec(`aws s3 rb s3://${cnameValue} --force`);
                    console.log(`Bucket ${cnameValue} removed successfully.`);
                } catch (error) {
                    console.error(`Failed to remove bucket ${cnameValue}:`, error);
                }
            
            }
        }
    } catch (err) {
        console.error('Error reading the hosts.json file or processing data:', err);
    }
}

updateRoute53CNAMEs();

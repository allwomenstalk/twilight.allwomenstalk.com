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

                const hostedZoneId = 'Z13EFBU9E7X2EZ'; // Set your hosted zone ID here

                const command = `aws route53 change-resource-record-sets --hosted-zone-id ${hostedZoneId} --change-batch '{
                    "Comment": "Update CNAME for ${host.name}",
                    "Changes": [{
                        "Action": "UPSERT",
                        "ResourceRecordSet": {
                            "Name": "${cnameComponent}.allwomenstalk.com",
                            "Type": "CNAME",
                            "TTL": 300,
                            "ResourceRecords": [{"Value": "${host.subdomain}"}]
                        }
                    }]
                }'`;

                console.log(`Updating CNAME for ${host.name} to point to ${cnameValue}...`);
                try {
                    const { stdout, stderr } = await exec(command);
                    if (stderr) {
                        console.error(`Error updating CNAME for ${host.name}:`, stderr);
                    } else {
                        console.log(`Successfully updated CNAME for ${host.name}:`, stdout);
                    }
                } catch (error) {
                    console.error(`AWS CLI command failed for ${host.name}:`, error);
                }
            }
        }
    } catch (err) {
        console.error('Error reading the hosts.json file or processing data:', err);
    }
}

updateRoute53CNAMEs();

const fs = require('fs');
const { exec } = require('child_process');

// Load the data from pages.json
fs.readFile('pages_.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Parse the JSON data
  const pages = JSON.parse(data);

  function updateDNSRecord(index) {
    if (index >= pages.length) {
      console.log("All DNS records updated successfully!");
      return;
    }

    const page = pages[index];
    console.log(`Updating DNS for: ${page.host}...`);

    const payload = {
      "Changes": [
        {
          "Action": "CREATE",
          "ResourceRecordSet": {
            "Name": `${page.host}.`,
            "Type": "CNAME",
            "TTL": 300,
            "ResourceRecords": [
              {
                "Value": `${page.project}.pages.dev`
              }
            ]
          }
        }
      ]
    };

    const command = `aws route53 change-resource-record-sets --hosted-zone-id Z13EFBU9E7X2EZ --change-batch '${JSON.stringify(payload)}'`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
          // Handle specific error
          if (stderr.includes("already exists")) {
            console.warn(`Warning: Record for ${page.host} already exists.`);
          } else {
            console.error(`Error executing: ${command}\n`, error);
          }
        } else {
          console.log(`Output for: ${command}\n`, stdout);
        }
  
        // Proceed to the next page regardless of an error
        updateDNSRecord(index + 1);
      });

  }

  // Start updating DNS from the first page
  updateDNSRecord(0);
});

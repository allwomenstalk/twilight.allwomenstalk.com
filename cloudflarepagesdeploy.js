const fs = require('fs');
const { exec } = require('child_process');

// Load the data from pages.json
fs.readFile('cloudflare/pages.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Parse the JSON data
  const pages = JSON.parse(data);

  // Define a recursive function to deploy each page
  function deployPage(index) {
    if (index >= pages.length) {
      console.log("All pages deployed successfully!");
      return;
    }

    const page = pages[index];
    console.log(`Deploying page: ${page.host}...`)
    const command = `npx wrangler pages deploy _site/${page.host} --branch main --project-name ${page.project}`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing: ${command}\n`, error);
        return;
      }

      console.log(`Output for: ${command}\n`, stdout);

      if (stderr) {
        console.error(`Error Output for: ${command}\n`, stderr);
      }

      // Proceed to the next page
      deployPage(index + 1);
    });
  }

  // Start deploying from the first page
  deployPage(0);
});

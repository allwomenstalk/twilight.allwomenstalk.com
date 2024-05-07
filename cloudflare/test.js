const puppeteer = require('puppeteer');
const fs = require('fs');
const { parse }= require('csv-parse');
const path = require('path');

(async () => {
    // Read the CSV file
    const csvContent = fs.readFileSync('hosts.csv');

    // Define an async function to parse CSV
    const parseCSV = async (data) => {
        return new Promise((resolve, reject) => {
            parse(data, {
                columns: true,
                skip_empty_lines: true
            }, (err, output) => {
                if (err) reject(err);
                else resolve(output);
            });
        });
    };

    // Use the parse function
    const records = await parseCSV(csvContent);

    // Launch Puppeteer browser
    const browser = await puppeteer.launch();

    // Iterate over each domain from the CSV
    for (const record of records) {
        const url = `http://${record.host}`;
        const page = await browser.newPage();

        try {
            await page.goto(url, { waitUntil: 'networkidle2' });
            const title = await page.title();

            // Save screenshot
            const screenshotPath = path.join(__dirname, `screenshots/${record.host.replace(/\./g, '_')}.png`);
            await page.screenshot({ path: screenshotPath });

            // Log or save the result
            console.log(`Title of ${record.host}: ${title}`);
            console.log(`Screenshot saved: ${screenshotPath}`);
        } catch (error) {
            console.error(`Error accessing ${url}: ${error.message}`);
        }

        await page.close();
    }

    await browser.close();
})();

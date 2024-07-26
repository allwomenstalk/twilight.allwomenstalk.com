const fs = require('fs');
const path = require('path');

const folderPath = './logs'; // Replace with your folder path

// Function to read and process each file
function processFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    
    lines.forEach((line, index) => {
        if (line.startsWith('ERROR:')) {
            console.log(`Error found in file ${filePath} on line ${index + 1}: ${line}`);
        }
        
        if (line.includes('[11ty] Problem writing Eleventy templates: (more in DEBUG output)')) {
            const nextLine = lines[index + 1];
            const fileNameMatch = nextLine.match(/Having trouble writing to "(.*?)"/);
            if (fileNameMatch) {
                const fileName = fileNameMatch[1];
                console.log(`Eleventy error found in file ${filePath} on line ${index + 2}: ${fileName}`);
            }
        }
    });
}

// Function to read all .txt files in the folder
function processFolder(folderPath) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error(`Error reading directory: ${err.message}`);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(folderPath, file);
            if (path.extname(filePath) === '.txt') {
                processFile(filePath);
            }
        });
    });
}

// Run the script
processFolder(folderPath);

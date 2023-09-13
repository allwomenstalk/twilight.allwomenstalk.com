'use strict';

const amphtmlValidator = require('amphtml-validator');
const fs = require('fs');
const glob = require('glob');
const { MongoClient } = require('mongodb');
const path = require('path');

require('dotenv').config();

const fileslist = [];
const errorsarr = [];
const validationReports = [];
const reportTime = new Date().toISOString();

let totalFiles = 0;
let checkedFiles = 0;
let failedFiles = 0;

const getAllFiles = (dirPath, filename, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(file => {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), filename, arrayOfFiles);
        } else if (file === filename) {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });

    return arrayOfFiles;
};

const ampFiles = getAllFiles('_site', 'amp.html');

// console.log(ampFiles);
console.log('Validating ' + ampFiles.length + ' AMP files');
fileslist.push(...ampFiles)

Run();


// glob("_site/**/*.amp.html", {}, (err, files) => {
//     if (err) {
//         console.error('Error occurred while trying to glob:', err);
//         return;
//     }

//     totalFiles = files.length;
//     console.log("Validating " + totalFiles + " AMP files");

//     fileslist.push(...files);
//     Run();
// });


async function Run() {
  const file = fileslist.shift();
  if (file) {
    checkedFiles++;
    await ValidateFile(file);
    process.stdout.write(`Progress: ${checkedFiles}/${totalFiles} (${((checkedFiles / totalFiles) * 100).toFixed(2)}%)`);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    Run();
  } else {
    process.stdout.write("\n");
    console.log("Validation complete:");
    console.log("Checked Files: " + checkedFiles + " / " + totalFiles + " (" + ((checkedFiles / totalFiles) * 100).toFixed(2) + "%)");
    console.log("Failed Files: " + failedFiles);
    console.log([...new Set(errorsarr)]);
    saveReportsToJson();
    // saveReportsToMongoDB();
  }
}

function ValidateFile(file) {
  return new Promise((resolve) => {
    amphtmlValidator.getInstance().then((validator) => {
      const input = fs.readFileSync(file, 'utf8');
      const result = validator.validateString(input);
      const url = file.replace('_site/', 'https://');
      console.log(((result.status === 'PASS') ? '\x1b[36m' : '\x1b[31m'), url, result.status);
      for (let ii = 0; ii < result.errors.length; ii++) {
        const error = result.errors[ii];
        let msg = `line ${error.line}, col ${error.col}: ${error.message}`;
        if (error.specUrl !== null) {
          msg += ` (see ${error.specUrl})`;
        }
        ((error.severity === 'ERROR') ? console.error : console.warn)(url, msg);
      }
      if (result.status !== 'PASS') {
        errorsarr.push(url);
        failedFiles++;
      }
      validationReports.push({
        url: url,
        status: result.status,
        errors: result.errors,
        timestamp: reportTime
      });
      resolve();
    });
  });
}

function saveReportsToJson() {
  const jsonData = JSON.stringify(validationReports);
  fs.writeFileSync('validation_reports.json', jsonData);
  console.log('Validation reports saved to validation_reports.json');
}


async function saveReportsToMongoDB() {
  
  const uri = process.env.MONGODB_URI; // connection string uri
  const dbName = "aws";
  const collectionName = "amp";
  
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  
  try {
    console.log('Saving validation reports to MongoDB');

    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // This option prevents additional documents from being inserted if one fails
    const options = { ordered: true };

    const result = await collection.insertMany(validationReports, options);
    console.log(`${result.insertedCount} documents were inserted`);
  } catch (err) {
    console.error('Error inserting validation reports:', err);
  } finally {
    await client.close();
  }
}

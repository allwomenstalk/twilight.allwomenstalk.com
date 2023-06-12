'use strict';
var amphtmlValidator = require('amphtml-validator');
var fs = require('fs');

const glob = require('glob');
var fileslist = []
var errorsarr = []

glob("_site"+ '/**/amp.html', {}, (err, files)=>{
  console.log("Validating "+files.length+" AMP files")
  fileslist = files
  ValidateFile(fileslist.shift())
})

async function Run() {
  await ValidateFile(fileslist.shift())
  
}

function ValidateFile (file,callback) {
  amphtmlValidator.getInstance().then(function (validator) {
    var input = fs.readFileSync(file, 'utf8');
    var result = validator.validateString(input);
    //((result.status === 'PASS') ? console.log('\x1b[36m%s\x1b[0m') : console.error)(file,result.status);
    console.log(((result.status === 'PASS') ? '\x1b[36m' : '\x1b[31m' ), file,result.status)
    for (var ii = 0; ii < result.errors.length; ii++) {
      var error = result.errors[ii];
      var msg = 'line ' + error.line + ', col ' + error.col + ': ' + error.message;
      if (error.specUrl !== null) {
        msg += ' (see ' + error.specUrl + ')';
      }
      ((error.severity === 'ERROR') ? console.error : console.warn)(file,msg);
    }
    if (result.status != 'PASS') errorsarr.push(file)
    //if (fileslist.length === 0 ) console.log([...new Set(errorsarr)])
    ValidateFile(fileslist.shift())
  });
}
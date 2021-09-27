const fs = require("fs");
const path = require("path");
const http = require("http"); 
const parse = require("querystring");
const { exec } = require("child_process"); 
const execShellCommand = require("./utils/execShellCommand").execShellCommand; 
const { v4: uuidv4 } = require("uuid"); 

const determinePackagesUsed = code => {
  const regex = /require\('\b(\w*\w*)\b'\)/g; 
  const packagesFromCode = [...code.matchAll(regex)];
  let packages = "";
  packagesFromCode.forEach((pkg) => {
    const package = pkg[0].match(/(?:'[^']*'|^[^']*$)/)[0];
    packages += `${package} `; 
  }); 
  return packages;
} 

const removeSingleQuotes = str => str.replace(/['"]+/g, ''); 

module.exports.prepareEnvironment = async function (json, user_dir) {
  return new Promise((resolve, reject) => {
      const packages = determinePackagesUsed(json.code); 
    execShellCommand(`npm install --prefix ${user_dir} ${packages.replace(/['"]+/g, '')} vm2 && echo ATTEMPTED NPM INSTALL `).then((val) => { // tmp/node_modules folder is not created 
      let _requires = []; 
      const packages = determinePackagesUsed(json.code).split(" ");
      packages.forEach((package) => {
        if (package != "") {
          const _require = `const ${removeSingleQuotes(package)} = require(path.join('${user_dir.replace(/\\/g, "/")}', 'node_modules', '${removeSingleQuotes(package)}'));`; 
          _requires.push(_require); 
        } 
      }); 
      let requires = _requires.join(" "); 
      let builtin_modules_requires = ``; 
      json["builtin_modules"].forEach(builtin_module => {
        builtin_modules_requires += `const ${removeSingleQuotes(builtin_module)} = require('${removeSingleQuotes(builtin_module)}'); `; 
      }); 
     let code = `
      ${builtin_modules_requires}
      ${requires}  
      ${json.code}`; 
      fs.writeFileSync(path.join(user_dir, "code.js"), code);
      resolve(val); 
    }); 
  }); 
} 


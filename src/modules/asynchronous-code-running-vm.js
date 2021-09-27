const path = require("path"); 
const fs = require("fs"); 
const { NodeVM } = require("vm2"); 
const execShellCommand = require("./utils/execShellCommand").execShellCommand; 

const runCodeAsync = (json, user_dir) => {
  return new Promise((resolve, reject) => {
    const vm = new NodeVM({
      require: { external: true, builtin: ["fs", "path", "http", "url"] },
      sandbox: { output: "output" } 
    });

    execShellCommand(`cd ${user_dir} && node code.js`).then(commandResult => { 
      if (json == undefined || json == null) {
        fs.readFile(path.join(user_dir, "code.js"), (err, data) => {
          if (err) {
              throw err;
          }
          const code = data;
          vm.run(code + "", "vm.js"); 
          return resolve(vm.sandbox.output.toString()); 
        });
      } else {
        return resolve(" Env ready "); 
      } 
    }); 
  });
};

module.exports.runCode = async function (json, user_dir) {
    return new Promise ((resolve, reject) => {
      return resolve(runCodeAsync(json, user_dir).then((output) => {
        return output; 
    }));
  }); 
};

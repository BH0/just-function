module.exports.execShellCommand = cmd => {
    const exec = require("child_process").exec;
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.warn(error);
        }
       // console.log(" Exec shell command " , cmd); 
        resolve(stdout ? stdout : stderr);
      });
    });
  }
  
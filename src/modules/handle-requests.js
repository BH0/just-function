const RunCode = require("./asynchronous-code-running-vm");
const PrepareEnvironment = require("./prepare-environment");
const { v4: uuidv4 } = require("uuid"); 
const path = require("path");
const url = require("url");

const getReqData = (req) => {
  return new Promise((resolve, reject) => {
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        resolve(body);
      });
    } catch (error) {
      reject(error);
    }
  });
} 

const send = (res, data) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    'Access-Control-Max-Age': 2592000, // 30 days
    "Content-Type": "application/json" 
  };
  res.writeHead(200, headers);
  res.end(JSON.stringify({data: data})); 
} 

const getSearchParam = (url, _key) => {
  const usp = new URLSearchParams(url); 
  for (const [key, value] of usp) {
    let actualKey = key.substring(key.indexOf("?"), key.length).replace("?", ""); // the first key seems to be include the route instead of just the param 
    if (actualKey == _key) {
      return value; 
    } 
    if (key == _key) {
      return value; 
    }
  }      
 } 

module.exports.handleRequests = async function (req, res) {
  if (req.method == "GET" && req.url == "/test") {
    res.end("I AM ALIVE");
  }
  if (req.method == "POST" && req.url == "/just-function/prepare") {
    const reqData = await getReqData(req);
    const json = await JSON.parse(reqData);
    const uuid = uuidv4().replace(/\d+/g, ""); 
    const user_dir =  path.join(__dirname.replace(path.join("src", "modules"), ""), `tmp-${uuid}`);
    console.log("USER DIR ", user_dir); 
    PrepareEnvironment.prepareEnvironment(json, user_dir).then(preparedEnvironmentResult => {
      send(res, uuid); 
    }); 
  } 
  if (req.method == "GET" && req.url.includes("/just-function/run")) { // expect /just-function/run?uuid=<uuid> 
    const uuid = getSearchParam(req.url, "uuid"); 
    const user_dir =  path.join(__dirname.replace(path.join("src", "modules"), ""), `tmp-${uuid}`);
    RunCode.runCode(null, user_dir).then(output => {
      send(res, output); 
    });  
  } 
} 

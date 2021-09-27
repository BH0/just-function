const HandleRequests = require("./modules/handle-requests.js");
const http = require("http");
http
  .createServer((req, res) => HandleRequests.handleRequests(req, res))
  .listen(8080);

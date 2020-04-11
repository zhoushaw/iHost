let http = require('http');

var part = '7777';
var server = http.createServer();


server.on("request", (req, res)=>{
    debugger
    console.log(req.url)
});
server.listen(part);

console.log(`端口${part}监听成功`);

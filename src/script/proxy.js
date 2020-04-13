const http = require("http");
const net = require("net");
const url = require("url");
const dns = require("dns");
const doDns = require('./getIp');

class EasyProxy{
    constructor(options){
        this.port = options.port || 9393;
        this.onServerError = options.onServerError || function() {};
        this.onBeforeRequest = options.onBeforeRequest || function() {};
        this.onBeforeResonse = options.onBeforeResonse || function() {};
        this.onRequestError = options.onRequestError || function() {};
    }

    start () {
        let server = http.createServer();
    
        server.on("request", this.requestHandler);
        server.on("connect", this.connectHandler);
    
        server.on("error", this.onServerError);
        server.on("beforeRequest", this.onBeforeRequest);
        server.on("beforeResonse", this.onBeforeResonse);
        server.on("requestError", this.onRequestError);
    
        server.listen(this.port);
        console.log(`server is run on ${this.port} part`);
    }
    
    requestHandler (req, res) {
        try {
            var path = req.headers.path || url.parse(req.url).path;
            var requestOptions = {
                host: req.headers.host.split(':')[0],
                port: req.headers.host.split(':')[1] || 80,
                path: path,
                method: req.method,
                headers: req.headers
            };
    
            //check url
            if (requestOptions.host == "127.0.0.1" && requestOptions.port == port) {
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                res.write("ok");
                res.end();
                return;
            }
    
            this.emit("beforeRequest", requestOptions);
            if ( requestOptions.needDnsResolve ) {
                console.log(requestOptions.host + ":" + requestOptions.port + "需要dns解析");
                console.log('be here');
                doDns(requestOptions.host).then((id)=>{
                    requestRemote( requestOptions, req, res, this);
                }).catch(err=>{
                    console.log('dns resolve' + err);
                })
            }
            else {
                requestRemote( requestOptions, req, res, this);
            }
    
    
        } catch (e) {
            console.log("requestHandlerError" + e.message);
        }
        function requestRemote(requestOptions, req, res, proxy) {
            var remoteRequest = http.request(requestOptions, function(remoteResponse) {
                remoteResponse.headers['proxy-agent'] = 'NW Proxy 1.0';
                // write out headers to handle redirects
                res.writeHead(remoteResponse.statusCode, '', remoteResponse.headers);
                proxy.emit("beforeReponse", remoteResponse);
    
                if (remoteResponse.statusCode == 304 && remoteResponse.headers['content-length']) { //fix ng 返回304还带content-length的bug
                    res.end();
                    remoteRequest.end();
                    return;
                }
                remoteResponse.pipe(res);
                // Res could not write, but it could close connection
                // res.pipe(remoteResponse);
            });
    
            remoteRequest.on('error', function(e) {
                proxy.emit("requestError", e, req, res);
    
                res.writeHead(502, 'Proxy fetch failed');
            });
    
            req.pipe(remoteRequest);
    
            // Just in case if socket will be shutdown before http.request will connect
            // to the server.
            res.on('close', function() {
                remoteRequest.abort();
            });
        }
    }
    
    connectHandler (req, socket, head) {
        try {
            let requestOptions = {
                host: req.url.split(':')[0],
                port: req.url.split(':')[1] || 443
            };
    
            this.emit("beforeRequest", requestOptions);
    
            if (requestOptions.needDnsResolve) {
                console.log(requestOptions.host + ":" + requestOptions.port + "需要dns解析");
                doDns(requestOptions.host).then((id)=>{
                    console.log(id);
                    requestOptions.host = id;
                    connectRemote( requestOptions, socket);
                }).catch(err=>{
                    console.log('dns resolve' + err);
                });
            }
            else {
                connectRemote( requestOptions, socket);
            }
            
            function _synReply(socket, code, reason, headers, cb) {
                try {
                    let statusLine = 'HTTP/1.1 ' + code + ' ' + reason + '\r\n';
                    let headerLines = '';
                    for (key in headers) {
                        headerLines += key + ': ' + headers[key] + '\r\n';
                    }
                    socket.write(statusLine + headerLines + '\r\n', 'UTF-8', cb);
                } catch (error) {
                    cb.call();
                }
            }

            function connectRemote({ port,host }, socket) {
                let pSock = net.connect(port, host, function() {
                    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
                    pSock.pipe(socket);
                }).on('error', function(e) {
                    socket.end();
                });
            
                socket.pipe(pSock);
            }

        } catch (e) {
            console.log("connectHandler error: " + e.message);
        }
    }
}

export default EasyProxy;
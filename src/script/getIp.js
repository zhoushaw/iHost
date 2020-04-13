var exec = require("child_process").exec;

let _dnsCache = {
    length: 0
};


let getIP = (host)=>{
    let resultIp;
    return new Promise((resolve,reject)=>{
        exec(`host ${host}`,(err,stdout)=>{
            if (err) reject(err);
    
            let line = stdout.split('\n');
            for(var text of line) {
                let reg = /(\d+\.){3}\d+/;
                if (reg.test(text)) {
                    resultIp = reg.exec(text);
                    resolve(resultIp[0]);
                    break;
                }
            }
            reject("can't find ip");          
        });
    })
}

let doDns = async (host)=>{
    return new Promise(async (resolve,reject)=>{
        let finalIp;
        // 没有缓存dns
        if (!_dnsCache[host]) {
            try {
                finalIp = await getIP(host);
                if(_dnsCache.length>=100) _dnsCache = {length: 0};
                _dnsCache[host] = finalIp;
            } catch(err) {
                reject(err);
            }
        } else {
            finalIp = _dnsCache[host];
        }
        resolve(finalIp);
    });
}

module.exports = doDns;

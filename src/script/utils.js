
// import { MessageBox, Message } from 'element-ui';
import { exec } from 'child_process';
import { port } from './proxy.js';
import { whoami, pathMap } from './config.js';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');


export let aesEncrypt = function (data, key) { // 加密
    const cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};

export let aesDecrypt = function (encrypted, key) { // 解密
    const decipher = crypto.createDecipher('aes192', key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};



// 改变owner
let haveSudoPower = function(password, owner) {
    return new Promise((resolve)=>{
        try {
            exec(`echo ${password}|sudo -S chown ${owner || whoami} /etc/hosts`, (err)=>{
                let havaPower = err?false:true;
                resolve(havaPower);
            });
        }catch(err){
            resolve(false);
        }
    });
};

// 写配置文件
export let writeConfigFile = function(key, val) {
    let configString = fs.readFileSync(`${pathMap.config}`, 'utf8');
    let config = configString ? JSON.parse(configString) : {};

    if (key === 'password') {
        config[key] = aesEncrypt(val, 'ihost')
    } else {
        config[key] = val;
    }
    fs.writeFileSync(`${pathMap.config}`, JSON.stringify(config), 'utf8');
}


// 读取配置文件
export let readConfigFile = function(key) {
    let configString = fs.readFileSync(`${pathMap.config}`, 'utf8');
    let config = configString ? JSON.parse(configString) : {};
    
    if (key === 'password') {
        return config[key] ? aesDecrypt(config[key], 'ihost') : '';
    } else {
        return config[key] || '';
    }
}

export let GetSudoPassword = (password,showUi)=>{
    return new Promise((resolve,reject)=>{
        async function checkPS (password){
            password = password || readConfigFile('password');
            let power = await haveSudoPower(password)
            if (power) {
                writeConfigFile('password',password);
                resolve(password);
            } else if(showUi) {
                let element = import('element-ui');
                element.Message({ message: '您的密码已失效' });
                element.MessageBox.prompt('请输入开机密码', '', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputType: 'password'
                }).then(async ({ value }) => {
                    GetSudoPassword(value);
                });
            }
        }
        try {
            checkPS(password);
        }catch(err){
            reject(err);
        }
    });
}

function _getNetWorkService(password) {
    var shPath =  path.resolve(__dirname, 'tools/findMacService.sh');
    return new Promise(function(resolve, reject) {
         exec(shPath, function(err, stdout) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    password: password,
                    service: stdout
                });
            }
        })
    });
}

// 开启关闭代理
function _changeProxy(data,status = true) {
    let stdout = data.service;
    let password = data.password;
    return new Promise(function(resolve, reject) {
        stdout = stdout.split('\n')[0];
        let serviceList = stdout.split(',');
        let enableCommand = '', disableCommand = '';
        serviceList.forEach(function(item) {
            if (item) {
                enableCommand += `networksetup -setwebproxy '${item}' 127.0.0.1 ${port}; networksetup -setsecurewebproxy '${item}' 127.0.0.1 ${port};networksetup -setwebproxystate '${item}' on;networksetup -setsecurewebproxystate '${item}' on;`;
                disableCommand += `networksetup -setwebproxystate '${item}' off;networksetup -setsecurewebproxystate '${item}' off;`;
            }
        });
        enableCommand = `echo ${password}|sudo -u ${whoami} ${enableCommand}`;
        disableCommand = `echo ${password}|sudo -u ${whoami} ${disableCommand}`;

        exec(status? enableCommand : disableCommand, function(err, stdout, stderr) {
            if (err) {
                reject(err);
                return;
            } 
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve(stdout);
        });
    })
}

// 在渲染进程中不显示弹出输入密码框，否则反之
export let setSystemProxy = (cb,status,showUi = true)=>{
    return GetSudoPassword('',showUi)
        .then(_getNetWorkService)
        .then((data)=>_changeProxy(data,status))
        .then(function(stdout) {
            cb(null, stdout);
        }).catch(function(e) {
            cb(e);
        });
}

// 创建文件或文件夹
export function createDirOrFile(pt,isFile = true){
    // 目标文件或文件夹存在
    if (fs.existsSync(pt)){
        return;
    }

    let nPt = pt.split(path.sep);
    let endIndex = isFile?-1:nPt.length;
    let folders = nPt.slice(0,endIndex);
    let p = '';
    
    while(folders.length>0) {
        p += folders.shift() + path.sep;
        if (!fs.existsSync(p)){
            fs.mkdirSync(p);
        }
    }
    if (isFile) fs.createWriteStream(pt);
    return true
}

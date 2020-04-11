import fs from 'fs';
import { execSync, exec, spawn, execFileSync } from 'child_process';
import path from 'path';
import './proxy.js';

const {remote} = require('electron');
let configDir = remote.app.getPath('userData');


let localFiles = [];
let iHostPathE = path.resolve(configDir,'ihost');
let iHostPathN = iHostPathE.replace(/\s/g,'\\ ');

const pathMap = {
    host: {
        new:  iHostPathN,
        exist: iHostPathE
    },
    local: {
        new: path.join(iHostPathN,'local'),
        exist: path.join(iHostPathE,'local')
    } ,
    localOg: {
        new: path.join(iHostPathN,'local','origin'),
        exist: path.join(iHostPathE,'local','origin'),
    }, // 系统host
    remote: {
        new: path.join(iHostPathN,'remote'),
        exist:  path.join(iHostPathE,'remote'),
    },
    remoteDev: {
        new: path.join(iHostPathN,'remote','dev'),
        exist:  path.join(iHostPathE,'remote','dev'),
    },
    remotePre: {
        new: path.join(iHostPathN,'remote','pre'),
        exist:  path.join(iHostPathE,'remote','pre'),
    }
};


let initFile = ()=>{
    // 若不存在创建目录、文件夹、文件
    !fs.existsSync(pathMap.host.exist) && execSync(`mkdir ${pathMap.host.new}`);
    !fs.existsSync(pathMap.remote.exist) && execSync(`mkdir ${pathMap.remote.new}`);
    !fs.existsSync(pathMap.remoteDev.exist) && execSync(`touch ${pathMap.remoteDev.new}`);
    !fs.existsSync(pathMap.remotePre.exist) && execSync(`touch ${pathMap.remotePre.new}`);
    // 复制系统host
    if (!fs.existsSync(pathMap.local.exist)) {
        execSync(`mkdir ${pathMap.local.new}`);
        execSync(`cp /etc/hosts ${pathMap.localOg.new}`);
    }
    
    let localFilesArr = execSync(`ls ${pathMap.local.new}`, 'utf8').toString().split('\n');

    localFilesArr = localFilesArr.forEach(function(item) {
        if (item) {
           localFiles.push({ title: item, isEdit: false, isUse: false });
        }
    });
}

initFile();


// 读取文件
let readFile = function(type, name) {
    return fs.readFileSync(`${pathMap[type].exist}/${name}`, 'utf8');
}

let readConfigFile = function(key) {
    let configString = fs.readFileSync(`${pathMap.config.exist}`, 'utf8');
    let config = configString ? JSON.parse(configString) : {};

    if (key === 'password') {
        return config[key] ? aesDecrypt(config[key], 'meili-host-pwd') : '';
    } else {
        return config[key] || '';
    }
}

let password = 'sushi';
const whoami = execSync(`whoami`).toString().trim();
let hostPath = '/etc/hosts';

// 改变owner
let changeOwner = function(password, owner, cb) {
    exec(`echo ${password}|sudo -S chown ${owner} /etc/hosts`, cb)
};

let redhost = function(){
    return fs.readFileSync(`/etc/hosts`, 'utf8');
}

let writeHost = function(data){
    changeOwner(password,whoami,(err, stdout, stderr)=>{
        fs.writeFileSync(hostPath, data.toString(), 'utf8');
    })
}

export {
    localFiles,
    readFile,
    redhost,
    writeHost
}
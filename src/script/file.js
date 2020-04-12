import fs from 'fs';
import { execSync, exec, spawn, execFileSync } from 'child_process';
import path from 'path';
import { createDirOrFile } from './utils.js';
import './proxy.js';

const {remote} = require('electron');
let configDir = remote.app.getPath('userData');


let localFiles = [];
let configPath = path.resolve(configDir,'ihost');

const pathMap = {
    host: configPath,
    local: path.join(configPath,'local'),
    localOg: path.join(configPath,'local','System'), // 系统host
    remote: path.join(configPath,'remote'),
    remoteDev: path.join(configPath,'remote','dev'),
    remotePre: path.join(configPath,'remote','pre')
};


let initFile = ()=>{
    // 若不存在创建目录、文件夹、文件
    createDirOrFile(pathMap.localOg);
    createDirOrFile(pathMap.remoteDev);
    createDirOrFile(pathMap.remotePre);
    execSync(`cp /etc/hosts '${pathMap.localOg}'`);
    
    let localFilesArr = execSync(`ls '${pathMap.local}'`, 'utf8').toString().split('\n');
    
    localFilesArr = localFilesArr.forEach(function(item) {
        if (item!=='System' && item) {
           localFiles.push({ title: item, isEdit: false, isActive: false });
        }
    });
}

initFile();


// 读取文件
let readFile = function(type = 'local', name) {
    console.log(`${pathMap[type]}/${name}`);
    
    return fs.readFileSync(`${pathMap[type]}/${name}`, 'utf8');
}

let readConfigFile = function(key) {
    let configString = fs.readFileSync(`${pathMap.config}`, 'utf8');
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
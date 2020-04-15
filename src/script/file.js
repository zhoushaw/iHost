import fs from 'fs';
import { execSync, exec, spawn, execFileSync } from 'child_process';
import path from 'path';
import { createDirOrFile, aesDecrypt, aesEncrypt } from './utils.js';
const child_process = require('child_process');

const {remote} = require('electron');
let configDir = remote.app.getPath('userData');


let configPath = path.resolve(configDir,'ihost');
const whoami = execSync(`whoami`).toString().trim();

const pathMap = {
    host: configPath,
    config: path.join(configPath,'config.json'),
    local: path.join(configPath,'local'),
    localOg: path.join(configPath,'local','System'), // 系统host
    remote: path.join(configPath,'remote'),
    remoteDev: path.join(configPath,'remote','dev'),
    remotePre: path.join(configPath,'remote','pre')
};

let initFile = ()=>{
    // 若不存在创建目录、文件夹、文件
    createDirOrFile(pathMap.config);
    createDirOrFile(pathMap.localOg);
    createDirOrFile(pathMap.remoteDev);
    createDirOrFile(pathMap.remotePre);
    execSync(`cp /etc/hosts '${pathMap.localOg}'`);
}

initFile();

let getLocalFileList = ()=>{
    let localFiles = [];
    let localFilesArr = execSync(`ls -t '${pathMap.local}'`, 'utf8').toString().split('\n');
    
    localFilesArr = localFilesArr.forEach(function(item) {
        if (item!=='System' && item) {
           localFiles.push({ title: item, isEdit: false, isActive: false, isCreating: false });
        }
    });
    return localFiles.reverse();
}


// 读取文件
let readFile = function(type = 'local', name) {
    return fs.readFileSync(`${pathMap[type]}/${name}`, 'utf8');
}


// 读取配置文件
let readConfigFile = function(key) {
    let configString = fs.readFileSync(`${pathMap.config}`, 'utf8');
    let config = configString ? JSON.parse(configString) : {};
    
    if (key === 'password') {
        return config[key] ? aesDecrypt(config[key], 'ihost') : '';
    } else {
        return config[key] || '';
    }
}

// 写配置文件
let writeConfigFile = function(key, val) {
    let configString = fs.readFileSync(`${pathMap.config}`, 'utf8');
    let config = configString ? JSON.parse(configString) : {};

    if (key === 'password') {
        config[key] = aesEncrypt(val, 'ihost')
    } else {
        config[key] = val;
    }
    fs.writeFileSync(`${pathMap.config}`, JSON.stringify(config), 'utf8');
}


// 改变owner
let haveSudoPower = function(password, owner) {
    return new Promise((resolve)=>{
        try {
            exec(`echo ${password}|sudo -S chown ${owner || whoami} /etc/hosts`, (err)=>{
                console.log(err)
                let havaPower = err?false:true;
                resolve(havaPower);
            });
        }catch(err){
            resolve(false);
        }
    });
};

let redhost = function(){
    return fs.readFileSync(`/etc/hosts`, 'utf8');
}

let writeHost = function(data){
    changeOwner(password,whoami,(err, stdout, stderr)=>{
        fs.writeFileSync(hostPath, data.toString(), 'utf8');
    })
}

let ctFile = function(name){
    return createDirOrFile(`${pathMap.local}/${name}`);
}

let reNameFile = function(nPath,oldPath){
    exec(`mv '${pathMap.local}/${oldPath}' '${pathMap.local}/${nPath}'`)
}

let dlFile = (path)=>{
    return fs.unlinkSync(`${pathMap.local}/${path}`)
}

let wtFile = (path,data)=>{
    return fs.writeFileSync(`${pathMap.local}/${path}`, data.toString(), 'utf8');
}

export {
    readFile,
    redhost,
    writeHost,
    ctFile,
    dlFile,
    wtFile,
    reNameFile,
    getLocalFileList,
    writeConfigFile,
    readConfigFile,
    haveSudoPower
};


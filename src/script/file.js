import fs from 'fs';
import { execSync, exec } from 'child_process';
import { createDirOrFile, aesDecrypt, aesEncrypt } from './utils.js';
import { whoami, pathMap } from './config.js';

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




let redhost = function(){
    return fs.readFileSync(`/etc/hosts`, 'utf8');
}

// 写系统host
let writeHost = function(host) {
    let hostPath = '/etc/hosts';
    fs.writeFileSync(hostPath, host, 'utf8');
};

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
    whoami,
    readFile,
    redhost,
    writeHost,
    ctFile,
    dlFile,
    wtFile,
    reNameFile,
    getLocalFileList
};


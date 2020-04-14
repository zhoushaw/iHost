import {haveSudoPower,writeConfigFile,readConfigFile} from './file';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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



// 若传入密码，判断密码是否有sudo权限，若有权限写入config中
// 若没传密码判断config中密码是否任有sudo权限，没有提示重试
export let JudgeSudo = function (passwrod){
    return new Promise((resolve,reject)=>{
        if (passwrod) {
            haveSudoPower(passwrod).then(()=>{
                writeConfigFile('password',passwrod);
                resolve(true);
            }).catch((err)=>{
                reject({
                    errMsg: err,
                    reTry: true,
                    msg: '您输入的密码不正确'
                });
            });
        } else {
            let getPs = readConfigFile('password');
            haveSudoPower(getPs).then(()=>{
                resolve(true);
            }).catch((err)=>{
                reject({
                    errMsg: err,
                    reTry: true,
                    msg: getPs===''?'请输入密码':'您的密码已过期请重新授权'
                });
            });
        }
    });
}

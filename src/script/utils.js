
import {haveSudoPower,writeConfigFile,readConfigFile} from './file';
import { MessageBox, Message } from 'element-ui';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

export let GetSudoPassword = ()=>{
    return new Promise((resolve,reject)=>{
        async function checkPS (password){
            password = password || readConfigFile('password');
            let power = await haveSudoPower(password)
            console.log(power)
            if (power) {
                writeConfigFile('password',password);
                resolve(password);
            } else {
                MessageBox.prompt('请输入开机密码', '', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputType: 'password'
                }).then(async ({ password }) => {
                    GetSudoPassword(password);
                })
            }
        }
        try {
            checkPS();
        }catch(err){
            reject(err);
        }
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


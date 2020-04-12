const fs = require('fs');
const path = require('path');
console.log()

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
        console.log(p);
        if (!fs.existsSync(p)){
            fs.mkdirSync(p);
        }
    }
    if (isFile) fs.createWriteStream(pt);
    return true
}

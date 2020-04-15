

const { execSync } = require('child_process');
const { remote , app } = require('electron');
const path = require('path');
let configDir = remote? remote.app.getPath('userData'): app.getPath('userData');

let configPath = path.resolve(configDir,'ihost');
export const whoami = execSync(`whoami`).toString().trim();

export const pathMap = {
    host: configPath,
    config: path.join(configPath,'config.json'),
    local: path.join(configPath,'local'),
    localOg: path.join(configPath,'local','System'), // 系统host
    remote: path.join(configPath,'remote'),
    remoteDev: path.join(configPath,'remote','dev'),
    remotePre: path.join(configPath,'remote','pre')
};
import { app, BrowserWindow, Tray, ipcMain } from 'electron'
import { EasyProxy } from '../script/proxy.js';
import { setSystemProxy } from '../script/utils.js';
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`;
let canClose = false;

function createWindow () {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 500,
        useContentSize: true,
        width: 800
    })
    
    mainWindow.loadURL(winURL)

    createAgentSever();

    mainWindow.on('closed', () => {
        console.log('即将关闭')
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

app.on('before-quit',async (event)=>{
    if (!canClose)  event.preventDefault();
    setSystemProxy(()=>{
        canClose = true;
        app.quit();
    }, false, false)
})

function createAgentSever(){
    // 代理服务器
    let hostJson = {};

    ipcMain.on('change-host-json', (event, arg) => {
        hostJson = arg // prints "ping"
        event.returnValue = 'pong'
    });

    new EasyProxy({
        onBeforeRequest: (req)=> {
            let host = hostJson[req.host]
            console.log(`经过 ${req.host}`,hostJson[req.host]);
            
            if (host) {
                console.log(`log", ${req.host} + 被代理到： ${host}`);
                req.needDnsResolve = true;
                req.host = host;
            }
        },
        onServerError: function(e) {
            console.log("error", "serverError" + e.message);
        },
        onRequestError: function(e) {
            console.log(e.message);
        }
    }).start();
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

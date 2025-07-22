const {BrowserWindow,desktopCapturer, session} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')

let win 

function create() {
    win = new BrowserWindow({
        minHeight: 600,
        minWidth: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),  // 使用绝对路径
            webSecurity: false,
            contextIsolation: true,
            nodeIntegration: true,
        }
    })

    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
            callback({ video: sources[0], audio: 'loopback' })
        })
    })

    if (isDev) {
        win.loadURL("http://localhost:5173/")
        // win.webContents.openDevTools()
    } else {
        // win.loadFile(path.resolve(__dirname,'../renderer/pages/main/index.html'))
    }
}

function send(channel,...args) {
    win.webContents.send(channel,...args)
}

module.exports = {
    create,
    send
}
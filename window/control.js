const {BrowserWindow,desktopCapturer, session} = require('electron')
const path = require('path')

let win 
let closeCallback = null

function create() {
    win = new BrowserWindow({
        width: 1000,
        height: 680,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),  // 使用绝对路径
            contextIsolation: true,
            nodeIntegration: false,
        }
    })

    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
            callback({ video: sources[0], audio: 'loopback' })
        })
    })

    if (closeCallback) {
        win.on('close', closeCallback)
    }
    win.loadFile(path.resolve(__dirname,'control.html'))
    win.webContents.openDevTools()
}

function close() {
    if (win) {
        win.close()
        win = null
    }
}
function onclose(callback) {
    closeCallback = callback
}

function send(channel,...args){
    win.webContents.send(channel,...args)
}

module.exports = {
    create,
    send,
    close,
    onclose
}
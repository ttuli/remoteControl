const {app} = require('electron')
const {create:createMainWindow} = require('./window/main.js')

app.whenReady().then(()=>{
    createMainWindow()
    require('./control/ipc.js')()
})
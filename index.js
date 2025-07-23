const {app} = require('electron')
// const {create:createMainWindow} = require('./window/main.js')
const {create:createMainWindow} = require('./window/control.js')

app.whenReady().then(()=>{
    createMainWindow()
    require('./control/ipc.js')()
})
const { ipcMain } =require('electron')
const {send:sendMainWindow} = require('../window/main.js')
const {create:createControl , send:sendControlWindow} = require('../window/control.js')
const signal = require('./signal.js')

module.exports = function() {
    ipcMain.handle('login', async() => {
        let code = await signal.invoke('login',null,'logined')
        return code
    })
    ipcMain.on('control',async(e,remoteCode) => {
        signal.send('control',{remoteCode})
    })
    signal.addEventListener('controlled', (e) => {
        sendMainWindow('control-state-change',e.detail,1)
        createControl()
    })
    signal.addEventListener('be-controlled', (e) => {
        sendMainWindow('control-state-change',e.detail,2)
    })

    ipcMain.on('forward', (e, event,data) => {
        signal.send('forward', { event, data })
    })
    signal.addEventListener('offer',(e) => {
        sendMainWindow('offer', e.detail)
    })
    signal.addEventListener('answer',(e) => {
        sendControlWindow('answer', e.detail)
    })
    signal.addEventListener('puppet-candidate',(e) => {
        sendControlWindow('candidate', e.detail)
    })
    signal.addEventListener('control-candidate',(e) => {
        sendMainWindow('candidate', e.detail)
    })
}
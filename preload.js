const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel,...args) => {
        ipcRenderer.send(channel,...args)
    },
    ipcOn: (channel, callback) => ipcRenderer.on(channel, callback),
    ipcInvoke: (...args) => ipcRenderer.invoke(...args),
    removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener),
})
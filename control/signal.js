const WebSocket = require('ws')
const signal = new EventTarget()

const ws = new WebSocket('ws://127.0.0.1:8010')

ws.on('open', () => {
    console.log('connect success')
})

ws.on('message', function (message) {
    try {
        const data = JSON.parse(message)
        signal.dispatchEvent(new CustomEvent(data.event, { detail: data.data }));
    } catch(e) {
        console.log('parse error', e)
    }
})

function send(event, data) {
    ws.send(JSON.stringify({event, data}))
}

function invoke(event, data, answerEvent) {
    return new Promise((resolve, reject) => {
        send(event, data)
        signal.addEventListener(answerEvent,(e) => {
            resolve(e.detail)
        },{once: true})
        setTimeout(() => {
            reject('timeout')
        }, 5000)
    })
}

signal.send = send
signal.invoke = invoke
module.exports = signal
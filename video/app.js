
let video = document.getElementById('screen-video')
let preClientX = -1
let preClientY = -1

window.onkeydown = function(event) {
    let data = {
        keyCode: event.keyCode,
        shift: event.shiftKey,
        meta: event.metaKey,
        control: event.ctrlKey,
        alt: event.altKey
    }
    window.electronAPI.send('robot', 'key', data);
}

function handleMouseEvent(event) {
    let data = {}
    data.clientX = event.clientX
    data.clientY = event.clientY
    data.screen = {
        width: window.screen.width * window.devicePixelRatio,
        height: window.screen.height * window.devicePixelRatio
    }
    data.video = {
        width: video.getBoundingClientRect().width,
        height: video.getBoundingClientRect().height
    }
    data.type = 'null';
    data.button = 'null';
    
    if (event.type === 'click') {
        data.type = 'click'
    } else if (event.type === 'dblclick') {
        data.type = 'doubleclick'
    } else if (event.type === 'mousedown') {
        data.type = 'mousedown';
        if (event.button === 2) {
            data.button = 'right';
        } else if (event.button === 1) {
            data.button = 'middle';
        } else {
            data.button = 'left';
        }
    } else if (event.type === 'mouseup') {
        data.type = 'mouseup';
        if (event.button === 2) {
            data.button = 'right';
        } else if (event.button === 1) {
            data.button = 'middle';
        } else {
            data.button = 'left';
        }
    } else if (event.type === 'wheel') {
        data.type = 'scroll'
        data.deltaX = event.deltaX
        data.deltaY = event.deltaY
    }
    
    window.electronAPI.send('robot', 'mouse', data);
}

// window.onmousedown = handleMouseEvent;
window.onmouseup = handleMouseEvent;
window.onclick = handleMouseEvent;
window.ondblclick = handleMouseEvent;
// window.onwheel = handleMouseEvent;

const pc = new window.RTCPeerConnection({})

async function createOffer() {
    const offer = await pc.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: true
    })
    await pc.setLocalDescription(offer)
    return pc.localDescription
}
createOffer().then((offer) => {
    window.electronAPI.send('forward', 'offer', {type: offer.type, sdp: offer.sdp})
})

pc.onicecandidate = function (e) {
    if (e.candidate) {
        window.electronAPI.send('forward','control-candidate',e.candidate)
    }
}

async function setRemote(answer) {
    await pc.setRemoteDescription(answer)
}
window.electronAPI.ipcOn('answer', (e, answer) => {
    setRemote(answer)
})
pc.onaddstream = function(e) {
    video.srcObject = e.stream;
    video.onloadedmetadata = function() {
        video.play()
    }
}

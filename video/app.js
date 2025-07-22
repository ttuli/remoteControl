
let video = document.getElementById('screen-video')
let preClientX = -1
let preClientY = -1


window.onkeydown = function(event) {
    let type = 'key'
    let data = {
        keyCode: event.keyCode,
        shift: event.shiftKey,
        meta: event.metaKey,
        control: event.ctrlKey,
        alt: event.altKey
    }
    dc.send(JSON.stringify({type,data}))
}

let clickTimeout = null;
let clickCount = 0;
const CLICK_DELAY = 200; // 毫秒

function handleMouseEvent(event) {
    const data = {
        clientX: event.clientX,
        clientY: event.clientY,
        video: {
            width: video.getBoundingClientRect().width,
            height: video.getBoundingClientRect().height
        },
        type: null,
        button: null
    };
    
    const type = 'mouse';
    
    // 处理滚轮事件
    if (event.type === 'wheel') {
        data.type = 'scroll';
        data.deltaX = event.deltaX;
        data.deltaY = event.deltaY;
        sendData(type, data);
        return;
    }
    
    if (event.type === 'click') {
        clickCount++;
        
        if (clickCount === 1) {
            // 设置延时检查是否是单击
            clickTimeout = setTimeout(() => {
                data.type = 'click';
                sendData(type, data);
                clickCount = 0;
            }, CLICK_DELAY);
        }
        return;
    }
    
    if (event.type === 'dblclick') {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
        }
        
        clickCount = 0;
        data.type = 'doubleclick';
        sendData(type, data);
        return;
    }
}
function getMouseButton(buttonCode) {
    switch (buttonCode) {
        case 0: return 'left';
        case 1: return 'middle';
        case 2: return 'right';
        default: return 'left';
    }
}
function sendData(type, data) {
    console.log(`Event type: ${data.type}`);
    console.dir(data);
    dc.send(JSON.stringify({type, data}));
}
window.onclick = handleMouseEvent;
window.ondblclick = handleMouseEvent;
window.onwheel = handleMouseEvent;

const pc = new window.RTCPeerConnection({})
const dc = pc.createDataChannel('robotchannel',{reliable: false})//reliable:false:允许一定丢失


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
        const candidateData = JSON.parse(JSON.stringify(e.candidate));
        window.electronAPI.send('forward','control-candidate',candidateData)
    }
}

async function setRemote(answer) {
    await pc.setRemoteDescription(answer)
}
window.electronAPI.ipcOn('answer', (e, answer) => {
    setRemote(answer)
})
pc.ontrack = function(e) {
    if (e.streams && e.streams[0]) {
        play(e.streams[0]);
    } else {
        const stream = new MediaStream([e.track]);
        play(stream);
    }
}

window.electronAPI.ipcOn('puppet-candidate',(e, candidate) => {
    addIceCandidate(candidate)
})
let candidates = []
async function addIceCandidate(candidate) {
    if (candidate) {
        candidates.push(candidate)
    } else {
        alert('没有候选者')
        return
    }
    if (pc.remoteDescription && pc.remoteDescription.type) {
        for (let i = 0; i < candidates.length; i++) {
            await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
        }
        candidates = []
    }
}

function play (stream) {
    console.log(stream);
    video.srcObject = stream
    video.onloadedmetadata = () => {
        video.play()
    }
}

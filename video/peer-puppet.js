import {handleMouse,handleKey} from '../control/robotjs'

async function getScreenStream() {
    return navigator.mediaDevices.getDisplayMedia({
        video: {
            width: window.screen.width,
            height: window.screen.height,
            frameRate: { ideal: 40 },
        },
        audio: false
    });
}

const pc = new window.RTCPeerConnection({})
pc.ondatachannel = (e) => {
    e.channel.onmessage = (e) => {
        let {type,data} = JSON.parse(e.data)
        if (type==='mouse') {
            handleMouse(data)
        } else if (type==='key') {
            handleKey(data)
        }
    }
}
pc.onicecandidate = function (e) {
    if (e.candidate) {
        const candidateData = JSON.parse(JSON.stringify(e.candidate));
        window.electronAPI.send('forward','puppet-candidate',candidateData)
    } else {
        // alert('not exec onicecandidate')
    }
}
window.electronAPI.ipcOn('control-candidate',(e, candidate) => {
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


async function createAnswer(offer) {
    let screenStream = await getScreenStream();
    
    screenStream.getTracks().forEach(track => {
        pc.addTrack(track, screenStream);
    });

    await pc.setRemoteDescription(offer);
    await pc.setLocalDescription(await pc.createAnswer());
    return pc.localDescription;
}
window.electronAPI.ipcOn('offer', async (event, offer) => {
    try {
        const answer = await createAnswer(offer);
        window.electronAPI.send('forward','answer', {type: answer.type, sdp: answer.sdp});
    } catch (error) {
        alert('创建答案失败:'+error.toString());
    }
});

export default {
    
}
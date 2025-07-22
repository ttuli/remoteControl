const pc = new window.RTCPeerConnection({})

async function getScreenStream() {
    return new Promise((resolve, reject) => {
        try {
            const stream = navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: window.screen.width },
                    height: { ideal: window.screen.height },
                    frameRate: { ideal: 30 }
                },
                audio: false // 可以同时捕获系统音频
            });
            resolve(stream);
        } catch (err) {
            console.error('获取屏幕流失败:', err);
        }
    });
}

pc.onicecandidate = function (e) {
    if (e.candidate) {
        window.electronAPI.send('forward','puppet-candidate',e.candidate)
    } else {
        // alert('not exec onicecandidate')
    }
}
window.electronAPI.ipcOn('candidate',(e, candidate) => {
    addIceCandidate(candidate)
})
let candidates = []
async function addIceCandidate(candidate) {
    if (candidate) {
        candidates.push(candidate)
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
    pc.addStream(screenStream);

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
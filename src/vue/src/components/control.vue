<script setup>
import {onMounted, onUnmounted, ref} from 'vue'
import '@/assets/control.css'

const remoteCode = ref("")
const localCode = ref("")
const controlText = ref("")
const login = async () => {
  let code = await window.electronAPI.ipcInvoke('login')
  localCode.value=code
}
const startControl = () => {
  window.electronAPI.send('control', remoteCode.value)
}
const handleControlState = (e,name,type) => {
    let text=''
    if(type===1){
        text='正在远程控制'+name
    } else if(type===2) {
        text='被'+name+'控制中'
    }
    controlText.value=text
}
onMounted(() => {
  login()
  window.electronAPI.ipcOn('control-state-change', handleControlState)
})
onUnmounted(() => {
  window.electronAPI.removeListener('control-state-change', handleControlState) 
})
</script>

<template>
<div class="container">
  <div class="rc-logo">RC</div>
  <div class="rc-subtitle">Remote Control</div>
  
  <div v-if="controlText === ''">
    <div class="control-code">
      <div class="code-label">你的控制码</div>
      <div class="code-value">{{ localCode }}</div>
    </div>
    
    <div class="input-section">
      <label class="input-label">输入远程控制码</label>
      <input 
        type="text" 
        class="remote-code-input"
        v-model="remoteCode" 
        placeholder="请输入对方的控制码"
      >
    </div>
    
    <button class="confirm-button" @click="startControl(remoteCode)">
      开始控制
    </button>
  </div>
  
  <div v-else class="control-status">
    {{ controlText }}
  </div>
</div>
</template>

<style scoped>
  .container {
    display: flex;
    justify-content: flex-start;
    align-items: center;   
    height: 100vh;           /* 占满整个视口高度 */
    flex-direction: column;  /* 垂直排列子元素 */
  }
</style>

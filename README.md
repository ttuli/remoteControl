# Electron远程控制软件

基于 Electron + Vue 3 的windows远程控制解决方案。

## 功能特性

- 🖱️ **鼠标控制**：支持左键、右键单击和双击操作
- ⌨️ **键盘输入**：完整的键盘输入和快捷键支持

## 快速启动

### 1. 配置服务器地址
编辑 `control/signal.js`，修改为您的服务器地址

### 2. 启动信令服务
```bash
cd signal
node server.js
```

### 3. 启动应用
```bash
npm install
npm run start
```

## 技术栈

Electron + Vue 3 + WebRTC + WebSocket

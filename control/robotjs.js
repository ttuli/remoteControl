const { mouse, straightTo, Button, keyboard, Key } = require('@nut-tree/nut-js')
const {ipcMain} = require('electron')

function handleMouse(data) {
  // data {clientX, clientY, screen: {width, height}, video: {width, height}}
  try {
    const { clientX, clientY, screen, video , type, button} = data
    const x = Math.round(screen.width * clientX / video.width)
    const y = Math.round(screen.height * clientY / video.height)
    
    mouse.config.mouseSpeed = 0;
    mouse.move(straightTo({ x, y }))

    console.log(type)
    switch (type) {
        case 'click':
          mouse.click(Button.LEFT)
          break
        case 'doubleclick':
          mouse.doubleClick(Button.LEFT)
          break
        case 'mousedown':
            let downButton
            if (button === 2) {
                downButton = Button.RIGHT
            } else if (button === 1) {
                downButton = Button.MIDDLE
            } else {
                downButton = Button.LEFT
            }
          mouse.pressButton(downButton)
          break
        case 'mouseup':
          var upButton
            if (button === 2) {
                upButton = Button.RIGHT
            } else if (button === 1) {
                upButton = Button.MIDDLE
            } else {
                upButton = Button.LEFT
            }
          mouse.releaseButton(upButton)
          break
        case 'scroll':
          const { deltaX = 0, deltaY = 0 } = data
          if (deltaY !== 0) {
            if (deltaY > 0) {
              mouse.scrollDown(Math.abs(deltaY))
            } else {
              mouse.scrollUp(Math.abs(deltaY))
            }
          }
          if (deltaX !== 0) {
            if (deltaX > 0) {
              mouse.scrollRight(Math.abs(deltaX))
            } else {
              mouse.scrollLeft(Math.abs(deltaX))
            }
          }
          break
        default:
          break
      }
  } catch (error) {
    console.error('鼠标操作失败:', error)
  }
}

function handleKey(data) {
  // data {keyCode, meta, alt, ctrl, shift}
  try {
    const modifiers = []
    
    // 添加修饰键
    if (data.meta) modifiers.push(Key.LeftWin) // Mac 上是 Cmd，Windows 上是 Win
    if (data.shift) modifiers.push(Key.LeftShift)
    if (data.alt) modifiers.push(Key.LeftAlt)
    if (data.control) modifiers.push(Key.LeftControl)
    
    // 将键码转换为 nut-js 的键
    const key = convertKeyCode(data.keyCode)
    
    if (key) {
      if (modifiers.length > 0) {
        // 有修饰键的组合键
        keyboard.pressKey(...modifiers, key)
        keyboard.releaseKey(...modifiers, key)
      } else {
        // 单独按键
        console.log('Pressing key:', key)
        keyboard.pressKey(key)
        keyboard.releaseKey(key)
      }
    }
  } catch (error) {
    console.error('键盘操作失败:', error)
  }
}

// 将键码转换为 nut-js 的键
function convertKeyCode(keyCode) {
  const keyMap = {
    // 字母键
    65: Key.A, 66: Key.B, 67: Key.C, 68: Key.D, 69: Key.E,
    70: Key.F, 71: Key.G, 72: Key.H, 73: Key.I, 74: Key.J,
    75: Key.K, 76: Key.L, 77: Key.M, 78: Key.N, 79: Key.O,
    80: Key.P, 81: Key.Q, 82: Key.R, 83: Key.S, 84: Key.T,
    85: Key.U, 86: Key.V, 87: Key.W, 88: Key.X, 89: Key.Y,
    90: Key.Z,
    
    // 数字键
    48: Key.Num0, 49: Key.Num1, 50: Key.Num2, 51: Key.Num3, 52: Key.Num4,
    53: Key.Num5, 54: Key.Num6, 55: Key.Num7, 56: Key.Num8, 57: Key.Num9,
    
    // 功能键
    112: Key.F1, 113: Key.F2, 114: Key.F3, 115: Key.F4, 116: Key.F5,
    117: Key.F6, 118: Key.F7, 119: Key.F8, 120: Key.F9, 121: Key.F10,
    122: Key.F11, 123: Key.F12,
    
    // 特殊键
    8: Key.Backspace,
    9: Key.Tab,
    13: Key.Return,
    16: Key.LeftShift,
    17: Key.LeftControl,
    18: Key.LeftAlt,
    20: Key.CapsLock,
    27: Key.Escape,
    32: Key.Space,
    33: Key.PageUp,
    34: Key.PageDown,
    35: Key.End,
    36: Key.Home,
    37: Key.Left,
    38: Key.Up,
    39: Key.Right,
    40: Key.Down,
    45: Key.Insert,
    46: Key.Delete,
    
    // 数字小键盘
    96: Key.NumPad0, 97: Key.NumPad1, 98: Key.NumPad2, 99: Key.NumPad3,
    100: Key.NumPad4, 101: Key.NumPad5, 102: Key.NumPad6, 103: Key.NumPad7,
    104: Key.NumPad8, 105: Key.NumPad9,
    106: Key.NumPadMultiply,
    107: Key.NumPadAdd,
    109: Key.NumPadSubtract,
    110: Key.NumPadDecimal,
    111: Key.NumPadDivide,
    
    // 标点符号
    186: Key.Semicolon,    // ;
    187: Key.Equal,        // =
    188: Key.Comma,        // ,
    189: Key.Minus,        // -
    190: Key.Period,       // .
    191: Key.Slash,        // /
    192: Key.Grave,        // `
    219: Key.LeftBracket,  // [
    220: Key.Backslash,    // \
    221: Key.RightBracket, // ]
    222: Key.Quote         // '
  }
  
  return keyMap[keyCode] || null
}

module.exports = function() {
  ipcMain.on('mouse', (event, data) => {
    handleMouse(data)
  })
  ipcMain.on('key', (event, data) => {
    handleKey(data)
  })
}
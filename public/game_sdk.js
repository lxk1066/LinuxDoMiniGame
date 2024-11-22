/**
 * LINUX DO MINI GAMES SDK
 * @description: LINUX DO MINI GAMES SDK
 * @version: 1.0.0
 * @author: NightKitty
 * @license: MIT
 * @lastModify: 2024-08-10
 */
'use strict'

// sdk
;(function (global) {
  const serverUrl = 'https://games.nightkitty.top:8888'
  if (!global.$LinuxDoMiniGames) global.$LinuxDoMiniGames = {}

  // 动态加载Socket.IO客户端库
  function loadSocketIO(callback) {
    const script = document.createElement('script')
    script.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js' // 替换为你需要的Socket.IO版本
    script.onload = function () {
      console.log('Socket.IO客户端库已加载')
      callback()
    }
    script.onerror = function () {
      console.error('Socket.IO客户端库加载失败')
    }
    document.head.appendChild(script)
  }

  // 页面样式、动画相关
  // 获取遮罩层和倒计时文本元素
  const overlayElement = document.createElement('div')
  overlayElement.id = 'overlay'
  overlayElement.className = 'overlay'
  const countdownElement = document.createElement('div')
  countdownElement.id = 'countdown'
  countdownElement.className = 'countdown-text'
  overlayElement.appendChild(countdownElement)
  document.body.insertBefore(overlayElement, document.body.firstChild)

  // 所有相关的Interval定时器变量，统一管理方便集中销毁
  const intervalManager = {
    countdownTimer: null,
    startGameInterval: null,
    waitGameResultCountdownInterval: null
  }

  // 创建样式层
  const styleElement = document.createElement('style')
  styleElement.textContent = `
    /* 遮罩层 */
    .overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 999;
      text-align: center;
      padding-top: 20%;
    }

    /* 倒计时文本 */
    .countdown-text {
      font-size: 3em;
      // color: white;
    }
    .overlay button {
      font-size: 1rem;
      padding: 10px;
      border: none;
      border-radius: 10%;
    }
  `
  document.head.appendChild(styleElement)

  // 匹配成功样式及准备按钮样式
  function matchSuccessAndReadyStyle(miniGameName, callback) {
    const matchReadyCallback = () => {
      clearInterval(intervalManager.startGameInterval)
      readyButton.disabled = true
      global.$LinuxDoMiniGames.matchReady(() => {
        el.textContent = '已准备就绪，请稍后...'

        setTimeout(() => {
          // overlayElement.style.display = "none";
          // countdownElement.innerHTML = "";
          callback && callback()
        }, 500)
      })
    }

    let countdown = 5
    overlayElement.style.display = 'block'
    countdownElement.innerHTML = ''
    const el = document.createElement('div')
    el.textContent = `您匹配到的小游戏是：${miniGameName}，${countdown}秒后自动准备。`
    const readyButton = document.createElement('button')
    readyButton.className = 'mini-game-ready-button'
    readyButton.textContent = '准备'
    readyButton.addEventListener('click', matchReadyCallback)
    countdownElement.appendChild(el)
    countdownElement.appendChild(readyButton)

    intervalManager.startGameInterval = window.setInterval(() => {
      countdown--
      el.textContent = `您匹配到的小游戏是：${miniGameName}，${countdown}秒后自动准备。`

      if (countdown === 0) {
        clearInterval(intervalManager.startGameInterval)
        el.textContent = '已自动准备'
        readyButton.remove()
        global.$LinuxDoMiniGames.matchReady(matchReadyCallback)
      }
    }, 1000)
  }

  // 封装的倒计时函数
  function startCountdown(durationInSeconds, callback) {
    overlayElement.style.display = 'block'
    let remainingTime = durationInSeconds

    function updateCountdown() {
      countdownElement.textContent = remainingTime
      remainingTime--

      if (remainingTime < 0) {
        clearInterval(intervalManager.countdownTimer)
        endCountdown(callback)
      }
    }

    updateCountdown()
    intervalManager.countdownTimer = setInterval(updateCountdown, 1000)
  }

  // 倒计时结束处理
  function endCountdown(callback) {
    countdownElement.textContent = '游戏开始'
    setTimeout(() => {
      overlayElement.style.display = 'none'

      // 这里可以添加游戏开始后的逻辑
      callback && callback()
    }, 1000)
  }

  function waitGameResultCountdown(divElement) {
    let dotCount = 0
    intervalManager.waitGameResultCountdownInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4 // 循环从0到3，对应"."的数量
      const textContent = `等待对战结果${'.'.repeat(dotCount)}`
      divElement.textContent = textContent
    }, 500)
  }

  function waitingGameResult() {
    console.log('waitingGameResult')
    overlayElement.style.display = 'block'
    countdownElement.textContent = '游戏结束,请稍后'

    setTimeout(() => {
      if (gameData.gameStatus === 'end') return
      waitGameResultCountdown(countdownElement)
    }, 2000)
  }
  function gameOver(playerId, gameResult) {
    clearInterval(intervalManager.waitGameResultCountdownInterval)
    const goHomeBtn = document.createElement('button')
    goHomeBtn.innerHTML = '返回首页'
    goHomeBtn.addEventListener('click', () => {
      window.location.href = '/'
    })

    countdownElement.innerHTML = `
      <div>${
        gameResult.winner == 'tie'
          ? '平局'
          : playerId == gameResult.winner
            ? '你赢了！'
            : '你输了，下次加油！'
      }</div>
    `
    countdownElement.appendChild(goHomeBtn)
  }

  // 定义SDK内部变量, 只能通过方法修改
  let miniGameReady = false // 小游戏端是否准备完毕，如果未准备则无法开始游戏
  let socketConnection = null // socket连接实例
  const gameData = {
    playerId: null,
    otherPlayerId: null,
    gameId: null,
    miniGameId: null,
    gameStatus: null,
    gameScore: null
  }
  const pageMethods = {
    matchSuccessGoPage: null // 匹配成功跳转到小游戏页面
  }

  // 定义SDK方法
  const sdkMethods = {
    // 清除所有Interval
    clearAllInterval: function () {
      for (const key in intervalManager) {
        clearInterval(intervalManager[key])
      }
    },
    // Socket.IO连接管理
    setSocketConnection: function (connection) {
      socketConnection = connection
    },
    getSocketConnection: function () {
      return socketConnection
    },

    setMiniGameReady: function (status) {
      miniGameReady = status
    },
    getMiniGameReady: function () {
      return miniGameReady
    },

    // gameData管理
    setPlayerId: function (playerId) {
      gameData.playerId = playerId
    },
    setGameData: function (gameId, miniGameId, otherPlayerId, gameStatus) {
      gameData.gameId = gameId
      gameData.miniGameId = miniGameId
      gameData.otherPlayerId = otherPlayerId
      gameData.gameStatus = gameStatus
      console.log('gameData已保存', gameData)
    },
    updateGameStatus: function (gameStatus) {
      gameData.gameStatus = gameStatus
    },
    getGameData: function () {
      return gameData
    },

    // 游戏匹配方法
    playMatch: function (playerInfo, cb, matchSuccessCallback) {
      console.log('playMatch', playerInfo)
      const socket = this.getSocketConnection()
      if (!socket || !socket.connected) {
        console.error('Socket.IO连接未初始化')
        return
      }

      socket.emit('matchJoin', { playerId: socket.userId, score: playerInfo.score }, (data) => {
        console.log('matchJoin', data)
        sdkMethods.updateGameStatus('matchJoin')

        // 把matchSuccessCallback传递出去
        pageMethods.matchSuccessGoPage = matchSuccessCallback

        cb && cb(data)
      })
    },
    matchCancel: function (cb) {
      const socket = this.getSocketConnection()
      if (!socket || !socket.connected) {
        console.error('Socket.IO连接未初始化')
        return
      }

      socket.emit('matchCancel', { playerId: socket.userId }, (data) => {
        console.log('matchCancel', data)
        sdkMethods.updateGameStatus('matchCancel')
        cb && cb(data)
      })
    },
    // 游戏匹配成功，玩家响应准备
    matchReady: function (cb) {
      const socket = this.getSocketConnection()
      if (!socket || !socket.connected) {
        console.error('Socket.IO连接未初始化')
        return
      }

      const data = sdkMethods.getGameData()

      if (data.gameStatus === 'gameInterrupt') return
      socket.emit(
        'matchReady',
        JSON.stringify({
          gameId: data.gameId,
          playerId: data.playerId,
          otherPlayerId: data.otherPlayerId
        }),
        (data) => {
          console.log('matchReady', data)
          sdkMethods.updateGameStatus('matchReady')
          cb && cb(data)
        }
      )
    },

    // 游戏结束回调 小游戏端需要调用该方法
    // data包含score 代表游戏成绩
    gameOverCallback: function (data) {
      if (gameData.gameStatus === 'gameInterrupt') return

      console.log('游戏结束，SDK的gameOverCallback被调用')

      waitingGameResult()
      const socket = sdkMethods.getSocketConnection()
      // 向服务器提交游戏结束
      socket.emit(
        'playEnd',
        JSON.stringify({ gameId: gameData.gameId, score: data.score }),
        (data) => {
          console.log('gameOver', data)
          sdkMethods.updateGameStatus('gameOver')
        }
      )
    },

    // 游戏开始回调
    gameStart: function () {
      console.log('游戏开始')
      // 调用页面中定义的gameStart方法（如果存在）
      if (typeof global.$LinuxDoMiniGames.pageGameStart === 'function') {
        global.$LinuxDoMiniGames.pageGameStart()
      }
    }
  }

  // 处理Socket.IO连接和事件
  function socketConnectionHandler(playerId) {
    // 创建Socket.IO连接
    const socket = window.io(`${serverUrl}/games`)
    sdkMethods.setSocketConnection(socket)

    // 监听Socket.IO事件
    socket.on('connect', () => {
      socket.userId = playerId
      console.log('socket connected', socket)
      socket.emit('setUserId', socket.userId, (data) => console.log(data))

      // sdkMethods.playMatch({ score: 123 }, data => console.log(data));

      socket.on('matchSuccess', (data) => {
        console.log('matchSuccess', data)
        data = JSON.parse(data)
        sdkMethods.setPlayerId(socket.userId)
        sdkMethods.setGameData(data.gameId, data.miniGameId, data.otherPlayer, 'matchSuccess')

        // 跳转到游戏页面
        pageMethods.matchSuccessGoPage(
          { gameId: data.gameId, miniGameId: data.miniGameId },
          (miniGameData) => {
            // 返回游戏信息 miniGameData

            console.log('miniGameData', miniGameData)

            matchSuccessAndReadyStyle(miniGameData.name, () => {
              console.log('matchSuccessAndReadyStyle callback')
            })

            // 拿着小游戏Id获取游戏信息
            // api.getGameById(gameData.miniGameId, function ({ data: res }) {});
          }
        )

        socket.on('playStart', (data) => {
          console.log('playStart', data)

          if (gameData.gameStatus !== 'playStart') {
            gameData.gameStatus = 'playStart'

            // 调用倒计时函数并传递秒数
            startCountdown(5, () => {
              // 开始游戏
              console.log('start game')

              // 小游戏需要在window.$LinuxDoMiniGames上定义startGame方法，方便SDK开始游戏
              // 调用startGame方法则代表游戏正式开始，并且开始倒计时
              window.$LinuxDoMiniGames.startGame()
            })
          }

          socket.on('playResult', (data) => {
            // 服务端返回游戏结果
            console.log('playResult', JSON.parse(data))
            gameData.gameStatus = 'end'
            gameOver(gameData.playerId, JSON.parse(data))
          })
        })

        // 游戏中断事件
        socket.on('gameInterrupt', (data) => {
          console.log('gameInterrupt', data)
          sdkMethods.updateGameStatus('gameInterrupt')

          // 清除所有Interval
          sdkMethods.clearAllInterval()

          const goHomeBtn = document.createElement('button')
          goHomeBtn.innerHTML = '返回首页'
          goHomeBtn.addEventListener('click', () => {
            window.location.href = '/'
          })

          countdownElement.innerHTML = `
              <div>对方玩家已掉线，游戏结束</div>
            `
          countdownElement.appendChild(goHomeBtn)
          overlayElement.style.display = 'block'
        })
      })
    })
  }

  function initializeSDK() {
    // 合并SDK中的方法和页面中已有的方法
    global.$LinuxDoMiniGames = Object.assign(global.$LinuxDoMiniGames, sdkMethods)

    if (global.$LinuxDoMiniGames.playerId) {
      socketConnectionHandler(global.$LinuxDoMiniGames.playerId)
    } else {
      console.error('playerId未定义, 请在合适的位置定义window.$LinuxDoMiniGames.playerId')
    }

    // SDK加载完成事件
    const sdkReadyEvent = new Event('sdkReady')
    global.document.dispatchEvent(sdkReadyEvent)
  }

  // 加载SDK
  global.$LinuxDoMiniGames.init = function (playerId) {
    global.$LinuxDoMiniGames.playerId = playerId

    loadSocketIO(initializeSDK)
  }

  // 小游戏端需要调用miniGameReady方法，同时sdk检测
  global.$LinuxDoMiniGames.miniGameReady = function (options) {
    const result = { status: true, msg: 'ok' }

    // startGame方法
    if (typeof options.startGame !== 'function') {
      result.status = false
      result.msg = 'window.$LinuxDoMiniGames.startGame方法未实现'
      return result
    } else {
      global.$LinuxDoMiniGames.startGame = options.startGame
    }

    sdkMethods.setMiniGameReady(true)
    return result
  }
})(window)

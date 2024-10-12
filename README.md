# LinuxDoMiniGames

LinuxDo 在线随机匹配小游戏的前端项目。

## 必读事项

1. 关于第三方小游戏接入的问题。
   目前已经将SDK封装，并在全局暴露API方法，任何第三方的小游戏页面只需要完成以下操作就可以接入平台：

   1. 监听window的message事件，拿到event.data.type，不出意外的话就是sdkReady，然后就可以调用我暴露在全局的API。
      在接收到sdkReady后，必须调用`window.$LinuxDoMiniGames.miniGameReady()`方法，miniGameReady方法接收一个option参数，必须包含startGame方法，小游戏需要自己实现其中逻辑，平台会在合适的时间调用该方法，从而开始游戏，以下是示例代码：

      ```js
      window.addEventListener('message', function (event) {
        console.log('message: ', event.data.type) // message: sdkReady
        console.log('$LinuxDoMiniGames', window.$LinuxDoMiniGames)

        window.$LinuxDoMiniGames.miniGameReady({
          startGame: function () {
            reStartBtn.click()
          }
        })
      })
      ```

   2. 在游戏结束时调用`window.$LinuxDoMiniGames.gameOverCallback()`方法，接收一个对象，必须包含score属性，表示玩家的成绩，实例代码：

   ```js
   window.$LinuxDoMiniGames.gameOverCallback({ score: 100 })
   ```

   3. 温馨提示

   - 小游戏通过iframe嵌入页面，请确保页面可以正常显示。
   - 我只向iframe暴露了个别方法，不要尝试去修改它：

   ```js
   Object.defineProperty(iframe.contentWindow.window, '$LinuxDoMiniGames', {
     value: {
       miniGameReady: gameSDK.miniGameReady,
       gameOverCallback: gameSDK.gameOverCallback
     },
     writable: false,
     configurable: false
   })
   ```

2. `public/game_sdk.js`文件

   这是我自己封装的一个游戏SDK，封装了部分页面样式和游戏的初始化、匹配、游戏开始、游戏结束等逻辑。
   我最初的想法是将这部分功能封装成一个sdk文件，第三方小游戏引入自己的页面中，在后续开发中发现这比较多余，我通过iframe的方式将游戏sdk的功能方法暴露到iframe下面的window对象中，这样第三方小游戏就可以通过调用window.$LinuxDoMiniGames.xxx来调用gameSDK的方法。各位开发者可以根据自己需求进行修改。

3. 其他部分和普通的前端项目别无二差，简单看一遍就能快速上手。

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

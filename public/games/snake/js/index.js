import Snake from './snake.js'
import Food from './food.js'
import Render from './render.js'
import Controller from './controller.js'
// 初始化
const render = new Render()
const snake = new Snake()
const food = new Food(render.mapSize)
const controller = new Controller(render.mapSize, gameOverCallback)

function gameOverCallback(data) {
  window.$LinuxDoMiniGames.gameOverCallback(data)
}

render.init()
// 调节速度的下拉选项元素
const speedEl = document.querySelector('#speed')
speedEl.addEventListener('change', function () {
  controller.changeSpeed(this.value, snake, render, food)
  this.blur()
})

// 重新开始
const reStartBtn = document.querySelector('#reStart')
reStartBtn.addEventListener('click', function () {
  controller.stopKeydownListen()
  controller.stopGame()

  snake.init()
  food.init()
  snake.__lifeVal = 3
  controller.score = 0

  render.reRenderMap()
  render.reRenderSnake(snake.body)
  render.reRenderSnakeLifeVal(snake.__lifeVal)
  render.reRenderScoreboard(0)
  render.reRenderFoods(food.foods)

  controller.direction = 'd'
  controller.proceed = true
  controller.init(snake, render, food, 60, document.querySelector('#gameTime'))
})

// window.$LinuxDoMiniGames.gameController = controller;
window.addEventListener('message', function (event) {
  console.log('message: ', event.data.type)
  console.log('$LinuxDoMiniGames', window.$LinuxDoMiniGames)

  window.$LinuxDoMiniGames.miniGameReady({
    startGame: function () {
      reStartBtn.click()
    }
  })
})

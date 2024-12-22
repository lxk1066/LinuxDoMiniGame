import Snake from "./snake.js";
import Food from "./food.js";
import Render from "./render.js";
import Controller from "./controller.js";
// 初始化
const render = new Render(".mf", ".item", ".eat", ".player-lifeVal", ".player-score");

const snake = new Snake(3);
const food = new Food(render.mapSize);
const controller = new Controller(".mf", render.mapSize, gameOverCallback);

function gameOverCallback(data) {
  alert("Game Over!");
}

render.init();

// 重新开始
const reStartBtn = document.querySelector("#reStart");
reStartBtn.addEventListener("click", function () {
  if (reStartBtn.textContent.includes("开始游戏")) reStartBtn.textContent = "重新开始";

  controller.stopKeydownListen();
  controller.stopGame();
  controller.endGameTime();

  snake.init();
  food.init();
  snake.__lifeVal = 3;
  controller.score = 0;

  render.reRenderMap();
  render.reRenderSnake([snake.headX, snake.headY], snake.body);
  render.reRenderSnakeLifeVal(snake.__maxLife, snake.__lifeVal);
  render.reRenderScoreboard(0);
  render.reRenderFoods(food.foods);

  controller.direction = "d";
  controller.proceed = true;
  controller.init(snake, render, food, 60 * 1, document.querySelector("#gameTime"));
});

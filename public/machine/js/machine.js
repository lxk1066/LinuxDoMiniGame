import Snake from "./snake.js";
import Food from "./food.js";
import Render from "./render.js";
import Controller from "./controller.js";
import { Gard, AStar } from "./AStar.js";

const mapSize = 20;
const mapGrid = new Gard(mapSize, mapSize);
const a_star = new AStar(mapGrid);

// 初始化
const render = new Render(".machine-mf", ".item", ".eat", ".machine-lifeVal", ".machine-score");

const snake = new Snake(5);
const food = new Food(render.mapSize);
const controller = new Controller(".machine-mf", render.mapSize, gameOverCallback, "machine", machine);

function gameOverCallback(data) {}

render.init();

// 重新开始
const reStartBtn = document.querySelector("#reStart");
reStartBtn.addEventListener("click", function () {
  controller.stopKeydownListen();
  controller.stopGame();
  controller.endGameTime();

  snake.init();
  food.init();
  snake.__lifeVal = snake.__maxLife;
  controller.score = 0;

  render.reRenderMap();
  render.reRenderSnake([snake.headX, snake.headY], snake.body);
  render.reRenderSnakeLifeVal(snake.getMaxLife(), snake.__lifeVal);
  render.reRenderScoreboard(0);
  render.reRenderFoods(food.foods);

  controller.direction = "d";
  controller.proceed = true;
  controller.init(snake, render, food, 60 * 1, document.querySelector("#machineGameTime"));

  // 人机模式下，禁用键盘事件
  controller.stopKeydownListen();

  machine(snake, food);
});

// 使用controller.setDirection()控制方向, a_star.findPath()返回路径
// 函数每执行一次，snake有且只会移动一次
const currentPath = [];
function machine(snake, food) {
  if (currentPath.length <= 0) {
    console.log("machine find path");
    const [x, y] = [snake.headX, snake.headY];
    console.log("machine snake head", x, y);
    // 选中一个食物，将食物坐标作为目标坐标
    let [endX, endY] = food.foods[0];
    console.log("machine food", endX, endY);

    // 判断当前蛇头和食物是否在同一个点，如果是，则选择下一个食物
    if (isSamePoint([x, y], [endX, endY])) {
      console.log("isSamePoint", [x, y], [endX, endY]);
      console.log("foodCount", food.foodsCount);

      if (food.foodsCount <= 1) food.init();

      endX = food.foods[1][0];
      endY = food.foods[1][1];
    }

    // // 将蛇身（排除蛇头）作为障碍物数组添加到Grid中
    // mapGrid.resetObstacle(snake.body);

    // 将Grid所有节点的g、h、f值重置
    mapGrid.resetNodes();
    const path = a_star.findPath([x, y], [endX, endY]);
    currentPath.push(...path);
    console.log("machine path", path);
  }

  // path是一个[number, number][]
  if (currentPath) {
    const pathItem = currentPath.splice(0, 1)[0]; // pathItem [x, y]
    const [nextX, nextY] = pathItem;
    console.log("machine next", nextX, nextY, pathItem);

    // 比较蛇头的x和y坐标，与下一个点的坐标，判断方向
    if (snake.headX < nextX) {
      snake.moveRight();
    } else if (snake.headX > nextX) {
      snake.moveLeft();
    } else if (snake.headY < nextY) {
      snake.moveDown();
    } else if (snake.headY > nextY) {
      snake.moveUp();
    }
  }
}

// 判断开始节点和结束节点是否是同一个点
function isSamePoint(start, end) {
  return start[0] === end[0] && start[1] === end[1];
}

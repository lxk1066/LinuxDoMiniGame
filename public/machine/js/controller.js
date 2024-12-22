// 游戏控制类
export default class Controller {
  #speed;

  constructor(mapElSelector, groundSize, gameOverCallback, gameMode = "default", machineFn = null) {
    this.direction = " ";
    this.proceed = true;
    this.groundSize = groundSize;
    this.interval = null;
    this.gameTime = 0;
    this.gameTimeInterval = null;
    this.gameOverCallback = gameOverCallback;
    this.mode = gameMode; // default || machine人机模式
    this.machineFn = machineFn;
    this.mapEl = document.querySelector(mapElSelector);

    this.score = 0; // 得分
    // 调节速度
    this.#speed = {
      slow: 230,
      normal: 160,
      fast: 80
    };
    this.nowSpeed = this.#speed.normal;
  }

  init(snake, render, food, gameTime, gameTimeEl) {
    this.gameTime = gameTime;

    this.startGameTime(gameTimeEl);
    document.addEventListener("keydown", this.keydownEvent);

    this.startGame(snake, render, food);
  }

  keydownEvent = e => {
    // 复活状态未结束，禁止按键 只有复活状态结束才可以按键控制方向
    if (this.direction === "-1") return;
    this.direction = e.key;
    this.proceed = this.direction.trim();
  };

  // 开始游戏时间倒数
  startGameTime(timeEl) {
    this.gameTimeInterval = setInterval(() => {
      timeEl.textContent = --this.gameTime;
      if (this.gameTime <= 0) {
        this.endGameTime();
      }
    }, 1000);
  }

  endGameTime() {
    clearInterval(this.gameTimeInterval);
  }

  stopKeydownListen() {
    document.removeEventListener("keydown", this.keydownEvent);
  }

  stopGame() {
    clearInterval(this.interval);
  }

  startGame(snake, render, food) {
    this.interval = setInterval(() => {
      this.game(snake, render, food);
      render.reRenderSnake([snake.headX, snake.headY], snake.body);
    }, this.nowSpeed);
  }

  gameOver() {
    this.endGameTime();
    this.stopGame();
    this.gameOverCallback({ score: this.score });
    // setTimeout(() => alert("Game Over!"), 0);
  }

  checkDirection(snake) {
    switch (this.direction.trim()) {
      case "w":
        snake.moveUp();
        break;
      case "a":
        snake.moveLeft();
        break;
      case "s":
        snake.moveDown();
        break;
      case "d":
        snake.moveRight();
        break;
      case "ArrowUp":
        snake.moveUp();
        break;
      case "ArrowLeft":
        snake.moveLeft();
        break;
      case "ArrowDown":
        snake.moveDown();
        break;
      case "ArrowRight":
        snake.moveRight();
        break;
      default:
        this.proceed = false;
    }
  }

  game(snake, render, food) {
    if (this.gameTime <= 0) return this.gameOver();
    if (this.proceed) {
      if (snake.getLifeVal() > 0) {
        if (this.mode === "default") this.checkDirection(snake);
        else this.machineFn(snake, food);
        this.checkBoundary(snake, render, food);
        this.checkEatFood(snake, render, food);
      }
    }
  }

  // 处理边界
  checkBoundary(snake, render, food) {
    const snakeHeadPos = [snake.headX, snake.headY];
    console.log(snakeHeadPos);
    if (
      snakeHeadPos[0] < 0 ||
      snakeHeadPos[0] >= this.groundSize ||
      snakeHeadPos[1] < 0 ||
      snakeHeadPos[1] >= this.groundSize ||
      this.checkEatSelf(snake.body)
    ) {
      this.direction = "";
      this.stopGame();
      snake.buckleBlood();
      render.reRenderSnakeLifeVal(snake.getMaxLife(), snake.getLifeVal());
      if (snake.getLifeVal() <= 0) return this.gameOver();
      // 播放复活动画
      snake.init();
      this.direction = "-1";
      console.log("direction", this.direction);
      render.reRenderSnake([snake.headX, snake.headY], []);
      render.SnakeResurrectAni(() => {
        this.direction = "";
        this.startGame(snake, render, food);
      });
    }
  }

  // 处理吃到食物
  checkEatFood(snake, render, food) {
    const headEl = this.mapEl.querySelector(`[data-v="${snake.headX}-${snake.headY}"]`);
    if (headEl && headEl.matches(".eat")) {
      headEl.classList.remove("eat");
      snake.body.push([snake.headX, snake.headY]);
      food.eatFood(snake.headX, snake.headY);

      // 如果食物在地图最外圈，+20分，否则+10分
      if (food.isOnMapEdge(snake.headX, snake.headY)) {
        this.score += 20;
      } else {
        this.score += 10;
      }
    }
    render.reRenderScoreboard(this.score);

    if (food.foodsCount <= 0) {
      food.init();
      render.reRenderFoods(food.foods);
    }
  }

  // 判断蛇头是否撞到自己的身体
  checkEatSelf(snakeBodyPos) {
    return snakeBodyPos.some((item, index) => {
      if (index == 0) return;
      return item[0] == snakeBodyPos[0][0] && item[1] == snakeBodyPos[0][1];
    });
  }

  // 调节速度
  changeSpeed(value, snake, render, food) {
    this.nowSpeed = this.#speed[value];
    // 重置定时器
    this.stopGame();
    this.startGame(snake, render, food);
  }

  // 该方法提供给人机使用，用来设置direction
  setDirection(direction) {
    this.direction = direction;
  }
}

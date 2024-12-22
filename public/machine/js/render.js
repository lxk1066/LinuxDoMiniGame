// 渲染类
export default class Render {
  constructor(MapSelector, MapItemSelector, FoodSelector, lifeValSelector, scoreSelector) {
    // 地图
    this.mapSize = 20;
    this.mapItemSize = 30;
    this.mapEl = document.querySelector(MapSelector);
    this.mapItemList = [...this.mapEl.querySelectorAll(MapItemSelector)];
    // 血量
    this.lifeValEl = document.querySelector(lifeValSelector);
    // 分数面板
    this.scoreEl = document.querySelector(scoreSelector);
    // 蛇身
    this.snakeHead = [];
    this.snakeBody = [];
    // 食物
    this.foods = [...this.mapEl.querySelectorAll(FoodSelector)];
  }

  init() {
    // 重新渲染地图
    this.mapEl.style.width = `${this.mapItemSize * this.mapSize}px`;

    this.mapEl.innerHTML = "";
    for (let i = 0; i < this.mapSize; i++) {
      for (let j = 0; j < this.mapSize; j++) {
        this.mapEl.innerHTML += `<div data-v="${j}-${i}" class="item" 
            style="width: ${this.mapItemSize}px;height: ${this.mapItemSize}px;"></div>`;
      }
    }

    // 渲染蛇
    this.mapEl.querySelector(`[data-v="0-0"]`).classList.add("player");
    console.log(this.mapEl.querySelector(`[data-v="0-0"]`));
    this.snakeBody = [...this.mapEl.querySelectorAll(".player")];
  }

  reRenderMap() {
    this.mapItemList.forEach(item => {
      item.classList.remove("player", "eat");
    });
  }

  reRenderSnake(snakeHead, snakeBodyPos) {
    this.mapEl.querySelectorAll(".player").forEach(v => v.classList.remove("player", "playerHead"));

    this.mapEl.querySelector(`[data-v="${snakeHead[0]}-${snakeHead[1]}"]`).classList.add("playerHead");

    snakeBodyPos.forEach(v => {
      const item = this.mapEl.querySelector(`[data-v="${v[0]}-${v[1]}"]`);
      item && item.classList.add("player");
    });
    this.snakeBody = [...this.mapEl.querySelectorAll(".player")];
  }

  // 重新加载血条
  reRenderSnakeLifeVal(snakeMaxLife, snakeLifeVal) {
    this.lifeValEl.innerHTML = "&#9829;".repeat(snakeLifeVal) + "&#9825;".repeat(snakeMaxLife - snakeLifeVal);
  }

  // 渲染计分板
  reRenderScoreboard(score) {
    const scoreboard = (this.scoreEl.innerHTML = score);
  }

  reRenderFoods(newFoods) {
    console.log(newFoods);
    // 清空所有现有的食物
    this.mapEl.querySelectorAll(".eat").forEach(item => item.classList.remove("eat"));

    // 重新渲染新食物
    newFoods.forEach(item => this.mapEl.querySelector(`[data-v="${item.join("-")}"]`).classList.add("eat"));
  }

  SnakeResurrectAni(cb) {
    const ani = setInterval(() => {
      this.snakeBody.forEach((v, i) => {
        console.log(v);
        v.classList.toggle("playerHead");
      });
    }, 400);
    setTimeout(() => {
      clearInterval(ani);
      cb && cb();
    }, 2500);
  }
}

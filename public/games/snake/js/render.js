// 渲染类
export default class Render {
  constructor() {
    // 地图
    this.mapSize = 20;
    this.mapItemSize = 30;
    this.mapEl = document.querySelector(".mf");
    this.mapItemList = [...document.querySelectorAll(".mf .item")];
    // 蛇身
    this.snakeBody = [];
    // 食物
    this.foods = [...document.querySelectorAll(".eat")];
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
    document.querySelector(`[data-v="0-0"]`).classList.add("player");
    console.log(document.querySelector(`[data-v="0-0"]`));
    this.snakeBody = [...document.querySelectorAll(".player")];
  }

  reRenderMap() {
    this.mapItemList.forEach(item => {
      item.classList.remove("player", "eat");
    });
  }

  reRenderSnake(snakeBodyPos) {
    document.querySelectorAll(".player").forEach(v => v.classList.remove("player"));

    snakeBodyPos.forEach(v => {
      const item = document.querySelector(`[data-v="${v[0]}-${v[1]}"]`);
      item && item.classList.add("player");
    });
    this.snakeBody = [...document.querySelectorAll(".player")];
  }

  // 重新加载血条
  reRenderSnakeLifeVal(snakeLifeVal) {
    const lifeValEl = document.querySelector(".lifeVal");
    lifeValEl.innerHTML = "&#9829;".repeat(snakeLifeVal) + "&#9825;".repeat(3 - snakeLifeVal);
  }

  // 渲染计分板
  reRenderScoreboard(score) {
    const scoreboard = (document.querySelector(".score").innerHTML = score);
  }

  reRenderFoods(newFoods) {
    console.log(newFoods);
    // 清空所有现有的食物
    document.querySelectorAll(".eat").forEach(item => item.classList.remove("eat"));

    // 重新渲染新食物
    newFoods.forEach(item => document.querySelector(`[data-v="${item.join("-")}"]`).classList.add("eat"));
  }

  SnakeResurrectAni(cb) {
    const ani = setInterval(() => {
      this.snakeBody.forEach((v, i) => {
        console.log(v);
        v.classList.toggle("player");
      });
    }, 400);
    setTimeout(() => {
      clearInterval(ani);
      cb && cb();
    }, 2500);
  }
}

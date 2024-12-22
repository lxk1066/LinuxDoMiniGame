// 食物类
export default class Food {
  constructor(mapSize) {
    this.foods = [];
    this.foodsCount = 0;
    this.mapSize = mapSize;
  }

  init() {
    // 生成食物坐标
    const newFoods = [];
    for (let i = 0; i < 5; i++) {
      const x = Math.floor(Math.random() * this.mapSize);
      const y = Math.floor(Math.random() * this.mapSize);
      console.log([x, y]);
      newFoods.push([x, y]);
    }
    this.foods = newFoods;
    this.foodsCount = this.foods.length;
  }

  // 吃到食物
  eatFood(x, y) {
    const index = this.foods.findIndex(item => item[0] === x && item[1] === y);
    this.foods.splice(index, 1);
    this.foodsCount--;
  }

  // 判断坐标是否在地图最外一圈
  isOnMapEdge(x, y) {
    return x === 0 || y === 0 || x === this.mapSize - 1 || y === this.mapSize - 1;
  }
}

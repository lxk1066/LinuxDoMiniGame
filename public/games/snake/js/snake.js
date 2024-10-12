// 蛇类
/**
 * 蛇头，蛇身，蛇尾
 * 移动
 */
export default class Snake {
  constructor() {
    this.__lifeVal = 3;
    this.init();
  }

  init() {
    this.headX = 0; // 蛇头的X坐标
    this.headY = 0; // 蛇头的Y坐标
    this.tailX = this.headX; // 蛇尾的X坐标
    this.tailY = this.headY; // 蛇尾的Y坐标
    this.length = 1; // 蛇身长度
    this.direction = "";
    this.body = [[this.headX, this.headY]];
  }

  moveLeft() {
    this.headX--;
    this.body.unshift([this.headX, this.headY]);
    this.body.pop();
  }

  moveUp() {
    this.headY--;
    this.body.unshift([this.headX, this.headY]);
    this.body.pop();
  }

  moveRight() {
    this.headX++;
    this.body.unshift([this.headX, this.headY]);
    this.body.pop();
  }

  moveDown() {
    this.headY++;
    this.body.unshift([this.headX, this.headY]);
    this.body.pop();
  }

  eatFood() {
    this.body.push([...this.body[0]]);
    this.length++;
  }

  getLifeVal() {
    return this.__lifeVal;
  }

  // 扣一滴血
  buckleBlood() {
    this.__lifeVal--;
  }
}

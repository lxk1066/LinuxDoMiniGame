// 定义节点类
class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.g = 0;
    this.h = 0;
    this.f = 0;
    this.parent = null;
    this.isObstacle = false;
  }
}

// 定义Gard类
export class Gard {
  constructor(rows, cols, enableDiagonal = false) {
    this.rows = rows;
    this.cols = cols;
    this.enableDiagonal = enableDiagonal;

    this.grid = [];
    for (let i = 0; i < rows; i++) {
      this.grid[i] = [];
      for (let j = 0; j < cols; j++) {
        this.grid[i][j] = new Node(i, j);
      }
    }
  }

  getNode(x, y) {
    if (x < 0 || x >= this.rows || y < 0 || y >= this.cols) {
      return null;
    }
    return this.grid[x][y];
  }

  // 设置障碍物
  setObstacle(...arr) {
    for (let i = 0; i < arr.length; i++) {
      const [x, y] = arr[i];
      if (x >= 0 && x < this.rows && y >= 0 && y < this.cols) {
        this.grid[x][y].isObstacle = true;
      }
    }
  }

  // 传递一个新的障碍物数组，将原本的障碍物移除掉，将新的障碍物添加进去
  resetObstacle(arr) {
    const obstacleSet = new Set(arr.map(pos => pos.join(",")));

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.grid[i][j].isObstacle = obstacleSet.has(`${i},${j}`);
      }
    }
  }

  // 清空所有节点的 g、h、f 值
  resetNodes() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const node = this.grid[i][j];
        node.g = 0;
        node.h = 0;
        node.f = 0;
        node.parent = null; // 可选：重置父节点
      }
    }
  }

  // 判断是否为障碍物
  isObstacle(x, y) {
    return this.grid[x][y].isObstacle;
  }

  // 获取相邻节点
  getNeighbors(node) {
    let neighbors = [];
    const x = node.x;
    const y = node.y;

    // 上下左右
    if (x > 0) neighbors.push(this.grid[x - 1][y]);
    if (x < this.rows - 1) neighbors.push(this.grid[x + 1][y]);
    if (y > 0) neighbors.push(this.grid[x][y - 1]);
    if (y < this.cols - 1) neighbors.push(this.grid[x][y + 1]);

    // 对角线
    if (this.enableDiagonal) {
      if (x > 0 && y > 0) neighbors.push(this.grid[x - 1][y - 1]);
      if (x > 0 && y < this.cols - 1) neighbors.push(this.grid[x - 1][y + 1]);
      if (x < this.rows - 1 && y > 0) neighbors.push(this.grid[x + 1][y - 1]);
      if (x < this.rows - 1 && y < this.cols - 1) neighbors.push(this.grid[x + 1][y + 1]);
    }

    return neighbors.filter(neighbor => !neighbor.isObstacle);
  }
}

/**
 * 定义AStar类
 * @param {Gard} grid 网格
 */
export class AStar {
  /**
   *
   * @param {Gard} grid
   * @param {[number, number]} start
   * @param {[number, number]} end
   */
  constructor(grid) {
    this.grid = grid;
  }

  // 计算启发函数（这里使用曼哈顿距离）
  heuristic(node, end) {
    return Math.abs(node.x - end.x) + Math.abs(node.y - end.y);
  }

  /**
   *
   * @param {[number, number]} start 起点
   * @param {[number, number]} end 终点
   * @returns 最短路径
   */
  findPath(start, end) {
    // 开始节点
    start = this.grid.getNode(start[0], start[1]);
    // 结束节点
    end = this.grid.getNode(end[0], end[1]);

    console.log("findPath start", start, "end", end);

    let openSet = [start];
    let closedSet = [];

    while (openSet.length > 0) {
      let current = openSet[0];
      console.log("current", current, "openSet", openSet);
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < current.f) {
          current = openSet[i];
        }
      }

      console.log(`Current node: (${current.x}, ${current.y})`);

      if (current === end) {
        let path = [];
        let temp = current;
        let maxIterations = 1000; // 设置最大迭代次数
        let iterations = 0;
        while (temp.parent && iterations < maxIterations) {
          console.log("temp", temp);
          path.push([temp.x, temp.y]);
          temp = temp.parent;
          iterations++;
        }
        return path.reverse();
      }

      openSet = openSet.filter(node => node !== current);
      closedSet.push(current);

      let neighbors = this.grid.getNeighbors(current);
      console.log(
        `Neighbors of (${current.x}, ${current.y}):`,
        neighbors.map(n => `(${n.x}, ${n.y})`)
      );

      for (let neighbor of neighbors) {
        if (!closedSet.includes(neighbor)) {
          let tempG = current.g + 1;
          if (!openSet.includes(neighbor) || tempG < neighbor.g) {
            neighbor.g = tempG;
            neighbor.h = this.heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.parent = current;
            if (!openSet.includes(neighbor)) {
              openSet.push(neighbor);
            }
          }
        }
      }
    }

    return null; // 如果没有找到路径，则返回null
  }
}

<template>
  <canvas id="canvas" ref="canvasRef"></canvas>
  <div class="container">
    <div class="button-box">
      <div class="left">
        <ElButton class="button" type="primary" color="green" @click="goToSinglePlayer">
          人机模式(实验性)
        </ElButton>
      </div>
      <div class="right">
        <ElButton class="button" type="primary" @click="goToOfflineGames"> 单机模式 </ElButton>
      </div>
    </div>
  </div>

  <button class="back-button" @click="router.push({ name: 'home' })">返回</button>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton, ElMessage } from 'element-plus'
const canvasRef = ref<HTMLCanvasElement>()
let ctx: any = null

const router = useRouter()
const particles = ref<any>([])
const mouse = reactive({
  x: -500,
  y: -500
})

onMounted(() => {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
    ctx = canvasRef.value.getContext('2d')
  }

  requestAnimationFrame(animal)

  window.addEventListener('mousemove', mouseMoveFn)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', mouseMoveFn)
})

function mouseMoveFn(e: MouseEvent) {
  mouse.x = e.x
  mouse.y = e.y
}

// 跳转到人机模式
function goToSinglePlayer() {
  console.log('跳转到人机模式')
  router.push({ name: 'machine' })
}
// 单机模式
function goToOfflineGames() {
  console.log('跳转到单机模式')
  ElMessage.warning('暂未开放')
}

class Particle {
  x: number
  y: number
  vx: number
  vy: number
  age: number

  constructor() {
    this.x = 0
    this.y = 0
    this.vx = 0
    this.vy = 0
    this.age = 0
    this.init()
  }
  init() {
    if (!canvasRef.value) return
    this.x = Math.random() * canvasRef.value.width
    this.y = Math.random() * canvasRef.value.height
    this.vx = Math.random() - 0.5
    this.vy = Math.random() - 0.5
    this.age = (Math.random() * 50) | 0
  }
  update() {
    if (!canvasRef.value) return
    this.x += this.vx
    this.y += this.vy
    if (
      this.x < 0 ||
      this.x > canvasRef.value.width ||
      this.y < 0 ||
      this.y > canvasRef.value.height
    ) {
      this.init()
    }
    this.age--
    if (this.age < 0) {
      this.age = (Math.random() * 50) | 0
      this.vx += (Math.random() - 0.5) * 0.1
      this.vy += (Math.random() - 0.5) * 0.1
    }
    const r = Math.sqrt(Math.pow(this.x - mouse.x, 2) + Math.pow(this.y - mouse.y, 2))
    if (r < 250) {
      this.x -= (this.x - mouse.x) / 100
      this.y -= (this.y - mouse.y) / 100
    }
  }
  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2)
    ctx.fillStyle = 'green'
    ctx.fill()
  }
}
function init() {
  for (let i = 0; i < 200; i++) {
    particles.value.push(new Particle())
  }
}
init()

let lastTime = 0
const frameRate = 60 // 指定帧率
const frameInterval = 1000 / frameRate // 每帧的时间间隔

function animal(currentTime: number) {
  if (!currentTime) currentTime = performance.now()
  const deltaTime = currentTime - lastTime

  if (deltaTime >= frameInterval) {
    if (!canvasRef.value) return
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    for (let i in particles.value) {
      let p = particles.value[i]
      p.update()
      p.draw()
      for (let j = parseInt(i) + 1; j < particles.value.length; j++) {
        let p2 = particles.value[j]
        const r = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2))
        if (r < 100) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = 'rgba(25, 255, 25, ' + (1 - r / 100) + ')'
          ctx.stroke()
        }
      }
    }
    lastTime = currentTime
  }

  requestAnimationFrame(animal)
}
</script>

<style lang="scss" scoped>
html,
body {
  width: 100%;
  height: 100%;
}
.container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background-color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  z-index: 2;
}
#canvas {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* 设置较低的 z-index */
}

.button-box {
  width: 100vw;
  height: 100vh;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;

  .button {
    //width: 150px;
    height: 60px;
    font-size: 18px;
  }

  .left {
    width: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .right {
    width: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.back-button {
  position: fixed; /* 使用 fixed 定位 */
  top: 10px;
  right: 10px;
  z-index: 1000;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%; /* 圆形按钮 */
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加阴影 */

  &:hover {
    background-color: #0056b3;
  }
}
</style>

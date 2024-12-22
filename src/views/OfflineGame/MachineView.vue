<template>
  <iframe
    ref="iframeRef"
    class="container"
    :src="iframeUrl"
    frameborder="0"
    sandbox="allow-scripts allow-same-origin allow-modals"
  ></iframe>

  <button class="back-button" @click="goBack">返回</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const iframeUrl = ref('/machine/index.html')
const iframeRef = ref<HTMLIFrameElement>()
const router = useRouter()

function goBack() {
  router.push({ name: 'offlineIndex' })
}
</script>

<style lang="scss" scoped>
html,
body {
  width: 100%;
  height: 100%;
}
.container {
  width: 99vw;
  height: 99vh;

  overflow: hidden;
  transform: scale(0.95); /* 缩放比例 */
  transform-origin: top center; /* 缩放的原点 */
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

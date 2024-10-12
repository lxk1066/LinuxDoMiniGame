<template>
  <iframe ref="iframeRef" v-if="iframeUrl" class="iframe" :src="iframeUrl" frameborder="0"></iframe>
  <div v-else>{{ info }}</div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getGameRoomById, getMiniGameById } from '@/api/game'
import { useBaseStore } from '@/stores'
import gameSDK from '@/utils/gameSdk'

const store = useBaseStore()
const info = ref('正在加载...')
const route = useRoute()
const iframeUrl = ref('')
const iframeRef = ref<HTMLElement>()
onBeforeMount(async () => {
  const gameId = route.params.id as string
  try {
    const { data: gameRoom } = await getGameRoomById(gameId)
    if (gameRoom.code == 200 && gameRoom.data.gameId) {
      // 拿到小游戏id，请求小游戏信息
      const { data: gameInfo } = await getMiniGameById(gameRoom.data.gameTypeId)

      if (gameInfo.code == 200) {
        const callback = store.getMatchSuccessCallback()
        callback(gameInfo.data)

        iframeUrl.value = gameInfo.data.path
        nextTick(() => loadIframe())
      } else {
        info.value = '小游戏不存在'
      }
    } else {
      info.value = '游戏房间不存在'
    }
  } catch (error) {
    info.value = '游戏房间不存在'
  }
})

function loadIframe() {
  const iframe = iframeRef.value as HTMLIFrameElement

  if (iframe.contentWindow) {
    console.log('iframe.contentWindow', iframe.contentWindow)
    Object.defineProperty(iframe.contentWindow.window, '$LinuxDoMiniGames', {
      value: {
        miniGameReady: gameSDK.miniGameReady,
        gameOverCallback: gameSDK.gameOverCallback
      },
      writable: false,
      configurable: false
    })

    iframe.onload = () => {
      // 向iframe 发送消息 sdkReady
      ;(iframe.contentWindow as any).window.postMessage(
        {
          type: 'sdkReady'
        },
        '*'
      )
    }
  } else {
    info.value = 'iframe加载失败'
    ElMessage.error({
      message: 'iframe加载失败',
      type: 'error'
    })
  }
}
</script>

<style lang="scss" scoped>
.iframe {
  width: 99vw;
  height: 99vh;
}
</style>

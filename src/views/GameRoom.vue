<template>
  <iframe
    ref="iframeRef"
    v-if="iframeUrl"
    class="iframe"
    :src="iframeUrl"
    frameborder="0"
    sandbox="allow-scripts allow-same-origin"
  ></iframe>
  <div v-else>{{ info }}</div>

  <div v-if="info && isError" style="margin: 20px">
    <div>小游戏作者：{{ errorInfo.author }}</div>
    <div>站长：{{ errorInfo.admin }}</div>
    <div>错误信息：<br />{{ errorInfo.error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getGameRoomById, getMiniGameById } from '@/api/game'
import { useBaseStore } from '@/stores'
import gameSDK from '@/utils/gameSdk'

const store = useBaseStore()
const route = useRoute()
const info = ref('正在加载...')
const miniGameInfo = ref<any>({})
const iframeUrl = ref('')
const iframeRef = ref<HTMLElement>()
const isError = ref(false)
const errorInfo = reactive({
  author: '',
  admin: '',
  error: ''
})

onBeforeMount(async () => {
  const gameId = route.params.id as string
  try {
    const { data: gameRoom } = await getGameRoomById(gameId)
    if (gameRoom.code == 200 && gameRoom.data.gameId) {
      // 拿到小游戏id，请求小游戏信息
      const { data: gameInfo } = await getMiniGameById(gameRoom.data.gameTypeId)

      if (gameInfo.code == 200) {
        miniGameInfo.value = gameInfo.data
        const callback = store.getMatchSuccessCallback()
        callback(gameInfo.data)

        iframeUrl.value = gameInfo.data.path
        await nextTick(() => loadIframe())
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

    // 监听 iframe window 的 error 事件
    iframe.contentWindow.window.onerror = (e) => {
      // 将错误信息工整的打印到控制台
      console.log('gameRoom ', e, JSON.stringify(e, null, 2))

      iframeUrl.value = ''
      isError.value = true
      info.value = '小游戏页面抛出异常错误，请联系小游戏作者或者站长'

      if (miniGameInfo.value.authorContact) {
        errorInfo.author = `${miniGameInfo.value.author} ${miniGameInfo.value.authorContact}`
      } else {
        errorInfo.author = '无'
      }
      errorInfo.admin = 'QQ群：' + 853909196
      errorInfo.error = JSON.stringify(e, null, 2)

      ElMessage.error({
        message: '小游戏页面抛出异常错误，请联系小游戏作者或者站长',
        type: 'error'
      })
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
#shadow-dom {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>

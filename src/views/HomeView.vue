<script setup lang="ts">
import { ref, onBeforeMount, onMounted, reactive } from 'vue'
import {
  ElAvatar,
  ElButton,
  ElPopconfirm,
  ElIcon,
  ElCarousel,
  ElCarouselItem,
  ElMessageBox,
  ElMessage,
  ElDialog,
  ElNotification
} from 'element-plus'
import { Promotion, UserFilled, Search, InfoFilled, Loading } from '@element-plus/icons-vue'
import { useBaseStore } from '@/stores'
import { getServerInfo, getAllMiniGame } from '@/api/game'
import { getAdvertiseList } from '@/api/advertise'

import gameSDK from '@/utils/gameSdk'
import { useRouter } from 'vue-router'

import DOMPurify from 'dompurify'

const router = useRouter()
const store = useBaseStore()
// 用户头像 URL
const avatarUrl = ref('')

// 用户名
const userName = ref('')
// 小游戏列表
const miniGameList = ref<any[]>([])

const serverInfo = reactive({
  // 服务器玩家人数
  playerUserCount: 0,
  // 服务器允许的最多玩家人数
  maxPlayerCount: 0,
  // 服务器内存使用率
  memoryUsage: 0
})

const isMatching = ref(false)
const loadingText = ref('正在加载...')

onBeforeMount(async () => {
  // 检查localStorage中有没有token, 如果有就将token放入store中，并请求玩家信息
  if (localStorage.getItem('token')) {
    store.setToken(localStorage.getItem('token') as string)
    const { data: userInfo } = await store.fetchUserInfo()
    if (userInfo.code == 200) {
      store.setUserInfo(userInfo.data)

      avatarUrl.value = userInfo.data.avatar
      userName.value = userInfo.data.username

      gameSDK.init(userInfo.data.id)

      store.userLogin()

      // 登录成功后获取服务器信息
      await fetchServerInfo()
    }
  }
})

onMounted(async () => {
  await getAllMiniGame()
    .then(({ data }) => {
      console.log('allMiniGame: ', data)
      if (data.code == 200) {
        miniGameList.value = data.data
      } else {
        ElMessage.error('获取小游戏列表失败')
      }
    })
    .catch(() => {
      ElMessage.error('获取小游戏列表失败')
    })

  await fetchAdList()
})

async function fetchServerInfo() {
  const { data: res } = await getServerInfo()
  console.log('serverInfo: ', res)
  serverInfo.playerUserCount = res.data.playerCount
  serverInfo.maxPlayerCount = res.data.maxPlayerCount
  serverInfo.memoryUsage = res.data.memoryUsage
}

// 登录按钮点击事件
async function handleLogin() {
  console.log('登录按钮被点击')
  const url = await store.OAuth2Login()
  location.href = url
}

async function handleLogout() {
  console.log('登出按钮被点击')
  store.userLogout()
  location.reload()
}

// 匹配按钮点击事件
function handleMatch() {
  console.log('匹配按钮被点击')
  if (serverInfo.playerUserCount >= serverInfo.maxPlayerCount) {
    ElMessageBox({
      title: '服务器已满',
      message: '服务器已满，请稍后再试。',
      confirmButtonText: '确定',
      showCancelButton: false,
      showClose: true,
      closeOnClickModal: true,
      closeOnPressEscape: true,
      closeOnHashChange: true,
      center: true,
      roundButton: true
    })

    return
  }

  isMatching.value = true
  loadingText.value = '正在加入匹配...'
  gameSDK.playMatch(
    {
      ...store.getUserInfo(),
      score: 123
    },
    (res: any) => {
      // 加入匹配队列成功
      console.log('加入匹配队列成功', res)
      loadingText.value = '正在匹配中...'
    },
    (gameData: any, fn: (res: any) => void) => {
      // 匹配成功
      console.log('匹配成功', gameData)
      loadingText.value = '匹配成功, 请稍后...'

      // 跳转到游戏房间
      // 将 fn 传递给游戏房间页面
      router.push({ name: 'gameRoom', params: { id: gameData.gameId } })
      store.setMatchSuccessCallback(fn)
    }
  )
}

// 取消匹配
const cancelMatchDisable = ref(false)
function handleCancelMatch() {
  console.log('取消匹配按钮被点击')

  loadingText.value = '正在取消匹配...'
  cancelMatchDisable.value = true
  gameSDK.matchCancel(() => {
    isMatching.value = false
    cancelMatchDisable.value = false
  })
}

const AdList = ref<
  Array<{
    id: number
    index: number
    title: string
    description: string
    url: string
    content: string
  }>
>([])

async function fetchAdList() {
  try {
    const { data: res } = await getAdvertiseList()
    if (res.code === 200) {
      AdList.value = res.data.sort((i, j) => i.index - j.index)
    } else {
      throw new Error()
    }
  } catch {
    ElNotification({
      message: '获取广告信息失败'
    })
  }
}

// 安全检测html文本
const sanitizeHTML = (dirtyHtml: string) => {
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['span', 'div', 'p'], // 允许的标签白名单
    ALLOWED_ATTR: ['style', 'class'] // 允许的属性白名单
  })
}

const clickCarousel = (item: {
  id: number
  title: string
  description: string
  url: string
  content: string
}) => {
  console.log('点击了', item)

  ElMessageBox({
    title: item.title,
    message: sanitizeHTML(item.content),
    confirmButtonText: '确定',
    showCancelButton: item.url ? true : false,
    cancelButtonText: '关闭',
    showClose: true,
    closeOnClickModal: true,
    closeOnPressEscape: true,
    closeOnHashChange: true,
    center: true,
    roundButton: true,
    dangerouslyUseHTMLString: true
  }).then(() => {
    if (!item.url || !item.url.trim()) return
    if (['http', 'https'].some((str) => item.url.startsWith(str))) window.location.href = item.url
    else router.push(item.url)
  })
}

// 打开设置弹窗
const settingVisible = ref(false)
const openSetting = () => {
  if (!store.isLogin) return
  settingVisible.value = true
}
</script>

<template>
  <div class="loading" :class="{ show: isMatching }">
    <div class="box">
      <el-icon :size="30"><Loading /></el-icon>
      <p>{{ loadingText }}</p>
      <el-button type="primary" @click="handleCancelMatch" :disabled="cancelMatchDisable">
        取消匹配
      </el-button>
    </div>
  </div>

  <div class="container">
    <aside>
      <div class="user-profile">
        <!-- 用户头像 -->
        <el-avatar :size="80" fit="fill" v-if="!avatarUrl" :icon="UserFilled" />
        <!-- 鼠标悬停到头像，显示设置图标 -->
        <el-avatar
          :size="80"
          v-else
          :src="avatarUrl"
          class="avatar-hover-setting"
          @click="openSetting"
        />

        <!-- 用户名称 -->
        <h2>{{ userName ? userName : '玩家请登录' }}</h2>

        <!-- 单机模式 -->
        <div class="offline-mode" :class="{ 'login-btn': !store.isLogin }">
          <el-button
            type="primary"
            @click="router.push({ name: 'offlineIndex' })"
            :icon="Promotion"
          >
            离线模式
          </el-button>
        </div>

        <!-- 登录按钮 -->
        <div v-if="!store.isLogin" class="login-btn">
          <el-button class="linuxdo-btn" type="primary" @click="handleLogin">
            <template #icon>
              <img class="linuxdo-icon" src="https://linux.do/logo-24.svg" />
            </template>
            LINUX DO 登录
          </el-button>

          <el-button
            type="primary"
            v-if="!store.isLogin"
            @click="router.push('/signin')"
            :icon="UserFilled"
          >
            账号密码登录
          </el-button>
        </div>

        <template v-else>
          <!-- 登出按钮 -->
          <el-popconfirm
            width="220"
            confirm-button-text="OK"
            cancel-button-text="No, Thanks"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="Are you sure to delete this?"
          >
            <template #reference>
              <el-button type="danger" @click="handleLogout" :icon="UserFilled">登出</el-button>
            </template>
          </el-popconfirm>

          <!-- 匹配按钮 -->
          <el-button type="success" :disabled="isMatching" @click="handleMatch" :icon="Search">
            匹配
          </el-button>

          <!-- 服务器信息 -->
          <div class="server-info" @click="fetchServerInfo">
            <p v-if="serverInfo.memoryUsage">
              当前玩家人数：{{ serverInfo.playerUserCount }}人 / {{ serverInfo.maxPlayerCount }}人
              <br />
              服务器内存使用率：{{ serverInfo.memoryUsage }}%
            </p>
          </div>
        </template>
      </div>
    </aside>
    <main>
      <h2>目前已开放的游戏</h2>
      <div class="game-list">
        <div class="item" v-for="miniGame in miniGameList" :key="miniGame.id">
          <div class="item-info">
            <div class="item-title">
              <h4>{{ miniGame.name }}</h4>
            </div>
            <div class="item-desc">
              <p>{{ miniGame.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <div class="fixed">
    <el-carousel
      height="120px"
      direction="vertical"
      arrow="never"
      :autoplay="true"
      :interval="2000"
    >
      <el-carousel-item
        v-for="item in AdList"
        :key="item.id"
        :title="item.title"
        class="box-item"
        @click="clickCarousel(item)"
      >
        <div v-html="sanitizeHTML(item.description)"></div>
      </el-carousel-item>
    </el-carousel>
  </div>

  <el-dialog v-model="settingVisible" width="800" draggable>
    <template #default>
      <span>TODO</span>
    </template>
    <template #header="{ titleId, titleClass }">
      <div
        :id="titleId"
        :class="titleClass"
        style="font-size: 25px; font-weight: bold; display: flex; justify-content: center"
      >
        设置
      </div>
    </template>
    <template #footer>
      <el-button @click="settingVisible = false"> 关闭 </el-button>
    </template>
  </el-dialog>
</template>
<style scoped lang="scss">
.loading {
  position: fixed;
  top: 0;
  left: 0;

  display: none;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;

  &.show {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.fixed {
  position: fixed;
  right: 10px;
  top: 40px;
  width: 120px;
  height: 120px;
  border-radius: 10%;
  background-color: rgba($color: #e7e7e7, $alpha: 0.8);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  user-select: none;
  cursor: pointer;

  .box-item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 95%;
    height: 95%;
  }
}

.container {
  width: 100vw;
  height: 100vh;
  display: flex;

  aside {
    display: flex;
    width: 50vw;
    justify-content: center;
    align-items: center;
    background-color: var(--el-color-white);
  }
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 50vw;
    background-color: lightblue;

    h2 {
      display: flex;
    }

    .game-list {
      display: flex;
      width: 80%;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;

      .item {
        display: flex;
        align-items: center;
      }
    }
  }
  .user-profile {
    display: flex;
    flex-direction: column;
    align-items: center;

    .avatar-hover-setting {
      &:hover {
        filter: brightness(100%);
      }

      &:hover::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 50px;
        height: 50px;
        transform: translate(-50%, -50%);
        background: transparent url('/assets/settings.svg') no-repeat center;
        background-size: 50px 50px;
      }

      &:hover::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        transform: translate(-50%, -50%);
        background-color: rgba($color: #fff, $alpha: 0.5);
        background-size: 50px 50px;
      }
    }

    .login-btn {
      width: 200px;
      display: flex;
      flex-direction: column;

      .linuxdo-icon {
        width: 24px;
        height: 24px;
        margin-right: 5px;
        user-select: none;
      }

      .linuxdo-btn:hover .linuxdo-icon {
        filter: brightness(150%);
      }
    }

    .server-info {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      padding: 10px;
      margin-top: 10px;
      border: 1px solid #e7e7e7;
      cursor: pointer;
      user-select: none;

      &:hover {
        background-color: #e7e7e7;
      }

      p {
        margin: 0;
        padding: 0;
      }
    }
  }

  .el-avatar {
    margin-bottom: 10px;
  }

  .el-button {
    margin: 5px;
  }
}
</style>

<template>
  <div class="container">
    <!-- 输入激活秘钥 -->
    <div class="get-code-box">
      <el-input v-model="inviteCodeSecret" placeholder="请输入秘钥"></el-input>
      <el-button class="get-code" size="large" @click="getInviteKey">获取邀请码</el-button>
    </div>

    <div class="input-box">
      <el-input v-model="inviteCode" readonly></el-input>
      <el-button @click="copyInviteCode" :disabled="!inviteCode">复制邀请码</el-button>
    </div>

    <el-link type="primary" @click="goRegister">已获取邀请码，去注册</el-link>

    <div class="tips">
      <p>
        <span class="tips-title">提示</span>
        <span class="tips-content"> 1. 邀请码仅限使用一次，请妥善保管。 </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElButton, ElMessage, ElInput, ElLink } from 'element-plus'
import { getInviteCode } from '@/api/user'
import { useClipboard } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const inviteCodeSecret = ref(route.query.key as string) // 秘钥
console.log('inviteCodeSecret', inviteCodeSecret)
const inviteCode = ref('') // 邀请码

const { copy } = useClipboard()

const getInviteKey = async () => {
  // TODO: 获取邀请码
  if (!inviteCodeSecret.value || !inviteCodeSecret.value.trim()) return

  const { data } = await getInviteCode(inviteCodeSecret.value)
  console.log('data', data)
  if (data.code == 200) {
    const code = data.data
    inviteCode.value = code
    await copy(code)

    ElMessage.success({
      message: '获取邀请码成功, 已成功复制到剪贴板',
      duration: 5000
    })
  } else {
    ElMessage.error(data.message || '获取邀请码失败')
  }
}

const copyInviteCode = async () => {
  await copy(inviteCode.value)
  ElMessage.success({
    message: '已复制邀请码',
    duration: 3000
  })
}

const goRegister = () => {
  if (!inviteCode.value || !inviteCode.value.trim()) {
    ElMessage.error('请先获取邀请码')
    return
  } else {
    router.push({
      path: '/signup',
      query: {
        inviteCode: inviteCode.value
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .get-code-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;

    .get-code {
      width: 200px;
      margin-top: 10px;
    }
  }

  .input-box {
    margin: 20px 0;
    display: flex;
  }

  .tips {
    width: 100%;
    text-align: center;
    font-size: 14px;
    color: #999;

    .tips-title {
      font-weight: bold;
    }

    .tips-content {
      margin-top: 10px;
    }
  }
}
</style>

import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getUserInfo as getUser, OAuthLogin } from '@/api/user'

interface UserInfo {
  id: number
  username: string
  avatar: string
  email: string
  trustLevel: number
}

export const useBaseStore = defineStore('base', () => {
  const accessToken = ref('')
  const isLogin = ref(false)
  const userInfo = reactive<UserInfo>({
    id: 0,
    username: '',
    avatar: '',
    email: '',
    trustLevel: 0
  })

  const matchSuccessCallback = ref<any>(null)

  function userLogin() {
    isLogin.value = true
  }

  function userLogout() {
    isLogin.value = false
    removeToken()
  }

  function setToken(token: string) {
    accessToken.value = token
    localStorage.setItem('token', token)
  }

  function getToken() {
    return accessToken.value
  }

  function removeToken() {
    accessToken.value = ''
    localStorage.removeItem('token')
  }

  function getUserInfo() {
    return userInfo
  }

  function setUserInfo(user: UserInfo) {
    userInfo.id = user.id
    userInfo.username = user.username
    userInfo.avatar = user.avatar
    userInfo.email = user.email
    userInfo.trustLevel = user.trustLevel
  }

  async function fetchUserInfo() {
    // 模拟获取用户信息
    return await getUser()
  }

  async function OAuth2Login() {
    return OAuthLogin()
  }

  function setMatchSuccessCallback(callback: (res: any) => void) {
    matchSuccessCallback.value = callback
  }
  function getMatchSuccessCallback() {
    const callback = matchSuccessCallback.value
    matchSuccessCallback.value = null
    return callback
  }

  return {
    userInfo,
    isLogin,
    userLogin,
    userLogout,
    OAuth2Login,
    getUserInfo,
    setUserInfo,
    fetchUserInfo,
    setToken,
    getToken,
    removeToken,
    setMatchSuccessCallback,
    getMatchSuccessCallback
  }
})

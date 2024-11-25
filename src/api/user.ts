import request from '@/utils/request'

// 图形验证码
export const getCaptcha = () => {
  return request.get('/auth/captcha', { withCredentials: true })
}

// 注册
export const register = (data: any) => {
  return request.post('/auth/register', data)
}

// 登录
export const login = (data: any) => {
  // 允许携带cookie
  return request.post('/auth/login', data, { withCredentials: true })
}

// 注册邮箱验证码
export const getRegisterEmailCode = (data: any) => {
  return request.post('/auth/emailCode', data)
}

export const OAuthLogin = () => {
  const url = '/auth/oauth2'
  return new URL(url, request.defaults.baseURL).toString()
}

export const getUserInfo = () => {
  return request.post('/user/own')
}

// 获取随机验证码
export const getInviteCode = (key: string) => {
  return request.get('/user/getOneInviteKey', {
    params: {
      key
    }
  })
}

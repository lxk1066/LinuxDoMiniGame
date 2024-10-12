import request from '@/utils/request'

export const OAuthLogin = () => {
  const url = '/auth/oauth2'
  return new URL(url, request.defaults.baseURL).toString()
}

export const getUserInfo = () => {
  return request.post('/user/own')
}

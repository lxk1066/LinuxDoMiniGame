import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { AxiosInstance } from 'axios'
import { useGlobSetting } from './setting'

const { baseUrl } = useGlobSetting()

const request: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('token') || ''
  }
})

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 请求响应报错
    ElMessage.error('网络错误' + JSON.stringify(error))
    return Promise.reject(error)
  }
)

export default request

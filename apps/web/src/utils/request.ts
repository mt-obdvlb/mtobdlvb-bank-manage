import { ElMessage } from 'element-plus'
import axios, { type AxiosResponse } from 'axios'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 5000,
  withCredentials: true, // 自动带 cookie
})

// 请求拦截器
request.interceptors.request.use((config) => {
  return config
})

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 成功响应，直接返回 data 内层
    console.log(response.data)
    return response.data
  },
  (error) => {
    // 失败响应
    let message = '网络错误'
    if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    }
    if (error.response?.status === 401) {
      // 401 错误，跳转到登录页
      window.location.href = '/login'
    }
    // 显示错误消息
    ElMessage.error(message)

    return { code: 1, message }
  }
)

export default request

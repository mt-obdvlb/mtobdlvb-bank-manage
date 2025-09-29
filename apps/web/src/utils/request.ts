import axios, { type AxiosResponse } from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 5000,
  withCredentials: true, // 自动带 cookie
})

// 请求拦截器
api.interceptors.request.use((config) => {
  // 这里不用手动加 token，cookie 会自动带上
  return config
})

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 成功响应，直接返回 data 内层
    return response.data
  },
  (error) => {
    // 失败响应，不抛异常，统一返回 { code: 1, msg }
    let msg = '网络错误'
    if (error.response?.data?.msg) {
      msg = error.response.data.msg
    } else if (error.message) {
      msg = error.message
    }

    return { code: 1, message: msg }
  }
)

export default api

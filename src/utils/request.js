import axios from 'axios'
import { ElMessage } from 'element-plus'

//创建axios实例
const service = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

//公开接口白名单 - 这些接口不需要携带token，也不会因为code=-1而跳转登录页
const publicUrls = ['/user/login', '/user/add']

//判断当前请求是否为公开接口
const isPublicUrl = (url) => {
  return publicUrls.some((publicUrl) => url?.includes(publicUrl))
}

//请求拦截器
service.interceptors.request.use(
  (config) => {
    //在请求发送之前做的事
    const token = localStorage.getItem('token')
    //只有非公开接口才添加token
    if (token && !isPublicUrl(config.url)) {
      //请求头中添加token
      config.headers['token'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

//响应拦截器
service.interceptors.response.use(
  (response) => {
    const { data, config } = response
    //处理后端业务状态码，注意这并非http状态码
    if (data.code === '200') {
      return data.data
    } else {
      //后端业务状态码为-1，用户登录状态超时
      if (data.code === '-1') {
        //如果是非公开接口，才执行跳转登录页逻辑
        if (!isPublicUrl(config.url)) {
          ElMessage.error(data.msg || '登录状态超时，请重新登录')
          //清除用户登录信息（确保同步执行完成）
          localStorage.removeItem('token')
          localStorage.removeItem('userinfo')
          //使用 setTimeout 确保 localStorage 操作完成后再跳转
          setTimeout(() => {
            window.location.href = '/auth/login'
          }, 0)
        }
        return Promise.reject(data)
      } else {
        //非200、非-1的业务错误（如 BUSINESS_ERROR），提示后端返回的错误信息并reject
        const errorMsg = data.msg || data.message || '接口异常，请联系管理员'
        ElMessage.error(errorMsg)
        return Promise.reject(data)
      }
    }
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default service

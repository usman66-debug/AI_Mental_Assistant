import axios from 'axios'
import { ElMessage } from 'element-plus'

//创建axios实例
const service = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

//请求拦截器
service.interceptors.request.use(
  (config) => {
    //在请求发送之前做的事
    const token = localStorage.getItem('token')
    if (token) {
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
        //如果用户没有在登录页，跳转到登陆页
        if (!config.url?.includes('/login')) {
          ElMessage.error(data.msg || '登录登录状态超时，请重新登录')
          //清除用户登录信息
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          //清除用户登录信息后，跳转到登录页
          window.location.href = '/auth/login'
        }
        //非-1的情况，接口异常，提示用户
        else {
          ElMessage.error(data.msg || '接口异常，请联系管理员')
          return Promise.reject('网络请求失败')
        }
      }
    }
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default service

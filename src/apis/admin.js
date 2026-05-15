import service from '@/utils/request'

export const loginApi = (data) => {
  return service.post('/user/login', data)
}

export const categoryTreeApi = () => {
  return service.get('/knowledge/category/tree')
}

export const articlePageApi = (params) => {
  return service.post('/knowledge/article/page', { params })
}

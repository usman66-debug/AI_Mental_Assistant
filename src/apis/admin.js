import service from '@/utils/request'

export const loginApi = (data) => {
  return service.post('/user/login', data)
}

export const categoryTreeApi = () => {
  return service.get('/knowledge/category/tree')
}

export const articlePageApi = (params) => {
  return service.get('/knowledge/article/page', { params })
}

export const uploadAvatarApi = (fileForm, businessId) => {
  const formData = new FormData()

  formData.append('file', fileForm)
  formData.append('businessType', 'ARTICLE')
  formData.append('businessId', businessId)
  formData.append('businessField', 'cover')

  return service.post('file/upload', formData)
}

export const createArticleApi = (data) => {
  return service.post('/knowledge/article', data)
}

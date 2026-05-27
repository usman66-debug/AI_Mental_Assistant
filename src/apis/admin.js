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

export const getArticalDetailApi = (id) => {
  return service.get(`/knowledge/article/${id}`)
}

export const updateArticleApi = (id, data) => {
  return service.put(`/knowledge/article/${id}`, data)
}

export const publishArticleApi = (id, data) => {
  return service.put(`/knowledge/article/${id}/status`, data)
}

export const deleteArticleApi = (id) => {
  return service.delete(`/knowledge/article/${id}`)
}

export const getConsultationPageApi = (params) => {
  return service.get('psychological-chat/sessions', { params })
}

export const getConsultationDetailApi = (id) => {
  return service.get(`psychological-chat/sessions/${id}/messages`)
}

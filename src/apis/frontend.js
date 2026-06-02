import request from '@/utils/request'

export const register = (data) => {
  return request.post('/user/add', data)
}

export const startSession = (data) => {
  return request.post('/psychological-chat/session/start', data)
}

export const getSessionList = ({ params }) => {
  return request.get('/psychological-chat/sessions', { params })
}

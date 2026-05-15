import service from '@/utils/request'

export const loginApi = (data) => {
  return service.post('/user/login', data)
}

import request from '@/utils/request'
import type { ApiResponse, Advertise } from '#/global'

export const getAdvertiseList = () => {
  return request.get<any, ApiResponse<Advertise[]>>('/ad/list')
}

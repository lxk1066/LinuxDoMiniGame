import type { AxiosResponse } from 'axios'

export interface Response<T> {
  code: number
  data: T
  message: string
}

export type ApiResponse<T> = AxiosResponse<Response<T>>

export interface Advertise {
  id: number
  index: number
  title: string
  description: string
  url: string
  content: string
}

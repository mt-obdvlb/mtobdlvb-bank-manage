import type { Result, UserLoginDTO } from '@mtobdvlb/shared-types'
import request from '@/utils/request.ts'

const baseURL = '/users'

const API = {
  login: '/login',
  register: '/register',
} as const

export const userLogin = (body: UserLoginDTO) => request.post<Result>(baseURL + API.login, body)

export const userRegister = (body: UserLoginDTO) =>
  request.post<Result>(baseURL + API.register, body)

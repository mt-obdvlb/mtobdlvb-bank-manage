import type { Result, UserGet, UserLoginDTO, UserRegisterDTO } from '@mtobdvlb/shared-types'
import request from '@/utils/request.ts'

const baseURL = '/users'

const API = {
  login: '/login',
  register: '/register',
  get: '/',
} as const

export const userLogin = (body: UserLoginDTO) => request.post<Result>(baseURL + API.login, body)

export const userRegister = (body: UserRegisterDTO) =>
  request.post<Result>(baseURL + API.register, body)

export const userGet = () => request.get<Result<UserGet>>(baseURL + API.get)

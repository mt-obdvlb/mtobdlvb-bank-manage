import { RequestHandler } from 'express'
import {
  Result,
  UserGet,
  UserLoginDTO,
  UserRegisterDTO,
  UserUpdateDTO,
} from '@mtobdvlb/shared-types'
import { ParamsDictionary } from 'express-serve-static-core'
import { UserService } from '@/service'
import { MESSAGE } from '@/constants'

export const userLogin: RequestHandler<ParamsDictionary, Result, UserLoginDTO> = async (
  req,
  res
) => {
  const { token } = await UserService.login(req.body)
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })
  return res.status(200).json({
    code: 0,
  })
}
export const userLogout: RequestHandler<ParamsDictionary, Result> = async (req, res) => {
  res.clearCookie('token')
  return res.status(200).json({
    code: 0,
  })
}
export const userUpdate: RequestHandler<ParamsDictionary, Result, UserUpdateDTO> = async (
  req,
  res
) => {
  const userId = req.user?.id
  if (!userId)
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })
  await UserService.update(userId, req.body)
  return res.status(200).json({
    code: 0,
  })
}
export const userRegister: RequestHandler<ParamsDictionary, Result, UserRegisterDTO> = async (
  req,
  res
) => {
  await UserService.register(req.body)
  return res.status(200).json({
    code: 0,
  })
}
export const userGet: RequestHandler<ParamsDictionary, Result<UserGet>> = async (req, res) => {
  const userId = req.user?.id
  if (!userId)
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })

  const data = await UserService.get(userId)
  return res.status(200).json({
    code: 0,
    data,
  })
}

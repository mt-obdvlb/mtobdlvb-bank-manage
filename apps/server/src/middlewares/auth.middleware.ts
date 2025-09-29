import { MESSAGE } from '@/constants'
import { verifyToken } from '@/utils'
import { NextFunction, Request, Response } from 'express'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies) {
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })
  }
  const { token } = req.cookies
  if (!token)
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({
      code: 1,
      message: MESSAGE.INVALID_TOKEN,
    })
  }
}

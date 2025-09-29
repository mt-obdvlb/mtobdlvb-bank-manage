import { MESSAGE } from '@/constants'
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express'

export const errorMiddleware: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || MESSAGE.INTERNAL_SERVER_ERROR
  return res.status(statusCode).json({
    code: 1,
    message,
  })
}

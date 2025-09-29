import { MESSAGE } from '@/constants'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod/v4'

type SchemaGroup = {
  body?: z.ZodSchema
  query?: z.ZodSchema
  params?: z.ZodSchema
}

export const validatorMiddleware =
  (schemas: SchemaGroup) => (req: Request, res: Response, next: NextFunction) => {
    console.log(req.query, req.body, req.params)
    if (schemas.body) {
      const bodyResult = schemas.body.safeParse(req.body)
      if (!bodyResult.success) {
        return res.status(400).json({
          code: 1,
          message: bodyResult.error?.message || MESSAGE.INVALID_PARAMS,
        })
      }
      req.body = bodyResult.data
    }

    if (schemas.query) {
      const queryResult = schemas.query.safeParse(req.query)
      console.log(queryResult.error?.message)
      if (!queryResult.success) {
        return res.status(400).json({
          code: 1,
          message: queryResult.error?.message || MESSAGE.INVALID_PARAMS,
        })
      }
      req.body = queryResult.data
    }

    if (schemas.params) {
      const paramsResult = schemas.params.safeParse(req.params)
      if (!paramsResult.success) {
        return res.status(400).json({
          code: 1,
          message: paramsResult.error?.message || MESSAGE.INVALID_PARAMS,
        })
      }
      req.body = paramsResult.data
    }
    next()
  }

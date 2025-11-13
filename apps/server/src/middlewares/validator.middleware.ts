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

    // ------------------------------ 处理body验证 ------------------------------
    if (schemas.body) {
      const bodyResult = schemas.body.safeParse(req.body)
      if (!bodyResult.success) {
        // 提取Zod错误中的message（支持多个错误，用逗号分隔）
        const errMsg = bodyResult.error.issues
          .map((issue) => issue.message) // 取每个错误的message字段
          .join(', ') // 多个错误用逗号拼接
        return res.status(400).json({
          code: 1,
          message: errMsg || MESSAGE.INVALID_PARAMS,
        })
      }
      req.body = bodyResult.data
    }

    // ------------------------------ 处理query验证 ------------------------------
    if (schemas.query) {
      const queryResult = schemas.query.safeParse(req.query)
      console.log(queryResult.error?.message)
      if (!queryResult.success) {
        const errMsg = queryResult.error.issues.map((issue) => issue.message).join(', ')
        return res.status(400).json({
          code: 1,
          message: errMsg || MESSAGE.INVALID_PARAMS,
        })
      }
      // 注意：这里原逻辑是把query解析结果赋值给body，若业务需要可保留，也可改为req.query = queryResult.data
      req.body = queryResult.data
    }

    // ------------------------------ 处理params验证 ------------------------------
    if (schemas.params) {
      const paramsResult = schemas.params.safeParse(req.params)
      if (!paramsResult.success) {
        const errMsg = paramsResult.error.issues.map((issue) => issue.message).join(', ')
        return res.status(400).json({
          code: 1,
          message: errMsg || MESSAGE.INVALID_PARAMS,
        })
      }
      // 同理：原逻辑赋值给body，可根据业务调整为req.params = paramsResult.data
      req.body = paramsResult.data
    }

    next()
  }

import { jwtConfig } from '@/config'
import { MESSAGE } from '@/constants'
import type { JwtPayload } from 'jsonwebtoken'
import * as jwt from 'jsonwebtoken'

export const signToken = (payload: { id: string }) => {
  const expiresIn = jwtConfig.expressIn as jwt.SignOptions['expiresIn']
  return jwt.sign(payload, jwtConfig.secret, { expiresIn })
}

export const verifyToken = (token: string) => {
  try {
    // 新增 try-catch，捕获 JWT 原生错误
    const payload = jwt.verify(token, jwtConfig.secret)

    if (typeof payload === 'string') {
      throw new Error(MESSAGE.INVALID_TOKEN)
    }

    return payload as JwtPayload & { id: string }
  } catch (error) {
    // 捕获所有 JWT 相关错误
    // 判断是否是 JWT 原生错误（格式错误、过期、签名错误）
    if (error instanceof jwt.JsonWebTokenError) {
      // 格式错误/签名错误 → 抛出 INVALID_TOKEN
      if (error.message === 'invalid token' || error.message === 'invalid signature') {
        throw new Error(MESSAGE.INVALID_TOKEN)
      }
      // 过期错误 → 抛出你项目里可能有的“过期错误”（如果没有，也可以用 INVALID_TOKEN）
      if (error.message === 'jwt expired') {
        throw new Error(MESSAGE.TOKEN_EXPIRED || MESSAGE.INVALID_TOKEN)
      }
    }
    // 其他未知错误 → 也抛出 INVALID_TOKEN（避免暴露敏感信息）
    throw new Error(MESSAGE.INVALID_TOKEN)
  }
}

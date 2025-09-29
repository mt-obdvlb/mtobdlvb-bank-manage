import { jwtConfig } from '@/config'
import { MESSAGE } from '@/constants'
import jwt, { JwtPayload } from 'jsonwebtoken'

export const signToken = (payload: { id: string }) => {
  const expiresIn = jwtConfig.expressIn as jwt.SignOptions['expiresIn']
  return jwt.sign(payload, jwtConfig.secret, { expiresIn })
}

export const verifyToken = (token: string) => {
  const payload = jwt.verify(token, jwtConfig.secret)

  if (typeof payload === 'string') {
    throw new Error(MESSAGE.INVALID_TOKEN)
  }

  return payload as JwtPayload & { id: string }
}

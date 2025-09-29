import { UserLoginDTO, UserRegisterDTO, UserUpdateDTO } from '@mtobdvlb/shared-types'
import { prisma } from '@/prisma'
import { comparePassword, hashPassword, signToken } from '@/utils'

export const UserService = {
  /** 用户注册 */
  register: async ({ password, confirmPassword, username }: UserRegisterDTO) => {
    if (password !== confirmPassword) throw new Error('两次密码不一致')

    // 检查用户名是否存在
    const exist = await prisma.user.findUnique({ where: { username } })
    if (exist) throw new Error('用户名已存在')

    const hashed = await hashPassword(password)
    await prisma.user.create({
      data: { username, password: hashed },
    })
  },

  /** 用户登录 */
  login: async ({ username, password }: UserLoginDTO) => {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) throw new Error('用户不存在')

    const valid = await comparePassword(password, user.password)
    if (!valid) throw new Error('密码错误')

    // 生成 JWT
    const token = signToken({ id: user.id.toString() })

    // 返回用户信息 + token
    return { token }
  },

  /** 用户登出 */

  /** 获取用户信息 */
  get: async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } })
    if (!user) throw new Error('用户不存在')

    return {
      createdAt: user.createdAt.toISOString(),
      id: user.id.toString(),
      email: user.email ?? undefined,
      username: user.username,
    }
  },

  /** 更新用户信息 */
  update: async (
    userId: string,
    { email, phone, username, password, confirmPassword }: UserUpdateDTO
  ) => {
    const data: Partial<{
      username: string
      email: string
      phone: string
      password: string
    }> = {}

    if (username) data.username = username
    if (email) data.email = email
    if (phone) data.phone = phone

    // 更新密码
    if (password && confirmPassword) {
      if (password !== confirmPassword) throw new Error('两次密码不一致')
      data.password = await hashPassword(password)
    }

    await prisma.user.update({
      where: { id: Number(userId) },
      data,
    })
  },
}

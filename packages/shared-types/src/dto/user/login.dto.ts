import { z } from 'zod/v4'

export const userLoginDTO = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
})

export type UserLoginDTO = z.infer<typeof userLoginDTO>

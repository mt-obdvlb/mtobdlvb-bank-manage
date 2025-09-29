import { z } from 'zod/v4'

export const accountCreateDTO = z.object({
  name: z.string().min(3, '名称至少3个字符').max(20, '名称最多20个字符'),
  password: z.string().regex(/^\d{6}$/, '支付密码必须为6位数字'),
})

export type AccountCreateDTO = z.infer<typeof accountCreateDTO>

import { z } from 'zod/v4'

export const userUpdateDTO = z
  .object({
    username: z.string().min(3, '名字至少3个字符').max(20, '名字最多20个字符').optional(),
    email: z.email('邮箱格式不正确').optional(),
    password: z
      .string()
      .min(8, '密码至少8个字符')
      .max(50, '密码最多50个字符')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
        '密码必须包含大小写字母、数字和特殊字符'
      )
      .optional(),
    confirmPassword: z.string().optional(),
    phone: z
      .string()
      .regex(/^1[3-9]\d{9}$/, '手机号格式不正确')
      .optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

export type UserUpdateDTO = z.infer<typeof userUpdateDTO>

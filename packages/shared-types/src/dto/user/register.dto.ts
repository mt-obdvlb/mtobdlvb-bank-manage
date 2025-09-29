import { z } from 'zod/v4'

export const userRegisterDTO = z
  .object({
    username: z.string().min(3, '名字至少3个字符').max(20, '名字最多20个字符'),
    password: z
      .string()
      .min(8, '密码至少8个字符')
      .max(50, '密码最多50个字符')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
        '密码必须包含大小写字母、数字和特殊字符'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

export type UserRegisterDTO = z.infer<typeof userRegisterDTO>

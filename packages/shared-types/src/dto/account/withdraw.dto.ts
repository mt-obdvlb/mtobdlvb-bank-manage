import { z } from 'zod/v4'

export const accountWithdrawDTO = z.object({
  amount: z.number().positive('提取金额不能为负数'),
  password: z.string(),
})

export type AccountWithdrawDTO = z.infer<typeof accountWithdrawDTO>

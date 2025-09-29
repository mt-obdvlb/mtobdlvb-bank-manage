import { z } from 'zod/v4'

export const accountDepositDTO = z.object({
  amount: z.number().positive('存款金额不能为负数'),
})

export type AccountDepositDTO = z.infer<typeof accountDepositDTO>

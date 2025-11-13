import { z } from 'zod/v4'

export const accountListTransactionDTO = z.object({
  page: z.string().default('1'),
  pageSize: z.string().default('10'),
})

export type AccountListTransactionDTO = z.infer<typeof accountListTransactionDTO>

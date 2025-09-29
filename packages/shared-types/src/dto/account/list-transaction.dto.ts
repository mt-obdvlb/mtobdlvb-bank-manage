import { z } from 'zod/v4'

export const accountListTransactionDTO = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(10),
})

export type AccountListTransactionDTO = z.infer<typeof accountListTransactionDTO>

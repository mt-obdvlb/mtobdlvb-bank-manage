import { z } from 'zod/v4'

export const accountListDTO = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(10),
})

export type AccountListDTO = z.infer<typeof accountListDTO>

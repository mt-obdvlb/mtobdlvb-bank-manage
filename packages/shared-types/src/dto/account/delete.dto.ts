import { z } from 'zod/v4'

export const accountDeleteDTO = z.object({
  password: z.string(),
})

export type AccountDeleteDTO = z.infer<typeof accountDeleteDTO>

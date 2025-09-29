import { z } from 'zod/v4'

export const accountFreezeDTO = z.object({
  password: z.string(),
})

export type AccountFreezeDTO = z.infer<typeof accountFreezeDTO>

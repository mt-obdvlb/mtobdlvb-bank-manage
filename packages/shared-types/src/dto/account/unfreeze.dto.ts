import { z } from 'zod/v4'

export const accountUnfreezeDTO = z.object({
  password: z.string(),
})

export type AccountUnfreezeDTO = z.infer<typeof accountUnfreezeDTO>

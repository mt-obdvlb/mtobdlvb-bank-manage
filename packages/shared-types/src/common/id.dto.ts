import { z } from 'zod/v4'

export const commonIdDTO = z.object({
  id: z.string(),
})

export type CommonIdDTO = z.infer<typeof commonIdDTO>

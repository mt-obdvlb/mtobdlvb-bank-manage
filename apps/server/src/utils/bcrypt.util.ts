import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export const hashPassword = async (password: string): Promise<string> =>
  await bcrypt.hash(password, SALT_ROUNDS)

export const comparePassword = async (password: string, hashed: string): Promise<boolean> =>
  await bcrypt.compare(password, hashed)

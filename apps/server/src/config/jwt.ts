export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'mtobdvlb',
  expressIn: process.env.JWT_EXPIRES_IN || '10m',
}

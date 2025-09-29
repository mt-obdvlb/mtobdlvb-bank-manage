export const emailConfig = {
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || '1719228313@qq.com',
    pass: process.env.EMAIL_PASS || 'tmdqjgwxpffmdedf',
  },
}

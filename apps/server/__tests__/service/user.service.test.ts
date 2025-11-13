// __tests__/service/user.service.test.ts
import { UserService } from '@/service/user.service'
import { prisma } from '@/prisma'
import { hashPassword } from '@/utils'

describe('UserService（用户服务层）', () => {
  beforeAll(async () => {
    // 清理测试数据库
    await prisma.transaction.deleteMany({})
    await prisma.account.deleteMany({})
    await prisma.user.deleteMany({})
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('register()', () => {
    it('两次密码不一致 → 抛出错误', async () => {
      await expect(
        UserService.register({ username: 'test1', password: '123456', confirmPassword: '654321' })
      ).rejects.toThrow('两次密码不一致')
    })

    it('用户名已存在 → 抛出错误', async () => {
      // 先创建一个用户
      await prisma.user.create({
        data: { username: 'test2', password: await hashPassword('123456') },
      })

      await expect(
        UserService.register({ username: 'test2', password: '123456', confirmPassword: '123456' })
      ).rejects.toThrow('用户名已存在')
    })

    it('正常注册 → 成功', async () => {
      await expect(
        UserService.register({ username: 'test3', password: '123456', confirmPassword: '123456' })
      ).resolves.toBeUndefined()

      const user = await prisma.user.findUnique({ where: { username: 'test3' } })
      expect(user).toBeDefined()
      expect(user?.username).toBe('test3')
    })
  })

  describe('login()', () => {
    beforeAll(async () => {
      // 确保用户存在
      await prisma.user.create({
        data: { username: 'loginUser', password: await hashPassword('123456') },
      })
    })

    it('用户不存在 → 抛出错误', async () => {
      await expect(UserService.login({ username: 'notexist', password: '123456' })).rejects.toThrow(
        '用户不存在'
      )
    })

    it('密码错误 → 抛出错误', async () => {
      await expect(UserService.login({ username: 'loginUser', password: 'wrong' })).rejects.toThrow(
        '密码错误'
      )
    })

    it('正常登录 → 返回 token', async () => {
      const res = await UserService.login({ username: 'loginUser', password: '123456' })
      expect(res.token).toBeDefined()
      expect(typeof res.token).toBe('string')
    })
  })

  describe('get()', () => {
    let userId: string

    beforeAll(async () => {
      const user = await prisma.user.create({
        data: { username: 'getUser', password: await hashPassword('123456') },
      })
      userId = user.id.toString()
    })

    it('用户不存在 → 抛出错误', async () => {
      await expect(UserService.get('999999')).rejects.toThrow('用户不存在')
    })

    it('正常获取 → 返回用户信息', async () => {
      const res = await UserService.get(userId)
      expect(res.id).toBe(userId)
      expect(res.username).toBe('getUser')
      expect(res.createdAt).toBeDefined()
    })
  })

  describe('update()', () => {
    let userId: string

    beforeAll(async () => {
      const user = await prisma.user.create({
        data: { username: 'updateUser', password: await hashPassword('123456') },
      })
      userId = user.id.toString()
    })

    it('两次密码不一致 → 抛出错误', async () => {
      await expect(
        UserService.update(userId, { password: '111111', confirmPassword: '222222' })
      ).rejects.toThrow('两次密码不一致')
    })

    it('正常更新 → 成功修改用户名和电话', async () => {
      await UserService.update(userId, { username: 'updated', phone: '1234567890' })
      const user = await prisma.user.findUnique({ where: { id: Number(userId) } })
      expect(user?.username).toBe('updated')
      expect(user?.phone).toBe('1234567890')
    })

    it('正常更新密码 → 成功', async () => {
      await UserService.update(userId, { password: '654321', confirmPassword: '654321' })
      const user = await prisma.user.findUnique({ where: { id: Number(userId) } })
      expect(user).toBeDefined()
      expect(user?.password).not.toBe('654321') // 密码已加密
    })
  })
})

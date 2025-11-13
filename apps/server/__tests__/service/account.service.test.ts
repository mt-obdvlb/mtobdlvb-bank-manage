// __tests__/service/account.service.int.test.ts
import { prisma } from '@/prisma/client'
import { AccountService } from '@/service/account.service'
import bcrypt from 'bcrypt'

describe('AccountService（账户服务层）- 集成测试', () => {
  let userId: string

  beforeAll(async () => {
    // 确保数据库干净
    await prisma.transaction.deleteMany({})
    await prisma.account.deleteMany({})
    await prisma.user.deleteMany({})

    // 创建测试用户
    const user = await prisma.user.create({
      data: { username: 'user1', password: await bcrypt.hash('password1', 10) },
    })
    userId = String(user.id)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await prisma.transaction.deleteMany({})
    await prisma.account.deleteMany({})
  })

  it('create() - 密码非6位数字 → 抛出错误', async () => {
    await expect(AccountService.create(userId, { name: 'acc1', password: '123' })).rejects.toThrow(
      '账户密码必须为 6 位数字'
    )
  })

  it('create() - 正常创建 → 成功', async () => {
    await expect(
      AccountService.create(userId, { name: 'acc1', password: '123456' })
    ).resolves.toBeUndefined()

    const acc = await prisma.account.findUnique({ where: { name: 'acc1' } })
    expect(acc).not.toBeNull()
    expect(acc?.balance).toBe(0)
  })

  it('create() - 账户名已被占用 → 抛出错误', async () => {
    await prisma.account.create({
      data: {
        userId: Number(userId),
        name: 'acc1',
        password: await bcrypt.hash('123456', 10),
      },
    })

    await expect(
      AccountService.create(userId, { name: 'acc1', password: '123456' })
    ).rejects.toThrow('账户名已被占用')
  })

  it('deposit() - 存款金额 ≤ 0 → 抛出错误', async () => {
    const account = await prisma.account.create({
      data: { userId: Number(userId), name: 'acc2', password: await bcrypt.hash('123456', 10) },
    })

    await expect(AccountService.deposit(userId, { amount: 0 }, String(account.id))).rejects.toThrow(
      '存款金额必须大于 0'
    )
  })

  it('deposit() - 正常存款 → 成功', async () => {
    const account = await prisma.account.create({
      data: { userId: Number(userId), name: 'acc3', password: await bcrypt.hash('123456', 10) },
    })

    await AccountService.deposit(userId, { amount: 100 }, String(account.id))

    const updated = await prisma.account.findUnique({ where: { id: account.id } })
    expect(updated?.balance).toBe(100)

    const txs = await prisma.transaction.findMany({ where: { accountId: account.id } })
    expect(txs.length).toBe(1)
    expect(txs[0]!.type).toBe('deposit')
    expect(txs[0]!.amount).toBe(100)
  })

  it('withdraw() - 金额 ≤ 0 → 抛出错误', async () => {
    const account = await prisma.account.create({
      data: { userId: Number(userId), name: 'acc4', password: await bcrypt.hash('123456', 10) },
    })

    await expect(
      AccountService.withdraw(userId, { amount: 0, password: '123456' }, String(account.id))
    ).rejects.toThrow('取款金额必须大于 0')
  })

  it('withdraw() - 正常提现 → 成功', async () => {
    const account = await prisma.account.create({
      data: {
        userId: Number(userId),
        name: 'acc5',
        password: await bcrypt.hash('123456', 10),
        balance: 200,
      },
    })

    await AccountService.withdraw(userId, { amount: 100, password: '123456' }, String(account.id))

    const updated = await prisma.account.findUnique({ where: { id: account.id } })
    expect(updated?.balance).toBe(100)

    const txs = await prisma.transaction.findMany({ where: { accountId: account.id } })
    expect(txs.length).toBe(1)
    expect(txs[0]!.type).toBe('withdraw')
    expect(txs[0]!.amount).toBe(100)
  })

  it('getBalance() - 获取余额 → 正确返回', async () => {
    const account = await prisma.account.create({
      data: {
        userId: Number(userId),
        name: 'acc6',
        password: await bcrypt.hash('123456', 10),
        balance: 500,
      },
    })

    const balance = await AccountService.getBalance(userId, String(account.id))
    expect(balance).toBe(500)
  })

  it('delete() - 正常销户 → 成功', async () => {
    const account = await prisma.account.create({
      data: {
        userId: Number(userId),
        name: 'acc7',
        password: await bcrypt.hash('123456', 10),
        balance: 0,
      },
    })

    await expect(
      AccountService.delete(userId, { password: '123456' }, String(account.id))
    ).resolves.toBeUndefined()

    const deleted = await prisma.account.findUnique({ where: { id: account.id } })
    expect(deleted).toBeNull()
  })

  it('freeze/unfreeze() → 正确切换状态', async () => {
    const account = await prisma.account.create({
      data: { userId: Number(userId), name: 'acc8', password: await bcrypt.hash('123456', 10) },
    })

    await AccountService.freeze(userId, { password: '123456' }, String(account.id))
    let updated = await prisma.account.findUnique({ where: { id: account.id } })
    expect(updated?.status).toBe('frozen')

    await AccountService.unfreeze(userId, { password: '123456' }, String(account.id))
    updated = await prisma.account.findUnique({ where: { id: account.id } })
    expect(updated?.status).toBe('active')
  })
})

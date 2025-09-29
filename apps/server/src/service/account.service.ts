// src/services/account.service.ts
import { prisma } from '@/prisma/client'
import bcrypt from 'bcrypt'
import {
  AccountCreateDTO,
  AccountDeleteDTO,
  AccountDepositDTO,
  AccountFreezeDTO,
  AccountListDTO,
  AccountListItem,
  AccountListTransactionDTO,
  AccountListTransactionItem,
  AccountStatus,
  AccountUnfreezeDTO,
  AccountWithdrawDTO,
  TransactionType,
} from '@mtobdvlb/shared-types'
import { comparePassword } from '@/utils'

const ensureNumber = (v: string, name = 'id') => {
  const n = Number(v)
  if (!Number.isFinite(n) || Number.isNaN(n)) throw new Error(`${name} 非法`)
  return n
}

const ensureOwnership = async (userIdNum: number, accountIdNum: number) => {
  const account = await prisma.account.findUnique({ where: { id: accountIdNum } })
  if (!account) throw new Error('账户不存在')
  if (account.userId !== userIdNum) throw new Error('无权限操作该账户')
  return account
}

export const AccountService = {
  create: async (userId: string, { password, name }: AccountCreateDTO): Promise<void> => {
    const userIdNum = ensureNumber(userId, 'userId')

    if (!/^\d{6}$/.test(password)) throw new Error('账户密码必须为 6 位数字')

    const user = await prisma.user.findUnique({ where: { id: userIdNum } })
    if (!user) throw new Error('用户不存在')

    const existName = await prisma.account.findUnique({ where: { name } })
    if (existName) throw new Error('账户名已被占用')

    const hashed = await bcrypt.hash(password, 10)

    await prisma.account.create({
      data: {
        userId: userIdNum,
        name,
        password: hashed,
        balance: 0,
        status: 'active',
        updatedAt: new Date(),
      },
    })
  },

  list: async (
    userId: string,
    { page = 1, pageSize = 20 }: AccountListDTO
  ): Promise<{ list: AccountListItem[]; total: number }> => {
    const userIdNum = ensureNumber(userId, 'userId')
    const p = Math.max(1, Math.floor(Number(page) || 1))
    const size = Math.min(100, Math.max(1, Math.floor(Number(pageSize) || 20)))

    const [accounts, total] = await prisma.$transaction([
      prisma.account.findMany({
        where: { userId: userIdNum },
        orderBy: { updatedAt: 'desc' },
        skip: (p - 1) * size,
        take: size,
        select: {
          id: true,
          status: true,
          updatedAt: true,
          name: true,
        },
      }),
      prisma.account.count({ where: { userId: userIdNum } }),
    ])

    const list: AccountListItem[] = accounts.map(
      (a: { id: number; status: string; updatedAt: Date; name: string }): AccountListItem => ({
        id: String(a.id),
        status: a.status as AccountStatus,
        updateAt: a.updatedAt.toISOString(),
        name: a.name,
      })
    )

    return { list, total }
  },

  listTransaction: async (
    userId: string,
    { page = 1, pageSize = 20 }: AccountListTransactionDTO,
    id: string
  ): Promise<{ list: AccountListTransactionItem[]; total: number }> => {
    const userIdNum = ensureNumber(userId, 'userId')
    const accountIdNum = ensureNumber(id, 'accountId')

    await ensureOwnership(userIdNum, accountIdNum)

    const p = Math.max(1, Math.floor(Number(page) || 1))
    const size = Math.min(100, Math.max(1, Math.floor(Number(pageSize) || 20)))

    const [txs, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where: { accountId: accountIdNum },
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * size,
        take: size,
        select: { id: true, amount: true, createdAt: true, type: true },
      }),
      prisma.transaction.count({ where: { accountId: accountIdNum } }),
    ])

    const list: AccountListTransactionItem[] = txs.map(
      (t: {
        id: number
        amount: number
        createdAt: Date
        type: string
      }): AccountListTransactionItem => ({
        id: String(t.id),
        amount: t.amount,
        createdAt: t.createdAt.toISOString(),
        type: t.type as TransactionType,
      })
    )

    return { list, total }
  },

  withdraw: async (
    userId: string,
    { password, amount }: AccountWithdrawDTO,
    id: string
  ): Promise<void> => {
    const userIdNum = ensureNumber(userId, 'userId')
    const accountIdNum = ensureNumber(id, 'accountId')
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) throw new Error('取款金额必须大于 0')

    await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { id: accountIdNum } })
      if (!account) throw new Error('账户不存在')
      if (account.userId !== userIdNum) throw new Error('无权限操作该账户')

      const ok = await bcrypt.compare(password, account.password)
      if (!ok) throw new Error('账户密码错误')

      if (account.status === 'frozen') throw new Error('账户已冻结，无法取款')
      if (account.balance < amt) throw new Error('余额不足')

      await tx.account.update({
        where: { id: accountIdNum },
        data: {
          balance: { decrement: amt },
          updatedAt: new Date(),
        },
      })

      await tx.transaction.create({
        data: {
          accountId: accountIdNum,
          type: 'withdraw',
          amount: amt,
        },
      })
    })
  },

  deposit: async (userId: string, { amount }: AccountDepositDTO, id: string): Promise<void> => {
    const userIdNum = ensureNumber(userId, 'userId')
    const accountIdNum = ensureNumber(id, 'accountId')
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) throw new Error('存款金额必须大于 0')

    await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { id: accountIdNum } })
      if (!account) throw new Error('账户不存在')
      if (account.userId !== userIdNum) throw new Error('无权限操作该账户')

      if (account.status === 'frozen') throw new Error('账户已冻结，无法存款')

      await tx.account.update({
        where: { id: accountIdNum },
        data: {
          balance: { increment: amt },
          updatedAt: new Date(),
        },
      })

      await tx.transaction.create({
        data: {
          accountId: accountIdNum,
          type: 'deposit',
          amount: amt,
        },
      })
    })
  },

  getBalance: async (userId: string, id: string): Promise<number> => {
    const userIdNum = ensureNumber(userId, 'userId')
    const accountIdNum = ensureNumber(id, 'accountId')
    const account = await ensureOwnership(userIdNum, accountIdNum)
    return account.balance
  },

  freeze: async (userId: string, { password }: AccountFreezeDTO, id: string): Promise<void> => {
    const userIdNum = ensureNumber(userId, 'userId')
    const accountIdNum = ensureNumber(id, 'accountId')

    const account = await prisma.account.findUnique({ where: { id: accountIdNum } })
    if (!account) throw new Error('账户不存在')
    if (account.userId !== userIdNum) throw new Error('无权限操作该账户')

    const ok = await bcrypt.compare(password, account.password)
    if (!ok) throw new Error('账户密码错误')

    if (account.status === 'frozen') return

    await prisma.account.update({
      where: { id: accountIdNum },
      data: { status: 'frozen', updatedAt: new Date() },
    })
  },

  unfreeze: async (userId: string, { password }: AccountUnfreezeDTO, id: string): Promise<void> => {
    const userIdNum = ensureNumber(userId, 'userId')
    const accountIdNum = ensureNumber(id, 'accountId')

    const account = await prisma.account.findUnique({ where: { id: accountIdNum } })
    if (!account) throw new Error('账户不存在')
    if (account.userId !== userIdNum) throw new Error('无权限操作该账户')

    const ok = await bcrypt.compare(password, account.password)
    if (!ok) throw new Error('账户密码错误')

    if (account.status === 'active') return

    await prisma.account.update({
      where: { id: accountIdNum },
      data: { status: 'active', updatedAt: new Date() },
    })
  },

  delete: async (userId: string, { password }: AccountDeleteDTO, id: string): Promise<void> => {
    const userIdNum = ensureNumber(userId, 'userId')
    const accountIdNum = ensureNumber(id, 'accountId')

    const account = await prisma.account.findUnique({ where: { id: accountIdNum } })
    if (!account) throw new Error('账户不存在')
    if (account.userId !== userIdNum) throw new Error('无权限操作该账户')
    if (!(await comparePassword(password, account.password))) throw new Error('账户密码错误')
    if (account.balance !== 0) throw new Error('销户前请确保账户余额为 0')

    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { accountId: accountIdNum } }),
      prisma.account.delete({ where: { id: accountIdNum } }),
    ])
  },
}

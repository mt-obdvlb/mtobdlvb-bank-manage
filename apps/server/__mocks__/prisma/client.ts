// __mocks__/prisma/client.ts
const mockAccount = {
  id: 2001,
  userId: 1001,
  password: 'hashed',
  balance: 1000,
  status: 'active',
  updatedAt: new Date(),
  name: '测试账户',
}

export const prisma = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(async (arg: any) => {
    if (Array.isArray(arg)) return arg
    return arg({
      account: {
        findUnique: jest.fn().mockResolvedValue(mockAccount),
        create: jest.fn().mockResolvedValue(mockAccount),
        update: jest.fn().mockResolvedValue(mockAccount),
        delete: jest.fn().mockResolvedValue(mockAccount),
      },
      transaction: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    })
  }),
  account: {
    findUnique: jest.fn().mockResolvedValue(mockAccount),
    create: jest.fn().mockResolvedValue(mockAccount),
    update: jest.fn().mockResolvedValue(mockAccount),
    delete: jest.fn().mockResolvedValue(mockAccount),
  },
  transaction: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
}

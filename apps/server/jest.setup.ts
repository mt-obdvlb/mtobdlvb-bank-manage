// apps/server/jest.setup.ts（无 global 版本）
import { prisma } from './src'

// 1. 测试专用常量（直接定义，不挂全局）
export const TEST_USER = {
  username: 'test_bank_user',
  email: 'test_bank_user@example.com',
  password: '123456', // 原始密码
  phone: '13800138000',
}
export const TEST_ACCOUNT = {
  name: 'test_bank_account_001',
  password: '123456', // 6位账户密码
  balance: 2000.0,
  status: 'active',
}

// 2. 所有测试前：初始化数据库（清空+插测试数据）
beforeAll(async () => {
  try {
    // 按外键顺序删数据
    await prisma.transaction.deleteMany({ where: {} })
    await prisma.account.deleteMany({ where: {} })
    await prisma.user.deleteMany({ where: {} })

    console.log('✅ 测试数据库初始化完成')
  } catch (error) {
    console.error('❌ 数据库初始化失败：', error)
    throw error
  }
})

// 3. 每个测试后：清临时交易记录
afterEach(async () => {
  try {
    await prisma.transaction.deleteMany({
      where: { account: { name: TEST_ACCOUNT.name } },
    })
  } catch (error) {
    console.error('❌ 测试后数据清理失败：', error)
    throw error
  }
})

// 4. 所有测试后：关Prisma连接
afterAll(async () => {
  try {
    await prisma.$disconnect()
    console.log('✅ 测试结束：关闭Prisma连接')
  } catch (error) {
    console.error('❌ 关闭Prisma连接失败：', error)
    throw error
  }
})

// 导出Prisma实例，供测试文件导入

// 导入待测试的bcrypt工具类（路径与项目结构严格对应）
import { comparePassword, hashPassword } from '@/utils'
// 从jest.setup.ts导入测试常量，避免重复定义
import { TEST_USER } from '../../jest.setup'

// 测试套件：描述当前测试的模块（中文提示，明确测试范围）
describe('Utils: bcrypt.util（密码加密与验证功能测试）', () => {
  // 测试用原始密码（复用测试用户密码，贴合真实业务场景）
  const rawPassword = TEST_USER.password
  // 存储加密后的密码，供多个用例复用，减少重复计算
  let hashedPassword: string

  // 测试用例1：验证密码加密功能正常，返回非空加密串
  it('hashPassword函数应成功生成非空的加密密码字符串', async () => {
    // 执行加密函数，获取结果
    hashedPassword = await hashPassword(rawPassword)

    // 断言：加密结果需满足4个核心条件
    expect(hashedPassword).toBeDefined() // 条件1：加密结果不能为undefined
    expect(typeof hashedPassword).toBe('string') // 条件2：加密结果必须是字符串类型
    expect(hashedPassword.length).toBeGreaterThan(0) // 条件3：加密结果不能是空串
    expect(hashedPassword).not.toBe(rawPassword) // 条件4：加密结果不能与原始密码一致（防止明文存储）
  })

  // 测试用例2：验证正确密码与加密密码对比时，返回true
  it('comparePassword函数：输入正确原始密码时，应返回true（验证成功）', async () => {
    // 用原始密码与加密密码执行对比
    const isMatch = await comparePassword(rawPassword, hashedPassword)

    // 断言：正确密码对比结果必须为true
    expect(isMatch).toBe(true)
  })

  // 测试用例3：验证错误密码与加密密码对比时，返回false
  it('comparePassword函数：输入错误原始密码时，应返回false（验证失败）', async () => {
    // 模拟用户输入的错误密码
    const wrongPassword = 'WrongTestPass123'

    // 用错误密码与加密密码执行对比
    const isMatch = await comparePassword(wrongPassword, hashedPassword)

    // 断言：错误密码对比结果必须为false
    expect(isMatch).toBe(false)
  })

  // 测试用例4：验证边界场景（特殊字符/空密码）下加密与对比正常
  it('边界场景测试：特殊字符密码、空密码应能正常加密和验证', async () => {
    // 子场景1：纯特殊字符密码（模拟用户使用特殊符号作为密码）
    const specialCharPassword = '!@#$%^&*()_+'
    const hashedSpecial = await hashPassword(specialCharPassword)
    expect(await comparePassword(specialCharPassword, hashedSpecial)).toBe(true) // 正确对比应成功
    expect(await comparePassword('wrongSpecial123', hashedSpecial)).toBe(false) // 错误对比应失败

    // 子场景2：空字符串密码（模拟用户误输入空密码的异常场景）
    const emptyPassword = ''
    const hashedEmpty = await hashPassword(emptyPassword)
    expect(await comparePassword(emptyPassword, hashedEmpty)).toBe(true) // 正确对比应成功
    expect(await comparePassword('notEmptyPass', hashedEmpty)).toBe(false) // 错误对比应失败
  })
})

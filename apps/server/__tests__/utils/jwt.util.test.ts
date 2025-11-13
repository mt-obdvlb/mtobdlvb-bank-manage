// 导入待测试的JWT工具类
import { signToken, verifyToken } from '@/utils'
// 导入项目JWT配置（确保测试用配置与业务代码一致）
import { jwtConfig } from '@/config'
// 导入项目错误信息常量（确保断言的错误信息与业务逻辑匹配）
import { MESSAGE } from '../../src'
// 导入jsonwebtoken库，用于辅助验证Token格式
import jwt from 'jsonwebtoken'

// 测试套件：明确测试模块与核心功能
describe('Utils: jwt.util（Token生成与验证功能测试）', () => {
  // 测试用Payload（格式与业务代码要求的{id: string}严格对齐，模拟真实用户ID）
  const testPayload = { id: 'test_user_123' }
  // 存储生成的Token，供多个用例复用
  let generatedToken: string

  // 测试用例1：验证Token生成功能正常，格式与内容符合要求
  it('signToken函数应生成格式正确、包含有效Payload的Token', async () => {
    // 执行Token生成函数
    generatedToken = signToken(testPayload)

    // 断言1：验证Token基础格式（JWT标准的“三段式”结构：header.payload.signature）
    expect(generatedToken).toBeDefined()
    expect(typeof generatedToken).toBe('string')
    expect(generatedToken.split('.').length).toBe(3)

    // 断言2：解析Token，验证内部Payload和过期时间
    const decodedToken = jwt.decode(generatedToken) as jwt.JwtPayload
    expect(decodedToken.id).toBe(testPayload.id) // Payload中的用户ID与原始输入一致
    expect(decodedToken.exp).toBeDefined() // Token包含过期时间字段（exp，JWT标准）
    expect(decodedToken.exp).toBeGreaterThan(Math.floor(Date.now() / 1000)) // Token未过期（exp > 当前时间戳）
  })

  // 测试用例2：验证有效Token能被正确解析，返回包含用户ID的Payload
  it('verifyToken函数：解析有效Token时，应返回包含用户ID的Payload对象', async () => {
    // 执行Token验证函数
    const verifiedPayload = verifyToken(generatedToken)

    // 断言：验证返回的Payload格式与内容
    expect(verifiedPayload).toBeDefined()
    expect(typeof verifiedPayload).toBe('object') // 符合业务代码返回类型（JwtPayload & {id: string}）
    expect(verifiedPayload.id).toBe(testPayload.id) // 用户ID与原始Payload一致
    expect(verifiedPayload.exp).toBeDefined() // 包含过期时间字段
  })

  // 测试用例3：验证伪造Token（格式错误）时，抛出自定义无效Token错误
  it('verifyToken函数：解析伪造Token（格式错误）时，应抛出INVALID_TOKEN错误', async () => {
    // 模拟格式错误的伪造Token（不符合JWT三段式结构）
    const fakeToken = 'fake.token.123'

    // 断言：执行验证时应抛出自定义的“无效Token”错误
    await expect(() => verifyToken(fakeToken)).toThrowError(MESSAGE.INVALID_TOKEN)
  })

  // 测试用例4：验证过期Token时，抛出对应的过期错误
  it('verifyToken函数：解析过期Token时，应抛出Token过期错误（或INVALID_TOKEN）', async () => {
    // 生成“立即过期”的Token（expiresIn设为-1秒，模拟过期场景）
    const expiredToken = jwt.sign(testPayload, jwtConfig.secret, { expiresIn: '-1s' })

    // 断言：执行验证时应抛出“登录信息已过期，请重新登录”错误（或业务代码定义的过期错误常量）
    // 注：若业务代码将过期错误统一映射为INVALID_TOKEN，可将断言改为MESSAGE.INVALID_TOKEN
    await expect(() => verifyToken(expiredToken)).toThrowError('登录信息已过期，请重新登录')
  })

  // 测试用例5：验证签名错误的Token（用错密钥）时，抛出自定义无效Token错误
  it('verifyToken函数：解析签名错误的Token（错误密钥）时，应抛出INVALID_TOKEN错误', async () => {
    // 用错误密钥生成Token（模拟黑客伪造签名的场景）
    const wrongSecretToken = jwt.sign(
      testPayload,
      'wrong-secret-key-123', // 与业务代码的jwtConfig.secret不一致
      { expiresIn: '1h' }
    )

    // 断言：执行验证时应抛出自定义的“无效Token”错误
    await expect(() => verifyToken(wrongSecretToken)).toThrowError(MESSAGE.INVALID_TOKEN)
  })
})

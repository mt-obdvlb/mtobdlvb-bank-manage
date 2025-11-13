// __tests__/middlewares/auth.middleware.test.ts
import { NextFunction, Request, Response } from 'express'
// 导入待测试的认证中间件
import { authMiddleware } from '@/middlewares'
// 导入JWT工具类（生成测试用Token）
import { signToken } from '@/utils'
// 导入错误信息常量（匹配业务代码的错误提示）
import { MESSAGE } from '@/constants'
// 导入jsonwebtoken（生成过期/错误签名Token）
import * as jwt from 'jsonwebtoken'
// 导入JWT配置（确保测试用密钥与业务一致）
import { jwtConfig } from '@/config'

// 1. 模拟Express的req、res、next（中间件测试核心：模拟请求上下文）
const mockReq: Request & { [key: string]: any } = {} as Request & { [key: string]: any }
const mockRes = {
  status: jest.fn().mockReturnThis(), // 支持链式调用：res.status(401).json(...)
  json: jest.fn(),
} as unknown as Response
const mockNext = jest.fn() as NextFunction

// 测试套件：认证中间件全场景测试
describe('Middlewares: auth.middleware（Cookie Token认证中间件）', () => {
  // 每个测试用例前重置模拟数据（避免用例间干扰）
  beforeEach(() => {
    jest.clearAllMocks() // 清空res.status、res.json、next的调用记录
    // 重置req对象（删除上一个用例挂载的属性）
    Object.keys(mockReq).forEach((key) => delete mockReq[key])
  })

  // 测试用例2：有Cookie但无Token → 返回401 + "请先登录"
  it('有Cookie但无token时，应返回401状态码和AUTH_ERROR提示', async () => {
    // 模拟：req有cookies，但cookies里没有token
    mockReq.cookies = {} // 空Cookie对象
    // 或模拟：cookies有其他字段但无token → mockReq.cookies = { username: "test" }

    // 执行中间件
    await authMiddleware(mockReq, mockRes, mockNext)

    // 断言：响应符合预期
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 1,
      message: MESSAGE.AUTH_ERROR, // "请先登录"
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  // 测试用例3：有Token但Token无效（伪造Token）→ 返回401 + "登录信息已过期，请重新登录"
  it('Cookie中有无效Token（伪造）时，应返回401和INVALID_TOKEN提示', async () => {
    // 模拟：req有cookies，且包含伪造的token
    mockReq.cookies = { token: 'fake-token-123456' } // 格式错误的伪造Token

    // 执行中间件
    await authMiddleware(mockReq, mockRes, mockNext)

    // 断言：响应符合预期
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 1,
      message: MESSAGE.INVALID_TOKEN, // "登录信息已过期，请重新登录"
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  // 测试用例4：有Token但Token过期 → 返回401 + "登录信息已过期，请重新登录"
  it('Cookie中有过期Token时，应返回401和INVALID_TOKEN提示', async () => {
    // 生成“立即过期”的Token（expiresIn设为-1秒，模拟过期场景）
    const expiredToken = jwt.sign(
      { id: 'test-user-123' },
      jwtConfig.secret,
      { expiresIn: '-1s' } // 过期时间：1秒前
    )

    // 模拟：req的Cookie中包含过期Token
    mockReq.cookies = { token: expiredToken }

    // 执行中间件
    await authMiddleware(mockReq, mockRes, mockNext)

    // 断言：响应符合预期
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 1,
      message: MESSAGE.INVALID_TOKEN, // "登录信息已过期，请重新登录"
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  // 测试用例5：有Token且Token有效 → 挂载user到req + 执行next（通过认证）
  it('Cookie中有有效Token时，应挂载user到req并执行next（通过认证）', async () => {
    // 生成有效Token（用业务代码的signToken，确保格式正确）
    const testUserId = 'valid-user-456'
    const validToken = signToken({ id: testUserId })

    // 模拟：req的Cookie中包含有效Token
    mockReq.cookies = { token: validToken }

    // 执行中间件
    await authMiddleware(mockReq, mockRes, mockNext)

    // 断言1：未调用res.status和res.json（无错误响应）
    expect(mockRes.status).not.toHaveBeenCalled()
    expect(mockRes.json).not.toHaveBeenCalled()

    // 断言2：req上成功挂载user属性，且user.id与Token中的一致
    expect(mockReq.user).toBeDefined()
    expect(mockReq.user?.id).toBe(testUserId) // 匹配生成Token时的用户ID

    // 断言3：执行了next函数（进入后续业务逻辑）
    expect(mockNext).toHaveBeenCalledTimes(1)
  })
})

// 用@别名导入依赖
import { NextFunction, Request, Response } from 'express'
import { validatorMiddleware } from '@/middlewares/validator.middleware'
import { z } from 'zod/v4'

// 1. 定义测试用的Zod Schema（模拟真实业务校验规则）
const TestBodySchema = z.object({
  username: z.string().min(3, '用户名至少3个字符'), // 用户名必填+最小长度
  password: z.string().min(6, '密码至少6个字符'), // 密码必填+最小长度
})
const TestQuerySchema = z.object({
  page: z.coerce.number().int().positive('页码必须是正整数'), // 页码必须是正整数
  size: z.coerce.number().int().positive('每页条数必须是正整数'), // 每页条数必须是正整数
})
const TestParamsSchema = z.object({
  userId: z.string().regex(/^[0-9a-f]{24}$/, '用户ID格式错误'), // MongoDB ID格式校验
})

// 2. 初始化mock对象（避免undefined，无类型错）
const mockReq: Request = {
  body: {},
  query: {},
  params: {},
} as Request
const mockRes = {
  status: jest.fn().mockReturnThis(), // 支持链式调用
  json: jest.fn(),
} as unknown as Response
const mockNext = jest.fn() as NextFunction

// 测试套件：Zod验证中间件
describe('Middlewares: validator.middleware（Zod参数验证中间件）', () => {
  // 每个用例前重置mock状态
  beforeEach(() => {
    jest.clearAllMocks()
    // 重置req的body/query/params为初始空对象
    mockReq.body = {}
    mockReq.query = {}
    mockReq.params = {}
  })

  // ------------------------------ body验证场景 ------------------------------
  // 用例1：body参数符合Schema → 验证通过，执行next
  it('body参数符合Schema时，验证通过并执行next', () => {
    // 模拟合法的body参数
    mockReq.body = { username: 'test123', password: '123456' }
    // 创建验证中间件（传入body Schema）
    const middleware = validatorMiddleware({ body: TestBodySchema })

    // 执行中间件
    middleware(mockReq, mockRes, mockNext)

    // 断言：无错误响应，执行next
    expect(mockRes.status).not.toHaveBeenCalled()
    expect(mockRes.json).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalledTimes(1)
    // 断言：req.body被更新为Schema解析后的数据（确保类型安全）
    expect(mockReq.body).toEqual({ username: 'test123', password: '123456' })
  })

  // 用例2：body参数不符合Schema → 返回400+错误信息
  it('body参数不符合Schema时，返回400和Zod错误信息', () => {
    // 模拟非法的body参数（密码长度不够）
    mockReq.body = { username: 'test', password: '123' }
    const middleware = validatorMiddleware({ body: TestBodySchema })

    middleware(mockReq, mockRes, mockNext)

    // 断言：返回400，错误信息匹配Zod定义
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 1,
      message: '密码至少6个字符', // 匹配Zod的自定义错误提示
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  // ------------------------------ query验证场景 ------------------------------
  // 用例3：query参数符合Schema → 验证通过，执行next
  it('query参数符合Schema时，验证通过并执行next', () => {
    // 模拟合法的query参数（注意：req.query默认是字符串，Zod会自动转换类型）
    mockReq.query = { page: '1', size: '10' }
    const middleware = validatorMiddleware({ query: TestQuerySchema })

    middleware(mockReq, mockRes, mockNext)

    expect(mockRes.status).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalledTimes(1)
    // 断言：req.body被更新为解析后的数字类型（中间件逻辑：query解析后赋值给body）
    expect(mockReq.body).toEqual({ page: 1, size: 10 })
  })

  // 用例4：query参数不符合Schema → 返回400+错误信息
  it('query参数不符合Schema时，返回400和Zod错误信息', () => {
    // 模拟非法的query参数（页码为负数）
    mockReq.query = { page: '-1', size: '10' }
    const middleware = validatorMiddleware({ query: TestQuerySchema })

    middleware(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 1,
      message: '页码必须是正整数', // 匹配Zod错误提示
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  // ------------------------------ params验证场景 ------------------------------
  // 用例5：params参数符合Schema → 验证通过，执行next
  it('params参数符合Schema时，验证通过并执行next', () => {
    // 模拟合法的params参数（MongoDB ID格式）
    mockReq.params = { userId: '60d21b4667d0d8992e610c85' }
    const middleware = validatorMiddleware({ params: TestParamsSchema })

    middleware(mockReq, mockRes, mockNext)

    expect(mockRes.status).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalledTimes(1)
    // 断言：req.body被更新为解析后的params数据（中间件逻辑：params解析后赋值给body）
    expect(mockReq.body).toEqual({ userId: '60d21b4667d0d8992e610c85' })
  })

  // 用例6：params参数不符合Schema → 返回400+错误信息
  it('params参数不符合Schema时，返回400和Zod错误信息', () => {
    // 模拟非法的params参数（格式错误）
    mockReq.params = { userId: 'invalid-user-id' }
    const middleware = validatorMiddleware({ params: TestParamsSchema })

    middleware(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 1,
      message: '用户ID格式错误', // 匹配Zod错误提示
    })
    expect(mockNext).not.toHaveBeenCalled()
  })
})

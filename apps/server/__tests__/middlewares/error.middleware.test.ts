// 用@别名导入依赖
import { Request, Response } from 'express'
import { errorMiddleware } from '@/middlewares/error.middleware'
import { MESSAGE } from '@/constants/message.constant' // 初始化mock对象（避免undefined赋值，无类型错）

// 初始化mock对象（避免undefined赋值，无类型错）
const mockReq: Request = {} as Request
const mockRes = {
  status: jest.fn().mockReturnThis(), // 支持链式调用
  json: jest.fn(),
} as unknown as Response
// next无需实际调用，用空函数占位
const mockNext = () => {}

// 测试套件：错误中间件核心逻辑
describe('Middlewares: error.middleware（全局错误处理中间件）', () => {
  // 每个用例前重置mock调用记录
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // 测试用例1：错误对象有statusCode和message → 响应对应状态码和信息
  it('错误对象含statusCode和message时，返回对应状态码和自定义信息', () => {
    // 模拟业务中抛出的自定义错误
    const testError = new Error('用户名已存在')
    ;(testError as any).statusCode = 400 // 给错误附加statusCode

    // 执行错误中间件
    errorMiddleware(testError, mockReq, mockRes, mockNext)

    // 断言响应结果
    expect(mockRes.status).toHaveBeenCalledWith(400) // 用错误的statusCode
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 1,
      message: '用户名已存在', // 用错误的message
    })
  })

  // 测试用例2：错误对象无statusCode → 默认返回500状态码
  it('错误对象无statusCode时，默认返回500状态码', () => {
    // 模拟无statusCode的错误
    const testError = new Error('数据库连接失败')

    errorMiddleware(testError, mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(500) // 默认500
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 1,
      message: '数据库连接失败', // 用错误的message
    })
  })

  // 测试用例3：错误对象无message → 默认返回“服务器错误”
  it('错误对象无message时，默认返回INTERNAL_SERVER_ERROR信息', () => {
    // 模拟无message的错误（仅含statusCode）
    const testError = new Error()
    ;(testError as any).statusCode = 401

    errorMiddleware(testError, mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401) // 用错误的statusCode
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 1,
      message: MESSAGE.INTERNAL_SERVER_ERROR, // 默认“服务器错误”
    })
  })

  // 测试用例4：错误对象无任何附加属性 → 全用默认值（500 + 服务器错误）
  it('错误对象无statusCode和message时，返回500+默认服务器错误', () => {
    // 模拟最基础的Error（无任何附加信息）
    const testError = new Error()

    errorMiddleware(testError, mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(500) // 默认500
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 1,
      message: MESSAGE.INTERNAL_SERVER_ERROR, // 默认“服务器错误”
    })
  })
})

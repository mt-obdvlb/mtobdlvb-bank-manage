import { Router } from 'express'
import { authMiddleware, validatorMiddleware } from '@/middlewares'
import { asyncHandler } from '@/utils'
import {
  accountCreate,
  accountDelete,
  accountDeposit,
  accountFreeze,
  accountGetBalance,
  accountList,
  accountListTransaction,
  accountUnfreeze,
  accountWithdraw,
} from '@/controller'
import {
  accountCreateDTO,
  accountDeleteDTO,
  accountDepositDTO,
  accountFreezeDTO,
  accountListDTO,
  accountListTransactionDTO,
  accountUnfreezeDTO,
  accountWithdrawDTO,
} from '@mtobdvlb/shared-types'

const router = Router()

// 创建账户
router.post(
  '/',
  authMiddleware,
  validatorMiddleware({ body: accountCreateDTO }),
  asyncHandler(accountCreate)
)

// 获取账户列表
router.get(
  '/list',
  authMiddleware,
  validatorMiddleware({ query: accountListDTO }),
  asyncHandler(accountList)
)

// 获取交易记录
router.get(
  '/:id/transactions',
  authMiddleware,
  validatorMiddleware({ query: accountListTransactionDTO }),
  asyncHandler(accountListTransaction)
)

// 提现
router.post(
  '/:id/withdraw',
  authMiddleware,
  validatorMiddleware({ body: accountWithdrawDTO }),
  asyncHandler(accountWithdraw)
)

// 存款
router.post(
  '/:id/deposit',
  authMiddleware,
  validatorMiddleware({ body: accountDepositDTO }),
  asyncHandler(accountDeposit)
)

// 查询余额
router.get('/:id/balance', authMiddleware, asyncHandler(accountGetBalance))

// 冻结账户
router.post(
  '/:id/freeze',
  authMiddleware,
  validatorMiddleware({ body: accountFreezeDTO }),
  asyncHandler(accountFreeze)
)

// 解冻账户
router.post(
  '/:id/unfreeze',
  authMiddleware,
  validatorMiddleware({ body: accountUnfreezeDTO }),
  asyncHandler(accountUnfreeze)
)

// 删除账户
router.delete(
  '/:id',
  authMiddleware,
  validatorMiddleware({
    query: accountDeleteDTO,
  }),
  asyncHandler(accountDelete)
)

export default router

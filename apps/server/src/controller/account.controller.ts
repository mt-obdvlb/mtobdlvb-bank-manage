import { RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  AccountCreateDTO,
  AccountDeleteDTO,
  AccountDepositDTO,
  AccountFreezeDTO,
  AccountGetBalance,
  AccountListDTO,
  AccountListItem,
  AccountListTransactionDTO,
  AccountListTransactionItem,
  AccountUnfreezeDTO,
  AccountWithdrawDTO,
  PageResult,
  Result,
} from '@mtobdvlb/shared-types'
import { MESSAGE } from '@/constants'
import { AccountService } from '@/service'

export const accountCreate: RequestHandler<ParamsDictionary, Result, AccountCreateDTO> = async (
  req,
  res
) => {
  const userId = req.user?.id
  if (!userId)
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })
  await AccountService.create(userId, req.body)
  return res.status(200).json({
    code: 0,
  })
}

export const accountList: RequestHandler<
  ParamsDictionary,
  PageResult<AccountListItem>,
  AccountListDTO
> = async (req, res) => {
  const userId = req.user?.id
  if (!userId)
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })
  const { total, list } = await AccountService.list(userId, req.body)
  return res.status(200).json({
    code: 0,
    data: {
      total,
      list,
    },
  })
}

export const accountListTransaction: RequestHandler<
  ParamsDictionary,
  PageResult<AccountListTransactionItem>,
  AccountListTransactionDTO
> = async (req, res) => {
  const userId = req.user?.id
  if (!userId || !req.params.id || !req.params.id.trim())
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })
  const { total, list } = await AccountService.listTransaction(userId, req.body, req.params.id)
  return res.status(200).json({
    code: 0,
    data: {
      total,
      list,
    },
  })
}

export const accountWithdraw: RequestHandler<ParamsDictionary, Result, AccountWithdrawDTO> = async (
  req,
  res
) => {
  const userId = req.user?.id
  if (!userId || !req.params.id || !req.params.id.trim())
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })
  await AccountService.withdraw(userId, req.body, req.params.id)
  return res.status(200).json({
    code: 0,
  })
}

export const accountDeposit: RequestHandler<ParamsDictionary, Result, AccountDepositDTO> = async (
  req,
  res
) => {
  const userId = req.user?.id
  if (!userId || !req.params.id || !req.params.id.trim())
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })
  await AccountService.deposit(userId, req.body, req.params.id)
  return res.status(200).json({
    code: 0,
  })
}

export const accountGetBalance: RequestHandler<
  ParamsDictionary,
  Result<AccountGetBalance>
> = async (req, res) => {
  const userId = req.user?.id
  if (!userId || !req.params.id || !req.params.id.trim())
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })
  const data = await AccountService.getBalance(userId, req.params.id)
  return res.status(200).json({
    code: 0,
    data: { amount: data },
  })
}

export const accountFreeze: RequestHandler<ParamsDictionary, Result, AccountFreezeDTO> = async (
  req,
  res
) => {
  const userId = req.user?.id
  if (!userId || !req.params.id || !req.params.id.trim())
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })
  await AccountService.freeze(userId, req.body, req.params.id)
  return res.status(200).json({
    code: 0,
  })
}

export const accountUnfreeze: RequestHandler<ParamsDictionary, Result, AccountUnfreezeDTO> = async (
  req,
  res
) => {
  const userId = req.user?.id
  if (!userId || !req.params.id || !req.params.id.trim())
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })
  await AccountService.unfreeze(userId, req.body, req.params.id)
  return res.status(200).json({
    code: 0,
  })
}

export const accountDelete: RequestHandler<ParamsDictionary, Result, AccountDeleteDTO> = async (
  req,
  res
) => {
  const userId = req.user?.id
  if (!userId || !req.params.id || !req.params.id.trim())
    return res.status(401).json({
      code: 1,
      message: MESSAGE.AUTH_ERROR,
    })
  await AccountService.delete(userId, req.body, req.params.id)
  return res.status(200).json({
    code: 0,
  })
}

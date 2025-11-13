import type {
  AccountCreateDTO,
  AccountDeleteDTO,
  AccountDepositDTO,
  AccountFreezeDTO,
  AccountGetBalance,
  AccountList,
  AccountListDTO,
  AccountListTransaction,
  AccountListTransactionDTO,
  AccountUnfreezeDTO,
  AccountWithdrawDTO,
  CommonIdDTO,
  PageResult,
  Result,
} from '@mtobdvlb/shared-types'

import request from '@/utils/request.ts'

const baseURL = '/accounts'

const API = {
  get: '/',
  list: '/list',
  transactions: '/transactions',
  balance: '/balance',
  deposit: '/deposit',
  withdraw: '/withdraw',
  freeze: '/freeze',
  unfreeze: '/unfreeze',
}

//银行卡相关API

//创建
export const accountCreate = (body: AccountCreateDTO) => request.post<Result>(baseURL, body)

//正常获取列表
export const accountList = (params: AccountListDTO) =>
  request.get<PageResult<AccountList>>(baseURL + API.list, { params })

//获取流水列表
export const accountListTransaction = (id: string, params: AccountListTransactionDTO) =>
  request.get<PageResult<AccountListTransaction>>(baseURL + API.get + id + API.transactions, {
    params,
  })

//删除
export const accountDelete = (id: string, params: AccountDeleteDTO) =>
  request.delete<Result>(baseURL + API.get + id, {
    params,
  })

//获取余额
export const accountBalance = (id: string) =>
  request.get<Result<AccountGetBalance>>(baseURL + API.get + id + API.balance)

//存款
export const accountDeposit = (id: string, amount: AccountDepositDTO) =>
  request.post<Result>(baseURL + API.get + id + API.deposit, amount)

//取款
export const accountWithdraw = (id: string, amount: AccountWithdrawDTO) =>
  request.post<Result>(baseURL + API.get + id + API.withdraw, amount)

//冻结
export const accountFreeze = (id: string, password: AccountFreezeDTO) =>
  request.post<Result>(baseURL + API.get + id + API.freeze, password)

//解冻
export const accountUnfreeze = (id: string, password: AccountUnfreezeDTO) =>
  request.post<Result>(baseURL + API.get + id + API.unfreeze, password)

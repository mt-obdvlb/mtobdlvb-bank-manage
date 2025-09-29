export type TransactionType = 'deposit' | 'withdraw'

export type AccountListTransactionItem = {
  id: string
  amount: number
  createdAt: string
  type: TransactionType
}

export type AccountListTransaction = AccountListTransactionItem[]

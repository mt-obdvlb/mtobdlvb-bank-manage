export type AccountStatus = 'active' | 'frozen'

export type AccountListItem = {
  id: string
  status: AccountStatus
  updateAt: string
  name: string
}

export type AccountList = AccountListItem[]

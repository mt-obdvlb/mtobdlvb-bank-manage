export type Result<T = undefined> = {
  code: number
  message?: string
  data?: T
}

export interface Page<T> {
  total: number
  list: T[]
}

export type PageResult<T> = Result<Page<T>>

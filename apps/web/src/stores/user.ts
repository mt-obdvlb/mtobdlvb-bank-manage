import { defineStore } from 'pinia'
import type { UserGet } from '@mtobdvlb/shared-types'

export type UserState = UserGet

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: '',
    username: '',
    email: '',
    phone: '',
  }),
  actions: {
    setUser(user: UserState) {
      Object.assign(this, user)
    },
    logout() {
      this.id = ''
      this.username = ''
      this.email = ''
      this.phone = ''
    },
  },
})

import { useMutation } from '@tanstack/vue-query'
import { userLogin, userRegister } from '@/services/user.ts'

export const useUserAuth = () => {
  const { mutateAsync: login } = useMutation({
    mutationFn: userLogin,
  })
  const { mutateAsync: register } = useMutation({
    mutationFn: userRegister,
  })
  return {
    login,
    register,
  }
}

export const useUserGet = () => {}

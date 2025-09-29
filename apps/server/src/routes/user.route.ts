import { Router } from 'express'
import { authMiddleware, validatorMiddleware } from '@/middlewares'
import { asyncHandler } from '@/utils'
import { userGet, userLogin, userLogout, userRegister, userUpdate } from '@/controller'
import { userLoginDTO, userRegisterDTO, userUpdateDTO } from '@mtobdvlb/shared-types'

const router = Router()

router.get('/', authMiddleware, asyncHandler(userGet))
router.post(
  '/register',
  validatorMiddleware({
    body: userRegisterDTO,
  }),
  asyncHandler(userRegister)
)
router.post(
  '/login',
  validatorMiddleware({
    body: userLoginDTO,
  }),
  asyncHandler(userLogin)
)
router.post('/logout', authMiddleware, asyncHandler(userLogout))
router.put(
  '/',
  authMiddleware,
  validatorMiddleware({ body: userUpdateDTO }),
  asyncHandler(userUpdate)
)

export default router

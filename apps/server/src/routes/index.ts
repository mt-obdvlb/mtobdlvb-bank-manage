import { Router } from 'express'
import userRoute from '@/routes/user.route'
import accountRoute from '@/routes/account.route'

const router = Router()

router.use('/users', userRoute)
router.use('/accounts', accountRoute)

export default router

'use client'

import AdminPlansPage from '@/components/feature/plans/AdminPlansPage'
import UserPlans from '@/components/feature/plans/UserPlans'
import type { RootState } from '@/redux/store'
import { useAppSelector } from '@/redux/hooks'

const PlansRouter = () => {
  const user = useAppSelector((state: RootState) => state.auth.user)
  const isUser = user?.role === 'user'
  return isUser ? <UserPlans /> : <AdminPlansPage />
}

export default PlansRouter

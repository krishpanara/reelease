'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { useGetPlansQuery } from '@/redux/api/planApi'
import { useAssignPlanToUserMutation } from '@/redux/api/subscriptionApi'
import { useGetUsersQuery } from '@/redux/api/userApi'
import { AssignPlanModalProps, Plan, User } from '@/types'
import { Check, Clock, CreditCard, Loader2, Package, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const AssignPlanModal = ({ isOpen, onClose, editingSubscription }: AssignPlanModalProps) => {
  const { t } = useTranslation()
  const [userSearch, setUserSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')

  useEffect(() => {
    if (editingSubscription && isOpen) {
      setUserSearch(editingSubscription.user?.email || '')
      setSelectedUserId(editingSubscription.user?.id || editingSubscription.user?.id || '')
      setSelectedPlanId(editingSubscription.plan?._id || editingSubscription.plan?.id || '')
    }
  }, [editingSubscription, isOpen])
  const [duration, setDuration] = useState('1')
  const [amount, setAmount] = useState('')

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery(
    { search: userSearch, limit: 5 },
    { skip: !userSearch },
  )
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery({ is_active: true })
  const [assignPlan, { isLoading: isAssigning }] = useAssignPlanToUserMutation()

  const plans = plansData?.data || []
  const users = usersData?.users || []

  const selectedPlan = plans.find((p: Plan) => (p._id || p.id) === selectedPlanId)
  const isLifetime = selectedPlan?.billing_cycle === 'lifetime'

  useEffect(() => {
    if (selectedPlan) {
      setAmount(String((selectedPlan.amount || 0) * (parseInt(duration) || 1)))
    }
  }, [selectedPlan, duration])

  const handleAssign = async () => {
    if (!selectedUserId || !selectedPlanId) return

    try {
      await assignPlan({
        user_id: selectedUserId,
        plan_id: selectedPlanId,
        duration: parseInt(duration) || 1,
        amount: parseFloat(amount) || 0,
      }).unwrap()

      toast.success(t('plan_assigned_successfully'))
      handleClose()
    } catch (err: any) {
      toast.error(err?.data?.message || t('something_went_wrong'))
    }
  }

  const handleClose = () => {
    onClose()
    setSelectedUserId('')
    setSelectedPlanId('')
    setUserSearch('')
    setDuration('1')
    setAmount('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl! max-w-[calc(100%-2rem)]! max-h-[90vh] overflow-y-auto bg-modal-bg-color border-none rounded-border-radius p-4 custom-scrollbar">
        <DialogHeader className="p-0">
          <DialogTitle className="text-xl font-bold flex rtl:flex-row-reverse items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="w-5 h-5 text-primary" />
            </div>
            {editingSubscription ? t('update_subscription') : t('assign_plan_to_user')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex rtl:flex-row-reverse">{t('select_user')}</Label>
            <div className="relative">
              <Search className="absolute left-3 rtl:right-3 rtl:left-auto  top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('search_user_by_name_or_email')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 rtl:pr-9! rtl:left-auto text-left rtl:text-right h-12 rounded-[8px] bg-muted/20 border-glass-border"
              />
            </div>
            {usersLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {users.map((u: User) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUserId(u._id)
                      setUserSearch(u.email)
                    }}
                    className={`flex rtl:flex-row-reverse justify-between items-center gap-3 py-3 px-5 rounded-radius border cursor-pointer transition-all ${selectedUserId === u.id ? 'border-primary bg-primary/5' : 'border hover:bg-muted/10 bg-black/3'
                      }`}
                  >
                    <div className="flex flex-col rtl:items-end min-w-0">
                      <span className="font-bold text-sm truncate text-black">{u.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{u.email}</span>
                    </div>
                    {selectedUserId === u.id && <Check className="w-4 h-4 text-primary " />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plan Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex rtl:flex-row-reverse">{t('select_plan')}</Label>
            {plansLoading ? (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-70  overflow-y-auto no-scrollbar pr-2">
                {plans.map((plan: Plan) => (
                  <div
                    key={plan._id || plan.id}
                    onClick={() => setSelectedPlanId(plan._id || plan.id || '')}
                    className={`py-4 px-4 rounded-md border-1 cursor-pointer transition-all ${selectedPlanId === (plan._id || plan.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-glass-border hover:border-primary/50'
                      }`}
                  >
                    <div className="flex justify-between items-center rtl:flex-row-reverse">
                      <div className=' flex flex-col rtl:items-end'>
                        <h4 className="font-bold text-sm">{plan.name}</h4>
                        <span className="text-xs text-muted-foreground uppercase">{plan.billing_cycle}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-primary">
                          {plan.currency || 'USD'} {plan.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Duration & Amount */}
          {selectedPlanId && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              {!isLifetime && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1 rtl:flex-row-reverse">
                    <Clock className="w-3 h-3" /> {t('duration')} ({t('cycles')})
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-10 rounded-[8px] bg-muted/20 border-glass-border text-left rtl:text-right"
                  />
                </div>
              )}
              <div className="space-y-2 col-span-1">
                <Label className="text-xs font-semibold flex rtl:flex-row-reverse items-center gap-1">
                  <CreditCard className="w-3 h-3" /> {t('total_amount_override')}
                </Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10 rounded-[8px] bg-muted/20 border-glass-border text-left rtl:text-right"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-muted/5">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full dark:bg-white/3 bg-black/3 border hover:bg-destructive! hover:text-white rounded-radius text-sm sm:h-12 h-10 font-medium"
          >
            {t('cancel')}
          </Button>
          <Button
            disabled={isAssigning || !selectedUserId || !selectedPlanId}
            onClick={handleAssign}
            className="rounded-radius w-full sm:h-12 h-10 px-10 font-bold btn-color text-white! primary-btn gap-2 transition-all active:scale-95"
          >
            {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {editingSubscription ? t('update_plan') : t('assign_plan')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AssignPlanModal

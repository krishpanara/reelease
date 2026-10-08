'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { defaultModalForm } from '@/data/plan'
import { Plan, PlanModalProps } from '@/types'
import { Form, Formik } from 'formik'
import { Loader2, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'
import PlanAIFeatures from './plan-modal/PlanAIFeatures'
import PlanBasicFields from './plan-modal/PlanBasicFields'
import PlanModulesAndLimits from './plan-modal/PlanModulesAndLimits'

const PlanModal = ({ isOpen, onClose, onSave, plan, isLoading = false }: PlanModalProps) => {
  const { t } = useTranslation()
  const validationSchema = Yup.object({
    name: Yup.string().required(t('name_is_required', { defaultValue: 'Name is required' })),
    slug: Yup.string().required(t('slug_is_required', { defaultValue: 'Slug is required' })),
    validity_days: Yup.number()
      .nullable()
      .when(['plan_type', 'billing_cycle'], {
        is: (plan_type: any, billing_cycle: any) => plan_type === 'top_up' && billing_cycle === 'one_time',
        then: (schema) => schema.required(t('validity_days_is_required', { defaultValue: 'Validity days are required' })).min(1, t('must_be_greater_than_0', { defaultValue: 'Must be at least 1 day' })),
        otherwise: (schema) => schema.nullable()
      })
  })

  const handleSubmit = (values: Partial<Plan>) => {
    onSave(values)
  }

  const initialValues = plan ? {
    ...defaultModalForm,
    ...plan,
    module_access: (plan.module_access || []).map((m: any) =>
      typeof m === 'object' && m !== null ? m.id || m._id : m
    )
  } : defaultModalForm

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl! max-w-[calc(100%-2rem)]! max-h-[90vh] overflow-hidden flex flex-col border-none shadow-2xl rounded-border-radius! bg-light-body">
        <DialogHeader className=" flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[9px] bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-medium text-title-color dark:text-white">
              {plan ? t('edit_plan') : t('add_plan')}
            </DialogTitle>
          </div>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, dirty, isValid }) => (
            <Form className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                <PlanBasicFields
                  formData={values}
                  isEdit={!!plan}
                  onChange={(field, val: any) => {
                    if (typeof field === 'object') {
                      Object.entries(field).forEach(([k, v]) => setFieldValue(k, v))
                    } else {
                      setFieldValue(field, val)
                      if (field === 'name' && !plan) {
                        setFieldValue('slug', val.toLowerCase().replace(/\s+/g, '-'))
                      }
                    }
                  }}
                />
                <PlanModulesAndLimits
                  formData={values}
                  onChange={(field, val: any) => {
                    if (typeof field === 'object') {
                      Object.entries(field).forEach(([k, v]) => setFieldValue(k, v))
                    } else {
                      setFieldValue(field, val)
                    }
                  }}
                />
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('ai_features')}</h3>
                  <PlanAIFeatures
                    formData={values}
                    onChange={(field, val: any) => {
                      if (typeof field === 'object') {
                        Object.entries(field).forEach(([k, v]) => setFieldValue(k, v))
                      } else {
                        setFieldValue(field, val)
                      }
                    }}
                  />
                </div>
              </div>

              <DialogFooter className="sm:p-6 p-4 pb-0! px-0! bg-muted/20 border-t border-glass-border gap-3 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-10 w-full rounded-border-radius p-button-padding! border-glass-border hover:bg-primary hover:text-white transition-all font-semibold"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !isValid || (!!plan && !dirty)}
                  className="h-10 w-full rounded-border-radius p-button-padding! bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('saving')}...
                    </>
                  ) : plan ? (
                    t('update')
                  ) : (
                    t('save')
                  )}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

export default PlanModal

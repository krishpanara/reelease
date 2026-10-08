'use client'

import { Button } from '@/components/ui/button'
import { Plan, PlanFormProps } from '@/types'
import { Form, Formik } from 'formik'
import { ArrowLeft, Loader2, Package, Save, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'
import PlanAIFeatures from './plan-modal/PlanAIFeatures'
import PlanBasicFields from './plan-modal/PlanBasicFields'
import { PageHeader } from '@/components/reusable/PageHeader'
import { defaultPlanForm } from '@/data/plan'

const PlanForm = ({ plan, onSave, isLoading = false }: PlanFormProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const validationSchema = Yup.object({
    name: Yup.string().required(t('name_is_required', { defaultValue: 'Name is required' })),
    slug: Yup.string().required(t('slug_is_required', { defaultValue: 'Slug is required' })),
    amount: Yup.number().required(t('amount_is_required', { defaultValue: 'Amount is required' })).min(0),
  })

  const handleSubmit = async (values: Partial<Plan>) => {
    await onSave(values)
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden mb-3">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <PageHeader
                title={plan ? t('edit_plan') : t('create_new_plan')}
                subtitle={t('create_new_plan_description')}
                showBackButton
              />
            </div>
          </div>
        </div>
      </div>

      <Formik
        initialValues={plan ? { ...defaultPlanForm, ...plan } : defaultPlanForm}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, dirty, isValid }) => (
          <Form className="space-y-8 w-full">
            <div className="space-y-10">
              <div className="sm:p-6 p-4 rounded-border-radius glass-card border border-glass-border backdrop-blur-md min-h-137.5 relative overflow-hidden group bg-white dark:bg-light-body">
                <div className="relative z-10 transition-all duration-500">
                  <div className="sm:mb-10 mb-6 flex items-center justify-between border-b border-glass-border pb-4">
                    <div>
                      <h2 className="text-xl font-medium text-title-color dark:text-white flex items-center gap-3">
                        <Package className="w-6 h-6 text-primary" />
                        {t('basic_info')}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
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
                  </div>
                </div>
              </div>

              <div className="sm:p-6 p-4 bg-white dark:bg-light-body rounded-border-radius glass-card border border-glass-border backdrop-blur-md relative overflow-hidden group">
                <div className="relative z-10 transition-all duration-500">
                  <div className="sm:mb-10 mb-6 flex items-center justify-between border-b border-glass-border pb-4">
                    <div>
                      <h2 className="text-xl font-medium text-title-color dark:text-white flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-primary" />
                        {t('ai_features')}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
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
              </div>

              <div className="flex flex-wrap items-center sm:justify-end justify-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="rounded-radius h-10 dark:bg-white/3 bg-black/3 hover:text-white dark:hover:text-white!  hover:bg-destructive! font-medium border border-glass-border "
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !isValid || !dirty}
                  className="rounded-radius h-10 primary-btn dark:text-black text-white! font-medium  transition-all  gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {t('synchronizing')}...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      {plan ? t('update_plan') : t('create_plan')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default PlanForm

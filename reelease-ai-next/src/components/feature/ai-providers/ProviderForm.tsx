'use client'

import { Formik, Form } from 'formik'
import * as Yup from 'yup'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AIProvider, ServiceType } from '@/types'
import { ProviderServiceConfig } from './components/ProviderServiceConfig'
import { ProviderCreditsConfig } from './components/ProviderCreditsConfig'
import { useProviderForm } from './hooks/useProviderForm'
import {
  ProviderFormHeader,
  ProviderNameField,
  ProviderTabsList,
  ProviderServiceVerticalTabs
} from './components/ProviderFormParts'
import { TestProviderModal } from './components/TestProviderModal'
import { cn } from '@/lib/utils'
import { ProviderFormProps } from '@/types'
import { serviceTabs } from '@/data/aiProvider'



const validationSchema = Yup.object({
  name: Yup.string().required('Provider name is required'),
})

const ProviderForm = ({ editingProvider, onSuccess, onCancel }: ProviderFormProps) => {
  const [showTestModal, setShowTestModal] = useState(false)
  const {
    mainTab,
    setMainTab,
    activeTab,
    setActiveTab,
    enabledServices,
    isLoading,
    buildInitialValues,
    toggleService,
    handleSubmit,
    isEditing
  } = useProviderForm(editingProvider, onSuccess)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const providerId = editingProvider?.id || editingProvider?._id || ''

  // Persist test state even when modal is closed
  const [testTaskId, setTestTaskId] = useState<string | null>(null)
  const [testView, setTestView] = useState<'input' | 'processing' | 'result'>('input')
  const [testResult, setTestResult] = useState<{
    url: string | null;
    status: 'completed' | 'failed';
    message?: string;
  } | null>(null)

  return (
    <Formik
      initialValues={buildInitialValues()}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ errors, touched, values }) => (
        <Form className="animate-fade-in space-y-6">
          <ProviderFormHeader isEditing={isEditing} isLoading={isLoading} onCancel={onCancel} />

          <ProviderNameField
            errors={errors}
            touched={touched}
            isEditing={isEditing}
            onTestClick={() => setShowTestModal(true)}
          />

          <ProviderTabsList mainTab={mainTab} setMainTab={setMainTab} />

          {mainTab === 'services' && (
            <div className="glass-card rounded-border-radius overflow-hidden animate-fade-in relative">
              <div className="flex min-h-[520px]">
                <div className={cn(
                  "flex-shrink-0 z-20 bg-background border-r rtl:border-r-0 rtl:border-l border-glass-border transition-all duration-300",
                  "xl:static xl:flex xl:w-70 xl:bg-background/30",
                  isMobileMenuOpen ? "absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 w-70 flex shadow-2xl animate-in slide-in-from-left rtl:slide-in-from-right duration-300" : "hidden xl:flex"
                )}>
                  <ProviderServiceVerticalTabs
                    serviceTabs={serviceTabs}
                    activeTab={activeTab}
                    setActiveTab={(tab) => {
                      setActiveTab(tab)
                      setIsMobileMenuOpen(false)
                    }}
                    enabledServices={enabledServices}
                    onClose={() => setIsMobileMenuOpen(false)}
                  />
                </div>

                <div className="flex-1 sm:p-6 p-4 overflow-y-auto">
                  {serviceTabs.map((tab) => {
                    if (activeTab !== tab.key) return null
                    return (
                      <ProviderServiceConfig
                        key={tab.key}
                        activeTab={activeTab}
                        tab={tab}
                        isEnabled={enabledServices.has(tab.key)}
                        toggleService={toggleService}
                        values={values}
                        onMenuClick={() => setIsMobileMenuOpen(true)}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Local Backdrop */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-10 xl:hidden"
                  />
                )}
              </AnimatePresence>
            </div>
          )}

          {mainTab === 'credits' && (
            <ProviderCreditsConfig
              enabledServices={enabledServices}
              serviceTabs={serviceTabs}
            />
          )}

          <TestProviderModal
            isOpen={showTestModal}
            onClose={() => setShowTestModal(false)}
            providerId={providerId}
            providerName={editingProvider?.name || ''}
            taskId={testTaskId}
            setTaskId={setTestTaskId}
            view={testView}
            setView={setTestView}
            result={testResult}
            setResult={setTestResult}
          />
        </Form>
      )}
    </Formik>
  )
}

export default ProviderForm

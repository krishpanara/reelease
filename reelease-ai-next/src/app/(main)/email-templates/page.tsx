'use client'

import DataLoader from '@/components/reusable/DataLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useGetEmailTemplatesQuery, useUpdateEmailTemplateMutation } from '@/redux/api/emailTemplateApi'
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Code,
  Eye,
  Info,
  KeyRound,
  Mail,
  RefreshCcw,
  Save,
  ShieldCheck,
  Smartphone,
  UserPlus,
  Zap,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

// Import js-beautify for HTML formatting
import { html as beautifyHtml } from 'js-beautify'

// Import Monaco Editor
import Editor from '@monaco-editor/react'

import { PageHeader } from '@/components/reusable/PageHeader'
import { RootState } from '@/redux/store'
import { EmailTemplate } from '@/types'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

export default function EmailTemplatePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data, isLoading } = useGetEmailTemplatesQuery()
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateEmailTemplateMutation()
  const currentUser = useSelector((state: RootState) => state.auth.user)

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('')
  const [status, setStatus] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const editorRef = useRef<any>(null)

  const hasChanges = React.useMemo(() => {
    if (!selectedTemplate) return false

    const formattedInitialContent = beautifyHtml(selectedTemplate.content, {
      indent_size: 2,
      wrap_line_length: 80,
      preserve_newlines: true,
      max_preserve_newlines: 2,
    })

    return (
      subject !== selectedTemplate.subject || content !== formattedInitialContent || status !== selectedTemplate.status
    )
  }, [selectedTemplate, subject, content, status])

  useEffect(() => {
    if (data?.templates && selectedTemplate) {
      const templatesData = data.templates
      let updatedTemplate: EmailTemplate | undefined = undefined

      if (Array.isArray(templatesData)) {
        updatedTemplate = templatesData.find((t: any) => t.slug === selectedTemplate.slug)
      } else {
        const allTemplates = Object.values(templatesData as Record<string, EmailTemplate[]>).flat()
        updatedTemplate = allTemplates.find((t: any) => t.slug === selectedTemplate.slug)
      }

      if (updatedTemplate) {
        setSelectedTemplate(updatedTemplate)
      }
    }
  }, [data])

  useEffect(() => {
    if (data?.templates && !selectedTemplate) {
      const templatesData = data.templates
      let firstTemplate: EmailTemplate | null = null

      if (Array.isArray(templatesData)) {
        if (templatesData.length > 0) {
          firstTemplate = templatesData[0]
        }
      } else {
        const categories = Object.values(templatesData as Record<string, EmailTemplate[]>)
        if (categories.length > 0 && categories[0].length > 0) {
          firstTemplate = categories[0][0]
        }
      }

      if (firstTemplate) {
        handleSelectTemplate(firstTemplate)
      }
    }
  }, [data, selectedTemplate])

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setShowPreview(false)

    // Beautify HTML before setting state
    const formattedContent = beautifyHtml(template.content, {
      indent_size: 2,
      wrap_line_length: 80,
      preserve_newlines: true,
      max_preserve_newlines: 2,
    })

    setContent(formattedContent)
    setSubject(template.subject)
    setStatus(template.status)
  }

  const handleResetTemplate = () => {
    if (!selectedTemplate) return

    const formattedContent = beautifyHtml(selectedTemplate.default_content, {
      indent_size: 2,
      wrap_line_length: 80,
      preserve_newlines: true,
      max_preserve_newlines: 2,
    })

    setContent(formattedContent)
    setShowPreview(false)
  }

  const handleSave = async () => {
    if (!selectedTemplate) return
    try {
      await updateTemplate({
        slug: selectedTemplate.slug,
        subject,
        content,
        status,
      }).unwrap()
      toast.success(t('email_template_updated', { defaultValue: 'Email template updated successfully' }))
    } catch (error: any) {
      toast.error(error?.data?.message || t('failed_to_update_template'))
    }
  }

  const insertVariable = (action: string) => {
    if (showPreview) {
      setShowPreview(false)
    }
    if (editorRef.current) {
      const editor = editorRef.current
      const selection = editor.getSelection()

      if (selection) {
        editor.executeEdits('insertVariable', [
          {
            range: selection,
            text: action,
            forceMoveMarkers: true,
          },
        ])
        editor.focus()
        setContent(editor.getValue())
      } else {
        setContent((prev) => prev + action)
      }
    } else {
      setContent((prev) => prev + action)
    }
  }

  const previewContent = React.useMemo(() => {
    // Note: This is for visual preview only. Saving updates the template configuration.
    // Actual emails are sent by the backend when events occur.
    const mockData: Record<string, string> = {
      '{{user_name}}': currentUser?.name || 'Admin User',
      '{{user_email}}': currentUser?.email || 'admin@example.ai',
      '{{app_name}}': 'Smart AI Content Generation Suite',
      '{{login_url}}': 'https://example.ai/login',
      '{{reset_url}}': 'https://example.ai/reset-password',
      '{{otp_code}}': '123456',
      '{{plan_name}}': 'Pro Monthly',
      '{{amount_paid}}': '$29.00',
      '{{validity_days}}': '30',
      '{{days_remaining}}': '5',
      '{{renewal_url}}': 'https://example.ai/billing',
    }

    let processedHtml = content
    Object.entries(mockData).forEach(([key, value]) => {
      processedHtml = processedHtml.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
    })

    const disableLinksStyle = `<style>a { pointer-events: none !important; }</style>`
    if (processedHtml.includes('</head>')) {
      processedHtml = processedHtml.replace('</head>', `${disableLinksStyle}</head>`)
    } else {
      processedHtml = disableLinksStyle + processedHtml
    }

    return processedHtml
  }, [content, showPreview, currentUser])

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-1">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center w-full">
          <div className="space-y-2">
            <Skeleton className="w-48 h-8 bg-slate-200/80 dark:bg-white/10 rounded-lg" />
            <Skeleton className="w-[400px] max-w-full h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
          </div>
          <Skeleton className="w-36 h-12 bg-slate-200/80 dark:bg-white/10 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar Tabs Skeleton */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-white/3 border rounded-border-radius p-4 space-y-4">
              <Skeleton className="w-32 h-5 bg-slate-200/80 dark:bg-white/10 rounded" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-[65px] bg-slate-200/80 dark:bg-white/10 rounded-[12px]" />
                ))}
              </div>
            </div>
          </div>

          {/* Editor and Right Sidebar Skeleton */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Editor Block */}
              <div className="xl:col-span-8">
                <div className="bg-white dark:bg-white/3 border rounded-border-radius p-4 sm:p-6 space-y-6 h-[600px] flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-32 h-6 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <div className="flex gap-3">
                      <Skeleton className="w-20 h-8 bg-slate-200/80 dark:bg-white/10 rounded-xl" />
                      <Skeleton className="w-24 h-8 bg-slate-200/80 dark:bg-white/10 rounded-full" />
                      <Skeleton className="w-16 h-8 bg-slate-200/80 dark:bg-white/10 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2 flex-grow mt-6">
                    <Skeleton className="w-24 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <Skeleton className="w-full h-12 bg-slate-200/80 dark:bg-white/10 rounded-xl" />
                  </div>
                  <div className="space-y-2 flex-grow mt-6">
                    <Skeleton className="w-24 h-4 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <Skeleton className="w-full h-80 bg-slate-200/80 dark:bg-white/10 rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Right Sidebar Block */}
              <div className="xl:col-span-4">
                <div className="bg-white dark:bg-white/3 border rounded-border-radius p-4 sm:p-6 space-y-6 h-[600px] flex flex-col">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded bg-slate-200/80 dark:bg-white/10" />
                    <Skeleton className="w-40 h-5 bg-slate-200/80 dark:bg-white/10 rounded" />
                  </div>
                  <Skeleton className="w-full h-12 bg-slate-200/80 dark:bg-white/10 rounded" />
                  <div className="space-y-3 flex-grow overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="w-full h-[65px] bg-slate-200/80 dark:bg-white/10 rounded-[12px]" />
                    ))}
                  </div>
                  <Skeleton className="w-full h-24 bg-slate-200/80 dark:bg-white/10 rounded-2xl mt-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const templatesData = data?.templates || []
  const isCategorized = !Array.isArray(templatesData)

  const getTemplateIcon = (slug: string, name: string) => {
    const iconClass = 'w-4 h-4'
    const lowerSlug = slug.toLowerCase()
    const lowerName = name.toLowerCase()

    if (lowerSlug.includes('welcome') || lowerName.includes('welcome')) {
      return <UserPlus className={iconClass} />
    }
    if (
      (lowerSlug.includes('password') || lowerName.includes('password')) &&
      (lowerSlug.includes('otp') || lowerName.includes('otp'))
    ) {
      return <KeyRound className={iconClass} />
    }
    if (
      (lowerSlug.includes('password') || lowerName.includes('password')) &&
      (lowerSlug.includes('success') || lowerName.includes('success'))
    ) {
      return <ShieldCheck className={iconClass} />
    }
    if (lowerSlug.includes('activation') || lowerName.includes('activation')) {
      return <Zap className={iconClass} />
    }
    if (
      lowerSlug.includes('renewal') ||
      lowerName.includes('renewal') ||
      lowerSlug.includes('reminder') ||
      lowerName.includes('reminder')
    ) {
      return <Bell className={iconClass} />
    }
    if (
      lowerSlug.includes('registration') ||
      lowerName.includes('registration') ||
      lowerSlug.includes('register') ||
      lowerName.includes('register')
    ) {
      return <Smartphone className={iconClass} />
    }
    if (lowerSlug.includes('verification') || lowerName.includes('verification')) {
      return <ShieldCheck className={iconClass} />
    }

    return <Mail className={iconClass} />
  }

  const renderTemplateButton = (template: EmailTemplate) => (
    <Button
      key={template.slug}
      onClick={() => handleSelectTemplate(template)}
      className={cn(
        'flex items-center gap-3 p-3! lg:p-4! rounded-[12px]! text-start group sm:h-17.5! h-12',
        selectedTemplate?.slug === template.slug
          ? 'primary-btn  text-white!'
          : 'bg-black/3! dark:bg-white/5!  dark:text-white text-black dark:hover:bg-white/5! hover:border-white/10',
      )}
    >
      <div
        className={cn(
          'w-9 h-9  rounded-lg flex items-center justify-center transition-colors shrink-0',
          selectedTemplate?.slug === template.slug ? 'bg-black/10' : 'dark:bg-white/5 bg-black/5',
        )}
      >
        {getTemplateIcon(template.slug, template.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate rtl:text-right ">{template.name}</p>
        <p
          className={cn(
            'text-xs font-medium rtl:text-right truncate leading-tight',
            selectedTemplate?.slug === template.slug ? 'text-white ' : 'text-black/50! dark:text-white!',
          )}
        >
          {template.description}
        </p>
      </div>
      {template.is_configured && (
        <CheckCircle2
          className={cn(
            'w-3 h-3 shrink-0',
            selectedTemplate?.slug === template.slug ? 'dark:text-black text-white' : 'text-primary/40',
          )}
        />
      )}
    </Button>
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        icon={<Mail className="w-6 h-6 text-primary animate-pulse" />}
        title={t('email_templates', { defaultValue: 'Email Templates' })}
        subtitle={t('email_templates_desc', {
          defaultValue: 'Configure and manage automated email templates for system events and user notifications.',
        })}
        showBackButton={false}
        endContent={
          <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
            <Button
              onClick={handleSave}
              disabled={isUpdating || !selectedTemplate || !hasChanges}
              className="gap-2 h-10 sm:h-12 px-6 rounded-radius primary-btn text-white! text-sm font-bold   active:scale-95 transition-all w-full sm:w-auto"
            >
              {isUpdating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t('save_templates', { defaultValue: 'Save Templates' })}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Vertical Tabs Sidebar */}
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-4 bg-white dark:bg-white/3 space-y-6 rounded-border-radius border">
            <div className="max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar pr-1">
              <div className="flex flex-col gap-4 lg:gap-6">
                {isCategorized ? (
                  Object.entries(templatesData as Record<string, EmailTemplate[]>).map(([category, catTemplates]) => (
                    <div key={category} className="space-y-3">
                      <Label className="text-sm font-black dark:text-white/30 text-black! px-2 block text-start">
                        {category}
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                        {catTemplates.map(renderTemplateButton)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    <div className="border-b border-glass-border sm:p-6 p-4 mb-0!  ">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Info className="w-4 h-4" />
                        </div>
                        <Label className="text-base font-bold dark:text-white text-title-color block text-start">
                          {t('available_events', { defaultValue: 'Available Events' })}
                        </Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:p-6 p-4">
                      {(templatesData as EmailTemplate[]).map(renderTemplateButton)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-9 space-y-6">
          {selectedTemplate ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:h-[calc(100vh-14rem)]">
              <div className="xl:col-span-8 space-y-6 h-full">
                <Card className="glass-card border-white/10 overflow-hidden rounded-border-radius bg-white dark:bg-white/3 h-full flex flex-col">
                  <CardHeader className="border-b border-glass-border sm:p-6 p-4 shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          {showPreview ? <Eye className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                        </div>
                        <CardTitle className="text-sm sm:text-base font-bold truncate">
                          {showPreview
                            ? t('template_preview', { defaultValue: 'Template Preview' })
                            : t('template_editor', { defaultValue: 'HTML Editor' })}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'h-8 px-3 rounded-xl gap-2 transition-all font-bold text-sm',
                            showPreview
                              ? 'primary-btn text-white! border-primary'
                              : 'dark:bg-white/5 bg-black/3  text-black  dark:text-white/60',
                          )}
                          onClick={() => setShowPreview(!showPreview)}
                        >
                          {showPreview ? <Code className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {showPreview
                            ? t('view_code', { defaultValue: 'View Code' })
                            : t('preview', { defaultValue: 'Preview' })}
                        </Button>
                        <div className="flex items-center gap-3 dark:bg-black/20 bg-black/3 px-3 py-1.5 rounded-full border border-glass-border">
                          <span className="text-sm font-bold text-title-color">{t('status')}</span>
                          <Switch
                            checked={status}
                            onCheckedChange={setStatus}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 rounded-xl gap-2 bg-black/3 dark:bg-white/3 border border-glass-border"
                          onClick={handleResetTemplate}
                        >
                          <RefreshCcw className="w-3 h-3" />
                          <span className="text-sm font-bold">{t('reset')}</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="sm:p-6 p-4 flex-1 flex flex-col min-h-0">
                    <div className="flex flex-col h-full gap-6">
                      <div className="space-y-2 flex flex-col shrink-0">
                        <Label className="text-sm font-bold  text-title-color">
                          {t('email_subject', { defaultValue: 'Email Subject' })}
                        </Label>
                        <Input
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder={t('enter_subject')}
                          className="dark:bg-black/40 bg-black/5 border-white/10 h-12 rounded-xl focus:ring-primary/30 text-base sm:text-lg font-medium"
                        />
                      </div>
                      <div className="space-y-2 flex flex-col flex-1 min-h-0">
                        <Label className="text-sm font-bold  text-title-color shrink-0">
                          {showPreview
                            ? t('preview', { defaultValue: 'Preview' })
                            : t('email_body', { defaultValue: 'Email Body (HTML)' })}
                        </Label>
                        <div className="rounded-border-radius overflow-hidden border border-white/10 bg-black relative flex-1 min-h-[400px]">
                          {showPreview ? (
                            <div className="absolute inset-0 bg-white overflow-auto p-4 animate-in fade-in duration-500 rounded-border-radius">
                              <iframe
                                srcDoc={previewContent}
                                className="w-full h-full border-none"
                                title="Template Preview"
                                // sandbox=""
                              />
                            </div>
                          ) : (
                            <div dir="ltr" className="absolute inset-0 overflow-hidden rounded-[1rem]">
                              <Editor
                                height="100%"
                                width="100%"
                                language="html"
                                theme="vs-dark"
                                value={content}
                                onChange={(value) => setContent(value || '')}
                                onMount={(editor) => {
                                  editorRef.current = editor
                                }}
                                options={{
                                  fontSize: 14,
                                  wordWrap: 'on',
                                  minimap: { enabled: false },
                                  lineNumbers: 'on',
                                  tabSize: 2,
                                  formatOnPaste: true,
                                  padding: { top: 16, bottom: 16 },
                                  scrollbar: {
                                    verticalScrollbarSize: 8,
                                    horizontalScrollbarSize: 8,
                                  },
                                }}
                                className="font-mono"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Info & Variables */}
              <div className="xl:col-span-4 space-y-6 h-full">
                <Card className="glass-card border-white/10 overflow-hidden dark:bg-white/3  bg-white rounded-border-radius h-full flex flex-col">
                  <CardHeader className="border-b border-glass-border sm:p-6 p-4 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Info className="w-4 h-4" />
                      </div>
                      <CardTitle className="text-sm font-bold truncate">
                        {t('available_variables', { defaultValue: 'Available Variables' })}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="sm:p-6 p-4 flex flex-col flex-1 min-h-0 gap-6">
                    <p className="text-sm text-subtitle-color leading-relaxed shrink-0">
                      {t('variables_instruction', {
                        defaultValue: 'Click a variable to insert it at the current cursor position.',
                      })}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2 flex-1 overflow-y-auto no-scrollbar pr-1">
                      {selectedTemplate.shortcodes?.map((variable) => (
                        <Button
                          key={variable.action}
                          onClick={() => insertVariable(variable.action)}
                          className="px-6 flex-col gap-0 items-start! py-2.5 rounded-[12px]! h-16.25 dark:bg-white/5!  border border-glass-border dark:text-white text-black transition-all text-start group"
                        >
                          <p className="text-sm font-bold mb-0.5  transition-colors">{variable.action}</p>
                          <p className="text-xs dark:text-white text-black line-clamp-1">{variable.text}</p>
                        </Button>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2 shrink-0">
                      <div className="flex items-center gap-2 text-primary">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-black">
                          {t('how_it_works', { defaultValue: 'How it works' })}
                        </span>
                      </div>
                      <p className="text-xs text-primary/80 font-medium">
                        {t('variable_how_to', {
                          defaultValue:
                            'Variables like {{user_email}} are replaced with real values. Ensure you keep the double curly braces.',
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="h-[400px] sm:h-[600px] rounded-border-radius border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-black/20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white/10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white/40 mb-2">
                {t('select_a_template', { defaultValue: 'Select a template' })}
              </h3>
              <p className="text-xs sm:text-sm text-white/20 max-w-xs">
                {t('select_template_to_edit', {
                  defaultValue: 'Choose an email event from the list to start customizing the content',
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGetContactInquiryByIdQuery } from '@/redux/api/contactInquiryApi'
import { InquiryDetailModalProps } from '@/types/shared'
import { formatDate } from '@/utils'
import { FileText, Loader2, Mail, MessageSquare, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppDirection } from '@/hooks/useAppDirection'

export function InquiryDetailModal({ inquiryId, isOpen, onClose }: InquiryDetailModalProps) {
  const { t } = useTranslation()
  const { data: inquiry, isLoading } = useGetContactInquiryByIdQuery(inquiryId!, {
    skip: !inquiryId || !isOpen,
  })
  const direction = useAppDirection()

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent  className="sm:max-w-xl! max-w-[calc(100%-2rem)]! p-0 overflow-hidden border-none rounded-border-radius bg-light-body dark:bg-modal-bg-color shadow-2xl">
        {/* Header with Background/Icon */}
        <div className="relative overflow-hidden">
          <DialogHeader className="relative z-10 items-start rtl:items-end">
            <div className="flex items-center gap-3 mb-2 rtl:flex-row-reverse">
              <DialogTitle className="text-xl font-bold tracking-tight text-title-color dark:text-white text-left rtl:text-right" >
                {t('contact_inquiry_details', { defaultValue: 'Inquiry Details' })}
              </DialogTitle>
            </div>
            <DialogDescription className="text-subtitle-color font-medium text-left rtl:text-right">
              {t('view_full_inquiry_information', { defaultValue: 'Full information for this contact inquiry' })}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content Body */}
        <div className="space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse">
                {t('loading_details', { defaultValue: 'Fetching details...' })}
              </p>
            </div>
          ) : inquiry ? (
            <div className="grid gap-4">
              {/* Main Info Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex items-start gap-3 p-4 rounded-2xl glass-card rtl:flex-row-reverse text-left rtl:text-right">
                  <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-muted-foreground mb-1">{t('name')}</p>
                    <p className="text-sm font-semibold text-title-color dark:text-white break-words">
                      {inquiry.inquiry.name}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 p-4 rounded-2xl glass-card rtl:flex-row-reverse text-left rtl:text-right">
                  <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
                    <Mail className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-muted-foreground mb-1">{t('email')}</p>
                    <p className="text-sm font-semibold text-title-color dark:text-white break-all">
                      {inquiry.inquiry.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="flex items-start gap-3 p-4 rounded-2xl glass-card rtl:flex-row-reverse text-left rtl:text-right">
                <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
                  <FileText className="h-4 w-4 text-orange-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-muted-foreground mb-1">{t('subject')}</p>
                  <p className="text-sm font-semibold text-title-color dark:text-white break-words">
                    {inquiry.inquiry.subject}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl glass-card text-left rtl:text-right">
                <div className="flex items-center gap-3 rtl:flex-row-reverse">
                  <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">{t('message')}</p>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none pt-1">
                  <p className="text-sm text-subtitle-color font-medium leading-relaxed whitespace-pre-wrap break-words">
                    {inquiry.inquiry.message}
                  </p>
                </div>
              </div>
              <div className="pt-3 mt-2 border-t border-zinc-200 dark:border-white/10 text-left rtl:text-right">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-title-color dark:text-white">{t('created')}:-</span>{' '}
                  {formatDate(inquiry.inquiry.created_at)}
                </p>             </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-destructive">
              <p className="text-sm font-semibold">
                {t('error_loading_inquiry', { defaultValue: 'Failed to load inquiry details.' })}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { useSectionRefs } from '@/context/SectionRefsContext'
import { motion } from 'framer-motion'
import { Mail, MessageCircle, Send, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Textarea } from '../ui/textArea'
import { WhatsAppIcon, whatsAppLink } from '../ui/WhatsAppIcon'
import Input from '../ui/input'
import { useCreateContactInquiryMutation } from '@/redux/api/contactInquiryApi'
import { toast } from 'sonner'
import Label from '../ui/label'
import { ContactFormValues, LandingPageData } from '@/types/landing'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { getLandingContactSchema } from '@/utils/validation-schemas/landingPage'

export default function LandingContact({ data }: { data?: LandingPageData['contact'] }) {
  const { t } = useTranslation()
  const { registerRef } = useSectionRefs()
  const [createInquiry] = useCreateContactInquiryMutation()
  const email = data?.email || 'info@omfinitive.com'
  const phone = data?.phone || '+91 99794 57999'

  const initialValues: ContactFormValues = {
    name: '',
    email: '',
    subject: '',
    message: '',
  }

  const landingContactSchema = getLandingContactSchema(t)

  const handleSubmit = async (values: ContactFormValues, { resetForm }: { resetForm: () => void }) => {
    try {
      const res = await createInquiry(values).unwrap()
      toast.success(res.message || t('message_sent_successfully'))
      resetForm()
    } catch (error) {
      const apiError = error as any
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
  }

  const sectionBadge = data?.section_badge || t('get_in_touch')
  const sectionTitle = data?.heading || t('have_questions_we_have')
  const sectionDescription = data?.subheading || t('contact_description')

  return (
    <section
      id="contact"
      ref={(el) => registerRef('contact', el)}
      className="relative py-24 md:py-30 overflow-hidden"
    >

      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-0 -translate-x-1/2 w-[50%] h-[500px] bg-primary/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-0 left-0 -translate-x-1/2 w-[40%] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 w-[70%] h-[500px] bg-primary/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 w-[50%] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {sectionBadge}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight"
            >
              {sectionTitle}{' '}
              {sectionTitle === t('have_questions_we_have') && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">{t('answers')}</span>
              )}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-white/70 mb-10"
            >
              {sectionDescription}
            </motion.p>

            <div className="space-y-8 flex flex-col sm:flex-row gap-6">
              <a href={`mailto:${email}`} className="flex items-center gap-4 mb-0 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">{t('email_us')}</h4>
                  <p className="text-base text-white/60 group-hover:text-primary transition-colors">{email}</p>
                </div>
              </a>
              <a href={whatsAppLink(phone)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold">{data?.live_chat_label || t('live_chat')}</h4>
                  <p className="text-white/40 group-hover:text-primary transition-colors">WhatsApp {phone}</p>
                </div>
              </a>
            </div>
          </div>

          <div className="flex-1 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="p-4 md:p-10 rounded-border-radius bg-white/5 border border-white/10 backdrop-blur-xl"
            >
              <Formik
                initialValues={initialValues}
                validationSchema={landingContactSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 flex flex-col">
                        <Label className="text-sm font-bold text-white/60 ml-1 flex-1 mb-1">{t('your_name')}</Label>
                        <Field name="name">
                          {({ field }: any) => (
                            <Input
                              {...field}
                              placeholder="John Doe"
                              className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-400/50 transition-all"
                            />
                          )}
                        </Field>
                        <ErrorMessage name="name">
                          {(msg) => <p className="text-xs text-red-400 ml-1">{msg}</p>}
                        </ErrorMessage>
                      </div>
                      <div className="space-y-2 flex flex-col">
                        <Label className="text-sm font-bold text-white/60 ml-1">{t('email_address')}</Label>
                        <Field name="email">
                          {({ field }: any) => (
                            <Input
                              {...field}
                              type="email"
                              placeholder="john@example.com"
                              className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-400/50 transition-all"
                            />
                          )}
                        </Field>
                        <ErrorMessage name="email">
                          {(msg) => <p className="text-xs text-red-400 ml-1">{msg}</p>}
                        </ErrorMessage>
                      </div>
                    </div>
                    <div className="space-y-2 flex flex-col">
                      <Label className="text-sm font-bold text-white/60 ml-1">{t('subject')}</Label>
                      <Field name="subject">
                        {({ field }: any) => (
                          <Input
                            {...field}
                            placeholder="How can we help?"
                            className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-400/50 transition-all"
                          />
                        )}
                      </Field>
                      <ErrorMessage name="subject">
                        {(msg) => <p className="text-xs text-red-400 ml-1">{msg}</p>}
                      </ErrorMessage>
                    </div>
                    <div className="space-y-2 flex flex-col">
                      <Label className="text-sm font-bold text-white/60 ml-1">{t('message')}</Label>
                      <Field name="message">
                        {({ field }: any) => (
                          <Textarea
                            {...field}
                            placeholder="Tell us more about your inquiry..."
                            className="min-h-[150px] rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-400/50 transition-all resize-none"
                          />
                        )}
                      </Field>
                      <ErrorMessage name="message">
                        {(msg) => <p className="text-xs text-red-400 ml-1">{msg}</p>}
                      </ErrorMessage>
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 primary-btn rounded-xl text-white! text-sm font-bold flex items-center justify-center ml-auto gap-2 transition-all"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {t('send_message')}
                          <Send className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
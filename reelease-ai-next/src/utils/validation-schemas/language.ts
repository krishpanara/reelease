import * as Yup from 'yup'

export const getFormSchema = (t: (key: string, options?: Record<string, any>) => string) =>
  Yup.object({
    name: Yup.string().required(t('language_name_required') || 'Language name is required'),
    locale: Yup.string().required(t('locale_required') || 'Locale is required'),
  })

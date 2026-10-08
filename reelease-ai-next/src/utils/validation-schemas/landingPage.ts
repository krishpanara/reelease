import * as Yup from 'yup'

export const getValidationSchemas = (
  t: (key: string, options?: Record<string, any>) => string,
) => ({
  BlogValidationSchema: Yup.object({
    title: Yup.string().required(t('title_is_required')),
    description: Yup.string().required(t('description_is_required')),
  }),

  ContactValidationSchema: Yup.object({
    heading: Yup.string().required(t('heading_is_required')),
    email: Yup.string().email(t('invalid_email')).required(t('email_is_required')),
  }),

  FAQValidationSchema: Yup.object({
    section_heading: Yup.string().required(t('heading_is_required')),
    section_subheading: Yup.string().required(t('subheading_is_required')),
  }),

  FeatureValidationSchema: Yup.object({
    section_heading: Yup.string().required(t('heading_is_required')),
  }),

  FooterValidationSchema: Yup.object({
    tagline: Yup.string().required(t('tagline_is_required')),
    copyright: Yup.string().required(t('copyright_is_required')),
  }),

  HeroValidationSchema: Yup.object({
    heading: Yup.string().required(t('heading_is_required')),
    subheading: Yup.string().required(t('subheading_is_required')),
  }),

  PricingValidationSchema: Yup.object({
    title: Yup.string().required(t('title_is_required')),
    description: Yup.string().required(t('description_is_required')),
  }),

  SocialValidationSchema: Yup.object({
    platforms: Yup.array().of(
      Yup.object({
        name: Yup.string().required(t('name_is_required')),
        title: Yup.string().required(t('title_is_required')),
      }),
    ),
  }),

  TestimonialsValidationSchema: Yup.object({
    section_heading: Yup.string().required(t('heading_is_required')),
    section_subheading: Yup.string().required(t('subheading_is_required')),
  }),
})

export const getLandingContactSchema = (t: (key: string, options?: Record<string, any>) => string) =>
  Yup.object({
      name: Yup.string().required(t('name_is_required')),
      email: Yup.string().email(t('invalid_email')).required(t('email_is_required')),
      subject: Yup.string().required(t('subject_is_required')),
      message: Yup.string().required(t('message_is_required')),
    })
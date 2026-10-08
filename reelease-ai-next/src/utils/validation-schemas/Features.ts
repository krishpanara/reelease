import * as Yup from 'yup'

export const getTestimonialModalSchema = (t: (key: string) => string) =>
  Yup.object().shape({
    title: Yup.string().required(
      t('title_required') || 'Title is required'
    ),

    description: Yup.string().required(
      t('description_required') || 'Description is required'
    ),

    user_name: Yup.string().required(
      t('user_name_required') || 'User name is required'
    ),

    user_post: Yup.string().required(
      t('user_post_required') || 'User post is required'
    ),

    rating: Yup.number()
      .min(1)
      .max(5)
      .required(),

    status: Yup.boolean().required(),
  })
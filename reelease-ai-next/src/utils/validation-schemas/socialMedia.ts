

  import * as Yup from 'yup'

export const getSocialConfigSchema = (t: (key: string, options?: any) => string) =>
  Yup.object().shape({
    facebook_app_id: Yup.string().required(
      t('meta_id_required')
    ),

    facebook_app_secret: Yup.string().required(
      t('meta_secret_required')
    ),

    facebook_api_version: Yup.string().required(
      t('field_required', {
        field: t('meta_api_version'),
      })
    ),

    threads_app_id: Yup.string().optional(),
    threads_app_secret: Yup.string().optional(),

    linkedin_client_id: Yup.string().optional(),
    linkedin_client_secret: Yup.string().optional(),

    twitter_consumer_key: Yup.string().optional(),
    twitter_consumer_secret: Yup.string().optional(),

    twitter_oauth_token: Yup.string().optional(),
    twitter_oauth_token_secret: Yup.string().optional(),

    twitter_client_id: Yup.string().optional(),
    twitter_client_secret: Yup.string().optional(),

    youtube_client_id: Yup.string().optional(),
    youtube_client_secret: Yup.string().optional(),
  })
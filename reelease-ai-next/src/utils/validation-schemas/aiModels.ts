import * as Yup from 'yup';

export const getModelSchema = (isEditing: boolean) =>
  Yup.object().shape({
    name: Yup.string().required('Model name is required'),
    model_id: Yup.string().required('Model ID is required'),
    provider: Yup.string().oneOf(['gemini', 'openai']).required('Provider is required'),
    api_key: isEditing
      ? Yup.string().optional()
      : Yup.string().required('API key is required'),
    credit_cost: Yup.number()
      .typeError('Credit cost must be a number')
      .min(1, 'Credit cost must be at least 1')
      .required('Credit cost is required'),
    max_output_tokens: Yup.number()
      .typeError('Max output tokens must be a number')
      .min(1, 'Max output tokens must be at least 1')
      .optional(),
    description: Yup.string().optional(),
    is_default: Yup.boolean().default(false),
    is_active: Yup.boolean().default(true),
  });
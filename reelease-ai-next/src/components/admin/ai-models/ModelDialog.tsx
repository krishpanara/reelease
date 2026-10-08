'use client';

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import { Textarea } from '@/components/ui/textArea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateCaptionModelMutation,
  useUpdateCaptionModelMutation,
  useGetCaptionModelByIdQuery,
} from '@/redux/api/aiCaptionModelApi';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getModelSchema } from '@/utils/validation-schemas/aiModels';



export default function ModelDialog({
  open,
  onOpenChange,
  modelId,
  onSuccess,
}: ModelDialogProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const isEditing = !!modelId;
  const { t } = useTranslation();
  const [createModel] = useCreateCaptionModelMutation();
  const [updateModel] = useUpdateCaptionModelMutation();

  const { data: modelData } = useGetCaptionModelByIdQuery(modelId || '', {
    skip: !modelId,
  });

  const formik = useFormik<ModelFormData>({
    initialValues: {
      name: '',
      model_id: '',
      provider: 'gemini',
      api_key: '',
      credit_cost: 10,
      max_output_tokens: 500,
      description: '',
      is_default: false,
      is_active: true,
    },
    validationSchema: getModelSchema(isEditing),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          credit_cost: Number(values.credit_cost),
          max_output_tokens: values.max_output_tokens ? Number(values.max_output_tokens) : undefined,
        };

        if (modelId) {
          await updateModel({
            id: modelId,
            data: {
              ...payload,
              // Only send api_key if it's provided (user wants to update it)
              api_key: payload.api_key || undefined,
            },
          }).unwrap();
          toast.success('Model updated successfully');
        } else {
          await createModel(payload).unwrap();
          toast.success('Model created successfully');
        }
        onSuccess();
        onOpenChange(false);
        formik.resetForm();
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to save model');
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (modelData?.data && modelId) {
      const model = modelData.data;
      formik.setValues({
        name: model.name,
        model_id: model.model_id,
        provider: model.provider,
        api_key: '', // Don't populate API key for security
        credit_cost: model.credit_cost,
        max_output_tokens: model.max_output_tokens || 500,
        description: model.description || '',
        is_default: model.is_default,
        is_active: model.is_active,
      });
    } else if (!modelId) {
      formik.resetForm();
    }
  }, [modelData, modelId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] max-w-[calc(100%-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Model' : 'Create New Model'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the AI caption model configuration'
              : 'Add a new AI model for caption generation'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2  grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Model Name *</Label>
              <Input
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g., Gemini 2.0 Flash"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-destructive text-left rtl:text-right">{formik.errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model_id">Model ID *</Label>
              <Input
                id="model_id"
                name="model_id"
                value={formik.values.model_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g., gemini-2.0-flash"
                disabled={isEditing}
              />
              {formik.touched.model_id && formik.errors.model_id && (
                <p className="text-sm text-destructive text-left rtl:text-right">{formik.errors.model_id}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Provider *</Label>
            <Select
              onValueChange={(value) =>
                formik.setFieldValue('provider', value)
              }
              value={formik.values.provider}
              disabled={isEditing}
            >
              <SelectTrigger className='bg-transparent!'>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.provider && formik.errors.provider && (
              <p className="text-sm text-destructive text-left rtl:text-right">{formik.errors.provider}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_key">
              API Key * {isEditing && '(leave empty to keep current)'}
            </Label>
            <div className="relative">
              <Input
                id="api_key"
                name="api_key"
                type={showApiKey ? 'text' : 'password'}
                value={formik.values.api_key}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={isEditing ? 'Enter new API key or leave empty' : 'Enter your API key'}
                className="pr-10 rtl:pr-5"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {formik.touched.api_key && formik.errors.api_key && (
              <p className="text-sm text-destructive text-left rtl:text-right">{formik.errors.api_key}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2  grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credit_cost">Credit Cost *</Label>
              <Input
                id="credit_cost"
                name="credit_cost"
                type="number"
                min="1"
                value={formik.values.credit_cost}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <p className="text-xs text-muted-foreground text-left rtl:text-right">
                Credits charged per caption generation
              </p>
              {formik.touched.credit_cost && formik.errors.credit_cost && (
                <p className="text-sm text-destructive text-left rtl:text-right">{formik.errors.credit_cost}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_output_tokens">Max Output Tokens</Label>
              <Input
                id="max_output_tokens"
                name="max_output_tokens"
                type="number"
                min="1"
                value={formik.values.max_output_tokens ?? ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <p className="text-xs text-muted-foreground text-left rtl:text-right">
                Maximum tokens in generated caption (default: 500)
              </p>
              {formik.touched.max_output_tokens && formik.errors.max_output_tokens && (
                <p className="text-sm text-destructive text-left rtl:text-right">{formik.errors.max_output_tokens}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              className='text-left rtl:text-right'
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Model description for admin reference"
              rows={3}
            />
          </div>

          <div className="grid sm:grid-cols-2  grid-cols-1 gap-4">
            <div className="flex rtl:flex-row-reverse items-center justify-between space-x-2 p-4 border rounded-lg bg-white/3">
              <div className="space-y-0.5">
                <Label>Set as Default</Label>
                <p className="text-xs text-muted-foreground text-left rtl:text-right">
                  This model will be used for caption generation
                </p>
              </div>
              <Switch
                checked={formik.values.is_default}
                onCheckedChange={(checked) => formik.setFieldValue('is_default', checked)}
              />
            </div>

            <div className="flex items-center rtl:flex-row-reverse justify-between space-x-2 p-4 border rounded-lg bg-white/3">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground text-left rtl:text-right">
                  Enable or disable this model
                </p>
              </div>
              <Switch
                checked={formik.values.is_active}
                onCheckedChange={(checked) => formik.setFieldValue('is_active', checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full sm:h-12 h-10 bg-white/3 hover:bg-destructive hover:text-white text-base text-light-text-color dark:text-white"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formik.isSubmitting} className="w-full sm:h-12 h-10 primary-btn  text-white! text-base">
              {formik.isSubmitting ? 'Saving...' : isEditing ? t('update') : t('add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

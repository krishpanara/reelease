
interface AICaptionModel {
  id: string;
  name: string;
  model_id: string;
  provider: 'gemini' | 'openai';
  api_key: string;
  is_default: boolean;
  is_active: boolean;
  credit_cost: number;
  description: string | null;
  max_output_tokens: number;
}

interface ModelCardProps {
  model: AICaptionModel;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  onToggleActive: (id: string) => void;
}

interface ModelFormData {
  name: string;
  model_id: string;
  provider: 'gemini' | 'openai';
  api_key: string;
  credit_cost: number;
  max_output_tokens?: number;
  description?: string;
  is_default: boolean;
  is_active: boolean;
}

interface ModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelId: string | null;
  onSuccess: () => void;
}
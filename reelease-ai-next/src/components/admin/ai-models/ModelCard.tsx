'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Star, Edit, Trash2 } from 'lucide-react';

const maskApiKey = (apiKey: string) => {
  if (!apiKey || apiKey.length <= 4) return apiKey;
  return '•'.repeat(apiKey.length - 4) + apiKey.slice(-4);
};

export default function ModelCard({
  model,
  onEdit,
  onDelete,
  onSetDefault,
  onToggleActive,
}: ModelCardProps) {
  return (
    <Card className={model.is_default ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{model.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={model.provider === 'gemini' ? 'default' : 'secondary'}
              >
                {model.provider === 'gemini' ? 'Gemini' : 'OpenAI'}
              </Badge>
              {model.is_default && (
                <Badge variant="outline">
                  <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                  Default
                </Badge>
              )}
            </div>
          </div>
          <Switch
            checked={model.is_active}
            onCheckedChange={() => onToggleActive(model.id)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">API Key</p>
            <p className="font-mono">{maskApiKey(model.api_key)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Credit Cost</p>
            <p className="font-semibold">{model.credit_cost} credits</p>
          </div>
          <div>
            <p className="text-muted-foreground">Max Tokens</p>
            <p>{model.max_output_tokens || 500}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Model ID</p>
            <p className="font-mono text-xs">{model.model_id}</p>
          </div>
        </div>
        {model.description && (
          <div className="pt-2 border-t">
            <p className="text-muted-foreground text-sm">{model.description}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(model.id)}
          >
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
          {!model.is_default && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetDefault(model.id)}
            >
              <Star className="mr-1 h-3 w-3" />
              Set Default
            </Button>
          )}
        </div>
        {!model.is_default && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(model.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

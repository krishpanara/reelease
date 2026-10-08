'use client'

import Input from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, useFormikContext } from 'formik'
import Label from '@/components/ui/label'
import { Textarea } from '@/components/ui/textArea'

export const ServiceField = ({
  label,
  name,
  placeholder,
  as: AsComponent = 'input',
  rows,
}: {
  label: string
  name: string
  placeholder?: string
  as?: 'input' | 'textarea'
  rows?: number
}) => (
  <div className="space-y-1.5 flex flex-col">
    <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
    {AsComponent === 'textarea' ? (
      <Field name={name}>
        {({ field }: { field: { value: string | null; name: string; onChange: any; onBlur: any } }) => (
          <Textarea
            {...field}
            value={field.value || ''}
            placeholder={placeholder}
            rows={rows || 4}
            className="w-full rounded-lg border border-glass-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-y font-mono transition-all duration-200"
          />
        )}
      </Field>
    ) : (
      <Field name={name}>
        {({ field }: { field: { value: string | null; name: string; onChange: any; onBlur: any } }) => (
          <Input
            {...field}
            value={field.value || ''}
            placeholder={placeholder}
            className="bg-white/3! border-glass-border focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
          />
        )}
      </Field>
    )}
  </div>
)

export const SelectField = ({ label, name, options }: { label: string; name: string; options: string[] }) => {
  const { setFieldValue } = useFormikContext<any>()
  return (
    <div className="space-y-1.5 flex flex-col">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <Field name={name}>
        {({ field }: any) => (
          <Select value={field.value} onValueChange={(val) => setFieldValue(name, val)}>
            <SelectTrigger className="h-11 w-full bg-white/3 border-glass-border">
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Field>
    </div>
  )
}

export const BooleanSelectField = ({ label, name }: { label: string; name: string }) => {
  const { setFieldValue } = useFormikContext<any>()
  return (
    <div className="space-y-1.5 flex flex-col">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <Field name={name}>
        {({ field }: any) => (
          <Select value={String(field.value)} onValueChange={(val) => setFieldValue(name, val === 'true')}>
            <SelectTrigger className="h-11 w-full bg-background/50 border-glass-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Fixed per Request</SelectItem>
              <SelectItem value="true">Per Second of Media</SelectItem>
            </SelectContent>
          </Select>
        )}
      </Field>
    </div>
  )
}

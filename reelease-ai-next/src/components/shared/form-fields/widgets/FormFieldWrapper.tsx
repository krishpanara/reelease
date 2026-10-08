'use client'

import Label from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { FormFieldWrapperProps } from '@/types'

const FormFieldWrapper = ({
  label,
  id,
  name,
  error,
  touched,
  helperText,
  layout = 'vertical',
  labelClass,
  formGroupClass,
  children,
}: FormFieldWrapperProps) => {
  const hasError = touched && !!error

  return (
    <div className={cn('space-y-1.5 flex flex-col', formGroupClass)}>
      {label && (
        <Label
          htmlFor={id}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground mb-2! text-left rtl:text-right',
            labelClass,
          )}
        >
          {label}
        </Label>
      )}
      <div className={cn('relative', layout === 'horizontal' && 'flex items-center gap-4')}>{children}</div>
      {hasError && <p className="text-xs font-medium text-destructive text-left rtl:text-right">{error}</p>}
      {helperText && !hasError && <p className="text-xs text-muted-foreground text-left rtl:text-right">{helperText}</p>}
    </div>
  )
}

export default FormFieldWrapper

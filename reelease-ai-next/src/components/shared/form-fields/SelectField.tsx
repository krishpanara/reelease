'use client'

import { cn } from '@/lib/utils'
import { SelectFieldProps } from '@/types'
import { useField } from 'formik'
import FormFieldWrapper from './widgets/FormFieldWrapper'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const SelectField = ({
  label,
  options,
  formGroupClass,
  labelClass,
  helperText,
  layout = 'vertical',
  ...props
}: SelectFieldProps) => {
  const [field, meta, helpers] = useField(props.name)

  return (
    <FormFieldWrapper
      label={label}
      id={props.id || props.name}
      name={props.name}
      error={meta.error}
      touched={meta.touched}
      helperText={helperText}
      layout={layout}
      labelClass={labelClass}
      formGroupClass={formGroupClass}
    >
      <Select
        value={field.value || ''}
        onValueChange={(value) => helpers.setValue(value)}
        disabled={props.disabled}
      >
        <SelectTrigger
          id={props.id || props.name}
          className={cn(
            'flex h-11 w-full rounded-radius px-3 py-2 text-sm glass-dark-card border border-glass-border focus-visible:outline-0 focus-visible:ring-0 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:text-subtitle-color',
            meta.touched && meta.error && 'border-destructive focus-visible:ring-destructive',
            props.className,
          )}
        >
          <SelectValue placeholder={props.placeholder || 'Select option'} />
        </SelectTrigger>
        <SelectContent className="dark:bg-[#0A0A0A] border-glass-border">
          {options.map((option: { label: string; value: string }, index: number) => (
            <SelectItem key={`${option.value}-${index}`} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  )
}

export default SelectField

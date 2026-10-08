'use client'

import { MultiSelectFormFieldProps } from '@/types'
import { useField } from 'formik'
import MultiSelectField from './MultiSelectField'


export default function MultiSelectFormField({
  label,
  name,
  options,
  placeholder,
  className,
  isLoading
}: MultiSelectFormFieldProps) {
  const [field, meta, helpers] = useField(name)

  return (
    <MultiSelectField
      label={label}
      options={options}
      value={field.value || []}
      onChange={(val) => helpers.setValue(val)}
      placeholder={isLoading ? 'Loading...' : placeholder}
      error={meta.touched && meta.error ? meta.error : undefined}
      className={className}
    />
  )
}

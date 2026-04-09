'use client'
import type { FieldProps } from './types'

export default function TextareaField({ field, value, onChange }: FieldProps<string>) {
  return (
    <div>
      <label>{field.label}</label>
      <textarea
        value={value ?? ''}
        required={field.required}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

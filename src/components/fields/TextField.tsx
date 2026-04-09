'use client'
import type { FieldProps } from './types'

export default function TextField({ field, value, onChange }: FieldProps<string>) {
  return (
    <div>
      <label>{field.label}</label>
      <input
        type="text"
        value={value ?? ''}
        required={field.required}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

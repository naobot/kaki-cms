'use client'
import type { FieldProps } from './types'

export default function NumberField({ field, value, onChange }: FieldProps<number>) {
  return (
    <div>
      <label>{field.label}</label>
      <input
        type="number"
        value={value ?? ''}
        required={field.required}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  )
}

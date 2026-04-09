'use client'
import type { FieldProps } from './types'

export default function NumberField({ field, value, onChangeAction }: FieldProps<number>) {
  return (
    <div>
      <label>{field.label}</label>
      <input
        type="number"
        value={value ?? ''}
        required={field.required}
        onChange={e => onChangeAction(Number(e.target.value))}
      />
    </div>
  )
}

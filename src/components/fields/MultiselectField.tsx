'use client'
import type { FieldProps } from './types'

export default function MultiselectField({ field, value, onChange }: FieldProps<string[]>) {
  const selected = value ?? []

  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter(v => v !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div>
      <label>{field.label}</label>
      <div>
        {(field.options ?? []).map(option => (
          <label key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  )
}

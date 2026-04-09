'use client'
import type { FieldProps } from './types'

export default function ListField({ field, value, onChange }: FieldProps<string[]>) {
  const items = value ?? []

  function updateItem(index: number, newValue: string) {
    const updated = [...items]
    updated[index] = newValue
    onChange(updated)
  }

  function addItem() {
    onChange([...items, ''])
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label>{field.label}</label>
      {items.map((item, index) => (
        <div key={index}>
          <input
            type="text"
            value={item}
            onChange={e => updateItem(index, e.target.value)}
          />
          <button type="button" onClick={() => removeItem(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addItem}>Add {field.label}</button>
    </div>
  )
}

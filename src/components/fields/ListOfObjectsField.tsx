'use client'
import type { FieldProps } from './types'
import type { Field } from '@/lib/cms/types'
import FieldRenderer from '../FieldRenderer'

type ObjectValue = Record<string, unknown>

export default function ListOfObjectsField({ field, value, onChange }: FieldProps<ObjectValue[]>) {
  const items = value ?? []

  function updateItem(index: number, fieldName: string, newValue: unknown) {
    const updated = [...items]
    updated[index] = { ...updated[index], [fieldName]: newValue }
    onChange(updated)
  }

  function addItem() {
    onChange([...items, {}])
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label>{field.label}</label>
      {items.map((item, index) => (
        <div key={index}>
          {(field.fields ?? []).map(subField => (
            <FieldRenderer
              key={subField.name}
              field={subField}
              value={item[subField.name]}
              onChange={newValue => updateItem(index, subField.name, newValue)}
            />
          ))}
          <button type="button" onClick={() => removeItem(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem}>Add {field.label}</button>
    </div>
  )
}

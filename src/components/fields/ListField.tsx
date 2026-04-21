'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { FieldProps } from './types'
import FieldLabel from './FieldLabel'

export default function ListField({ field, value, onChangeAction }: FieldProps<string[]>) {
  const items = value ?? []

  function updateItem(index: number, newValue: string) {
    const updated = [...items]
    updated[index] = newValue
    onChangeAction(updated)
  }

  function addItem() {
    onChangeAction([...items, ''])
  }

  function removeItem(index: number) {
    onChangeAction(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <div className="flex flex-col gap-2 pt-1">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="text"
              value={item}
              onChange={e => updateItem(index, e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeItem(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={addItem}
        >
          + Add {field.label}
        </Button>
      </div>
    </div>
  )
}
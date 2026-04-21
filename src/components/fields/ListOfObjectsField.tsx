'use client'
import type { FieldProps } from './types'
import FieldRenderer from '@/components/FieldRenderer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import FieldLabel from './FieldLabel'

type ObjectValue = Record<string, unknown>

export default function ListOfObjectsField({ field, value, onChangeAction }: FieldProps<ObjectValue[]>) {
  const items = value ?? []

  function updateItem(index: number, fieldName: string, newValue: unknown) {
    const updated = [...items]
    updated[index] = { ...updated[index], [fieldName]: newValue }
    onChangeAction(updated)
  }

  function addItem() {
    onChangeAction([...items, {}])
  }

  function removeItem(index: number) {
    onChangeAction(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <div className="flex flex-col gap-4 pt-1">
        {items.map((item, index) => (
          <div key={index} className="border rounded-md p-4 flex flex-col gap-4">
            {(field.fields ?? []).map(subField => (
              <FieldRenderer
                key={subField.name}
                field={subField}
                value={item[subField.name]}
                onChangeAction={newValue => updateItem(index, subField.name, newValue)}
              />
            ))}
            <Separator />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
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
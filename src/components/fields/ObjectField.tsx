'use client'
import type { Field } from '@/lib/cms/types'
import { Label } from '@/components/ui/label'
import FieldRenderer from '@/components/FieldRenderer'

type Props = {
  field: Field
  value: unknown
  onChangeAction: (value: unknown) => void
}

export default function ObjectField({ field, value, onChangeAction }: Props) {
  const obj = (value ?? {}) as Record<string, unknown>

  function updateSubField(name: string, subValue: unknown) {
    onChangeAction({ ...obj, [name]: subValue })
  }

  if (!field.fields?.length) {
    return <div>Object field &quot;{field.name}&quot; has no fields defined</div>
  }

  return (
    <div className="space-y-1">
      <Label>{field.label}</Label>
      <div className="rounded-lg border p-4 flex flex-col gap-4 mt-1">
        {field.fields.map(subField => (
          <FieldRenderer
            key={subField.name}
            field={subField}
            value={obj[subField.name]}
            onChangeAction={value => updateSubField(subField.name, value)}
          />
        ))}
      </div>
    </div>
  )
}
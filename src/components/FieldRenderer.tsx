'use client'
import type { Field } from '@/lib/cms/types'
import TextField from './fields/TextField'
import TextareaField from './fields/TextareaField'
import NumberField from './fields/NumberField'
import MultiselectField from './fields/MultiselectField'
import ListField from './fields/ListField'
import ListOfObjectsField from './fields/ListOfObjectsField'

type Props = {
  field: Field
  value: unknown
  onChange: (value: unknown) => void
}

const componentMap = {
  'text': TextField,
  'textarea': TextareaField,
  'number': NumberField,
  'multiselect': MultiselectField,
  'list': ListField,
  'list-of-objects': ListOfObjectsField,
} as const

export default function FieldRenderer({ field, value, onChange }: Props) {
  const Component = componentMap[field.type as keyof typeof componentMap]

  if (!Component) {
    return <div>Unknown field type: {field.type}</div>
  }

  return (
    <Component
      field={field}
      value={value as never}
      onChange={onChange as never}
    />
  )
}

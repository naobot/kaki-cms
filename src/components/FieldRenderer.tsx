'use client'
import type { Field } from '@/lib/cms/types'
import TextField from '@/components/fields/TextField'
import TextareaField from '@/components/fields/TextareaField'
import NumberField from '@/components/fields/NumberField'
import MultiselectField from '@/components/fields/MultiselectField'
import ListField from '@/components/fields/ListField'
import ListOfObjectsField from '@/components/fields/ListOfObjectsField'
import ImageField from '@/components/fields/ImageField'
import ImageListField from '@/components/fields/ImageListField'
import RichTextField from './fields/RichTextField'

type Props = {
  field: Field
  value: unknown
  onChangeAction: (value: unknown) => void
}

const componentMap = {
  'text': TextField,
  'textarea': TextareaField,
  'number': NumberField,
  'multiselect': MultiselectField,
  'list': ListField,
  'list-of-objects': ListOfObjectsField,
  'image': ImageField,
  'image-list': ImageListField,
  'rich-text': RichTextField,
} as const

export default function FieldRenderer({ field, value, onChangeAction }: Props) {
  const Component = componentMap[field.type as keyof typeof componentMap]

  if (!Component) {
    return <div>Unknown field type: {field.type}</div>
  }

  return (
    <Component
      field={field}
      value={value as never}
      onChangeAction={onChangeAction as never}
    />
  )
}

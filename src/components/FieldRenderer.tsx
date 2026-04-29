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
import RichTextField from '@/components/fields/RichTextField'
import ObjectField from '@/components/fields/ObjectField'
import DatetimeField from '@/components/fields/DatetimeField'
import BooleanField from '@/components/fields/BooleanField'
import type { FieldProps } from '@/components/fields/types'

type Props = {
  field: Field
  value: unknown
  onChangeAction: (value: unknown) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFieldComponent = React.ComponentType<FieldProps<any>>

const componentMap: Record<string, AnyFieldComponent> = {
  'text': TextField,
  'textarea': TextareaField,
  'number': NumberField,
  'multiselect': MultiselectField,
  'list': ListField,
  'list-of-objects': ListOfObjectsField,
  'image': ImageField,
  'image-list': ImageListField,
  'rich-text': RichTextField,
  'object': ObjectField,
  'datetime': DatetimeField,
  'boolean': BooleanField
}

export default function FieldRenderer({ field, value, onChangeAction }: Props) {
  const Component = componentMap[field.type]

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

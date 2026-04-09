import type { Field } from '@/lib/cms/types'

export type FieldProps<T = unknown> = {
  field: Field
  value: T
  onChangeAction: (value: T) => void
}

'use client'
import type { FieldProps } from './types'
import { Textarea } from '@/components/ui/textarea'
import FieldLabel from './FieldLabel'

export default function TextareaField({ field, value, onChangeAction }: FieldProps<string>) {
  return (
    <div>
      <FieldLabel field={field} />
      <div className="flex flex-col gap-4 pt-1">
        <Textarea
          value={value ?? ''}
          required={field.required}
          onChange={e => onChangeAction(e.target.value)}
        />
      </div>
    </div>
  )
}

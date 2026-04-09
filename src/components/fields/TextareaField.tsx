'use client'
import type { FieldProps } from './types'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function TextareaField({ field, value, onChangeAction }: FieldProps<string>) {
  return (
    <div>
      <Label>{field.label}</Label>
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

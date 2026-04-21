'use client'
import { Input } from '@/components/ui/input'
import type { FieldProps } from './types'
import FieldLabel from './FieldLabel'

export default function TextField({ field, value, onChangeAction }: FieldProps<string>) {
  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <div className="flex flex-col gap-4 pt-1">
        <Input
          value={value ?? ''}
          required={field.required}
          onChange={e => onChangeAction(e.target.value)}
        />
      </div>
    </div>
  )
}
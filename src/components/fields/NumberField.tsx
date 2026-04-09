'use client'
import type { FieldProps } from './types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default function NumberField({ field, value, onChangeAction }: FieldProps<number>) {
  return (
    <div>
      <Label>{field.label}</Label>
      <div className="flex flex-col gap-4 pt-1">
        <Input
          type="number"
          value={value ?? ''}
          required={field.required}
          onChange={e => onChangeAction(Number(e.target.value))}
        />
      </div>
    </div>
  )
}

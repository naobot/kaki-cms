'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FieldProps } from './types'

export default function TextField({ field, value, onChangeAction }: FieldProps<string>) {
  return (
    <div className="space-y-1">
      <Label>{field.label}</Label>
      <Input
        value={value ?? ''}
        required={field.required}
        onChange={e => onChangeAction(e.target.value)}
      />
    </div>
  )
}
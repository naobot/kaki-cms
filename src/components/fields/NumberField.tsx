'use client'
import type { FieldProps } from './types'
import { Input } from '@/components/ui/input'
import FieldLabel from './FieldLabel'

export default function NumberField({ field, value, onChangeAction }: FieldProps<number>) {
  return (
    <div>
      <FieldLabel field={field} />
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

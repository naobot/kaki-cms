'use client'
import { Input } from '@/components/ui/input'
import type { FieldProps } from './types'
import FieldLabel from './FieldLabel'

function toLocalDatetime(value: string | undefined): string {
  if (!value) return ''
  // datetime-local expects YYYY-MM-DDTHH:mm
  // Strip timezone suffix (Z or ±HH:mm) before slicing
  return value.replace(/([+-]\d{2}:\d{2}|Z)$/, '').slice(0, 16)
}

function toISOString(value: string): string {
  if (!value) return ''
  return value + ':00.000Z'
}

export default function DatetimeField({ field, value, onChangeAction }: FieldProps<string>) {
  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <div className="flex flex-col gap-4 pt-1">
        <Input
          type="datetime-local"
          value={toLocalDatetime(value)}
          required={field.required}
          onChange={e => onChangeAction(toISOString(e.target.value))}
        />
      </div>
    </div>
  )
}

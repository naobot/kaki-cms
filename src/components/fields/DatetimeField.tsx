'use client'
import { Input } from '@/components/ui/input'
import type { FieldProps } from './types'
import FieldLabel from './FieldLabel'

function toLocalDatetime(value: string | undefined): string {
  if (!value) return ''
  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) return ''
    // datetime-local expects YYYY-MM-DDTHH:mm
    return date.toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

function toISOString(value: string): string {
  if (!value) return ''
  // Append seconds and UTC timezone to make a full ISO string
  return new Date(value + ':00Z').toISOString()
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

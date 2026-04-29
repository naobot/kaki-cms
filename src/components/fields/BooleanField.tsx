'use client'
import type { FieldProps } from './types'
import FieldLabel from './FieldLabel'

export default function BooleanField({ field, value, onChangeAction }: FieldProps<boolean>) {
  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          checked={value ?? false}
          required={field.required}
          onChange={e => onChangeAction(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
      </div>
    </div>
  )
}

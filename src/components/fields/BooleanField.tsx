'use client'
import type { FieldProps } from './types'
import FieldLabel from './FieldLabel'

export default function BooleanField({ field, value, onChangeAction }: FieldProps<boolean>) {
  return (
    <div className="space-y-1 flex gap-2 items-center">
      <FieldLabel field={field} />
      <div>
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

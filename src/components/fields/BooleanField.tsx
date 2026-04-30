'use client'
import type { FieldProps } from './types'
import FieldLabel from './FieldLabel'
import { Switch } from '@/components/ui/switch'

export default function BooleanField({ field, value, onChangeAction }: FieldProps<boolean>) {
  return (
    <div className="space-y-1 flex gap-2 items-center">
      <FieldLabel field={field} />
      <div>
        <Switch
          id="published"
          checked={value ?? false}
          onCheckedChange={value => onChangeAction(value)}
        />
      </div>
    </div>
  )
}

'use client'
import type { FieldProps } from './types'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function MultiselectField({ field, value, onChangeAction }: FieldProps<string[]>) {
  const selected = value ?? []

  function toggle(option: string) {
    if (selected.includes(option)) {
      onChangeAction(selected.filter(v => v !== option))
    } else {
      onChangeAction([...selected, option])
    }
  }

  return (
    <div className="space-y-1">
      <Label>{field.label}</Label>
      <div className="flex flex-col gap-2 pt-1">
        {(field.options ?? []).map(option => (
          <div key={option} className="flex items-center gap-2">
            <Checkbox
              id={`${field.name}-${option}`}
              checked={selected.includes(option)}
              onCheckedChange={() => toggle(option)}
            />
            <Label htmlFor={`${field.name}-${option}`} className="font-normal cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
import { Label } from '@/components/ui/label'

type Props = {
  field: { label: string; required?: boolean }
  children?: React.ReactNode
}

export default function FieldLabel({ field, children }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  )
}

'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FieldProps } from './types'
import FieldLabel from './FieldLabel'

const TIMEZONES = [
  // North America
  'America/St_Johns',
  'America/Halifax',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  // Canada specific
  'America/Toronto',
  'America/Vancouver',
  'America/Winnipeg',
  'America/Edmonton',
  // Latin America
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'America/Bogota',
  'America/Mexico_City',
  // Europe
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Warsaw',
  'Europe/Prague',
  'Europe/Vienna',
  'Europe/Zurich',
  'Europe/Lisbon',
  'Europe/Moscow',
  // Asia
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  // Oceania
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Pacific/Auckland',
  // UTC
  'UTC',
]

const LOCAL_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

function toLocalDatetime(value: string | Date | undefined): string {
  if (!value) return ''
  const str = value instanceof Date
    ? (value as Date).toISOString()
    : String(value)
  const stripped = str.replace(/([+-]\d{2}:\d{2}|Z)$/, '').slice(0, 16)
  if (stripped.length === 10) return stripped + 'T00:00'
  return stripped
}

function getOffsetString(timezone: string, datetime: string): string {
  // Get the UTC offset for a given IANA timezone at a given moment
  // We use the datetime value to correctly account for DST
  const date = new Date(datetime + 'Z')
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  })
  const parts = formatter.formatToParts(date)
  const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0'
  // offsetPart is like "GMT+10" or "GMT-4" — convert to ±HH:mm
  const match = offsetPart.match(/GMT([+-])(\d+)(?::(\d+))?/)
  if (!match) return '+00:00'
  const sign = match[1]
  const hours = match[2].padStart(2, '0')
  const minutes = (match[3] ?? '0').padStart(2, '0')
  return `${sign}${hours}:${minutes}`
}

function guessTimezone(value: string): string {
  // Try to find an IANA timezone that matches the stored offset
  const offsetMatch = value.match(/([+-]\d{2}:\d{2})$/)
  if (!offsetMatch) return LOCAL_TIMEZONE
  const storedOffset = offsetMatch[1]
  const datetime = value.slice(0, 16)
  return TIMEZONES.find(tz => getOffsetString(tz, datetime) === storedOffset) ?? LOCAL_TIMEZONE
}

function serialise(datetime: string, timezone: string): string {
  if (!datetime) return ''
  const offset = getOffsetString(timezone, datetime)
  return `${datetime}:00${offset}`
}

export default function DatetimeField({ field, value, onChangeAction }: FieldProps<string>) {
  const [timezone, setTimezone] = useState<string>(() => {
    if (field.timezone && value) return guessTimezone(String(value))
    return LOCAL_TIMEZONE
  })

  const datetimeValue = toLocalDatetime(value as string | undefined)

  function handleDatetimeChange(newDatetime: string) {
    if (field.timezone) {
      onChangeAction(serialise(newDatetime, timezone))
    } else {
      onChangeAction(newDatetime ? newDatetime + ':00.000Z' : '')
    }
  }

  function handleTimezoneChange(newTimezone: string) {
    setTimezone(newTimezone)
    if (datetimeValue) {
      onChangeAction(serialise(datetimeValue, newTimezone))
    }
  }

  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <div className="flex flex-col gap-2 pt-1">
        <Input
          type="datetime-local"
          value={datetimeValue}
          required={field.required}
          onChange={e => handleDatetimeChange(e.target.value)}
        />
        {field.timezone && (
          <Select value={timezone} onValueChange={handleTimezoneChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map(tz => {
                const offset = getOffsetString(tz, new Date().toISOString().slice(0, 16))
                return (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')} (GMT{offset})
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
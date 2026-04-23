export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
}

export function resolveSlug(base: string, existing: string[]): string {
  const reserved = new Set(['new', ...existing])
  if (!reserved.has(base)) return base
  let i = 2
  while (reserved.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

export function sanitiseFilename(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  const name = lastDot !== -1 ? filename.slice(0, lastDot) : filename
  const ext = lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : ''

  const sanitised = name
    .normalize('NFD')           // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '') // strip diacritic marks
    .replace(/[^a-zA-Z0-9\s-]/g, '') // strip non-ASCII/non-alphanumeric
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()

  return sanitised + ext
}
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

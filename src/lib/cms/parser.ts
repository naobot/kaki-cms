import matter from 'gray-matter'
import type { Collection } from './types'

export type ParsedDocument = {
  frontmatter: Record<string, unknown>
  body: string
  sha: string
}

export function parseDocument(rawContent: string, sha: string): ParsedDocument {
  const { data, content } = matter(rawContent)
  return {
    frontmatter: data,
    body: content,
    sha,
  }
}

export function serialiseDocument(frontmatter: Record<string, unknown>, body: string): string {
  return matter.stringify(body, frontmatter)
}

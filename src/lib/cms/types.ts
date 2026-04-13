export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'rich-text'
  | 'list'
  | 'multiselect'
  | 'list-of-objects'

export type Field = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: string[]   // for multiselect
  fields?: Field[]     // for list-of-objects, recursive
}

export type Collection = {
  name: string
  label: string
  path: string
  fields: Field[]
}

export type CMSConfig = {
  collections: Collection[]
  assets_path?: string
}
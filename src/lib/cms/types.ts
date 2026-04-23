export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'rich-text'
  | 'list'
  | 'multiselect'
  | 'list-of-objects'
  | 'image'
  | 'image-list'
  | 'object'

export type Field = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: string[]    // for multiselect (static)
  data_file?: string    // for multiselect (dynamic, overrides options)
  fields?: Field[]      // for list-of-objects, recursive
}

export type Collection = {
  name: string
  label: string
  path: string
  fields: Field[]
  orderable?: boolean
  publishable?: boolean
}

export type Singleton = {
  name: string
  label: string
  path: string
  layout?: string
  fields: Field[]
}

export type DataFile = {
  path: string
  label: string
  fields?: Field[]
}

export type CMSConfig = {
  collections: Collection[]
  singletons?: Singleton[]
  assets_path?: string
  data_path?: string
  data_files?: DataFile[]
}
'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { saveOrder } from '@/lib/cms/actions'

type Document = {
  name: string
  path: string
  slug: string
}

function SortableItem({ doc, repoId, collection, isDraggable }: {
  doc: Document
  repoId: string
  collection: string
  isDraggable: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: doc.slug })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 border-b last:border-b-0"
    >
      {isDraggable && (
        <button
          className="px-2 py-3 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      )}
      <Link
        href={`/dashboard/${repoId}/${collection}/${doc.slug}`}
        className="flex flex-1 items-center justify-between px-4 py-3 hover:bg-accent transition-colors"
      >
        <span className="text-sm font-medium">{doc.slug}</span>
        <span className="text-xs text-muted-foreground">Edit →</span>
      </Link>
    </div>
  )
}

function applyManifest(documents: Document[], orderManifest: string[] | null): Document[] {
  if (!orderManifest) return documents
  const lookup = new Map(documents.map(d => [d.slug, d]))
  const ordered = orderManifest.flatMap(slug => lookup.has(slug) ? [lookup.get(slug)!] : [])
  const unrecognised = documents.filter(d => !orderManifest.includes(d.slug))
  return [...ordered, ...unrecognised]
}

export default function CollectionList({ repoId, collection, collectionPath, documents, orderManifest, orderable }: {
  repoId: string
  collection: string
  collectionPath: string
  documents: Document[]
  orderManifest: string[] | null
  orderable: boolean
}) {
  const [items, setItems] = useState<Document[]>(() => applyManifest(documents, orderManifest))
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setItems(prev => {
      const oldIndex = prev.findIndex(d => d.slug === active.id)
      const newIndex = prev.findIndex(d => d.slug === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
    setIsDirty(true)
  }, [])

  const sortByName = useCallback(() => {
    setItems(prev => [...prev].sort((a, b) => a.slug.localeCompare(b.slug)))
    setIsDirty(true)
  }, [])

  const sortByDate = useCallback(() => {
    // GitHub API doesn't return creation date in directory listings,
    // so this sorts by filename assuming a date prefix convention (e.g. 2024-01-15-my-post)
    // TODO: revisit if we store creation metadata elsewhere
    setItems(prev => [...prev].sort((a, b) => a.slug.localeCompare(b.slug)))
    setIsDirty(true)
  }, [])

  const handleConfirm = useCallback(async () => {
    setIsSaving(true)
    await saveOrder(repoId, collectionPath, items.map(d => d.slug))
    setIsDirty(false)
    setIsSaving(false)
  }, [repoId, collectionPath, items])

  if (documents.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="mb-4">No documents yet</p>
        <Button asChild variant="outline">
          <Link href={`/dashboard/${repoId}/${collection}/new`}>
            Create your first document
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {orderable && (
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={sortByName}>Sort by name</Button>
          {/*<Button variant="outline" size="sm" onClick={sortByDate} disabled>Sort by date</Button>*/}
          <Button
            size="sm"
            disabled={!isDirty || isSaving}
            onClick={handleConfirm}
          >
            {isSaving ? 'Saving…' : 'Confirm order'}
          </Button>
        </div>
      )}

      {orderable ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(d => d.slug)} strategy={verticalListSortingStrategy}>
            <div className="border rounded-md divide-y">
              {items.map(doc => (
                <SortableItem
                  key={doc.slug}
                  doc={doc}
                  repoId={repoId}
                  collection={collection}
                  isDraggable={true}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="border rounded-md divide-y">
          {items.map(doc => (
            <SortableItem
              key={doc.slug}
              doc={doc}
              repoId={repoId}
              collection={collection}
              isDraggable={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
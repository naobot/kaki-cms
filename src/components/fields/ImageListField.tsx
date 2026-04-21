'use client'
import { useState, useCallback } from 'react'
import { useRepo } from '@/lib/cms/context'
import { Button } from '@/components/ui/button'
import MediaLibrary from '@/components/MediaLibrary'
import type { FieldProps } from './types'
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
import FieldLabel from './FieldLabel'

type ImageItem = { image: string }

function SortableImageItem({ id, item, repoGithubRepo, onRemove }: {
  id: string
  item: ImageItem
  repoGithubRepo: string
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const previewUrl = `https://raw.githubusercontent.com/${repoGithubRepo}/HEAD/public${item.image}`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 border rounded-md p-2"
    >
      <button
        className="px-1 py-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <img
        src={previewUrl}
        alt={item.image}
        className="h-16 w-24 object-cover rounded border"
      />
      <span className="text-xs text-muted-foreground flex-1 truncate">{item.image}</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRemove}
      >
        Remove
      </Button>
    </div>
  )
}

export default function ImageListField({ field, value, onChangeAction }: FieldProps<ImageItem[]>) {
  const { repo } = useRepo()
  const [open, setOpen] = useState(false)
  const items = value ?? []

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((_, i) => String(i) === active.id)
    const newIndex = items.findIndex((_, i) => String(i) === over.id)
    onChangeAction(arrayMove(items, oldIndex, newIndex))
  }, [items, onChangeAction])

  const handleSelect = useCallback((path: string) => {
    onChangeAction([...items, { image: path }])
    setOpen(false)
  }, [items, onChangeAction])

  const handleRemove = useCallback((index: number) => {
    onChangeAction(items.filter((_, i) => i !== index))
  }, [items, onChangeAction])

  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <div className="flex flex-col gap-2 pt-1">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">No images yet</p>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((_, i) => String(i))}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item, index) => (
              <SortableImageItem
                key={index}
                id={String(index)}
                item={item}
                repoGithubRepo={repo.github_repo}
                onRemove={() => handleRemove(index)}
              />
            ))}
          </SortableContext>
        </DndContext>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setOpen(true)}
        >
          + Add image
        </Button>
      </div>
      <MediaLibrary
        open={open}
        onOpenChangeAction={setOpen}
        repoId={repo.id}
        onSelectAction={handleSelect}
      />
    </div>
  )
}
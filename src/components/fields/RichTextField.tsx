'use client'
import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { marked } from 'marked'
import TurndownService from 'turndown'
import type { FieldProps } from './types'
import { Label } from '@/components/ui/label'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Minus } from 'lucide-react'

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})

type Props = FieldProps<string>

export default function RichTextField({ field, value, onChangeAction }: Props) {
  const initialised = useRef(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: '',
    onUpdate({ editor }) {
      const html = editor.getHTML()
      const markdown = turndown.turndown(html)
      onChangeAction(markdown)
    },
  })

  // Set initial content once on mount
  useEffect(() => {
    if (!editor || initialised.current) return
    const html = marked.parse(value ?? '') as string
    editor.commands.setContent(html, { emitUpdate: false })
    initialised.current = true
  }, [editor, value])

  function setLink() {
    const url = window.prompt('URL')
    if (!url) return
    editor?.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{field.label}</Label>

      <div>
        {/* Toolbar */}
        <div className="flex items-center gap-1 border rounded-t-md px-2 py-1 bg-muted/40">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive('bold')}
            title="Bold"
          >
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive('italic')}
            title="Italic"
          >
            <Italic size={14} />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive('bulletList')}
            title="Bullet list"
          >
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive('orderedList')}
            title="Ordered list"
          >
            <ListOrdered size={14} />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            onClick={setLink}
            active={editor?.isActive('link')}
            title="Link"
          >
            <LinkIcon size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          >
            <Minus size={14} />
          </ToolbarButton>
        </div>

        {/* Editor */}
        <EditorContent
          editor={editor}
          className="min-h-48 max-h-[500px] overflow-y-auto border border-t-0 rounded-b-md px-3 py-2 text-sm prose prose-sm max-w-none focus-within:outline-none"
        />
      </div>
    </div>
  )
}

function ToolbarButton({ onClick, active, title, children }: {
  onClick: () => void
  active?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-border mx-0.5" />
}

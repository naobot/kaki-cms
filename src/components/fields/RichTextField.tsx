'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { marked } from 'marked'
import TurndownService from 'turndown'
import type { FieldProps } from './types'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Minus, Code2 } from 'lucide-react'
import FieldLabel from './FieldLabel'
import { useRepo } from '@/lib/cms/context'
import MediaLibrary from '@/components/MediaLibrary'
import { EmbedNode } from './EmbedNode'

type Props = FieldProps<string>

export default function RichTextField({ field, value, onChangeAction }: Props) {
  const initialised = useRef(false)
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const { repo, config } = useRepo()
  const baseUrl = config.base_url ?? ''

  const turndown = useMemo(() => {
    const td = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
    })

    td.addRule('image', {
      filter: 'img',
      replacement: (_content, node) => {
        const img = node as HTMLImageElement
        const alt = img.getAttribute('alt') ?? ''
        const src = (img.getAttribute('src') ?? '').replace(baseUrl, '')
        return `![${alt}](${src})`
      },
    })

    td.addRule('embed', {
      filter: (node) => node.nodeName === 'DIV' && node.getAttribute('data-type') === 'embed',
      replacement: (_content, node) => {
        const html = (node as HTMLElement).getAttribute('data-html') ?? ''
        return `\n\n${html}\n\n`
      },
    })

    return td
  }, [baseUrl])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      EmbedNode,
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

    // Display images in rich text editor from correct base URL
    if (baseUrl) {
      const doc = new DOMParser().parseFromString(html, 'text/html')
      doc.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src') ?? ''
        if (src.startsWith('/')) {
          img.setAttribute('src', baseUrl + src)
        }
      })
      editor.commands.setContent(doc.body.innerHTML, { emitUpdate: false })
    } else {
      editor.commands.setContent(html, { emitUpdate: false })
    }

    initialised.current = true
  }, [editor, value])

  function setLink() {
    const url = window.prompt('URL')
    if (!url) return
    editor?.chain().focus().setLink({ href: url }).run()
  }

  function insertEmbed() {
    const html = window.prompt('Paste embed HTML (e.g. YouTube iframe code)')
    if (!html?.trim()) return
    editor?.chain().focus().setEmbed(html.trim()).run()
  }

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel field={field} />
      <span className="text-xs text-muted-foreground">(HTML supported)</span>

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
            onClick={() => setImagePickerOpen(true)}
            title="Insert image"
          >
            <ImageIcon size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          >
            <Minus size={14} />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            onClick={insertEmbed}
            title="Insert embed"
          >
            <Code2 size={14} />
          </ToolbarButton>
        </div>

        {/* Editor */}
        {/* The editable area is stretched to fill the box so a click anywhere
            in it (not just on the first line) puts the cursor in the document. */}
        <EditorContent
          editor={editor}
          className="flex flex-col min-h-48 max-h-[500px] overflow-y-auto border border-t-0 rounded-b-md text-sm prose prose-sm max-w-none cursor-text [&_.ProseMirror]:flex-1 [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:outline-none"
        />
      </div>

      <MediaLibrary
        open={imagePickerOpen}
        onOpenChangeAction={setImagePickerOpen}
        repoId={repo.id}
        onSelectAction={(path) => {
          editor?.chain().focus().setImage({ src: baseUrl + path }).run()
          setImagePickerOpen(false)
        }}
      />
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

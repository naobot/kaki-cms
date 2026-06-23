import { mergeAttributes, Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (html: string) => ReturnType
    }
  }
}

export const EmbedNode = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      html: { default: '' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
        getAttrs: (dom) => ({ html: (dom as HTMLElement).outerHTML }),
      },
    ]
  },

  renderHTML({ node }) {
    return ['div', mergeAttributes({ 'data-type': 'embed', 'data-html': node.attrs.html as string })]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.setAttribute('contenteditable', 'false')
      dom.style.cssText = [
        'background: hsl(var(--muted))',
        'border: 1px solid hsl(var(--border))',
        'border-radius: 6px',
        'padding: 10px 12px',
        'margin: 6px 0',
        'cursor: default',
        'user-select: none',
      ].join('; ')

      const label = document.createElement('span')
      label.textContent = 'Embed'
      label.style.cssText = [
        'display: block',
        'font-size: 10px',
        'font-weight: 600',
        'color: hsl(var(--muted-foreground))',
        'text-transform: uppercase',
        'letter-spacing: 0.05em',
        'margin-bottom: 6px',
        'font-family: inherit',
      ].join('; ')

      const pre = document.createElement('pre')
      pre.style.cssText = [
        'margin: 0',
        'font-size: 11px',
        'line-height: 1.5',
        'color: hsl(var(--foreground))',
        'white-space: pre-wrap',
        'word-break: break-all',
        'font-family: ui-monospace, monospace',
        'opacity: 0.8',
      ].join('; ')
      pre.textContent = node.attrs.html as string

      dom.appendChild(label)
      dom.appendChild(pre)

      return { dom }
    }
  },

  addCommands() {
    return {
      setEmbed: (html: string) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { html },
        })
      },
    }
  },
})

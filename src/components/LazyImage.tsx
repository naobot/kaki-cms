'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  src: string
  alt: string
  title?: string
  className?: string
  containerRef?: React.RefObject<HTMLElement>
}

export default function LazyImage({ src, alt, className, containerRef }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = imgRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      {
        root: containerRef?.current ?? null,
        rootMargin: '100px',
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef])

  return (
    <img
      ref={imgRef}
      src={visible ? src : undefined}
      alt={alt}
      title={title}
      onLoad={() => setLoaded(true)}
      className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className ?? ''}`}
    />
  )
}

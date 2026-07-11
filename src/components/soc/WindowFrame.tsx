import { useRef, useState, type ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  onFocus: () => void
  z: number
  /** Cascade offset index for the initial position. */
  slot: number
  /** Fullscreen sheet on small screens (drag disabled there). */
  children: ReactNode
  width?: string
}

/** A draggable desktop window. Drag by the title bar; click anywhere to raise. */
export function WindowFrame({ title, onClose, onFocus, z, slot, children, width = 'min(40rem, 92vw)' }: Props) {
  const [pos, setPos] = useState(() => ({ x: 0, y: 0 }))
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    // Title-bar drag only on fine pointers / larger screens.
    if (window.innerWidth < 768) return
    drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    setPos({ x: d.x + e.clientX - d.px, y: d.y + e.clientY - d.py })
  }
  const onPointerUp = () => {
    drag.current = null
  }

  return (
    <section
      role="dialog"
      aria-label={title}
      className="pointer-events-auto absolute inset-x-3 top-14 bottom-20 flex flex-col overflow-hidden rounded-xl border border-hairline bg-[#0c0b0a]/95 shadow-2xl shadow-black/70 backdrop-blur-md md:inset-auto"
      style={{
        zIndex: z,
        ...(window.innerWidth >= 768
          ? {
              left: `calc(50% + ${slot * 28 - 160}px)`,
              top: `calc(12% + ${slot * 26}px)`,
              width,
              maxHeight: '72vh',
              transform: `translate(calc(-50% + ${pos.x}px), ${pos.y}px)`,
            }
          : {}),
      }}
      onPointerDown={onFocus}
    >
      <header
        className="flex shrink-0 cursor-grab items-center gap-2 border-b border-hairline bg-surface/60 px-3.5 py-2.5 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ touchAction: 'none' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="group flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff5f57]/90 text-[8px] font-bold text-black/0 transition-colors hover:text-black/70"
          aria-label={`Close ${title}`}
        >
          ×
        </button>
        <span className="h-3 w-3 rounded-full bg-[#febc2e]/40" aria-hidden />
        <span className="h-3 w-3 rounded-full bg-[#28c840]/40" aria-hidden />
        <span className="ml-2 select-none font-mono text-xs uppercase tracking-[0.15em] text-faint">
          {title}
        </span>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </section>
  )
}

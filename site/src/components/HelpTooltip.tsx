import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEntry, getShort, lexiconHref } from '../lexicon'

export function HelpTooltip({
  entryId,
  label,
}: {
  entryId: string
  label?: string
}) {
  const entry = getEntry(entryId)
  const short = entry ? getShort(entryId) : ''
  if (!entry || !short) return null

  const [open, setOpen] = useState(false)
  const popoverId = useId()
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const ariaLabel = label ?? `Help: ${entry.title}`

  return (
    <span className="help-wrap" ref={rootRef}>
      <button
        type="button"
        className="help-trigger"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {open && (
        <span id={popoverId} className="help-popover" role="tooltip">
          <strong>{entry.title}</strong>
          <p>{short}</p>
          <Link to={lexiconHref(entryId)} onClick={() => setOpen(false)}>
            Read more in Lexicon →
          </Link>
        </span>
      )}
    </span>
  )
}

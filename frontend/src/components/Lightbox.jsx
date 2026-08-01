import { useEffect } from 'react'
import { getImageUrl } from '../lib/imageUrl'

export default function Lightbox({ state, onChange }) {
  useEffect(() => {
    if (!state) return
    const handler = (e) => {
      if (e.key === 'Escape') onChange(null)
      else if (e.key === 'ArrowLeft' && state.index > 0) onChange({ ...state, index: state.index - 1 })
      else if (e.key === 'ArrowRight' && state.index < state.images.length - 1) onChange({ ...state, index: state.index + 1 })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state, onChange])

  if (!state) return null

  const nav = (dir) => {
    const next = state.index + dir
    if (next >= 0 && next < state.images.length) onChange({ ...state, index: next })
  }

  const current = state.images[state.index]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={() => onChange(null)}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
        onClick={() => onChange(null)}
        aria-label="Close"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {state.index > 0 && (
        <button
          className="absolute left-4 text-white/70 hover:text-white z-10"
          onClick={(e) => { e.stopPropagation(); nav(-1) }}
          aria-label="Previous"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <img
        src={getImageUrl(current.url)}
        alt=""
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {state.index < state.images.length - 1 && (
        <button
          className="absolute right-4 text-white/70 hover:text-white z-10"
          onClick={(e) => { e.stopPropagation(); nav(1) }}
          aria-label="Next"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div className="absolute bottom-4 text-white/60 text-sm">
        {state.index + 1} / {state.images.length}
      </div>

      {current.caption && (
        <div className="absolute bottom-10 text-white text-sm bg-black/50 px-4 py-2 rounded-lg">
          {current.caption}
        </div>
      )}
    </div>
  )
}

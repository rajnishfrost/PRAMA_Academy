import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

const COLUMN_OPTIONS = [5, 7, 9, 13]

function makeRods(n) {
  return Array.from({ length: n }, () => ({ heaven: false, earth: 0 }))
}

export default function VirtualAbacus() {
  const [cols, setCols] = useState(9)
  const [rods, setRods] = useState(() => makeRods(9))

  const setColumns = (n) => {
    setCols(n)
    setRods(makeRods(n))
  }

  const reset = () => setRods(makeRods(cols))

  const toggleHeaven = (ri) => {
    setRods((prev) => prev.map((r, i) => (i === ri ? { ...r, heaven: !r.heaven } : r)))
  }

  // position p is counted from the reckoning bar (0 = nearest the bar)
  const setEarth = (ri, newEarth) => {
    setRods((prev) => prev.map((r, i) => (i === ri ? { ...r, earth: newEarth } : r)))
  }

  const value = useMemo(
    () => rods.reduce((acc, r) => acc * 10 + (r.heaven ? 5 : 0) + r.earth, 0),
    [rods],
  )

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 bg-gray-900">
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-primary font-semibold text-xs sm:text-sm tracking-wider uppercase mb-2 sm:mb-3">Practice Tool</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Virtual Abacus</h1>
          <p className="mt-3 sm:mt-4 text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            Tap the beads to set numbers on a soroban. Beads moved toward the middle bar are counted.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
            <Link
              to="/tools"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-4 sm:mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to Tools
            </Link>

            {/* Value display */}
            <div className="text-center mb-5 sm:mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Value</p>
              <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tabular-nums break-all">
                {value.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Abacus frame */}
            <div className="overflow-x-auto -mx-1 px-1 pb-2">
              <div className="mx-auto w-max rounded-2xl bg-amber-900/90 p-2.5 sm:p-3.5 shadow-inner select-none">
                <div className="rounded-xl bg-amber-50 px-2 sm:px-3 py-3 sm:py-4">
                  <div className="flex items-stretch justify-center gap-1 sm:gap-1.5">
                    {rods.map((rod, ri) => {
                      const digit = (rod.heaven ? 5 : 0) + rod.earth
                      const placeFromRight = cols - 1 - ri
                      // group rod markers every 3 digits (like a real soroban dot)
                      const marked = placeFromRight % 3 === 0
                      return (
                        <div key={ri} className="relative flex flex-col items-center">
                          {/* vertical rod line */}
                          <div className="absolute top-0 bottom-6 left-1/2 -translate-x-1/2 w-0.5 bg-amber-900/25" />

                          {/* Heaven (value 5) */}
                          <div className={`relative z-10 flex flex-col items-center h-14 sm:h-16 ${rod.heaven ? 'justify-end' : 'justify-start'}`}>
                            <Bead active={rod.heaven} onClick={() => toggleHeaven(ri)} />
                          </div>

                          {/* Reckoning bar */}
                          <div className="relative z-10 w-6 sm:w-8 h-1.5 bg-amber-900 rounded-full my-0.5">
                            {marked && <span className="absolute left-1/2 -translate-x-1/2 -top-[3px] w-1 h-1 rounded-full bg-amber-50" />}
                          </div>

                          {/* Earth (value 1 each, up to 4) */}
                          <div className="relative z-10 flex flex-col items-center h-32 sm:h-40">
                            {/* active beads sit just below the bar */}
                            {Array.from({ length: rod.earth }).map((_, idx) => (
                              <Bead key={`a${idx}`} active onClick={() => setEarth(ri, idx)} />
                            ))}
                            <div className="flex-1 min-h-1" />
                            {/* inactive beads rest at the bottom */}
                            {Array.from({ length: 4 - rod.earth }).map((_, idx) => {
                              const p = rod.earth + idx // position from bar
                              return <Bead key={`i${idx}`} onClick={() => setEarth(ri, p + 1)} />
                            })}
                          </div>

                          {/* per-rod digit */}
                          <span className="mt-1 text-[11px] sm:text-xs font-bold text-amber-900/70 tabular-nums">{digit}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Columns</span>
                <div className="flex gap-1">
                  {COLUMN_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setColumns(n)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-colors ${
                        cols === n ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={reset}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Clear
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-400 text-center">
              Top bead = 5 · each bottom bead = 1 · a bead counts when pushed toward the middle bar.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

function Bead({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`block w-8 h-5 sm:w-10 sm:h-6 rounded-[50%] shadow-sm transition-colors cursor-pointer active:scale-95 ${
        active
          ? 'bg-primary ring-2 ring-primary/30'
          : 'bg-gradient-to-b from-amber-700 to-amber-900 hover:from-amber-600'
      }`}
    />
  )
}

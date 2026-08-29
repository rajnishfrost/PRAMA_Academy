import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'

const defaults = {
  mode: 'addsub', // 'addsub' | 'multiplication' | 'division'
  digits: 3,
  multiplicandDigits: 2,
  multiplierDigits: 1,
  dividendDigits: 3,
  divisorDigits: 1,
  rows: 5,
  flash: 1000,
  timeout: 500,
  subtraction: false,
  voice: false,
  continuous: false,
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randByDigits(digits) {
  const min = digits === 1 ? 1 : Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  return randInt(min, max)
}

// Generates sequence items:
// - addsub mode: { type: 'addsub', value, op }
// - multiplication/division: { type: 'pair', a, b, op, answer }
function generateSequence(settings) {
  const { mode, rows } = settings

  if (mode === 'multiplication') {
    const items = []
    for (let i = 0; i < rows; i++) {
      const a = randByDigits(settings.multiplicandDigits)
      const b = randByDigits(settings.multiplierDigits)
      items.push({ type: 'pair', a, b, op: '×', answer: a * b })
    }
    return items
  }

  if (mode === 'division') {
    const items = []
    for (let i = 0; i < rows; i++) {
      const divisor = randByDigits(settings.divisorDigits)
      const dividendMin = Math.pow(10, settings.dividendDigits - 1)
      const dividendMax = Math.pow(10, settings.dividendDigits) - 1
      const qMin = Math.max(1, Math.ceil(dividendMin / divisor))
      const qMax = Math.max(qMin, Math.floor(dividendMax / divisor))
      const quotient = randInt(qMin, qMax)
      const a = divisor * quotient
      items.push({ type: 'pair', a, b: divisor, op: '÷', answer: quotient })
    }
    return items
  }

  // addsub mode — running total
  const { digits, subtraction } = settings
  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  const items = []
  let running = 0

  for (let i = 0; i < rows; i++) {
    if (i === 0) {
      const v = randInt(min, max)
      items.push({ type: 'addsub', value: v, op: '+' })
      running = v
      continue
    }

    let op = '+'
    if (subtraction && Math.random() < 0.4) op = '-'

    let value
    if (op === '-') {
      const maxSub = Math.min(max, running)
      if (maxSub >= min) {
        value = randInt(min, maxSub)
        running -= value
      } else {
        op = '+'
        value = randInt(min, max)
        running += value
      }
    } else {
      value = randInt(min, max)
      running += value
    }

    items.push({ type: 'addsub', value, op })
  }
  return items
}

function calculateAnswer(sequence) {
  if (sequence.length === 0) return 0
  if (sequence[0].type !== 'addsub') return 0 // pair modes have per-item answers
  let result = 0
  for (const { value, op } of sequence) {
    if (op === '+') result += value
    else if (op === '-') result -= value
  }
  return result
}

function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(String(text))
  u.rate = 1.2
  window.speechSynthesis.speak(u)
}

export default function FlashAnzan() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('anzan-settings')
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults
    } catch { return defaults }
  })
  const [state, setState] = useState('idle') // idle | playing | answering | result
  const [sequence, setSequence] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [showNumber, setShowNumber] = useState(false)
  const [flashAnswer, setFlashAnswer] = useState(null) // answer shown briefly between continuous rounds
  const [answer, setAnswer] = useState('')
  const [pairAnswers, setPairAnswers] = useState([]) // array of strings for pair mode
  const [isCorrect, setIsCorrect] = useState(null)
  const [pairResults, setPairResults] = useState([]) // array of booleans for pair mode
  const [showSettings, setShowSettings] = useState(true)
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  const isPairMode = settings.mode === 'multiplication' || settings.mode === 'division'
  const correctAnswer = calculateAnswer(sequence)

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('anzan-settings', JSON.stringify(settings))
  }, [settings])

  const updateSetting = (key, value) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const playSequence = useCallback((seq) => {
    setState('playing')
    setShowSettings(false)
    setAnswer('')
    setPairAnswers(seq.map(() => ''))
    setIsCorrect(null)
    setPairResults([])
    setCurrentIndex(-1)
    setShowNumber(false)
    setFlashAnswer(null)

    let i = 0
    const { flash, timeout, voice } = settings
    const pairMode = settings.mode !== 'addsub'

    const showNext = () => {
      if (i >= seq.length) {
        setShowNumber(false)
        setCurrentIndex(-1)
        if (settings.continuous) {
          // Flash the answer briefly at the end of the round, then auto-start the next
          if (!pairMode) setFlashAnswer(calculateAnswer(seq))
          timerRef.current = setTimeout(() => {
            setFlashAnswer(null)
            const newSeq = generateSequence(settings)
            setSequence(newSeq)
            playSequence(newSeq)
          }, pairMode ? 1000 : 1600)
        } else {
          setState('answering')
          setTimeout(() => inputRef.current?.focus(), 100)
        }
        return
      }

      setCurrentIndex(i)
      setShowNumber(true)
      if (voice) {
        const item = seq[i]
        if (item.type === 'pair') {
          speak(`${item.a} ${item.op} ${item.b}`)
        } else {
          speak(item.op === '-' ? `minus ${item.value}` : `${item.value}`)
        }
      }

      timerRef.current = setTimeout(() => {
        setShowNumber(false)
        timerRef.current = setTimeout(() => {
          i++
          showNext()
        }, timeout)
      }, flash)
    }

    timerRef.current = setTimeout(showNext, 300)
  }, [settings])

  const handleStart = () => {
    clearTimers()
    const seq = generateSequence(settings)
    setSequence(seq)
    playSequence(seq)
  }

  const handleReplay = () => {
    clearTimers()
    playSequence(sequence)
  }

  const handleStop = () => {
    clearTimers()
    setState('idle')
    setShowSettings(true)
    setCurrentIndex(-1)
    setShowNumber(false)
    setFlashAnswer(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isPairMode) {
      const results = sequence.map((item, i) => parseInt(pairAnswers[i], 10) === item.answer)
      setPairResults(results)
      setIsCorrect(results.every(Boolean))
    } else {
      const userAnswer = parseInt(answer, 10)
      setIsCorrect(userAnswer === correctAnswer)
    }
    setState('result')
  }

  const handleNextRound = () => {
    handleStart()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/images/team.jpg)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Practice Tool</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Flash Anzan</h1>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            Sharpen your mental calculation skills. Numbers flash on screen — add them in your head and type your answer.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative">
            {/* Back link */}
            <Link
              to="/tools"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to Tools
            </Link>

            {/* Settings Panel */}
            {showSettings && state === 'idle' && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Settings</h2>

                {/* Mode selector */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-2">Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'addsub', label: 'Addition / Subtraction' },
                      { key: 'multiplication', label: 'Multiplication' },
                      { key: 'division', label: 'Division' },
                    ].map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => updateSetting('mode', m.key)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          settings.mode === m.key
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {settings.mode === 'addsub' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Digits</label>
                      <select
                        value={settings.digits}
                        onChange={(e) => updateSetting('digits', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                          <option key={d} value={d}>{d} digit{d > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {settings.mode === 'multiplication' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Multiplicand Digits</label>
                        <select
                          value={settings.multiplicandDigits}
                          onChange={(e) => updateSetting('multiplicandDigits', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                          {[1, 2, 3, 4, 5].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Multiplier Digits</label>
                        <select
                          value={settings.multiplierDigits}
                          onChange={(e) => updateSetting('multiplierDigits', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                          {[1, 2, 3, 4].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  {settings.mode === 'division' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Dividend Digits</label>
                        <select
                          value={settings.dividendDigits}
                          onChange={(e) => updateSetting('dividendDigits', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                          {[1, 2, 3, 4].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Divisor Digits</label>
                        <select
                          value={settings.divisorDigits}
                          onChange={(e) => updateSetting('divisorDigits', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                          {[1, 2, 3].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{isPairMode ? 'Problems' : 'Numbers'}</label>
                    <select
                      value={settings.rows}
                      onChange={(e) => updateSetting('rows', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Flash (ms)</label>
                    <input
                      type="number"
                      min={100}
                      max={5000}
                      step={100}
                      value={settings.flash}
                      onChange={(e) => updateSetting('flash', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Gap (ms)</label>
                    <input
                      type="number"
                      min={100}
                      max={5000}
                      step={100}
                      value={settings.timeout}
                      onChange={(e) => updateSetting('timeout', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {settings.mode === 'addsub' && (
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.subtraction}
                        onChange={(e) => updateSetting('subtraction', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      Subtraction
                    </label>
                  )}
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.voice}
                      onChange={(e) => updateSetting('voice', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Voice
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.continuous}
                      onChange={(e) => updateSetting('continuous', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Continuous
                  </label>
                </div>

                <button
                  onClick={handleStart}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors text-lg"
                >
                  Start
                </button>
              </div>
            )}

            {/* Playing State — Flash Display */}
            {state === 'playing' && (
              <div className="text-center py-12 md:py-20">
                <div className="mb-4 text-xs font-medium text-gray-400">
                  {flashAnswer !== null ? 'Answer' : currentIndex >= 0 ? `${currentIndex + 1} / ${sequence.length}` : 'Get ready...'}
                </div>
                <div className="h-32 md:h-40 flex items-center justify-center">
                  {flashAnswer !== null ? (
                    <span className="text-6xl md:text-8xl font-bold tabular-nums text-primary">= {flashAnswer}</span>
                  ) : showNumber && currentIndex >= 0 ? (() => {
                    const item = sequence[currentIndex]
                    const opColors = { '+': 'text-gray-900', '-': 'text-red-500', '×': 'text-blue-600', '÷': 'text-purple-600' }
                    if (item.type === 'pair') {
                      return (
                        <span className={`text-5xl md:text-7xl font-bold tabular-nums ${opColors[item.op] || 'text-gray-900'}`}>
                          {item.a} {item.op} {item.b}
                        </span>
                      )
                    }
                    const prefix = currentIndex > 0 ? `${item.op} ` : ''
                    return (
                      <span className={`text-6xl md:text-8xl font-bold tabular-nums ${opColors[item.op] || 'text-gray-900'}`}>
                        {prefix}{item.value}
                      </span>
                    )
                  })() : null}
                </div>
                <button
                  onClick={handleStop}
                  className="mt-8 text-sm text-gray-400 hover:text-red-500 transition-colors"
                >
                  Stop
                </button>
              </div>
            )}

            {/* Answering State */}
            {state === 'answering' && (
              <div className="py-12">
                {isPairMode ? (
                  <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
                    <p className="text-sm text-gray-500 mb-4 text-center">Enter the answer for each problem</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {sequence.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-sm font-mono font-semibold text-gray-700 tabular-nums w-24 sm:w-28">
                            {item.a} {item.op} {item.b} =
                          </span>
                          <input
                            ref={i === 0 ? inputRef : null}
                            type="number"
                            value={pairAnswers[i] || ''}
                            onChange={(e) => {
                              const next = [...pairAnswers]
                              next[i] = e.target.value
                              setPairAnswers(next)
                            }}
                            className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none tabular-nums"
                            placeholder="?"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={pairAnswers.some((a) => a === '')}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40"
                    >
                      Check
                    </button>
                    <button
                      type="button"
                      onClick={handleReplay}
                      className="mt-4 w-full text-sm text-gray-400 hover:text-primary transition-colors"
                    >
                      Replay sequence
                    </button>
                  </form>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">What is the answer?</p>
                    <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
                      <input
                        ref={inputRef}
                        type="number"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        autoFocus
                        className="w-full text-center text-4xl font-bold py-4 border-b-2 border-gray-300 focus:border-primary outline-none bg-transparent tabular-nums"
                        placeholder="?"
                      />
                      <button
                        type="submit"
                        disabled={answer === ''}
                        className="mt-6 w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40"
                      >
                        Check
                      </button>
                    </form>
                    <button
                      onClick={handleReplay}
                      className="mt-4 text-sm text-gray-400 hover:text-primary transition-colors"
                    >
                      Replay sequence
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Result State */}
            {state === 'result' && (
              <div className="text-center py-8">
                {isPairMode ? (
                  <>
                    {(() => {
                      const correctCount = pairResults.filter(Boolean).length
                      const total = pairResults.length
                      const allRight = correctCount === total
                      return (
                        <div className="mb-6">
                          <div className={`w-16 h-16 ${allRight ? 'bg-green-100' : 'bg-amber-100'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                            {allRight ? (
                              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-2xl font-bold text-amber-600">{correctCount}/{total}</span>
                            )}
                          </div>
                          <p className={`text-xl font-bold ${allRight ? 'text-green-600' : 'text-amber-600'}`}>
                            {allRight ? 'All correct!' : `${correctCount} of ${total} correct`}
                          </p>
                        </div>
                      )
                    })()}

                    <div className="bg-gray-50 rounded-xl p-4 mb-6 max-w-xl mx-auto text-left">
                      <p className="text-xs font-medium text-gray-400 mb-2 text-center">Problems</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sequence.map((item, i) => {
                          const correct = pairResults[i]
                          return (
                            <div key={i} className={`text-sm font-mono px-3 py-2 rounded flex items-center justify-between gap-2 ${correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                              <span className="font-semibold tabular-nums">{item.a} {item.op} {item.b} = {item.answer}</span>
                              {!correct && (
                                <span className="text-xs text-red-500 line-through tabular-nums">{pairAnswers[i] || '—'}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {isCorrect ? (
                      <div className="mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-xl font-bold text-green-600">Correct!</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2 tabular-nums">{correctAnswer}</p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <p className="text-xl font-bold text-red-600">Wrong</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Your answer: <span className="font-semibold text-gray-700">{answer}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Correct answer: <span className="font-bold text-gray-900 text-lg">{correctAnswer}</span>
                        </p>
                      </div>
                    )}

                    {/* Sequence */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 max-w-sm mx-auto">
                      <p className="text-xs font-medium text-gray-400 mb-2">Sequence</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {sequence.map((item, i) => {
                          const opBg = { '+': 'text-gray-700 bg-white', '-': 'text-red-600 bg-red-50' }
                          const prefix = i > 0 ? `${item.op} ` : ''
                          return (
                            <span
                              key={i}
                              className={`text-sm font-mono font-semibold px-2 py-0.5 rounded ${opBg[item.op] || 'text-gray-700 bg-white'}`}
                            >
                              {prefix}{item.value}
                            </span>
                          )
                        })}
                        <span className="text-sm font-mono font-bold text-primary px-2 py-0.5">
                          = {correctAnswer}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleReplay}
                    className="px-6 py-2.5 border border-gray-200 hover:border-primary text-gray-700 hover:text-primary font-semibold rounded-xl transition-colors text-sm"
                  >
                    Replay
                  </button>
                  <button
                    onClick={handleNextRound}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Next Round
                  </button>
                  <button
                    onClick={() => { setState('idle'); setShowSettings(true) }}
                    className="px-6 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-500 font-semibold rounded-xl transition-colors text-sm"
                  >
                    Settings
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info cards */}
          {state === 'idle' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Speed Training</h3>
                <p className="text-xs text-gray-500 mt-1">Reduce flash time to train faster mental calculation.</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Mental Math</h3>
                <p className="text-xs text-gray-500 mt-1">Visualize a soroban (abacus) in your mind as you calculate.</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Progress</h3>
                <p className="text-xs text-gray-500 mt-1">Start easy and gradually increase digits and speed.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

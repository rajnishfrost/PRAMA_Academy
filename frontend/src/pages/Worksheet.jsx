import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

const operators = [
  { value: 'addition', label: 'Addition (+)' },
  { value: 'subtraction', label: 'Subtraction (-)' },
  { value: 'multiplication', label: 'Multiplication (x)' },
  { value: 'division', label: 'Division (/)' },
]

const questionCounts = [25, 50, 100, 200]

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randRange(digits) {
  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  return randBetween(digits === 1 ? 1 : min, max)
}

function generateProblems(op, count, rows, config) {
  const problems = []
  const digits = config.digits
  const maxNum = Math.pow(10, digits) - 1
  const minNum = Math.pow(10, digits - 1)

  for (let i = 0; i < count; i++) {
    if (op === 'addition') {
      const nums = []
      for (let r = 0; r < rows; r++) {
        nums.push({ value: randBetween(minNum, maxNum), sign: '+' })
      }
      const answer = nums.reduce((sum, n) => sum + n.value, 0)
      problems.push({ nums, answer, op })
    } else if (op === 'subtraction') {
      // Rules: min 1 minus row, max (rows-1) minus rows, answer always positive
      const nums = []

      // Step 1: Decide how many minus rows (random between 1 and rows-1)
      const maxMinus = rows - 1
      const minusCount = randBetween(1, maxMinus)

      // Step 2: Build signs array - first row always +, then randomly place minuses
      const signs = ['+']
      const remainingIndices = []
      for (let r = 1; r < rows; r++) remainingIndices.push(r)
      // Shuffle and pick minusCount indices for minus
      for (let s = remainingIndices.length - 1; s > 0; s--) {
        const j = Math.floor(Math.random() * (s + 1));
        [remainingIndices[s], remainingIndices[j]] = [remainingIndices[j], remainingIndices[s]]
      }
      const minusIndices = new Set(remainingIndices.slice(0, minusCount))
      for (let r = 1; r < rows; r++) {
        signs.push(minusIndices.has(r) ? '-' : '+')
      }

      // Step 3: Generate values
      const values = []
      for (let r = 0; r < rows; r++) {
        values.push(randBetween(minNum, maxNum))
      }

      // Step 4: Ensure answer is positive — calculate sum of plus values and minus values
      let plusSum = 0
      let minusSum = 0
      for (let r = 0; r < rows; r++) {
        if (signs[r] === '+') plusSum += values[r]
        else minusSum += values[r]
      }

      // If minus >= plus, boost the first value to make answer positive
      if (minusSum >= plusSum) {
        const deficit = minusSum - plusSum + randBetween(minNum, maxNum)
        values[0] += deficit
      }

      // Calculate final answer
      let total = 0
      for (let r = 0; r < rows; r++) {
        total += signs[r] === '+' ? values[r] : -values[r]
      }

      for (let r = 0; r < rows; r++) {
        nums.push({ value: values[r], sign: signs[r] })
      }
      problems.push({ nums, answer: total, op })
    } else if (op === 'multiplication') {
      const a = randRange(config.multiplicandDigits)
      const b = randRange(config.multiplierDigits)
      problems.push({ a, b, answer: a * b, op })
    } else if (op === 'division') {
      // Pick divisor first, then pick quotient such that dividend fits dividendDigits
      const divisor = randRange(config.divisorDigits)
      const dividendMin = Math.pow(10, config.dividendDigits - 1)
      const dividendMax = Math.pow(10, config.dividendDigits) - 1
      const qMin = Math.max(1, Math.ceil(dividendMin / divisor))
      const qMax = Math.max(qMin, Math.floor(dividendMax / divisor))
      const quotient = randBetween(qMin, qMax)
      const a = divisor * quotient
      problems.push({ a, b: divisor, answer: quotient, op })
    }
  }
  return problems
}

export default function Worksheet() {
  const [config, setConfig] = useState({
    operator: 'addition',
    count: 25,
    rows: 3,
    digits: 2,
    multiplicandDigits: 2,
    multiplierDigits: 1,
    dividendDigits: 3,
    divisorDigits: 1,
  })
  const [problems, setProblems] = useState([])
  const [showAnswers, setShowAnswers] = useState(false)
  const printRef = useRef()

  const handleGenerate = () => {
    const result = generateProblems(config.operator, config.count, config.rows, config)
    setProblems(result)
    setShowAnswers(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const isVertical = config.operator === 'addition' || config.operator === 'subtraction'
  const opSymbol = { addition: '+', subtraction: '-', multiplication: '\u00d7', division: '\u00f7' }

  return (
    <>
      <section className="relative pt-32 pb-20 bg-gray-900 print:hidden no-print">
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Practice Tool</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Math Worksheet Generator</h1>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Config */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-10 relative print:hidden no-print">
            <Link to="/tools" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Tools
            </Link>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Configure Your Worksheet</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operator</label>
                <select
                  value={config.operator}
                  onChange={(e) => setConfig({ ...config, operator: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  {operators.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
                <select
                  value={config.count}
                  onChange={(e) => setConfig({ ...config, count: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  {questionCounts.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {isVertical && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numbers per Problem</label>
                    <select
                      value={config.rows}
                      onChange={(e) => setConfig({ ...config, rows: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      {[2, 3, 4, 5].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Digits</label>
                    <select
                      value={config.digits}
                      onChange={(e) => setConfig({ ...config, digits: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      {[1, 2, 3, 4].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {config.operator === 'multiplication' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Digits in Multiplicand</label>
                    <select
                      value={config.multiplicandDigits}
                      onChange={(e) => setConfig({ ...config, multiplicandDigits: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      {[1, 2, 3, 4, 5].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Digits in Multiplier</label>
                    <select
                      value={config.multiplierDigits}
                      onChange={(e) => setConfig({ ...config, multiplierDigits: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      {[1, 2, 3, 4].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {config.operator === 'division' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Digits in Dividend</label>
                    <select
                      value={config.dividendDigits}
                      onChange={(e) => setConfig({ ...config, dividendDigits: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      {[1, 2, 3, 4].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Digits in Divisor</label>
                    <select
                      value={config.divisorDigits}
                      onChange={(e) => setConfig({ ...config, divisorDigits: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      {[1, 2, 3].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleGenerate}
                className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
              >
                Generate Worksheet
              </button>
              {problems.length > 0 && (
                <>
                  <button
                    onClick={() => setShowAnswers(!showAnswers)}
                    className="border border-gray-200 hover:border-primary text-gray-700 hover:text-primary font-medium px-6 py-2.5 rounded-lg transition-colors"
                  >
                    {showAnswers ? 'Hide Answers' : 'Show Answers'}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="border border-gray-200 hover:border-primary text-gray-700 hover:text-primary font-medium px-6 py-2.5 rounded-lg transition-colors"
                  >
                    Print / PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Problems */}
          {problems.length > 0 && (
            <div ref={printRef} className="print:p-4">
              <div className="hidden print:block text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  PRAMA <span className="text-primary">ACADEMY</span>
                </h1>
                <p className="text-xs text-gray-500 mt-1">Math Worksheet</p>
              </div>
              <div className={`grid gap-6 ${
                isVertical
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
                {problems.map((p, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-100 rounded-xl p-4 text-center"
                  >
                    <span className="text-xs text-gray-400 mb-2 block">Q{i + 1}</span>
                    {isVertical ? (
                      <div className="font-mono text-right inline-block">
                        {p.nums.map((n, j) => {
                          const val = typeof n === 'object' ? n.value : n
                          const sign = typeof n === 'object' ? n.sign : '+'
                          return (
                            <div key={j} className="text-lg">
                              {j === 0 ? (
                                <span className="mr-1 invisible">+</span>
                              ) : (
                                <span className={`mr-1 ${sign === '-' ? 'text-red-500' : 'text-primary'}`}>{sign === '-' ? '\u2212' : '+'}</span>
                              )}
                              {val}
                            </div>
                          )
                        })}
                        <div className="border-t-2 border-gray-800 mt-1 pt-1 text-lg">
                          {showAnswers ? (
                            <span className="text-green-600 font-semibold">{p.answer}</span>
                          ) : (
                            <span className="invisible">0000</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-mono">
                          {p.a} {opSymbol[p.op]} {p.b}
                        </p>
                        <div className="border-t-2 border-gray-800 mt-2 pt-2 text-lg font-mono">
                          {showAnswers ? (
                            <span className="text-green-600 font-semibold">= {p.answer}</span>
                          ) : (
                            <span className="text-gray-300">= ?</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

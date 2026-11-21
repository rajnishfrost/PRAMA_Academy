// Shared question generator for Homework.
// Produces an array of { display, answer } where `answer` is a Number.
// Mirrors the proven math from the frontend Worksheet tool.

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randRange(digits) {
  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  return randBetween(digits === 1 ? 1 : min, max)
}

const MINUS = '−' // −
const TIMES = '×' // ×
const DIVIDE = '÷' // ÷

function makeAddition(config) {
  const rows = config.rows || 3
  const digits = config.digits || 2
  const maxNum = Math.pow(10, digits) - 1
  const minNum = Math.pow(10, digits - 1)
  const nums = []
  for (let r = 0; r < rows; r++) nums.push(randBetween(minNum, maxNum))
  const answer = nums.reduce((s, n) => s + n, 0)
  const display = nums.join(' + ')
  return { display, answer, op: 'addition' }
}

function makeSubtraction(config) {
  const rows = config.rows || 3
  const digits = config.digits || 2
  const maxNum = Math.pow(10, digits) - 1
  const minNum = Math.pow(10, digits - 1)

  // 1st row always +, at least one and at most rows-1 minus rows, answer stays positive
  const maxMinus = Math.max(1, rows - 1)
  const minusCount = randBetween(1, maxMinus)
  const signs = ['+']
  const idxs = []
  for (let r = 1; r < rows; r++) idxs.push(r)
  for (let s = idxs.length - 1; s > 0; s--) {
    const j = Math.floor(Math.random() * (s + 1))
    ;[idxs[s], idxs[j]] = [idxs[j], idxs[s]]
  }
  const minusSet = new Set(idxs.slice(0, minusCount))
  for (let r = 1; r < rows; r++) signs.push(minusSet.has(r) ? '-' : '+')

  const values = []
  for (let r = 0; r < rows; r++) values.push(randBetween(minNum, maxNum))

  let plusSum = 0
  let minusSum = 0
  for (let r = 0; r < rows; r++) {
    if (signs[r] === '+') plusSum += values[r]
    else minusSum += values[r]
  }
  if (minusSum >= plusSum) {
    values[0] += minusSum - plusSum + randBetween(minNum, maxNum)
  }

  let answer = 0
  const parts = []
  for (let r = 0; r < rows; r++) {
    answer += signs[r] === '+' ? values[r] : -values[r]
    if (r === 0) parts.push(`${values[r]}`)
    else parts.push(`${signs[r] === '-' ? MINUS : '+'} ${values[r]}`)
  }
  return { display: parts.join(' '), answer, op: 'subtraction' }
}

function makeMultiplication(config) {
  const a = randRange(config.multiplicandDigits || 2)
  const b = randRange(config.multiplierDigits || 1)
  return { display: `${a} ${TIMES} ${b}`, answer: a * b, op: 'multiplication' }
}

function makeDivision(config) {
  const divisor = randRange(config.divisorDigits || 1)
  const dividendMin = Math.pow(10, (config.dividendDigits || 3) - 1)
  const dividendMax = Math.pow(10, config.dividendDigits || 3) - 1
  const qMin = Math.max(1, Math.ceil(dividendMin / divisor))
  const qMax = Math.max(qMin, Math.floor(dividendMax / divisor))
  const quotient = randBetween(qMin, qMax)
  const a = divisor * quotient
  return { display: `${a} ${DIVIDE} ${divisor}`, answer: quotient, op: 'division' }
}

const BUILDERS = {
  addition: makeAddition,
  subtraction: makeSubtraction,
  multiplication: makeMultiplication,
  division: makeDivision,
}

export const ALL_OPERATIONS = ['addition', 'subtraction', 'multiplication', 'division']

// config = { operations:[...], count, rows, digits, multiplicandDigits, multiplierDigits, dividendDigits, divisorDigits }
export function generateQuestions(config = {}) {
  const ops = (config.operations && config.operations.length ? config.operations : ['addition'])
    .filter((o) => BUILDERS[o])
  const count = Math.max(1, Math.min(500, Number(config.count) || 20))
  const questions = []
  for (let i = 0; i < count; i++) {
    const op = ops[Math.floor(Math.random() * ops.length)]
    const { display, answer, op: kind } = BUILDERS[op](config)
    questions.push({ display, answer, op: kind })
  }
  return questions
}

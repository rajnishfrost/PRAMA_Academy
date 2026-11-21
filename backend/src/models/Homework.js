import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  display: { type: String, required: true }, // e.g. "12 + 34 − 5"
  answer: { type: Number, required: true },
  op: { type: String },
}, { _id: false })

const homeworkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  instructions: { type: String, default: '' },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  // snapshot of the generator settings used (for reference / regenerate)
  config: {
    operations: [{ type: String }],
    count: Number,
    rows: Number,
    digits: Number,
    multiplicandDigits: Number,
    multiplierDigits: Number,
    dividendDigits: Number,
    divisorDigits: Number,
  },
  questions: [questionSchema], // shared question set (same for every student in the batch)
  timeLimitMin: { type: Number, default: 0 }, // 0 = no limit
  dueDate: { type: Date },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

export default mongoose.model('Homework', homeworkSchema)

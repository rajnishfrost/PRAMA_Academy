import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
  given: { type: Number, default: null }, // student's answer (null = blank)
  answer: { type: Number }, // correct answer (snapshot)
  correct: { type: Boolean, default: false },
}, { _id: false })

const submissionSchema = new mongoose.Schema({
  homework: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  answers: [answerSchema],
  score: { type: Number, default: 0 }, // number correct
  total: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 }, // percent 0-100
  timeSpentSec: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true })

// one submission per student per homework
submissionSchema.index({ homework: 1, student: 1 }, { unique: true })

export default mongoose.model('Submission', submissionSchema)

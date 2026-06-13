import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  reason: { type: String, required: true, enum: ['franchise', 'children-education', 'other'], default: 'other' },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
}, { timestamps: true })

export default mongoose.model('Contact', contactSchema)

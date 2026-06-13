import mongoose from 'mongoose'

const classVideoSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  url: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

export default mongoose.model('ClassVideo', classVideoSchema)

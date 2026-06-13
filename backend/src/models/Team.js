import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, default: '' },
  qualification: { type: String, default: '' },
  education: { type: String, default: '' },
  experience: { type: String, default: '' },
  achievements: { type: String, default: '' },
  courses: { type: String, default: '' },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('Team', teamSchema)

import mongoose from 'mongoose'

const mediaItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  caption: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { _id: true })

const brandAmbassadorSchema = new mongoose.Schema({
  section: { type: String, required: true, unique: true, trim: true },
  title: { type: String, default: '' },
  items: [mediaItemSchema],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('BrandAmbassador', brandAmbassadorSchema)

import mongoose from 'mongoose'

const benefitSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  image: { type: String, default: '' },
}, { _id: false })

const levelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, default: '' },
}, { _id: false })

const programSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: [String],
  note: { type: String, default: '' },
}, { _id: false })

// Class-details image gallery (order = array position)
const galleryImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String, default: '' },
}, { _id: false })

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  tagline: { type: String, default: '' },
  cover: { type: String, default: '' },
  heroImage: { type: String, default: '' },
  intro: [String],
  history: { type: String, default: '' },
  benefits: [benefitSchema],
  levels: [levelSchema],
  programs: [programSchema],
  gallery: [galleryImageSchema],
  teacher: {
    name: { type: String, default: '' },
    image: { type: String, default: '' },
    hours: { type: String, default: '' },
  },
  price: {
    full: { type: String, default: '' },
    monthly: { type: String, default: '' },
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('Course', courseSchema)

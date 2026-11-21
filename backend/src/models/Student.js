import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// accountType:
//   'signup' - self-registered on the site. Limited access (abacus only, no homework).
//   'batch'  - enrolled student created by admin. Full tool access + homework.
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  photo: { type: String, default: '' },
  accountType: { type: String, enum: ['signup', 'batch'], default: 'signup' },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin who created a batch student
}, { timestamps: true })

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

studentSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

studentSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export default mongoose.model('Student', studentSchema)

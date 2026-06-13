import mongoose from 'mongoose'

const permissionSchema = new mongoose.Schema({
  module: { type: String, required: true },
  read: { type: Boolean, default: false },
  write: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
}, { _id: false })

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  permissions: [permissionSchema],
  isSystem: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Role', roleSchema)

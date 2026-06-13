import 'dotenv/config'
import mongoose from 'mongoose'
import Role from '../models/Role.js'
import User from '../models/User.js'

const MODULES = ['courses', 'team', 'brand-ambassador', 'users', 'roles', 'contact', 'class-video']

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  // Create Super Admin role
  let superAdminRole = await Role.findOne({ name: 'Super Admin' })
  if (!superAdminRole) {
    superAdminRole = await Role.create({
      name: 'Super Admin',
      description: 'Full system access',
      isSystem: true,
      permissions: MODULES.map((m) => ({
        module: m,
        read: true,
        write: true,
        edit: true,
        delete: true,
      })),
    })
    console.log('Super Admin role created')
  } else {
    console.log('Super Admin role already exists')
  }

  // Create default Super Admin user
  const existing = await User.findOne({ email: 'admin@pramaacademy.com' })
  if (!existing) {
    await User.create({
      name: 'Super Admin',
      email: 'admin@pramaacademy.com',
      password: 'admin123',
      role: superAdminRole._id,
    })
    console.log('Super Admin user created (admin@pramaacademy.com / admin123)')
  } else {
    console.log('Super Admin user already exists')
  }

  await mongoose.disconnect()
  console.log('Seed complete')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})

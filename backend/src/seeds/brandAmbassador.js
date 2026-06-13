import 'dotenv/config'
import mongoose from 'mongoose'
import BrandAmbassador from '../models/BrandAmbassador.js'

const data = [
  {
    section: 'achievements',
    title: 'Our Achievements',
    order: 1,
    isActive: true,
    items: [
      { url: '/uploads/brand-ambassador/medal1.jpg', type: 'image', caption: 'Achievement 1', order: 1 },
      { url: '/uploads/brand-ambassador/medal2.jpg', type: 'image', caption: 'Achievement 2', order: 2 },
      { url: '/uploads/brand-ambassador/medal3.jpg', type: 'image', caption: 'Achievement 3', order: 3 },
      { url: '/uploads/brand-ambassador/medal4.jpg', type: 'image', caption: 'Achievement 4', order: 4 },
    ],
  },
  {
    section: 'performances',
    title: 'Student Performances',
    order: 2,
    isActive: true,
    items: [
      { url: '/uploads/brand-ambassador/video2.mp4', type: 'video', caption: '', order: 1 },
      { url: '/uploads/brand-ambassador/video3.mp4', type: 'video', caption: '', order: 2 },
      { url: '/uploads/brand-ambassador/video4.mp4', type: 'video', caption: '', order: 3 },
      { url: '/uploads/brand-ambassador/video5.mp4', type: 'video', caption: '', order: 4 },
      { url: '/uploads/brand-ambassador/video6.mp4', type: 'video', caption: '', order: 5 },
      { url: '/uploads/brand-ambassador/video7.mp4', type: 'video', caption: '', order: 6 },
      { url: '/uploads/brand-ambassador/video8.mp4', type: 'video', caption: '', order: 7 },
      { url: '/uploads/brand-ambassador/video11.mp4', type: 'video', caption: '', order: 8 },
      { url: '/uploads/brand-ambassador/video12.mp4', type: 'video', caption: '', order: 9 },
      { url: '/uploads/brand-ambassador/video14.mp4', type: 'video', caption: '', order: 10 },
      { url: '/uploads/brand-ambassador/video15.mp4', type: 'video', caption: '', order: 11 },
    ],
  },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const existing = await BrandAmbassador.countDocuments()
  if (existing > 0) {
    console.log(`${existing} brand ambassador sections already exist. Skipping seed.`)
  } else {
    await BrandAmbassador.insertMany(data)
    console.log(`${data.length} brand ambassador sections seeded successfully`)
  }

  await mongoose.disconnect()
  console.log('Done')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})

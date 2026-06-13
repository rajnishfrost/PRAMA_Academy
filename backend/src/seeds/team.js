import 'dotenv/config'
import mongoose from 'mongoose'
import Team from '../models/Team.js'

const teamData = [
  {
    name: 'Pratibha Singh',
    role: 'Director & Head Instructor',
    qualification: 'M.Tech (Mumbai University), B.E (Pune University)',
    education: 'M.Tech from Mumbai University. B.E from Pune University.',
    experience: '2 years as onsite engineer. 11 years of teaching experience for students aged 4 to 60.',
    achievements: 'Founded Prama Academy in 2018. Trained 500+ students across multiple countries. Certified Soroban Instructor.',
    courses: 'Abacus, Vedic Math, Hindi, Handwriting and Art',
    image: '/uploads/team/pratibha.jpg',
    isActive: true,
    order: 1,
  },
  {
    name: 'Shraddha Singh',
    role: 'Instructor & Consultant Psychologist',
    qualification: 'M.A Psychology',
    education: 'M.A in Psychology from Mumbai University. Diploma in Child Counselling.',
    experience: 'Consultant clinical psychologist. 5 years teaching experience. 2 years in child psychology.',
    achievements: 'Published research on child cognitive development. Certified in Play Therapy and Behavioral Counselling.',
    courses: 'Abacus, Handwriting, Art and Craft',
    image: '/uploads/team/shradhha2.jpg',
    isActive: true,
    order: 2,
  },
  {
    name: 'Sowmya Bandhakavi Bhalerao',
    role: 'Instructor',
    qualification: 'MBA, B.Pharma (Pune University)',
    education: 'MBA from Pune University. B.Pharma from Pune University.',
    experience: '10 years in training and customer service. 2 years teaching experience.',
    achievements: 'Best Trainer Award in corporate training. Completed Abacus Grand Master certification.',
    courses: 'Abacus and Shlokas',
    image: '/uploads/team/sowmya.jpg',
    isActive: true,
    order: 3,
  },
  {
    name: 'Snehal Mantri',
    role: 'Instructor',
    qualification: 'MBA, BSc Computer Science',
    education: 'MBA in Marketing. BSc in Computer Science from Pune University.',
    experience: '3 years in IT industry. 2 years teaching Abacus to young learners.',
    achievements: 'Certified Abacus Instructor. Conducted workshops in 10+ schools.',
    courses: 'Abacus',
    image: '/uploads/team/sneha.jpg',
    isActive: true,
    order: 4,
  },
  {
    name: 'Swetha Nagur',
    role: 'Franchise Director',
    qualification: 'Head of Young Dynamic Academy, Texas USA',
    education: 'Bachelor of Commerce. Diploma in Early Childhood Education.',
    experience: '5 years managing education franchise in USA. 3 years teaching Abacus and Vedic Maths.',
    achievements: 'Successfully launched Prama Academy franchise in Texas. Trained 200+ students in USA.',
    courses: 'Abacus and Vedic Maths',
    image: '/uploads/team/noimage.png',
    isActive: true,
    order: 5,
  },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const existing = await Team.countDocuments()
  if (existing > 0) {
    // Update existing members with new fields (education, achievements)
    for (const data of teamData) {
      await Team.findOneAndUpdate(
        { name: data.name },
        {
          $set: {
            qualification: data.qualification,
            education: data.education,
            achievements: data.achievements,
            experience: data.experience,
          },
        },
      )
    }
    console.log(`Updated ${existing} team members with qualification/education/achievements/experience`)
  } else {
    await Team.insertMany(teamData)
    console.log(`${teamData.length} team members seeded successfully`)
  }

  await mongoose.disconnect()
  console.log('Done')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})

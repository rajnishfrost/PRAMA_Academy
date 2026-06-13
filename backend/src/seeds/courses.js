import 'dotenv/config'
import mongoose from 'mongoose'
import Course from '../models/Course.js'

const coursesData = [
  {
    name: 'Abacus',
    slug: 'abacus',
    tagline: 'Master mental arithmetic with the ancient abacus technique',
    cover: '/images/courses/c1.png',
    heroImage: '/images/courses/abacus-hero.jpg',
    intro: [
      'Welcome to the fascinating world of the abacus, an ancient tool that has played a pivotal role in human history.',
      'Imagine a time before calculators and computers; when complex calculations were done solely with the power of our minds. The abacus was the key to unlocking mathematical prowess and developing cognitive abilities.',
      'Its legacy stretches back centuries, intertwining with diverse cultures around the globe. Join us on this journey as we explore how the abacus has shaped brain development, mathematics education, and historical narratives throughout time.',
    ],
    history: 'The history of the abacus spans across centuries and various cultures, making it one of the oldest known calculating devices. Its origins can be traced back to prehistoric times, where early humans used simple counting tools like pebbles or notches on sticks to perform basic arithmetic. The Chinese developed their own version called suanpan, while the Japanese created their soroban with distinct design elements. Today, abacus training has been proven beneficial in enhancing cognitive abilities such as concentration skills and memory retention.',
    benefits: [
      { heading: 'Enhanced Mathematical Skills', image: '/images/courses/math.png' },
      { heading: 'Improved Concentration', image: '/images/courses/concentration.png' },
      { heading: 'Enhanced Memory', image: '/images/courses/memory.png' },
      { heading: 'Boosted Confidence', image: '/images/courses/confident.jpg' },
      { heading: 'Improved Visualization', image: '/images/courses/VS.png' },
      { heading: 'Enhanced Problem Solving', image: '/images/courses/problemSolving.png' },
    ],
    levels: [
      { title: 'Foundation Level (1 to 5)', desc: 'Students learn basic abacus concepts, manipulate beads for addition and subtraction of single-digit numbers, and are introduced to mental abacus training.' },
      { title: 'Advanced Level (6 & 7)', desc: 'Students move on to complex calculations with multiple-digit numbers, including multiplication and division using the abacus and mental math.' },
      { title: 'Grand Master Level (8 & 9)', desc: 'Advanced techniques for quick and accurate calculations including decimals, negative numbers and BODMAS concepts.' },
      { title: 'Master of Mental Math (M1 & M2)', desc: 'Special level for kids who achieved grand master position - revision of techniques and practicing higher problems mentally.' },
      { title: 'Competition Level', desc: 'Specialized training focused on speed and accuracy, preparing students for abacus competitions.' },
    ],
    programs: [
      {
        title: 'Junior Abacus Program',
        details: ['Age 4 - 6.5 years', '10 levels, 3 months each', '45-60 min class, twice a week', 'Max batch size: 7 students', 'Daily 15 min practice at home', 'Certification after each level'],
        note: 'Parents need to purchase 17 rod abacus. Indian students get hardcopy books, international students receive PDF.',
      },
      {
        title: 'Senior Abacus Program',
        details: ['Age 6.5 - 13 years', '9 levels, 3 months each', 'Total duration: ~27 months', '45-60 min class, twice a week', 'Max batch size: 7 students', 'Daily 15 min practice at home', 'Certification after each level'],
        note: 'Parents need to purchase 17 rod abacus. Indian students get hardcopy books, international students receive PDF.',
      },
    ],
    teacher: { name: 'Pratibha Singh', image: '/images/priti.jpg', hours: '190 hrs' },
    price: { full: '$100', monthly: '$15/month' },
    isActive: true,
    order: 1,
  },
  {
    name: 'Vedic Mathematics',
    slug: 'vedic-mathematics',
    tagline: 'Ancient mathematical formulae for lightning-fast calculations',
    cover: '/images/courses/c2.png',
    heroImage: '/images/courses/vedic-hero.jpg',
    intro: [
      'Vedic Mathematics is a form of mathematical science based on the ancient scripture called the Atharva Vedas, containing 16 main formulae and 13 sub-formulae.',
      'The key to most modern scientific technology, including space science, Robotics, and Artificial Intelligence relies on Vedic maths today.',
      'Start your journey today and unlock the power of Vedic Maths with our specialized courses. Solve complex calculations with ease and speed.',
    ],
    history: '',
    benefits: [],
    levels: [
      { title: 'Level 1', desc: 'Subtraction & Vinculum, Multiplication techniques including squares, multiplication by 11, 99, 999, base multiplication, and vertical crosswise multiplication.' },
      { title: 'Level 2', desc: 'High speed addition & subtraction, flag method division, squaring, square root, cubes, cube root, dates & calendars, ratio & proportion.' },
      { title: 'Level 3', desc: 'Auxiliary division, divisibility test, Pythagoras theorem, factorization, linear equations, algebraic operations, remainder theorem.' },
    ],
    programs: [
      {
        title: 'Vedic Mathematics Program',
        details: ['Age 10 years and above', '3 levels, 3 months each', 'Total duration: ~9 months', '45 min class, twice a week', 'Max batch size: 7 students', 'Daily 15 min practice at home', 'Certification after each level'],
        note: 'Indian students get hardcopy books, international students receive PDF.',
      },
    ],
    teacher: { name: 'Pratibha Singh', image: '/images/priti.jpg', hours: '125 hrs' },
    price: { full: '$200', monthly: '$25/month' },
    isActive: true,
    order: 2,
  },
  {
    name: 'Handwriting',
    slug: 'handwriting',
    tagline: 'Transform your handwriting with expert techniques',
    cover: '/images/courses/c3.png',
    heroImage: '/images/courses/handwriting-hero.jpg',
    intro: [
      'Discover the key to improving your handwriting with our life-changing Handwriting Improvement Course.',
      'Learn techniques to perfect print and cursive writing, develop proper letter formation, spacing, and flow.',
      'Tips for grip, posture, and holding writing utensils. Methods for increasing hand-eye coordination and motor skills.',
    ],
    history: '',
    benefits: [],
    levels: [],
    programs: [
      {
        title: 'Handwriting Improvement Program',
        details: ['Age 6 years and above', '2 levels, 3 months each', 'Total duration: ~6 months', '45 min class, twice a week', 'Max batch size: 7 students', 'Daily 15 min practice at home', 'Certification after each level'],
        note: 'Indian students get hardcopy books, international students receive PDF.',
      },
    ],
    teacher: { name: 'Pratibha Singh', image: '/images/priti.jpg', hours: '50 hrs' },
    price: { full: '$50', monthly: '$5/month' },
    isActive: true,
    order: 3,
  },
  {
    name: 'Shloka',
    slug: 'shloka',
    tagline: 'Connect with ancient Hindu wisdom through sacred verses',
    cover: '/images/courses/c4.png',
    heroImage: '/images/courses/shloka-hero.jpg',
    intro: [
      'Open the door to the divine world of ancient Hindu wisdom with shloka and mantra classes.',
      'Learn basic and advanced shlokas, master proper pronunciation and rhythms for chanting mantras.',
      'Experience the transformative power of devotional chanting and discover inner peace.',
    ],
    history: '',
    benefits: [],
    levels: [
      { title: 'Basic Level', desc: '16 daily-use shlokas in 3-4 months. Kids are also introduced to mythological stories and bhajans.' },
      { title: 'Advanced Level', desc: 'Along with shloka, bhajan, chalisa, sahasranaam of various gods and puranas are taught.' },
    ],
    programs: [
      {
        title: 'Shloka Program',
        details: ['Age 5 years and above', '2 levels', 'Basic level: 3 months', '45 min class, twice a week', 'Max batch size: 10 students', 'Daily practice at home'],
        note: '',
      },
    ],
    teacher: { name: 'Pratibha Singh', image: '/images/priti.jpg', hours: '20 hrs' },
    price: { full: '$30', monthly: '$3/month' },
    isActive: true,
    order: 4,
  },
  {
    name: 'Summer Camp',
    slug: 'summer-camp',
    tagline: 'Fun-filled activities blending Indian art and creativity',
    cover: '/images/courses/tent.png',
    heroImage: '/images/courses/summer-hero.jpg',
    intro: [
      'Our summer camps are designed with international school vacation schedules in mind.',
      'Children immerse themselves in the beauty of Indian art through Warli painting, sketch pen calligraphy, Madhubani painting, and handwriting classes.',
      'These activities help children discover new hobbies and take a break from stressful curricula.',
    ],
    history: '',
    benefits: [],
    levels: [],
    programs: [],
    teacher: { name: 'Pratibha Singh', image: '/images/priti.jpg', hours: '' },
    price: { full: '$30', monthly: '$3/month' },
    isActive: true,
    order: 5,
  },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const existing = await Course.countDocuments()
  if (existing > 0) {
    for (const data of coursesData) {
      await Course.findOneAndUpdate(
        { slug: data.slug },
        { $set: { heroImage: data.heroImage, cover: data.cover } },
      )
    }
    console.log(`Updated ${existing} courses with new heroImage/cover paths`)
  } else {
    await Course.insertMany(coursesData)
    console.log(`${coursesData.length} courses seeded successfully`)
  }

  await mongoose.disconnect()
  console.log('Done')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})

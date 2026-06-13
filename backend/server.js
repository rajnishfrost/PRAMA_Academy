import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './src/config/db.js'
import authRoutes from './src/routes/auth.js'
import roleRoutes from './src/routes/roles.js'
import userRoutes from './src/routes/users.js'
import courseRoutes from './src/routes/courses.js'
import mediaRoutes from './src/routes/media.js'
import teamRoutes from './src/routes/team.js'
import brandAmbassadorRoutes from './src/routes/brandAmbassador.js'
import contactRoutes from './src/routes/contact.js'
import classVideoRoutes from './src/routes/classVideo.js'

const app = express()
const PORT = process.env.PORT || 3021

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/users', userRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/team', teamRoutes)
app.use('/api/brand-ambassador', brandAmbassadorRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/class-video', classVideoRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`))
})

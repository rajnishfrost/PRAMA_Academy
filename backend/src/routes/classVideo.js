import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import ClassVideo from '../models/ClassVideo.js'
import { authenticate } from '../middleware/auth.js'
import { checkPermission } from '../middleware/rbac.js'

const router = Router()

const MAX_VIDEOS = 15
const VIDEO_MAX = 1.5 * 1024 * 1024 * 1024 // 1.5GB
const videoExts = /mp4|mov|webm|avi/

const upload = multer({
  dest: 'uploads/tmp',
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase()
    if (videoExts.test(ext)) cb(null, true)
    else cb(new Error('Only video files (mp4, mov, webm, avi) are allowed'))
  },
  limits: { fileSize: VIDEO_MAX },
})

function handleUploadError(req, res, next) {
  upload.single('video')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'Video size exceeds the 1.5GB limit.' })
    }
    if (err) return res.status(400).json({ message: err.message })
    next()
  })
}

// PUBLIC: Get all class videos
router.get('/public', async (req, res) => {
  try {
    const videos = await ClassVideo.find().sort('-createdAt')
    res.json({ videos })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Get all class videos
router.get('/', authenticate, checkPermission('class-video', 'read'), async (req, res) => {
  try {
    const videos = await ClassVideo.find().sort('-createdAt').populate('uploadedBy', 'name')
    res.json({ videos, total: videos.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Upload a class video (FIFO - keep newest 15, auto-delete oldest beyond that)
router.post('/', authenticate, checkPermission('class-video', 'write'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No video file uploaded' })

    const dir = 'uploads/class-videos'
    fs.mkdirSync(dir, { recursive: true })

    const ext = path.extname(req.file.originalname)
    const name = path.basename(req.file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
    const filename = `${name}-${Date.now()}${ext}`
    const finalPath = path.join(dir, filename)

    fs.renameSync(req.file.path, finalPath)

    const video = await ClassVideo.create({
      title: req.body.title || req.file.originalname,
      filename,
      originalName: req.file.originalname,
      path: finalPath,
      url: `/uploads/class-videos/${filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
    })

    // FIFO: if more than MAX_VIDEOS, delete oldest
    const count = await ClassVideo.countDocuments()
    if (count > MAX_VIDEOS) {
      const oldest = await ClassVideo.find().sort('createdAt').limit(count - MAX_VIDEOS)
      for (const old of oldest) {
        if (fs.existsSync(old.path)) fs.unlinkSync(old.path)
        await old.deleteOne()
      }
    }

    res.status(201).json({ video })
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
    res.status(500).json({ message: err.message })
  }
})

// ADMIN: Delete a class video
router.delete('/:id', authenticate, checkPermission('class-video', 'delete'), async (req, res) => {
  try {
    const video = await ClassVideo.findById(req.params.id)
    if (!video) return res.status(404).json({ message: 'Video not found' })

    if (fs.existsSync(video.path)) fs.unlinkSync(video.path)
    await video.deleteOne()

    res.json({ message: 'Video deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router

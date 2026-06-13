import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import Media from '../models/Media.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const IMAGE_MAX = 5 * 1024 * 1024   // 5MB
const VIDEO_MAX = 100 * 1024 * 1024  // 100MB
const imageExts = /jpeg|jpg|png|webp|gif|svg/
const videoExts = /mp4|mov|webm|avi/

// Upload to temp first, then move to correct module folder
const tempUpload = multer({
  dest: 'uploads/tmp',
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase()
    if (imageExts.test(ext) || videoExts.test(ext)) cb(null, true)
    else cb(new Error('Only image and video files allowed'))
  },
  limits: { fileSize: VIDEO_MAX },
})

// Validate file size based on type (image: 5MB, video: 100MB)
function validateFileSize(req, res, next) {
  if (!req.file) return next()
  const ext = path.extname(req.file.originalname).toLowerCase()
  const isVideo = videoExts.test(ext)
  const maxSize = isVideo ? VIDEO_MAX : IMAGE_MAX
  if (req.file.size > maxSize) {
    // Clean up temp file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
    const limitMB = maxSize / (1024 * 1024)
    const fileMB = (req.file.size / (1024 * 1024)).toFixed(1)
    return res.status(413).json({
      message: isVideo
        ? `Video size (${fileMB}MB) exceeds the ${limitMB}MB limit.`
        : `Image size (${fileMB}MB) exceeds the ${limitMB}MB limit. Please resize or reduce quality before uploading.`,
    })
  }
  next()
}

// Handle multer errors gracefully
function handleMulterError(req, res, next) {
  tempUpload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File size exceeds the 100MB limit.' })
    }
    if (err) return res.status(400).json({ message: err.message })
    next()
  })
}

// Upload single file
router.post('/upload', authenticate, handleMulterError, validateFileSize, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    const module = req.body.module || 'general'
    const dir = `uploads/${module}`
    fs.mkdirSync(dir, { recursive: true })

    const ext = path.extname(req.file.originalname)
    const name = path.basename(req.file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
    const filename = `${name}-${Date.now()}${ext}`
    const finalPath = path.join(dir, filename)

    // Move from tmp to final location
    fs.renameSync(req.file.path, finalPath)

    const media = await Media.create({
      filename,
      originalName: req.file.originalname,
      path: finalPath,
      url: `/uploads/${module}/${filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
      module,
      uploadedBy: req.user._id,
    })

    res.status(201).json({ media })
  } catch (err) {
    // Clean up tmp file on error
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
    res.status(500).json({ message: err.message })
  }
})

// List media (with optional module filter)
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = {}
    if (req.query.module) filter.module = req.query.module

    const media = await Media.find(filter)
      .sort('-createdAt')
      .populate('uploadedBy', 'name')

    res.json({ media })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get single media by id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id).populate('uploadedBy', 'name')
    if (!media) return res.status(404).json({ message: 'Media not found' })
    res.json({ media })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete media
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) return res.status(404).json({ message: 'Media not found' })

    // Delete file from disk
    if (fs.existsSync(media.path)) {
      fs.unlinkSync(media.path)
    }

    await media.deleteOne()
    res.json({ message: 'Media deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router

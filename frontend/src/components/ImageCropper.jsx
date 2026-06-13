import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

const PRESETS = [
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: 'Custom', value: null },
]

// Creates a canvas crop from the image
function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height,
      )
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
    }
    image.src = imageSrc
  })
}

export default function ImageCropper({ imageSrc, onCropDone, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [selectedPreset, setSelectedPreset] = useState(0) // default 1:1
  const [customW, setCustomW] = useState(4)
  const [customH, setCustomH] = useState(3)

  const currentAspect = PRESETS[selectedPreset].value !== null
    ? PRESETS[selectedPreset].value
    : customW / (customH || 1)

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleDone = async () => {
    if (!croppedAreaPixels) return
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
    onCropDone(blob)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl w-[95vw] max-w-2xl overflow-hidden shadow-2xl">
        {/* Crop area */}
        <div className="relative h-80 md:h-96 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={currentAspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Aspect ratio presets */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Aspect Ratio</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setSelectedPreset(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedPreset === i
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom ratio inputs */}
            {PRESETS[selectedPreset].value === null && (
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="number"
                  min={1}
                  value={customW}
                  onChange={(e) => setCustomW(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <span className="text-gray-400 text-sm font-medium">:</span>
                <input
                  type="number"
                  min={1}
                  value={customH}
                  onChange={(e) => setCustomH(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            )}
          </div>

          {/* Zoom slider */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Zoom</p>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              Crop & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

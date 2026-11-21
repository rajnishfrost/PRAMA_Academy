// Render the selected crop area (from react-easy-crop) to a square canvas
// and return it as a JPEG Blob ready to upload.
export default function getCroppedBlob(imageSrc, cropPixels, outputSize = 400) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = outputSize
      canvas.height = outputSize
      const ctx = canvas.getContext('2d')
      // white background in case the source has transparency
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, outputSize, outputSize)
      ctx.drawImage(
        image,
        cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
        0, 0, outputSize, outputSize,
      )
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Could not process image'))),
        'image/jpeg',
        0.9,
      )
    }
    image.onerror = () => reject(new Error('Could not load image'))
    image.src = imageSrc
  })
}

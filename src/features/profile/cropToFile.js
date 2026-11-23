export const RING = 0.8
const OUTPUT = 512

export async function cropToFile(image, { box, zoom, offset }, name) {
  const circle = box * RING
  const scale = Math.max(box / image.naturalWidth, box / image.naturalHeight) * zoom
  const side = circle / scale
  const centerX = image.naturalWidth / 2 - offset.x / scale
  const centerY = image.naturalHeight / 2 - offset.y / scale
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT
  canvas.height = OUTPUT
  canvas.getContext('2d').drawImage(image, centerX - side / 2, centerY - side / 2, side, side, 0, 0, OUTPUT, OUTPUT)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
  return new File([blob], name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
}

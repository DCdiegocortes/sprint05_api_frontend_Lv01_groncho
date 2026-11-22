import { UniverseLayout } from '@/lib/constants.js'
import Accordion from './boards/Accordion.jsx'
import Bulge from './boards/Bulge.jsx'
import Carousel from './boards/Carousel.jsx'
import Floating from './boards/Floating.jsx'
import ImageGrid from './boards/ImageGrid.jsx'
import Infinite from './boards/Infinite.jsx'
import LiquidGlass from './boards/LiquidGlass.jsx'
import Masonry from './boards/Masonry.jsx'
import Rotunda from './boards/Rotunda.jsx'
import Slider from './boards/Slider.jsx'

const variants = {
  [UniverseLayout.MASONRY]: Masonry,
  [UniverseLayout.ACCORDION]: Accordion,
  [UniverseLayout.CAROUSEL]: Carousel,
  [UniverseLayout.ROTUNDA]: Rotunda,
  [UniverseLayout.IMAGE_GRID]: ImageGrid,
  [UniverseLayout.FLOATING]: Floating,
  [UniverseLayout.SCROLL_BULGE]: Bulge,
  [UniverseLayout.LIQUID_GLASS]: LiquidGlass,
  [UniverseLayout.INFINITE]: Infinite,
  [UniverseLayout.SLIDER]: Slider,
}

export default function UniversePreview({ layout, photos, addTile = null, fill = false }) {
  if (!photos.length) return addTile
  const Variant = variants[layout] ?? Masonry
  return <Variant photos={photos} addTile={addTile} fill={fill} />
}

import { UniverseLayout } from '@/lib/constants.js'

export const layouts = [
  { value: UniverseLayout.MASONRY, name: 'Masonry', hint: 'Draggable grid' },
  { value: UniverseLayout.ACCORDION, name: 'Accordion', hint: 'Opens on touch' },
  { value: UniverseLayout.CAROUSEL, name: 'Carousel', hint: 'One at a time' },
  { value: UniverseLayout.ROTUNDA, name: 'Rotunda', hint: 'Curved ring' },
  { value: UniverseLayout.LIQUID_GLASS, name: 'Liquid glass', hint: 'Glass lens' },
  { value: UniverseLayout.INFINITE, name: 'Infinite', hint: 'Endless wall' },
  { value: UniverseLayout.SCROLL_BULGE, name: 'Scroll bulge', hint: 'Grows in view' },
  { value: UniverseLayout.SLIDER, name: 'Slider', hint: 'Smooth slide' },
  { value: UniverseLayout.FLOATING, name: 'Floating', hint: 'Loose collage' },
  { value: UniverseLayout.IMAGE_GRID, name: 'Image grid', hint: 'Even and calm' },
]

export const layoutName = (value) => layouts.find((layout) => layout.value === value)?.name ?? 'Masonry'

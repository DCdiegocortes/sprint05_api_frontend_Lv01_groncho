import { Link } from 'react-router'
import { ImagePlus } from 'lucide-react'

const WORDS = 'A blank wall. Hang your first photo.'.split(' ')
const START = 0.4
const STEP = 0.17
const WORD = 0.7
const settle = START + (WORDS.length - 1) * STEP + WORD

export default function EmptyPoster() {
  return (
    <Link
      to="/universe/edit"
      state={{ tool: 'photos' }}
      aria-label="Add photos to your universe"
      className="group grid min-h-[420px] place-items-center rounded-[28px] bg-paper px-6 shadow-inset xl:min-h-[520px]"
    >
      <span className="flex flex-col items-center gap-4 text-center">
        <span
          aria-hidden="true"
          className="sink-in grid size-[72px] place-items-center rounded-full bg-paper text-accent"
          style={{ animationDelay: `${settle}s` }}
        >
          <ImagePlus className="size-7 transition-transform duration-220 ease-ui group-active:scale-90" strokeWidth={1.5} />
        </span>
        <span className="mt-1 font-serif text-[26px] leading-tight tracking-[-0.01em] text-ink xl:text-[30px]">
          {WORDS.map((word, index) => (
            <span key={index}>
              <span className="ink-in" style={{ animationDelay: `${START + index * STEP}s` }}>
                {word}
              </span>
              {index < WORDS.length - 1 && ' '}
            </span>
          ))}
        </span>
        <span
          className="appear text-[15px] font-medium text-accent transition-opacity duration-220 ease-ui group-hover:opacity-70"
          style={{ animationDelay: `${settle + 0.25}s` }}
        >
          Add photos
        </span>
      </span>
    </Link>
  )
}

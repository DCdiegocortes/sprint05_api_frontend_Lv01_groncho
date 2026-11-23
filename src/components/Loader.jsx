import { cn } from '@/lib/utils'

const STEP = 0.16

export default function Loader({ line, kicker, full = false, className }) {
  const words = line.split(' ')
  const dots = ['.', '.', '.']

  return (
    <div role="status" className={cn('flex flex-col items-center justify-center gap-3 text-center', full ? 'min-h-dvh px-6' : 'py-24', className)}>
      {kicker && <span className="label-mono">{kicker}</span>}
      <p className="font-serif text-[22px] leading-tight tracking-[-0.01em] xl:text-2xl">
        {words.map((word, index) => (
          <span key={index}>
            <span className="word-loop" style={{ animationDelay: `${index * STEP}s` }}>
              {word}
            </span>
            {index < words.length - 1 && ' '}
          </span>
        ))}
        {dots.map((dot, index) => (
          <span key={`dot-${index}`} aria-hidden="true" className="word-loop" style={{ animationDelay: `${(words.length + index) * STEP}s` }}>
            {dot}
          </span>
        ))}
      </p>
    </div>
  )
}

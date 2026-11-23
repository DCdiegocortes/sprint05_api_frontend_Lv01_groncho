import { displayStyle } from '@/features/universe/styles.js'

export default function TitlePoster({ universe }) {
  const styles = universe.style ? universe.style.split(', ').map(displayStyle).join('  ·  ') : ''

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3.5 rounded-[28px] bg-paper px-5 py-12 text-center shadow-inset xl:min-h-[360px]">
      {styles && <span className="label-mono text-[10px]">{styles}</span>}
      <h3 className="font-serif text-[54px] leading-[0.95] tracking-[-0.02em] text-ink xl:text-[88px]">{universe.name}</h3>
      {universe.description && (
        <p className="max-w-[560px] font-serif text-[19px] leading-snug text-secondary xl:text-[22px]">{universe.description}</p>
      )}
      <span className="mt-2.5 flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.16em] text-ink/70 uppercase">
        <span aria-hidden="true" className="size-[5px] shrink-0 rounded-full bg-accent" />
        No photos yet · Judge by the vibe
      </span>
    </div>
  )
}

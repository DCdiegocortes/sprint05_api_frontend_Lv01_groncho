import { useState } from 'react'
import Logo from '@/components/Logo.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Chip } from '@/components/ui/chip.jsx'
import { Input } from '@/components/ui/input.jsx'

const colors = [
  ['paper', 'bg-paper'],
  ['card', 'bg-card'],
  ['plate', 'bg-plate'],
  ['engrave', 'bg-engrave'],
  ['ink', 'bg-ink'],
  ['secondary', 'bg-secondary'],
  ['muted', 'bg-muted'],
  ['accent', 'bg-accent'],
]

const depths = [
  ['raised', 'shadow-raised bg-card'],
  ['subtle', 'shadow-subtle bg-card'],
  ['float', 'shadow-float bg-card'],
  ['inset', 'shadow-inset bg-paper'],
  ['pressed', 'shadow-pressed bg-paper'],
  ['accent', 'shadow-accent bg-accent'],
]

const styles = ['Dark academia / vintage', 'Streetwear', 'Avant-garde', 'Gothic / dark']

export default function StyleguidePage() {
  const [name, setName] = useState('Dark Academia')
  const [picked, setPicked] = useState(['Dark academia / vintage'])

  const toggle = (style) =>
    setPicked((current) => (current.includes(style) ? current.filter((s) => s !== style) : [...current, style]))

  return (
    <main className="mx-auto flex max-w-[440px] flex-col gap-10 px-6 py-16">
      <header className="flex flex-col items-start gap-3">
        <Logo size={28} />
        <p className="font-serif text-subline text-secondary">Every wardrobe is a universe.</p>
      </header>

      <section className="flex flex-col gap-3">
        <span className="label-mono">000 — Design tokens</span>
        <h1 className="text-headline font-bold">
          Grey paper,
          <br />
          one pink.
        </h1>
      </section>

      <section className="grid grid-cols-4 gap-4">
        {colors.map(([name, bg]) => (
          <div key={name} className="flex flex-col gap-2">
            <div className={`aspect-square rounded-md shadow-subtle ${bg}`} />
            <span className="label-mono text-[9px]">{name}</span>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-3 gap-5">
        {depths.map(([name, cls]) => (
          <div key={name} className="flex flex-col gap-2">
            <div className={`h-16 rounded-lg ${cls}`} />
            <span className="label-mono text-[9px]">{name}</span>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-lg bg-card p-5 shadow-raised">
        <Input label="Universe name" value={name} maxLength={255} onChange={(e) => setName(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {styles.map((style) => (
            <Chip key={style} selected={picked.includes(style)} onSelectedChange={() => toggle(style)}>
              {style}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Button>Create universe</Button>
        <Button variant="secondary">I already have an account</Button>
        <Button variant="ghost" size="sm">Cancel</Button>
      </section>
    </main>
  )
}

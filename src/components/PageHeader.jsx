export default function PageHeader({ label, title, subline }) {
  return (
    <header className="flex flex-col gap-1">
      <span className="label-mono">{label}</span>
      <h1 className="text-headline font-bold xl:text-[64px]">{title}</h1>
      {subline && <p className="font-serif text-subline text-secondary xl:text-[28px]">{subline}</p>}
    </header>
  )
}

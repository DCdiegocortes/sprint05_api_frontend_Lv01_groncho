export default function PageHeader({ label, title, subline }) {
  return (
    <header className="flex flex-col gap-1">
      <span className="font-mono text-[10px] tracking-[0.18em] text-secondary uppercase xl:text-xs">{label}</span>
      <h1 className="text-[40px] leading-[1.05] font-bold tracking-[-0.035em] xl:text-[64px] xl:leading-none xl:tracking-[-0.04em]">{title}</h1>
      {subline && <p className="font-serif text-subline text-secondary xl:text-[28px]">{subline}</p>}
    </header>
  )
}

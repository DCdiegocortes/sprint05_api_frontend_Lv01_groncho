import { Link } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const look =
  'group flex items-center gap-1.5 self-start py-1 text-[15px] font-medium text-accent opacity-60 transition-[opacity,scale] duration-220 ease-ui hover:opacity-100 focus-visible:opacity-100 active:scale-[0.97]'

export default function BackLink({ to, onClick, label, children, className }) {
  const content = (
    <>
      <ChevronLeft className="size-4 transition-transform duration-220 ease-ui group-hover:-translate-x-0.5" strokeWidth={1.8} />
      {children}
    </>
  )

  if (to)
    return (
      <Link to={to} onClick={onClick} aria-label={label} className={cn(look, className)}>
        {content}
      </Link>
    )

  return (
    <button type="button" onClick={onClick} aria-label={label} className={cn(look, className)}>
      {content}
    </button>
  )
}

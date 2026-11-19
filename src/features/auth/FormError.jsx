export default function FormError({ message }) {
  if (!message) return null

  return (
    <p role="alert" className="flex items-center gap-2 rounded-md bg-card px-4 py-3 text-[13px] text-ink shadow-subtle">
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
      {message}
    </p>
  )
}

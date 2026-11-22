import { Link } from 'react-router'

export default function EmptyState({ icon: Icon, title, body, action, to, onAction }) {
  const actionClass =
    'press inline-flex h-14 w-full items-center justify-center rounded-full bg-accent px-6 text-[15px] font-semibold text-white shadow-accent md:w-auto md:min-w-[260px]'

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-4 rounded-[28px] bg-paper px-7 py-10 text-center shadow-inset md:px-12 md:py-12 xl:mt-12">
      <Icon className="size-11 text-secondary" strokeWidth={1.2} />
      <p className="text-[17px] font-semibold text-ink">{title}</p>
      <p className="max-w-[400px] font-serif text-lg leading-tight text-secondary">{body}</p>
      {action &&
        (to ? (
          <Link to={to} className={actionClass}>
            {action}
          </Link>
        ) : (
          <button type="button" onClick={onAction} className={actionClass}>
            {action}
          </button>
        ))}
    </div>
  )
}

import Logo from '@/components/Logo.jsx'

export default function AuthScreen({ children, actions, onSubmit }) {
  const Tag = onSubmit ? 'form' : 'div'

  return (
    <Tag
      onSubmit={onSubmit}
      noValidate
      className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pt-[max(env(safe-area-inset-top),24px)] pb-[max(env(safe-area-inset-bottom),192px)]"
    >
      <div className="pt-10">
        <Logo size={22} />
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
      <div className="mt-10 flex flex-col gap-3.5">{actions}</div>
    </Tag>
  )
}

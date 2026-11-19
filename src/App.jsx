import Logo from './components/Logo.jsx'

export default function App() {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6">
      <h1 className="flex flex-col items-start gap-3">
        <Logo size={36} />
        <span className="font-serif text-xl font-normal text-secondary">Every wardrobe is a universe.</span>
      </h1>
    </main>
  )
}

export default function Logo({ size = 20, className = '' }) {
  const line = size >= 60 ? 1.5 : 1

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <span
        className="font-sans font-black leading-[1.5] text-engrave"
        style={{
          fontSize: size,
          letterSpacing: '0.28em',
          textShadow:
            '0.4px 0.4px 0.4px rgba(255,255,255,0.95), -0.5px -0.7px 0.9px rgba(0,0,0,0.3)',
        }}
      >
        GRÔNCHÔ
      </span>
      <span aria-hidden="true" className="mt-0.5 w-[37%] bg-accent" style={{ height: line }} />
    </div>
  )
}

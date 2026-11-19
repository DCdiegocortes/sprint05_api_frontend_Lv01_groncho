import DecorationContent from './DecorationContent.jsx'
import { decorationStyle } from './decorationStyle.js'

export default function DecorationLayer({ decorations = [] }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {decorations.map((decoration, index) => (
        <span key={index} style={decorationStyle(decoration)}>
          <DecorationContent decoration={decoration} />
        </span>
      ))}
    </div>
  )
}

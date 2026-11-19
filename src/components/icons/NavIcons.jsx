const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function DiscoverIcon(props) {
  return (
    <svg {...base} strokeWidth={1.6} {...props}>
      <path d="M2 14C6 6.5 18 6.5 22 14" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ClosetIcon(props) {
  return (
    <svg {...base} strokeWidth={1.6} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="10.5" y1="6" x2="13.5" y2="6" />
      <line x1="10.5" y1="12" x2="13.5" y2="12" />
      <line x1="10.5" y1="18" x2="13.5" y2="18" />
    </svg>
  )
}

export function MatchesIcon(props) {
  return (
    <svg {...base} strokeWidth={1.5} {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}

export function UniverseIcon(props) {
  return (
    <svg {...base} strokeWidth={1.6} {...props}>
      <path d="M12 3 L13.5 10.5 L21 12 L13.5 13.5 L12 21 L10.5 13.5 L3 12 L10.5 10.5 Z" />
      <line x1="19" y1="4" x2="19" y2="8" />
      <line x1="17" y1="6" x2="21" y2="6" />
    </svg>
  )
}

import { useState } from 'react'
import { ArrowLeftRight, Gift } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Panel, PanelClose, PanelTitle } from '@/components/ui/panel.jsx'
import { conditionOptions, labelOf, offerLabel } from '@/features/closet/pieces.js'
import PhotoViewer from '@/features/closet/PhotoViewer.jsx'
import { useItems } from '@/features/closet/useCloset.js'
import { ExchangeType, ItemStatus, OfferType } from '@/lib/constants.js'
import { cn } from '@/lib/utils'
import OwnPiecesCarousel from './OwnPiecesCarousel.jsx'
import { useRequestPiece } from './useMatches.js'

const MESSAGE_MAX = 255

function Tag({ children }) {
  return (
    <span className="inline-flex rounded-full bg-paper px-3 py-[7px] font-mono text-[10px] font-medium tracking-[0.12em] text-ink uppercase shadow-inset">
      {children}
    </span>
  )
}

function Problem({ children }) {
  return (
    <p role="alert" className="flex items-center gap-2 text-[13px] text-ink">
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
      {children}
    </p>
  )
}

function Heading({ title, body, center = true }) {
  return (
    <div className={cn('flex flex-col gap-1.5', center && 'items-center text-center')}>
      <PanelTitle className="text-2xl font-bold tracking-[-0.03em] text-ink md:text-[28px]">{title}</PanelTitle>
      <p className="font-serif text-lg leading-snug text-secondary">{body}</p>
    </div>
  )
}

const allows = (piece, type) => piece.offer_type === OfferType.BOTH || piece.offer_type === type

export default function RequestPanel({ match, piece, onClose }) {
  const navigate = useNavigate()
  const request = useRequestPiece()
  const { data: myPieces = [] } = useItems()
  const [step, setStep] = useState('ask')
  const [message, setMessage] = useState('')
  const [offered, setOffered] = useState(null)
  const [error, setError] = useState('')
  const [viewing, setViewing] = useState(null)
  const handle = `@${match.partner.handle}`
  const photos = (piece.images ?? []).map((image) => ({ key: image.id, url: image.url }))
  const available = myPieces.filter((item) => item.status === ItemStatus.AVAILABLE)
  const offeredPiece = available.find((item) => item.id === offered)

  const send = (type) => {
    setError('')
    request.mutate(
      {
        match_id: match.id,
        requested_item_id: piece.id,
        type,
        offered_item_id: type === ExchangeType.TRADE ? offered : null,
        message: message.trim() || null,
      },
      {
        onSuccess: () => setStep('sent'),
        onError: (failure) => {
          const status = failure?.response?.status
          if (status === 403) setStep('give-back')
          else
            setError(
              Object.values(failure?.response?.data?.errors ?? {})[0]?.[0] ??
                failure?.response?.data?.message ??
                'The request could not be sent. Try again.',
            )
        },
      },
    )
  }

  const messageField = (
    <Input
      label="Message · optional"
      value={message}
      maxLength={MESSAGE_MAX}
      placeholder="Say why it fits your universe"
      onChange={(event) => setMessage(event.target.value)}
    />
  )

  const widths = { ask: 'md:w-[792px]', trade: 'md:w-[600px]' }

  return (
    <Panel open onOpenChange={(open) => !open && onClose()} className={widths[step] ?? 'md:w-[520px]'}>
      {step === 'ask' && (
        <div className="flex flex-col gap-[18px] md:flex-row md:gap-8">
          <button
            type="button"
            aria-label="Open photo"
            onClick={() => photos.length && setViewing(0)}
            className="block aspect-[4/3] w-full shrink-0 cursor-zoom-in overflow-hidden rounded-[24px] bg-plate shadow-subtle md:aspect-[300/380] md:w-[300px]"
          >
            {photos[0] && <img src={photos[0].url} alt="" className="size-full object-cover" />}
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="label-mono">From {handle}</span>
                <PanelTitle className="text-2xl font-bold tracking-[-0.03em] text-ink md:text-[28px]">{piece.name}</PanelTitle>
                <div className="flex flex-wrap gap-2">
                  <Tag>{offerLabel[piece.offer_type]}</Tag>
                  {piece.size && <Tag>Size {piece.size}</Tag>}
                  <Tag>{labelOf(conditionOptions, piece.item_condition)}</Tag>
                </div>
              </div>
              <PanelClose className="hidden md:grid" />
            </div>
            {piece.description && <p className="font-serif text-[19px] leading-snug text-secondary">{piece.description}</p>}
            {messageField}
            {error && <Problem>{error}</Problem>}
            <div className="mt-auto grid grid-cols-2 gap-3">
              {allows(piece, ExchangeType.TRADE) && (
                <Button
                  variant={allows(piece, ExchangeType.GIFT) ? 'secondary' : 'primary'}
                  className={cn(!allows(piece, ExchangeType.GIFT) && 'col-span-2')}
                  onClick={() => setStep('trade')}
                >
                  Propose a trade
                </Button>
              )}
              {allows(piece, ExchangeType.GIFT) && (
                <Button
                  className={cn(!allows(piece, ExchangeType.TRADE) && 'col-span-2')}
                  disabled={request.isPending}
                  onClick={() => send(ExchangeType.GIFT)}
                >
                  Ask as a gift
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 'trade' && (
        <>
          <div className="flex items-start gap-3.5">
            {photos[0] && <img src={photos[0].url} alt="" className="size-14 shrink-0 rounded-[14px] object-cover shadow-subtle" />}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <PanelTitle className="text-2xl font-bold tracking-[-0.03em] text-ink">Propose a trade</PanelTitle>
              <p className="font-serif text-lg leading-snug text-secondary">Offer one of yours for {piece.name}.</p>
            </div>
            <PanelClose />
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="label-mono font-medium">Your pieces · available</span>
            {available.length ? (
              <OwnPiecesCarousel pieces={available} value={offered} onChange={setOffered} />
            ) : (
              <p className="rounded-[20px] bg-paper px-5 py-4 font-serif text-lg text-secondary shadow-inset">
                Nothing to offer yet.{' '}
                <Link to="/closet" className="font-sans text-[15px] font-medium text-accent transition-opacity duration-220 ease-ui hover:opacity-70">
                  Add a piece
                </Link>
              </p>
            )}
          </div>
          {messageField}
          {error && <Problem>{error}</Problem>}
          <Button disabled={!offered || request.isPending} onClick={() => send(ExchangeType.TRADE)}>
            {request.isPending ? 'Sending' : 'Send trade request'}
          </Button>
        </>
      )}

      {step === 'sent' && (
        <>
          <div className="flex items-center justify-center gap-5">
            {offeredPiece?.images?.[0] && (
              <>
                <img src={offeredPiece.images[0].url} alt="" className="size-[88px] rounded-[22px] object-cover shadow-subtle md:size-28" />
                <ArrowLeftRight className="size-5 text-accent" strokeWidth={1.8} />
              </>
            )}
            {photos[0] && <img src={photos[0].url} alt="" className="size-[88px] rounded-[22px] object-cover shadow-subtle md:size-28" />}
          </div>
          <Heading title="Request sent" body={`${handle} decides. You will see the answer in Requests.`} />
          <div className="grid gap-3 md:grid-cols-2">
            <Button className="md:order-2" onClick={() => navigate('/universe/requests')}>
              See requests
            </Button>
            <Button variant="secondary" className="md:order-1" onClick={onClose}>
              Keep browsing
            </Button>
          </div>
        </>
      )}

      {step === 'give-back' && (
        <>
          <span className="mx-auto grid size-[72px] place-items-center rounded-full bg-paper text-accent shadow-inset md:size-[84px]">
            <Gift className="size-7" strokeWidth={1.6} />
          </span>
          <Heading
            title="Give one back first"
            body="You have received more gifts than you have given. Propose a trade, or gift one of your pieces."
          />
          <div className="grid gap-3 md:grid-cols-2">
            {allows(piece, ExchangeType.TRADE) && (
              <Button className="md:order-2" onClick={() => setStep('trade')}>
                Propose a trade instead
              </Button>
            )}
            <Button variant="secondary" className={cn('md:order-1', !allows(piece, ExchangeType.TRADE) && 'md:col-span-2')} onClick={onClose}>
              Got it
            </Button>
          </div>
        </>
      )}

      <PhotoViewer
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        photos={photos}
        index={viewing ?? 0}
        onIndexChange={setViewing}
        title={piece.name}
      />
    </Panel>
  )
}

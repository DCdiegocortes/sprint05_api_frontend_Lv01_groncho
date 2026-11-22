import { ArrowLeftRight, Check } from 'lucide-react'
import SlideToConfirm from '@/components/SlideToConfirm.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Panel, PanelTitle } from '@/components/ui/panel.jsx'
import { describe } from './describe.js'

function Pair({ request }) {
  const pieces = [request.requested_item, request.offered_item].filter(Boolean)
  return (
    <div className="flex items-center justify-center gap-4">
      {pieces.map((piece, index) => (
        <div key={piece.id} className="contents">
          {index === 1 && <ArrowLeftRight className="size-5 text-accent" strokeWidth={1.8} />}
          <span className="block size-[88px] overflow-hidden rounded-[22px] bg-plate shadow-subtle md:size-28 md:rounded-[24px]">
            {piece.images?.[0] && <img src={piece.images[0].url} alt="" className="size-full object-cover" />}
          </span>
        </div>
      ))}
    </div>
  )
}

function Heading({ title, body }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <PanelTitle className="text-2xl font-bold tracking-[-0.03em] text-ink md:text-[28px]">{title}</PanelTitle>
      <p className="font-serif text-lg leading-[1.18] text-secondary">{body}</p>
    </div>
  )
}

function Problem({ children }) {
  return (
    <p role="alert" className="flex items-center justify-center gap-2 text-[13px] text-ink">
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
      {children}
    </p>
  )
}

export function AcceptPanel({ request, userId, busy, error, onConfirm, onClose }) {
  const info = describe(request, userId)
  const piece = request.requested_item?.name
  return (
    <Panel open onOpenChange={(open) => !open && onClose()} className="md:w-[520px]">
      <Pair request={request} />
      {info.trade ? (
        <Heading
          title={`Accept ${info.handle}'s trade?`}
          body="Both pieces stay locked until the swap is done. Other requests for them are declined."
        />
      ) : (
        <Heading title={`Give ${piece} to ${info.handle}?`} body="It stays locked until you hand it over. Other requests for it are declined." />
      )}
      {error && <Problem>{error}</Problem>}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onClose}>
          Not yet
        </Button>
        <Button disabled={busy} onClick={onConfirm}>
          {info.trade ? 'Accept trade' : 'Give it'}
        </Button>
      </div>
    </Panel>
  )
}

export function FinishPanel({ request, userId, busy, error, onConfirm, onClose }) {
  const info = describe(request, userId)
  const requested = request.requested_item?.name
  const offered = request.offered_item?.name
  return (
    <Panel open onOpenChange={(open) => !open && onClose()} className="md:w-[520px]">
      <Pair request={request} />
      {info.trade ? (
        <Heading title="Did the swap happen?" body={`The pieces change closets: ${requested} goes to ${info.handle}, ${offered} comes to you.`} />
      ) : (
        <Heading title="Did you hand it over?" body={`${requested} goes to ${info.handle}'s closet.`} />
      )}
      {error && <Problem>{error}</Problem>}
      <SlideToConfirm label="Slide to finish" icon={Check} disabled={busy} onConfirm={onConfirm} />
      <Button variant="secondary" className="w-full" onClick={onClose}>
        Not yet
      </Button>
    </Panel>
  )
}

export function CancelPanel({ request, userId, busy, error, onConfirm, onClose }) {
  const info = describe(request, userId)
  return (
    <Panel open onOpenChange={(open) => !open && onClose()} className="md:w-[520px]">
      <Pair request={request} />
      <Heading title="Cancel your request?" body={`${info.handle} will not see it anymore. You can ask again later.`} />
      {error && <Problem>{error}</Problem>}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onClose}>
          Keep it
        </Button>
        <Button disabled={busy} onClick={onConfirm}>
          Cancel request
        </Button>
      </div>
    </Panel>
  )
}

import { ExchangeStatus, ExchangeType } from '@/lib/constants.js'

const statusLabel = {
  [ExchangeStatus.PENDING]: { label: 'Pending', dot: 'accent' },
  [ExchangeStatus.ACCEPTED]: { label: 'Accepted', dot: 'accent' },
  [ExchangeStatus.FINISHED]: { label: 'Finished', dot: 'ink' },
  [ExchangeStatus.REJECTED]: { label: 'Declined', dot: null },
}

export function describe(request, userId) {
  const mine = request.requester_id === userId
  const trade = request.type === ExchangeType.TRADE
  const partner = mine ? request.receiver : request.requester
  const handle = `@${partner?.handle ?? partner?.name ?? ''}`
  const requested = request.requested_item
  const offered = request.offered_item
  const finished = request.status === ExchangeStatus.FINISHED
  const kind = trade ? 'trade' : 'gift'

  const verbs = mine
    ? {
        [ExchangeStatus.PENDING]: `You asked for a ${kind}`,
        [ExchangeStatus.ACCEPTED]: `Your ${kind} was accepted`,
        [ExchangeStatus.FINISHED]: `${trade ? 'Trade' : 'Gift'} finished`,
        [ExchangeStatus.REJECTED]: `You asked for a ${kind}`,
      }
    : {
        [ExchangeStatus.PENDING]: trade ? 'Wants to trade' : 'Asks for a gift',
        [ExchangeStatus.ACCEPTED]: `${trade ? 'Trade' : 'Gift'} accepted`,
        [ExchangeStatus.FINISHED]: `${trade ? 'Trade' : 'Gift'} finished`,
        [ExchangeStatus.REJECTED]: trade ? 'Wanted to trade' : 'Asked for a gift',
      }

  const caption = (side) => {
    if (finished) return side === 'yours' ? `Went to ${handle}` : 'Came to you'
    if (!trade) return side === 'yours' ? 'Yours, as a gift' : 'Theirs, as a gift'
    return side === 'yours' ? 'Yours' : 'Theirs'
  }

  const pieces = mine
    ? [{ piece: requested, caption: caption('theirs') }, offered && { piece: offered, caption: caption('yours') }]
    : [{ piece: requested, caption: caption('yours') }, offered && { piece: offered, caption: caption('theirs') }]

  return {
    mine,
    trade,
    partner,
    handle,
    verb: verbs[request.status],
    status: statusLabel[request.status],
    pieces: pieces.filter(Boolean),
  }
}

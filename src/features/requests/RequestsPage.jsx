import { useCallback, useState } from 'react'
import Loader from '@/components/Loader.jsx'
import { loadingLines } from '@/lib/loadingLines.js'
import { ArrowLeftRight } from 'lucide-react'
import EmptyState from '@/components/EmptyState.jsx'
import PageHeader from '@/components/PageHeader.jsx'
import Toast from '@/components/Toast.jsx'
import { Segmented } from '@/components/ui/segmented.jsx'
import { useAuth } from '@/features/auth/useAuth.js'
import { ExchangeStatus } from '@/lib/constants.js'
import { describe } from './describe.js'
import RequestCard from './RequestCard.jsx'
import { AcceptPanel, CancelPanel, FinishPanel } from './RequestPanels.jsx'
import { useAnswerRequest, useCancelRequest, useRequests } from './useRequests.js'

const failure = (error, fallback) => Object.values(error?.response?.data?.errors ?? {})[0]?.[0] ?? error?.response?.data?.message ?? fallback

export default function RequestsPage() {
  const { user } = useAuth()
  const { data } = useRequests(user?.id)
  const answer = useAnswerRequest()
  const cancel = useCancelRequest()
  const [tab, setTab] = useState('received')
  const [open, setOpen] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const clearToast = useCallback(() => setToast(null), [])

  const header = <PageHeader label="005 — Requests" title="Requests" subline="Gifts and trades in motion." />
  if (!data)
    return (
      <div className="flex flex-col">
        {header}
        <Loader line={loadingLines.requests} />
      </div>
    )

  const { received, sent } = data
  if (!received.length && !sent.length) {
    return (
      <div className="flex flex-col gap-[18px] xl:gap-10">
        <PageHeader label="005 — Requests" title="Requests" subline="Nothing in motion yet." />
        <EmptyState
          icon={ArrowLeftRight}
          title="Requests start in Matches."
          body="When you ask for a piece, or someone asks for yours, it shows up here."
          action="Go to Matches"
          to="/matches"
        />
      </div>
    )
  }

  const shown = tab === 'received' ? received : sent
  const close = () => {
    setOpen(null)
    setError('')
  }
  const respond = (status) =>
    answer.mutate(
      { id: open.request.id, status },
      {
        onSuccess: () => {
          if (status === ExchangeStatus.FINISHED) {
            const info = describe(open.request, user.id)
            setToast(
              info.trade
                ? { title: 'Swap finished', hint: `${open.request.offered_item?.name} is in your closet` }
                : { title: 'Gift sent', hint: `It is in ${info.handle}'s closet now` },
            )
          }
          close()
        },
        onError: (problem) => setError(failure(problem, 'That did not go through. Try again.')),
      },
    )
  const reject = (request) => answer.mutate({ id: request.id, status: ExchangeStatus.REJECTED })
  const confirmCancel = () =>
    cancel.mutate(open.request.id, {
      onSuccess: close,
      onError: (problem) => setError(failure(problem, 'The request could not be cancelled. Try again.')),
    })

  return (
    <div className="flex flex-col gap-[18px] xl:gap-10">
      {header}

      <div className="flex flex-col gap-[18px] xl:gap-8">
        <Segmented
          label="Requests"
          className="md:w-[340px]"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'received', label: `Received · ${received.length}` },
            { value: 'sent', label: `Sent · ${sent.length}` },
          ]}
        />

        {shown.length ? (
          <ul className="grid gap-[18px] xl:grid-cols-[repeat(auto-fill,minmax(440px,520px))] xl:gap-6">
            {shown.map((request) => (
              <li key={request.id}>
                <RequestCard
                  request={request}
                  userId={user.id}
                  onAccept={() => setOpen({ kind: 'accept', request })}
                  onReject={() => reject(request)}
                  onFinish={() => setOpen({ kind: 'finish', request })}
                  onCancel={() => setOpen({ kind: 'cancel', request })}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-serif text-lg text-secondary">{tab === 'received' ? 'Nobody has asked yet.' : 'You have not asked for anything yet.'}</p>
        )}
      </div>

      {open?.kind === 'accept' && (
        <AcceptPanel
          request={open.request}
          userId={user.id}
          busy={answer.isPending}
          error={error}
          onConfirm={() => respond(ExchangeStatus.ACCEPTED)}
          onClose={close}
        />
      )}
      {open?.kind === 'finish' && (
        <FinishPanel
          request={open.request}
          userId={user.id}
          busy={answer.isPending}
          error={error}
          onConfirm={() => respond(ExchangeStatus.FINISHED)}
          onClose={close}
        />
      )}
      {open?.kind === 'cancel' && (
        <CancelPanel request={open.request} userId={user.id} busy={cancel.isPending} error={error} onConfirm={confirmCancel} onClose={close} />
      )}
      <Toast toast={toast} onDone={clearToast} />
    </div>
  )
}

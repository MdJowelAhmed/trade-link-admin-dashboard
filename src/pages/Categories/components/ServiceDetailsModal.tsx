import { ModalWrapper } from '@/components/common'
import type { Service } from '@/types'

interface ServiceDetailsModalProps {
  open: boolean
  onClose: () => void
  service: Service | null
}

function detailPoints(items: string[] | undefined): string[] {
  if (!Array.isArray(items)) return []
  return items.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean)
}

function normalizeFaqs(
  faqs: Array<{ question?: string; answer?: string }> | undefined
): Array<{ question: string; answer: string }> {
  if (!Array.isArray(faqs)) return []
  return faqs
    .map((f) => ({ question: (f.question ?? '').trim(), answer: (f.answer ?? '').trim() }))
    .filter((f) => f.question.length > 0 || f.answer.length > 0)
}

export function ServiceDetailsModal({ open, onClose, service }: ServiceDetailsModalProps) {
  const points = service ? detailPoints(service.detailedDescription) : []
  const description = service?.description?.trim()
  const faqs = service ? normalizeFaqs(service.faqs) : []

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Service details"
      // description="Read-only view of this service."
      size="lg"
      className="bg-white"
    >
      {service ? (
        <div className="space-y-5 text-sm">
          <div>
            <p className=" font-medium uppercase tracking-wide ">
              Service name
            </p>
            <p className="mt-1 font-semibold text-3xl text-black">{service.name}</p>
          </div>
          <div>
            <p className=" font-medium uppercase tracking-wide ">
              Category
            </p>
            <p className="mt-1 text-muted-foreground">{service.categoryName ?? '—'}</p>
          </div>
          <div>
            <p className=" font-medium uppercase tracking-wide ">
              Description
            </p>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
              {description ? description : '—'}
            </p>
          </div>
          <div>
            <p className=" font-medium uppercase tracking-wide ">
              Detailed description
            </p>
            {points.length > 0 ? (
              <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
                {points.map((line, i) => (
                  <li key={`${i}-${line.slice(0, 24)}`} className="whitespace-pre-wrap">
                    {line}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-muted-foreground">No points added.</p>
            )}
          </div>
          <div>
            <p className=" font-medium uppercase tracking-wide ">FAQ</p>
            {faqs.length > 0 ? (
              <div className="mt-3 space-y-3">
                {faqs.map((f, i) => (
                  <div key={`${i}-${f.question.slice(0, 24)}`} className="rounded-xl border p-4">
                    <p className="font-medium">{f.question || '—'}</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {f.answer || '—'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-muted-foreground">No FAQ added.</p>
            )}
          </div>
        </div>
      ) : null}
    </ModalWrapper>
  )
}

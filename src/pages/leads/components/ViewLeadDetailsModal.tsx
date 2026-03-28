import { Mail, Phone, MapPin, Users, UserCheck, Zap } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Lead, LeadAnsweredQuestion, LeadPurchasedByUser } from '@/types'
import { JobPostStatus } from '@/types'
import { formatCurrency } from '@/utils/formatters'

const getStatusStyles = (status: JobPostStatus) => {
  switch (status) {
    case JobPostStatus.OPEN:
      return 'bg-green-100 text-green-700 border-green-200'
    case JobPostStatus.CLOSED:
      return 'bg-gray-100 text-gray-700 border-gray-200'
    case JobPostStatus.HIRED:
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case JobPostStatus.COMPLETED:
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case JobPostStatus.EXPIRED:
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

/** Full location line: street (if any), town, region, postcode, country */
function formatLeadFullAddress(lead: Lead): string {
  const parts = [
    lead.customerAddress?.trim(),
    lead.area?.trim(),
    lead.region?.trim(),
    lead.postCode?.trim(),
    lead.country?.trim(),
  ].filter((p): p is string => Boolean(p && p.length > 0))
  if (parts.length > 0) return parts.join(', ')
  const fallback = lead.location?.trim()
  return fallback && fallback.length > 0 ? fallback : 'N/A'
}

const getStatusLabel = (status: JobPostStatus) => {
  switch (status) {
    case JobPostStatus.OPEN:
      return 'Open'
    case JobPostStatus.CLOSED:
      return 'Closed'
    case JobPostStatus.HIRED:
      return 'Hired'
    case JobPostStatus.COMPLETED:
      return 'Completed'
    case JobPostStatus.EXPIRED:
      return 'Expired'
    default:
      return status
  }
}

interface ViewLeadDetailsModalProps {
  open: boolean
  onClose: () => void
  lead: Lead | null
}

export function ViewLeadDetailsModal({
  open,
  onClose,
  lead,
}: ViewLeadDetailsModalProps) {
  if (!lead) return null

  const createdDate = new Date(lead.createdAt)

  const statusLabel = getStatusLabel(lead.status)
  const statusClasses = getStatusStyles(lead.status)

  const answeredQuestions = (lead.answeredQuestions ||
    []) as LeadAnsweredQuestion[]

  const purchasers = (lead.purchasedByUsers || []) as LeadPurchasedByUser[]
  const fullAddress = formatLeadFullAddress(lead)
  const hired = lead.hiredProfessional
  const leadPriceLabel =
    typeof lead.leadPrice === 'number'
      ? formatCurrency(lead.leadPrice)
      : null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Lead Details"
      size="lg"
      className="max-w-2xl bg-white"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={lead.avatar} alt={lead.name} />
                  <AvatarFallback className="font-semibold">
                    {lead.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {lead.name}
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {fullAddress}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">
                        Job Number:
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {lead.leadId}
                      </span>
                    </div>
                    {leadPriceLabel && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">
                          Lead price:
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {leadPriceLabel}
                        </span>
                      </div>
                    )}
                    {lead.isUrgent && (
                      <Badge
                        variant="destructive"
                        className="gap-1 rounded-full px-2 py-0.5 text-[11px]"
                      >
                        <Zap className="h-3 w-3" aria-hidden />
                        Urgent
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${statusClasses}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {createdDate.toLocaleDateString(undefined, {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card className="border border-gray-200">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-base font-semibold text-gray-900">
              {lead.requiredService}
            </h3>
            {lead.description ? (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {lead.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No job description provided.</p>
            )}
            {lead.notes && (
              <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">
                <span className="font-medium text-gray-700">
                  From questions:{' '}
                </span>
                {lead.notes}
              </p>
            )}
            {lead.budget && (
              <p className="text-xs font-medium text-gray-700">
                Budget: {lead.budget}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Hired professional */}
        {hired && (
          <Card className="border border-gray-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <UserCheck className="h-4 w-4 text-blue-700" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Hired professional
                </h3>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-xs font-semibold">
                    {hired.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {hired.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <a
                      href={`mailto:${hired.email}`}
                      className="truncate hover:text-blue-600 hover:underline"
                    >
                      {hired.email}
                    </a>
                  </div>
                  {hired.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span>{hired.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Answered Questions */}
        {answeredQuestions.length > 0 && (
          <Card className="border border-gray-200">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Answered Questions
              </h3>
              <div className="space-y-2 max-h-72 overflow-auto pr-1">
                {answeredQuestions.map((q, index) => {
                  const question =
                    q.questionText ||
                    q.question ||
                    `Question ${index + 1}`

                  let answer = ''
                  if (Array.isArray(q.answer)) {
                    answer = q.answer.filter(Boolean).join(', ')
                  } else {
                    answer = q.answerText || (q.answer as string) || ''
                  }

                  return (
                    <div
                      key={q._id ?? q.id ?? index}
                      className="border border-gray-100 rounded-md p-3 bg-gray-50"
                    >
                      <p className="text-xs font-semibold text-gray-900">
                        {question}
                      </p>
                      {answer && (
                        <p className="mt-1 text-xs text-gray-700 break-words">
                          {answer}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* <Separator /> */}

        {/* Professionals who purchased this lead */}
        <Card className="border border-gray-200">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                <Users className="h-4 w-4 text-amber-700" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Purchased by
              </h3>
            </div>
            {purchasers.length > 0 ? (
              <ul className="space-y-3">
                {purchasers.map((user) => (
                  <li
                    key={user._id}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="text-xs font-semibold">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <a
                          href={`mailto:${user.email}`}
                          className="truncate hover:text-blue-600 hover:underline"
                        >
                          {user.email}
                        </a>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No professionals have purchased this lead yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact Details */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-gray-900">
            Contact Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="text-sm font-medium text-gray-900">{lead.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="text-sm font-medium text-gray-900">
                  {lead.contact}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm font-medium text-gray-900">
                  {fullAddress}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}


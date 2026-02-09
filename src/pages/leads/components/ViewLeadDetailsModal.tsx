import { Mail, Phone, MapPin } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { Lead, LeadAnsweredQuestion } from '@/types'

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

  const statusLabel =
    lead.backendStatus || (lead.status === 'active' ? 'OPEN' : 'CLOSED')

  const statusClasses =
    statusLabel === 'OPEN'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700'

  const answeredQuestions = (lead.answeredQuestions ||
    []) as LeadAnsweredQuestion[]

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
                  <p className="text-xs text-gray-500">
                    {lead.location || lead.country || 'N/A'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">
                        Job Number:
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {lead.leadId}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusClasses}`}
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
          <CardContent className="p-6 space-y-2">
            <h3 className="text-base font-semibold text-gray-900">
              {lead.requiredService}
            </h3>
            <p className="text-xs text-gray-500">
              {lead.notes ||
                'Small garden / No groundwork or drainage / Apartment / Under $5000 / Urgent'}
            </p>
            {lead.budget && (
              <p className="text-xs font-medium text-gray-700">
                Budget: {lead.budget}
              </p>
            )}
          </CardContent>
        </Card>

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

        <Separator />

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
                  {lead.location || lead.country || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}


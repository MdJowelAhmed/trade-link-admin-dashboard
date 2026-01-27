import { Mail, Phone, MapPin } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { Lead } from '@/types'

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
                    {lead.location || 'Royal Ln Mesa, New Jersey'}
                  </p>
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
                  {lead.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}


import { User, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Client } from '@/types'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/formatters'

interface ViewClientDetailsModalProps {
  open: boolean
  onClose: () => void
  client: Client | null
}

export function ViewClientDetailsModal({ open, onClose, client }: ViewClientDetailsModalProps) {
  if (!client) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Client Details"
      size="lg"
      className="max-w-2xl bg-white"
    >
      <div className="space-y-6">
        {/* Client Profile Section */}
        <div className="flex flex-col items-center text-center pb-6 border-b">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={client.avatar} alt={client.name} />
            <AvatarFallback className="text-2xl">
              {client.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{client.name}</h2>
          <div
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
              client.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            )}
          >
            {client.status === 'active' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {client.status === 'active' ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact Information</h3>
          <div className="grid grid-cols-1 gap-4">
            {/* Email */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium text-gray-900">{client.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium text-gray-900">{client.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Country */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Country</p>
                    <p className="font-medium text-gray-900">{client.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Account Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Account Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Created Date */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Created At</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(client.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updated Date */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(client.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white">
            Close
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}


// import { Mail, Phone, MapPin, Briefcase, Building2 } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { TradePerson } from '@/types'

interface ViewTradePersonDetailsModalProps {
  open: boolean
  onClose: () => void
  tradePerson: TradePerson | null
  onApprove: (tradePerson: TradePerson) => void
  onReject: (tradePerson: TradePerson) => void
}

export function ViewTradePersonDetailsModal({
  open,
  onClose,
  tradePerson,
  onApprove,
  onReject,
}: ViewTradePersonDetailsModalProps) {
  if (!tradePerson) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Details"
      size="lg"
      className="max-w-xl bg-white"
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-3 pb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={tradePerson.avatar} alt={tradePerson.ownerName} />
            <AvatarFallback className="text-lg bg-gray-100">
              {tradePerson.ownerName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold text-gray-900">
            {tradePerson.ownerName}
          </h2>
        </div>

        {/* Gallery Images */}
        {tradePerson.galleryImages && tradePerson.galleryImages.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {tradePerson.galleryImages.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Business Info Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-4">Business info:</h3>
          <div className="space-y-4">
            {/* Business Name */}
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">Business Name</span>
              <span className="text-sm font-medium text-gray-900 text-right">
                {tradePerson.services[0] || 'N/A'}
              </span>
            </div>

            {/* Services */}
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">Services</span>
              <div className="text-right">
                {tradePerson.services.map((service, index) => (
                  <span
                    key={index}
                    className="text-sm font-medium text-[#2B7A78] hover:underline cursor-pointer"
                  >
                    {service}
                    {index < tradePerson.services.length - 1 && ', '}
                  </span>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">Address</span>
              <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
                {tradePerson.address}
              </span>
            </div>
          </div>
        </div>

        {/* Others Info Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-4">Others info:</h3>
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">E-mail</span>
              <span className="text-sm font-medium text-[#2B7A78] text-right">
                {tradePerson.email}
              </span>
            </div>

            {/* Mobile */}
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">Mobile</span>
              <span className="text-sm font-medium text-gray-900 text-right">
                {tradePerson.mobile}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {tradePerson.status === 'pending' && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => onReject(tradePerson)}
              className="px-8 py-2 border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C] hover:text-white rounded-full min-w-[120px]"
            >
              Reject
            </Button>
            <Button
              onClick={() => onApprove(tradePerson)}
              className="px-8 py-2 bg-[#1B3A4B] hover:bg-[#152d3a] text-white rounded-full min-w-[120px]"
            >
              Approve
            </Button>
          </div>
        )}
      </div>
    </ModalWrapper>
  )
}

import { Star, DoorOpen, Users, Luggage, Snowflake, Settings, Fuel, Gauge, Mail, Phone, User } from 'lucide-react'
import { ModalWrapper, TiptapEditor } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import type { Car } from '@/types'
import { cn } from '@/utils/cn'

interface ViewCarDetailsModalProps {
  open: boolean
  onClose: () => void
  car: Car | null
}

export function ViewCarDetailsModal({ open, onClose, car }: ViewCarDetailsModalProps) {
  if (!car) return null

  const rating = car.rating || 4.5
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Car Details"
      size="full"
      className="max-w-6xl bg-white"
    >
      <div className="space-y-6">
        {/* Car Image Section */}
        <div className="relative w-full h-96 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Car+Image'
            }}
          />
        </div>

        {/* Car Name, Rating, and Price */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-5 w-5',
                      i < fullStars
                        ? 'fill-yellow-400 text-yellow-400'
                        : i === fullStars && hasHalfStar
                        ? 'fill-yellow-400/50 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{rating}</span>
            </div>
            {/* Car Name */}
            <h2 className="text-2xl font-bold text-gray-900">{car.name}</h2>
            {/* Description */}
            <p className="text-sm text-gray-600">{car.description}</p>
          </div>
          {/* Price */}
          <div className="text-right">
            <p className="text-3xl font-bold text-red-600">€{car.amount.toFixed(2)}</p>
            <p className="text-sm text-gray-500">{car.priceDuration}</p>
          </div>
        </div>

        <Separator />

        {/* Car Specifications */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Specifications</h3>
          <div className="grid grid-cols-5 gap-4">
            {/* Doors */}
            <Card className="border border-gray-200">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <DoorOpen className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">{car.doors} Doors</p>
              </CardContent>
            </Card>

            {/* Seats */}
            <Card className="border border-gray-200">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">{car.seats} Seats</p>
              </CardContent>
            </Card>

            {/* Suitcases */}
            <Card className="border border-gray-200">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Luggage className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {car.suitcases || 'N/A'}
                </p>
              </CardContent>
            </Card>

            {/* Climate */}
            <Card className="border border-gray-200">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Snowflake className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {car.climate || 'N/A'}
                </p>
              </CardContent>
            </Card>

            {/* Transmission */}
            <Card className="border border-gray-200">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">{car.transmission}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fuel Policy and Kilometers */}
        <div className="grid grid-cols-2 gap-6">
          {/* Fuel Policy */}
          {car.fuelPolicy && (
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Fuel className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Fuel Policy</h4>
                    <p className="text-sm font-medium text-gray-700 mb-2">{car.fuelPolicy}</p>
                    <p className="text-xs text-gray-500">
                      You can return your rental car with the same fuel level as when you picked it up.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Kilometers */}
          {car.kilometers && (
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Gauge className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Kilometers</h4>
                    <p className="text-sm font-medium text-gray-700 mb-2">{car.kilometers}</p>
                    <p className="text-xs text-gray-500">
                      Free kilometers included in your rental package.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Car Owner Information */}
        {car.owner && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Car Owner Information</h3>
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Owner Name */}
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Name</p>
                        <p className="font-medium text-gray-900">{car.owner.name}</p>
                      </div>
                    </div>

                    {/* Owner Email */}
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-900">{car.owner.email}</p>
                      </div>
                    </div>

                    {/* Owner Phone */}
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="font-medium text-gray-900">{car.owner.phone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Insurance & Coverage */}
        {car.insuranceCoverage && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Insurance & Coverage</h3>
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <TiptapEditor
                    content={car.insuranceCoverage}
                    onChange={() => {}}
                    editable={false}
                    className="min-h-[200px]"
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Terms & Conditions */}
        {car.termsConditions && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Terms & Conditions</h3>
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <TiptapEditor
                    content={car.termsConditions}
                    onChange={() => {}}
                    editable={false}
                    className="min-h-[200px]"
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}

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


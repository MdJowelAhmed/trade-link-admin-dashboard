import { Star, DoorOpen, Users, Luggage, Snowflake, Settings, Fuel, Gauge, Mail, Phone, User, Calendar, Euro } from 'lucide-react'
import { ModalWrapper, TiptapEditor } from '@/components/common'
// import { Separator } from '@/components/ui/separator'
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
      className="max-w-3xl bg-white"
    >
      <div className="space-y-6">
        {/* Car Image Section */}
        <div className="relative w-full h-96 rounded-xl overflow-hidden bg-gray-100 ">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-cover "
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
        </div>

        {/* <Separator /> */}

        {/* Pricing Information */}
        {(car.pricing || car.amount) && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Pricing Information</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* 1 Day */}
                  <div className=" p-4 bg-gray-50 rounded-lg flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                      {/* <Calendar className="h-5 w-5 text-gray-600" /> */}
                      <span className="text-sm font-medium text-gray-700">1 Day</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      €{car.pricing?.oneDay?.toFixed(2) || car.amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  {/* 3 Days */}
                  <div className=" p-3 bg-gray-50 rounded-lg flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                      {/* <Calendar className="h-5 w-5 text-gray-600" /> */}
                      <span className="text-sm font-medium text-gray-700">3 Days</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      €{car.pricing?.threeDays?.toFixed(2) || (car.amount ? (car.amount * 3).toFixed(2) : '0.00')}
                    </span>
                  </div>

                  {/* 7 Days */}
                  <div className=" p-3 bg-gray-50 rounded-lg flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                      {/* <Calendar className="h-5 w-5 text-gray-600" /> */}
                      <span className="text-sm font-medium text-gray-700">7 Days</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      €{car.pricing?.sevenDays?.toFixed(2) || (car.amount ? (car.amount * 7).toFixed(2) : '0.00')}
                    </span>
                  </div>

                  {/* 14 Days */}
                  <div className=" p-3 bg-gray-50 rounded-lg flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                      {/* <Calendar className="h-5 w-5 text-gray-600" /> */}
                      <span className="text-sm font-medium text-gray-700">14 Days</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      €{car.pricing?.fourteenDays?.toFixed(2) || (car.amount ? (car.amount * 14).toFixed(2) : '0.00')}
                    </span>
                  </div>

                  {/* 1 Month */}
                  <div className=" p-3 bg-gray-50 rounded-lg flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                      {/* <Calendar className="h-5 w-5 text-gray-600" /> */}
                      <span className="text-sm font-medium text-gray-700">1 Month</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      €{car.pricing?.oneMonth?.toFixed(2) || (car.amount ? (car.amount * 30).toFixed(2) : '0.00')}
                    </span>
                  </div>
                </div>

                {/* Weekend Pricing */}
                {car.weekend && car.weekend.selectedDays.length > 0 && (
                  <div className="mt-6 ">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Weekend Pricing</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {car.weekend.selectedDays.map((day) => (
                        <span
                          key={day}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-5 w-5 text-green-600" />
                      <span className="text-lg font-bold text-green-600">
                        €{car.weekend.weekendPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">per weekend</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Car Specifications */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Specifications</h3>
          <div className="grid grid-cols-5 gap-4">
            {/* Doors */}
            <div className="border border-gray-200 rounded-lg ">
              <div className="p-4 flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <DoorOpen className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">{car.doors} Doors</p>
              </div>
            </div>

            {/* Seats */}
            <div className="border border-gray-200 rounded-lg ">
              <div className="p-4 flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">{car.seats} Seats</p>
              </div>
            </div>

            {/* Suitcases */}
            <div className="border border-gray-200 rounded-lg ">
              <div className="p-4 flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Luggage className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {car.suitcases || 'N/A'}
                </p>
              </div>
            </div>

            {/* Climate */}
            <div className="border border-gray-200 rounded-lg ">
              <div className="p-4 flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Snowflake className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {car.climate || 'N/A'}
                </p>
              </div>
            </div>

            {/* Transmission */}
            <div className="border border-gray-200 rounded-lg ">
              <div className="p-4 flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">{car.transmission}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fuel Policy and Kilometers */}
        <div className="grid grid-cols-2 gap-6">
          {/* Fuel Policy */}
          {car.fuelPolicy && (
            <div className="border border-gray-200 rounded-lg">
              <div className="p-4">
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
              </div>
            </div>
          )}

          {/* Kilometers */}
          {car.kilometers && (
            <div className="border border-gray-200 rounded-lg">
              <div className="p-4">
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
              </div>
            </div>
          )}
        </div>

        {/* Car Owner Information */}
        {car.owner && (
          <>
            {/* <Separator /> */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Car Owner Information</h3>
              <div className="border border-gray-200 rounded-lg">
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Owner Name */}
                    <div className="flex items-center gap-2">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Name</p>
                        <p className="font-medium text-gray-900">{car.owner.name}</p>
                      </div>
                    </div>

                    {/* Owner Email */}
                    <div className="flex items-center gap-2">
                      <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-900">{car.owner.email}</p>
                      </div>
                    </div>

                    {/* Owner Phone */}
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="font-medium text-gray-900">{car.owner.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Insurance & Coverage */}
        {car.insuranceCoverage && (
          <>
           
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Insurance & Coverage</h3>
              {/* <div className="border border-gray-200 rounded-lg"> */}
                {/* <div className="p-4"> */}
                  <TiptapEditor
                    content={car.insuranceCoverage}
                    onChange={() => {}}
                    editable={false}
                    className="h-[280px]"
                  />
                {/* </div> */}
              {/* </div> */}
            </div>
          </>
        )}

        {/* Terms & Conditions */}
        {car.termsConditions && (
          <>
            {/* <Separator /> */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Terms & Conditions</h3>
              {/* <div className="border border-gray-200 rounded-lg"> */}
                {/* <div className="p-4"> */}
                  <TiptapEditor
                    content={car.termsConditions}
                    onChange={() => {}}
                    editable={false}
                    className="h-[280px]"
                  />
                {/* </div> */}
              {/* </div> */}
            </div>
          </>
        )}

        {/* Close Button */}
        {/* <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white">
            Close
          </Button>
        </div> */}
      </div>
    </ModalWrapper>
  )
}


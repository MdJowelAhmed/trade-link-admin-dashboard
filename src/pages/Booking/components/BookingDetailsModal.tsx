import {
  Calendar,
  User,
  Car,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { ModalWrapper } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import type { Booking } from "@/types";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatters";

interface BookingDetailsModalProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export function BookingDetailsModal({
  open,
  onClose,
  booking,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Runing":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case "Upcoming":
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Runing":
        return "bg-blue-100 text-blue-800";
      case "Upcoming":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  console.log(booking);

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Booking Details"
      size="lg"
      className="max-w-4xl bg-white"
    >
      <div className="space-y-6">
        {/* Booking Header */}
        <div className="flex flex-col items-center text-center pb-6 border-b">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Booking ID: {booking.id}
          </h2>
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
              getStatusBadgeColor(booking.status)
            )}
          >
            {getStatusIcon(booking.status)}
            {booking.status}
          </div>
        </div>

        {/* Booking Details Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Booking Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Booking ID */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                    <p className="font-medium text-gray-900">{booking.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Payment</p>
                    <p className="font-medium text-gray-900">
                      {booking.payment}
                    </p>
                    <span
                      className={cn(
                        "inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium",
                        booking.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      )}
                    >
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Start Date */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Start Date</p>
                    <p className="font-medium text-gray-900">
                      {booking.startDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* End Date */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">End Date</p>
                    <p className="font-medium text-gray-900">
                      {booking.endDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Plan</p>
                    <p className="font-medium text-gray-900">{booking.plan}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Client Information and Car Information Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Information - Left Side */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Client Information
            </h3>
            <div className="space-y-4">
              {/* Client Name */}
              <Card className="border border-gray-200">
                <CardContent className="p-4 flex flex-col gap-4">
                  <div className="flex items-center  gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Client Name</p>
                      <p className="font-medium text-gray-900">
                        {booking.clientName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-xs text-gray-500 mb-1">Client Email</p>
                    <p className="font-medium text-gray-900">
                      {booking.clientEmail || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-gray-500 mb-1">Client Phone</p>
                    <p className="font-medium text-gray-900">
                      {booking.clientPhone || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Car Information - Right Side */}
          {booking.carInfo && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Car Information
              </h3>
              <div className="space-y-4">
                {/* Car Image and Name */}
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {booking.carInfo.image && (
                        <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={booking.carInfo.image}
                            alt={booking.carInfo.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Car Model</p>
                        <p className="font-medium text-gray-900 text-lg">
                          {booking.carInfo.name || booking.carModel}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          License: {booking.licensePlate}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Transmission */}
                {booking.carInfo.transmission && (
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Car className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">
                            Transmission
                          </p>
                          <p className="font-medium text-gray-900">
                            {booking.carInfo.transmission}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Seats */}
                {booking.carInfo.seats && (
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Seats</p>
                          <p className="font-medium text-gray-900">
                            {booking.carInfo.seats}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Car Class */}
                {booking.carInfo.carClass && (
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Car className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">
                            Car Class
                          </p>
                          <p className="font-medium text-gray-900">
                            {booking.carInfo.carClass}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Location */}
                {booking.carInfo.location && (
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Location</p>
                          <p className="font-medium text-gray-900">
                            {booking.carInfo.location}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Price */}
                {booking.carInfo.amount && booking.carInfo.priceDuration && (
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <CreditCard className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">
                            Rental Price
                          </p>
                          <p className="font-medium text-gray-900">
                            €{booking.carInfo.amount} /{" "}
                            {booking.carInfo.priceDuration}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Car Owner Information */}
        {booking.carOwner && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Car Owner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Owner Name */}
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Owner Name</p>
                      <p className="font-medium text-gray-900">
                        {booking.carOwner.name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Owner Email */}
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Owner Email</p>
                      <p className="font-medium text-gray-900">
                        {booking.carOwner.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Owner Phone */}
              <Card className="border border-gray-200 md:col-span-2">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Owner Phone</p>
                      <p className="font-medium text-gray-900">
                        {booking.carOwner.phone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Timestamps */}
        {(booking.createdAt || booking.updatedAt) && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Timestamps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.createdAt && (
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Created At
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDateTime(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {booking.updatedAt && (
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Last Updated
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDateTime(booking.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

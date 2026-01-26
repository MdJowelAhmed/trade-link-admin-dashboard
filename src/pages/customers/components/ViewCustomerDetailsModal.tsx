import {
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { ModalWrapper } from "@/components/common";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/common";
import type { Customer } from "@/types";

interface ViewCustomerDetailsModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function ViewCustomerDetailsModal({
  open,
  onClose,
  customer,
}: ViewCustomerDetailsModalProps) {
  if (!customer) return null;

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Customer Details"
      size="lg"
      className="max-w-2xl bg-white"
    >
      <div className="space-y-6">
        {/* Customer Profile Section */}
        <div className="flex flex-col items-center text-center pb-6 border-b">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={customer.avatar} alt={customer.userName} />
            <AvatarFallback className="text-2xl">
              {customer.userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {customer.userName}
          </h2>
          <StatusBadge status={customer.status} />
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Contact Information
          </h3>
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="flex items-center gap-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium text-gray-900">{customer.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                    <p className="font-medium text-gray-900">{customer.contact}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 md:col-span-2">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="font-medium text-gray-900">
                      {customer.location}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Account Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Account Information
          </h3>
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Customer ID</p>
                  <p className="font-medium text-gray-900">{customer.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created At</p>
                  <p className="font-medium text-gray-900">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(customer.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModalWrapper>
  );
}

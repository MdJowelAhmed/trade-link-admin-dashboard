import { Building2, User, Mail, Phone, MapPin, Globe, Calendar, FileText, Car, Package } from 'lucide-react'
import { ModalWrapper, StatusBadge } from '@/components/common'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/utils/formatters'
import type { Agency } from '@/types'

interface ViewAgencyDetailsModalProps {
  open: boolean
  onClose: () => void
  agency: Agency | null
}

export function ViewAgencyDetailsModal({
  open,
  onClose,
  agency,
}: ViewAgencyDetailsModalProps) {
  if (!agency) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Agency Details"
      description="View complete agency information"
      size="lg"
      className="bg-white"
    >
      <div className="space-y-6 ">
        {/* Agency Logo & Basic Info */}
        <div className="flex gap-6">
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0 border-2 border-gray-200">
            {agency.logo ? (
              <img
                src={agency.logo}
                alt={agency.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-blue-50 to-purple-50">
                <Building2 className="h-12 w-12 text-blue-400" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {agency.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Agency ID: {agency.id}
                </p>
              </div>
              <StatusBadge status={agency.status} />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {agency.totalCars} Cars
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {agency.completedOrders} Completed Orders
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Owner Information */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Owner Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem
              icon={User}
              label="Owner Name"
              value={agency.ownerName}
            />
            <DetailItem
              icon={Mail}
              label="Email"
              value={agency.email}
            />
            <DetailItem
              icon={Phone}
              label="Phone"
              value={agency.phone}
            />
               <DetailItem
              icon={Globe}
              label="Country"
              value={agency.country}
            />
          </div>
        </div>

        {/* Location Information */}
        <div>
       
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
            <DetailItem
              icon={MapPin}
              label="Address"
              value={agency.address}
              fullWidth
            />
          </div>
        </div>

        <Separator />

        {/* Documents */}
        {agency.documents && agency.documents.length > 0 && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents ({agency.documents.length})
              </h4>
              <div className="space-y-2">
                {agency.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-gray-200"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-slate-700">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

      
      </div>
    </ModalWrapper>
  )
}

interface DetailItemProps {
  icon: React.ElementType
  label: string
  value: string | number
  fullWidth?: boolean
}

function DetailItem({ icon: Icon, label, value, fullWidth }: DetailItemProps) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
        <Icon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {label}
          </p>
          <p className="text-sm font-semibold text-slate-800 break-words">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

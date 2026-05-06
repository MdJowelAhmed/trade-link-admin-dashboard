import { FileText, Download, ExternalLink, Mail, Phone, MapPin, CheckCircle2, XCircle } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TradePerson, ProfessionalDocumentType } from '@/types'

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

  const profile = tradePerson.professionalProfile
  const businessImage = profile?.businessImage
    ? `${import.meta.env.VITE_API_BASE_URL}${profile.businessImage.startsWith('/') ? profile.businessImage : `/${profile.businessImage}`}`
    : undefined

  const infoCards = [
    { label: 'Account status', value: tradePerson.accountStatus },
    { label: 'Approval status', value: profile?.approveStatus || tradePerson.status.toUpperCase() },
    { label: 'Role', value: tradePerson.role || 'PROFESSIONAL' },
    { label: 'Wallet balance', value: `£${(tradePerson.walletBalance ?? 0).toFixed(2)}` },
  ]

  const verifyPill = (ok: boolean | undefined, label: string) => (
    <Badge
      variant="outline"
      className={ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}
    >
      {ok ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <XCircle className="mr-1 h-3.5 w-3.5" />}
      {label}
    </Badge>
  )

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Professional details"
      size="xl"
      className="max-w-4xl bg-slate-50/80"
    >
      <div className="space-y-6 text-sm">
        <div className="rounded-xl  border-slate-border200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border border-slate-200">
                <AvatarImage src={tradePerson.avatar || businessImage} alt={tradePerson.ownerName} />
                <AvatarFallback className="text-lg bg-slate-100">
                  {tradePerson.ownerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{tradePerson.ownerName}</h2>
                <p className="text-sm text-slate-500">{tradePerson.businessName || 'N/A'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {verifyPill(tradePerson.isVerified, 'KYC Verified')}
              {verifyPill(tradePerson.isEmailVerified, 'Email')}
              {verifyPill(tradePerson.isPhoneVerified, 'Phone')}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {infoCards.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-base font-semibold text-slate-900">Contact & Business</h3>
            <div className="mt-4 space-y-3 text-slate-700">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>{tradePerson.email || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>{tradePerson.mobile || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>
                  {profile?.address || tradePerson.address || '—'}
                  {profile?.postcode ? `, ${profile.postcode}` : ''}
                </span>
              </div>
              <div className="pt-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Service radius</p>
                <p className="mt-1 font-medium text-slate-800">
                  {profile?.serviceRadiusKm !== undefined ? `${profile.serviceRadiusKm} miles` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Website</p>
                <p className="mt-1 break-all font-medium text-slate-800">{profile?.website || '—'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-base font-semibold text-slate-900">Services</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {tradePerson.services.length === 0 ? (
                <p className="text-sm text-slate-500">No services listed.</p>
              ) : (
                tradePerson.services.map((service, index) => (
                  <Badge key={`${service}-${index}`} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                    {service}
                  </Badge>
                ))
              )}
            </div>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">About</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {profile?.about || 'No description provided.'}
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Rating</p>
                <p className="mt-1 text-base font-semibold text-slate-800">{profile?.ratingAvg ?? 0}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total reviews</p>
                <p className="mt-1 text-base font-semibold text-slate-800">{profile?.totalReviews ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {tradePerson.verificationDocuments && tradePerson.verificationDocuments.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-base font-semibold text-slate-900">Verification documents</h3>
            <div className="mt-4 space-y-3">
              {tradePerson.verificationDocuments.map((doc) => {
                const documentUrl = doc.documentPath.startsWith('http')
                  ? doc.documentPath
                  : `${import.meta.env.VITE_API_BASE_URL}${doc.documentPath.startsWith('/') ? doc.documentPath : `/${doc.documentPath}`}`

                const getDocumentTypeLabel = (type: ProfessionalDocumentType) => {
                  switch (type) {
                    case 'DRIVING_LICENSE':
                      return 'Driving License'
                    case 'PASSPORT':
                      return 'Passport'
                    case 'INSURANCE':
                      return 'Insurance'
                    default:
                      return type
                  }
                }

                const formatDate = (dateString: string) => {
                  try {
                    return new Date(dateString).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  } catch {
                    return dateString
                  }
                }

                return (
                  <div
                    key={doc._id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{getDocumentTypeLabel(doc.documentType)}</p>
                        <p className="text-xs text-slate-500">Uploaded: {formatDate(doc.uploadedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(documentUrl, '_blank')}
                        className="h-8 border-primary/30 text-primary hover:bg-primary hover:text-white"
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = documentUrl
                          link.download = doc.documentPath.split('/').pop() || 'document'
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        className="h-8"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Download
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tradePerson.status === 'pending' && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onReject(tradePerson)}
              className="rounded-full border-red-300 text-red-600 hover:bg-red-600 hover:text-white"
            >
              Reject
            </Button>
            <Button
              onClick={() => onApprove(tradePerson)}
              className="rounded-full bg-primary text-white hover:bg-primary/90"
            >
              Approve
            </Button>
          </div>
        )}
      </div>
    </ModalWrapper>
  )
}

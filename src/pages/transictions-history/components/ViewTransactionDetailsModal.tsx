import { CreditCard, Calendar, User, Mail, DollarSign, FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import type { Transaction, Refund } from '@/types'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/formatters'

interface ViewTransactionDetailsModalProps {
  open: boolean
  onClose: () => void
  transaction: Transaction | Refund | null
}

export function ViewTransactionDetailsModal({
  open,
  onClose,
  transaction,
}: ViewTransactionDetailsModalProps) {
  if (!transaction) return null

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'Pending':
        return <Clock className="h-5 w-5 text-orange-600" />
      case 'Failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'Cancelled':
        return <AlertCircle className="h-5 w-5 text-gray-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={'transactionId' in transaction ? "Transaction Details" : "Refund Details"}
      size="lg"
      className="max-w-3xl bg-white"
    >
      <div className="space-y-6">
        {/* Transaction Header */}
        <div className="flex flex-col items-center text-center ">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {'transactionId' in transaction ? transaction.transactionId : transaction.refundId}
          </h2>
          <div
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
              transaction.status === 'Completed'
                ? 'bg-green-100 text-green-800'
                : transaction.status === 'Pending'
                  ? 'bg-orange-100 text-orange-800'
                  : transaction.status === 'Failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
            )}
          >
            {getStatusIcon()}
            {transaction.status}
          </div>
        </div>

        {/* Transaction Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Transaction Information
          </h3>
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Transaction ID */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">
                      {'transactionId' in transaction ? 'Transaction ID' : 'Refund ID'}
                    </p>
                    <p className="font-medium text-gray-900">
                      {'transactionId' in transaction
                        ? transaction.transactionId
                        : transaction.refundId}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="font-medium text-gray-900">
                      {transaction.currency || '€'}
                      {transaction.amount}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Transaction Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(transaction.date, 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                    <p className="font-medium text-gray-900">
                      {transaction.paymentMethod || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Lead ID */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Lead ID</p>
                    <p className="font-medium text-gray-900">
                      {transaction.leadId}
                    </p>
                  </div>
                </div>

                {/* Service */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Service</p>
                    <p className="font-medium text-gray-900">
                      {transaction.service}
                    </p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>


        {/* User Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            User Information
          </h3>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* User Name */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">User Name</p>
                    <p className="font-medium text-gray-900">
                      {transaction.userName}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium text-gray-900">
                      {transaction.email}
                    </p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>


        {/* Description */}
        {transaction.description && (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Description
              </h3>
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">
                    {transaction.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Separator />

       

      
      </div>
    </ModalWrapper>
  )
}


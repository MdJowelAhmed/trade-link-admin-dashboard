import { motion } from 'framer-motion'
import { BonusActionButtons } from './BonusActionButtons'
import { cn } from '@/utils/cn'
import type { BackendProfessional } from '@/redux/api/bonusManageApi'

interface BonusTableProps {
  professionals: BackendProfessional[]
  onUpdateAmount: (professional: BackendProfessional) => void
  onApprove: (professional: BackendProfessional) => void
  onReject: (professional: BackendProfessional) => void
  startIndex?: number
}

export function BonusTable({
  professionals,
  onUpdateAmount,
  onApprove,
  onReject,
  startIndex = 0,
}: BonusTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-card text-slate-800">
            <th className="px-6 py-4 text-left text-sm font-bold">SL</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Phone</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Wallet Balance</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Approve Status</th>
            <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {professionals.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-8 text-center text-gray-500"
              >
                No professionals found
              </td>
            </tr>
          ) : (
            professionals.map((professional, index) => (
              <motion.tr
                key={professional._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* SL Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-700">
                    {String(startIndex + index + 1).padStart(2, '0')}
                  </span>
                </td>

                {/* Name Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-800">
                    {professional.name}
                  </span>
                </td>

                {/* Email Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {professional.email}
                  </span>
                </td>

                {/* Phone Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {professional.phone || 'N/A'}
                  </span>
                </td>

                {/* Wallet Balance Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-800">
                    ${professional.walletBalance.toFixed(2)}
                  </span>
                </td>

                {/* Approve Status Column */}
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                      getStatusColor(professional.professional.approveStatus)
                    )}
                  >
                    {professional.professional.approveStatus}
                  </span>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4">
                  <BonusActionButtons
                    professional={professional}
                    onUpdateAmount={onUpdateAmount}
                    onApprove={onApprove}
                    onReject={onReject}
                  />
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

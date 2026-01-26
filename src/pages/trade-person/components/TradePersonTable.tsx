import { motion } from 'framer-motion'
import { TradePersonActionButtons } from './TradePersonActionButtons'
import { cn } from '@/utils/cn'
import type { TradePerson } from '@/types'

interface TradePersonTableProps {
  tradePersons: TradePerson[]
  onView: (tradePerson: TradePerson) => void
  onToggleStatus: (tradePerson: TradePerson) => void
}

export function TradePersonTable({
  tradePersons,
  onView,
  onToggleStatus,
}: TradePersonTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: {
        bg: 'bg-[#4CAF50]',
        text: 'text-white',
        label: 'Approved',
      },
      pending: {
        bg: 'bg-[#F5A623]',
        text: 'text-white',
        label: 'Pending',
      },
      rejected: {
        bg: 'bg-[#F44336]',
        text: 'text-white',
        label: 'Rejected',
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <span
        className={cn(
          'inline-flex items-center justify-center px-4 py-1.5 rounded-md text-xs font-medium min-w-[90px]',
          config.bg,
          config.text
        )}
      >
        {config.label}
      </span>
    )
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-[#FFF8F0] text-slate-700">
            <th className="px-6 py-4 text-left text-sm font-semibold">SL</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Business Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Services</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
            <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
            <th className="px-6 py-4 text-right text-sm font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tradePersons.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-8 text-center text-gray-500"
              >
                No trade persons found
              </td>
            </tr>
          ) : (
            tradePersons.map((tradePerson, index) => (
              <motion.tr
                key={tradePerson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* SL Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </td>

                {/* Business Name Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-800">
                    {tradePerson.businessName}
                  </span>
                </td>

                {/* Services Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {tradePerson.services.join(', ')}
                  </span>
                </td>

                {/* Email Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {tradePerson.email}
                  </span>
                </td>

                {/* Location Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {tradePerson.location}
                  </span>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(tradePerson.status)}
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4">
                  <TradePersonActionButtons
                    tradePerson={tradePerson}
                    onView={onView}
                    onToggleStatus={onToggleStatus}
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

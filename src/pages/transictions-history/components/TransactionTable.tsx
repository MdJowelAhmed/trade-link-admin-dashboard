import { motion } from 'framer-motion'
import { EyeOff } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Transaction, Refund } from '@/types'
import { formatDate } from '@/utils/formatters'

interface TransactionTableProps {
  transactions: (Transaction | Refund)[]
  onView: (transaction: Transaction | Refund) => void
  startIndex?: number
}

export function TransactionTable({
  transactions,
  onView,
  startIndex = 0,
}: TransactionTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[1000px]">
        <thead>
          <tr className="bg-card ">
            <th className="px-6 py-4 text-left text-sm font-bold">SL</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Lead ID</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Service</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Price</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {transactions.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-6 py-8 text-center text-gray-500"
              >
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((transaction, index) => (
              <motion.tr
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.10 * index }}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* SL Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-700">
                    {String(startIndex + index + 1).padStart(2, '0')}
                  </span>
                </td>

                {/* Lead ID Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-700">
                    {transaction.leadId}
                  </span>
                </td>

                {/* Name Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {transaction.userName}
                  </span>
                </td>

                {/* Date Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {formatDate(transaction.date, 'dd/MM/yyyy')}
                  </span>
                </td>

                {/* Service Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {transaction.service}
                  </span>
                </td>

                {/* Price Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-800">
                    {transaction.currency || '$'}{transaction.amount.toFixed(2)}
                  </span>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-6 py-2 rounded-full text-sm w-28 justify-center font-medium',
                      transaction.status === 'SUCCESS' || transaction.status === 'APPROVED'
                        ? 'bg-secondary text-white'
                        : transaction.status === 'PENDING'
                        ? 'bg-primary-foreground text-white'
                        : transaction.status === 'REFUNDED' || transaction.status === 'REJECTED' || transaction.status === 'Failed'
                        ? 'bg-secondary-foreground text-white'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {transaction.status === 'SUCCESS' ? 'Success' : 
                     transaction.status === 'PENDING' ? 'Pending' :
                     transaction.status}
                  </span>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => onView(transaction)}
                      className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2"
                      aria-label="View"
                    >
                      <EyeOff className="h-4 w-4" />
                      Details
                    </button>
                    {/* <button
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Lock"
                    >
                      <Lock className="h-4 w-4" />
                    </button> */}
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}


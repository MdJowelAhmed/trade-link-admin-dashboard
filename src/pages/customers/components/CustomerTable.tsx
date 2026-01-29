import { motion } from 'framer-motion'
import { CustomerActionButtons } from './CustomerActionButtons'
import { cn } from '@/utils/cn'
import type { Customer } from '@/types'

interface CustomerTableProps {
  customers: Customer[]
  onView: (customer: Customer) => void
  onToggleStatus: (customer: Customer) => void
}

export function CustomerTable({
  customers,
  onView,
  onToggleStatus,
}: CustomerTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-card text-slate-800">
            <th className="px-6 py-4 text-left text-sm font-bold">SL</th>
            <th className="px-6 py-4 text-left text-sm font-bold">User Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Contact</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Location</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {customers.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-8 text-center text-gray-500"
              >
                No customers found
              </td>
            </tr>
          ) : (
            customers.map((customer, index) => (
              <motion.tr
                key={customer.id}
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

                {/* User Name Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={customer.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Customer'}
                      alt={customer.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-sm font-semibold text-slate-800">
                      {customer.userName}
                    </span>
                  </div>
                </td>

                {/* Contact Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {customer.contact}
                  </span>
                </td>

                {/* Email Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {customer.email}
                  </span>
                </td>

                {/* Location Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {customer.location}
                  </span>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-6 py-1 w-24 justify-center text-center rounded-full text-xs font-medium',
                      customer.status === 'active'
                        ? 'bg-secondary text-white px-6 py-2'
                        : 'bg-secondary-foreground text-white px-6 py-2'
                    )}
                  >
                    {customer.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4">
                  <CustomerActionButtons
                    customer={customer}
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

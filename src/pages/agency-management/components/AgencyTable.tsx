import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { Agency } from '@/types'
import { AgencyActionButtons } from './AgencyActionButtons'

interface AgencyTableProps {
  agencies: Agency[]
  onView: (agency: Agency) => void
  onEdit: (agency: Agency) => void
  onDelete: (agency: Agency) => void
}

export function AgencyTable({
  agencies,
  onView,
  onEdit,
  onDelete,
}: AgencyTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-[#E2FBFB] text-slate-800">
            <th className="px-6 py-4 text-left text-sm font-bold">Agency Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Agency Owner</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Total Car</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Complete Order</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {agencies.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-8 text-center text-gray-500"
              >
                No agencies found
              </td>
            </tr>
          ) : (
            agencies.map((agency, index) => (
              <motion.tr
                key={agency.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className={cn(
                  'hover:bg-gray-50 transition-colors border-l-4',
                  agency.status === 'active' ? 'border-green-500' : 'border-gray-300'
                )}
              >
                {/* Agency Name + Logo */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        agency.logo ||
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=Agency'
                      }
                      alt={agency.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-sm font-semibold text-slate-800">
                      {agency.name}
                    </span>
                  </div>
                </td>

                {/* Owner */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {agency.ownerName}
                  </span>
                </td>

                {/* Email */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {agency.email}
                  </span>
                </td>

                {/* Total Car */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[#E7F7EE] text-[#0C5822]">
                    {agency.totalCars}
                  </span>
                </td>

                {/* Complete Order */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {agency.completedOrders}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold',
                      agency.status === 'active'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-800'
                    )}
                  >
                    {agency.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <AgencyActionButtons
                    agency={agency}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
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





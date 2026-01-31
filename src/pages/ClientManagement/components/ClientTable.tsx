import { motion } from 'framer-motion'
import { ClientActionButtons } from './ClientActionButtons'
import { cn } from '@/utils/cn'
import type { Client } from '@/types'

interface ClientTableProps {
  clients: Client[]
  onView: (client: Client) => void
  onToggleStatus: (client: Client) => void
  onApproveRequest: (client: Client) => void
  onRejectRequest: (client: Client) => void
}

export function ClientTable({
  clients,
  onView,
  onToggleStatus,
  onApproveRequest,
  onRejectRequest,
}: ClientTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-[#E2FBFB] text-slate-800">
            <th className="px-6 py-4 text-left text-sm font-bold">Client Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Phone</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Country</th>
            <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {clients.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-8 text-center text-gray-500"
              >
                No clients found
              </td>
            </tr>
          ) : (
            clients.map((client, index) => (
              <motion.tr
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.10 * index }}
                className={cn(
                  'hover:bg-gray-50 transition-colors ',
                  client.status === 'verified'
                    ? 'border-green-500'
                    : client.status === 'requested'
                    ? 'border-yellow-500'
                    : 'border-gray-200'
                )}
              >
                {/* Client Name Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={client.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Client'}
                      alt={client.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-sm font-semibold text-slate-800">
                      {client.name}
                    </span>
                  </div>
                </td>

                {/* Phone Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {client.phone}
                  </span>
                </td>

                {/* Email Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {client.email}
                  </span>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-3 py-1 w-20 text-center rounded-sm text-xs font-medium',
                      client.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : client.status === 'requested'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {client.status === 'verified'
                      ? 'Verified'
                      : client.status === 'requested'
                      ? 'Requested'
                      : 'Unverified'}
                  </span>
                </td>

                {/* Country Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {client.country}
                  </span>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4">
                  <ClientActionButtons
                    client={client}
                    onView={onView}
                    onToggleStatus={onToggleStatus}
                    onApproveRequest={onApproveRequest}
                    onRejectRequest={onRejectRequest}
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


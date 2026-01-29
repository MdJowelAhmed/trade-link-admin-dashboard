import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { Lead } from '@/types'
import { LeadActionButtons } from './LeadActionButtons'
import { Edit, } from 'lucide-react'

interface LeadTableProps {
  leads: Lead[]
  onView: (lead: Lead) => void
}

export function LeadTable({ leads, onView }: LeadTableProps) {
  const changeStatus = (lead: Lead) => {
    console.log(lead)
  }
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-card text-slate-800">
            <th className="px-6 py-4 text-left text-sm font-bold">SL</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">
              Required Services
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Contact</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-8 text-center text-gray-500"
              >
                No leads found
              </td>
            </tr>
          ) : (
            leads.map((lead, index) => (
              <motion.tr
                key={lead.id}
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

                {/* Name Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        lead.avatar ||
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=Lead'
                      }
                      alt={lead.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-sm font-semibold text-slate-800">
                      {lead.name}
                    </span>
                  </div>
                </td>

                {/* Required Services Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {lead.requiredService}
                  </span>
                </td>

                {/* Email Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{lead.email}</span>
                </td>

                {/* Contact Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {lead.contact}
                  </span>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-3 py-1 w-20 text-center rounded-full text-xs font-medium',
                      lead.status === 'active'
                        ? 'bg-secondary text-white px-5 py-2'
                        : 'bg-secondary-foreground text-white px-5 py-2'
                    )}
                  >
                    {lead.status === 'active' ? 'Active' : 'Expired'}
                  </span>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4 flex items-center justify-end gap-2">
                  <LeadActionButtons lead={lead} onView={onView} />
                  <button  onClick={() => changeStatus(lead)}><Edit className="w-4 h-4" /> </button>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}


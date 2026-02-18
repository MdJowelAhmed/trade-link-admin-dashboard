import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { Lead } from '@/types'
import { JobPostStatus } from '@/types'
import { LeadActionButtons } from './LeadActionButtons'
// import { Edit, } from 'lucide-react'

const getStatusStyles = (status: JobPostStatus) => {
  switch (status) {
    case JobPostStatus.OPEN:
      return 'bg-green-100 text-green-700 border-green-200'
    case JobPostStatus.CLOSED:
      return 'bg-gray-100 text-gray-700 border-gray-200'
    case JobPostStatus.HIRED:
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case JobPostStatus.COMPLETED:
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case JobPostStatus.EXPIRED:
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getStatusLabel = (status: JobPostStatus) => {
  switch (status) {
    case JobPostStatus.OPEN:
      return 'Open'
    case JobPostStatus.CLOSED:
      return 'Closed'
    case JobPostStatus.HIRED:
      return 'Hired'
    case JobPostStatus.COMPLETED:
      return 'Completed'
    case JobPostStatus.EXPIRED:
      return 'Expired'
    default:
      return status
  }
}

interface LeadTableProps {
  leads: Lead[]
  onView: (lead: Lead) => void
}

export function LeadTable({ leads, onView }: LeadTableProps) {
  // const changeStatus = (lead: Lead) => {
  //   console.log(lead)
  // }
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-card text-slate-800">
            {/* <th className="px-6 py-4 text-left text-sm font-bold">SL</th> */}
            <th className="px-6 py-4 text-left text-sm font-bold">Lead ID</th>
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
                {/* <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </td> */}

                {/* Lead ID Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-700">
                    {lead.leadId}
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
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
                      getStatusStyles(lead.status)
                    )}
                  >
                    {getStatusLabel(lead.status)}
                  </span>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4 flex items-center justify-end gap-2">
                  <LeadActionButtons lead={lead} onView={onView} />
                  {/* <button  onClick={() => changeStatus(lead)}><Edit className="w-4 h-4" /> </button> */}
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}


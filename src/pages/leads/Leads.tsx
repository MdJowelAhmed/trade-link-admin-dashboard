

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { useUrlNumber, useUrlString } from '@/hooks/useUrlState'
import { toast } from '@/utils/toast'
import type { Lead, LeadStatus } from '@/types'
import {
  clearFilters,
  setFilters,
  setLeadStatus,
  setLimit,
  setPage,
} from '@/redux/slices/leadSlice'
import { LeadFilterDropdown } from './components/LeadFilterDropdown'
import { LeadTable } from './components/LeadTable'
import { ViewLeadDetailsModal } from './components/ViewLeadDetailsModal'

export default function Leads() {
  const dispatch = useAppDispatch()

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'toggle'
    lead: Lead
  } | null>(null)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  // URL state management
  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [statusFilter, setStatusFilter] = useUrlString('status', 'all')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  // Redux state
  const { filteredList, pagination } = useAppSelector((state) => state.leads)

  // Sync URL state with Redux filters
  useEffect(() => {
    dispatch(
      setFilters({
        search: searchQuery,
        status: statusFilter as LeadStatus | 'all',
      })
    )
  }, [searchQuery, statusFilter, dispatch])

  // Sync URL pagination with Redux
  useEffect(() => {
    dispatch(setPage(currentPage))
  }, [currentPage, dispatch])

  useEffect(() => {
    dispatch(setLimit(itemsPerPage))
  }, [itemsPerPage, dispatch])

  // Reset filters on unmount so other pages are not affected
  useEffect(
    () => () => {
      dispatch(clearFilters())
    },
    [dispatch]
  )

  // Pagination
  const totalPages = pagination.totalPages
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit
    return filteredList.slice(startIndex, startIndex + pagination.limit)
  }, [filteredList, pagination.page, pagination.limit])

  // Handlers
  const handleView = (lead: Lead) => {
    setSelectedLead(lead)
    setIsViewModalOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return

    setIsConfirmLoading(true)
    try {
      const { type, lead } = confirmAction

      if (type === 'toggle') {
        const nextStatus: LeadStatus =
          lead.status === 'active' ? 'expired' : 'active'
        dispatch(setLeadStatus({ id: lead.id, status: nextStatus }))
        toast({
          title: 'Success',
          description: `${lead.name} is now ${nextStatus === 'active' ? 'Active' : 'Expired'}.`,
          variant: 'success',
        })
      }

      setIsConfirmOpen(false)
      setConfirmAction(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lead status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsConfirmLoading(false)
    }
  }

  const getConfirmDialogConfig = () => {
    if (!confirmAction) return null

    const { type, lead } = confirmAction

    if (type === 'toggle') {
      const nextStatus = lead.status === 'active' ? 'expired' : 'active'
      return {
        title: 'Change Status',
        description: `Are you sure you want to change ${lead.name}'s status to ${
          nextStatus === 'active' ? 'Active' : 'Expired'
        }?`,
        variant: 'warning' as const,
        confirmText: 'Change Status',
      }
    }

    return null
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-slate-800">
            Leads
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search here"
              className="w-[300px]"
            />

            {/* Filter Dropdown */}
            <LeadFilterDropdown
              value={statusFilter as LeadStatus | 'all'}
              onChange={setStatusFilter}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table */}
          <LeadTable leads={paginatedData} onView={handleView} />

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={totalPages}
              totalItems={filteredList.length}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* View Lead Details Modal */}
      <ViewLeadDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedLead(null)
        }}
        lead={selectedLead}
      />

      {/* Confirmation Dialog */}
      {confirmAction && getConfirmDialogConfig() && (
        <ConfirmDialog
          open={isConfirmOpen}
          onClose={() => {
            setIsConfirmOpen(false)
            setConfirmAction(null)
          }}
          onConfirm={handleConfirmAction}
          title={getConfirmDialogConfig()!.title}
          description={getConfirmDialogConfig()!.description}
          variant={getConfirmDialogConfig()!.variant}
          confirmText={getConfirmDialogConfig()!.confirmText}
          isLoading={isConfirmLoading}
        />
      )}
    </motion.div>
  )
}

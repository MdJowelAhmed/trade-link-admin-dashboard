

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { InlineLoader } from '@/components/common/Loading'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { useUrlNumber, useUrlString } from '@/hooks/useUrlState'
import { toast } from '@/utils/toast'
import type { Lead, LeadStatus, LeadAnsweredQuestion } from '@/types'
import { JobPostStatus } from '@/types'
import {
  setLeads,
  setLeadStatus,
  setPagination,
} from '@/redux/slices/leadSlice'
import {
  useGetLeadsQuery,
  useUpdateLeadStatusMutation,
} from '@/redux/api/leadsApi'
import { LeadFilterDropdown } from './components/LeadFilterDropdown'
import { LeadTable } from './components/LeadTable'
import { ViewLeadDetailsModal } from './components/ViewLeadDetailsModal'

// Map backend lead status to UI LeadStatus
const mapBackendStatusToLeadStatus = (status: string): LeadStatus => {
  // Map backend status to JobPostStatus enum
  const upperStatus = status.toUpperCase()
  if (upperStatus === 'OPEN') return JobPostStatus.OPEN
  if (upperStatus === 'CLOSED') return JobPostStatus.CLOSED
  if (upperStatus === 'HIRED') return JobPostStatus.HIRED
  if (upperStatus === 'COMPLETED') return JobPostStatus.COMPLETED
  if (upperStatus === 'EXPIRED') return JobPostStatus.EXPIRED
  // Default to OPEN if status doesn't match
  return JobPostStatus.OPEN
}

// Safely build budget/notes from answered questions
const buildLeadBudgetAndNotes = (
  answeredQuestions: LeadAnsweredQuestion[] | undefined
): { budget?: string; notes?: string } => {
  if (!answeredQuestions || answeredQuestions.length === 0) {
    return {}
  }

  // Helper to normalize question/answer text regardless of backend key names
  const getQuestionText = (q: LeadAnsweredQuestion): string | undefined => {
    return (q.questionText || q.question)?.trim()
  }

  const getAnswerText = (q: LeadAnsweredQuestion): string | undefined => {
    if (Array.isArray(q.answer)) {
      return q.answer.filter(Boolean).join(', ').trim()
    }
    return (q.answerText || (typeof q.answer === 'string' ? q.answer : ''))?.trim()
  }

  // Try to find a budget-like answer
  const budgetAnswer = answeredQuestions.find((q) => {
    const qt = getQuestionText(q)?.toLowerCase() ?? ''
    const at = getAnswerText(q)
    return qt.includes('budget') && !!at && at.length > 0
  })

  const budget = budgetAnswer ? getAnswerText(budgetAnswer) : undefined

  const notesParts = answeredQuestions
    .map((q) => {
      const qt = getQuestionText(q)
      const at = getAnswerText(q)
      if (!qt || !at) return null
      return `${qt}: ${at}`
    })
    .filter(Boolean) as string[]

  const notes = notesParts.length > 0 ? notesParts.join(' / ') : undefined

  return { budget, notes }
}

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

  // Map frontend status filter to backend status
  const backendStatusFilter = useMemo(() => {
    if (statusFilter === 'all') return undefined
    return statusFilter as string
  }, [statusFilter])

  // Reset to page 1 when search or status filter changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [searchQuery, statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Backend data - pass all params to backend
  const {
    data: leadsResponse,
    isLoading: isLeadsLoading,
    isFetching: isLeadsFetching,
    isError: isLeadsError,
    error: leadsError,
  } = useGetLeadsQuery({
    searchTerm: searchQuery || undefined,
    status: backendStatusFilter,
    page: currentPage,
    limit: itemsPerPage,
  })

  const [updateLeadStatus, { isLoading: isStatusUpdating }] =
    useUpdateLeadStatusMutation()

  // Sync backend leads into Redux store
  useEffect(() => {
    if (leadsResponse?.data && Array.isArray(leadsResponse.data)) {
      const mappedLeads: Lead[] = leadsResponse.data.map((item) => {
        const { budget, notes } = buildLeadBudgetAndNotes(
          // Cast to LeadAnsweredQuestion[] to match shared type
          item.answeredQuestions as unknown as LeadAnsweredQuestion[] | undefined
        )

        return {
          id: item._id,
          leadId: item.jobNumber,
          name: item.creator?.name ?? 'Unknown',
          email: item.creator?.email ?? '',
          contact: item.creator?.phone ?? '',
          requiredService: item.service?.name ?? '',
          // Use country code as a basic location until we have more detailed data
          location: item.country || '',
          status: mapBackendStatusToLeadStatus(item.status),
          avatar: undefined,
          budget,
          notes,
          answeredQuestions: item.answeredQuestions as unknown as
            | LeadAnsweredQuestion[]
            | undefined,
          backendStatus: item.status,
          country: item.country,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }
      })

      dispatch(setLeads(mappedLeads))
      
      // Update pagination from backend response
      if (leadsResponse.pagination) {
        dispatch(setPagination({
          page: leadsResponse.pagination.page,
          limit: leadsResponse.pagination.limit,
          total: leadsResponse.pagination.total,
          totalPages: leadsResponse.pagination.totalPage,
        }))
      }
    }
  }, [leadsResponse, dispatch])

  // Basic error feedback
  useEffect(() => {
    if (isLeadsError) {
      const errorMessage =
        leadsError && typeof leadsError === 'object' && 'data' in leadsError
          ? // @ts-expect-error – RTK Query error shape
            (leadsError.data?.message as string | undefined)
          : undefined

      toast({
        title: 'Error',
        description: errorMessage || 'Failed to load leads. Please try again.',
        variant: 'destructive',
      })
    }
  }, [isLeadsError, leadsError])

  // Get pagination from Redux (synced from backend)
  const { list: leadsList, pagination } = useAppSelector((state) => state.leads)
  
  // Pagination values from backend response
  const totalPages = leadsResponse?.pagination?.totalPage || pagination.totalPages
  const totalItems = leadsResponse?.pagination?.total || pagination.total

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
        // Cycle through statuses: OPEN -> CLOSED -> HIRED -> COMPLETED -> EXPIRED -> OPEN
        const statusOrder = [
          JobPostStatus.OPEN,
          JobPostStatus.CLOSED,
          JobPostStatus.HIRED,
          JobPostStatus.COMPLETED,
          JobPostStatus.EXPIRED,
        ]
        const currentIndex = statusOrder.indexOf(lead.status)
        const nextIndex = (currentIndex + 1) % statusOrder.length
        const nextStatus: LeadStatus = statusOrder[nextIndex]

        // First hit the backend to toggle status
        await updateLeadStatus(lead.id).unwrap()

        // Then update local Redux state for instant UI feedback
        dispatch(setLeadStatus({ id: lead.id, status: nextStatus }))
        
        const statusLabels: Record<JobPostStatus, string> = {
          [JobPostStatus.OPEN]: 'Open',
          [JobPostStatus.CLOSED]: 'Closed',
          [JobPostStatus.HIRED]: 'Hired',
          [JobPostStatus.COMPLETED]: 'Completed',
          [JobPostStatus.EXPIRED]: 'Expired',
        }
        
        toast({
          title: 'Success',
          description: `${lead.name} status updated to ${statusLabels[nextStatus]}.`,
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
      const statusOrder = [
        JobPostStatus.OPEN,
        JobPostStatus.CLOSED,
        JobPostStatus.HIRED,
        JobPostStatus.COMPLETED,
        JobPostStatus.EXPIRED,
      ]
      const currentIndex = statusOrder.indexOf(lead.status)
      const nextIndex = (currentIndex + 1) % statusOrder.length
      const nextStatus = statusOrder[nextIndex]
      
      const statusLabels: Record<JobPostStatus, string> = {
        [JobPostStatus.OPEN]: 'Open',
        [JobPostStatus.CLOSED]: 'Closed',
        [JobPostStatus.HIRED]: 'Hired',
        [JobPostStatus.COMPLETED]: 'Completed',
        [JobPostStatus.EXPIRED]: 'Expired',
      }
      
      return {
        title: 'Change Status',
        description: `Are you sure you want to change ${lead.name}'s status to ${statusLabels[nextStatus]}?`,
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
            {(isLeadsLoading || isLeadsFetching || isStatusUpdating) && (
              <InlineLoader message="Loading..." size="sm" />
            )}
            {/* Search Input */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by Job ID, Service Name"
              className="w-[300px]"
            />

            {/* Filter Dropdown */}
            <LeadFilterDropdown
              value={statusFilter as JobPostStatus | 'all'}
              onChange={setStatusFilter}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table */}
          <LeadTable leads={leadsList} onView={handleView} />

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
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

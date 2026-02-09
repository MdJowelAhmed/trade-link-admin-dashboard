

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
import {
  clearFilters,
  setFilters,
  setLeadStatus,
  setLimit,
  setPage,
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
  // Treat OPEN as active, everything else as expired for now
  return status === 'OPEN' ? 'active' : 'expired'
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

  // Redux state
  const { filteredList, pagination } = useAppSelector((state) => state.leads)

  // Backend data (currently we fetch all leads and handle filtering/pagination on the client)
  const {
    data: leadsResponse,
    isLoading: isLeadsLoading,
    isFetching: isLeadsFetching,
    isError: isLeadsError,
    error: leadsError,
  } = useGetLeadsQuery()

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

      dispatch({ type: 'leads/setLeads', payload: mappedLeads })
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

        // First hit the backend to toggle status
        await updateLeadStatus(lead.id).unwrap()

        // Then update local Redux state for instant UI feedback
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
            {(isLeadsLoading || isLeadsFetching || isStatusUpdating) && (
              <InlineLoader message="Loading..." size="sm" />
            )}
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

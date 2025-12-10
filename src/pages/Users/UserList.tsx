import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  SearchInput,
  FilterDropdown,
  DataTable,
  Pagination,
  StatusBadge,
} from '@/components/common'
import { UserActionMenu } from './components/UserActionMenu'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setFilters, setPage, setLimit } from '@/redux/slices/userSlice'
import { useUrlParams } from '@/hooks/useUrlState'
import { USER_ROLES, USER_STATUSES } from '@/utils/constants'
import { formatDate, getInitials } from '@/utils/formatters'
import type { User, TableColumn } from '@/types'
import { motion } from 'framer-motion'

export default function UserList() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { filteredList, isLoading } = useAppSelector(
    (state) => state.users
  )

  // URL-based state management
  const { getParam, getNumberParam, setParam, setParams } = useUrlParams()
  
  const search = getParam('search', '')
  const status = getParam('status', 'all')
  const role = getParam('role', 'all')
  const page = getNumberParam('page', 1)
  const limit = getNumberParam('limit', 10)

  // Sync URL params with Redux
  useEffect(() => {
    dispatch(setFilters({ 
      search, 
      status: status as User['status'] | 'all', 
      role: role as User['role'] | 'all' 
    }))
  }, [search, status, role, dispatch])

  useEffect(() => {
    dispatch(setPage(page))
  }, [page, dispatch])

  useEffect(() => {
    dispatch(setLimit(limit))
  }, [limit, dispatch])

  const columns: TableColumn<User>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'User',
        sortable: true,
        render: (_, user) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'phone',
        label: 'Phone',
        render: (value) => <span className="text-muted-foreground">{value as string}</span>,
      },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
        render: (value) => <StatusBadge status={value as string} type="role" />,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => <StatusBadge status={value as string} />,
      },
      {
        key: 'createdAt',
        label: 'Joined',
        sortable: true,
        render: (value) => (
          <span className="text-muted-foreground">{formatDate(value as string)}</span>
        ),
      },
    ],
    []
  )

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit
    const end = start + limit
    return filteredList.slice(start, end)
  }, [filteredList, page, limit])

  const handleSearch = (value: string) => {
    setParams({ search: value, page: 1 })
  }

  const handleStatusFilter = (value: string) => {
    setParams({ status: value, page: 1 })
  }

  const handleRoleFilter = (value: string) => {
    setParams({ role: value, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setParam('page', newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setParams({ limit: newLimit, page: 1 })
  }

  const handleRowClick = (user: User) => {
    navigate(`/users/${user.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Users</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your users, view details, and control access
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search by name, email, phone..."
              className="sm:w-80"
            />
            <div className="flex gap-3">
              <FilterDropdown
                value={status}
                options={USER_STATUSES}
                onChange={handleStatusFilter}
                placeholder="All Status"
              />
              <FilterDropdown
                value={role}
                options={USER_ROLES}
                onChange={handleRoleFilter}
                placeholder="All Roles"
              />
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={paginatedData}
            isLoading={isLoading}
            rowKeyExtractor={(row) => row.id}
            onRowClick={handleRowClick}
            actions={(user) => <UserActionMenu user={user} />}
            emptyMessage="No users found. Try adjusting your filters."
          />

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(filteredList.length / limit)}
            totalItems={filteredList.length}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}

import  { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Eye, Edit, Ban, CheckCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/common'
import { useAppDispatch } from '@/redux/hooks'
import { updateUserStatus, deleteUser } from '@/redux/slices/userSlice'
import type { User } from '@/types'
import { toast } from '@/utils/toast'

interface UserActionMenuProps {
  user: User
}

export function UserActionMenu({ user }: UserActionMenuProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)

  const handleView = () => {
    navigate(`/users/${user.id}`)
  }

  const handleEdit = () => {
    // Open edit modal - you can implement this with the modal system
    toast({
      title: 'Edit User',
      description: `Editing ${user.firstName} ${user.lastName}`,
    })
  }

  const handleToggleStatus = () => {
    if (user.status === 'blocked') {
      dispatch(updateUserStatus({ id: user.id, status: 'active' }))
      toast({
        title: 'User Activated',
        description: `${user.firstName} ${user.lastName} has been activated.`,
      })
    } else {
      setShowBlockDialog(true)
    }
  }

  const handleBlockConfirm = () => {
    dispatch(updateUserStatus({ id: user.id, status: 'blocked' }))
    setShowBlockDialog(false)
    toast({
      title: 'User Blocked',
      description: `${user.firstName} ${user.lastName} has been blocked.`,
      variant: 'destructive',
    })
  }

  const handleDeleteConfirm = () => {
    dispatch(deleteUser(user.id))
    setShowDeleteDialog(false)
    toast({
      title: 'User Deleted',
      description: `${user.firstName} ${user.lastName} has been deleted.`,
      variant: 'destructive',
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleStatus}>
            {user.status === 'blocked' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate User
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Block User
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Block Confirmation Dialog */}
      <ConfirmDialog
        open={showBlockDialog}
        onClose={() => setShowBlockDialog(false)}
        onConfirm={handleBlockConfirm}
        title="Block User"
        description={`Are you sure you want to block ${user.firstName} ${user.lastName}? They will no longer be able to access the platform.`}
        confirmText="Block User"
        variant="warning"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        description={`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}













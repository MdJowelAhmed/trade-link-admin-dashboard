import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    useCreateLocationMutation,
    useGetLocationsQuery,
    useUpdateLocationMutation,
    type LocationEntity,
    type LocationType,
} from '@/redux/api/locationApi'
import { getParentSelectLabel, getParentTypeFor, LOCATION_TAB_LABELS } from '../constants'
import { toast } from '@/utils/toast'
import { isFetchBaseQueryError } from '../errorUtils'

const editFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    isActive: z.boolean(),
    parentId: z.string().optional(),
})

type FormValues = z.infer<typeof editFormSchema>

function buildCreateSchema(requiresParent: boolean) {
    return z
        .object({
            name: z.string().min(1, 'Name is required'),
            parentId: z.string().optional(),
            isActive: z.boolean().optional(),
        })
        .superRefine((data, ctx) => {
            if (requiresParent && (!data.parentId || data.parentId === '')) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select a parent',
                    path: ['parentId'],
                })
            }
        })
}

function extractErrorMessage(error: unknown): string {
    if (!isFetchBaseQueryError(error)) {
        return 'Request failed'
    }
    const d = error.data as Record<string, unknown> | undefined
    if (!d) return 'Request failed'
    const msg = d.message
    if (typeof msg === 'string') return msg
    if (Array.isArray(msg)) {
        const parts = msg
            .map((item) => {
                if (item && typeof item === 'object' && 'message' in item) {
                    return String((item as { message: unknown }).message)
                }
                return null
            })
            .filter(Boolean)
        if (parts.length) return parts.join(' · ')
    }
    return 'Request failed'
}

interface AddEditLocationModalProps {
    open: boolean
    onClose: () => void
    mode: 'create' | 'edit'
    createType?: LocationType
    location?: LocationEntity | null
}

export function AddEditLocationModal({
    open,
    onClose,
    mode,
    createType = 'country',
    location = null,
}: AddEditLocationModalProps) {
    const PARENT_LOOKUP_LIMIT = 1000
    const [parentSearch, setParentSearch] = useState('')

    const parentType = mode === 'create' ? getParentTypeFor(createType) : null
    const requiresParent = Boolean(parentType)

    const { data: parentsRes, isFetching: parentsLoading } = useGetLocationsQuery(
        {
            type: parentType!,
            page: 1,
            limit: PARENT_LOOKUP_LIMIT,
            searchTerm: parentSearch || undefined,
        },
        { skip: !open || mode !== 'create' || !parentType }
    )
    const parents = parentsRes?.data ?? []

    const editParentType =
        mode === 'edit' && location ? getParentTypeFor(location.type) : null
    const editParentId =
        mode === 'edit' && location && typeof location.parentId === 'string'
            ? location.parentId
            : null
    const editParentNameFromObject =
        mode === 'edit' && location && typeof location.parentId === 'object' && location.parentId
            ? location.parentId.name ?? null
            : null

    const {
        data: editParentsRes,
        isFetching: editParentsLoading,
    } = useGetLocationsQuery(
        { type: editParentType!, page: 1, limit: PARENT_LOOKUP_LIMIT },
        {
            skip:
                !open ||
                mode !== 'edit' ||
                !editParentType ||
                !editParentId ||
                Boolean(editParentNameFromObject),
        }
    )

    const editParents = editParentsRes?.data ?? []
    const editParentNameById = useMemo(() => {
        const map: Record<string, string> = {}
        for (const p of editParents) {
            map[p._id] = p.name
        }
        return map
    }, [editParents])

    const editParentNameResolved =
        editParentNameFromObject ?? (editParentId ? editParentNameById[editParentId] : null)

    const [createLocation, { isLoading: creating }] = useCreateLocationMutation()
    const [updateLocation, { isLoading: updating }] = useUpdateLocationMutation()

    const formSchema = useMemo(
        () => (mode === 'create' ? buildCreateSchema(requiresParent) : editFormSchema),
        [mode, requiresParent]
    )

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema as z.ZodType<FormValues>),
        defaultValues: {
            name: '',
            parentId: '',
            isActive: true,
        },
    })

    const isActive = watch('isActive')
    const parentId = watch('parentId')

    useEffect(() => {
        if (!open) return
        setParentSearch('')
        if (mode === 'edit' && location) {
            reset({
                name: location.name,
                isActive: location.isActive,
                parentId: '',
            })
        } else if (mode === 'create') {
            reset({
                name: '',
                parentId: '',
                isActive: true,
            })
        }
    }, [open, mode, location, reset])

    const onSubmit = async (values: FormValues) => {
        try {
            if (mode === 'create') {
                const payload: { name: string; type: LocationType; parentId?: string } = {
                    name: values.name.trim(),
                    type: createType,
                }
                if (requiresParent && values.parentId) {
                    payload.parentId = values.parentId
                }
                await createLocation(payload).unwrap()
                toast({
                    title: 'Location created',
                    variant: 'success',
                })
            } else if (location) {
                await updateLocation({
                    id: location._id,
                    body: {
                        name: values.name.trim(),
                        isActive: values.isActive,
                    },
                }).unwrap()
                toast({
                    title: 'Location updated',
                    variant: 'success',
                })
            }
            onClose()
        } catch (e) {
            toast({
                title: extractErrorMessage(e),
                variant: 'destructive',
            })
        }
    }

    const parentLabel = getParentSelectLabel(createType)
    const loading = creating || updating
    const titleLabel = LOCATION_TAB_LABELS[createType]
    const editParentLabel = location?.type ? getParentSelectLabel(location.type) : null

    return (
        <ModalWrapper
            open={open}
            onClose={onClose}
            title={mode === 'create' ? `Add ${titleLabel}` : 'Edit location'}
            description={
                mode === 'create' && createType === 'country'
                    ? 'Countries do not require a parent.'
                    : mode === 'create' && parentLabel
                      ? `Select a ${parentLabel.toLowerCase()} as parent.`
                      : 'Update name and active status.'
            }
            size="md"
            className=" bg-white"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <div className="space-y-2">
                    <Label htmlFor="loc-name">Name</Label>
                    <Input
                        id="loc-name"
                        placeholder="e.g. United Kingdom"
                        className="rounded-full"
                        {...register('name')}
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                </div>

                {mode === 'create' && requiresParent && parentType && parentLabel && (
                    <div className="space-y-2">
                        <Label>{parentLabel}</Label>
                        <Select
                            value={parentId || undefined}
                            onValueChange={(v) => setValue('parentId', v, { shouldValidate: true })}
                            disabled={parentsLoading}
                        >
                            <SelectTrigger className="rounded-full" error={!!errors.parentId}>
                                <SelectValue
                                    placeholder={
                                        parentsLoading
                                            ? `Loading ${parentLabel.toLowerCase()}s…`
                                            : `Select ${parentLabel.toLowerCase()}`
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        value={parentSearch}
                                        onChange={(e) => setParentSearch(e.target.value)}
                                        placeholder={`Search ${parentLabel.toLowerCase()}...`}
                                        className="h-9 rounded-full"
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                                {parents.map((p) => (
                                    <SelectItem key={p._id} value={p._id}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.parentId && (
                            <p className="text-sm text-destructive">{errors.parentId.message}</p>
                        )}
                        {!parentsLoading && parents.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No {parentLabel.toLowerCase()} available. Create one in the
                                previous tab first.
                            </p>
                        )}
                    </div>
                )}

                {mode === 'edit' && (
                    <>
                        {editParentType && (
                            <div className="rounded-2xl border border-border px-4 py-3">
                                <div className="space-y-1">
                                    <Label className="text-base">
                                        Parent{editParentLabel ? ` (${editParentLabel})` : ''}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {editParentsLoading
                                            ? 'Loading...'
                                            : editParentNameResolved ?? '—'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                            <div>
                                <Label htmlFor="loc-active" className="text-base">
                                    Active
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Inactive locations can be hidden.
                                </p>
                            </div>
                            <Switch
                                id="loc-active"
                                checked={isActive ?? true}
                                onCheckedChange={(v) =>
                                    setValue('isActive', v, { shouldValidate: true })
                                }
                            />
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" className="rounded-full" disabled={loading}>
                        {loading ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    )
}

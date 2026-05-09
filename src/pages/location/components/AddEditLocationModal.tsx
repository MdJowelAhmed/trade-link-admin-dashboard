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
import {
    getParentSelectLabel,
    getParentTypeFor,
    LOCATION_TAB_LABELS,
    locationTypeHasCoordinates,
} from '../constants'
import { toast } from '@/utils/toast'
import { isFetchBaseQueryError } from '../errorUtils'

/** Normalize HTML input to number | undefined; invalid numeric input becomes NaN for validation. */
function coordSetValueAs(v: unknown): number | undefined {
    if (v === '' || v === null || v === undefined) return undefined
    const n = typeof v === 'number' ? v : parseFloat(String(v).trim())
    if (!Number.isFinite(n)) return Number.NaN
    return n
}

function refineCoordinates(
    data: { latitude?: unknown; longitude?: unknown },
    ctx: z.RefinementCtx
) {
    const parse = (key: 'latitude' | 'longitude', raw: unknown): number | undefined => {
        if (raw === '' || raw === undefined || raw === null) return undefined
        if (typeof raw === 'number') {
            if (Number.isNaN(raw)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Enter a valid number',
                    path: [key],
                })
                return undefined
            }
            return raw
        }
        const n = parseFloat(String(raw).trim())
        if (!Number.isFinite(n)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Enter a valid number',
                path: [key],
            })
            return undefined
        }
        return n
    }

    const lat = parse('latitude', data.latitude)
    const lng = parse('longitude', data.longitude)

    if (lat !== undefined) {
        if (lat < -90 || lat > 90) {
            const inLongitudeRange = lat >= -180 && lat <= 180
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['latitude'],
                message: inLongitudeRange
                    ? 'This value is outside the latitude range (-90 to 90). You may have entered longitude in the latitude field.'
                    : 'Latitude must be between -90 and 90.',
            })
        }
    }

    if (lng !== undefined && (lng < -180 || lng > 180)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['longitude'],
            message: 'Longitude must be between -180 and 180.',
        })
    }
}

function buildEditSchema(editParentType: string | null, includeCoordinates: boolean) {
    return z
        .object({
            name: z.string().min(1, 'Name is required'),
            isActive: z.boolean(),
            parentId: z.string().optional(),
            ...(includeCoordinates
                ? { latitude: z.any().optional(), longitude: z.any().optional() }
                : {}),
        })
        .superRefine((data, ctx) => {
            if (editParentType && (!data.parentId || data.parentId === '')) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select a parent',
                    path: ['parentId'],
                })
            }
            if (includeCoordinates) {
                refineCoordinates(data, ctx)
            }
        })
}

type LocationModalFormValues = {
    name: string
    parentId?: string
    isActive?: boolean
    latitude?: number
    longitude?: number
}

function buildCreateSchema(requiresParent: boolean, includeCoordinates: boolean) {
    return z
        .object({
            name: z.string().min(1, 'Name is required'),
            parentId: z.string().optional(),
            isActive: z.boolean().optional(),
            ...(includeCoordinates
                ? { latitude: z.any().optional(), longitude: z.any().optional() }
                : {}),
        })
        .superRefine((data, ctx) => {
            if (requiresParent && (!data.parentId || data.parentId === '')) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select a parent',
                    path: ['parentId'],
                })
            }
            if (includeCoordinates) {
                refineCoordinates(data, ctx)
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

    const includeCoordinates =
        mode === 'create'
            ? locationTypeHasCoordinates(createType)
            : Boolean(location && locationTypeHasCoordinates(location.type))

    const {
        data: editParentsRes,
        isFetching: editParentsLoading,
    } = useGetLocationsQuery(
        { 
            type: editParentType!, 
            page: 1, 
            limit: PARENT_LOOKUP_LIMIT,
            searchTerm: parentSearch || undefined,
        },
        {
            skip: !open || mode !== 'edit' || !editParentType,
        }
    )

    const editParents = useMemo(() => editParentsRes?.data ?? [], [editParentsRes])

    const [createLocation, { isLoading: creating }] = useCreateLocationMutation()
    const [updateLocation, { isLoading: updating }] = useUpdateLocationMutation()

    const formSchema = useMemo(
        () => {
            if (mode === 'create') {
                return buildCreateSchema(requiresParent, includeCoordinates)
            }
            return buildEditSchema(editParentType, includeCoordinates)
        },
        [mode, requiresParent, includeCoordinates, editParentType]
    )

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<LocationModalFormValues>({
        resolver: zodResolver(formSchema as z.ZodType<LocationModalFormValues>),
        defaultValues: {
            name: '',
            parentId: '',
            isActive: true,
            latitude: undefined,
            longitude: undefined,
        },
    })

    const isActive = watch('isActive')
    const parentId = watch('parentId')

    useEffect(() => {
        if (!open) return
        setParentSearch('')
        if (mode === 'edit' && location) {
            let parentIdValue = ''
            if (typeof location.parentId === 'string') {
                parentIdValue = location.parentId
            } else if (location.parentId && typeof location.parentId === 'object' && '_id' in location.parentId) {
                parentIdValue = location.parentId._id
            }
            reset({
                name: location.name,
                isActive: location.isActive,
                parentId: parentIdValue,
                latitude: location.latitude,
                longitude: location.longitude,
            })
        } else if (mode === 'create') {
            reset({
                name: '',
                parentId: '',
                isActive: true,
                latitude: undefined,
                longitude: undefined,
            })
        }
    }, [open, mode, location, reset])

    const onSubmit = async (values: LocationModalFormValues) => {
        try {
            if (mode === 'create') {
                const payload: {
                    name: string
                    type: LocationType
                    parentId?: string
                    latitude?: number
                    longitude?: number
                } = {
                    name: values.name.trim(),
                    type: createType,
                }
                if (requiresParent && values.parentId) {
                    payload.parentId = values.parentId
                }
                if (includeCoordinates) {
                    if (
                        values.latitude !== undefined &&
                        !Number.isNaN(values.latitude)
                    ) {
                        payload.latitude = values.latitude
                    }
                    if (
                        values.longitude !== undefined &&
                        !Number.isNaN(values.longitude)
                    ) {
                        payload.longitude = values.longitude
                    }
                }
                await createLocation(payload).unwrap()
                toast({
                    title: 'Location created',
                    variant: 'success',
                })
            } else if (location) {
                const updatePayload: {
                    name: string
                    isActive: boolean
                    parentId?: string
                    latitude?: number
                    longitude?: number
                } = {
                    name: values.name.trim(),
                    isActive: values.isActive ?? true,
                }
                if (editParentType && values.parentId) {
                    updatePayload.parentId = values.parentId
                }
                if (includeCoordinates) {
                    if (
                        values.latitude !== undefined &&
                        !Number.isNaN(values.latitude)
                    ) {
                        updatePayload.latitude = values.latitude
                    }
                    if (
                        values.longitude !== undefined &&
                        !Number.isNaN(values.longitude)
                    ) {
                        updatePayload.longitude = values.longitude
                    }
                }
                await updateLocation({
                    id: location._id,
                    body: updatePayload,
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
                      ? `Select a ${parentLabel.toLowerCase()} as parent.${
                            includeCoordinates
                                ? ' Optional coordinates must use the correct latitude and longitude fields.'
                                : ''
                        }`
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

                {mode === 'create' && includeCoordinates && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="loc-latitude">Latitude (optional)</Label>
                                <Input
                                    id="loc-latitude"
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="Enter Latitude"
                                    className="rounded-full"
                                    {...register('latitude', { setValueAs: coordSetValueAs })}
                                />
                                {errors.latitude && (
                                    <p className="text-sm text-destructive">
                                        {errors.latitude.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="loc-longitude">Longitude (optional)</Label>
                                <Input
                                    id="loc-longitude"
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="Enter Longitude"
                                    className="rounded-full"
                                    {...register('longitude', { setValueAs: coordSetValueAs })}
                                />
                                {errors.longitude && (
                                    <p className="text-sm text-destructive">
                                        {errors.longitude.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* <p className="text-xs text-muted-foreground">
                            Use latitude for north–south (-90 to 90) and longitude for east–west
                            (-180 to 180). Values outside those ranges on a field suggest the
                            other field was used by mistake.
                        </p> */}
                    </div>
                )}

                {mode === 'edit' && (
                    <>
                        {editParentType && editParentLabel && (
                            <div className="space-y-2">
                                <Label>{editParentLabel}</Label>
                                <Select
                                    value={parentId || undefined}
                                    onValueChange={(v) => {
                                        setValue('parentId', v, { shouldValidate: true })
                                        setParentSearch('')
                                    }}
                                    disabled={editParentsLoading}
                                >
                                    <SelectTrigger className="rounded-full" error={!!errors.parentId}>
                                        <SelectValue
                                            placeholder={
                                                editParentsLoading
                                                    ? `Loading ${editParentLabel.toLowerCase()}s…`
                                                    : `Select ${editParentLabel.toLowerCase()}`
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2">
                                            <Input
                                                value={parentSearch}
                                                onChange={(e) => setParentSearch(e.target.value)}
                                                placeholder={`Search ${editParentLabel.toLowerCase()}...`}
                                                className="h-9 rounded-full"
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        {editParents.map((p) => (
                                            <SelectItem key={p._id} value={p._id}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.parentId && (
                                    <p className="text-sm text-destructive">{errors.parentId.message}</p>
                                )}
                                {!editParentsLoading && editParents.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No {editParentLabel.toLowerCase()} available.
                                    </p>
                                )}
                            </div>
                        )}

                        {includeCoordinates && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="loc-edit-latitude">Latitude (optional)</Label>
                                        <Input
                                            id="loc-edit-latitude"
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="Enter Latitude"
                                            className="rounded-full"
                                            {...register('latitude', {
                                                setValueAs: coordSetValueAs,
                                            })}
                                        />
                                        {errors.latitude && (
                                            <p className="text-sm text-destructive">
                                                {errors.latitude.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="loc-edit-longitude">Longitude (optional)</Label>
                                        <Input
                                            id="loc-edit-longitude"
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="Enter Longitude"
                                            className="rounded-full"
                                            {...register('longitude', {
                                                setValueAs: coordSetValueAs,
                                            })}
                                        />
                                        {errors.longitude && (
                                            <p className="text-sm text-destructive">
                                                {errors.longitude.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {/* <p className="text-xs text-muted-foreground">
                                    Use latitude for north–south (-90 to 90) and longitude for east–west
                                    (-180 to 180).
                                </p> */}
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

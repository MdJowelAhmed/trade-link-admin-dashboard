import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    useCreateServiceLocationMutation,
    useUpdateServiceLocationMutation,
    resolveServiceLocationLocationId,
    resolveServiceLocationServiceId,
    type ServiceLocationPage,
} from '@/redux/api/serviceLocationApi'
import { useGetServicesQuery, type BackendService } from '@/redux/api/serviceApi'
import { useGetLocationsQuery, type LocationEntity, type LocationType } from '@/redux/api/locationApi'
import { LOCATION_TAB_LABELS, LOCATION_TAB_ORDER } from '@/pages/location/constants'
import { toast } from '@/utils/toast'
import { isFetchBaseQueryError } from '@/pages/location/errorUtils'

const faqSchema = z.object({
    question: z.string().min(1, 'Question is required'),
    answer: z.string().min(1, 'Answer is required'),
})

const formSchema = z.object({
    serviceId: z.string().min(1, 'Select a service'),
    locationId: z.string().min(1, 'Select a location'),
    metaTitleOverride: z.string().optional(),
    metaDescriptionOverride: z.string().optional(),
    localNotes: z.string().optional(),
    isActive: z.boolean(),
    faqOverrides: z.array(faqSchema),
})

type FormValues = z.infer<typeof formSchema>

function extractErrorMessage(error: unknown): string {
    if (!isFetchBaseQueryError(error)) return 'Request failed'
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

function trimOrUndefined(s: string | undefined): string | undefined {
    const t = s?.trim()
    return t && t.length > 0 ? t : undefined
}

interface AddEditServiceLocationModalProps {
    open: boolean
    onClose: () => void
    mode: 'create' | 'edit'
    row?: ServiceLocationPage | null
}

const LOOKUP_LIMIT = 50

export function AddEditServiceLocationModal({
    open,
    onClose,
    mode,
    row = null,
}: AddEditServiceLocationModalProps) {
    const [serviceSearch, setServiceSearch] = useState('')
    const [locationSearch, setLocationSearch] = useState('')
    const [locationPickerType, setLocationPickerType] = useState<LocationType>('town')

    const { data: servicesRes, isFetching: servicesLoading } = useGetServicesQuery(
        {
            searchTerm: serviceSearch || undefined,
            page: 1,
            limit: LOOKUP_LIMIT,
        },
        { skip: !open }
    )

    const { data: locationsRes, isFetching: locationsLoading } = useGetLocationsQuery(
        {
            type: locationPickerType,
            page: 1,
            limit: LOOKUP_LIMIT,
            searchTerm: locationSearch || undefined,
        },
        { skip: !open }
    )

    const [createServiceLocation, { isLoading: creating }] = useCreateServiceLocationMutation()
    const [updateServiceLocation, { isLoading: updating }] = useUpdateServiceLocationMutation()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            serviceId: '',
            locationId: '',
            metaTitleOverride: '',
            metaDescriptionOverride: '',
            localNotes: '',
            isActive: true,
            faqOverrides: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'faqOverrides',
    })

    const serviceId = watch('serviceId')
    const locationId = watch('locationId')
    const isActive = watch('isActive')

    const baseServices = servicesRes?.data ?? []
    const baseLocations = locationsRes?.data ?? []

    const serviceOptions = useMemo(() => {
        if (mode === 'edit' && row && typeof row.serviceId === 'object') {
            const s = row.serviceId as BackendService
            const exists = baseServices.some((x) => x._id === s._id)
            if (!exists) return [s, ...baseServices]
        }
        return baseServices
    }, [mode, row, baseServices])

    const locationOptions = useMemo(() => {
        if (mode === 'edit' && row && typeof row.locationId === 'object') {
            const loc = row.locationId as LocationEntity
            if (loc.type === locationPickerType) {
                const exists = baseLocations.some((x) => x._id === loc._id)
                if (!exists) return [loc, ...baseLocations]
            }
        }
        return baseLocations
    }, [mode, row, baseLocations, locationPickerType])

    useEffect(() => {
        if (!open) return
        setServiceSearch('')
        setLocationSearch('')
        if (mode === 'edit' && row) {
            const loc = row.locationId
            if (typeof loc === 'object' && loc?.type) {
                setLocationPickerType(loc.type)
            } else {
                setLocationPickerType('town')
            }
            reset({
                serviceId: resolveServiceLocationServiceId(row.serviceId),
                locationId: resolveServiceLocationLocationId(row.locationId),
                metaTitleOverride: row.metaTitleOverride ?? '',
                metaDescriptionOverride: row.metaDescriptionOverride ?? '',
                localNotes: row.localNotes ?? '',
                isActive: row.isActive,
                faqOverrides: (row.faqOverrides ?? []).map((f) => ({
                    question: f.question,
                    answer: f.answer,
                })),
            })
        } else {
            setLocationPickerType('town')
            reset({
                serviceId: '',
                locationId: '',
                metaTitleOverride: '',
                metaDescriptionOverride: '',
                localNotes: '',
                isActive: true,
                faqOverrides: [],
            })
        }
    }, [open, mode, row, reset])

    const onSubmit = async (values: FormValues) => {
        const faqPayload = values.faqOverrides.map(({ question, answer }) => ({
            question: question.trim(),
            answer: answer.trim(),
        }))
        const bodyCommon = {
            metaTitleOverride: trimOrUndefined(values.metaTitleOverride),
            metaDescriptionOverride: trimOrUndefined(values.metaDescriptionOverride),
            localNotes: trimOrUndefined(values.localNotes),
            faqOverrides: faqPayload.length ? faqPayload : undefined,
        }
        try {
            if (mode === 'create') {
                await createServiceLocation({
                    serviceId: values.serviceId,
                    locationId: values.locationId,
                    ...bodyCommon,
                    isActive: values.isActive,
                }).unwrap()
                toast({ title: 'Service location created', variant: 'success' })
            } else if (row) {
                await updateServiceLocation({
                    id: row._id,
                    body: {
                        serviceId: values.serviceId,
                        locationId: values.locationId,
                        ...bodyCommon,
                        isActive: values.isActive,
                    },
                }).unwrap()
                toast({ title: 'Service location updated', variant: 'success' })
            }
            onClose()
        } catch (e) {
            toast({ title: extractErrorMessage(e), variant: 'destructive' })
        }
    }

    const loading = creating || updating

    return (
        <ModalWrapper
            open={open}
            onClose={onClose}
            title={mode === 'create' ? 'Add service & location page' : 'Edit service & location page'}
            description="Link a service with a location, set SEO overrides, and optional FAQ overrides."
            size="xl"
            className="bg-white"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label>Service</Label>
                        <Select
                            value={serviceId || undefined}
                            onValueChange={(v) => setValue('serviceId', v, { shouldValidate: true })}
                            disabled={servicesLoading}
                        >
                            <SelectTrigger className="rounded-full" error={!!errors.serviceId}>
                                <SelectValue
                                    placeholder={
                                        servicesLoading ? 'Loading services…' : 'Select service'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        value={serviceSearch}
                                        onChange={(e) => setServiceSearch(e.target.value)}
                                        placeholder="Search services…"
                                        className="h-9 rounded-full"
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                                {serviceOptions.map((s) => (
                                    <SelectItem key={s._id} value={s._id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.serviceId && (
                            <p className="text-sm text-destructive">{errors.serviceId.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Location type</Label>
                        <Select
                            value={locationPickerType}
                            onValueChange={(v) => {
                                const next = v as LocationType
                                setLocationPickerType(next)
                                setValue('locationId', '', { shouldValidate: true })
                            }}
                        >
                            <SelectTrigger className="rounded-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LOCATION_TAB_ORDER.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {LOCATION_TAB_LABELS[t]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Pick the hierarchy level, search, then select a location.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Select
                            value={locationId || undefined}
                            onValueChange={(v) => setValue('locationId', v, { shouldValidate: true })}
                            disabled={locationsLoading}
                        >
                            <SelectTrigger className="rounded-full" error={!!errors.locationId}>
                                <SelectValue
                                    placeholder={
                                        locationsLoading ? 'Loading locations…' : 'Select location'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        value={locationSearch}
                                        onChange={(e) => setLocationSearch(e.target.value)}
                                        placeholder="Search locations…"
                                        className="h-9 rounded-full"
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                                {locationOptions.map((loc) => (
                                    <SelectItem key={loc._id} value={loc._id}>
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.locationId && (
                            <p className="text-sm text-destructive">{errors.locationId.message}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sl-meta-title">Meta title override</Label>
                    <Input
                        id="sl-meta-title"
                        className="rounded-full"
                        placeholder="Optional"
                        {...register('metaTitleOverride')}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sl-meta-desc">Meta description override</Label>
                    <Textarea
                        id="sl-meta-desc"
                        className="rounded-xl min-h-[72px]"
                        placeholder="Optional"
                        {...register('metaDescriptionOverride')}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sl-notes">Local notes</Label>
                    <Textarea
                        id="sl-notes"
                        className="rounded-xl min-h-[72px]"
                        placeholder="Optional"
                        {...register('localNotes')}
                    />
                </div>

                <div className="space-y-3 rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                        <Label>FAQ overrides</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => append({ question: '', answer: '' })}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add FAQ
                        </Button>
                    </div>
                    {fields.length === 0 && (
                        <p className="text-sm text-muted-foreground">No FAQ rows. Optional.</p>
                    )}
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                            >
                                <div className="space-y-1">
                                    <Label className="text-xs">Question</Label>
                                    <Input
                                        className="rounded-full"
                                        {...register(`faqOverrides.${index}.question` as const)}
                                    />
                                    {errors.faqOverrides?.[index]?.question && (
                                        <p className="text-xs text-destructive">
                                            {errors.faqOverrides[index]?.question?.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Answer</Label>
                                    <Input
                                        className="rounded-full"
                                        {...register(`faqOverrides.${index}.answer` as const)}
                                    />
                                    {errors.faqOverrides?.[index]?.answer && (
                                        <p className="text-xs text-destructive">
                                            {errors.faqOverrides[index]?.answer?.message}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive shrink-0"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                    <div>
                        <Label htmlFor="sl-active" className="text-base">
                            Active
                        </Label>
                        <p className="text-xs text-muted-foreground">Inactive pages can be hidden.</p>
                    </div>
                    <Switch
                        id="sl-active"
                        checked={isActive}
                        onCheckedChange={(v) => setValue('isActive', v, { shouldValidate: true })}
                    />
                </div>

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

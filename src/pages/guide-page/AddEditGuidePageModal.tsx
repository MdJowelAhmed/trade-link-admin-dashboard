import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
    useCreateGuidePageMutation,
    useUpdateGuidePageMutation,
    resolveGuideServiceId,
    resolveGuideLocationId,
    type GuidePage,
    type GuidePageType,
} from '@/redux/api/guideApi'
import { useGetServicesQuery } from '@/redux/api/serviceApi'
import { useGetLocationsQuery } from '@/redux/api/locationApi'
import { toast } from '@/utils/toast'
import { isFetchBaseQueryError } from '@/pages/location/errorUtils'

const LOOKUP_LIMIT = 2000

const TYPE_LABEL: Record<GuidePageType, string> = {
    PROBLEM: 'Problem',
    COST: 'Cost',
}

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    serviceId: z.string().min(1, 'Select a service'),
    locationId: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    introduction: z.string().optional(),
    commonCauses: z.string().optional(),
    warningSigns: z.string().optional(),
    possibleRepairSolutions: z.string().optional(),
    whenToCallProfessional: z.string().optional(),
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
                if (item && typeof item === 'object' && 'message' in item)
                    return String((item as { message: unknown }).message)
                return null
            })
            .filter(Boolean)
        if (parts.length) return parts.join(' · ')
    }
    return 'Request failed'
}

interface AddEditGuidePageModalProps {
    open: boolean
    onClose: () => void
    mode: 'create' | 'edit'
    row?: GuidePage | null
    /** Active tab: sets API `type` on create; shown as read-only. Edit uses row.type. */
    lockedGuideType: GuidePageType
}

export function AddEditGuidePageModal({
    open,
    onClose,
    mode,
    row = null,
    lockedGuideType,
}: AddEditGuidePageModalProps) {
    const [serviceSearch, setServiceSearch] = useState('')
    const [locationSearch, setLocationSearch] = useState('')

    const { data: servicesRes, isFetching: servicesLoading } = useGetServicesQuery(
        { activeServices: true, page: 1, limit: LOOKUP_LIMIT, searchTerm: serviceSearch || undefined },
        { skip: !open }
    )

    const { data: regionsRes, isFetching: regionsLoading } = useGetLocationsQuery(
        { type: 'region', isActive: true, page: 1, limit: LOOKUP_LIMIT, searchTerm: locationSearch || undefined },
        { skip: !open }
    )

    const services = servicesRes?.data ?? []
    const regions = regionsRes?.data ?? []

    const serviceOptions = useMemo(() => {
        if (mode === 'edit' && row) {
            const svcId = resolveGuideServiceId(row.serviceId)
            const svcName =
                typeof row.serviceId === 'object' ? row.serviceId.name : row.serviceId
            if (svcId && !services.some((s) => s._id === svcId)) {
                return [
                    {
                        _id: svcId,
                        name: svcName,
                        isActive: true,
                        slug: '',
                        createdAt: '',
                        updatedAt: '',
                        categoryId: { _id: '', name: '' },
                    },
                    ...services,
                ]
            }
        }
        return services
    }, [services, mode, row])

    const locationOptions = useMemo(() => {
        if (mode === 'edit' && row && row.locationId) {
            const locId = resolveGuideLocationId(row.locationId)
            const locName =
                typeof row.locationId === 'object' && row.locationId !== null
                    ? row.locationId.name
                    : ''
            if (locId && !regions.some((r) => r._id === locId)) {
                return [
                    {
                        _id: locId,
                        name: locName,
                        isActive: true,
                        isIndexable: true,
                        slug: '',
                        type: 'region' as const,
                        parentId: null,
                        createdAt: '',
                        updatedAt: '',
                    },
                    ...regions,
                ]
            }
        }
        return regions
    }, [regions, mode, row])

    const [createPage, { isLoading: creating }] = useCreateGuidePageMutation()
    const [updatePage, { isLoading: updating }] = useUpdateGuidePageMutation()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            serviceId: '',
            locationId: '',
            metaTitle: '',
            metaDescription: '',
            introduction: '',
            commonCauses: '',
            warningSigns: '',
            possibleRepairSolutions: '',
            whenToCallProfessional: '',
        },
    })

    const selectedServiceId = watch('serviceId')
    const selectedLocationId = watch('locationId')

    useEffect(() => {
        if (!open) return
        setServiceSearch('')
        setLocationSearch('')

        if (mode === 'edit' && row) {
            reset({
                title: row.title,
                serviceId: resolveGuideServiceId(row.serviceId),
                locationId: resolveGuideLocationId(row.locationId) || '',
                metaTitle: row.metaTitle ?? '',
                metaDescription: row.metaDescription ?? '',
                introduction: row.content?.introduction ?? '',
                commonCauses: row.content?.commonCauses ?? '',
                warningSigns: row.content?.warningSigns ?? '',
                possibleRepairSolutions: row.content?.possibleRepairSolutions ?? '',
                whenToCallProfessional: row.content?.whenToCallProfessional ?? '',
            })
        } else {
            reset({
                title: '',
                serviceId: '',
                locationId: '',
                metaTitle: '',
                metaDescription: '',
                introduction: '',
                commonCauses: '',
                warningSigns: '',
                possibleRepairSolutions: '',
                whenToCallProfessional: '',
            })
        }
    }, [open, mode, row, reset, lockedGuideType])

    const onSubmit = async (values: FormValues) => {
        const pageType: GuidePageType =
            mode === 'create' ? lockedGuideType : row?.type ?? lockedGuideType

        const payload = {
            title: values.title.trim(),
            type: pageType,
            serviceId: values.serviceId,
            locationId: values.locationId?.trim() || undefined,
            metaTitle: values.metaTitle?.trim() || undefined,
            metaDescription: values.metaDescription?.trim() || undefined,
            content: {
                introduction: values.introduction ?? '',
                commonCauses: values.commonCauses ?? '',
                warningSigns: values.warningSigns ?? '',
                possibleRepairSolutions: values.possibleRepairSolutions ?? '',
                whenToCallProfessional: values.whenToCallProfessional ?? '',
            },
        }

        try {
            if (mode === 'create') {
                await createPage(payload).unwrap()
                toast({ title: 'Guide page created', variant: 'success' })
            } else if (row) {
                await updatePage({ id: row._id, body: payload }).unwrap()
                toast({ title: 'Guide page updated', variant: 'success' })
            }
            onClose()
        } catch (e) {
            toast({ title: extractErrorMessage(e), variant: 'destructive' })
        }
    }

    const loading = creating || updating
    const typeForLabel = mode === 'edit' && row ? row.type : lockedGuideType
    const kindLabel = TYPE_LABEL[typeForLabel]

    return (
        <ModalWrapper
            open={open}
            onClose={onClose}
            title={
                mode === 'create'
                    ? `Add ${kindLabel.toLowerCase()} guide`
                    : `Edit ${kindLabel.toLowerCase()} guide`
            }
            description={`${kindLabel} guides are linked to a service and optional region, with SEO and body content.`}
            size="xl"
            className="bg-white max-w-3xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
                {/* Title + type (from tab / row) */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="gp-title">Title</Label>
                        <Input
                            id="gp-title"
                            className="rounded-full"
                            placeholder="e.g. Resin driveway"
                            {...register('title')}
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Type</Label>
                        <div className="flex h-10 items-center border rounded-full h-11">
                            <Badge variant="secondary" className="text-sm font-normal">
                                {typeForLabel} 
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Service + Location */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Service</Label>
                        <Select
                            value={selectedServiceId || undefined}
                            onValueChange={(v) =>
                                setValue('serviceId', v, { shouldValidate: true })
                            }
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
                        <Label>Location (active regions only)</Label>
                        <Select
                            value={selectedLocationId || undefined}
                            onValueChange={(v) =>
                                setValue('locationId', v, { shouldValidate: true })
                            }
                            disabled={regionsLoading}
                        >
                            <SelectTrigger className="rounded-full">
                                <SelectValue
                                    placeholder={
                                        regionsLoading ? 'Loading regions…' : 'Select region (optional)'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        value={locationSearch}
                                        onChange={(e) => setLocationSearch(e.target.value)}
                                        placeholder="Search regions…"
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
                    </div>
                </div>

                {/* Content fields */}
                <div className="space-y-4 rounded-2xl border border-border p-4">
                    <p className="text-sm font-medium text-foreground">Content</p>

                    <div className="space-y-2">
                        <Label htmlFor="gp-intro">Introduction</Label>
                        <Textarea
                            id="gp-intro"
                            className="rounded-xl min-h-[88px]"
                            placeholder="Introduction text…"
                            {...register('introduction')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gp-causes">Common causes</Label>
                        <Textarea
                            id="gp-causes"
                            className="rounded-xl min-h-[88px]"
                            placeholder="Common causes…"
                            {...register('commonCauses')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gp-signs">Warning signs</Label>
                        <Textarea
                            id="gp-signs"
                            className="rounded-xl min-h-[88px]"
                            placeholder="Warning signs…"
                            {...register('warningSigns')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gp-repair">Possible repair solutions</Label>
                        <Textarea
                            id="gp-repair"
                            className="rounded-xl min-h-[88px]"
                            placeholder="Repair solutions…"
                            {...register('possibleRepairSolutions')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gp-when">When to call a professional</Label>
                        <Textarea
                            id="gp-when"
                            className="rounded-xl min-h-[88px]"
                            placeholder="When to call a professional…"
                            {...register('whenToCallProfessional')}
                        />
                    </div>
                </div>

                {/* SEO */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="gp-meta-title">Meta title</Label>
                        <Input
                            id="gp-meta-title"
                            className="rounded-full"
                            placeholder="Optional"
                            {...register('metaTitle')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gp-meta-desc">Meta description</Label>
                        <Textarea
                            id="gp-meta-desc"
                            className="rounded-xl min-h-[88px]"
                            placeholder="Optional"
                            {...register('metaDescription')}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" className="rounded-full" disabled={loading}>
                        {loading
                            ? 'Saving…'
                            : mode === 'create'
                              ? 'Create guide page'
                              : 'Save changes'}
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    )
}

import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, Plus, Trash2, X } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Badge } from '@/components/ui/badge'
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
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    useCreateServiceLocationMutation,
    useUpdateServiceLocationMutation,
    resolveRelatedLocationEntryId,
    resolveRelatedServiceEntryId,
    resolveServiceLocationLocationId,
    resolveServiceLocationServiceId,
    type ServiceLocationPage,
    type ServiceLocationServiceRef,
} from '@/redux/api/serviceLocationApi'
import { useGetServicesQuery, type BackendService } from '@/redux/api/serviceApi'
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi'
import {
    useGetLocationsQuery,
    useLazyGetLocationByIdQuery,
    type LocationEntity,
    type LocationType,
} from '@/redux/api/locationApi'
import { LOCATION_TAB_LABELS } from '@/pages/location/constants'
import type { ServiceLocationLocationRef } from '@/redux/api/serviceLocationApi'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'
import { isFetchBaseQueryError } from '@/pages/location/errorUtils'

/** Allow empty strings so the backend always receives `""` for blank FAQ fields. */
const faqSchema = z.object({
    question: z.string(),
    answer: z.string(),
})

const formSchema = z.object({
    serviceId: z.string().min(1, 'Select a service'),
    locationId: z.string().min(1, 'Select a location'),
    headingOverride: z.string().optional(),
    subDescriptionOverride: z.string().optional(),
    relatedServicesOverride: z.array(z.string()).default([]),
    relatedLocationsOverride: z.array(z.string()).default([]),
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

function resolveServiceCategoryId(ref: string | ServiceLocationServiceRef): string {
    if (typeof ref === 'string') return ''
    const c = ref.categoryId
    if (!c) return ''
    if (typeof c === 'string') return c
    return c._id ?? ''
}

function mergeSeedOption(list: LocationEntity[], seed?: LocationEntity | null): LocationEntity[] {
    if (!seed) return list
    if (list.some((x) => x._id === seed._id)) return list
    return [seed, ...list]
}

/**
 * Related locations: same level as the deepest selected node — regions under
 * country, counties under region, towns under county (siblings when town is selected).
 */
function getRelatedLocationListQuery(cascade: {
    country: string
    region: string
    county: string
    town: string
}): { type: LocationType; parentId: string } | null {
    if (cascade.county) {
        return { type: 'town', parentId: cascade.county }
    }
    if (cascade.region) {
        return { type: 'county', parentId: cascade.region }
    }
    if (cascade.country) {
        return { type: 'region', parentId: cascade.country }
    }
    return null
}

/**
 * Walk fully populated `parentId` objects (if API embeds parents).
 * Stops when `parentId` is a plain id string — caller should load the rest via GET by id.
 */
function collectPopulatedLocationChain(leaf: ServiceLocationLocationRef | LocationEntity): {
    ids: Partial<Record<LocationType, string>>
    entities: Partial<Record<LocationType, LocationEntity>>
    needsFetchFromParentId: string | null
} {
    const ids: Partial<Record<LocationType, string>> = {}
    const entities: Partial<Record<LocationType, LocationEntity>> = {}
    let node: ServiceLocationLocationRef | LocationEntity | null | undefined = leaf

    while (node && typeof node === 'object' && '_id' in node && 'type' in node) {
        const typed = node as LocationEntity
        ids[typed.type] = typed._id
        entities[typed.type] = typed
        const p = typed.parentId
        if (!p) {
            return { ids, entities, needsFetchFromParentId: null }
        }
        if (typeof p === 'string') {
            return { ids, entities, needsFetchFromParentId: p }
        }
        node = p as LocationEntity
    }
    return { ids, entities, needsFetchFromParentId: null }
}

async function loadAncestorChainById(
    startParentId: string,
    fetchLocation: (id: string) => Promise<{ data: LocationEntity }>,
): Promise<{ ids: Partial<Record<LocationType, string>>; entities: Partial<Record<LocationType, LocationEntity>> }> {
    const ids: Partial<Record<LocationType, string>> = {}
    const entities: Partial<Record<LocationType, LocationEntity>> = {}
    let id: string | null = startParentId
    while (id) {
        const res = await fetchLocation(id)
        const loc = res.data
        ids[loc.type] = loc._id
        entities[loc.type] = loc
        const p = loc.parentId
        if (!p) break
        const next = typeof p === 'string' ? p : (p as LocationEntity)._id
        id = loc.type === 'country' ? null : next ?? null
    }
    return { ids, entities }
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
    const [categorySearch, setCategorySearch] = useState('')
    const [serviceCategoryId, setServiceCategoryId] = useState('')
    const [serviceSearch, setServiceSearch] = useState('')
    const [countrySearch, setCountrySearch] = useState('')
    const [regionSearch, setRegionSearch] = useState('')
    const [countySearch, setCountySearch] = useState('')
    const [townSearch, setTownSearch] = useState('')
    const [relatedServicesSearch, setRelatedServicesSearch] = useState('')
    const [relatedLocationsSearch, setRelatedLocationsSearch] = useState('')
    const [cascade, setCascade] = useState({
        country: '',
        region: '',
        county: '',
        town: '',
    })
    const [locationSeeds, setLocationSeeds] = useState<Partial<Record<LocationType, LocationEntity>>>({})

    const [getLocationById] = useLazyGetLocationByIdQuery()

    const { data: categoriesRes, isFetching: categoriesLoading } = useGetCategoriesQuery(
        {
            searchTerm: categorySearch || undefined,
            page: 1,
            limit: LOOKUP_LIMIT,
        },
        { skip: !open }
    )

    const { data: servicesRes, isFetching: servicesLoading } = useGetServicesQuery(
        {
            searchTerm: serviceSearch || undefined,
            page: 1,
            limit: LOOKUP_LIMIT,
            categoryId: serviceCategoryId || undefined,
        },
        { skip: !open || !serviceCategoryId }
    )

    const { data: countriesRes, isFetching: countriesLoading } = useGetLocationsQuery(
        {
            type: 'country',
            page: 1,
            limit: LOOKUP_LIMIT,
            searchTerm: countrySearch || undefined,
        },
        { skip: !open }
    )
    const { data: regionsRes, isFetching: regionsLoading } = useGetLocationsQuery(
        {
            type: 'region',
            page: 1,
            limit: LOOKUP_LIMIT,
            parentId: cascade.country,
            searchTerm: regionSearch || undefined,
        },
        { skip: !open || !cascade.country }
    )
    const { data: countiesRes, isFetching: countiesLoading } = useGetLocationsQuery(
        {
            type: 'county',
            page: 1,
            limit: LOOKUP_LIMIT,
            parentId: cascade.region,
            searchTerm: countySearch || undefined,
        },
        { skip: !open || !cascade.region }
    )
    const { data: townsRes, isFetching: townsLoading } = useGetLocationsQuery(
        {
            type: 'town',
            page: 1,
            limit: LOOKUP_LIMIT,
            parentId: cascade.county,
            searchTerm: townSearch || undefined,
        },
        { skip: !open || !cascade.county }
    )

    const relatedLocQuery = useMemo(() => getRelatedLocationListQuery(cascade), [cascade])

    const { data: relatedLocRes, isFetching: relatedLocLoading } = useGetLocationsQuery(
        {
            type: relatedLocQuery?.type ?? 'country',
            page: 1,
            limit: LOOKUP_LIMIT,
            parentId: relatedLocQuery?.parentId,
            searchTerm: relatedLocationsSearch || undefined,
        },
        { skip: !open || !relatedLocQuery }
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
            headingOverride: '',
            subDescriptionOverride: '',
            relatedServicesOverride: [],
            relatedLocationsOverride: [],
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
    const relatedServicesSel = watch('relatedServicesOverride') ?? []
    const relatedLocationsSel = watch('relatedLocationsOverride') ?? []

    const baseCategories = categoriesRes?.data ?? []
    const baseServices = servicesRes?.data ?? []

    const categoryOptions = useMemo(() => {
        if (mode === 'edit' && row && serviceCategoryId) {
            const s = row.serviceId
            if (typeof s === 'object' && s.categoryId && typeof s.categoryId === 'object') {
                const cat = s.categoryId as { _id?: string; name?: string }
                const id = cat._id
                if (id && !baseCategories.some((x) => x._id === id)) {
                    return [
                        {
                            _id: id,
                            name: cat.name ?? 'Category',
                            slug: '',
                            isActive: true,
                            serviceCount: 0,
                            createdAt: '',
                            updatedAt: '',
                        },
                        ...baseCategories,
                    ]
                }
            }
        }
        return baseCategories
    }, [mode, row, serviceCategoryId, baseCategories])

    const serviceOptions = useMemo(() => {
        if (mode === 'edit' && row && typeof row.serviceId === 'object') {
            const s = row.serviceId as BackendService
            const exists = baseServices.some((x) => x._id === s._id)
            if (!exists) return [s, ...baseServices]
        }
        return baseServices
    }, [mode, row, baseServices])

    const countryOptions = useMemo(
        () => mergeSeedOption(countriesRes?.data ?? [], locationSeeds.country),
        [countriesRes?.data, locationSeeds.country]
    )
    const regionOptions = useMemo(
        () => mergeSeedOption(regionsRes?.data ?? [], locationSeeds.region),
        [regionsRes?.data, locationSeeds.region]
    )
    const countyOptions = useMemo(
        () => mergeSeedOption(countiesRes?.data ?? [], locationSeeds.county),
        [countiesRes?.data, locationSeeds.county]
    )
    const townOptions = useMemo(
        () => mergeSeedOption(townsRes?.data ?? [], locationSeeds.town),
        [townsRes?.data, locationSeeds.town]
    )

    const relatedLocationOptions = relatedLocRes?.data ?? []

    const relatedLocationDescription = useMemo(() => {
        if (!relatedLocQuery) {
            return 'Pick at least a country to choose related locations at the next level.'
        }
        if (relatedLocQuery.type === 'region') {
            return 'Regions under the selected country.'
        }
        if (relatedLocQuery.type === 'county') {
            return 'Counties under the selected region.'
        }
        return 'Towns under the selected county (sibling towns when a town is the selected location).'
    }, [relatedLocQuery])

    const relatedServiceOptionsFiltered = useMemo(() => {
        const q = relatedServicesSearch.trim().toLowerCase()
        const base = serviceOptions.filter((s) => s._id !== serviceId)
        if (!q) return base
        return base.filter((s) => s.name.toLowerCase().includes(q))
    }, [serviceOptions, serviceId, relatedServicesSearch])

    const relatedLocationOptionsFiltered = useMemo(() => {
        const q = relatedLocationsSearch.trim().toLowerCase()
        const base = relatedLocationOptions.filter((loc) => loc._id !== locationId)
        if (!q) return base
        return base.filter((loc) => loc.name.toLowerCase().includes(q))
    }, [relatedLocationOptions, locationId, relatedLocationsSearch])

    const locationNameById = useMemo(() => {
        const m = new Map<string, string>()
        for (const loc of [
            ...countryOptions,
            ...regionOptions,
            ...countyOptions,
            ...townOptions,
            ...relatedLocationOptions,
        ]) {
            m.set(loc._id, loc.name)
        }
        return m
    }, [countryOptions, regionOptions, countyOptions, townOptions, relatedLocationOptions])

    const selectedRelatedServicesDisplay = useMemo(
        () =>
            relatedServicesSel.map((id) => ({
                id,
                name: serviceOptions.find((s) => s._id === id)?.name ?? id,
            })),
        [relatedServicesSel, serviceOptions],
    )

    const selectedRelatedLocationsDisplay = useMemo(
        () =>
            relatedLocationsSel.map((id) => ({
                id,
                name: locationNameById.get(id) ?? id,
            })),
        [relatedLocationsSel, locationNameById],
    )

    const applyCascade = (next: typeof cascade) => {
        setCascade(next)
        const id = next.town || next.county || next.region || next.country || ''
        setValue('locationId', id, { shouldValidate: true })
    }

    useEffect(() => {
        if (!open) return

        setCategorySearch('')
        setServiceSearch('')
        setCountrySearch('')
        setRegionSearch('')
        setCountySearch('')
        setTownSearch('')
        setRelatedServicesSearch('')
        setRelatedLocationsSearch('')

        const emptyCascade = { country: '', region: '', county: '', town: '' }

        if (mode === 'edit' && row) {
            setServiceCategoryId(resolveServiceCategoryId(row.serviceId))
            reset({
                serviceId: resolveServiceLocationServiceId(row.serviceId),
                locationId: resolveServiceLocationLocationId(row.locationId),
                headingOverride: row.headingOverride ?? '',
                subDescriptionOverride: row.subDescriptionOverride ?? '',
                relatedServicesOverride: (row.relatedServicesOverride ?? []).map(
                    resolveRelatedServiceEntryId,
                ),
                relatedLocationsOverride: (row.relatedLocationsOverride ?? []).map(
                    resolveRelatedLocationEntryId,
                ),
                metaTitleOverride: row.metaTitleOverride ?? '',
                metaDescriptionOverride: row.metaDescriptionOverride ?? '',
                localNotes: row.localNotes ?? '',
                isActive: row.isActive,
                faqOverrides: (row.faqOverrides ?? []).map((f) => ({
                    question: f.question,
                    answer: f.answer,
                })),
            })

            const loc = row.locationId
            if (typeof loc !== 'object' || !loc._id) {
                setCascade(emptyCascade)
                setLocationSeeds({})
                return
            }

            const { ids, entities, needsFetchFromParentId } = collectPopulatedLocationChain(loc)
            setCascade({
                country: ids.country ?? '',
                region: ids.region ?? '',
                county: ids.county ?? '',
                town: ids.town ?? '',
            })
            setLocationSeeds(entities)

            if (!needsFetchFromParentId) return

            let cancelled = false
            void (async () => {
                try {
                    const up = await loadAncestorChainById(needsFetchFromParentId, (id) =>
                        getLocationById(id).unwrap()
                    )
                    if (cancelled) return
                    setCascade((c) => ({
                        country: up.ids.country ?? c.country,
                        region: up.ids.region ?? c.region,
                        county: up.ids.county ?? c.county,
                        town: up.ids.town ?? c.town,
                    }))
                    setLocationSeeds((s) => ({ ...up.entities, ...s }))
                    if (row) {
                        const leafId = resolveServiceLocationLocationId(row.locationId)
                        setValue('locationId', leafId, { shouldValidate: true })
                    }
                } catch {
                    /* Partial chain; user can re-pick if GET by id is unavailable */
                }
            })()

            return () => {
                cancelled = true
            }
        }

        setServiceCategoryId('')
        setCascade(emptyCascade)
        setLocationSeeds({})
        reset({
            serviceId: '',
            locationId: '',
            headingOverride: '',
            subDescriptionOverride: '',
            relatedServicesOverride: [],
            relatedLocationsOverride: [],
            metaTitleOverride: '',
            metaDescriptionOverride: '',
            localNotes: '',
            isActive: true,
            faqOverrides: [],
        })
    }, [open, mode, row, reset, getLocationById])

    const onSubmit = async (values: FormValues) => {
        const faqPayload = values.faqOverrides.map(({ question, answer }) => ({
            question: (question ?? '').trim(),
            answer: (answer ?? '').trim(),
        }))
        const relServices = values.relatedServicesOverride ?? []
        const relLocations = values.relatedLocationsOverride ?? []
        const bodyCommon = {
            headingOverride: trimOrUndefined(values.headingOverride),
            subDescriptionOverride: trimOrUndefined(values.subDescriptionOverride),
            relatedServicesOverride: relServices.length ? relServices : undefined,
            relatedLocationsOverride: relLocations.length ? relLocations : undefined,
            metaTitleOverride: trimOrUndefined(values.metaTitleOverride),
            metaDescriptionOverride: trimOrUndefined(values.metaDescriptionOverride),
            localNotes: trimOrUndefined(values.localNotes),
            // Always send array; each field is explicit `""` when left blank (create + edit).
            faqOverrides: faqPayload,
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
            className="bg-white max-w-3xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={serviceCategoryId || undefined}
                            onValueChange={(v) => {
                                setServiceCategoryId(v)
                                setValue('serviceId', '', { shouldValidate: true })
                                setValue('relatedServicesOverride', [], { shouldDirty: true })
                                setServiceSearch('')
                            }}
                            disabled={categoriesLoading}
                        >
                            <SelectTrigger className="rounded-full">
                                <SelectValue
                                    placeholder={
                                        categoriesLoading ? 'Loading categories…' : 'Select category'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        placeholder="Search categories…"
                                        className="h-9 rounded-full bg-white"
                                        onKeyDown={(e) => e.stopPropagation()}
                                        onPointerDownCapture={(e) => e.stopPropagation()}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                {categoryOptions.map((c) => (
                                    <SelectItem key={c._id} value={c._id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Choose a category first, then pick a service below.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Service</Label>
                        <Select
                            value={serviceId || undefined}
                            onValueChange={(v) => setValue('serviceId', v, { shouldValidate: true })}
                            disabled={!serviceCategoryId || servicesLoading}
                        >
                            <SelectTrigger className="rounded-full" error={!!errors.serviceId}>
                                <SelectValue
                                    placeholder={
                                        !serviceCategoryId
                                            ? 'Select a category first'
                                            : servicesLoading
                                                ? 'Loading services…'
                                                : 'Select service'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        value={serviceSearch}
                                        onChange={(e) => setServiceSearch(e.target.value)}
                                        placeholder="Search services…"
                                        className="h-9 rounded-full bg-white"
                                        onKeyDown={(e) => e.stopPropagation()}
                                        onPointerDownCapture={(e) => e.stopPropagation()}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
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

                    <div className="space-y-3 sm:col-span-2">
                        <div>
                            <Label>Location</Label>
                          
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                    {LOCATION_TAB_LABELS.country}
                                </Label>
                                <Select
                                    value={cascade.country || undefined}
                                    onValueChange={(v) => {
                                        setLocationSeeds({})
                                        setRegionSearch('')
                                        setCountySearch('')
                                        setTownSearch('')
                                        applyCascade({
                                            country: v,
                                            region: '',
                                            county: '',
                                            town: '',
                                        })
                                    }}
                                    disabled={countriesLoading}
                                >
                                    <SelectTrigger
                                        className="rounded-full"
                                        error={!!errors.locationId}
                                    >
                                        <SelectValue
                                            placeholder={
                                                countriesLoading ? 'Loading…' : 'Select country'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2">
                                            <Input
                                                value={countrySearch}
                                                onChange={(e) => setCountrySearch(e.target.value)}
                                                placeholder="Search countries…"
                                                className="h-9 rounded-full bg-white"
                                                onKeyDown={(e) => e.stopPropagation()}
                                                onPointerDownCapture={(e) => e.stopPropagation()}
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onTouchStart={(e) => e.stopPropagation()}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        {countryOptions.map((loc) => (
                                            <SelectItem key={loc._id} value={loc._id}>
                                                {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                    {LOCATION_TAB_LABELS.region}
                                </Label>
                                <Select
                                    value={cascade.region || undefined}
                                    onValueChange={(v) => {
                                        setLocationSeeds({})
                                        setCountySearch('')
                                        setTownSearch('')
                                        applyCascade({
                                            ...cascade,
                                            region: v,
                                            county: '',
                                            town: '',
                                        })
                                    }}
                                    disabled={!cascade.country || regionsLoading}
                                >
                                    <SelectTrigger className="rounded-full">
                                        <SelectValue
                                            placeholder={
                                                !cascade.country
                                                    ? 'Select country first'
                                                    : regionsLoading
                                                      ? 'Loading…'
                                                      : 'Select region'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2">
                                            <Input
                                                value={regionSearch}
                                                onChange={(e) => setRegionSearch(e.target.value)}
                                                placeholder="Search regions…"
                                                className="h-9 rounded-full bg-white"
                                                onKeyDown={(e) => e.stopPropagation()}
                                                onPointerDownCapture={(e) => e.stopPropagation()}
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onTouchStart={(e) => e.stopPropagation()}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        {regionOptions.map((loc) => (
                                            <SelectItem key={loc._id} value={loc._id}>
                                                {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                    {LOCATION_TAB_LABELS.county}
                                </Label>
                                <Select
                                    value={cascade.county || undefined}
                                    onValueChange={(v) => {
                                        setLocationSeeds({})
                                        setTownSearch('')
                                        applyCascade({
                                            ...cascade,
                                            county: v,
                                            town: '',
                                        })
                                    }}
                                    disabled={!cascade.region || countiesLoading}
                                >
                                    <SelectTrigger className="rounded-full">
                                        <SelectValue
                                            placeholder={
                                                !cascade.region
                                                    ? 'Select region first'
                                                    : countiesLoading
                                                      ? 'Loading…'
                                                      : 'Select county'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2">
                                            <Input
                                                value={countySearch}
                                                onChange={(e) => setCountySearch(e.target.value)}
                                                placeholder="Search counties…"
                                                className="h-9 rounded-full bg-white"
                                                onKeyDown={(e) => e.stopPropagation()}
                                                onPointerDownCapture={(e) => e.stopPropagation()}
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onTouchStart={(e) => e.stopPropagation()}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        {countyOptions.map((loc) => (
                                            <SelectItem key={loc._id} value={loc._id}>
                                                {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 ">
                                <Label className="text-xs text-muted-foreground">
                                    {LOCATION_TAB_LABELS.town}
                                </Label>
                                <Select
                                    value={cascade.town || undefined}
                                    onValueChange={(v) => {
                                        setLocationSeeds({})
                                        applyCascade({
                                            ...cascade,
                                            town: v,
                                        })
                                    }}
                                    disabled={!cascade.county || townsLoading}
                                >
                                    <SelectTrigger className="rounded-full">
                                        <SelectValue
                                            placeholder={
                                                !cascade.county
                                                    ? 'Select county first'
                                                    : townsLoading
                                                      ? 'Loading…'
                                                      : 'Select town (optional)'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2">
                                            <Input
                                                value={townSearch}
                                                onChange={(e) => setTownSearch(e.target.value)}
                                                placeholder="Search towns…"
                                                className="h-9 rounded-full bg-white"
                                                onKeyDown={(e) => e.stopPropagation()}
                                                onPointerDownCapture={(e) => e.stopPropagation()}
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onTouchStart={(e) => e.stopPropagation()}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        {townOptions.map((loc) => (
                                            <SelectItem key={loc._id} value={loc._id}>
                                                {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {errors.locationId && (
                            <p className="text-sm text-destructive">{errors.locationId.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="sl-heading-override">Heading override</Label>
                        <Input
                            id="sl-heading-override"
                            className="rounded-full"
                            placeholder="Optional page heading"
                            {...register('headingOverride')}
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="sl-sub-desc-override">Sub-description override</Label>
                        <Textarea
                            id="sl-sub-desc-override"
                            className="rounded-xl min-h-[88px]"
                            placeholder="Optional supporting text below the heading"
                            {...register('subDescriptionOverride')}
                        />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <Label>Related services</Label>
                        <p className="text-xs text-muted-foreground">
                            Other services in the same category as the main service (multiple select).
                        </p>
                        <DropdownMenu
                            onOpenChange={(next) => {
                                if (!next) setRelatedServicesSearch('')
                            }}
                        >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 w-full justify-between rounded-full border border-input bg-card px-3 py-2 font-normal text-accent shadow-none hover:bg-card"
                                    disabled={!serviceCategoryId}
                                >
                                    <span className="truncate">
                                        {!serviceCategoryId
                                            ? 'Select a category first'
                                            : relatedServicesSel.length === 0
                                              ? 'Choose related services…'
                                              : `${relatedServicesSel.length} service${relatedServicesSel.length === 1 ? '' : 's'} selected`}
                                    </span>
                                    <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className={cn(
                                    'w-[var(--radix-dropdown-menu-trigger-width)] max-h-72 overflow-hidden p-0',
                                    'border bg-card text-accent shadow-md',
                                )}
                            >
                                <div className="border-b border-border bg-card p-2">
                                    <Input
                                        value={relatedServicesSearch}
                                        onChange={(e) => setRelatedServicesSearch(e.target.value)}
                                        placeholder="Search services…"
                                        className="h-9 rounded-full bg-white"
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="max-h-52 overflow-y-auto p-1">
                                    {servicesLoading ? (
                                        <p className="px-2 py-3 text-sm text-muted-foreground">
                                            Loading services…
                                        </p>
                                    ) : relatedServiceOptionsFiltered.length === 0 ? (
                                        <p className="px-2 py-3 text-sm text-muted-foreground">
                                            No services match.
                                        </p>
                                    ) : (
                                        relatedServiceOptionsFiltered.map((s) => (
                                            <DropdownMenuCheckboxItem
                                                key={s._id}
                                                className="rounded-md focus:bg-secondary focus:text-white data-[state=checked]:bg-secondary/15"
                                                checked={relatedServicesSel.includes(s._id)}
                                                onCheckedChange={() => {
                                                    const next = relatedServicesSel.includes(s._id)
                                                        ? relatedServicesSel.filter((id) => id !== s._id)
                                                        : [...relatedServicesSel, s._id]
                                                    setValue('relatedServicesOverride', next, {
                                                        shouldDirty: true,
                                                        shouldValidate: true,
                                                    })
                                                }}
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                {s.name}
                                            </DropdownMenuCheckboxItem>
                                        ))
                                    )}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {relatedServicesSel.length > 0 ? (
                            <div className="mt-2 rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Selected services
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRelatedServicesDisplay.map(({ id, name }) => (
                                        <Badge
                                            key={id}
                                            variant="outline"
                                            className="max-w-full gap-1 pl-2.5 pr-1 py-1 font-normal"
                                        >
                                            <span className="truncate" title={name}>
                                                {name}
                                            </span>
                                            <button
                                                type="button"
                                                className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
                                                aria-label={`Remove ${name}`}
                                                onClick={() =>
                                                    setValue(
                                                        'relatedServicesOverride',
                                                        relatedServicesSel.filter((x) => x !== id),
                                                        { shouldDirty: true, shouldValidate: true },
                                                    )
                                                }
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <Label>Related locations</Label>
                        <p className="text-xs text-muted-foreground">{relatedLocationDescription}</p>
                        <DropdownMenu
                            onOpenChange={(next) => {
                                if (!next) setRelatedLocationsSearch('')
                            }}
                        >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 w-full justify-between rounded-full border border-input bg-card px-3 py-2 font-normal text-accent shadow-none hover:bg-card"
                                    disabled={!relatedLocQuery}
                                >
                                    <span className="truncate">
                                        {!relatedLocQuery
                                            ? 'Select location hierarchy first'
                                            : relatedLocLoading
                                              ? 'Loading locations…'
                                              : relatedLocationsSel.length === 0
                                                ? 'Choose related locations…'
                                                : `${relatedLocationsSel.length} location${relatedLocationsSel.length === 1 ? '' : 's'} selected`}
                                    </span>
                                    <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className={cn(
                                    'w-[var(--radix-dropdown-menu-trigger-width)] max-h-72 overflow-hidden p-0',
                                    'border bg-card text-accent shadow-md',
                                )}
                            >
                                <div className="border-b border-border bg-card p-2">
                                    <Input
                                        value={relatedLocationsSearch}
                                        onChange={(e) => setRelatedLocationsSearch(e.target.value)}
                                        placeholder="Search locations…"
                                        className="h-9 rounded-full bg-white"
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="max-h-52 overflow-y-auto p-1">
                                    {!relatedLocQuery ? null : relatedLocLoading ? (
                                        <p className="px-2 py-3 text-sm text-muted-foreground">
                                            Loading locations…
                                        </p>
                                    ) : relatedLocationOptionsFiltered.length === 0 ? (
                                        <p className="px-2 py-3 text-sm text-muted-foreground">
                                            No locations match.
                                        </p>
                                    ) : (
                                        relatedLocationOptionsFiltered.map((loc) => (
                                            <DropdownMenuCheckboxItem
                                                key={loc._id}
                                                className="rounded-md focus:bg-secondary focus:text-white data-[state=checked]:bg-secondary/15"
                                                checked={relatedLocationsSel.includes(loc._id)}
                                                onCheckedChange={() => {
                                                    const next = relatedLocationsSel.includes(loc._id)
                                                        ? relatedLocationsSel.filter((id) => id !== loc._id)
                                                        : [...relatedLocationsSel, loc._id]
                                                    setValue('relatedLocationsOverride', next, {
                                                        shouldDirty: true,
                                                        shouldValidate: true,
                                                    })
                                                }}
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                {loc.name}
                                            </DropdownMenuCheckboxItem>
                                        ))
                                    )}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {relatedLocationsSel.length > 0 ? (
                            <div className="mt-2 rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Selected locations
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRelatedLocationsDisplay.map(({ id, name }) => (
                                        <Badge
                                            key={id}
                                            variant="outline"
                                            className="max-w-full gap-1 pl-2.5 pr-1 py-1 font-normal"
                                        >
                                            <span className="truncate" title={name}>
                                                {name}
                                            </span>
                                            <button
                                                type="button"
                                                className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
                                                aria-label={`Remove ${name}`}
                                                onClick={() =>
                                                    setValue(
                                                        'relatedLocationsOverride',
                                                        relatedLocationsSel.filter((x) => x !== id),
                                                        { shouldDirty: true, shouldValidate: true },
                                                    )
                                                }
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ) : null}
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

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="sl-meta-desc">Meta description override</Label>
                        <Textarea
                            id="sl-meta-desc"
                            className="rounded-xl min-h-[120px]"
                            placeholder="Optional"
                            {...register('metaDescriptionOverride')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sl-notes">Local notes</Label>
                        <Textarea
                            id="sl-notes"
                            className="rounded-xl min-h-[120px]"
                            placeholder="Optional"
                            {...register('localNotes')}
                        />
                    </div>
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
                    <div className="flex flex-col gap-4">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 p-4"
                            >
                                <div className="flex flex-col gap-2">
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
                                <div className="flex flex-col gap-2">
                                    <Label className="text-xs">Answer</Label>
                                    <Textarea
                                        className="rounded-xl min-h-[100px] resize-y"
                                        {...register(`faqOverrides.${index}.answer` as const)}
                                    />
                                    {errors.faqOverrides?.[index]?.answer && (
                                        <p className="text-xs text-destructive">
                                            {errors.faqOverrides[index]?.answer?.message}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive rounded-full"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
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
                </div> */}

                <div className="flex justify-end gap-2 pt-2">
                   
                    <Button type="submit" className="rounded-full" disabled={loading}>
                        {loading ? 'Saving…' : mode === 'create' ? 'Create Service Location' : 'Save changes'}
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    )
}

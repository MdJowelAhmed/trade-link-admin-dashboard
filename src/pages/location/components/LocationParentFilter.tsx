import { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useGetLocationsQuery, type LocationEntity, type LocationType } from '@/redux/api/locationApi'
import { LOCATION_TAB_LABELS, LOCATION_TAB_PLURAL } from '../constants'

const LOOKUP_LIMIT = 300

interface LocationParentFilterProps {
    parentType: LocationType
    value: string
    onChange: (parentId: string) => void
    disabled?: boolean
}

export function LocationParentFilter({
    parentType,
    value,
    onChange,
    disabled,
}: LocationParentFilterProps) {
    const [search, setSearch] = useState('')
    const lastSelectedNameRef = useRef<string | null>(null)

    useEffect(() => {
        if (value === 'all') lastSelectedNameRef.current = null
    }, [value])

    const { data, isFetching } = useGetLocationsQuery(
        {
            type: parentType,
            page: 1,
            limit: LOOKUP_LIMIT,
            searchTerm: search.trim() || undefined,
        },
        { skip: disabled }
    )

    const raw = data?.data ?? []

    const options = useMemo(() => {
        if (value !== 'all' && !raw.some((p) => p._id === value) && lastSelectedNameRef.current) {
            const phantom: LocationEntity = {
                _id: value,
                name: lastSelectedNameRef.current,
                slug: '',
                type: parentType,
                parentId: null,
                isActive: true,
                isIndexable: true,
                createdAt: '',
                updatedAt: '',
            }
            return [phantom, ...raw]
        }
        return raw
    }, [raw, value, parentType])

    const parentPlural = LOCATION_TAB_PLURAL[parentType]
    const parentLabel = LOCATION_TAB_LABELS[parentType]

    return (
        <div className="w-full min-w-[200px] max-w-[280px] ">
            <Label className="text-xs text-muted-foreground sr-only">{parentLabel} filter</Label>
            <Select
                value={value}
                onValueChange={(id) => {
                    if (id === 'all') {
                        lastSelectedNameRef.current = null
                        onChange('all')
                        return
                    }
                    const row = raw.find((p) => p._id === id) ?? options.find((p) => p._id === id)
                    if (row) lastSelectedNameRef.current = row.name
                    onChange(id)
                }}
                disabled={disabled || isFetching}
                
            >
                <SelectTrigger className="rounded-full bg-card border-card w-full">
                    <SelectValue placeholder={`All ${parentPlural}`} />
                </SelectTrigger>
                <SelectContent>
                    <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={`Search ${parentPlural.toLowerCase()}…`}
                            className="h-9 rounded-full bg-white"
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>
                    <SelectItem value="all">All {parentPlural}</SelectItem>
                    {options.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                            {p.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

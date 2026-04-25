import type { LocationType } from '@/redux/api/locationApi'

export const LOCATION_TAB_ORDER: LocationType[] = [
    'country',
    'region',
    'county',
    'town',
]

export const LOCATION_TAB_LABELS: Record<LocationType, string> = {
    country: 'Country',
    region: 'Region',
    county: 'County',
    town: 'Town',
}

export const LOCATION_TAB_PLURAL: Record<LocationType, string> = {
    country: 'Countries',
    region: 'Regions',
    county: 'Counties',
    town: 'Towns',
}

/** Parent type required when creating this location type (country has none). */
export function getParentTypeFor(child: LocationType): LocationType | null {
    const map: Record<LocationType, LocationType | null> = {
        country: null,
        region: 'country',
        county: 'region',
        town: 'county',
    }
    return map[child]
}

export function getParentSelectLabel(child: LocationType): string | null {
    const parent = getParentTypeFor(child)
    if (!parent) return null
    return LOCATION_TAB_LABELS[parent]
}

/** List view: show parent filter for types that have a parent (not country/region). */
export function locationTypeNeedsParentFilter(type: LocationType): boolean {
    return type !== 'country' && type !== 'region'
}

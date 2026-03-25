import type { LocationEntity } from '@/redux/api/locationApi'

export function getParentDisplayName(location: LocationEntity): string | null {
    const { parentId } = location
    if (parentId == null) return null
    if (typeof parentId === 'string') return null
    return parentId.name ?? null
}

export function formatLocationDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    })
}

export function resolveParentDisplayName(
    location: LocationEntity,
    parentNameById?: Record<string, string>
): string | null {
    const { parentId } = location
    if (parentId == null) return null
    if (typeof parentId === 'string') return parentNameById?.[parentId] ?? null
    return parentId.name ?? null
}

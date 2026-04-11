import { baseApi } from '../baseApi'

export const LOCATION_TYPES = ['country', 'region', 'county', 'town', 'city'] as const
export type LocationType = (typeof LOCATION_TYPES)[number]

export interface LocationEntity {
    _id: string
    name: string
    slug: string
    type: LocationType
    parentId: string | LocationEntity | null
    isActive: boolean
    isIndexable: boolean
    createdAt: string
    updatedAt: string
    __v?: number
}

export interface LocationsListResponse {
    success: boolean
    message: string
    data: LocationEntity[]
    pagination?: {
        total: number
        limit: number
        page: number
        totalPage: number
    }
}

/**
 * GET `/locations` query params (names must match backend).
 * - `searchTerm` — search box value (trimmed in the UI before send).
 * - `parentId` — **only** the selected parent document’s `_id`, never the parent name.
 * - `isActive` — `true` or `false` when filtering by status; omit when “all”.
 */
export interface GetLocationsParams {
    type: LocationType
    page?: number
    limit?: number
    searchTerm?: string
    parentId?: string
    isActive?: boolean
}

export interface CreateLocationPayload {
    name: string
    type: LocationType
    parentId?: string
}

export interface UpdateLocationPayload {
    name?: string
    isActive?: boolean
    parentId?: string
}

const locationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getLocations: builder.query<LocationsListResponse, GetLocationsParams>({
            query: ({ type, page, limit, searchTerm, parentId, isActive }) => {
                const queryParams = new URLSearchParams()
                queryParams.append('type', type)
                if (page) queryParams.append('page', String(page))
                if (limit) queryParams.append('limit', String(limit))
                if (searchTerm) queryParams.append('searchTerm', searchTerm)
                if (parentId) queryParams.append('parentId', parentId)
                if (isActive !== undefined) {
                    queryParams.append('isActive', isActive ? 'true' : 'false')
                }

                return {
                    url: `/locations?${queryParams.toString()}`,
                method: 'GET',
                }
            },
            providesTags: (_result, _err, arg) => [
                'Location',
                { type: 'Location', id: arg.type },
            ],
        }),
        createLocation: builder.mutation<{ success: boolean; message: string }, CreateLocationPayload>({
            query: (body) => ({
                url: '/locations',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Location'],
        }),
        updateLocation: builder.mutation<
            { success: boolean; message: string },
            { id: string; body: UpdateLocationPayload }
        >({
            query: ({ id, body }) => ({
                url: `/locations/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Location'],
        }),
        deleteLocation: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/locations/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Location'],
        }),
    }),
})

export const {
    useGetLocationsQuery,
    useCreateLocationMutation,
    useUpdateLocationMutation,
    useDeleteLocationMutation,
} = locationApi

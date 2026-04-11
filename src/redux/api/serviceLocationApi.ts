import { baseApi } from '../baseApi'
import type { LocationType } from './locationApi'

/** Populated service on list/detail responses */
export interface ServiceLocationServiceRef {
    _id: string
    categoryId?: string | { _id?: string; name?: string }
    name: string
    isActive: boolean
    slug: string
    createdAt?: string
    updatedAt?: string
    __v?: number
    faqs?: unknown[]
    guides?: unknown[]
}

/** Populated location on list/detail responses */
export interface ServiceLocationLocationRef {
    _id: string
    name: string
    slug: string
    type: LocationType
    parentId?: string | null
    isActive: boolean
    isIndexable?: boolean
    createdAt?: string
    updatedAt?: string
    __v?: number
}

export interface ServiceLocationFaqOverride {
    question: string
    answer: string
    _id?: string
}

export interface ServiceLocationPage {
    _id: string
    serviceId: string | ServiceLocationServiceRef
    locationId: string | ServiceLocationLocationRef
    metaTitleOverride?: string
    metaDescriptionOverride?: string
    localNotes?: string
    faqOverrides?: ServiceLocationFaqOverride[]
    isActive: boolean
    createdAt: string
    updatedAt: string
    slug: string
    __v?: number
}

export interface ServiceLocationsListResponse {
    success: boolean
    message: string
    data: ServiceLocationPage[]
    pagination?: {
        total: number
        limit: number
        page: number
        totalPage: number
    }
}

export interface GetServiceLocationsParams {
    page?: number
    limit?: number
    searchTerm?: string
}

export interface FaqOverrideInput {
    question: string
    answer: string
}

export interface CreateServiceLocationPayload {
    serviceId: string
    locationId: string
    metaTitleOverride?: string
    metaDescriptionOverride?: string
    localNotes?: string
    faqOverrides?: FaqOverrideInput[]
    isActive?: boolean
}

export interface UpdateServiceLocationPayload {
    serviceId?: string
    locationId?: string
    metaTitleOverride?: string
    metaDescriptionOverride?: string
    localNotes?: string
    faqOverrides?: FaqOverrideInput[]
    isActive?: boolean
}

const serviceLocationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getServiceLocations: builder.query<ServiceLocationsListResponse, GetServiceLocationsParams | void>({
            query: (params) => {
                const queryParams = new URLSearchParams()
                if (params?.page) queryParams.append('page', String(params.page))
                if (params?.limit) queryParams.append('limit', String(params.limit))
                if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm)
                const qs = queryParams.toString()
                return {
                    url: `/service-locations`,
                    method: 'GET',
                }
            },
            providesTags: ['ServiceLocation'],
        }),
        createServiceLocation: builder.mutation<
            { success: boolean; message: string; data?: ServiceLocationPage },
            CreateServiceLocationPayload
        >({
            query: (body) => ({
                url: '/service-locations',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ServiceLocation'],
        }),
        updateServiceLocation: builder.mutation<
            { success: boolean; message: string; data?: ServiceLocationPage },
            { id: string; body: UpdateServiceLocationPayload }
        >({
            query: ({ id, body }) => ({
                url: `/service-locations/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['ServiceLocation'],
        }),
        deleteServiceLocation: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/service-locations/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ServiceLocation'],
        }),
    }),
})

export const {
    useGetServiceLocationsQuery,
    useCreateServiceLocationMutation,
    useUpdateServiceLocationMutation,
    useDeleteServiceLocationMutation,
} = serviceLocationApi

export function resolveServiceLocationServiceId(
    ref: string | ServiceLocationServiceRef
): string {
    return typeof ref === 'string' ? ref : ref._id
}

export function resolveServiceLocationLocationId(
    ref: string | ServiceLocationLocationRef
): string {
    return typeof ref === 'string' ? ref : ref._id
}

export function getServiceNameFromRef(
    ref: string | ServiceLocationServiceRef
): string | undefined {
    return typeof ref === 'object' ? ref.name : undefined
}

export function getLocationNameFromRef(
    ref: string | ServiceLocationLocationRef
): string | undefined {
    return typeof ref === 'object' ? ref.name : undefined
}

import { baseApi } from '../baseApi'

export const GUIDE_PAGE_TYPES = ['PROBLEM', 'COST'] as const
export type GuidePageType = (typeof GUIDE_PAGE_TYPES)[number]

export interface GuidePageServiceRef {
    _id: string
    name: string
    isActive: boolean
    slug: string
}

export interface GuidePageLocationRef {
    _id: string
    name: string
    isActive: boolean
    slug: string
}

export interface ProblemGuideContent {
    introduction?: string
    commonCauses?: string
    warningSigns?: string
    possibleRepairSolutions?: string
    whenToCallProfessional?: string
}

export interface CostGuideContent {
    introduction?: string
    averageCost?: string
    whatAffectsPrice?: string
    typicalProjectExamples?: string
    tipsBeforeHiring?: string
}

export type GuidePageContent = ProblemGuideContent | CostGuideContent

export interface GuidePage {
    _id: string
    title: string
    type: GuidePageType
    serviceId: string | GuidePageServiceRef
    locationId: string | GuidePageLocationRef | null
    content?: GuidePageContent
    metaTitle?: string
    metaDescription?: string
    isPublished: boolean
    slug: string
    createdAt: string
    updatedAt: string
}

export interface GuidePagesListResponse {
    success: boolean
    message: string
    pagination: {
        total: number
        limit: number
        page: number
        totalPage: number
    }
    data: GuidePage[]
}

export interface GuidePageDetailResponse {
    success: boolean
    message: string
    data: GuidePage
}

export interface GetGuidePagesParams {
    page?: number
    limit?: number
    searchTerm?: string
    /** Filter list by guide category (Problem vs Cost). */
    type?: GuidePageType
}

export type GuidePagePayload =
    | {
          title: string
          type: 'PROBLEM'
          content: ProblemGuideContent
          metaTitle?: string
          metaDescription?: string
          serviceId: string
          locationId?: string
      }
    | {
          title: string
          type: 'COST'
          content: CostGuideContent
          metaTitle?: string
          metaDescription?: string
          serviceId: string
          locationId?: string
      }

export function getGuideServiceName(ref: string | GuidePageServiceRef): string {
    if (typeof ref === 'object' && ref !== null) return ref.name
    return ref
}

export function getGuideLocationName(ref: string | GuidePageLocationRef | null): string {
    if (!ref) return '—'
    if (typeof ref === 'object') return ref.name
    return ref
}

export function resolveGuideServiceId(ref: string | GuidePageServiceRef): string {
    if (typeof ref === 'string') return ref
    return ref._id
}

export function resolveGuideLocationId(ref: string | GuidePageLocationRef | null): string {
    if (!ref) return ''
    if (typeof ref === 'string') return ref
    return ref._id
}

const guideApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getGuidePages: builder.query<GuidePagesListResponse, GetGuidePagesParams>({
            query: ({ page, limit, searchTerm, type }) => {
                const params = new URLSearchParams()
                if (page) params.append('page', String(page))
                if (limit) params.append('limit', String(limit))
                if (searchTerm) params.append('searchTerm', searchTerm)
                if (type) params.append('type', type)
                return { url: `/guidePages?${params.toString()}`, method: 'GET' }
            },
            providesTags: ['Guides'],
        }),
        createGuidePage: builder.mutation<GuidePageDetailResponse, GuidePagePayload>({
            query: (body) => ({ url: '/guidePages', method: 'POST', body }),
            invalidatesTags: ['Guides'],
        }),
        updateGuidePage: builder.mutation<
            GuidePageDetailResponse,
            { id: string; body: Partial<GuidePagePayload> }
        >({
            query: ({ id, body }) => ({ url: `/guidePages/${id}`, method: 'PATCH', body }),
            invalidatesTags: ['Guides'],
        }),
        deleteGuidePage: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({ url: `/guidePages/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Guides'],
        }),
    }),
})

export const {
    useGetGuidePagesQuery,
    useCreateGuidePageMutation,
    useUpdateGuidePageMutation,
    useDeleteGuidePageMutation,
} = guideApi

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
    typicalCostRange?: string
    whatAffectsPrice?: string
    typicalProjectExamples?: string
    tipsBeforeHiring?: string
}

export interface GuideFaqItem {
    _id?: string
    question: string
    answer: string
}

export type GuidePageContent = ProblemGuideContent | CostGuideContent

export interface GuidePage {
    _id: string
    title: string
    type: GuidePageType
    serviceId: string | GuidePageServiceRef
    locationId: string | GuidePageLocationRef | null
    content?: GuidePageContent
    faqs?: GuideFaqItem[]
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

type GuidePagePayloadBase = {
    title: string
    content: ProblemGuideContent | CostGuideContent
    faqs?: GuideFaqItem[]
    metaTitle?: string
    metaDescription?: string
    serviceId: string
    locationId?: string
}

export type GuidePagePayload =
    | (GuidePagePayloadBase & { type: 'PROBLEM'; content: ProblemGuideContent })
    | (GuidePagePayloadBase & { type: 'COST'; content: CostGuideContent })

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
        getGuidePageById: builder.query<GuidePageDetailResponse, string>({
            query: (id) => ({ url: `/guidePages/${id}`, method: 'GET' }),
            providesTags: (_result, _err, id) => [{ type: 'Guides', id }],
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
    useGetGuidePageByIdQuery,
    useCreateGuidePageMutation,
    useUpdateGuidePageMutation,
    useDeleteGuidePageMutation,
} = guideApi

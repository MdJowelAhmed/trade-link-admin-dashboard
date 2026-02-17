import { baseApi } from "../baseApi";

// Backend response types
interface BackendQuestionOption {
    _id: string
    label: string
    value?: number // Only for budget questions
}

interface BackendServiceQuestion {
    _id: string
    serviceId: string
    questionText: string
    type: string
    options: BackendQuestionOption[]
    order: number
    isBudgetQuestion?: boolean
    createdAt: string
    updatedAt: string
    __v?: number
}

interface ServiceQuestionResponse {
    success: boolean
    message: string
    data: BackendServiceQuestion[]
}

// Request types
interface CreateServiceQuestionRequest {
    serviceId: string
    questionText: string
    options: Array<{
        label: string
        value?: number // Only for budget questions
    }>
    order: number
    isBudgetQuestion: boolean
    type?: string // Optional, defaults to "SELECT"
}

interface UpdateServiceQuestionRequest {
    serviceId?: string
    questionText?: string
    options?: Array<{
        label: string
        value?: number // Only for budget questions
    }>
    order?: number
    isBudgetQuestion?: boolean
    type?: string
}

const serviceQuestionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getServiceQuestions: builder.query<ServiceQuestionResponse, string>({
            query: (serviceId) => ({
                url: `/serviceQuestions/services/${serviceId}/admin`,
                method: 'GET',
            }),
            providesTags: (_result, _error, serviceId) => [
                { type: 'ServiceQuestion', id: serviceId },
                'ServiceQuestion',
            ],
        }),
        addServiceQuestion: builder.mutation<ServiceQuestionResponse, CreateServiceQuestionRequest>({
            query: (serviceQuestion) => ({
                url: '/serviceQuestions',
                method: 'POST',
                body: {
                    ...serviceQuestion,
                    type: serviceQuestion.type || 'SELECT',
                },
            }),
            invalidatesTags: (_result, _error, serviceQuestion) => [
                { type: 'ServiceQuestion', id: serviceQuestion.serviceId },
                'ServiceQuestion',
            ],
        }),
        updateServiceQuestion: builder.mutation<ServiceQuestionResponse, { serviceQuestion: UpdateServiceQuestionRequest; id: string }>({
            query: ({ serviceQuestion, id }) => ({
                url: `/serviceQuestions/${id}`,
                method: 'PATCH',
                body: serviceQuestion,
            }),
            invalidatesTags: (_result, _error, { serviceQuestion }) => [
                { type: 'ServiceQuestion', id: serviceQuestion.serviceId },
                'ServiceQuestion',
            ],
        }),
        deleteServiceQuestion: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/serviceQuestions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ServiceQuestion'],
        }),
        updateServiceQuestionStatus: builder.mutation({
            query: (id) => ({
                url: `/service-questions/${id}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['ServiceQuestion'],
        }),
    }),
})

export const {
    useGetServiceQuestionsQuery,
    useAddServiceQuestionMutation,
    useUpdateServiceQuestionMutation,
    useDeleteServiceQuestionMutation,
    useUpdateServiceQuestionStatusMutation 
} = serviceQuestionApi

export type { 
    BackendServiceQuestion, 
    BackendQuestionOption, 
    ServiceQuestionResponse,
    CreateServiceQuestionRequest,
    UpdateServiceQuestionRequest
}
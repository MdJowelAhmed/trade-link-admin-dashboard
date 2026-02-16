import { Transaction, Refund, BackendTransaction, BackendRefund } from "@/types";
import { baseApi } from "../baseApi";

// Query parameters for transactions
interface GetTransactionsParams {
    searchTerm?: string;
    status?: string;
    page?: number;
    limit?: number;
}

// API Response types
interface TransactionsResponse {
    success: boolean;
    message: string;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPage: number;
    };
    data: BackendTransaction[];
}

interface RefundsResponse {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        limit: number;
        page: number;
        totalPage: number;
    };
    data: BackendRefund[];
}

interface TransactionResponse {
    success: boolean;
    message: string;
    data: BackendTransaction;
}

interface RefundResponse {
    success: boolean;
    message: string;
    data: BackendRefund;
}

// Transform backend transaction to frontend format
const transformTransaction = (backend: BackendTransaction): Transaction => {
    return {
        id: backend._id,
        transactionId: backend._id,
        leadId: backend.leadId,
        date: new Date(backend.createdAt).toISOString().split('T')[0],
        userName: backend.professionalName,
        service: backend.serviceName,
        amount: backend.price,
        currency: '$',
        status: backend.status,
        createdAt: backend.createdAt,
    };
};

// Transform backend refund to frontend format
const transformRefund = (backend: BackendRefund): Refund => {
    return {
        id: backend._id,
        refundId: backend._id,
        leadId: backend.leadId,
        date: new Date(backend.createdAt).toISOString().split('T')[0],
        userName: backend.professionalName,
        service: backend.serviceName,
        amount: backend.amount,
        currency: '$',
        status: backend.status,
        reason: backend.reason,
        images: backend.images,
        createdAt: backend.createdAt,
        updatedAt: backend.updatedAt,
    };
};

const transactionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTransactions: builder.query<{ data: Transaction[]; pagination: TransactionsResponse['pagination'] }, GetTransactionsParams | void>({
            query: (args) => {
                const params = new URLSearchParams();
                if (args?.searchTerm) params.append('searchTerm', args.searchTerm);
                if (args?.status && args.status !== 'all') params.append('status', args.status);
                if (args?.page) params.append('page', args.page.toString());
                if (args?.limit) params.append('limit', args.limit.toString());
                return {
                    url: `/transactions${params.toString() ? `?${params.toString()}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: TransactionsResponse) => ({
                data: response.data.map(transformTransaction),
                pagination: response.pagination,
            }),
            providesTags: ['Transaction'],
        }),

        getTransactionById: builder.query<Transaction, string>({
            query: (id) => ({
                url: `/transactions/${id}`,
                method: 'GET',
            }),
            transformResponse: (response: TransactionResponse) => transformTransaction(response.data),
            providesTags: (_result, _error, id) => [{ type: 'Transaction', id }],
        }),

        getRefundTransactions: builder.query<{ data: Refund[]; pagination: RefundsResponse['pagination'] }, GetTransactionsParams | void>({
            query: (args) => {
                const params = new URLSearchParams();
                if (args?.searchTerm) params.append('searchTerm', args.searchTerm);
                if (args?.status && args.status !== 'all') params.append('status', args.status);
                if (args?.page) params.append('page', args.page.toString());
                if (args?.limit) params.append('limit', args.limit.toString());
                return {
                    url: `/refundRequests${params.toString() ? `?${params.toString()}` : ''}`,
                    method: 'GET',
                };
            },
            transformResponse: (response: RefundsResponse) => ({
                data: response.data.map(transformRefund),
                pagination: response.pagination,
            }),
            providesTags: ['Transaction'],
        }),

        updateRefundStatus: builder.mutation<Refund, { id: string; status: 'APPROVED' | 'REJECTED' }>({
            query: ({ id, status }) => ({
                url: `/refundRequests/${id}`,
                method: 'PUT',
                body: { status },
            }),
            transformResponse: (response: RefundResponse) => transformRefund(response.data),
            invalidatesTags: ['Transaction'],
        }),
    }),
})

export const { 
    useGetTransactionsQuery, 
    useGetTransactionByIdQuery, 
    useGetRefundTransactionsQuery, 
    useUpdateRefundStatusMutation 
} = transactionApi

export type { GetTransactionsParams, TransactionsResponse, RefundsResponse }
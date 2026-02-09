import { baseApi } from "../baseApi";

export type DisclaimerType = "about-us" | "privacy-policy" | "terms-and-conditions";

export interface Setting {
    type: DisclaimerType;
    content: string; // HTML string content
}

export interface SettingResponse {
    success: boolean;
    message: string;
    data: Setting;
}

const settingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSettings: builder.query<SettingResponse, DisclaimerType>({
            query: (type) => ({
                url: `/disclaimers/${type}`,
                method: "GET",
            }),
            providesTags: ["Setting"],
        }),
        updateSetting: builder.mutation<SettingResponse, Setting>({
            query: (payload) => ({
                url: "/disclaimers",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["Setting"],
        }),
    }),
});

export const { useGetSettingsQuery, useUpdateSettingMutation } = settingApi;

export type { SettingResponse as TSettingResponse, Setting as TSetting };
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import productReducer from './slices/productSlice'
import categoryReducer from './slices/categorySlice'
import uiReducer from './slices/uiSlice'
import carReducer from './slices/carSlice'
import clientReducer from './slices/clientSlice'
import agencyReducer from './slices/agencySlice'
import calendarReducer from './slices/calendarSlice'
import transactionReducer from './slices/transactionSlice'
import faqReducer from './slices/faqSlice'
import customerReducer from './slices/customerSlice'
import tradePersonReducer from './slices/tradePersonSlice'
import leadReducer from './slices/leadSlice'
import serviceReducer from './slices/serviceSlice'
import serviceQuestionReducer from './slices/serviceQuestionSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    products: productReducer,
    categories: categoryReducer,
    ui: uiReducer,
    cars: carReducer,
    clients: clientReducer,
    agencies: agencyReducer,
    calendar: calendarReducer,
    transactions: transactionReducer,
    faqs: faqReducer,
    customers: customerReducer,
    tradePersons: tradePersonReducer,
    leads: leadReducer,
    services: serviceReducer,
    serviceQuestions: serviceQuestionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

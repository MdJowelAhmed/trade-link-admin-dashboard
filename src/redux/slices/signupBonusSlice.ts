import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// UI-only state - no server data stored here
// Server data comes from RTK Query (useGetSignupBonusQuery)
interface SignupBonusUIState {
  isEditing: boolean
}

const initialState: SignupBonusUIState = {
  isEditing: false,
}

const signupBonusSlice = createSlice({
  name: 'signupBonusUI',
  initialState,
  reducers: {
    setIsEditing: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload
    },
  },
})

export const { setIsEditing } = signupBonusSlice.actions

export default signupBonusSlice.reducer
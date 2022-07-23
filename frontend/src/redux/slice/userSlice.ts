import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../types/UserTypes';

export interface UserState {
  user: IUser | null;
}

const initialState: UserState = {
  user: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
    resetUser: () => initialState,
  },
});

export const { updateUser, resetUser } = userSlice.actions;

export default userSlice.reducer;

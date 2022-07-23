import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICategory } from '../../types/CategoryTypes';

export interface CategoryState {
  categories: ICategory[];
}

const initialState: CategoryState = {
  categories: [],
};

export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    updateCategories: (state, action: PayloadAction<ICategory[]>) => {
      state.categories = action.payload;
    },
    resetCategories: () => initialState,
  },
});

export const { updateCategories, resetCategories } = categorySlice.actions;

export default categorySlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProduct } from '../../types/ProductTypes';

export interface ProductState {
  product: IProduct | null;
}

const initialState: ProductState = {
  product: null,
};

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    updateProduct: (state, action: PayloadAction<IProduct>) => {
      state.product = action.payload;
    },
    resetProduct: () => initialState,
  },
});

export const { updateProduct, resetProduct } = productSlice.actions;

export default productSlice.reducer;

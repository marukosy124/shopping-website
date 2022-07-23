import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IToBuyProduct } from '../../types/ProductTypes';

export interface ShoppingCartState {
  products: IToBuyProduct[];
}

const initialState: ShoppingCartState = {
  products: [],
};

export const shoppingCartSlice = createSlice({
  name: 'shoppingCart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<IToBuyProduct>) => {
      // handle adding existing and new product to cart
      const index = state.products.findIndex((product) => product.pid === action.payload.pid);
      if (index >= 0) {
        const newProducts = [...state.products];
        newProducts[index].quantity += action.payload.quantity;
        state.products = newProducts;
      } else {
        state.products = [...state.products, action.payload];
      }
      localStorage.setItem('shoppingCart', JSON.stringify(state.products.map((product) => ({ pid: product.pid, quantity: product.quantity }))));
    },
    // remove product by id
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((product) => product.pid !== action.payload);
      localStorage.setItem('shoppingCart', JSON.stringify(state.products.map((product) => ({ pid: product.pid, quantity: product.quantity }))));
    },
    // update entire cart
    updateCart: (state, action: PayloadAction<IToBuyProduct[]>) => {
      state.products = action.payload;
      localStorage.setItem('shoppingCart', JSON.stringify(state.products.map((product) => ({ pid: product.pid, quantity: product.quantity }))));
    },
    resetCart: () => {
      localStorage.removeItem('shoppingCart');
      return initialState;
    },
  },
});

export const { addToCart, removeFromCart, updateCart, resetCart } = shoppingCartSlice.actions;

export default shoppingCartSlice.reducer;

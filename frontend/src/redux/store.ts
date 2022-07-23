import { configureStore } from '@reduxjs/toolkit';
import shoppingCartSlice from './slice/shoppingCartSlice';
import logger from 'redux-logger';
import productSlice from './slice/productSlice';
import categorySlice from './slice/categorySlice';
import userSlice from './slice/userSlice';

export const store = configureStore({
  reducer: {
    shoppingCart: shoppingCartSlice,
    product: productSlice,
    category: categorySlice,
    user: userSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  // .concat(logger),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

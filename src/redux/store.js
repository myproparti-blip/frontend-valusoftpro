import { configureStore } from '@reduxjs/toolkit';
import loaderReducer from './slices/loaderSlice';
import paginationReducer from './slices/paginationSlice';

export const store = configureStore({
  reducer: {
    loader: loaderReducer,
    pagination: paginationReducer,
  },
});

export default store;

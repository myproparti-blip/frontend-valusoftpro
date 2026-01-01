import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  message: '',
  loadingCount: 0, // Track nested loader calls
};

const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    showLoader: (state, action) => {
      state.loadingCount += 1;
      state.isLoading = true;
      state.message = action.payload || 'Loading...';
    },
    hideLoader: (state) => {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
      if (state.loadingCount === 0) {
        state.isLoading = false;
        state.message = '';
      }
    },
    resetLoader: (state) => {
      state.isLoading = false;
      state.message = '';
      state.loadingCount = 0;
    },
  },
});

export const { showLoader, hideLoader, resetLoader } = loaderSlice.actions;
export default loaderSlice.reducer;

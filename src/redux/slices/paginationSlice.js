import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
};

const paginationSlice = createSlice({
  name: 'pagination',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1;
    },
    setTotalItems: (state, action) => {
      state.totalItems = action.payload;
    },
    resetPagination: (state) => {
      state.currentPage = 1;
      state.totalItems = 0;
    },
  },
});

export const { setCurrentPage, setItemsPerPage, setTotalItems, resetPagination } = paginationSlice.actions;
export default paginationSlice.reducer;

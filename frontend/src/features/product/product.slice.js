import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
    listLoading: false,
    listError: null,
    currentCategory: null,
    selectedProduct: null,
    selectedLoading: false,
    selectedError: null,
  },
  reducers: {
    setListLoading(state, action) {
      state.listLoading = action.payload;
    },
    setListError(state, action) {
      state.listError = action.payload;
      state.listLoading = false;
    },
    setProductList(state, action) {
      state.list = action.payload.products;
      state.currentCategory = action.payload.category;
      state.listLoading = false;
      state.listError = null;
    },
    setSelectedLoading(state, action) {
      state.selectedLoading = action.payload;
    },
    setSelectedError(state, action) {
      state.selectedError = action.payload;
      state.selectedLoading = false;
    },
    setSelectedProduct(state, action) {
      state.selectedProduct = action.payload;
      state.selectedLoading = false;
      state.selectedError = null;
    },
    clearProductList(state) {
      state.list = [];
      state.listError = null;
      state.currentCategory = null;
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
      state.selectedError = null;
    },
  },
});

export const {
  setListLoading, setListError, setProductList,
  setSelectedLoading, setSelectedError, setSelectedProduct,
  clearProductList, clearSelectedProduct,
} = productSlice.actions;

// Selectors — UI imports these, never raw state.products.xxx
export const selectProductList        = (s) => s.products.list;
export const selectListLoading        = (s) => s.products.listLoading;
export const selectListError          = (s) => s.products.listError;
export const selectCurrentCategory    = (s) => s.products.currentCategory;
export const selectSelectedProduct    = (s) => s.products.selectedProduct;
export const selectSelectedLoading    = (s) => s.products.selectedLoading;
export const selectSelectedError      = (s) => s.products.selectedError;

export default productSlice.reducer;
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  getAllProductCategory,
  getSingleProduct,
} from "../api/product.api";
import {
  setListLoading, setListError, setProductList,
  setSelectedLoading, setSelectedError, setSelectedProduct,
  clearProductList, clearSelectedProduct,
  selectProductList, selectListLoading, selectListError,
  selectCurrentCategory, selectSelectedProduct,
  selectSelectedLoading, selectSelectedError,
} from "../slices/productSlice";

export function useProducts() {
  const dispatch = useDispatch();

  // ── Read state
  const list           = useSelector(selectProductList);
  const listLoading    = useSelector(selectListLoading);
  const listError      = useSelector(selectListError);
  const currentCategory= useSelector(selectCurrentCategory);
  const selectedProduct= useSelector(selectSelectedProduct);
  const selectedLoading= useSelector(selectSelectedLoading);
  const selectedError  = useSelector(selectSelectedError);

  // ── Actions
  const loadByCategory = useCallback(async (category) => {
    // Skip re-fetch if same category is already loaded
    if (currentCategory === category && list.length > 0) return;

    dispatch(setListLoading(true));
    const { data, error } = await fetchProductsByCategoryAPI(category);

    if (error) {
      dispatch(setListError(error));
    } else {
      dispatch(setProductList({ products: data, category }));
    }
  }, [dispatch, currentCategory, list.length]);

  const loadSingleProduct = useCallback(async (productId) => {
    dispatch(setSelectedLoading(true));
    const { data, error } = await fetchSingleProductAPI(productId);

    if (error) {
      dispatch(setSelectedError(error));
    } else {
      dispatch(setSelectedProduct(data));
    }
  }, [dispatch]);

  const resetList    = useCallback(() => dispatch(clearProductList()),    [dispatch]);
  const resetProduct = useCallback(() => dispatch(clearSelectedProduct()), [dispatch]);

  return {
    // state
    list, listLoading, listError, currentCategory,
    selectedProduct, selectedLoading, selectedError,
    // actions
    loadByCategory, loadSingleProduct, resetList, resetProduct,
  };
}
import {useDispatch} from 'react-redux'
import { getAllProductCategory,getSingleProduct,getLeaderBoard } from '../service/product.api'
import { setProducts,setLoading,setError,setProduct, setLeader } from '../product.slice'

export function useProducts(){
  const dispatch = useDispatch();

  async function handleGetAllProducts(category) {
    try{
      console.log("Hook cat",category)
      dispatch(setLoading(true));
      const {products} = await getAllProductCategory(category);
      dispatch(setProducts(products));
    }catch(error){
      dispatch(setError(error.response?.data?.message || "Prodcuts fetching failed"))
    }finally{
      dispatch(setLoading(false));
    }
  }

  async function handleSingleProduct(productId) {
    try{
      dispatch(setLoading(true));
      const {product} = await getSingleProduct(productId);
      dispatch(setProduct(product))
    }catch(error){
      dispatch(setError(error.response?.data?.message || "Failed to fetch product"))
    }finally{
      dispatch(setLoading(false))
    }
  }

  // useProduct.js hook
const handleGetLeaderBoard = async () => {
    try {
        dispatch(setLoading(true));
        const res = await getLeaderBoard();
        dispatch(setLeader(res.data));   // ← res.data.data, not res.data.leaderboard
    } catch (err) {
        dispatch(setError(err.message));
    } finally {
        dispatch(setLoading(false));
    }
}

  return {
    handleGetAllProducts,handleSingleProduct,handleGetLeaderBoard
  }
}
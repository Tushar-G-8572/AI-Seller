import {createSlice} from '@reduxjs/toolkit'

const productSlice = createSlice({
  name:"product",
  initialState:{
    products:[],
    leader:[],
    product:null,
    loading:null,
    error:null
  },
  reducers:{
    setProducts:(state,action)=>{
      state.products = action.payload
    },
    setProduct:(state,action)=>{
      state.product = action.payload
    },
    setLoading:(state,action)=>{
      state.loading = action.payload
    },
    setError:(state,action)=>{
      state.error = action.payload
    },
    setLeader:(state,action)=>{
      state.leader = action.payload
    }
  }
})

export const {setError,setLoading,setProducts,setProduct,setLeader} = productSlice.actions;

export default productSlice.reducer;

import axios from "axios";

const api = axios.create({
    baseURL:"http://localhost:4000/api/products",
    withCredentials:true
})

export async function getAllProductCategory({category}) {
   const responce =  await api.get('/category',{
        category
    })
    return responce.data;
}

export async function getSingleProduct() {
    const responce = await api.get(`/product/${id}`);
    return responce.data;
}
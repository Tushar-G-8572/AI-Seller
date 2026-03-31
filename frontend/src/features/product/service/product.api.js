import axios from "axios";

const api = axios.create({
    // baseURL:"http://localhost:4000/api/products",
     baseURL:"https://ai-seller.onrender.com/api/products",
    withCredentials:true
})

export async function getAllProductCategory(category) {
   const responce =  await api.get(`/category?category=${category}`)
    return responce.data;
}

export async function getSingleProduct(productId) {
    const responce = await api.get(`/product/${productId}`);
    return responce.data;
}

export async function getLeaderBoard() {
    const responce = await api.get('/leaderboard');
    return responce.data
}
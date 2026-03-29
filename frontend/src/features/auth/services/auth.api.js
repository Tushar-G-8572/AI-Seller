import axios from 'axios';

const api = axios.create({
    baseURL:"http://localhost:4000/api/auth",
    withCredentials:true
});

export async function register(paylaod) {
    const {username,email,password} = paylaod;

    const responce = await api.post('/register',{
        username,email,password
    });

    return responce.data;
    
}

export async function login(paylaod) {
    const {email,password} = paylaod;

    const responce = await api.post('/login',{
        email,password
    });

    return responce.data;
}

export async function getMe() {
    const responce = await api.get('/get-me');
    return responce.data;
}
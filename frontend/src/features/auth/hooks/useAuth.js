import { useDispatch } from "react-redux";
import { login,register,getMe } from "../services/auth.api";
import { setUser,setLoading,setError } from "../auth.slice";


export function useAuth(){
    const dispath = useDispatch();

    async function handleRegister({email,password,username}) {
        try{
            dispath(setLoading(true))
            const data = await register({email,username,password})
        }catch(error){
            dispath(setError(error.response?.data?.message || "Registration failed"))
        }finally{
            dispath(setLoading(false))
        }
    }

    async function handleLogin({email,password}) {
        try{
            dispath(setLoading(true));
            const data = await login({email,password});
            dispath(setUser(data.user))
        }catch(error){
            dispath(setError(error.response?.data?.message || "Login failed"))
        }finally{
            dispath(setLoading(false));
        }
    }

    async function handleGetMe() {
        try{
            dispath(setLoading(true));
            const data = await getMe();
            dispath(setUser(data.user))
        }catch(error){
            dispath(setError(error.response?.data?.message))
        }finally{
            dispath(setLoading(false));
        }
    }

    return {
        handleGetMe,handleLogin,handleRegister
    }
}



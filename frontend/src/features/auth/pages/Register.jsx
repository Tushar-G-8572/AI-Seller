import React from 'react'
import { Link } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { Navigate } from 'react-router'

const Register = () => {

    const navigate = useNavigate();
    const [username,setUsername] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const {handleRegister} = useAuth();
    const submitForm = async(e)=>{
        e.preventDefault();
        const payload = {
            email,
            username,
            password
        }
        await handleRegister(payload);
        navigate('/login');
    }

    const user = useSelector(state => state.auth.user);
    const loading = useSelector(state => state.auth.loading);


    if(loading){
        return (
            <h1>Loading....</h1>
        )
    }

    if(!loading && user){
        return <Navigate to='/' replace />
    }

    

   return (
        <section className='min-h-screen bg-gray-950 text-zinc-100  px-4 py-10 sm:px-6 lg:px-8  '>
            <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl  items-center justify-center">
                <div className=' w-full max-w-md rounded-2xl border border-gray-700 bg-zinc-900/30 p-8 shadow-2xl shadow-black/50 backdrop-blur ' >
                    <h1 className="text-3xl text-center font-bold text-[#31b8c6]">
                        Welcome to Perplexity
                    </h1>
                    <p className="mt-4 text-center text-sm text-zinc-300">
                        Sign Up with your details.
                    </p>

                    <form onSubmit={submitForm} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="username" className="mb-2 block text-sm font-medium text-zinc-200">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="John Doe"
                                required
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-lg cursor-pointer text-md bg-[#09b4c7] px-4 py-3 font-semibold text-zinc-950 transition hover:bg-[#06e0f4] focus:outline-none focus:shadow-[0_0_0_3px_rgba(49,184,198,0.35)]"
                        >
                            Login
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-zinc-300">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-[#31b8c6] transition hover:text-[#45c7d4]">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Register
import { createBrowserRouter } from "react-router";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Protected from "../features/auth/components/Protected";
import Dashboard from "../features/product/pages/Dashboard";
import ProductList from "../features/product/components/ProductList";

export const router = createBrowserRouter([
    {
        path: '/',
        element: 
        <Dashboard />
        // <Protected>
        // </Protected>
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path:`/products/:category`,
        element:<ProductList />
    }
    
])
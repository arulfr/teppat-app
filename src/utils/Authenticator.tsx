import { useAppSelector } from '@/stores/hooks'
import Login from '@/views/Login/Login';
import React from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const Authenticator = ({children}:{children:JSX.Element}) => {
    const location = useLocation();
    const isLogin =  useAppSelector(state => state.AdminSlice.isLogin);
    const token = isLogin?.token;
    if(!token) return <Navigate to="/login" replace state={{from:location}}  />
    
    return children;
}

export default Authenticator
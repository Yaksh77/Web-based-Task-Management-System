import React from 'react'
import { useAuthStore } from '../store/userAuthStore';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({allowedRoles}) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    if(!isAuthenticated){
        return <Navigate to="/login" replace  />;
    }

    if(isAuthenticated && !allowedRoles.includes(user.role)){
        return <Navigate to="/unauthorized" replace  />;
    }
  return (
   <Outlet />
  )
}

export default ProtectedRoute
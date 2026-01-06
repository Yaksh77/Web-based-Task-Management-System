import './App.css'
import { Route, Router, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import { useAuthStore } from './store/userAuthStore'
import Navbar from './components/Navbar'

function App() {
  const user = useAuthStore((state) => state.user);
  return (
    <>
    
    <Navbar data={user} />    
    <Routes>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'USER']} />} >
        <Route path='/dashboard' element={<Dashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
      <Route path='/admin/panel'  element={<AdminPanel/>}/>
      {/* <Route path='/admin/users'  element={<AdminDashboard/>}/> */}
      </Route>

      <Route path="/unauthorized" element={<h1>You are not allowed here!</h1>} />
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
    </>
    
  )
}

export default App

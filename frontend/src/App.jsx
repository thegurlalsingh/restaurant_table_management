import { useState } from 'react'
import { useAuth } from './context/authContext.jsx'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css'
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';



const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
        <Route path='/register' element={!user ? <Register /> : <Navigate to='/dashboard' />} />
        <Route path='/dashboard' element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
        <Route path='/admin' element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path='*' element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

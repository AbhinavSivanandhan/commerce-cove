import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ShowProduct from './pages/ShowProduct';
import EditProduct from './pages/EditProduct';
import CreateProduct from './pages/CreateProduct';
import DeleteProduct from './pages/DeleteProduct';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ProtectedRoute from './components/ProtectedRoute';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RequestPasswordReset from './pages/RequestPasswordReset';
import ResetPassword from './pages/ResetPassword';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/request-password-reset" element={<RequestPasswordReset />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/products/create" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
        <Route path="/products/details/:id" element={<ProtectedRoute><ShowProduct /></ProtectedRoute>} />
        <Route path="/products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
        <Route path="/products/delete/:id" element={<ProtectedRoute><DeleteProduct /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/orderhistory" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
        <Route path="/cancel" element={<ProtectedRoute><Cancel /></ProtectedRoute>} />
      </Routes>
      <ToastContainer autoClose={1500} />
    </>
  );
};

export default App;

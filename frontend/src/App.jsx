import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home';
import ShowProduct from './pages/ShowProduct';
import EditProduct from './pages/EditProduct';
import CreateProduct from './pages/CreateProduct';
import DeleteProduct from './pages/DeleteProduct';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
const App = () => {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path='/products/create' element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
      <Route path='/products/details/:id' element={<ProtectedRoute><ShowProduct /></ProtectedRoute>} />
      <Route path='/products/edit/:id' element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
      <Route path='/products/delete/:id' element={<ProtectedRoute><DeleteProduct /></ProtectedRoute>} />
      <Route path='/products' element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
      <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path='/orderhistory' element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
    </Routes>
  )
}

export default App

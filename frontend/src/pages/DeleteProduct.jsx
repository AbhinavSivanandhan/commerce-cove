import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Header from '../components/Header'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';
const DeleteProduct = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {id} = useParams();
  const handleDeleteProduct = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    axios
    .delete(`http://localhost:5001/api/v1/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(()=>{
      setLoading(false);
      toast.success('Product deleted!');
      navigate('/');
    })
    .catch((error)=>{
      setLoading(false);
      toast.error('Error! Check console');
      console.log(error);
    })
  }; 
  return (
    <>
    <Header />
    <div className='p-4'>
      <BackButton />
      <h1 className='text-3xl my-4'>Delete Product?</h1>
      {loading?<Spinner />:''}
      <div className='flex flex-col border-2 border-sky-bg-400 rounded-xl w-[600px] p-8 mx-auto'>
      <h3 className='text-2xl'>Are you sure you want to delete this product?</h3>
      <button className='p-2 bg-red-400 m-8 hover:bg-red-500 hover:shadow-lg transition duration-300 ease-in-out' onClick={handleDeleteProduct}>Delete</button>
      </div>

    </div>
    </>
  )
}

export default DeleteProduct

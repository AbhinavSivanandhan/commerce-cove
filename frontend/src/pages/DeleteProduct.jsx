import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Spinner from '../components/Spinner'

const DeleteProduct = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {id} = useParams();
  const handleDeleteProduct = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    axios
    .delete(`http://localhost:5000/api/v1/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(()=>{
      setLoading(false);
      navigate('/');
    })
    .catch((error)=>{
      setLoading(false);
      alert('Error! Check console');
      console.log(error);
    })
  }; 
  return (
    <div className='p-4'>
      <BackButton />
      <h1 className='text-3xl my-4'>Delete Product?</h1>
      {loading?<Spinner />:''}
      <div className='flex flex-col border-2 border-sky-bg-400 rounded-xl w-[600px] p-8 mx-auto'>
      <h3 className='text-2xl'>Are you sure you want to delete this product?</h3>
      <button className='p-2 bg-sky-300 m-8' onClick={handleDeleteProduct}>Delete</button>
      </div>

    </div>
  )
}

export default DeleteProduct
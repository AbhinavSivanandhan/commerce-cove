import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Spinner from '../components/Spinner'

const EditProduct = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const {id} = useParams();
  const navigate = useNavigate();

  useEffect(()=>{
    setLoading(true);
    axios.get(`http://localhost:5000/api/v1/products/${id}`)
    .then((response)=>{
      setTitle(response.data.data.products[0].product_id);
      setDesc(response.data.data.products[0].description);
      setPrice(response.data.data.products[0].price);
      setLoading(false);
    }).catch((error)=>{
      setLoading(false);
      alert('Error! Please check console');
      console.log(error);
    })
  }, [])

  const handleEditProduct = () => {
    const data = {
      title,
      desc,
      seller
    };
    setLoading(true);
    axios
      .post('http://localhost:5000/products', data)
      .then(()=>{
        setLoading(false);
        navigate('/');
      })
      .catch((error)=>{
        setLoading(false);
        alert('Error! Please check console');
        console.log(error);
      });
  };
  return (
    <div className='p-4'>
      <BackButton/>
      <h1 className='text-3xl my-4'>Edit Product</h1>
      {loading?<Spinner />:''}
      <div className='flex flex-col border-2 border-sky-bg-400 rounded-xl w-fit p-4'>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>Title</label>
            <input
              type='text'
              value={title}
              onChange={(e)=>setTitle(e.targetValue)}
              className='border-2 border-gray-500 px-4 py-2 w-full'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>Desc</label>
            <input
              type='text'
              value={desc}
              onChange={(e)=>setDesc(e.targetValue)}
              className='border-2 border-gray-500 px-4 py-2 w-full'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>Seller</label>
            <input
              type='text'
              value={price}
              onChange={(e)=>setPrice(e.targetValue)}
              className='border-2 border-gray-500 px-4 py-2 w-full'
            />
          </div>
          <button className='p-2 bg-sky-300 m-8' onClick={handleEditProduct}>Save</button>
      </div>
    </div>
  )
}

export default EditProduct
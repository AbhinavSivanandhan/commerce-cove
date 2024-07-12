import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Spinner from '../components/Spinner'

const CreateProduct = () => {
  const [description, setDesc] = useState('');
  const [seller_id, setSid] = useState('');
  const [companyname, setCompanyname] = useState('');
  const [price, setPrice] = useState('');
  const [instock, setInstock] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSaveProduct = () => {
    const data = {
      description,
      seller_id,
      companyname,
      price,
      instock
    };
    setLoading(true);
    const token = localStorage.getItem('token');
    console.log(data);
    console.log(token);
    console.log('price');

    console.log(price);
    console.log(typeof price);
    console.log('so now you knw');
    axios
      .post('http://localhost:5000/api/v1/products', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(()=>{
        setLoading(false);
        console.log('created product!');

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
      <h1 className='text-3xl my-4'>Create Product</h1>
      {loading?<Spinner />:''}
      <div className='flex flex-col border-2 border-sky-bg-400 rounded-xl w-fit p-4'>

          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>Seller-Id</label>
            <input
              type='number'
              value={seller_id}
              onChange={(e)=>setSid(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>description</label>
            <input
              type='text'
              value={description}
              onChange={(e)=>setDesc(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>Company Name</label>
            <input
              type='text'
              value={companyname}
              onChange={(e)=>setCompanyname(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>Price</label>
            <input
              type='number'
              value={price}
              onChange={(e)=>setPrice(parseFloat(e.target.value) || 0)}
              className='border-2 border-gray-500 px-4 py-2 w-full'
              min='0'
              step='0.1'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>In Stock</label>
            <input
            type='checkbox'
            checked={instock} 
            onChange={() => setInstock(!instock)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
          />
          </div>
          <button className='p-2 bg-sky-300 m-8' onClick={handleSaveProduct}>Save</button>
      </div>
    </div>
  )
}

export default CreateProduct

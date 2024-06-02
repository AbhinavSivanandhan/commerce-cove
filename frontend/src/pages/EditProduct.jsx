import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Spinner from '../components/Spinner'

const EditProduct = () => {
  const [product_id, setPid] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [instock, setInstock] = useState(false);
  const [companyname, setCompanyname] = useState('');
  const [seller_id, setSid] = useState('');
  const [loading, setLoading] = useState(false);
  const {id} = useParams();
  const navigate = useNavigate();

  useEffect(()=>{
    setLoading(true);
    axios.get(`http://localhost:5000/api/v1/products/${id}`)
    .then((response)=>{
      setPid(response.data.data.products[0].product_id);
      setDescription(response.data.data.products[0].description);
      setPrice(response.data.data.products[0].price);
      setInstock(response.data.data.products[0].instock);
      setCompanyname(response.data.data.products[0].companyname);
      setSid(response.data.data.products[0].seller_id);
      setLoading(false);
    }).catch((error)=>{
      setLoading(false);
      alert('Error! Please check console');
      console.log(error);
    })
  }, [])

  const handleEditProduct = () => {
    const data = {
      product_id,
      description,
      seller_id,
      companyname,
      price,
      instock
    };
    setLoading(true);
    console.log('data');
    console.log(data);
    axios
      .put('http://localhost:5000/api/v1/products', data)
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
            <label className='text-xl mr-4 text-gray-500'>Product Id(Read Only)</label>
            <input
              type='text'
              value={product_id}
              onChange={(e)=>setPid(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full'
              readOnly
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>description</label>
            <input
              type='text'
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
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
            <label className='text-xl mr-4 text-gray-500'>Seller Id</label>
            <input
              type='number'
              value={seller_id}
              onChange={(e)=>setSid(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>Price</label>
            <input
              type='number'
              value={price}
              onChange={(e)=>setPrice(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full'
              min='0'
              step='0.1'
            />
          </div>
          <button className='p-2 bg-sky-300 m-8' onClick={handleEditProduct}>Save</button>
      </div>
    </div>
  )
}

export default EditProduct
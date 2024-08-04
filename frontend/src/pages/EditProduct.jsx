import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';

const EditProduct = () => {
  const [product, setProduct] = useState({
    product_id: '',
    description: '',
    price: 0,
    instock: false,
    companyname: '',
    seller_id: ''
  });
  const [loading, setLoading] = useState(false);
  const {id} = useParams();
  const navigate = useNavigate();

  useEffect(()=>{
    setLoading(true);
    axios.get(`http://localhost:5000/api/v1/products/${id}`)
    .then((response)=>{
      const {product_id, description, price, instock, companyname, seller_id} = response.data.data.product;
      setProduct({
        product_id,
        description,
        price: parseFloat(price),
        instock,
        companyname,
        seller_id
      })
      setLoading(false);
    }).catch((error)=>{
      setLoading(false);
      toast.error('Error! Please check console');
      console.log(error);
    })
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : type === 'radio' ? value === 'true' : type === 'number' ? parseFloat(value) : value
    }));
  }

  const handleEditProduct = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    axios
      .put('http://localhost:5000/api/v1/products', product, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(()=>{
        setLoading(false);
        toast.success('Product details edited!');
        navigate('/');
      })
      .catch((error)=>{
        setLoading(false);
        toast.error('Error! Please check console');
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
              name='product_id'
              type='text'
              value={product.product_id}
              onChange={handleInputChange}
              className='border-2 border-gray-500 px-4 py-2 w-full'
              readOnly
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>description</label>
            <input
              name='description'
              type='text'
              value={product.description}
              onChange={handleInputChange}
              className='border-2 border-gray-500 px-4 py-2 w-full'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>Company Name</label>
            <input
              name='companyname'
              type='text'
              value={product.companyname}
              onChange={handleInputChange}
              className='border-2 border-gray-500 px-4 py-2 w-full'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>Seller Id</label>
            <input
              name='seller_id'
              type='number'
              value={product.seller_id}
              onChange={handleInputChange}
              className='border-2 border-gray-500 px-4 py-2 w-full'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>Price</label>
            <input
              name='price'
              type='number'
              value={product.price}
              onChange={(e)=> handleInputChange({...e, value: parseFloat(e.target.value) || 0 })}
              className='border-2 border-gray-500 px-4 py-2 w-full'
              min='0'
              step='0.1'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>In Stock</label>
            <div className='flex items-center'>
              <input
                type='radio'
                name='instock'
                value='true'
                checked={product.instock === true}
                onChange={handleInputChange}
                className='mr-2'
              />
              <label className='mr-4'>Yes</label>
              <input
                type='radio'
                name='instock'
                value='false'
                checked={product.instock === false}
                onChange={handleInputChange}
                className='mr-2'
                />
                <label>No</label>
            </div>
          </div>
          <button className='p-2 bg-sky-300 m-8' onClick={handleEditProduct}>Save</button>
      </div>
    </div>
  )
}

export default EditProduct

import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Spinner from '../components/Spinner'
 
const ShowProduct = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const {id} = useParams();

  useEffect( () => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/v1/products/${id}`)
      .then((response) => {
        console.log(response);
        console.log('product:');
        console.log(response.data.data.product);
        setProduct(response.data.data.product);
        setLoading(false);
      })
      .catch((error)=>{
        console.log(error);
        setLoading(false);
      })
  }, [id])

  return (
    <div className='p-4'>
      <BackButton />
      <h1 className='text-3xl my-4'>Showing Product Details...</h1>
      {loading?(<Spinner />):(
        product && (
        <div className='flex flex-col border-2 border-sky-bg-400 rounded-xl w-fit p-4'>
          <div className='my-4'>
            <span className='text-xl mr-4 text-gray-500'>Id</span>
            <span>{product.product_id}</span>
          </div>
          <div className='my-4'>
            <span className='text-xl mr-4 text-gray-500'>description</span>
            <span>{product.description}</span>
          </div>
          <div className='my-4'>
            <span className='text-xl mr-4 text-gray-500'>price</span>
            <span>{product.price}</span>
          </div>
          <div className='my-4'>
            <span className='text-xl mr-4 text-gray-500'>instock</span>
            <span>{product.instock ? 'Yes' : 'No'}</span>
          </div>
          <div className='my-4'>
            <span className='text-xl mr-4 text-gray-500'>S-Id</span>
            <span>{product.seller_id}</span>
          </div>
          <div className='my-4'>
            <span className='text-xl mr-4 text-gray-500'>Company Name</span>
            <span>{product.companyname}</span>
          </div>
        </div>
        )
      )}
    </div>
  )
}

export default ShowProduct
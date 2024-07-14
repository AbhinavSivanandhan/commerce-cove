import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Spinner from '../components/Spinner'
import Header from '../components/Header';
 
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
    <>
    <Header />
    <div className='p-4'>
      <BackButton />
      {loading?(<Spinner />):(
        product && (
          <table className="mt-4 w-full border-collapse border border-slate-600 bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-50 text-black">
              <th className="py-2 px-4 text-center text-lg" colSpan="2">Showing Product Details for: {product.description} ( By {product.companyname} )</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-600">
              <td className="py-2 px-4 font-semibold text-slate-700">ID</td>
              <td className="py-2 px-4">{product.product_id}</td>
            </tr>
            <tr className="border-t border-slate-600 bg-slate-50">
              <td className="py-2 px-4 font-semibold text-slate-700">Description</td>
              <td className="py-2 px-4">{product.description}</td>
            </tr>
            <tr className="border-t border-slate-600">
              <td className="py-2 px-4 font-semibold text-slate-700">Price</td>
              <td className="py-2 px-4">{product.price}</td>
            </tr>
            <tr className="border-t border-slate-600 bg-slate-50">
              <td className="py-2 px-4 font-semibold text-slate-700">In Stock</td>
              <td className="py-2 px-4">{product.instock ? 'Yes' : 'No'}</td>
            </tr>
            <tr className="border-t border-slate-600">
              <td className="py-2 px-4 font-semibold text-slate-700">S-Id</td>
              <td className="py-2 px-4">{product.seller_id}</td>
            </tr>
            <tr className="border-t border-slate-600 bg-slate-50">
              <td className="py-2 px-4 font-semibold text-slate-700">Company Name</td>
              <td className="py-2 px-4">{product.companyname}</td>
            </tr>
          </tbody>
        </table>        
        )
      )}
    </div>
    </>
  )
}

export default ShowProduct

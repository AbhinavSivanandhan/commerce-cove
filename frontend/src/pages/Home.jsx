import React, {useEffect, useState} from 'react'
import axios from 'axios';
import Spinner from '../components/Spinner'
import { Link } from 'react-router-dom'
import {AiOutlineEdit} from 'react-icons/ai';
import {BsInfoCircle} from 'react-icons/bs';
import {MdOutlineAddBox, MdOutlineDelete} from 'react-icons/md';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(()=> {
    setLoading(true);
    axios
      .get('http://localhost:5000/api/v1/products')
      .then((response)=>{
        console.log(response);
        console.log(response.data.data.products);
        setProducts(response.data.data.products);
        setLoading(false);
      })
      .catch((error)=>{
        console.log(error);
      });
}, []);
  return (
    <div className='p-4'>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl my-8">Products List</h1>
        <Link to='/products/create'>
          <MdOutlineAddBox className='text-sky-800 text-4xl'/>
        </Link>
      </div>
      {loading?(
        <Spinner />
      ) : (
        <table className='w-full border-separate border-spacing-2'>
          <thead>
            <tr>
            <th className='border border-slate-600 rounded-md'>SNo</th>
            <th className='border border-slate-600 rounded-md'>Description</th>
            <th className='border border-slate-600 rounded-md max-md:hidden'>In Stock</th>
            <th className='border border-slate-600 rounded-md max-md:hidden'>Company Name</th>
            <th className='border border-slate-600 rounded-md'>Price</th>
            </tr>
          </thead>
          <tbody>
              {products.map((product, index)=>(
              <tr key={products.product_id} className='h-8'>
                <td className='border border-slate-700 rounded-md text-center'>
                {index+1}
                </td>
                <td className='border border-slate-700 rounded-md text-center'>
                  {product.description}
                </td>
                <td className='border border-slate-700 rounded-md text-center max-md:hidden'>
                {product.instock ? 'Yes' : 'No'}
                </td>
                <td className='border border-slate-700 rounded-md text-center max-md:hidden'>
                  {product.companyname}
                </td>
                <td className='border border-slate-700 rounded-md text-center'>
                  {product.price}
                </td>
                <td className='border border-slate-700 rounded-md text-center'>
                  <div className="flex justify-center gap-x-4">
                    <Link to={`/products/details/${product.product_id}`}>
                      <BsInfoCircle className='text-2x1 text-green-800'/>
                    </Link>
                    <Link to={`/products/edit/${product.product_id}`}>
                      <AiOutlineEdit className='text-2x1 text-yellow-600'/>
                    </Link>
                    <Link to={`/products/delete/${product.product_id}`}>
                      <MdOutlineDelete className='text-2x1 text-red-600'/>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}  
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Home
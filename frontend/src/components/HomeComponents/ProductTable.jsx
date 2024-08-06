import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete, MdOutlineAddShoppingCart, MdRemoveShoppingCart} from 'react-icons/md';

const ProductTable = ({products, currentPage, limit, role, handleCartToggle, isInCart}) => {
  return (
    <table className='w-full border-separate border-spacing-2'>
        <thead>
            <tr>
            <th className='border border-slate-600 rounded-md'>SNo</th>
            <th className='border border-slate-600 rounded-md max-md:hidden'>Product Id</th>
            <th className='border border-slate-600 rounded-md'>Description</th>
            <th className='border border-slate-600 rounded-md max-md:hidden'>In Stock</th>
            <th className='border border-slate-600 rounded-md max-md:hidden'>Company Name</th>
            <th className='border border-slate-600 rounded-md'>Price</th>
            <th className='border border-slate-600 rounded-md'>Actions</th>
            </tr>
        </thead>
        <tbody>
        {products.map((product, index) => (
          <tr key={product.product_id} className='h-8'>
            <td className='border border-slate-700 rounded-md text-center'>
              {(currentPage - 1) * limit + index + 1}
            </td>
            <td className='border border-slate-700 rounded-md text-center max-md:hidden'>
              {product.product_id}
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
                  <BsInfoCircle className='text-2x1 text-green-800' />
                </Link>
                {role !== 'customer' && (
                <>
                  <Link to={`/products/edit/${product.product_id}`}>
                    <AiOutlineEdit className='text-2x1 text-yellow-600' />
                  </Link>
                  <Link to={`/products/delete/${product.product_id}`}>
                    <MdOutlineDelete className='text-2x1 text-red-600' />
                  </Link>
                </>
                )}
                <button 
                  onClick={() => handleCartToggle(product.product_id)} 
                  className={`px-1 py-0.25 rounded ${
                    isInCart(product.product_id) ? 'bg-red-500' : 'bg-emerald-500'
                  } text-white`}>
                  {isInCart(product.product_id) ? <MdRemoveShoppingCart /> : <MdOutlineAddShoppingCart />}
                </button>
              </div>
            </td>
          </tr>
        ))}
        </tbody>
    </table>
  );
};

export default ProductTable

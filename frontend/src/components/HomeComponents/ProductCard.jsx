import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineAddShoppingCart, MdRemoveShoppingCart, MdOutlineDelete } from 'react-icons/md';

const ProductCard = ({ products, currentPage, limit, role, handleCartToggle, isInCart }) => {
  return (
    <>
    {products.map((product) => (
    <div key={product.product_id} className="border p-6 rounded shadow-md w-full h-full">
      <h2 className="text-2xl font-bold mb-4">{product.description}</h2>
      <p className="mb-2">Product Id: {product.product_id}</p>
      <p className="mb-2">Price: {product.price}</p>
      <p className="mb-2">In Stock: {product.instock ? 'Yes' : 'No'}</p>
      <p className="mb-4">Company: {product.companyname}</p>
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
          className={`px-2 py-1 rounded ${
            isInCart(product.product_id) ? 'bg-red-500' : 'bg-emerald-500'
          } text-white`}>
          {isInCart(product.product_id) ? <MdRemoveShoppingCart /> : <MdOutlineAddShoppingCart />}
        </button>
      </div>
    </div>
    ))}
    </>
  );
};

export default ProductCard;

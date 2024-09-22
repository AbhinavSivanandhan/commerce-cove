import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineAddShoppingCart, MdRemoveShoppingCart, MdOutlineDelete } from 'react-icons/md';
import ProductImageCarousel from './ProductImageCarousel';

const ProductCard = ({ products, role, handleCartToggle, isInCart }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 p-4">
      {products.map((product) => (
        <div 
          key={product.product_id} 
          className="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white flex flex-col justify-between h-[400px]" // Adjust height
        >
          <div>
            {/* Display Carousel or Thumbnail */}
            {product.images && product.images.length > 0 ? (
              <ProductImageCarousel images={product.images} />
            ) : (
              <div className="h-32 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-600 text-sm">No Image Available</p>
              </div>
            )}

            <h2 className="text-xl font-bold mb-2">{product.description}</h2> {/* Reduced margin */}
            <p className="mb-1 text-sm text-gray-600">Product ID: {product.product_id}</p> {/* Reduced margin */}
            <p className="mb-1 text-sm text-gray-600">Price: ${product.price}</p>
            <p className="mb-1 text-sm text-gray-600">
              In Stock: <span className={product.instock ? 'text-green-600' : 'text-red-600'}>{product.instock ? 'Yes' : 'No'}</span>
            </p>
            <p className="text-sm text-gray-600">Company: {product.companyname}</p>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Link to={`/products/details/${product.product_id}`} className="hover:text-green-600 transition-colors">
              <BsInfoCircle className="text-2xl" />
            </Link>
            {role !== 'customer' && (
              <>
                <Link to={`/products/edit/${product.product_id}`} className="hover:text-yellow-500 transition-colors">
                  <AiOutlineEdit className="text-2xl" />
                </Link>
                <Link to={`/products/delete/${product.product_id}`} className="hover:text-red-500 transition-colors">
                  <MdOutlineDelete className="text-2xl" />
                </Link>
              </>
            )}
            {role !== 'admin' && (
              <button
                onClick={() => handleCartToggle(product.product_id)}
                className={`flex items-center px-2 py-1 rounded text-white hover:opacity-90 transition-opacity ${
                  isInCart(product.product_id) ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              >
                {isInCart(product.product_id) ? (
                  <MdRemoveShoppingCart className="text-2xl" />
                ) : (
                  <MdOutlineAddShoppingCart className="text-2xl" />
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCard;

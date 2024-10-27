import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineAddShoppingCart, MdRemoveShoppingCart, MdOutlineDelete } from 'react-icons/md';

const ProductCard = ({ products, role, handleCartToggle, isInCart }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {products.map((product) => (
        <ProductCardItem
          key={product.product_id}
          product={product}
          role={role}
          handleCartToggle={handleCartToggle}
          isInCart={isInCart}
        />
      ))}
    </div>
  );
};

const ProductCardItem = ({ product, role, handleCartToggle, isInCart }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      className="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white flex flex-col justify-between"
      style={{ aspectRatio: '4 / 3' }}
      onClick={() => navigate(`/products/details/${product.product_id}`)}
    >
      <div className="relative h-full w-full bg-white-200 flex items-center justify-center">
        {product.images && product.images.length > 0 ? (
          <div className="relative h-full w-full">
            <div className="flex justify-center h-full w-full">
              <img
                src={product.images[currentImage].image_url}
                alt={`Product image ${currentImage + 1}`}
                className="object-contain h-full w-full rounded-md shadow-md"
              />
            </div>

            {product.images.length > 1 && (
              <>
                <button
                  className="absolute top-1/2 left-0 p-2 transform -translate-y-1/2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-all"
                  onClick={handlePrevImage}
                >
                  &#8249;
                </button>
                <button
                  className="absolute top-1/2 right-0 p-2 transform -translate-y-1/2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-all"
                  onClick={handleNextImage}
                >
                  &#8250;
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-600 text-sm">No Image Available</p>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="mt-2 flex flex-col justify-between text-center">
        <h2 className="text-lg font-bold">{product.description}</h2>
        <p className="text-sm text-gray-600 mt-1 flex flex-wrap justify-center space-x-2">
          <span>Product ID: {product.product_id}</span> 
          <span className="text-gray-400">•</span>
          <span>Price: ${product.price}</span> 
          <span className="text-gray-400">•</span>
          <span>
            In Stock: 
            <span className={product.instock ? 'text-green-600' : 'text-red-600'}>
              {product.instock ? ' Yes' : ' No'}
            </span>
          </span>
          <span className="text-gray-400">•</span> 
          <span>Company: {product.companyname}</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-4">
        {/* Info Button */}
        <BsInfoCircle
          className="text-2xl text-green-800 hover:text-green-600 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/products/details/${product.product_id}`);
          }}
        />

        {/* Role-based actions */}
        {role !== 'customer' && (
          <>
            <AiOutlineEdit
              className="text-2xl text-yellow-600 hover:text-yellow-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products/edit/${product.product_id}`);
              }}
            />
            <MdOutlineDelete
              className="text-2xl text-red-600 hover:text-red-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products/delete/${product.product_id}`);
              }}
            />
          </>
        )}
        
        {/* Cart Toggle Button */}
        {role !== 'admin' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCartToggle(product.product_id);
            }}
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
  );
};

export default ProductCard;

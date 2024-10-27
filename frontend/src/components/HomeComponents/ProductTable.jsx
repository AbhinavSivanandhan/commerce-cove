import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete, MdOutlineAddShoppingCart, MdRemoveShoppingCart } from 'react-icons/md';

const ProductTable = ({ products, currentPage, limit, role, handleCartToggle, isInCart }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm text-left">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
          <tr>
            <th className="px-4 py-2 border">SNo</th>
            <th className="px-4 py-2 border max-md:hidden">Product Id</th>
            <th className="px-4 py-2 border">Description</th>
            <th className="px-4 py-2 border max-md:hidden">In Stock</th>
            <th className="px-4 py-2 border max-md:hidden">Company Name</th>
            <th className="px-4 py-2 border">Price</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {products.map((product, index) => (
            <tr
              key={product.product_id}
              className={`h-12 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-all`}
              onClick={() => navigate(`/products/details/${product.product_id}`)}
            >
              <td className="px-4 py-2 text-center border">{(currentPage - 1) * limit + index + 1}</td>
              <td className="px-4 py-2 text-center border max-md:hidden">{product.product_id}</td>
              <td className="px-4 py-2 text-center border">{product.description}</td>
              <td className="px-4 py-2 text-center border max-md:hidden">
                {product.instock ? (
                  <span className="text-green-600 font-semibold">Yes</span>
                ) : (
                  <span className="text-red-600 font-semibold">No</span>
                )}
              </td>
              <td className="px-4 py-2 text-center border max-md:hidden">{product.companyname}</td>
              <td className="px-4 py-2 text-center border">${product.price}</td>
              <td className="px-4 py-2 text-center border">
                <div className="flex justify-center gap-4 items-center">
                  {/* Details Icon */}
                  <BsInfoCircle
                    className="text-2xl text-green-800 hover:text-green-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/details/${product.product_id}`);
                    }}
                  />

                  {/* Role-based actions */}
                  {role !== 'customer' && (
                    <>
                      <AiOutlineEdit
                        className="text-2xl text-yellow-600 hover:text-yellow-500 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/edit/${product.product_id}`);
                        }}
                      />
                      <MdOutlineDelete
                        className="text-2xl text-red-600 hover:text-red-500 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/delete/${product.product_id}`);
                        }}
                      />
                    </>
                  )}

                  {/* Cart toggle button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCartToggle(product.product_id);
                    }}
                    className={`relative group flex items-center px-2 py-1 rounded-lg ${
                      isInCart(product.product_id) ? 'bg-red-500' : 'bg-emerald-500'
                    } text-white hover:opacity-90 transition-opacity`}
                  >
                    {isInCart(product.product_id) ? (
                      <MdRemoveShoppingCart className="text-2xl" />
                    ) : (
                      <MdOutlineAddShoppingCart className="text-2xl" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;

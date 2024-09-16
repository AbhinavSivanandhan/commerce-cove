import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import Header from '../components/Header';

const ShowProduct = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/v1/products/${id}`)
      .then((response) => {
        console.log(response);
        setProduct(response.data.data.product);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [id]);

  return (
    <>
      <Header />
      <div className="p-4">
        <BackButton />
        {loading ? (
          <Spinner />
        ) : (
          product && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse bg-white shadow-md rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th
                      colSpan="2"
                      className="py-3 px-4 text-center text-lg font-semibold border-b border-gray-300"
                    >
                      Product Details: {product.description} (By {product.companyname})
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="hover:bg-gray-100 transition-all">
                    <td className="py-3 px-4 font-semibold text-gray-600 border-b border-gray-300">Product ID</td>
                    <td className="py-3 px-4 border-b border-gray-300">{product.product_id}</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100 transition-all">
                    <td className="py-3 px-4 font-semibold text-gray-600 border-b border-gray-300">Description</td>
                    <td className="py-3 px-4 border-b border-gray-300">{product.description}</td>
                  </tr>
                  <tr className="hover:bg-gray-100 transition-all">
                    <td className="py-3 px-4 font-semibold text-gray-600 border-b border-gray-300">Price</td>
                    <td className="py-3 px-4 border-b border-gray-300">{product.price}</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100 transition-all">
                    <td className="py-3 px-4 font-semibold text-gray-600 border-b border-gray-300">In Stock</td>
                    <td className="py-3 px-4 border-b border-gray-300">
                      {product.instock ? 'Yes' : 'No'}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-100 transition-all">
                    <td className="py-3 px-4 font-semibold text-gray-600 border-b border-gray-300">Seller ID</td>
                    <td className="py-3 px-4 border-b border-gray-300">{product.seller_id}</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100 transition-all">
                    <td className="py-3 px-4 font-semibold text-gray-600 border-b border-gray-300">Company Name</td>
                    <td className="py-3 px-4 border-b border-gray-300">{product.companyname}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default ShowProduct;

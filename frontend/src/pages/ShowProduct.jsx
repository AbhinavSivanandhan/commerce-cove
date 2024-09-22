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
      .get(`http://localhost:5001/api/v1/products/${id}`)
      .then((response) => {
        console.log(response);
        setProduct(response.data);  // Now the product includes images as well
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [id]);

  // Carousel logic: simple manual navigation with state
  const [currentImage, setCurrentImage] = useState(0);

  const handlePrevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

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
                  {/* Carousel for images */}
                  {product.images && product.images.length > 0 && (
                    <tr className="hover:bg-gray-100 transition-all">
                      <td className="py-3 px-4 font-semibold text-gray-600 border-b border-gray-300">Product Images</td>
                      <td className="py-3 px-4 border-b border-gray-300">
                        <div className="relative w-full">
                          <div className="flex justify-center">
                            {/* Full image without cropping */}
                            <img
                              src={product.images[currentImage].image_url}
                              alt={`Product image ${currentImage + 1}`}
                              className="max-w-full max-h-80 object-contain rounded-md shadow-md"
                            />
                          </div>
                          {/* Navigation Buttons */}
                          <button
                            className="absolute top-1/2 left-0 p-2 transform -translate-y-1/2 bg-gray-500 text-white rounded-full"
                            onClick={handlePrevImage}
                          >
                            &#8249;
                          </button>
                          <button
                            className="absolute top-1/2 right-0 p-2 transform -translate-y-1/2 bg-gray-500 text-white rounded-full"
                            onClick={handleNextImage}
                          >
                            &#8250;
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
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

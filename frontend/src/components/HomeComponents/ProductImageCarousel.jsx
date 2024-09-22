import React, { useState } from 'react';

const ProductImageCarousel = ({ images }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const handlePrevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-32 mb-4">
      <img
        src={images[currentImage].image_url}
        alt={`Product image ${currentImage + 1}`}
        className="w-full h-32 object-cover rounded-md shadow-md"
      />
      {images.length > 1 && (
        <>
          {/* Carousel navigation buttons */}
          <button
            className="absolute top-1/2 left-0 p-1 bg-gray-500 text-white rounded-full transform -translate-y-1/2"
            onClick={handlePrevImage}
          >
            &#8249;
          </button>
          <button
            className="absolute top-1/2 right-0 p-1 bg-gray-500 text-white rounded-full transform -translate-y-1/2"
            onClick={handleNextImage}
          >
            &#8250;
          </button>
        </>
      )}
    </div>
  );
};

export default ProductImageCarousel;

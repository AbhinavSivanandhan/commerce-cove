import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import Header from '../components/Header';

const CreateProduct = () => {
  const [product, setProduct] = useState({
    description: '',
    price: 0,
    instock: false,
    seller_id: '',
    companyname: ''
  });
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prevState) => ({
      ...prevState,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'radio'
          ? value === 'true'
          : type === 'number'
          ? value === '' ? '' : parseFloat(value)
          : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast.error('You can upload a maximum of 10 images.');
    } else {
      setImages(files);
    }
  };

  const uploadImagesToS3 = async () => {
    const uploadedImageUrls = [];

    for (const image of images) {
      try {
        const { data: presignedData } = await axiosInstance.post('/products/s3-presigned-url', {
          filename: image.name,
          filetype: image.type,
        });

        await axiosInstance.put(presignedData.url, image, {
          headers: {
            'Content-Type': image.type,
          },
        });

        uploadedImageUrls.push(presignedData.imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }

    return uploadedImageUrls;
  };

  const handleSaveProduct = async () => {
    setLoading(true);

    try {
      const { data: newProduct } = await axiosInstance.post('/products', {
        description: product.description,
        price: product.price,
        instock: product.instock,
        seller_id: product.seller_id,
        companyname: product.companyname,
      });

      const uploadedImageUrls = await uploadImagesToS3();

      if (uploadedImageUrls.length) {
        await axiosInstance.post(`/products/${newProduct.product.product_id}/images`, {
          images: uploadedImageUrls,
        });
      }

      setLoading(false);
      toast.success('Product created successfully!');
      navigate('/');
    } catch (error) {
      setLoading(false);
      toast.error('Error creating product. Please check console.');
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <div className="p-4">
        <BackButton />
        <h1 className="text-3xl my-4">Create Product</h1>
        {loading ? <Spinner /> : ''}
        <div className="flex flex-col border-2 border-sky-bg-400 rounded-xl w-fit p-4">
          <div className="my-4">
            <label className="text-xl mr-4 text-gray-500">Seller-Id</label>
            <input
              name="seller_id"
              type="number"
              value={product.seller_id}
              onChange={handleInputChange}
              className="border-2 border-gray-500 px-4 py-2 w-full"
            />
          </div>
          <div className="my-4">
            <label className="text-xl mr-4 text-gray-500">Description</label>
            <input
              name="description"
              type="text"
              value={product.description}
              onChange={handleInputChange}
              className="border-2 border-gray-500 px-4 py-2 w-full"
            />
          </div>
          <div className="my-4">
            <label className="text-xl mr-4 text-gray-500">Company Name</label>
            <input
              name="companyname"
              type="text"
              value={product.companyname}
              onChange={handleInputChange}
              className="border-2 border-gray-500 px-4 py-2 w-full"
            />
          </div>
          <div className="my-4">
            <label className="text-xl mr-4 text-gray-500">Price</label>
            <input
              name="price"
              type="number"
              value={product.price}
              onChange={(e) => handleInputChange({ ...e, value: parseFloat(e.target.value) || 0 })}
              className="border-2 border-gray-500 px-4 py-2 w-full"
              min="0"
              step="0.1"
            />
          </div>
          <div className="my-4">
            <label className="text-xl mr-4 text-gray-500">In Stock</label>
            <div className="flex items-center">
              <input
                type="radio"
                name="instock"
                value="true"
                checked={product.instock === true}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="mr-4">Yes</label>
              <input
                type="radio"
                name="instock"
                value="false"
                checked={product.instock === false}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label>No</label>
            </div>
          </div>
          <div className="my-4">
            <label className="text-xl mr-4 text-gray-500">Product Images (0-10)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="border-2 border-gray-500 px-4 py-2 w-full"
            />
          </div>
          <button className="p-2 bg-sky-300 m-8" onClick={handleSaveProduct}>
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateProduct;

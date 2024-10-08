import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

const EditProduct = () => {
  const [product, setProduct] = useState({
    product_id: '',
    description: '',
    price: 0,
    instock: false,
    companyname: '',
    seller_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // Current images
  const [newImages, setNewImages] = useState([]); // New images to upload
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5001/api/v1/products/${id}`)
      .then((response) => {
        // Log the API response to see its structure
        //console.log('API Response:', response.data);

        // Destructure data directly from response.data
        const { product_id, description, price, instock, companyname, seller_id, images } = response.data; // Adjust based on actual structure
        setProduct({
          product_id,
          description,
          price: parseFloat(price),
          instock,
          companyname,
          seller_id
        });
        setImages(images || []); // Load existing images if available
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        toast.error('Error! Please check console');
        console.log(error);
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : type === 'radio' ? value === 'true' : type === 'number' ? parseFloat(value) : value
    }));
  };

  // Handle new image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      toast.error('You can upload a maximum of 10 images.');
    } else {
      setNewImages(files); // Store new images
    }
  };

  // Handle image deletion
  const handleDeleteImage = (imageUrl) => {
    console.log('attempting delete :'+id+' and image url:',{ imageUrl })
    const token = localStorage.getItem('token');
    console.log(token)
    axios
      .delete(`http://localhost:5001/api/v1/products/${id}/images`, {
        data: { imageUrl },
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setImages((prevImages) => prevImages.filter((img) => img.image_url !== imageUrl));
        toast.success('Image deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting image:', error);
        toast.error('Error deleting image');
      });
  };

  // Save edited product and upload new images
  const handleEditProduct = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // Step 1: Update product details
      await axios.put(`http://localhost:5001/api/v1/products/${id}`, product, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Step 2: Upload new images to S3 (if any)
      if (newImages.length) {
        const uploadImagesToS3 = async () => {
          const uploadedImageUrls = [];
          for (const image of newImages) {
            const { data: presignedData } = await axios.post(
              'http://localhost:5001/api/v1/products/s3-presigned-url',
              { filename: image.name, filetype: image.type },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            await axios.put(presignedData.url, image, { headers: { 'Content-Type': image.type } });
            uploadedImageUrls.push(presignedData.imageUrl);
          }
          return uploadedImageUrls;
        };

        const newImageUrls = await uploadImagesToS3();

        // Step 3: Send the new image URLs to the backend
        await axios.post(
          `http://localhost:5001/api/v1/products/${id}/images`,
          { images: newImageUrls },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setLoading(false);
      toast.success('Product updated successfully!');
      navigate('/');
    } catch (error) {
      setLoading(false);
      toast.error('Error updating product. Please check console.');
      console.error(error);
    }
  };

  return (
    <div className='p-4'>
      <BackButton />
      <h1 className='text-3xl my-4'>Edit Product</h1>
      {loading ? <Spinner /> : ''}
      <div className='flex flex-col border-2 border-sky-bg-400 rounded-xl w-fit p-4'>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Product Id (Read Only)</label>
          <input
            name='product_id'
            type='text'
            value={product.product_id}
            onChange={handleInputChange}
            className='border-2 border-gray-500 px-4 py-2 w-full'
            readOnly
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Description</label>
          <input
            name='description'
            type='text'
            value={product.description}
            onChange={handleInputChange}
            className='border-2 border-gray-500 px-4 py-2 w-full'
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Company Name</label>
          <input
            name='companyname'
            type='text'
            value={product.companyname}
            onChange={handleInputChange}
            className='border-2 border-gray-500 px-4 py-2 w-full'
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Seller Id</label>
          <input
            name='seller_id'
            type='number'
            value={product.seller_id}
            onChange={handleInputChange}
            className='border-2 border-gray-500 px-4 py-2 w-full'
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Price</label>
          <input
            name='price'
            type='number'
            value={product.price}
            onChange={(e) => handleInputChange({ ...e, value: parseFloat(e.target.value) || 0 })}
            className='border-2 border-gray-500 px-4 py-2 w-full'
            min='0'
            step='0.1'
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>In Stock</label>
          <div className='flex items-center'>
            <input
              type='radio'
              name='instock'
              value='true'
              checked={product.instock === true}
              onChange={handleInputChange}
              className='mr-2'
            />
            <label className='mr-4'>Yes</label>
            <input
              type='radio'
              name='instock'
              value='false'
              checked={product.instock === false}
              onChange={handleInputChange}
              className='mr-2'
            />
            <label>No</label>
          </div>
        </div>

        {/* Display current images */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Current Images</label>
          <div className='flex flex-wrap gap-4'>
            {images.map((image) => (
              <div key={image.image_url} className='relative'>
                <img
                  src={image.image_url}
                  alt='Product Image'
                  className='w-32 h-32 object-cover rounded-md shadow-md'
                />
                <button
                  onClick={() => handleDeleteImage(image.image_url)}
                  className='absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full'
                >
                  &#x2715;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload new images */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Add New Images (Max 10)</label>
          <input
            type='file'
            accept='image/*'
            multiple
            onChange={handleImageChange}
            className='border-2 border-gray-500 px-4 py-2 w-full'
          />
        </div>

        <button className='p-2 bg-sky-300 m-8' onClick={handleEditProduct}>
          Save
        </button>
      </div>
    </div>
  );
};

export default EditProduct;

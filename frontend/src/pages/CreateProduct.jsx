import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify';

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
  
    setProduct(prevState => ({
      ...prevState,
      [name]: type === 'checkbox'
        ? checked
        : type === 'radio'
        ? value === 'true'
        : type === 'number'
        ? value === '' ? '' : parseFloat(value) // Handle number input properly
        : value
    }));
  };  
  
  // Handle file input change for images
  const handleImageChange = (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 10) {
    toast.error('You can upload a maximum of 10 images.');
  } else {
    setImages(files); // Store the selected images
  }
  };

  // Function to upload images to S3
  const uploadImagesToS3 = async () => {
    const token = localStorage.getItem('token');
    const uploadedImageUrls = [];
  
    for (const image of images) {
      try {
        // Log image details
        console.log('Uploading Image:', image.name, image.type);
  
        // Get presigned URL from the backend
        const { data: presignedData } = await axios.post(
          'http://localhost:5001/api/v1/products/s3-presigned-url',
          { filename: image.name, filetype: image.type },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        // Log presigned URL details
        console.log('Presigned URL:', presignedData.url);
  
        // Upload the image using the presigned URL
        await axios.put(presignedData.url, image, {
          headers: {
            'Content-Type': image.type,
          },
        });
  
        // Store the image URL for later use
        uploadedImageUrls.push(presignedData.imageUrl);
  
        // Log the successful upload
        console.log('Image successfully uploaded:', presignedData.imageUrl);
  
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }
    return uploadedImageUrls;
  };
  

  // Handle product creation
  const handleSaveProduct = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
  
    try {
      // Step 1: Create the product first without images
      const { data: newProduct } = await axios.post(
        'http://localhost:5001/api/v1/products',
        { 
          description: product.description,
          price: product.price,
          instock: product.instock,
          seller_id: product.seller_id,
          companyname: product.companyname 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('newProduct: ')
      console.log(JSON.stringify(newProduct));
      console.log('newProduct url looks like: ')
      console.log(`http://localhost:5001/api/v1/products/${newProduct.product.product_id}/images`)
  
      // Step 2: If the product is created successfully, upload images to S3
      const uploadedImageUrls = await uploadImagesToS3();
  
      // Step 3: Now, send a request to associate the uploaded images with the new product
      if (uploadedImageUrls.length) {
        await axios.post(
          `http://localhost:5001/api/v1/products/${newProduct.product.product_id}/images`,
          { images: uploadedImageUrls }, // Send images with product_id to the backend
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
  
      // Step 4: Show success message and navigate to another page
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
    <div className='p-4'>
      <BackButton/>
      <h1 className='text-3xl my-4'>Create Product</h1>
      {loading?<Spinner />:''}
      <div className='flex flex-col border-2 border-sky-bg-400 rounded-xl w-fit p-4'>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>Seller-Id</label>
            <input
              name='seller_id'
              type='number'
              value={product.seller_id}
              onChange={handleInputChange}
              className='border-2 border-gray-500 px-4 py-2 w-full'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 text-gray-500'>description</label>
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
            <label className='text-xl mr-4 text-gray-500'>Price</label>
            <input
              name='price'
              type='number'
              value={product.price}
              onChange={(e)=> handleInputChange({...e, value: parseFloat(e.target.value) || 0 })}
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
          {/* Image input field */}
          <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Product Images (0-10)</label>
          <input
            type='file'
            accept='image/*'
            multiple
            onChange={handleImageChange}
            className='border-2 border-gray-500 px-4 py-2 w-full'
          />
          </div>
          <button className='p-2 bg-sky-300 m-8' onClick={handleSaveProduct}>Save</button>
      </div>
    </div>
  )
}

export default CreateProduct

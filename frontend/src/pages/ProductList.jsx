import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/v1/products')
      .then(response => {
        setProducts(response.data.data.products);
      })
      .catch(error => {
        console.error('Error fetching products', error);
      });
  }, []);

  const addToCart = (product_id) => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/v1/cart/add', { product_id, quantity: 1 }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      toast.success('Added to cart');
    })
    .catch(error => {
      console.error('Error adding to cart', error);
      toast.error('Error adding to cart');
    });
  };

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map(product => (
          <li key={product.product_id}>
            {product.description} - ${product.price}
            <button onClick={() => addToCart(product.product_id)}>Add to Cart</button>
          </li>
        ))}
      </ul>
      <Link to="/cart">View Cart</Link>
    </div>
  );
};

export default ProductList;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox } from 'react-icons/md';
import Header from '../components/Header';
import SearchBar from '../components/HomeComponents/SearchBar';
import ProductCard from '../components/HomeComponents/ProductCard';
import ProductTable from '../components/HomeComponents/ProductTable';
import Pagination from '../components/HomeComponents/Pagination';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchId, setSearchId] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [isTableView, setIsTableView] = useState(false);
  const limit = 10; 

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setRole(userRole);
    fetchProducts();

    // Only fetch cart items if the user is not an admin
    if (userRole !== 'admin') {
      fetchCartItems();
    }
  }, [currentPage]);

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(`http://localhost:5001/api/v1/products?page=${currentPage}&limit=${limit}`)
      .then((response) => {
        setProducts(response.data.data.products);
        setTotalPages(response.data.data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const fetchCartItems = () => {
    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:5001/api/v1/carts/view', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCartItems(response.data.data);
      })
      .catch((error) => {
        console.log('Error fetching cart items', error);
      });
  };

  const handleAddToCart = (productId) => {
    const token = localStorage.getItem('token');
    axios
      .post(
        'http://localhost:5001/api/v1/carts/add',
        { cart_type: "primary", product_id: productId, quantity: 1 }, // Default quantity to 1
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        console.log('Product added to cart:', response.data);
        fetchCartItems();
      })
      .catch((error) => {
        console.log('Error adding product to cart:', error);
      });
  };

  const handleRemoveFromCart = (productId) => {
    const token = localStorage.getItem('token');
    axios
      .delete(`http://localhost:5001/api/v1/carts/delete/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log('Product removed from cart:', response.data);
        fetchCartItems();
      })
      .catch((error) => {
        console.log('Error removing product from cart:', error);
      });
  };

  const handleCartToggle = (productId) => {
    if (isInCart(productId)) {
      handleRemoveFromCart(productId);
    } else {
      handleAddToCart(productId);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    if (searchId.trim() === '') {
      fetchProducts();
      return;
    } else if (isNaN(searchId)) {
      setError('Valid Product ID should be numeric');
      return;
    }
    setLoading(true);
    axios
      .get(`http://localhost:5001/api/v1/products/${searchId}`)
      .then((response) => {
        if (response.data.data.product) {
          setProducts([response.data.data.product]);
          setTotalPages(1);
          setError('');
        } else {
          setProducts([]);
          setError('No records found with that ID. Click on cancel to view the full list again.');
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setProducts([]);
        setError('No records found with that ID. Click on cancel to view the full list again.');
      });
  };

  const handleCancelSearch = () => {
    setSearchId('');
    setCurrentPage(1);
    fetchProducts();
    setError('');
  };

  const isInCart = (productId) => {
    return cartItems.some((item) => item.product_id === productId);
  };

  return (
    <>
      <Header />
      <div className='p-4'>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl my-8">Products List</h1>
          {role !== 'customer' && (
            <Link to='/products/create'>
              <MdOutlineAddBox className='text-sky-800 text-4xl' />
            </Link>
          )}
        </div>
        <SearchBar
          searchId={searchId}
          setSearchId={setSearchId}
          handleSearch={handleSearch}
          handleCancelSearch={handleCancelSearch}
        />
        {error && <p className="text-red-500">{error}</p>}
        <button 
          onClick={() => setIsTableView(!isTableView)}
          className="bg-slate-800 text-white px-4 py-2 rounded mt-4"
        >
          Toggle to {isTableView ? 'Card View' : 'Table View'}
        </button>

        {loading ? (
          <Spinner />
        ) : isTableView ? (
          <>
            <ProductTable
              products={products}
              currentPage={currentPage}
              limit={limit}
              role={role}
              handleCartToggle={handleCartToggle}
              isInCart={isInCart}
            />
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
            />
          </>
        ) : (
          <>
            <ProductCard
              products={products}
              currentPage={currentPage}
              limit={limit}
              role={role}
              handleCartToggle={handleCartToggle}
              isInCart={isInCart}
            />
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Home;

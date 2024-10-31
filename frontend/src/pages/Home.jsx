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
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [isTableView, setIsTableView] = useState(false);
  const limit = 12; //i like the 4 * 3 aesthetic
  const [isSearching, setIsSearching] = useState(false);

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
    if (!isSearching){
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
    } else {
      axios
      .get(`http://localhost:5001/api/v1/products/search/${searchTerm}?page=${currentPage}&limit=${limit}`)
      .then((response) => { 
          // Handle search by term (paginated response)
          setLoading(false);
          const { products, totalPages, currentPage: responsePage } = response.data.data;
          if (products && products.length > 0) {
            setProducts(products);
            setTotalPages(totalPages);
            setCurrentPage(responsePage); // Update the current page to match the response
            setError('');
          } else {
            setProducts([]);
            setError('No other records found with that term. Click on cancel to view the full list again.');
          }
        })
        .catch((error) => {
          console.error('Error during search:', error);
          setLoading(false);
          setProducts([]);
          setError('No records found with that term. Click on cancel to view the full list again.');
        });
      }
  };


  const fetchCartItems = () => {
    const token = localStorage.getItem('token');
<<<<<<< HEAD
      // Check if token exists and is valid
    if (!token || await isTokenExpired(token)) {
      //toast.error('Session expired. Please log in again.');
      localStorage.removeItem('token'); // Clear expired token
      // Redirect to login page if needed
      return;
    }
=======
>>>>>>> parent of 0d13e67 (handling token expiry and logged out scenario)
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

  // Update handlePageChange to trigger the correct function
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Call fetchProducts and handleSearch in useEffect based on currentPage changes
  useEffect(() => {
      fetchProducts(); // Fetch regular products if no search is active
  }, [currentPage, isSearching]);//dependency array need not have issearching, fetchproducts handles it


  const handleSearch = () => { //careful, not idempotent
    const trimmedSearchTerm = searchTerm.trim(); // Trim the search term directly
    if (trimmedSearchTerm === '') {
      setError('Enter a value');
      return;
    } 
    
    if (/^[a-zA-Z0-9]*$/.test(trimmedSearchTerm) === false) {
      setError('Search term should be alphanumeric');
      return;
    }

    setLoading(true);
    setIsSearching(true);
    setCurrentPage(1); 
    const isNumericSearch = !isNaN(parseFloat(trimmedSearchTerm)) && isFinite(trimmedSearchTerm);
    console.log(`isNumericSearch: ${isNumericSearch}`)
    const searchUrl = !isNumericSearch
      ? `http://localhost:5001/api/v1/products/search/${trimmedSearchTerm}?page=${currentPage}&limit=${limit}`
      : `http://localhost:5001/api/v1/products/${trimmedSearchTerm}`;
    console.log(`searchUrl: ${searchUrl}`)

    axios
      .get(searchUrl)
      .then((response) => {  
        if (!isNumericSearch) {
          // Handle search by term (paginated response)
          const { products, totalPages, currentPage: responsePage } = response.data.data;
  
          if (products && products.length > 0) {
            setProducts(products);
            setTotalPages(totalPages);
            setCurrentPage(responsePage); // Update the current page to match the response
            setError('');
          } else {
            setProducts([]);
            setError('No records found with that term. Click on cancel to view the full list again.');
          }
        } else {
          // Handle search by ID
          const product = response.data;
  
          if (product && product.product_id) {
            setProducts([product]);
            setTotalPages(1);
            setError('');
          } else {
            setProducts([]);
            setError('No records found with that ID. Click on cancel to view the full list again.');
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error during search:', error);
        setLoading(false);
        setProducts([]);
        setError('No records found with that term. Click on cancel to view the full list again.');
      });
  };
  

  const handleCancelSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    setIsSearching(false); // Reset search state
    //fetchProducts();
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
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
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

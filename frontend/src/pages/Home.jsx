import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { fetchUserStatus } from '../api/authApi'; // Import fetchUserStatus
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox } from 'react-icons/md';
import Header from '../components/Header';
import SearchBar from '../components/HomeComponents/SearchBar';
import ProductCard from '../components/HomeComponents/ProductCard';
import ProductTable from '../components/HomeComponents/ProductTable';
import Pagination from '../components/HomeComponents/Pagination';
import { toast } from 'react-toastify';

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
    const fetchRoleAndCart = async () => {
      const user = await fetchUserStatus(); // Fetch user status
      if (user) {
        setRole(user.role); // Update role
        if (user.role !== 'admin') {
          fetchCartItems(); // Fetch cart items for non-admin users
        }
      } else {
        toast.error('Failed to fetch user status.');
      }
    };
    fetchRoleAndCart();
    fetchProducts();
  }, []);

  // Update handlePageChange to trigger the correct function
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = (isSearch = isSearching) => {
    setLoading(true);
  
    const endpoint = isSearch
      ? `/products/search/${searchTerm}?page=${currentPage}&limit=${limit}`
      : `/products?page=${currentPage}&limit=${limit}`;
  
    axiosInstance
      .get(endpoint)
      .then((response) => {
        const { products, totalPages, currentPage: responsePage } = response.data.data;
        setProducts(products || []);
        setTotalPages(totalPages || 1);
        setCurrentPage(responsePage || 1);
        setError('');
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
        setError('Failed to fetch products.');
      });
  };
  

  const fetchCartItems = () => {
    axiosInstance
      .get('/carts/view')
      .then((response) => {
        setCartItems(response.data.data || []);
      })
      .catch((error) => {
        console.error('Error fetching cart items:', error);
        toast.error('Please log in for the best experience.');
      });
  };

  const handleAddToCart = (productId) => {
    axiosInstance
      .post('/carts/add', { cart_type: 'primary', product_id: productId, quantity: 1 })
      .then(() => {
        fetchCartItems();
        toast.success('Product added to cart!');
      })
      .catch((error) => {
        console.error('Error adding product to cart:', error);
        toast.error('Failed to add product to cart.');
      });
  };

  const handleRemoveFromCart = (productId) => {
    axiosInstance
      .delete(`/carts/delete/${productId}`)
      .then(() => {
        fetchCartItems();
        toast.success('Product removed from cart!');
      })
      .catch((error) => {
        console.error('Error removing product from cart:', error);
        toast.error('Failed to remove product from cart.');
      });
  };

  const handleCartToggle = (productId) => {
    if (isInCart(productId)) {
      handleRemoveFromCart(productId);
    } else {
      handleAddToCart(productId);
    }
  };

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm === '') {
      setError('Enter a value');
      return;
    }
    if (!/^[a-zA-Z0-9]*$/.test(trimmedSearchTerm)) {
      setError('Search term should be alphanumeric');
      return;
    }

    setLoading(true);
    setIsSearching(true);
    setCurrentPage(1);
    const isNumericSearch = !isNaN(parseFloat(trimmedSearchTerm)) && isFinite(trimmedSearchTerm);
    const searchUrl = !isNumericSearch
      ? `/products/search/${trimmedSearchTerm}?page=${currentPage}&limit=${limit}`
      : `/products/${trimmedSearchTerm}`;

    axiosInstance
      .get(searchUrl)
      .then((response) => {
        if (!isNumericSearch) {
          const { products, totalPages, currentPage: responsePage } = response.data.data;
          if (products && products.length > 0) {
            setProducts(products);
            setTotalPages(totalPages);
            setCurrentPage(responsePage);
            setError('');
          } else {
            setProducts([]);
            setError('No records found with that term. Click on cancel to view the full list again.');
          }
        } else {
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
    setError('');
    fetchProducts(false); // Pass false to explicitly fetch all products
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

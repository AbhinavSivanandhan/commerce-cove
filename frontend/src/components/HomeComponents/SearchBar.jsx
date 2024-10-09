import React from 'react';

const SearchBar = ({ searchTerm, setSearchTerm, handleSearch, handleCancelSearch }) => {
  return (
    <div className="flex mb-4">
      <input
        type="text"
        placeholder="Enter Product Name/ID"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border border-gray-300 rounded px-4 py-2 mr-2"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        Search
      </button>
      <button
        onClick={handleCancelSearch}
        className="bg-gray-500 text-white px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  );
};

export default SearchBar;

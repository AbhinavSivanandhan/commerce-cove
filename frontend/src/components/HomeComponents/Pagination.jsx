import React from 'react';

const Pagination = ({ totalPages, currentPage, handlePageChange }) => {
  const getPaginationButtons = () => {
    const buttons = [];

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      buttons.push(1); // always show the first page

      if (currentPage > 3) {
        buttons.push('...');
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i);
      }

      if (currentPage < totalPages - 2) {
        buttons.push('...');
      }

      buttons.push(totalPages); // always show the last page
    }

    return buttons;
  };

  return (
    <div className='flex justify-center mt-4'>
      {getPaginationButtons().map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className='px-3 py-1 mx-1'>
            ...
          </span>
        ) : (
          <button
            key={`page-${page}`}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 mx-1 ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {page}
          </button>
        )
      )}
    </div>
  );
};

export default Pagination;

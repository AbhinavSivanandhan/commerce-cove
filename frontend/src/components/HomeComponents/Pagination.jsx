import React from 'react';

const Pagination = ({ totalPages, currentPage, handlePageChange }) => {
  const getPaginationButtons = () => {
    const buttons = [];
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (currentPage > 2) {
        buttons.push(1, '...');
      }
      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
        buttons.push(i);
      }
      if (currentPage < totalPages - 1) {
        buttons.push('...', totalPages);
      }
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

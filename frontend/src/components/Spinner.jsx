import React from 'react';

const Spinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="animate-spin w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full"></div>
    </div>
  );
};

export default Spinner;

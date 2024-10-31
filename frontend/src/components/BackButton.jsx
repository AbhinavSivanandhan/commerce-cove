import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsArrowLeft } from 'react-icons/bs';

const BackButton = ({ text = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className='flex'>
      <button 
        onClick={handleBack}
        className='bg-sky-100 text-slate-700 px-4 py-1 rounded-lg flex items-center w-fit'
      >
        <BsArrowLeft className='text-2xl mr-3' />
        {text && <span className="text-lg">{text}</span>}
      </button>
    </div>
  );
};

export default BackButton;

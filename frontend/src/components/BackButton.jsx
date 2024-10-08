import React from 'react'
import { Link } from 'react-router-dom'
import { BsArrowLeft } from 'react-icons/bs'
const BackButton = ({destination='/', text = ''}) => {
  return (
    <div className='flex'>
      <Link 
      to={destination}
      className='bg-sky-100 text-slate-700 px-4 py-1 rounded-lg flex items-center w-fit'
      >
        <BsArrowLeft className='text-2xl mr-3'/>{text && <span className="text-lg">{text}</span>}
        
      </Link>
    </div>
  )
}

export default BackButton

import React from 'react';

const CartSummary = ({ total, codChecked, onCODToggle, onCheckoutClick }) => {
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold">Total: ${total.toFixed(2)}</h2>
      <div className="flex items-center mt-4">
        <input type="checkbox" id="codCheckbox" checked={codChecked} onChange={onCODToggle} className="mr-2" />
        <label htmlFor="codCheckbox">Cash on Delivery</label>
      </div>
      <button onClick={onCheckoutClick} disabled={!codChecked} className={`mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${!codChecked && 'opacity-50 cursor-not-allowed'}`}>
        Checkout ${total.toFixed(2)}
      </button>
      <button onClick={onCheckoutClick} disabled={codChecked} className={`mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${codChecked && 'opacity-50 cursor-not-allowed'}`}>
        Pay ${total.toFixed(2)}
      </button>
    </div>
  );
};

export default CartSummary;

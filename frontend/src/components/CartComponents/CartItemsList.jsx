import React from 'react';

const CartItemsList = ({ cartItems, onQuantityChange, onDelete }) => {
  return (
    <ul className="space-y-4">
      {cartItems.map(item => (
        <li key={item.product_id} className="p-4 border rounded shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{item.description}</h2>
            <p className="text-gray-600">${item.price} x {item.quantity}</p>
            {item.instock ? (
              <select value={item.quantity} onChange={(e) => onQuantityChange(item.product_id, e.target.value)} className="border border-gray-300 rounded p-1">
                {[...Array(10).keys()].map(i => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            ) : (
              <p className="text-red-600">(Out of Stock)</p>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            <button onClick={() => onDelete(item.product_id)} className="ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CartItemsList;

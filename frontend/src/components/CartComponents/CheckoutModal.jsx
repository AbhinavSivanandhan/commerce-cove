import React from 'react';
import { APILoader, PlacePicker } from '@googlemaps/extended-component-library/react';

const CheckoutModal = ({ showModal, address, setAddress, contact_details, setContactDetails, confirm_check, setConfirmCheck, onSubmit, onCancel }) => {
  if (!showModal) return null;

  const [formattedAddress, setFormattedAddress] = React.useState('');

  const handlePlaceChange = (e) => {
    // Log the place object to understand its structure
    setAddress(e.target.value?.formattedAddress ?? '');
    console.log(address);
    // Attempt to access the formatted address, or fall back to a default
    //const selectedPlace = place?.formattedAddress || place?.place?.formatted_address || 'default';
    //setFormattedAddress(selectedPlace);
    // setAddress(selectedPlace);
  };

  // Define countries array if you intend to limit the search
  const countries = [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Checkout</h2>
        <APILoader apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} solutionChannel="GMP_GCC_placepicker_v1" />
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Address</label>
            <PlacePicker
              country={countries}
              className="border border-gray-300 rounded px-4 py-2 w-full"
              placeholder="Enter a place to see its address"
              onPlaceChange={handlePlaceChange}
              required
            />
            {formattedAddress && (
              <div className="text-sm text-gray-500 mt-2">
                {formattedAddress}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Contact Details</label>
            <input
              type="text"
              value={contact_details}
              onChange={(e) => setContactDetails(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Confirm that your details are correct:</label>
            <input
              type="checkbox"
              value={confirm_check}
              onChange={(e) => setConfirmCheck(!confirm_check)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;

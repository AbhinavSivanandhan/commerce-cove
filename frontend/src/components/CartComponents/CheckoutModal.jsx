import React from 'react';
import { APILoader, PlacePicker } from '@googlemaps/extended-component-library/react';

const CheckoutModal = ({ showModal, address, setAddress, contact_details, setContactDetails, confirm_check, setConfirmCheck, onSubmit, onCancel }) => {
  if (!showModal) return null;

  const [formattedAddress, setFormattedAddress] = React.useState('');
  const [useManualAddress, setUseManualAddress] = React.useState(false); // New state to track manual address entry

  const handlePlaceChange = (e) => {
    if (e.target?.value?.formattedAddress) {
      setFormattedAddress(e.target.value.formattedAddress);
      setAddress(e.target.value.formattedAddress);
    }
    console.log(address);
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

            {!useManualAddress ? (
              <>
                <PlacePicker
                  country={countries}
                  className="border border-gray-300 rounded px-4 py-2 w-full"
                  placeholder="Enter a place to see its address"
                  onPlaceChange={handlePlaceChange}
                  required={!useManualAddress} // PlacePicker is required only when manual entry is not selected
                />
                {formattedAddress && (
                  <div className="text-sm text-gray-500 mt-2">
                    {formattedAddress}
                  </div>
                )}
              </>
            ) : (
              <input
                type="text"
                className="border border-gray-300 rounded px-4 py-2 w-full"
                placeholder="Enter your address manually"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required={useManualAddress} // Manual address input required only when the fallback is used
              />
            )}

            <div className="mt-2">
              <label className="text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={useManualAddress}
                  onChange={() => setUseManualAddress(!useManualAddress)} // Toggle manual entry
                />
                Check this box to manually enter your address
              </label>
            </div>
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

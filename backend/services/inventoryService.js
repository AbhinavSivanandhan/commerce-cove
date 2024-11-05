// Mock Inventory (with infinite stock simulation)
const inventory = {}; 

export const checkInventory = (product_id, quantity) => {
  console.log(`Checking inventory for product ID: ${product_id}, Quantity: ${quantity}`);
  return true; // Always true for infinite stock
};

export const reserveItem = (product_id, quantity) => {
  console.log(`Reserved ${quantity} of ${product_id}`);
  return true;
};

export const releaseItem = (product_id, quantity) => {
  console.log(`Released ${quantity} of ${product_id}`);
};

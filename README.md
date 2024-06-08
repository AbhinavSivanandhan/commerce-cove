# CommerceCove

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Run the database setup: `node ./db/setupdb.js`
5. Start the server: `npm start`

## API Endpoints

### Accounts

- `POST /api/v1/accounts/register`: Register a new user
- `POST /api/v1/accounts/login`: Log in a user

### Products

- `GET /api/v1/products`: Get all products
- `GET /api/v1/products/:id`: Get a product by ID
- `POST /api/v1/products`: Create a new product (Admin only)
- `PUT /api/v1/products`: Update a product (Admin only)
- `DELETE /api/v1/products/:id`: Delete a product (Admin only)

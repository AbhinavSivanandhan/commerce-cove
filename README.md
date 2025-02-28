🛒 LLM-Powered Digital Marketplace with Priority-Based Checkout Queue
(Node.js, React, Next.js, TailwindCSS, Redis, RabbitMQ, PostgreSQL, S3, GCP, AWS EC2, Stripe, LangChain.js, Datastax, OpenAI, Winston, Node-cron, Nodemailer)

Developed and deployed a scalable, event-driven e-commerce platform with a microservices-based architecture, leveraging asynchronous processing and Redis caching for high performance. Implemented secure, stateless authentication and role-based access control(RBAC) using JWT and bcryptjs, along with custom rate limiting middleware, and S3 bucket-based static asset management via pre-signed URLs with upload quotas. Designed automated background workers using Node-cron for scheduled tasks and message queue consumers for order processing using RabbitMQ. Enabled transactional email notifications with Nodemailer. Enhanced product retrieval with an LLM-powered RAG chatbot built using Next.js, LangChain.js, Datastax, and OpenAI. Ensured scalability and observability with Winston logging and deployed to AWS EC2.

Project readme is pending proper update, below context is a summary of of notion based user stories and documentation I made for my personal use(sort of a light-weight Agile). 90% is accurate but I need to update the rest. Note that this is an ongoing hobbyist project. will be redeployed to https://the.commercecove.store/ using a better strategy than my current super-long manual configuration which I did just to learn. i.e, will switch to CI/CD pipline + github action and explore render/vercel offerings

# CommerceCove

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Run the database setup: `node ./db/setupdb.js`
5. Start the server: `npm start`

## API Endpoints

# API Routes

**Authentication & User Routes** – Manage user sign-up, sign-in, and profiles:

- **`POST /api/users` (Register)** – Accepts new user details (e.g. name, email, password) to create an account. Returns the created user’s info or a success message (often along with a session token or JWT).
- **`POST /api/session` (Login)** – Validates user credentials and starts a session. On success, returns an authentication token or sets a session cookie for the logged-in user .
- **`DELETE /api/session` (Logout)** – Ends the user’s session (clears the cookie) to log the user out .
- **`GET /api/users/:id`** – Retrieves profile info for the specified user (or the current user’s info if using their id) . Often used to fetch the current logged-in user’s details (for session restore).

**Product Routes** – Provide product catalog data to clients:

- **`GET /api/products`** – Returns a list of all products (typically in pages or with filters). Supports query parameters for searching or categorizing. Response is an array of product objects with basic details (name, price, thumbnail, etc.).
- **`GET /api/products/:id`** – Returns detailed information for a single product by ID. The response includes full product details (description, images, price, stock, etc.).
- **`POST /api/products`** – *(for admins or sellers)* Creates a new product listing. Expects product data in the request body (name, description, price, etc.) and returns the created product or a success status.
- **`PUT /api/products/:id`** – *(admins)* Updates an existing product’s information. Accepts fields to update in the JSON body and returns the updated product data.
- **`DELETE /api/products/:id`** – *(admins)* Deletes a product from the catalog (if the user has permission). Returns a success message or deleted status.

**Cart & Checkout Routes** – Handle the shopping cart and order processing:

- **`GET /api/cart`** – Retrieves the current shopping cart contents for the authenticated user. Returns a list of items (product IDs, names, quantities, prices) in the cart.
- **`POST /api/cart`** – Adds an item to the cart. Expects the product ID and quantity in the request body. Returns the updated cart contents or a confirmation.
- **`PATCH /api/cart/:itemId`** – Updates the quantity of a specific cart item (identified by itemId or productId). Returns the modified cart data.
- **`DELETE /api/cart/:itemId`** – Removes an item from the cart. Returns the remaining cart items after removal.
- **`POST /api/checkout`** – Initiates the checkout process for the current cart. Expects order details in the body (shipping address, payment token, etc.). This route orchestrates the payment through Stripe and the order creation. On success, it enqueues the order for processing (see RabbitMQ) and returns an order confirmation (order ID, status, receipt).
- **`GET /api/orders/:orderId`** – Retrieves the status or details of a placed order. Returns order info including items, total amount, payment status, and shipping status. Allows the frontend to check on the order progress (especially if queued for processing).

**LLM Search/Chatbot Routes** – Power the AI-driven product query feature:

- **`POST /api/chat`** – Allows users to ask product-related questions in natural language. Accepts a question in the request body. The backend uses the LLM RAG pipeline to fetch relevant product data and generate an answer. Returns a response containing the AI-generated answer (and possibly source info). For example, a query about “best laptop for gaming under $1000” would trigger this endpoint to retrieve relevant products and respond with a tailored recommendation.

**Other Routes** – Various supporting endpoints:

- **`GET /api/categories`** – Returns a list of product categories or tags to help filter products.
- **`GET /api/recommendations`** – *(being implemented)* Returns personalized or popular product recommendations (could leverage the LLM or past user behavior).
- **`POST /api/webhook/stripe`** – (to improve) Webhook endpoint for Stripe payment events. Stripe calls this route to notify about payment confirmations, which the backend uses to update order status (e.g., marking orders as paid or handling failures).
- **`GET /api/health`** – *(Utility)* A health-check endpoint returning OK status, used to verify the server is running. Auxiliary backend services like workers use this.

These routes form a RESTful API structure that allows the frontend to interact with users, products, and orders in the Commerce Cove marketplace. Each route is designed with clear request methods and expected inputs/outputs to ensure a smooth client<->server interaction.


# Middleware

The backend uses a series of Express middleware functions to handle cross-cutting concerns like security, logging, and session management. Key middleware includes:

- **Body Parsers**: `express.json()` and `express.urlencoded()` are used to parse incoming request bodies. JSON payloads (for API requests) and URL-encoded form submissions are automatically converted into `req.body` for easier handling ([list of middlewares in express](https://www.softpost.org/express/list-of-middlewares-in-express#:~:text=1.%20,object)). This allows the API to read JSON data (e.g. product details, user input) and form data without extra code.
- **CORS**: The **cors** middleware is enabled to allow the frontend (Next.js app) to call the backend API from a different origin. It sets the appropriate **Cross-Origin Resource Sharing** headers so that browsers permit the cross-domain requests. This is crucial since the React/Next frontend may be served on a different domain or port than the API ([list of middlewares in express](https://www.softpost.org/express/list-of-middlewares-in-express#:~:text=4.%20,middleware%20for%20logging%20request%20details)). By configuring CORS (allowed origins, headers, methods), the backend ensures secure and controlled access for the web app.
- **Helmet**: The app uses **Helmet** for security hardening. *“Helmet helps secure Express apps by setting various HTTP headers.”* ([list of middlewares in express](https://www.softpost.org/express/list-of-middlewares-in-express#:~:text=4.%20,middleware%20for%20logging%20request%20details)) This middleware adds security-related HTTP response headers (like `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, etc.) to mitigate common web vulnerabilities (XSS, clickjacking, MIME-sniffing, etc.) ([Helmet.js](https://helmetjs.github.io/#:~:text=Helmet%20helps%20secure%20Express%20apps,Express%20app%20that%20uses%20Helmet)). In short, Helmet locks down certain browser behaviors to protect the application and users.
- **Session Middleware**: For managing user login sessions, **express-session** is used in tandem with **connect-redis**. Instead of storing sessions in memory (which doesn’t scale), session data (user ID, login state) is stored in Redis. Express-session issues a session ID cookie to the client and saves session data in the Redis store ([Using Redis with Node.js — SitePoint](https://www.sitepoint.com/using-redis-node-js/#:~:text=So%2C%20what%E2%80%99s%20the%20solution%3F%20Well%2C,them%20when%20we%20need%20to)) ([Using Redis with Node.js — SitePoint](https://www.sitepoint.com/using-redis-node-js/#:~:text=So%2C%20what%E2%80%99s%20the%20solution%3F%20Well%2C,them%20when%20we%20need%20to)). On each request, this middleware checks the cookie and loads the session from Redis, allowing persistent login across requests. This approach improves scalability and reliability (as recommended, since the default memory store is not suitable for production) ([Using Redis with Node.js — SitePoint](https://www.sitepoint.com/using-redis-node-js/#:~:text=done%20by%20using%20global%20variables,session%60%20docs)).
- **Authentication Middleware**: Protected routes use a custom auth middleware that verifies the user’s identity. For example, a JWT-based middleware checks the `Authorization` header for a valid token, decodes it (using a library like jsonwebtoken), and ensures the user is authorized to access the endpoint. If using sessions, a middleware can check `req.session.user` exists. This middleware prevents unauthorized access to sensitive routes (like cart, checkout, order history).
- **Logging**: HTTP request logging is done using **morgan** (a popular logger). Morgan intercepts each incoming request and logs details like method, URL, status code, and response time to the console or a file. This is useful for debugging and monitoring API usage ([list of middlewares in express](https://www.softpost.org/express/list-of-middlewares-in-express#:~:text=4.%20,middleware%20for%20logging%20request%20details)). By reviewing these logs, developers can trace requests and identify issues in the request flow.
- **Error Handling**: A global error-handling middleware is defined (typically at the end of the middleware chain) to catch errors from all routes. This function takes `(err, req, res, next)` and will format an error response (JSON with error message and status code) instead of crashing the server. It helps in gracefully handling unexpected issues – for example, returning a 500 status with a JSON error if an exception occurs in a route.
- **Request Compression**: The **compression** middleware (built on zlib) may be used to gzip responses. By compressing JSON payloads and HTML, it reduces bandwidth and speeds up API responses to the client. This is particularly helpful for large data like product lists. (The client’s browser will decompress automatically.)
- **Static File Serving**:(to implement, verify, integrate with cache) The Express app uses`express.static()` for certain assets or to serve documentation. This middleware efficiently serves files (images, etc.) from a designated directory.
Rate-Limiting with Redis Middleware: To prevent abuse and excessive API calls, Commerce Cove employs rate-limiting middleware powered by Redis. This middleware tracks incoming requests per user (or IP) and enforces a request limit over a defined time window. For instance, if an endpoint allows 100 requests per minute, Redis stores a counter for each user/IP and increments it with every request. If the limit is exceeded, the server responds with a 429 Too Many Requests status. Since Redis operates in-memory with extremely low latency, this approach ensures real-time enforcement without significantly affecting API performance. Using Redis for rate-limiting helps mitigate spam, bot attacks, and excessive API load, ensuring fair resource allocation while maintaining a smooth experience for legitimate users.
- **Rate-Limiting with Redis Middleware**: To prevent abuse and excessive API calls, Commerce Cove employs **rate-limiting middleware** powered by Redis in the route-level. This middleware tracks incoming requests per user (or IP) and enforces a request limit over a defined time window. For instance, if an endpoint allows 100 requests per minute, Redis stores a counter for each user/IP and increments it with every request. If the limit is exceeded, the server responds with a `429 Too Many Requests` status. Since Redis operates in-memory with extremely low latency, this approach ensures real-time enforcement without significantly affecting API performance. Using Redis for rate-limiting helps **mitigate spam, bot attacks, and excessive API load**, ensuring fair resource allocation while maintaining a smooth experience for legitimate users.

Each middleware contributes to security, performance, or usability: Helmet and CORS fortify security, sessions/auth ensure request handling is user-aware, and logging and error handlers improve reliability and debuggability. Together, these middleware functions create a robust backend request pipeline that handles necessary preprocessing before the route logic executes.

# Package.json Dependencies

The **Commerce Cove** project is split into a backend API and a Next.js frontend, each with its own set of dependencies. Below is a breakdown of all packages listed in each package.json, along with a brief explanation of their role:

## Backend Dependencies

- **Express** – The web application framework used for the API server. It provides routing and middleware support to build the RESTful endpoints. All API routes and middleware are defined using Express.
- **dotenv** – Loads environment variables from a `.env` file into `process.env`. Used for managing config secrets (database URLs, API keys like Stripe or OpenAI keys) without hardcoding them.
- **cors** – Express middleware to enable Cross-Origin Resource Sharing. Allows the frontend app to call the API despite being on a different origin, by setting appropriate HTTP headers ([list of middlewares in express](https://www.softpost.org/express/list-of-middlewares-in-express#:~:text=5.%20,by%20setting%20various%20HTTP%20headers)).
- **helmet** – Security middleware that sets various HTTP headers to secure the app (prevents clickjacking, XSS, etc.) ([list of middlewares in express](https://www.softpost.org/express/list-of-middlewares-in-express#:~:text=4.%20,middleware%20for%20logging%20request%20details)). It’s a quick way to harden the Express server’s security. (verify if audit removed this, or i implemented alternative, check notion board)
- **morgan** – HTTP request logger for Express. Morgan prints each incoming request and its outcome (status, response time) to the console or a log file, which is invaluable for debugging and monitoring server activity.
- **express-session** – Session management library for Express. It allows storing user session data on the server (with a session ID cookie on the client). In Commerce Cove, it’s configured with Redis so sessions persist across server restarts and scale to multiple servers ([Using Redis with Node.js — SitePoint](https://www.sitepoint.com/using-redis-node-js/#:~:text=So%2C%20what%E2%80%99s%20the%20solution%3F%20Well%2C,them%20when%20we%20need%20to)).
- **connect-redis** – A Redis session store adapter for express-session. It connects Express sessions to a Redis instance, so session data (like user login state) is stored in the Redis cache instead of in-memory. This improves scalability and is essential for a distributed environment.
- **redis** – The Node.js Redis client, used to connect to the Redis in-memory data store. It is used for session storage and also for caching frequently accessed data to speed up responses. Redis’s use in session management and caching significantly improves performance and scalability ([Using Redis with Node.js — SitePoint](https://www.sitepoint.com/using-redis-node-js/#:~:text=What%20are%20common%20use%20cases,js%20applications)).
- **amqplib (RabbitMQ client)** – A library to interface with RabbitMQ from Node.js. Commerce Cove uses RabbitMQ for the **priority-based checkout queue**, and this package allows the backend to publish messages (orders) to RabbitMQ and subscribe/consume them for processing. It supports setting message priorities and handling queue interactions.
- **Stripe** – The Stripe Node.js SDK, used to integrate payment processing. This library provides convenient methods to create payment intents, handle customer payments, and respond to webhooks. In the checkout flow, the backend uses Stripe SDK to charge credit cards and create orders securely ([Stripe for Ecommerce | Payment Processing Platform](https://stripe.com/use-cases/ecommerce#:~:text=A%20complete%20payments%20platform%20for,ecommerce)).
- **OpenAI** – The official OpenAI Node SDK (or an HTTP client) to call OpenAI’s API. This is used by the LLM-powered chatbot feature to send the user’s query (augmented with context) to the OpenAI language model and retrieve the generated answer. The key is stored in an env variable for security.
- **LangChain** – *LangChain.js* library, which provides utilities for building LLM applications. In this project, LangChain is used to orchestrate the Retrieval-Augmented Generation workflow: it handles vector database queries, embedding generation, and assembling the prompt for the OpenAI API. This simplifies implementing the AI marketplace assistant, as LangChain has abstractions for the vector store and model calls ([记 · 在 AI 公司入职一个月的体验与感悟 | 愧怍](https://kuizuo.cn/blog/experience-of-an-ai-company#:~:text=%E5%9C%A8%E8%BF%99%E4%B8%AA%E5%BA%94%E7%94%A8%E5%BC%80%E5%8F%91%E4%B8%AD%EF%BC%8C%E5%80%9F%E9%89%B4%E4%BA%86%20ragbot,DB%E3%80%82)).
- **@datastax/astra-db** (or Cassandra driver) – The DataStax Astra DB (Cassandra) client library. This is used to connect to Astra DB, which serves as the vector database for storing product embeddings and possibly as a general database. The Astra DB (built on Cassandra) vector search capability powers the product information retrieval for the RAG bot ([记 · 在 AI 公司入职一个月的体验与感悟 | 愧怍](https://kuizuo.cn/blog/experience-of-an-ai-company#:~:text=%E5%9C%A8%E8%BF%99%E4%B8%AA%E5%BA%94%E7%94%A8%E5%BC%80%E5%8F%91%E4%B8%AD%EF%BC%8C%E5%80%9F%E9%89%B4%E4%BA%86%20ragbot,DB%E3%80%82)). In practice, when the user asks a question, the backend uses this client to query the vector store for relevant product docs.
- **Mongoose** (or other DB client, if applicable) – If Commerce Cove uses a separate primary database for e-commerce data (like MongoDB via Mongoose, or an SQL via Sequelize/Prisma), the corresponding ORM/driver would appear here. This library would handle CRUD operations for users, products, orders in the main database. *(If Astra DB is used for all data, a separate DB client might not exist.)*
- **bcrypt** – A library for hashing passwords. Used in the user registration flow to securely hash user passwords before saving to the database. On login, bcrypt compares the provided password with the stored hash. This ensures user passwords are never stored in plain text.
- **jsonwebtoken** – If the project uses JWT for auth (instead of or in addition to sessions), this library is used to sign and verify JWT tokens. It issues tokens on login and verifies them on protected routes, ensuring the integrity and authenticity of client requests.
- **multer** – Middleware for handling file uploads. If users or admins can upload product images or other files, Multer is used to parse multipart/form-data requests. It can directly stream uploads to AWS S3 as well.
- **AWS SDK (S3)** – The AWS SDK for JavaScript (v3) or a specific S3 client (`@aws-sdk/client-s3`). This is used to interact with Amazon S3 for file storage. For example, when a product image is uploaded, the backend uses this SDK to upload the file to an S3 bucket. S3 provides durable, scalable storage for these assets ([Amazon S3 FAQs - Cloud Object Storage - AWS](https://aws.amazon.com/s3/faqs/#:~:text=Q%3A%20What%20is%20Amazon%20S3%3F)).
- **nodemailer** – If order confirmation(edit required) emails or any user verification emails are sent, Nodemailer would be included to send SMTP emails (or integrated with AWS SES or similar). It would take order details and send an email receipt to the customer.

*(Dev dependencies like **nodemon** for auto-restarting during development, or build tools like **TypeScript** and linters(pending, verify, commit it with testing module, are also present but not listed above since the focus is on runtime packages.)*

## Frontend Dependencies

- **Next.js** – The React framework used for the front-end. It enables building the marketplace’s pages (home, product listings, product detail, cart, checkout) with SEO-friendly server-rendered content and client-side interactivity. Next.js powers the RAGbot UI, providing server-side rendering and routing.
- **React** – The core library for building the user interface. React is the foundation for the component-based UI in Commerce Cove. All pages and components (product cards, cart dropdown, etc.) are written as React components.
- **React DOM** – Companion to React, this is used for rendering React components to the DOM in the browser. It’s a standard dependency when using React (and comes with Next by default).
- **axios** (or **fetch API** in Next) – If axios is included, it’s used to make HTTP requests from the frontend to the backend API (for actions like fetching products or submitting orders). Axios is a promise-based HTTP client that makes it easy to call the Commerce Cove API endpoints and handle responses. (Next.js could also use the built-in `fetch` API, in which case axios may not appear.)
- **SWR / React Query** – *(pending completion)* These libraries help manage data fetching and caching on the frontend. For example, **SWR** (stale-while-revalidate) might be used to fetch product lists or user cart data and cache it on the client for a faster UI and offline support. They simplify handling loading states and revalidation of data.
- **UI Component Library** – Commerce Cove might use a UI toolkit like **Chakra UI**, **Material-UI (MUI)**, or **Ant Design** to speed up styling and theming. Such a library provides pre-built components (buttons, modals, form inputs) that ensure a consistent look and feel. If used, it would appear as a dependency (e.g. `@chakra-ui/react` or `@mui/material`).
- **Tailwind CSS** – *(If used instead of a component library)* A utility-first CSS framework for rapidly styling the application. Tailwind would let developers use predefined classes in JSX to style components. It requires configuration in Next but greatly speeds up custom UI development.
- **Stripe.js and React Stripe** – For handling payments on the frontend, **@stripe/stripe-js** and **@stripe/react-stripe-js** are likely included. Stripe.js securely handles credit card information in the browser and generates a token (or PaymentMethod id) so that sensitive details never touch the backend. The React Stripe library provides `<Elements>` and `<CardElement>` components to easily create credit card input forms in the checkout page. This way, the frontend collects payment info and sends only a secure token to the backend for charging ([Stripe for Ecommerce | Payment Processing Platform](https://stripe.com/use-cases/ecommerce#:~:text=A%20complete%20payments%20platform%20for,ecommerce)).
- **NextAuth** – *(If authentication is managed on the frontend)* NextAuth could be used to handle OAuth or session-based auth in Next.js. However, since the backend has its own auth routes, the frontend might simply use cookies or tokens without NextAuth. If present, NextAuth would simplify managing the user session on the client side and across SSR.
- **Map/Geo libraries** – If the app features geolocation (e.g. showing user location or map), libraries like **Google Maps API** or **leaflet** might be included. For example, the Google Maps JavaScript API library would allow embedding a map or auto-completing addresses in the UI. This would complement the geolocation feature by providing interactive location selection or display.
- **React Hook Form / Formik** – Libraries to manage form state and validation could be used for forms like registration, login, shipping address in checkout. They make it easier to build robust forms with validation feedback.
- **Lodash** – A utility library that might be used for convenience functions (like debouncing a search input, deep-cloning objects, etc.).
- **Day.js or Moment.js** (not yet in backlog, no requirement?)– If the project displays or processes dates (order dates, delivery estimates), a date library helps format and manipulate dates easily.
- **Jest / React Testing Library** (in progress)– (Dev dependency) for writing unit or integration tests for the front-end components and pages. Not used in production, but ensures code quality.

Each front-end package serves to create a rich, responsive user experience: Next/React for the core UI, styling or UI kits for design, libraries like Stripe for safe payment UI, and others to enhance development velocity and app reliability. Together, these dependencies enable the Commerce Cove frontend to seamlessly interact with the backend and provide a smooth shopping experience to users.

Deployment Process Summary (Super long configuration, just to learn. I'm porting code to better deployment strategy currently using a CI/CD pipeline)
1. Setting up AWS EC2 Instance
Launched t2.micro Ubuntu instance in North Virginia.
Created Key Pair (ccove-backend-kp.pem) and saved it locally.
Configured VPC & Security Group (commercecove-sg) allowing SSH, HTTP, and HTTPS.
2. Connecting to EC2 & Installing Dependencies
Connected via SSH using the key pair.
Updated and upgraded packages.
Installed Node.js v21 to match the local environment.
3. Deploying Backend Code
Used Rsync for efficient file transfer to EC2 (~/app).
Installed dependencies with npm install and started the backend (npm run dev).
4. Setting up PostgreSQL Database
Installed and started PostgreSQL.
Created Database (commercecove) and User (ccadmin) with appropriate privileges.
5. Running Backend as a Service
Configured Systemd (myapp.service) to keep the app running.
Enabled and started the service (sudo systemctl start myapp.service).
6. Configuring Reverse Proxy with Caddy
Installed Caddy and set up a reverse proxy to forward traffic from port 80 to 5000.
Restarted Caddy to apply changes.
7. Setting up Domain & SSL with AWS Route 53
Created a Hosted Zone and configured DNS settings via Namecheap.
Updated Route 53 with an A Record pointing to EC2’s Public IPv4.
Enabled SSL with Caddy (Let's Encrypt) for HTTPS support.
8. Automating Future Deployments
Used Rsync for syncing updates and restarted the service when needed.
Now, the backend is securely deployed, scalable, and accessible via HTTPS at:
🔗 https://buy.commercecove.store/api/v1/products 🚀
Similarly, frontend at 
https://the.commercecove.store/ (currently offline as I'm going to )

# commerce-cove ref links
https://medium.com/@aashisingh640/node-js-postgresql-create-database-if-it-doesnt-exist-1a93f38629ab

https://www.kaggle.com/datasets/carrie1/ecommerce-data?resource=download
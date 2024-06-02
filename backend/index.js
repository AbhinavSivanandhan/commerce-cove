import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db/index.js';
dotenv.config();
//database setup
import setupDatabase from './db/setupdb.js';

setupDatabase().then(() => {
    console.log('Database setup completed.');
    // Add additional code here if needed after the database setup is complete
}).catch(error => {
    console.error('Error setting up the database:', error);
});
//db initial setup


const app = express();

//Middlware
app.use(cors());
app.use(express.json()); //this will allow to read req.body

app.get('/',(request, response) => {
    console.log(request);
    return response.send('Welcome to CommerceCove');
});

//POST route to save a product
app.post('/api/v1/products', async(request, response)=>{
  try{
    const results = await db.query("INSERT INTO product (description, price, instock, seller_id, companyname) VALUES($1,$2,$3,$4,$5) returning *",[request.body.description,request.body.price,request.body.instock,request.body.seller_id,request.body.companyname]);
    console.log(results);
    response.status(200).json({
      status: "success",
      results: results.rows.length,
      data: {
        products: results.rows,
      },
    });
    } catch(err){
      console.log(err);
    }
})

//Put route to update a product
app.put('/api/v1/products', async (request, response) => {
  try {
    // Log the incoming request body
    console.log('Received request body:', request.body);

    // Extracting values from the request body
    const { description, price, instock, seller_id, companyname, product_id } = request.body;

    // Log the values to ensure they are being correctly extracted
    console.log('Updating product with values:', { description, price, instock, seller_id, companyname, product_id });

    // Execute the database query to update the product
    const results = await db.query(
      "UPDATE product SET description = $1, price = $2, instock = $3, seller_id = $4, companyname = $5 WHERE product_id = $6 RETURNING *;",
      [description, price, instock, seller_id, companyname, product_id]
    );

    // Log the results of the query
    console.log('Update results:', results);

    // Send the response back to the client
    response.status(200).json({
      status: "success",
      results: results.rows.length,
      data: {
        products: results.rows,
      },
    });
  } catch (err) {
    // Log any errors that occur
    console.error('Error updating product:', err);

    // Send an error response back to the client
    response.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

// app.put('/api/v1/products', async(request, response)=>{
//   try{
//     const results = await db.query("UPDATE product SET description = $1, price = $2, instock = $3, seller_id = $4, companyname = $5 WHERE product_id = $6 RETURNING *;",[request.body.desc,request.body.price,request.body.instock,request.body.seller_id,request.body.companyname,request.body.product_id]);//['Gaming Keyboard 2', 269.99, true, 3, 'PressJ']
//     console.log(results);
//     response.status(200).json({
//       status: "success",
//       results: results.rows.length,
//       data: {
//         products: results.rows,
//       },
//     });
//     } catch(err){
//       console.log(err);
//     }
// })

//Route to get all products
app.get('/api/v1/products', async(request, response)=>{
  try{
  const results = await db.query("select * from product");
  console.log(results);
  response.status(200).json({
    status: "success",
    results: results.rows.length,
    data: {
      products: results.rows,
    },
  });
  } catch(err){
    console.log(err);
  }
});

//Route to get one product
app.get('/api/v1/products/:id', async(request, response)=>{
  try{
  const results = await db.query("select * from product where product_id=$1",[request.params.id]);
  console.log(results);
  response.status(200).json({
    status: "success",
    results: results.rows.length,
    data: {
      products: results.rows,
    },
  });
  } catch(err){
    console.log(err);
  }
});

//Delete Product
app.delete('/api/v1/products/:id', async(request, response)=>{
  try{
  const results = await db.query("delete from product where product_id=$1 returning *",[request.params.id]);
  console.log(results);
  response.status(200).json({
    status: "success",
    results: results.rows.length,
    data: {
      products: results.rows,
    },
  });
  } catch(err){
    console.log(err);
  }
});

app.listen(process.env.PORT, () => {
    console.log(`App is listening to port:${process.env.PORT}`);
});

//connect to db in a try catch block
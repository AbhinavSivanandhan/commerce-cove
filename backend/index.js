import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
//database setup
import pkg from 'pg';
const { Client } = pkg;

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT;
const DEFAULT_DB = process.env.DEFAULT_DB;  // Default database to connect to

async function setupDatabase() {

    const client = new Client({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        port: DB_PORT,
        database: DEFAULT_DB,  // Use default database for initial connection
    });
    
    await client.connect();
    
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${DB_NAME}'`);
    
    if (res.rowCount === 0) {
        console.log(`${DB_NAME} database not found, creating it.`);
        // Switch connection to postgres database to create a new database
        await client.query(`CREATE DATABASE "${DB_NAME}";`);
        console.log(`created database ${DB_NAME}.`);
    } else {
        console.log(`${DB_NAME} database already exists.`);
    }
    
    await client.end();
}

setupDatabase();
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
app.post('/products', async(request, response)=>{
  //try catch block where try block validates posted data from request.body
  //create a variable using this request.body's infi
  //save it
})

//Route to get all books
app.get('/books', async(request, response)=>{
  //try catch block to await and find all books, else return error message
})

app.listen(process.env.PORT, () => {
    console.log(`App is listening to port:${process.env.PORT}`);
});

//connect to db in a try catch block
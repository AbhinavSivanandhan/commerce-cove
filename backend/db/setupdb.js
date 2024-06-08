import dotenv from 'dotenv';
dotenv.config();

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
    // Connect to the new database to create schemas
    const dbClient = new Client({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        port: DB_PORT,
        database: DB_NAME,  // Connect to the new database
    });

    await dbClient.connect();

    // Define the schemas
    const schemaQueries = `
    CREATE TABLE IF NOT EXISTS "product"(
        product_id SERIAL PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        inStock BOOLEAN NOT NULL,
        seller_id INT NOT NULL,
        companyname VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS account (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer', 'seller')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    await dbClient.query(schemaQueries);
    console.log("Schemas set up successfully.");

    await dbClient.end();
    //schemas end
}

export default setupDatabase;
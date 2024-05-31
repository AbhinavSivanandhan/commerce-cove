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
    CREATE TABLE IF NOT EXISTS product(
        product_id SERIAL PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        inStock BOOLEAN NOT NULL,
        seller_id INT NOT NULL,
        companyname VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS account(
        account_id SERIAL PRIMARY KEY, 
        description VARCHAR(255) NOT NULL,
        active BOOLEAN NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seller(
        seller_id SERIAL PRIMARY KEY,
        companyname VARCHAR(255) NOT NULL,
        account_id INT UNIQUE NOT NULL,
        FOREIGN KEY (account_id) REFERENCES account(account_id)
    );
    `;

    await dbClient.query(schemaQueries);
    console.log("Schemas set up successfully.");

    await dbClient.end();
    //schemas end
}

export default setupDatabase;
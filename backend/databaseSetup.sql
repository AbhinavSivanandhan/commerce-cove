CREATE DATABASE commercecove;

CREATE TABLE product(
    product_id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    inStock boolean NOT NULL,
    seller_id INT NOT NULL,
    companyname VARCHAR(255) NOT NULL
)
CREATE DATABASE commercecove;

CREATE TABLE product(
    product_id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    inStock boolean NOT NULL,
    seller_id INT NOT NULL,
    companyname VARCHAR(255) NOT NULL
)

CREATE TABLE user(
    user_id SERIAL PRIMARY KEY, 
    description VARCHAR(255) NOT NULL,
    active boolean NOT NULL
)

CREATE TABLE seller(
    seller_id SERIAL PRIMARY KEY,
    companyname VARCHAR(255) NOT NULL,
    user_id INT UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);
# Shopping Website with Admin Panel

## Introduction

This is an individual project for the course IERG4210 - Web Programming and Security at the Chinese University of Hong Kong.

This project aims to create a shopping website with optional membership system. An admin panel is also included for data management. PayPal APIs are used for payment processing.

## Demo

Sample Demo

Click [here](https://youtu.be/WZ5-fVwGYG4) to see the demo.

## Setup

### Requirements

Please install the following packages in order to make the app works:

1. GdImage (https://www.php.net/manual/en/image.installation.php)
2. Composer (https://getcomposer.org/download/), please make sure a vendor folder is created inside the admin folder
3. phpdotenv (https://github.com/vlucas/phpdotenv)

### Frontend (React App)

**Local Setup**

1. Inside the frontend folder, run `yarn install` to install the dependencies
2. `yarn start` to run the app on http://localhost:3000

**Production Setup**

1. Inside the frontend folder, place the files in the build folder into /var/www/html/
2. Config .htaccess and httpd.conf such that the web can be publicly accessed
3. Should be able to view the web on http://{YOUR-HOST}

### Backend (Admin Panel & Database)

1. Place the files in admin folder into /var/www/html/, and the cart.db in /var/www/
2. Set the permissions of the files and folders such that the app and the database can be accessed and modified (Follow tutorial 3)
3. Config the php.ini such that it allows at least 10 MB file upload
4. Should be able to use the admin panel on http://{YOUR-HOST}/admin.php

### IMPORTANT Remarks

As both frontend and backend use environment variables to load the base url for API calls or image links, so if you need to test in a different environment, remember to change the values in .env files such that the app can get the correct variables. For testing, you are suggested to change the production (PROD) variables. Also notice that the dotenv is loaded from "/var/www/html/", so please make sure the admin folder is placed correctly. Currently the environment is set to production.

### Users

Now we have 2 users in the database:
| email | password | is_admin |
|-----------------|----------|----------|
| admin@email.com | admin | 1 |
| john@email.com | john | 0 |

## Features

### Client

- [x] Navigation
- [x] View product details
- [x] View products by category
- [x] View/ Add product to/ Remove product from/ Update shopping cart (with dummy data)
- [x] View/ Add product to/ Remove product from/ Update shopping cart (with database)
- [x] Pagination
- [x] Store and retrieve shopping cart from localStorage
- [ ] Search products by keywords
- [x] Checkout & Payment

### Admin

- [x] View/ Add/ Delete/ Update product
- [x] View/ Add/ Delete/ Update category
- [x] Pagination for products

### Security

- [x] XSS defense
- React is XSS protected by default
- htmlspecialchars() is used for output data in PHP
- server and client side input and output sanitizations and validations
- [x] CSRF defense
- [x] SQL injection defense
- parameterized SQL statements

## Tech Stack

### Frontend

- React
- Material UI (MUI)
- Redux
- Typescript

### Backend

- PHP

### Database

- SQL

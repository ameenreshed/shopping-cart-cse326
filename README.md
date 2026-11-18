# Shopping Cart: Online Shopping Cart with Product Reviews
CSE326 Internet Programming, Section K4P26HB, Group 01.
Built with HTML, CSS and JavaScript only (no framework, no backend). Data is saved in the browser (localStorage).

## Run
Open `index.html` in a browser, or use the VS Code "Live Server" extension.

## Demo accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@shop.com | admin123 |
| Customer | user@shop.com | user123 |

Coupons: `SAVE10` (10%), `WELCOME5` (5%). Test card: `4242 4242 4242 4242`, expiry `12/30`, CVV any 3 digits.

## Features
- Catalogue with search, category, price and rating filters, sorting, wishlist
- Product page with image gallery (zoom, swipe), stock status and 5-star reviews (one per customer)
- Cart with quantity limits by stock, coupons, GST and shipping rules
- Checkout with validation (name, email, phone, address, PIN, card with Luhn check, expiry, CVV)
- My orders with a progress bar; account page
- Role based access: customer and admin
- Admin: dashboard, product CRUD with photo upload, order status, customers
- Light and dark theme, separate desktop and mobile layouts

## Project structure
```
index.html, product.html, wishlist.html, cart.html, checkout.html,
orders.html, account.html, login.html, register.html, 404.html
admin/        dashboard.html, products.html, orders.html, users.html
css/style.css One stylesheet (tokens, components, icons, desktop, tablet, mobile)
js/core.js    Shared engine: config, database, services, icons, helpers, layout
js/pages/     One script per page (index.js, product.js, cart.js, checkout.js, ...)
js/pages/admin/  dashboard.js, products.js, orders.js, users.js
assets/img/   Product pictures (p1.svg, p1b.svg, ...)
```

## Deploy
Push to GitHub, then Settings > Pages > Deploy from branch `main` / root.

## Limitations
Passwords are stored as plain text and role checks run in the browser (demo project). Payment is a mock. Data exists only in one browser.

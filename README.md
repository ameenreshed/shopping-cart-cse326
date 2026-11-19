#  - Online  with Product Reviews
CSE326 Internet Programming | Section K4P26HB | Group 01

## Run
Open `index.html` (no build step). Works from the file system, GitHub Pages or Vercel.

## Demo accounts
- Admin: admin@shop.com / admin123 | Customer: user@shop.com / user123
- Coupons: SAVE10 (10%), WELCOME5 (5%) | Test card: 4242 4242 4242 4242

## Separate responsive views
- css/base.css      shared design system (tokens, light/dark, components)
- css/desktop.css   laptop/desktop (>=769px): header search, category bar, filter sidebar, wide layouts
- css/tablet.css    tablet and below (<=1024px): collapsed grids and sidebars
- css/mobile.css    mobile app view (<=768px): app bar, bottom tab bar, bottom sheets, sticky action bars, card-style tables
js/core/layout.js renders a different shell for mobile (app bar + tab bar) and desktop (header + footer); the page reloads when crossing the breakpoint.

## Centralized
- js/config.js        brand, currency, GST, shipping, coupons, breakpoint, Font Awesome toggle, theme
- js/core/icons.js    every icon: Font Awesome class + inline SVG fallback (set CONFIG.useFA=false for SVG only)
- js/core/db.js       localStorage database + Auth, Prod, Cart, Rev, Ord, Wish services
- js/core/utils.js    helpers, validators, modal, toast, guards, image utils
- js/core/components.js product cards;  js/core/layout.js shells
- js/pages/*.js       one script per page (admin pages in js/pages/admin/)

## Pages
Store: index, product, wishlist, cart, checkout, orders, account, login, register, 404
Admin (admin/): dashboard, products (CRUD + images), orders, users
Images: seed SVG art in assets/img/; admins can upload photos or paste URLs.

## Notes
Data is stored in localStorage. Passwords are plain text for demo only. Payment is a mock.

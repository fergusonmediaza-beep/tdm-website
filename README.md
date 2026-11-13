# Township Development Model (TDM) website — staging

Static revamp of tdmza.co.za built from developer package v2.0. This repository is the **staging copy**, served by GitHub Pages for review and sign-off.

## Before production

- Remove `<meta name="robots" content="noindex, nofollow">` from every page. It is only there to keep the staging copy out of search engines.
- Add the EmailJS public key, service ID and template ID in `js/contact.js`.
- Server config, routes and redirects are handled by DevOps.

## Structure

- `*.html`: the site pages
- `css/styles.css`: all styles
- `js/`: page scripts (map, contact form, counters)
- `images/`: WebP assets

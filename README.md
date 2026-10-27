# Check In / Check Out Tracker

A small static website made with HTML, CSS and vanilla JavaScript.

## Features
- Enter a date, check-in time and check-out time.
- Calculates the duration immediately.
- Treats a check-out time earlier than check-in as the following day.
- Saves records in browser `localStorage`.
- Shows total hours and record count.
- Delete individual records or all records.
- Export records as CSV.

## Run locally
Open `index.html` in a modern browser.

## Host on Cloudflare Pages
1. Extract the ZIP.
2. In Cloudflare, open **Workers & Pages** and create a Pages project.
3. Upload the files as a static site (or connect a Git repository containing these files).
4. No build command is needed. Set the output directory to the folder containing `index.html` if prompted.

## Important storage note
This starter version saves records in the browser on the device where you use it. Cloudflare Pages hosts the website, but does not automatically store records in a shared database. Records won't automatically sync across browsers/devices and can be lost if browser site data is cleared. Export CSV backups regularly.

For shared, server-side storage across devices, connect the site to a Cloudflare Worker and D1 database, with suitable authentication and access controls.

## Duration example
5:30 PM to 9:00 PM = 3 hours 30 minutes.
5:30 PM to 9:30 PM = 4 hours.

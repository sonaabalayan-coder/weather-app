# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A minimal static weather-lookup site: a plain HTML/CSS/JS frontend backed by a single Netlify serverless function that proxies requests to weatherapi.com (keeping the API key server-side).

There is no build step, no bundler, no package.json, and no test suite — the frontend files are served as-is.

## Running locally

This is a Netlify Functions project, so the frontend and the `/api` proxy only work together via the Netlify CLI (opening `index.html` directly will not resolve `/.netlify/functions/weather`):

```bash
netlify dev
```

Requires `WEATHER_API_KEY` to be set (e.g. in a `.env` file, which is gitignored) — it's read by the function at `netlify/functions/weather.js` and used to call weatherapi.com.

## Architecture

- [index.html](index.html) — single page with a form (`#weather-form`, `#city-input`) and a `#result` output div.
- [script.js](script.js) — on form submit, calls `/.netlify/functions/weather?city=<city>` and renders the returned location/current-condition data into `#result`.
- [style.css](style.css) — styling for the card layout.
- [netlify/functions/weather.js](netlify/functions/weather.js) — the only backend logic. A Netlify Function (`exports.handler`) that reads `city` from the query string, calls `https://api.weatherapi.com/v1/current.json` with `WEATHER_API_KEY`, and returns the JSON response (or a `{ error }` body on failure). This indirection exists solely so the API key is never exposed to the browser.
- [netlify.toml](netlify.toml) — points Netlify at `netlify/functions` for functions and `.` as the publish directory.

The frontend expects the weatherapi.com response shape directly (e.g. `data.location.name`, `data.current.temp_c`, `data.current.condition.icon`) — the function does not reshape the payload, it passes it through.

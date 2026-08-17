# 🌧️ RainGuard

A responsive rain-monitoring web application that helps users check upcoming precipitation and configure browser-based rain alerts.

> **Portfolio project:** built as a lightweight frontend application with PWA support, Docker packaging, GitHub Actions CI, precise browser GPS coordinates, and Google Maps integration.

## ✨ Features

- 🔎 Search weather by city
- 📍 Use browser geolocation for the current location
- 🎯 Show precise latitude and longitude to 6 decimal places
- 📏 Display browser-reported GPS accuracy when available
- 🗺️ Open the detected coordinates directly in Google Maps
- 📋 Copy latitude/longitude coordinates
- 🌧️ View the next 6 hours of rain probability and precipitation
- 🚨 Configure a rain-alert threshold
- 🔔 Request browser notification permission
- 🔄 Refresh the forecast automatically every 15 minutes
- 📱 Responsive desktop/mobile UI
- 📲 PWA installable app shell
- 🐳 Production-style Nginx Docker image
- ✅ GitHub Actions validation and container smoke test
- 🔑 No API key required for the default Open-Meteo services

## 🧰 Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- Open-Meteo Forecast API
- Open-Meteo Geocoding API
- Browser Geolocation API
- Web Notifications API
- Google Maps URL integration
- Service Worker / Web App Manifest
- Docker + Nginx
- GitHub Actions

## 🚀 Run locally

### Option 1 — Node.js

```bash
npx serve .
```

### Option 2 — Python

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

> Browser geolocation and notifications work best on `localhost` or HTTPS.

## 🐳 Run with Docker

Build and run:

```bash
docker build -t rain-guard:local .
docker run --rm -p 8080:80 rain-guard:local
```

Or with Docker Compose:

```bash
docker compose up --build
```

Open `http://localhost:8080`.

The image uses Nginx Alpine and includes a container health check.

## 🔄 CI Pipeline

Every push to `main` and every pull request runs GitHub Actions to:

1. Check out the source
2. Validate the HTML
3. Validate JavaScript syntax
4. Build the Docker image
5. Start the container
6. Run an HTTP smoke test
7. Clean up the test container

Workflow: `.github/workflows/ci.yml`

## 📲 PWA

RainGuard includes a Web App Manifest and Service Worker for an installable application shell and basic offline caching of static assets. Weather data still requires network access.

## 📁 Project structure

```text
rain-guard/
├── .github/workflows/ci.yml
├── app.js
├── styles.css
├── index.html
├── manifest.webmanifest
├── sw.js
├── icon.svg
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── .gitignore
└── README.md
```

## 🔐 Security & privacy notes

- No API keys or secrets are stored in the repository.
- Precise location is requested only after the user chooses the location feature.
- Coordinates are displayed in the browser and passed to Google Maps only when the user clicks the map link.
- Browser notification permission is explicitly requested by the user.
- The application does not maintain a server-side location database.

## 🗺️ Roadmap

- Saved locations
- More granular alert scheduling
- Push notification service
- Automated deployment to a cloud platform
- Optional backend for scheduled server-side alerts
- Prometheus/Grafana observability for a backend service

## 📄 License

MIT

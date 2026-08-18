# 🌧️ RainGuard

A responsive, weather-aware rain monitoring application for checking current conditions, precipitation forecasts, wind flow, official India weather sources, route planning, and browser-based rain alerts.

> **Portfolio project:** lightweight frontend application with PWA support, Docker packaging, GitHub Actions CI, precise browser GPS coordinates, Google Maps integration, animated forecast/wind visualization, and official India weather-source access.

## ✨ Features

### 🌦️ Weather & Rain Monitoring

- 🔎 Search weather by city
- 📍 Use browser geolocation for the current location
- 🎯 Show precise latitude and longitude to 6 decimal places
- 📏 Display browser-reported GPS accuracy when available
- 🌡️ Current temperature, feels-like temperature and humidity
- 🌧️ Rain probability and precipitation for upcoming hours
- 💨 Wind speed, direction and gust information
- ☁️ Cloud cover, pressure, visibility, UV index and dew point
- ⚠️ Current severe-weather signals and warnings
- 🔄 Automatically refresh live forecast data

### ▶️ Forecast Animation & Wind Flow

- ▶️ Interactive forecast timeline with play/pause control
- ⏱️ Forecast time advances while animation is playing
- 🌬️ Animated India wind-direction flow visualization
- 🌀 Cyclone/vortex-style flow visualization
- 📊 Wind field generated from live forecast data
- 🗺️ Interactive weather-map style interface
- 🔄 Forecast animation status indicator clearly shows when playback is active

### 📏 Distance & Route Planning

- 📍 Current-location based route planning
- 🗺️ Destination/route workflow integrated with the weather map
- 🚗 Open Google Maps for turn-by-turn navigation
- 🌧️ Weather-aware planning using rain and wind layers before travelling
- 📏 Distance and route planning UI available from the weather explorer

### 🇮🇳 Official India Weather Sources

RainGuard provides a dedicated **India Weather Sources** section so official Indian forecast products are easy to access.

- 🇮🇳 **IMD / Mausam** — official India Meteorological Department forecasts, warnings, radar, satellite and cyclone information
- 📍 **RMC Chennai** — Regional Meteorological Centre Chennai forecasts and warnings for Tamil Nadu, Puducherry and Karaikal
- ⚡ **IMD District Nowcast** — district-wise nowcast and short-term weather warnings
- 🌀 **IMD Cyclone Information** — cyclone outlooks, bulletins, observed/forecast tracks and warnings
- 🇮🇳 **Bharat Forecast System (BharatFS)** — official IMD numerical weather prediction products
- 🗺️ **BharatFS State Products** — state-level BharatFS forecast products and parameters
- 📡 **RainViewer Radar** — precipitation radar visualization and movement tracking

### 🛰️ IMD/RMC Data Integration

- Official IMD/RMC snapshot support through `imd-data.json`
- District nowcast and warning bulletin matching for the selected location
- Visible source/update status in the UI
- Browser-safe fallback when direct IMD APIs reject browser requests
- BharatFS information displayed alongside the official-source links

> **Important:** IMD/BharatFS products are official forecast guidance. For safety-critical decisions, use the latest official IMD warnings and bulletins as the final authority.

### 🔔 Alerts & PWA

- 🚨 Configure a rain-alert threshold
- 🔔 Request browser notification permission
- 📱 Responsive desktop/mobile UI
- 📲 PWA installable application shell
- 💾 Service Worker caching for static assets

## 🧰 Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- Open-Meteo Forecast API
- Open-Meteo Geocoding API
- Browser Geolocation API
- Web Notifications API
- Google Maps URL integration
- Leaflet / interactive map components
- Canvas-based wind-flow animation
- IMD/RMC official-source integration
- Bharat Forecast System source integration
- Service Worker / Web App Manifest
- Docker + Nginx
- GitHub Actions

## 🔗 Official Weather Sources

- **IMD / Mausam:** https://mausam.imd.gov.in/
- **RMC Chennai:** https://mausam.imd.gov.in/chennai/
- **IMD District Nowcast:** https://mausam.imd.gov.in/responsive/districtWiseNowcastGIS.php
- **IMD Cyclone Information:** https://mausam.imd.gov.in/responsive/cycloneinformation.php
- **BharatFS Products:** https://nwp.imd.gov.in/bharatfsproducts00_all_mausam_ar.php
- **BharatFS State Products:** https://nwp.imd.gov.in/bharatfs_state_ar.php
- **RainViewer:** https://www.rainviewer.com/

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

RainGuard includes a Web App Manifest and Service Worker for an installable application shell and basic offline caching of static assets. Weather data and live forecast layers still require network access.

## 📁 Project structure

```text
rain-guard/
├── .github/workflows/ci.yml
├── index.html
├── app-v2.js
├── styles.css
├── weather-v2.css
├── windy-ui.css
├── windy-ui-fix.css
├── windy-ui-v5.js
├── flow-overlay.js
├── flow-overlay.css
├── weather-tools-fix.js
├── weather-tools-fix.css
├── india-forecast-label.js
├── imd-live.js
├── imd.css
├── imd-data.json
├── manifest.webmanifest
├── sw.js
├── icon.svg
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── .gitignore
└── README.md
```

## 🔐 Security & Privacy Notes

- No API keys or secrets are stored in the repository.
- Precise location is requested only after the user chooses the location feature.
- Coordinates are displayed in the browser and passed to Google Maps only when the user opens the map/directions workflow.
- Browser notification permission is explicitly requested by the user.
- The application does not maintain a server-side location database.
- Official weather-source links open in a new browser tab.

## 🗺️ Roadmap

- Saved locations
- Multi-stop route planning
- More granular alert scheduling
- Push notification service
- Automated deployment to a cloud platform
- Optional backend for scheduled server-side alerts
- Prometheus/Grafana observability for a backend service
- More official Indian weather-model integrations

## 📄 License

MIT

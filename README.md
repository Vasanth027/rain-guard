# 🌧️ RainGuard

A lightweight, responsive rain-monitoring web application that helps you check upcoming precipitation and configure browser-based rain alerts.

## Features

- Search weather by city
- Use browser geolocation for the current location
- View the next 6 hours of rain probability and precipitation
- Configure a rain alert threshold
- Request browser notification permission
- Refresh the forecast automatically every 15 minutes
- Responsive UI for desktop and mobile
- No API key required for the default Open-Meteo services

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Open-Meteo Forecast API
- Open-Meteo Geocoding API
- Browser Geolocation API
- Web Notifications API

## Run locally

This is a static web application. You can serve it with any local HTTP server.

### Python

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

### Node.js

```bash
npx serve .
```

## Project structure

```text
rain-guard/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Notes

- Geolocation and browser notifications require user permission.
- Browser notifications normally require a secure context such as HTTPS or localhost.
- Forecast values are supplied by Open-Meteo and may change as new weather data becomes available.

## Roadmap

- PWA installation support
- Docker image and container deployment
- GitHub Actions CI
- Weather-condition notification scheduling
- Saved locations
- Prometheus/Grafana integration for the service layer

## License

MIT

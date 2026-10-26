FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css weather-v2.css app-v2.js imd.css imd-live.js imd-data.json windy-ui.css windy-ui-fix.css windy-ui-v5.js flow-overlay.css flow-overlay.js india-forecast-label.js weather-tools-fix.css weather-tools-fix.js manifest.webmanifest icon.svg sw.js /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

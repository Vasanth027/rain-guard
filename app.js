const state = { lat: null, lon: null, city: '', threshold: 60 };
const $ = (id) => document.getElementById(id);
function setStatus(message) { $('status').textContent = message; }

function showCoordinates(lat, lon, accuracy = null) {
  state.lat = Number(lat); state.lon = Number(lon);
  const latitude = state.lat.toFixed(6); const longitude = state.lon.toFixed(6);
  $('latitude').textContent = latitude;
  $('longitude').textContent = longitude;
  $('locationAccuracy').textContent = accuracy ? `±${Math.round(accuracy)} m` : 'GPS location';
  renderFastMap(state.lat, state.lon);
}

function renderFastMap(lat, lon) {
  const map = $('locationMap');
  const query = `${lat.toFixed(6)},${lon.toFixed(6)}`;
  map.classList.remove('map-loading');
  map.innerHTML = `<iframe title="Google Maps location" loading="eager" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed"></iframe>`;
}

async function geocode(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url); if (!response.ok) throw new Error('Unable to search for the city.');
  const data = await response.json(); if (!data.results?.length) throw new Error('City not found.'); return data.results[0];
}

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Reverse geocoding failed');
    const data = await response.json(); const a = data.address || {};
    const locality = a.city || a.town || a.village || a.municipality || a.suburb || a.county;
    const region = a.state || '';
    return locality ? `${locality}${region ? `, ${region}` : ''}` : (data.display_name || 'My Exact Location');
  } catch (_) { return 'My Exact Location'; }
}

async function loadWeather(lat, lon, label, accuracy = null) {
  setStatus('Loading forecast…'); showCoordinates(lat, lon, accuracy);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,rain&forecast_days=2&timezone=auto`;
  const response = await fetch(url); if (!response.ok) throw new Error('Weather service is unavailable.');
  const data = await response.json(); state.city = label; render(data, label); setStatus(`Forecast loaded for ${label}.`); checkRainAlerts(data, label);
}

function render(data, label) {
  $('dashboard').classList.remove('hidden'); $('locationName').textContent = label;
  $('currentTemp').textContent = `${Math.round(data.current.temperature_2m)}°C`;
  $('currentSummary').textContent = `Humidity ${Math.round(data.current.relative_humidity_2m)}% • Wind ${Math.round(data.current.wind_speed_10m)} km/h`;
  const start = data.hourly.time.findIndex((t) => new Date(t) >= new Date(data.current.time)); const index = start < 0 ? 0 : start;
  const hours = data.hourly.time.slice(index, index + 6); const rain = data.hourly.precipitation_probability.slice(index, index + 6); const mm = data.hourly.precipitation.slice(index, index + 6);
  $('rainChance').textContent = `${Math.max(...rain, 0)}%`;
  $('updatedAt').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  $('hourly').innerHTML = hours.map((time, i) => `<div class="hour"><span class="time">${new Date(time).toLocaleTimeString([], { hour: 'numeric' })}</span><strong>🌧️ ${rain[i]}%</strong><span class="rain">${Number(mm[i]).toFixed(1)} mm</span></div>`).join('');
}

function checkRainAlerts(data, label) {
  const start = data.hourly.time.findIndex((t) => new Date(t) >= new Date(data.current.time)); const index = Math.max(0, start);
  const rain = data.hourly.precipitation_probability.slice(index, index + 3); const hit = rain.findIndex((value) => value >= state.threshold);
  if (hit >= 0) { const message = `Rain is likely in ${label} within the next ${hit + 1} hour${hit ? 's' : ''}. Probability is ${rain[hit]}%.`; setStatus(`⚠️ ${message}`); if ('Notification' in window && Notification.permission === 'granted') new Notification('🌧️ RainGuard Alert', { body: message }); }
}

$('searchBtn').addEventListener('click', async () => {
  const city = $('cityInput').value.trim(); if (!city) return setStatus('Enter a city name.');
  try { const result = await geocode(city); await loadWeather(result.latitude, result.longitude, `${result.name}, ${result.country}`); } catch (error) { setStatus(error.message); }
});
$('cityInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') $('searchBtn').click(); });

$('locationBtn').addEventListener('click', () => {
  if (!navigator.geolocation) return setStatus('Geolocation is not supported by this browser.');
  setStatus('Requesting your precise GPS location…');
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    try {
      showCoordinates(coords.latitude, coords.longitude, coords.accuracy);
      const place = await reverseGeocode(coords.latitude, coords.longitude); $('locationName').textContent = place;
      await loadWeather(coords.latitude, coords.longitude, place, coords.accuracy); $('locationName').textContent = place;
    } catch (error) { setStatus(error.message); }
  }, (error) => setStatus(error.code === 1 ? 'Location access was denied. Allow location permission and try again.' : 'Unable to get your GPS location. Try again.'), { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
});

$('mapsBtn').addEventListener('click', () => {
  if (state.lat === null || state.lon === null) return setStatus('Use your location first.');
  window.open(`https://www.google.com/maps/search/?api=1&query=${state.lat.toFixed(6)},${state.lon.toFixed(6)}`, '_blank', 'noopener,noreferrer');
});

$('copyCoordinates').addEventListener('click', async () => {
  if (state.lat === null || state.lon === null) return setStatus('Use your location first.');
  const value = `${state.lat.toFixed(6)}, ${state.lon.toFixed(6)}`;
  try { if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value); else { const textArea = document.createElement('textarea'); textArea.value = value; textArea.setAttribute('readonly', ''); textArea.style.position = 'fixed'; textArea.style.opacity = '0'; document.body.appendChild(textArea); textArea.select(); document.execCommand('copy'); textArea.remove(); } setStatus(`✅ Coordinates copied: ${value}`); } catch (_) { setStatus(`Coordinates: ${value} — select and copy manually.`); }
});

$('threshold').addEventListener('input', (event) => { state.threshold = Number(event.target.value); $('thresholdValue').textContent = `${state.threshold}%`; });
$('notifyBtn').addEventListener('click', async () => { if (!('Notification' in window)) return setStatus('Browser notifications are not supported.'); const permission = await Notification.requestPermission(); setStatus(permission === 'granted' ? 'Notifications enabled.' : 'Notification permission was not granted.'); });
setInterval(async () => { if (state.lat !== null && state.lon !== null) { try { await loadWeather(state.lat, state.lon, state.city); } catch (_) {} } }, 15 * 60 * 1000);

const state = { lat: null, lon: null, city: '', threshold: 60 };
const $ = (id) => document.getElementById(id);
function setStatus(message) { $('status').textContent = message; }

function showCoordinates(lat, lon, accuracy = null) {
  state.lat = Number(lat); state.lon = Number(lon);
  $('latitude').textContent = state.lat.toFixed(6);
  $('longitude').textContent = state.lon.toFixed(6);
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
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,rain,weather_code&forecast_days=2&timezone=auto`;
  const response = await fetch(url); if (!response.ok) throw new Error('Weather service is unavailable.');
  const data = await response.json(); state.city = label; render(data, label); setStatus(`Forecast loaded for ${label}.`); checkRainAlerts(data, label);
}

function getCurrentHourIndex(data) {
  const current = new Date(data.current.time).getTime();
  let index = 0;
  for (let i = 0; i < data.hourly.time.length; i += 1) {
    if (new Date(data.hourly.time[i]).getTime() <= current) index = i;
    else break;
  }
  return index;
}

// Current rain is based on the current weather condition, not forecast probability alone.
function isRainWeatherCode(code) {
  return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(Number(code));
}

function render(data, label) {
  $('dashboard').classList.remove('hidden'); $('locationName').textContent = label;
  $('currentTemp').textContent = `${Math.round(data.current.temperature_2m)}°C`;
  $('currentSummary').textContent = `Humidity ${Math.round(data.current.relative_humidity_2m)}% • Wind ${Math.round(data.current.wind_speed_10m)} km/h`;

  const index = getCurrentHourIndex(data);
  const nextHourProbability = Number(data.hourly.precipitation_probability[index + 1] ?? data.hourly.precipitation_probability[index] ?? 0);
  const currentPrecipitation = Number(data.current.precipitation ?? 0);
  const currentRain = Number(data.current.rain ?? 0);
  const currentWeatherCode = Number(data.current.weather_code ?? data.hourly.weather_code?.[index] ?? 0);

  // Do not call it raining just because the model reports a tiny precipitation value.
  // Weather code must explicitly indicate rain/drizzle/freezing rain/storm precipitation.
  const rainingNow = isRainWeatherCode(currentWeatherCode) && (currentRain > 0 || currentPrecipitation > 0);

  $('rainChanceLabel').textContent = 'Rain now';
  $('rainChance').textContent = rainingNow ? 'YES' : '0%';
  $('nextHourChance').textContent = `Next hour: ${nextHourProbability}%`;
  $('currentRainStatus').textContent = rainingNow
    ? `🌧️ Rain is happening now • ${currentPrecipitation.toFixed(1)} mm`
    : `☀️ No rain right now • Next-hour forecast ${nextHourProbability}%`;
  $('updatedAt').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const hours = data.hourly.time.slice(index, index + 6);
  const rain = data.hourly.precipitation_probability.slice(index, index + 6);
  const mm = data.hourly.precipitation.slice(index, index + 6);
  $('hourly').innerHTML = hours.map((time, i) => `<div class="hour"><span class="time">${new Date(time).toLocaleTimeString([], { hour: 'numeric' })}</span><strong>🌧️ ${rain[i]}%</strong><span class="rain">${Number(mm[i]).toFixed(1)} mm</span></div>`).join('');
}

function checkRainAlerts(data, label) {
  const index = getCurrentHourIndex(data);
  const rain = data.hourly.precipitation_probability.slice(index + 1, index + 4);
  const hit = rain.findIndex((value) => Number(value) >= state.threshold);
  if (hit >= 0) {
    const hoursAway = hit + 1;
    const message = `Rain is likely in ${label} within the next ${hoursAway} hour${hoursAway > 1 ? 's' : ''}. Probability is ${rain[hit]}%.`;
    setStatus(`⚠️ ${message}`);
    if ('Notification' in window && Notification.permission === 'granted') new Notification('🌧️ RainGuard Alert', { body: message });
  }
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

const state = { lat: null, lon: null, city: '', threshold: 60, timer: null };

const $ = (id) => document.getElementById(id);

function setStatus(message) { $('status').textContent = message; }

async function geocode(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to search for the city.');
  const data = await response.json();
  if (!data.results?.length) throw new Error('City not found.');
  return data.results[0];
}

async function loadWeather(lat, lon, label) {
  setStatus('Loading forecast…');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,rain&forecast_days=2&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather service is unavailable.');
  const data = await response.json();
  state.lat = lat; state.lon = lon; state.city = label;
  render(data, label);
  setStatus(`Forecast loaded for ${label}.`);
  checkRainAlerts(data, label);
}

function render(data, label) {
  $('dashboard').classList.remove('hidden');
  $('locationName').textContent = label;
  $('currentTemp').textContent = `${Math.round(data.current.temperature_2m)}°C`;
  $('currentSummary').textContent = `Humidity ${Math.round(data.current.relative_humidity_2m)}% • Wind ${Math.round(data.current.wind_speed_10m)} km/h`;
  const start = data.hourly.time.findIndex((t) => new Date(t) >= new Date(data.current.time));
  const index = start < 0 ? 0 : start;
  const hours = data.hourly.time.slice(index, index + 6);
  const rain = data.hourly.precipitation_probability.slice(index, index + 6);
  const mm = data.hourly.precipitation.slice(index, index + 6);
  const maxRain = Math.max(...rain, 0);
  $('rainChance').textContent = `${maxRain}%`;
  $('updatedAt').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  $('hourly').innerHTML = hours.map((time, i) => `
    <div class="hour">
      <span class="time">${new Date(time).toLocaleTimeString([], { hour: 'numeric' })}</span>
      <strong>🌧️ ${rain[i]}%</strong>
      <span class="rain">${Number(mm[i]).toFixed(1)} mm</span>
    </div>`).join('');
}

function checkRainAlerts(data, label) {
  const start = data.hourly.time.findIndex((t) => new Date(t) >= new Date(data.current.time));
  const index = Math.max(0, start);
  const rain = data.hourly.precipitation_probability.slice(index, index + 3);
  const hit = rain.findIndex((value) => value >= state.threshold);
  if (hit >= 0) {
    const message = `Rain is likely in ${label} within the next ${hit + 1} hour${hit ? 's' : ''}. Probability is ${rain[hit]}%.`;
    setStatus(`⚠️ ${message}`);
    if ('Notification' in window && Notification.permission === 'granted') new Notification('🌧️ RainGuard Alert', { body: message });
  }
}

$('searchBtn').addEventListener('click', async () => {
  const city = $('cityInput').value.trim();
  if (!city) return setStatus('Enter a city name.');
  try { const result = await geocode(city); await loadWeather(result.latitude, result.longitude, `${result.name}, ${result.country}`); }
  catch (error) { setStatus(error.message); }
});

$('cityInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') $('searchBtn').click(); });

$('locationBtn').addEventListener('click', () => {
  if (!navigator.geolocation) return setStatus('Geolocation is not supported by this browser.');
  setStatus('Requesting your location…');
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    try { await loadWeather(coords.latitude, coords.longitude, 'My Location'); }
    catch (error) { setStatus(error.message); }
  }, () => setStatus('Location access was denied. Search for a city instead.'), { enableHighAccuracy: true, timeout: 10000 });
});

$('threshold').addEventListener('input', (event) => {
  state.threshold = Number(event.target.value);
  $('thresholdValue').textContent = `${state.threshold}%`;
});

$('notifyBtn').addEventListener('click', async () => {
  if (!('Notification' in window)) return setStatus('Browser notifications are not supported.');
  const permission = await Notification.requestPermission();
  setStatus(permission === 'granted' ? 'Notifications enabled.' : 'Notification permission was not granted.');
});

setInterval(async () => {
  if (state.lat !== null && state.lon !== null) {
    try { await loadWeather(state.lat, state.lon, state.city); } catch (_) { /* keep last successful forecast */ }
  }
}, 15 * 60 * 1000);

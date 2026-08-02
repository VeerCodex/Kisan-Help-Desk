/* weather.js — Real-Time Weather API Integration (Powered by Open-Meteo API) */

const DISTRICT_COORDS = {
  "delhi": { name: "Delhi / NCR", lat: 28.6139, lon: 77.2090 },
  "ludhiana": { name: "Ludhiana (Punjab)", lat: 30.9010, lon: 75.8573 },
  "karnal": { name: "Karnal (Haryana)", lat: 29.6857, lon: 76.9905 },
  "meerut": { name: "Meerut (Uttar Pradesh)", lat: 28.9845, lon: 77.7064 },
  "agra": { name: "Agra (Uttar Pradesh)", lat: 27.1767, lon: 78.0081 },
  "indore": { name: "Indore (Madhya Pradesh)", lat: 22.7196, lon: 75.8577 },
  "jaipur": { name: "Jaipur (Rajasthan)", lat: 26.9124, lon: 75.7873 },
  "patna": { name: "Patna (Bihar)", lat: 25.5941, lon: 85.1376 },
  "ahmedabad": { name: "Ahmedabad (Gujarat)", lat: 23.0225, lon: 72.5714 },
  "pune": { name: "Pune (Maharashtra)", lat: 18.5204, lon: 73.8567 }
};

const WEATHER_CODES = {
  0: { label: "Clear Sky", icon: "☀️" },
  1: { label: "Mainly Clear", icon: "🌤️" },
  2: { label: "Partly Cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Depositing Rime Fog", icon: "🌫️" },
  51: { label: "Light Drizzle", icon: "🌦️" },
  61: { label: "Slight Rain", icon: "🌧️" },
  63: { label: "Moderate Rain", icon: "🌧️" },
  65: { label: "Heavy Rain", icon: "🌧️" },
  80: { label: "Rain Showers", icon: "🌦️" },
  95: { label: "Thunderstorm", icon: "⛈️" }
};

document.addEventListener('DOMContentLoaded', () => {
  const districtSelect = document.getElementById('districtSelect');
  const detectBtn = document.getElementById('detectLocationBtn');

  if (districtSelect) {
    districtSelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (DISTRICT_COORDS[selected]) {
        const { lat, lon, name } = DISTRICT_COORDS[selected];
        fetchWeather(lat, lon, name);
      }
    });
  }

  if (detectBtn) {
    detectBtn.addEventListener('click', () => {
      if (navigator.geolocation) {
        detectBtn.textContent = 'Detecting...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            fetchWeather(latitude, longitude, "My Current Location");
            detectBtn.textContent = '📍 Location Detected';
          },
          (err) => {
            alert('Location access denied. Please select your district manually.');
            detectBtn.textContent = '📍 Detect My Location';
          }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
      }
    });
  }

  // Initial load default location (Delhi / NCR)
  fetchWeather(28.6139, 77.2090, "Delhi / NCR");
});

async function fetchWeather(lat, lon, locationName) {
  try {
    const locTitleEl = document.getElementById('locationTitle');
    if (locTitleEl) locTitleEl.textContent = locationName;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather');

    const data = await res.json();
    updateWeatherUI(data);

  } catch (err) {
    console.error('Weather API Error:', err);
  }
}

function updateWeatherUI(data) {
  const current = data.current;
  const daily = data.daily;

  if (!current) return;

  // Temperature
  const tempEl = document.getElementById('currentTemp');
  if (tempEl) tempEl.textContent = `${Math.round(current.temperature_2m)}°C`;

  // Condition
  const codeInfo = WEATHER_CODES[current.weather_code] || { label: "Clear", icon: "🌤️" };
  const condEl = document.getElementById('weatherCond');
  const iconEl = document.getElementById('weatherIcon');
  if (condEl) condEl.textContent = codeInfo.label;
  if (iconEl) iconEl.textContent = codeInfo.icon;

  // Humidity & Wind
  const humEl = document.getElementById('humidityVal');
  const windEl = document.getElementById('windVal');
  if (humEl) humEl.textContent = `${current.relative_humidity_2m}%`;
  if (windEl) windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;

  // 7-Day Forecast Grid
  const forecastGrid = document.getElementById('forecastGrid');
  if (forecastGrid && daily && daily.time) {
    let html = '';
    daily.time.forEach((timeStr, idx) => {
      const date = new Date(timeStr);
      const dayName = idx === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
      const maxTemp = Math.round(daily.temperature_2m_max[idx]);
      const minTemp = Math.round(daily.temperature_2m_min[idx]);
      const code = daily.weather_code[idx];
      const dayCodeInfo = WEATHER_CODES[code] || { label: "Clear", icon: "🌤️" };
      const rainProb = daily.precipitation_probability_max[idx] || 0;

      html += `
        <div class="forecast-card" style="background: white; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #edf2f7;">
          <div style="font-weight: 700; color: #1a4d2e; font-size: 0.95rem; margin-bottom: 6px;">${dayName}</div>
          <div style="font-size: 2rem; margin: 8px 0;">${dayCodeInfo.icon}</div>
          <div style="font-size: 0.82rem; color: #4a5568; margin-bottom: 6px;">${dayCodeInfo.label}</div>
          <div style="font-weight: 700; color: #2d3748;">${maxTemp}° <span style="color: #718096; font-weight: 500; font-size: 0.85rem;">/ ${minTemp}°</span></div>
          <div style="font-size: 0.78rem; color: #3182ce; margin-top: 6px;">🌧️ ${rainProb}% Rain</div>
        </div>
      `;
    });
    forecastGrid.innerHTML = html;
  }
}

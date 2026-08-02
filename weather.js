/* weather.js — Live Weather API & GPS Village Location Tracking (Powered by Open-Meteo & Reverse Geocoding) */

const INDIA_STATES_DISTRICTS = {
  punjab: { name: "Punjab", districts: {
    ludhiana: { name: "Ludhiana", lat: 30.9010, lon: 75.8573 },
    amritsar: { name: "Amritsar", lat: 31.6340, lon: 74.8723 },
    bathinda: { name: "Bathinda", lat: 30.2110, lon: 74.9455 },
    jalandhar: { name: "Jalandhar", lat: 31.3260, lon: 75.5762 },
    patiala: { name: "Patiala", lat: 30.3398, lon: 76.3869 },
    sangrur: { name: "Sangrur", lat: 30.2458, lon: 75.8421 },
    firozpur: { name: "Firozpur", lat: 30.9237, lon: 74.6114 }
  }},
  haryana: { name: "Haryana", districts: {
    karnal: { name: "Karnal", lat: 29.6857, lon: 76.9905 },
    hisar: { name: "Hisar", lat: 29.1492, lon: 75.7217 },
    ambala: { name: "Ambala", lat: 30.3782, lon: 76.7767 },
    rohtak: { name: "Rohtak", lat: 28.8955, lon: 76.6066 },
    sirsa: { name: "Sirsa", lat: 29.5321, lon: 75.0318 },
    kurukshetra: { name: "Kurukshetra", lat: 29.9695, lon: 76.8783 },
    sonipat: { name: "Sonipat", lat: 28.9931, lon: 77.0151 }
  }},
  up: { name: "Uttar Pradesh", districts: {
    meerut: { name: "Meerut", lat: 28.9845, lon: 77.7064 },
    agra: { name: "Agra", lat: 27.1767, lon: 78.0081 },
    kanpur: { name: "Kanpur", lat: 26.4499, lon: 80.3319 },
    lucknow: { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
    varanasi: { name: "Varanasi", lat: 25.3176, lon: 82.9739 },
    aligarh: { name: "Aligarh", lat: 27.8974, lon: 78.0880 },
    bareilly: { name: "Bareilly", lat: 28.3670, lon: 79.4304 },
    gorakhpur: { name: "Gorakhpur", lat: 26.7606, lon: 83.3732 },
    mathura: { name: "Mathura", lat: 27.4924, lon: 77.6737 },
    moradabad: { name: "Moradabad", lat: 28.8386, lon: 78.7733 }
  }},
  mp: { name: "Madhya Pradesh", districts: {
    indore: { name: "Indore", lat: 22.7196, lon: 75.8577 },
    ujjain: { name: "Ujjain", lat: 23.1765, lon: 75.7885 },
    bhopal: { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
    gwalior: { name: "Gwalior", lat: 26.2183, lon: 78.1828 },
    jabalpur: { name: "Jabalpur", lat: 23.1815, lon: 79.9864 },
    sagar: { name: "Sagar", lat: 23.8388, lon: 78.7378 }
  }},
  rajasthan: { name: "Rajasthan", districts: {
    jaipur: { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
    jodhpur: { name: "Jodhpur", lat: 26.2389, lon: 73.0243 },
    kota: { name: "Kota", lat: 25.2138, lon: 75.8648 },
    bikaner: { name: "Bikaner", lat: 28.0229, lon: 73.3119 },
    sriganganagar: { name: "Sri Ganganagar", lat: 29.9038, lon: 73.8772 },
    udaipur: { name: "Udaipur", lat: 24.5854, lon: 73.7125 }
  }},
  bihar: { name: "Bihar", districts: {
    patna: { name: "Patna", lat: 25.5941, lon: 85.1376 },
    gaya: { name: "Gaya", lat: 24.7914, lon: 85.0002 },
    muzaffarpur: { name: "Muzaffarpur", lat: 26.1209, lon: 85.3647 },
    bhagalpur: { name: "Bhagalpur", lat: 25.2425, lon: 87.0135 },
    darbhanga: { name: "Darbhanga", lat: 26.1542, lon: 85.8918 }
  }},
  maharashtra: { name: "Maharashtra", districts: {
    pune: { name: "Pune", lat: 18.5204, lon: 73.8567 },
    nashik: { name: "Nashik", lat: 19.9975, lon: 73.7898 },
    nagpur: { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
    aurangabad: { name: "Chhatrapati Sambhajinagar", lat: 19.8762, lon: 75.3433 },
    kolhapur: { name: "Kolhapur", lat: 16.7050, lon: 74.2433 },
    solapur: { name: "Solapur", lat: 17.6599, lon: 75.9064 }
  }},
  gujarat: { name: "Gujarat", districts: {
    ahmedabad: { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
    rajkot: { name: "Rajkot", lat: 22.3039, lon: 70.8022 },
    surat: { name: "Surat", lat: 21.1702, lon: 72.8311 },
    junagadh: { name: "Junagadh", lat: 21.5222, lon: 70.4579 },
    vadodara: { name: "Vadodara", lat: 22.3072, lon: 73.1812 }
  }},
  westbengal: { name: "West Bengal", districts: {
    kolkata: { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
    burdwan: { name: "Bardhaman", lat: 23.2324, lon: 87.8615 },
    murshidabad: { name: "Baharampur", lat: 24.1026, lon: 88.2461 },
    hooghly: { name: "Hooghly", lat: 22.9038, lon: 88.3968 },
    siliguri: { name: "Siliguri", lat: 26.7271, lon: 88.3953 }
  }},
  tamilnadu: { name: "Tamil Nadu", districts: {
    chennai: { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    coimbatore: { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
    madurai: { name: "Madurai", lat: 9.9252, lon: 78.1198 },
    salem: { name: "Salem", lat: 11.6643, lon: 78.1460 },
    erode: { name: "Erode", lat: 11.3410, lon: 77.7172 }
  }},
  karnataka: { name: "Karnataka", districts: {
    bengaluru: { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    mysuru: { name: "Mysuru", lat: 12.2958, lon: 76.6394 },
    hubballi: { name: "Hubballi-Dharwad", lat: 15.3647, lon: 75.1240 },
    belagavi: { name: "Belagavi", lat: 15.8497, lon: 74.4977 },
    davanagere: { name: "Davanagere", lat: 14.4644, lon: 75.9218 }
  }},
  andhra: { name: "Andhra Pradesh", districts: {
    vijayawada: { name: "Vijayawada", lat: 16.5062, lon: 80.6480 },
    visakhapatnam: { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
    guntur: { name: "Guntur", lat: 16.3067, lon: 80.4365 },
    kurnool: { name: "Kurnool", lat: 15.8281, lon: 78.0373 }
  }},
  telangana: { name: "Telangana", districts: {
    hyderabad: { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
    warangal: { name: "Warangal", lat: 17.9689, lon: 79.5941 },
    nizamabad: { name: "Nizamabad", lat: 18.6725, lon: 78.0941 },
    karimnagar: { name: "Karimnagar", lat: 18.4386, lon: 79.1288 }
  }},
  kerala: { name: "Kerala", districts: {
    thiruvananthapuram: { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
    kochi: { name: "Kochi", lat: 9.9312, lon: 76.2673 },
    kozhikode: { name: "Kozhikode", lat: 11.2588, lon: 75.7804 },
    palakkad: { name: "Palakkad", lat: 10.7867, lon: 76.6548 }
  }},
  odisha: { name: "Odisha", districts: {
    bhubaneswar: { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245 },
    cuttack: { name: "Cuttack", lat: 20.4625, lon: 85.8828 },
    sambalpur: { name: "Sambalpur", lat: 21.4669, lon: 83.9812 },
    bargarh: { name: "Bargarh", lat: 21.3323, lon: 83.6190 }
  }},
  assam: { name: "Assam", districts: {
    guwahati: { name: "Guwahati", lat: 26.1445, lon: 91.7362 },
    jorhat: { name: "Jorhat", lat: 26.7509, lon: 94.2037 },
    dibrugarh: { name: "Dibrugarh", lat: 27.4728, lon: 94.9120 }
  }},
  hp: { name: "Himachal Pradesh", districts: {
    shimla: { name: "Shimla", lat: 31.1048, lon: 77.1734 },
    mandi: { name: "Mandi", lat: 31.5892, lon: 76.9182 },
    solan: { name: "Solan", lat: 30.9084, lon: 77.0999 },
    kangra: { name: "Dharamshala / Kangra", lat: 32.2190, lon: 76.3234 }
  }},
  uttarakhand: { name: "Uttarakhand", districts: {
    dehradun: { name: "Dehradun", lat: 30.3165, lon: 78.0322 },
    haridwar: { name: "Haridwar", lat: 29.9457, lon: 78.1642 },
    udhamsinghnagar: { name: "Rudrapur / US Nagar", lat: 28.9800, lon: 79.4000 }
  }},
  chhattisgarh: { name: "Chhattisgarh", districts: {
    raipur: { name: "Raipur", lat: 21.2514, lon: 81.6296 },
    bilaspur: { name: "Bilaspur", lat: 22.0796, lon: 82.1391 }
  }},
  jharkhand: { name: "Jharkhand", districts: {
    ranchi: { name: "Ranchi", lat: 23.3441, lon: 85.3096 },
    jamshedpur: { name: "Jamshedpur", lat: 22.8046, lon: 86.2029 }
  }}
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
  const stateSelect = document.getElementById('stateSelect');
  const districtSelect = document.getElementById('districtSelect');
  const detectBtn = document.getElementById('detectLocationBtn');

  function populateStateDistricts(stateKey) {
    if (!districtSelect) return;
    const stateObj = INDIA_STATES_DISTRICTS[stateKey] || INDIA_STATES_DISTRICTS['punjab'];
    let html = '';
    for (const [distKey, distData] of Object.entries(stateObj.districts)) {
      html += `<option value="${distKey}">${distData.name}</option>`;
    }
    districtSelect.innerHTML = html;
  }

  if (stateSelect && districtSelect) {
    stateSelect.addEventListener('change', (e) => {
      populateStateDistricts(e.target.value);
      const firstDist = districtSelect.value;
      const stateObj = INDIA_STATES_DISTRICTS[e.target.value];
      if (stateObj && stateObj.districts[firstDist]) {
        const d = stateObj.districts[firstDist];
        fetchWeather(d.lat, d.lon, `${d.name}, ${stateObj.name}`);
      }
    });

    districtSelect.addEventListener('change', (e) => {
      const stateKey = stateSelect.value;
      const distKey = e.target.value;
      const stateObj = INDIA_STATES_DISTRICTS[stateKey];
      if (stateObj && stateObj.districts[distKey]) {
        const d = stateObj.districts[distKey];
        fetchWeather(d.lat, d.lon, `${d.name}, ${stateObj.name}`);
      }
    });

    // Init districts for default state (Punjab -> Ludhiana)
    populateStateDistricts('punjab');
  }

  if (detectBtn) {
    detectBtn.addEventListener('click', () => {
      if (navigator.geolocation) {
        detectBtn.textContent = '📍 Tracking GPS...';
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            let displayLocation = "📍 Tracked Location";

            try {
              // Try Nominatim OpenStreetMap Reverse Geocoding for precise Indian village & district names
              const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                const addr = geoData.address || {};
                const village = addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.city_district || addr.county || "Local Village Area";
                const district = addr.state_district || addr.district || addr.county || "";
                const state = addr.state || "";
                displayLocation = `📍 Village/Locality: ${village}, ${district ? district + ', ' : ''}${state}`;
              }
            } catch (gErr) {
              console.warn('Nominatim reverse geocode warning, trying fallback:', gErr);
              try {
                const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                if (bdcRes.ok) {
                  const bdcData = await bdcRes.json();
                  const village = bdcData.locality || bdcData.city || "Local Area";
                  const state = bdcData.principalSubdivision || "";
                  displayLocation = `📍 Locality: ${village}, ${state}`;
                }
              } catch (e2) {
                console.warn(e2);
              }
            }

            fetchWeather(latitude, longitude, displayLocation);
            detectBtn.textContent = '📍 Location Tracked!';
          },
          (err) => {
            alert('GPS location access denied or unavailable. Please select your State & District manually.');
            detectBtn.textContent = '📍 Track My Current Location & Village';
          }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
      }
    });
  }

  // Initial load default location (Ludhiana, Punjab)
  fetchWeather(30.9010, 75.8573, "Ludhiana, Punjab");
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
  const codeInfo = WEATHER_CODES[current.weather_code] || { label: "Clear Sky", icon: "☀️" };
  const condEl = document.getElementById('weatherCond');
  const iconEl = document.getElementById('weatherIcon');
  if (condEl) condEl.textContent = codeInfo.label;
  if (iconEl) iconEl.textContent = codeInfo.icon;

  // Humidity & Wind
  const humEl = document.getElementById('humidityVal');
  const windEl = document.getElementById('windVal');
  if (humEl) humEl.textContent = `${current.relative_humidity_2m}%`;
  if (windEl) windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;

  // 7-Day Forecast Grid (Dark Glassmorphism Card Theme)
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
        <div class="forecast-card" style="background: rgba(18, 28, 52, 0.85); padding: 18px 14px; border-radius: 16px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(12px);">
          <div style="font-weight: 700; color: #fbbf24; font-size: 1rem; margin-bottom: 6px; font-family: 'Outfit', sans-serif;">${dayName}</div>
          <div style="font-size: 2.2rem; margin: 8px 0;">${dayCodeInfo.icon}</div>
          <div style="font-size: 0.88rem; color: rgba(255,255,255,0.85); margin-bottom: 8px;">${dayCodeInfo.label}</div>
          <div style="font-weight: 700; color: #ffffff; font-size: 1.05rem;">${maxTemp}° <span style="color: rgba(255,255,255,0.6); font-weight: 500; font-size: 0.88rem;">/ ${minTemp}°</span></div>
          <div style="font-size: 0.85rem; color: #60a5fa; margin-top: 8px; font-weight: 600;">🌧️ ${rainProb}% Rain</div>
        </div>
      `;
    });
    forecastGrid.innerHTML = html;
  }
}

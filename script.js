const API_KEY = '3c26de5f6c74f368e64e14e7e77a357a';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

let unit = 'metric';
let currentCity = null;

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locBtn = document.getElementById('locBtn');
const unitBtn = document.getElementById('unitBtn');
const themeToggle = document.getElementById('themeToggle');

const weatherCard = document.getElementById('weatherCard');
const cityName = document.getElementById('cityName');
const localTime = document.getElementById('localTime');
const weatherIcon = document.getElementById('weatherIcon');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const feelsLikeEl = document.getElementById('feelsLike');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const pressureEl = document.getElementById('pressure');
const visibilityEl = document.getElementById('visibility');
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
const lastUpdated = document.getElementById('lastUpdated');
const saveFavBtn = document.getElementById('saveFav');
const favList = document.getElementById('favList');

// Load theme from storage
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light');
  themeToggle.textContent = '☀️';
}

// Event Listeners
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const theme = document.body.classList.contains('light') ? 'light' : 'dark';
  themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
});

unitBtn.addEventListener('click', () => {
  unit = unit === 'metric' ? 'imperial' : 'metric';
  unitBtn.textContent = unit === 'metric' ? '°C' : '°F';
  if (currentCity) fetchWeather(currentCity);
});

searchBtn.addEventListener('click', () => {
  const q = cityInput.value.trim();
  if (q) fetchWeather(q);
});

locBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeather(null, pos.coords.latitude, pos.coords.longitude);
    });
  }
});

saveFavBtn.addEventListener('click', () => {
  if (currentCity) saveFavorite(currentCity);
});

function saveFavorite(city) {
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (!favs.includes(city)) {
    favs.push(city);
    localStorage.setItem('favorites', JSON.stringify(favs));
    loadFavorites();
  }
}

function loadFavorites() {
  favList.innerHTML = '';
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  favs.forEach(city => {
    let btn = document.createElement('button');
    btn.textContent = city;
    btn.addEventListener('click', () => fetchWeather(city));
    favList.appendChild(btn);
  });
}

async function fetchWeather(q, lat, lon) {
  let url = q
    ? `${BASE_URL}?q=${encodeURIComponent(q)}&units=${unit}&appid=${API_KEY}`
    : `${BASE_URL}?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  if (res.ok) {
    renderWeather(data);
  } else {
    alert(data.message);
  }
}

function renderWeather(data) {
  currentCity = data.name;
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  localTime.textContent = formatTime(data.dt, data.timezone);

  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIcon.alt = data.weather[0].description;

  animateTemp(tempEl, Math.round(data.main.temp));
  descEl.textContent = data.weather[0].description;
  feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°${unit === 'metric' ? 'C' : 'F'}`;
  humidityEl.textContent = data.main.humidity;
  windEl.textContent = data.wind.speed;
  pressureEl.textContent = data.main.pressure;
  visibilityEl.textContent = (data.visibility / 1000).toFixed(1);

  sunriseEl.textContent = formatTime(data.sys.sunrise, data.timezone);
  sunsetEl.textContent = formatTime(data.sys.sunset, data.timezone);
  lastUpdated.textContent = `Updated: ${formatTime(data.dt, data.timezone)}`;

  weatherCard.classList.remove('hidden');
}

function formatTime(epoch, offset) {
  const date = new Date((epoch + offset) * 1000);
  return date.toUTCString().slice(-12, -7);
}

function animateTemp(el, newTemp) {
  let start = parseInt(el.textContent) || 0;
  let diff = newTemp - start;
  let step = diff / 30;
  let count = 0;
  let interval = setInterval(() => {
    count++;
    el.textContent = `${Math.round(start + step * count)}°${unit === 'metric' ? 'C' : 'F'}`;
    if (count >= 30) clearInterval(interval);
  }, 20);
}

loadFavorites();
fetchWeather('Mumbai');
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("✅ Service Worker registered"))
      .catch(err => console.log("❌ SW registration failed:", err));
  });
}

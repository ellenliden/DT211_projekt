//när hela sidan har laddats
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  //öppna och stäng hamburgermenyn
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  //stäng meny när en länk klickas
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });
});

const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const weatherInfo = document.getElementById("weatherInfo");
let map;

//initiera karta (startpositionen är Stockholm)
function initMap(lat = 59.3293, lon = 18.0686) {
  map = L.map("map").setView([lat, lon], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);
}

//flytta kartan och lägg till markör
function updateMap(lat, lon) {
  map.setView([lat, lon], 10);
  L.marker([lat, lon]).addTo(map);
}

//mappning mellan OpenWeather-ikon och Weather Icons klass
function getWeatherIconClass(iconCode) {
  const iconMap = {
    '01d': 'wi-day-sunny',
    '01n': 'wi-night-clear',
    '02d': 'wi-day-cloudy',
    '02n': 'wi-night-alt-cloudy',
    '03d': 'wi-cloud',
    '03n': 'wi-cloud',
    '04d': 'wi-cloudy',
    '04n': 'wi-cloudy',
    '09d': 'wi-showers',
    '09n': 'wi-showers',
    '10d': 'wi-day-rain',
    '10n': 'wi-night-alt-rain',
    '11d': 'wi-thunderstorm',
    '11n': 'wi-thunderstorm',
    '13d': 'wi-snow',
    '13n': 'wi-snow',
    '50d': 'wi-fog',
    '50n': 'wi-fog'
  };

  return iconMap[iconCode] || 'wi-na';
}

//visa vädret i DOM:en
function showWeather(data) {
  const temp = data.main.temp.toFixed(1);
  const desc = data.weather[0].description;
  const city = data.name;
  const icon = data.weather[0].icon;

  const iconClass = getWeatherIconClass(icon);

  weatherInfo.innerHTML = `
    <div class="weather-card">
      <div class="weather-main">
        <i class="wi ${iconClass}" style="font-size: 4rem; color: #444;"></i>
        <div class="weather-text">
          <h2>${city}</h2>
          <p class="desc">${desc}</p>
          <p class="temp">${temp}°C</p>
        </div>
      </div>
    </div>
  `;

  weatherInfo.classList.remove("hidden");
  weatherInfo.classList.add("fade-in");
}

//hämta väder med stadsnamn
async function fetchWeather(city) {
  const apiKey = "055440deee8f19af971fa34349338210";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=sv&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Kunde inte hitta väderdata.");

  const data = await res.json();
  showWeather(data);
  updateMap(data.coord.lat, data.coord.lon);
}

//hämta väder med koordinater
async function fetchWeatherByCoords(lat, lon) {
  const apiKey = "055440deee8f19af971fa34349338210";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=sv&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Kunde inte hämta väderdata för din plats.");

  const data = await res.json();
  showWeather(data);
  updateMap(lat, lon);
}

//när formuläret skickas
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;

  try {
    await fetchWeather(city);
  } catch (err) {
    weatherInfo.innerHTML = `<p>${err.message}</p>`;
    weatherInfo.classList.remove("hidden");
  }
});

//när sidan laddas
window.addEventListener("load", () => {
  initMap();

  //försök hämta användarens plats
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await fetchWeatherByCoords(latitude, longitude);
      },
      () => {
        console.log("Kunde inte hämta plats – användare nekade.");
      }
    );
  }
});

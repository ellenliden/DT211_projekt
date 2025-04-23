// När hela sidan har laddats
document.addEventListener("DOMContentLoaded", () => {
  // --- HAMBURGARMENY ---
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  // Öppna och stäng hamburgermenyn
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Stäng meny när en länk klickas
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }

  //Kontaktformulär
  const contactForm = document.getElementById("contactForm");
  const confirmation = document.getElementById("confirmationMessage");

  if (contactForm && confirmation) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      //bekräftelsemeddelande
      confirmation.classList.remove("hiddenInfo");

      //Återställ formulär
      this.reset();

      //Dölj meddelandet efter fem sekunder
      setTimeout(() => {
        confirmation.classList.add("hiddenInfo");
      }, 5000);
    });
  }

  // Väder/plats-sidan
  const form = document.getElementById("weatherForm");
  const cityInput = document.getElementById("cityInput");
  const weatherInfo = document.getElementById("weatherInfo");
  let map;

  // Initiera karta (startposition Stockholm)
  function initMap(lat = 59.3293, lon = 18.0686) {
    map = L.map("map").setView([lat, lon], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
  }

  //Flytta kartan och lägg till markör
  function updateMap(lat, lon) {
    map.setView([lat, lon], 10);
    L.marker([lat, lon]).addTo(map);
  }

  //mappning mellan OpenWeather-ikon och Weather Icons klass
  function getWeatherIconClass(iconCode) {
    const iconMap = {
      "01d": "wi-day-sunny",
      "01n": "wi-night-clear",
      "02d": "wi-day-cloudy",
      "02n": "wi-night-alt-cloudy",
      "03d": "wi-cloud",
      "03n": "wi-cloud",
      "04d": "wi-cloudy",
      "04n": "wi-cloudy",
      "09d": "wi-showers",
      "09n": "wi-showers",
      "10d": "wi-day-rain",
      "10n": "wi-night-alt-rain",
      "11d": "wi-thunderstorm",
      "11n": "wi-thunderstorm",
      "13d": "wi-snow",
      "13n": "wi-snow",
      "50d": "wi-fog",
      "50n": "wi-fog",
    };
    return iconMap[iconCode] || "wi-na";
  }

  // Visar vädret i DOM
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

  //Hämtar väder med stadsnamn
  async function fetchWeather(city) {
    const apiKey = "055440deee8f19af971fa34349338210";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=sv&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Kunde inte hitta väderdata.");

    const data = await res.json();
    showWeather(data);
    updateMap(data.coord.lat, data.coord.lon);
  }

  //Hämtar väder med koordinater
  async function fetchWeatherByCoords(lat, lon) {
    const apiKey = "055440deee8f19af971fa34349338210";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=sv&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Kunde inte hämta väderdata för din plats.");

    const data = await res.json();
    showWeather(data);
    updateMap(lat, lon);
  }

  // väder formulär (om sidan är väder-relaterad)
  if (form) {
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
  }

  // försök hämta användarens plats och visa väder för denna
  window.addEventListener("load", () => {
    initMap();

    //försök hämta användarens plats om geolokalisering är aktiverad
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
});

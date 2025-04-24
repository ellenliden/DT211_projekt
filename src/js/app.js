/**
 * @file main.js
 * @description Interaktiv webbplats med väderinformation och kartintegration.
 * Hämtar data från OpenWeatherMap och visar den tillsammans med karta från Leaflet.
 * Inkluderar navigationsmeny, kontaktformulär och responsiv design.
 * @author Ellen Lidén
 * @version 1.0
 */

// När hela sidan har laddats
document.addEventListener("DOMContentLoaded", () => {

  // Hamburgarmeny
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  // Öppna och stäng hamburgermenyn
  if (hamburger && navMenu) {
    /**
     * Växlar mellan att öppna och stänga hamburgermenyn när användaren klickar på den.
     * @listens {click} event - Klick på hamburgermenyn för att toggla visning av navigationsmenyn.
     */
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
    /**
     * Hanterar kontaktformuläret och visar ett bekräftelsemeddelande.
     * Återställer formuläret efter inskickning.
     * @param {Event} e - Submit-händelsen.
     */
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      confirmation.classList.remove("hiddenInfo");
      this.reset();

      setTimeout(() => {
        confirmation.classList.add("hiddenInfo");
      }, 5000); // väntar 5 sekunder innan bekräftelsen tas bort
    });
  }

  // Väder/plats-sidan
  const form = document.getElementById("weatherForm");
  const cityInput = document.getElementById("cityInput");
  const weatherInfo = document.getElementById("weatherInfo");
  let map;

  /**
   * Initierar Leaflet-kartan med angivna koordinater.
   * Standardposition är Stockholm.
   * @param {number} [lat=59.3293] - Latitud.
   * @param {number} [lon=18.0686] - Longitud.
   */
  function initMap(lat = 59.3293, lon = 18.0686) {
    map = L.map("map").setView([lat, lon], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
  }
  /**
   * Flyttar kartan och lägger till en markör på angivna koordinater.
   * @param {number} lat - Latitud.
   * @param {number} lon - Longitud.
   */
  function updateMap(lat, lon) {
    map.setView([lat, lon], 10);
    L.marker([lat, lon]).addTo(map);
  }
  /**
   * Returnerar en Weather Icons-klass baserat på OpenWeatherMap:s ikon-kod.
   * @param {string} iconCode - Ikonkod från API:t.
   * @returns {string} CSS-klassen för motsvarande väderikon.
   */
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

  /**
   * Visar väderinformation i gränssnittet.
   * @param {Object} data - JSON-data från OpenWeatherMap API.
   */
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

  /**
   * Hämtar väderinformation baserat på staden som användaren anger.
   * @param {string} city - Namnet på staden.
   * @returns {Promise<void>}
   */
  async function fetchWeather(city) {
    const apiKey = "055440deee8f19af971fa34349338210";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=sv&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Kunde inte hitta väderdata.");

    const data = await res.json();
    showWeather(data);
    updateMap(data.coord.lat, data.coord.lon);
  }

  /**
   * Hämtar väder baserat på latitud och longitud (t.ex. användarens position).
   * @param {number} lat - Latitud.
   * @param {number} lon - Longitud.
   * @returns {Promise<void>}
   */
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

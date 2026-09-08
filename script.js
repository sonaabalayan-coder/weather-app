const form = document.getElementById("weather-form");
const result = document.getElementById("result");
const sidePanel = document.getElementById("side-panel");
const quoteEl = document.getElementById("quote");

const QUOTES = [
  { text: "The best way out is always through.", author: "Robert Frost" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
  { text: "Do not wait for the perfect moment, take the moment and make it perfect.", author: "Unknown" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C. S. Lewis" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Out of difficulties grow miracles.", author: "Jean de La Bruyère" },
  { text: "Every sunrise is an invitation to brighten someone's day.", author: "Richelle E. Goodrich" },
  { text: "Storms make trees take deeper roots.", author: "Dolly Parton" },
  { text: "Keep your face always toward the sunshine, and shadows will fall behind you.", author: "Walt Whitman" },
  { text: "Not all those who wander are lost.", author: "J. R. R. Tolkien" },
  { text: "Difficulties in life are intended to make us better, not bitter.", author: "Dan Reeves" },
  { text: "The clearest way into the Universe is through a forest wilderness.", author: "John Muir" },
  { text: "A little progress each day adds up to big results.", author: "Unknown" }
];

function showDailyQuote() {
  const dayIndex = Math.floor(Date.now() / 86400000);
  const { text, author } = QUOTES[dayIndex % QUOTES.length];
  quoteEl.innerHTML = `"${text}"<span class="quote-author">${author}</span>`;
}

showDailyQuote();

function buildRain() {
  const layer = document.getElementById("rain-layer");
  const dropCount = 90;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < dropCount; i++) {
    const drop = document.createElement("span");
    drop.className = "raindrop";
    const depth = Math.random();
    const length = 35 + depth * 55;
    const duration = 1.1 - depth * 0.65;
    const delay = -Math.random() * duration;
    const opacity = 0.25 + depth * 0.45;
    drop.style.setProperty("--x", `${Math.random() * 100}%`);
    drop.style.setProperty("--h", `${length}px`);
    drop.style.setProperty("--d", `${duration}s`);
    drop.style.setProperty("--delay", `${delay}s`);
    drop.style.setProperty("--o", opacity);
    frag.appendChild(drop);
  }

  layer.appendChild(frag);
}

buildRain();

function classifyWeather(conditionText, isDay) {
  const text = conditionText.toLowerCase();
  if (/snow|sleet|ice|blizzard/.test(text)) return "snow";
  if (/rain|drizzle|shower|thunder/.test(text)) return "rain";
  if (/sun|clear/.test(text)) return isDay ? "sunny" : "clear";
  return "cloudy";
}

function applyScene(data) {
  const isDay = data.current.is_day === 1;
  document.body.dataset.theme = isDay ? "day" : "night";
  document.body.dataset.weather = classifyWeather(data.current.condition.text, isDay);
}

const AQI_LEVELS = [
  null,
  { text: "Good", color: "#4CAF50" },
  { text: "Moderate", color: "#C9A227" },
  { text: "Unhealthy for sensitive groups", color: "#E07B39" },
  { text: "Unhealthy", color: "#D9534F" },
  { text: "Very unhealthy", color: "#8E44AD" },
  { text: "Hazardous", color: "#6E2C2C" }
];

function renderAirQuality(airQuality) {
  if (!airQuality) return "";
  const level = AQI_LEVELS[airQuality["us-epa-index"]];
  if (!level) return "";
  const pm25 = Math.round(airQuality.pm2_5);
  return `
    <div class="aqi-row">
      <span class="aqi-dot" style="background:${level.color}"></span>
      <div class="aqi-body">
        <p class="stat-label">Air Quality</p>
        <p class="aqi-value" style="color:${level.color}">${level.text}</p>
      </div>
      <p class="aqi-detail">PM2.5 ${pm25} &micro;g/m&sup3;</p>
    </div>
  `;
}

function getUpcomingHours(forecastDays, nowEpoch) {
  const hours = forecastDays.flatMap((day) => day.hour);
  const startIndex = hours.findIndex((hour) => hour.time_epoch >= nowEpoch);
  const from = startIndex === -1 ? 0 : startIndex;
  return hours.slice(from, from + 8);
}

function renderForecastStrip(view, data) {
  const strip = document.getElementById("forecast-strip");
  if (!strip) return;

  if (view === "day") {
    const hours = getUpcomingHours(data.forecast.forecastday, data.location.localtime_epoch);
    strip.innerHTML = hours
      .map((hour) => {
        const time = hour.time.split(" ")[1];
        return `
          <div class="forecast-card">
            <p class="forecast-time">${time}</p>
            <img src="https:${hour.condition.icon}" alt="${hour.condition.text}" />
            <p class="forecast-temp">${Math.round(hour.temp_c)}°</p>
          </div>
        `;
      })
      .join("");
  } else {
    strip.innerHTML = data.forecast.forecastday
      .map((day, i) => {
        const label = i === 0 ? "Today" : new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" });
        return `
          <div class="forecast-card">
            <p class="forecast-time">${label}</p>
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
            <p class="forecast-temp">${Math.round(day.day.avgtemp_c)}°</p>
          </div>
        `;
      })
      .join("");
  }
}

let currentForecastData = null;

sidePanel.addEventListener("click", (e) => {
  const btn = e.target.closest(".toggle-btn");
  if (!btn || !currentForecastData) return;
  sidePanel.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderForecastStrip(btn.dataset.view, currentForecastData);
});

async function getWeather(city) {
  result.innerHTML = `<div class="spinner" aria-label="Loading weather"></div>`;
  sidePanel.innerHTML = "";
  try {
    const res = await fetch(`/.netlify/functions/weather?city=${encodeURIComponent(city)}`);
    const data = await res.json();
    if (!res.ok) {
      result.innerHTML = `<p class="error">${data.error || "Something went wrong."}</p>`;
      return;
    }

    applyScene(data);
    currentForecastData = data;

    const { lat, lon, name, country } = data.location;
    const astro = data.forecast.forecastday[0].astro;

    result.innerHTML = `
      <div class="result-content">
        <h2>${name}, ${country}</h2>
        <div class="weather-main">
          <img src="https:${data.current.condition.icon}" alt="${data.current.condition.text}" />
          <p class="temp">${Math.round(data.current.temp_c)}°</p>
        </div>
        <p class="condition">${data.current.condition.text}</p>

        <div class="stats-grid">
          <div class="stat-tile">
            <span class="stat-icon">🌡️</span>
            <div class="stat-body">
              <p class="stat-label">Feels Like</p>
              <p class="stat-value">${Math.round(data.current.feelslike_c)}°C</p>
            </div>
          </div>
          <div class="stat-tile">
            <span class="stat-icon">💧</span>
            <div class="stat-body">
              <p class="stat-label">Humidity</p>
              <p class="stat-value">${data.current.humidity}%</p>
            </div>
          </div>
          <div class="stat-tile">
            <span class="stat-icon">💨</span>
            <div class="stat-body">
              <p class="stat-label">Wind</p>
              <p class="stat-value">${Number(data.current.wind_kph).toFixed(1)} kph</p>
            </div>
          </div>
          <div class="stat-tile">
            <span class="stat-icon">☀️</span>
            <div class="stat-body">
              <p class="stat-label">UV Index</p>
              <p class="stat-value">${Number(data.current.uv).toFixed(1)}</p>
            </div>
          </div>
          <div class="stat-tile">
            <span class="stat-icon">🌅</span>
            <div class="stat-body">
              <p class="stat-label">Sunrise</p>
              <p class="stat-value">${astro.sunrise}</p>
            </div>
          </div>
          <div class="stat-tile">
            <span class="stat-icon">🌇</span>
            <div class="stat-body">
              <p class="stat-label">Sunset</p>
              <p class="stat-value">${astro.sunset}</p>
            </div>
          </div>
        </div>

        ${renderAirQuality(data.current.air_quality)}
      </div>
    `;

    sidePanel.innerHTML = `
      <p class="side-label">Forecast</p>
      <div class="forecast-map-row">
        <div class="forecast-col">
          <div class="forecast-toggle">
            <button type="button" class="toggle-btn active" data-view="day">Day</button>
            <button type="button" class="toggle-btn" data-view="week">Week</button>
          </div>
          <div class="forecast-strip" id="forecast-strip"></div>
        </div>
        <iframe
          class="map-frame"
          title="Map of ${name}, ${country}"
          src="https://maps.google.com/maps?q=${lat},${lon}&z=11&output=embed"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    `;

    renderForecastStrip("day", data);
  } catch (err) {
    result.innerHTML = `<p class="error">Network error. Try again.</p>`;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = document.getElementById("city-input").value.trim();
  getWeather(city);
});

getWeather("Yerevan");

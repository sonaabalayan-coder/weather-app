const form = document.getElementById("weather-form");
const result = document.getElementById("result");

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

async function getWeather(city) {
  result.innerHTML = `<div class="spinner" aria-label="Loading weather"></div>`;
  try {
    const res = await fetch(`/.netlify/functions/weather?city=${encodeURIComponent(city)}`);
    const data = await res.json();
    if (!res.ok) {
      result.innerHTML = `<p class="error">${data.error || "Something went wrong."}</p>`;
      return;
    }

    applyScene(data);

    result.innerHTML = `
      <div class="result-content">
        <h2>${data.location.name}, ${data.location.country}</h2>
        <div class="weather-main">
          <img src="https:${data.current.condition.icon}" alt="${data.current.condition.text}" />
          <p class="temp">${Math.round(data.current.temp_c)}°</p>
        </div>
        <p class="condition">${data.current.condition.text}</p>
      </div>
    `;
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

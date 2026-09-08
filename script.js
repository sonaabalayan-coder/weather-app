const form = document.getElementById("weather-form");
const result = document.getElementById("result");
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

    const { lat, lon, name, country } = data.location;
    result.innerHTML = `
      <div class="result-content">
        <h2>${name}, ${country}</h2>
        <div class="weather-main">
          <img src="https:${data.current.condition.icon}" alt="${data.current.condition.text}" />
          <p class="temp">${Math.round(data.current.temp_c)}°</p>
        </div>
        <p class="condition">${data.current.condition.text}</p>
        <iframe
          class="map-frame"
          title="Map of ${name}, ${country}"
          src="https://maps.google.com/maps?q=${lat},${lon}&z=11&output=embed"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
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

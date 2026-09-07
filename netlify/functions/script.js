const form = document.getElementById("weather-form");
const result = document.getElementById("result");
 
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = document.getElementById("city-input").value.trim();
  result.textContent = "Loading...";
 
  try {
    const res = await fetch(`/.netlify/functions/weather?city=${encodeURIComponent(city)}`);
    const data = await res.json();
    if (!res.ok) { result.textContent = data.error || "Something went wrong."; return; }
 
    result.innerHTML = `
<h2>${data.location.name}, ${data.location.country}</h2>
<p>${data.current.temp_c}°C — ${data.current.condition.text}</p>
<img src="https:${data.current.condition.icon}" alt="${data.current.condition.text}" />
    `;
  } catch (err) {
    result.textContent = "Network error. Try again.";
  }
});

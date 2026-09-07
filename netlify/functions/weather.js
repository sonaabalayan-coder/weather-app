exports.handler = async (event) => {
  const city = event.queryStringParameters.city;
  if (!city) {
    return { statusCode: 400, body: JSON.stringify({ error: "City is required" }) };
  }
 
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;
 
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ error: data.error?.message || "Weather API error" }) };
    }
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};

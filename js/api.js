// js/api.js
import { OWM_API_KEY, OWM_WEATHER_URL, NOMINATIM_URL, FORECAST_URL } from './config.js';

// Get coordinates from city name (Forward Geocoding)
export async function getCoordinates(city) {
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(city)}&format=json&limit=1`;
    
    const response = await fetch(url, { 
        headers: { 'User-Agent': 'WeatherMapSPA/1.0' } 
    });
    
    if (!response.ok) {
        throw new Error('Geocoding service failed');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
        throw new Error('City not found. Please try again.');
    }
    
    return { 
        lat: parseFloat(data[0].lat), 
        lng: parseFloat(data[0].lon), 
        name: data[0].display_name,
        city: data[0].address?.city || data[0].address?.town || data[0].address?.village || data[0].name || city
    };
}

//  Reverse Geocoding 
export async function getCityFromCoordinates(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    
    const response = await fetch(url, { 
        headers: { 'User-Agent': 'WeatherMapSPA/1.0' } 
    });
    
    if (!response.ok) {
        throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    return {
        name: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: data.address?.city || data.address?.town || data.address?.village || data.name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };
}

// Get current weather data from OpenWeatherMap
export async function getWeather(lat, lon) {
    const url = `${OWM_WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Weather data unavailable');
    }
    
    return await response.json();
}


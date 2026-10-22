// js/app.js
import { elements, initTheme, toggleTheme, showLoading, hideLoading, showAlert } from './dom.js';
import { getCoordinates, getCityFromCoordinates, getWeather } from './api.js';
import { initMap, updateMap, bindPopupToMarker } from './map.js';
import { addFavorite, renderFavorites } from './favorites.js';
import { initChatbot, updateWeatherContext } from './chatbot.js';

console.log('🚀 WeatherMap starting...');

// Initialize application
initTheme();
const mapInitialized = initMap();

if (!mapInitialized) {
    showAlert('Failed to load map. Please refresh the page.', 'error');
}

initChatbot();

// Store current weather data for sharing
let currentWeatherData = null;
let currentCityName = '';
let currentCoords = { lat: 0, lng: 0 };

// Function to fetch and display weather
async function fetchAndDisplayWeather(lat, lon, cityName) {
    try {
        console.log(`🌤️ Fetching weather for: ${cityName} (${lat}, ${lon})`);
        showLoading();
        
        const weatherData = await getWeather(lat, lon);
        currentWeatherData = weatherData;
        currentCityName = cityName;
        currentCoords = { lat, lon };
        
        // Update UI
        updateWeatherDisplay(weatherData, cityName);
        updateBackground(weatherData);
        
        // Update chatbot context
        updateWeatherContext(weatherData, cityName);
        
        updateMap(lat, lon);
        bindPopupToMarker(weatherData, cityName, lat, lon, handleAddToFavorites);
        hideLoading();
        
        // Show weather display section
        document.getElementById('weather-display').classList.remove('hidden');
        
        showAlert(`Weather loaded for ${cityName}!`, 'success');
    } catch (error) {
        console.error('❌ Error:', error);
        hideLoading();
        showAlert(error.message, 'error');
    }
}

//  Update weather display - (emojiFallback)
function updateWeatherDisplay(data, cityName) {
    document.getElementById('city-name').textContent = cityName;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weather-description').textContent = data.weather[0].description;
    
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    const weatherIcon = document.getElementById('weather-icon');
    const emojiFallback = document.getElementById('weather-emoji-fallback');
    
    weatherIcon.style.display = 'block';
    
     // null to protect from the fault
    if (emojiFallback) {
        emojiFallback.style.display = 'none';
    }
    
    weatherIcon.src = iconUrl;
    weatherIcon.alt = data.weather[0].description;
    weatherIcon.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.4)) brightness(1.1)';
    
    weatherIcon.onerror = function() {
        console.warn('⚠️ Icon failed to load:', iconUrl);
        this.style.display = 'none';
        // null to protect from the fault
        if (emojiFallback) {
            emojiFallback.textContent = getWeatherEmoji(data.weather[0].main);
            emojiFallback.style.display = 'block';
        }
    };
}

function getWeatherEmoji(weatherMain) {
    const emojis = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️',
        'Haze': '🌫️'
    };
    return emojis[weatherMain] || '🌤️';
}

function updateBackground(data) {
    const weatherMain = data.weather[0].main.toLowerCase();
    const bgLayer = document.querySelector('.background-layer');
    
    if (weatherMain.includes('clear')) {
        bgLayer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else if (weatherMain.includes('clouds')) {
        bgLayer.style.background = 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)';
    } else if (weatherMain.includes('rain')) {
        bgLayer.style.background = 'linear-gradient(135deg, #373B44 0%, #4286f4 100%)';
    } else if (weatherMain.includes('snow')) {
        bgLayer.style.background = 'linear-gradient(135deg, #E6DADA 0%, #274046 100%)';
    } else {
        bgLayer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

function handleAddToFavorites(city, lat, lon) {
    const added = addFavorite(city, lat, lon);
    if (added) {
        renderFavorites(handleCityClick);
        showAlert(`${city} added to favorites!`, 'success');
    } else {
        showAlert(`${city} is already in favorites!`, 'error');
    }
}

function handleCityClick(lat, lon, city) {
    fetchAndDisplayWeather(lat, lon, city);
}

// Render initial favorites
renderFavorites(handleCityClick);

// Theme toggle
elements.themeToggle.addEventListener('click', toggleTheme);

// Search form submission - Supports coordinates and city names
elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = elements.cityInput.value.trim();
    if (!input) return;
    
    console.log(`🔍 Searching for: ${input}`);
    
    try {
        showLoading();
        
        let lat, lng, cityName;
        
        if (isCoordinates(input)) {
            const coords = parseCoordinates(input);
            lat = coords.lat;
            lng = coords.lng;
            
            console.log(`📍 Coordinates detected, fetching city name...`);
            const locationData = await getCityFromCoordinates(lat, lng);
            cityName = locationData.city;
            console.log(`✅ City found: ${cityName}`);
        } else {
            const coords = await getCoordinates(input);
            lat = coords.lat;
            lng = coords.lng;
            cityName = coords.city;
            console.log(`🏙️ City found: ${cityName}`);
        }
        
        await fetchAndDisplayWeather(lat, lng, cityName);
    } catch (error) {
        console.error('❌ Error:', error);
        hideLoading();
        showAlert(error.message, 'error');
    }
});

// Check if input is coordinates
function isCoordinates(input) {
    const coordPattern = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
    return coordPattern.test(input);
}

// Parse coordinates
function parseCoordinates(input) {
    const parts = input.split(',').map(part => parseFloat(part.trim()));
    
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        throw new Error('Invalid coordinates format. Use: latitude, longitude');
    }
    
    if (parts[0] < -90 || parts[0] > 90) {
        throw new Error('Latitude must be between -90 and 90');
    }
    
    if (parts[1] < -180 || parts[1] > 180) {
        throw new Error('Longitude must be between -180 and 180');
    }
    
    return { lat: parts[0], lng: parts[1] };
}

// Real-time validation while typing
elements.cityInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    elements.cityInput.classList.remove('coordinates-valid', 'coordinates-invalid');
    
    if (value.length === 0) return;
    
    if (/^-?\d/.test(value)) {
        if (isCoordinates(value)) {
            elements.cityInput.classList.add('coordinates-valid');
        } else if (value.includes(',')) {
            elements.cityInput.classList.add('coordinates-invalid');
        }
    }
});

// Get user location
elements.locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        console.log('📍 Requesting user location...');
        showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const locationData = await getCityFromCoordinates(latitude, longitude);
                    await fetchAndDisplayWeather(latitude, longitude, locationData.city);
                    elements.cityInput.value = locationData.city;
                } catch (error) {
                    console.error('❌ Error:', error);
                    hideLoading();
                    showAlert('Failed to fetch weather.', 'error');
                }
            },
            (error) => {
                console.error('❌ Geolocation error:', error);
                hideLoading();
                showAlert('Geolocation permission denied.', 'error');
            }
        );
    } else {
        showAlert('Geolocation not supported.', 'error');
    }
});

// Share functionality - Simple & Working
const shareToggle = document.getElementById('btn-share-toggle');
const shareOptions = document.getElementById('share-options');

// Toggle share dropdown
shareToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    shareOptions.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.share-dropdown')) {
        shareOptions.classList.add('hidden');
    }
});

// Copy button - 
document.getElementById('btn-share-copy').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent dropdown from closing
    
    if (!currentWeatherData) {
        showAlert('No weather data!', 'error');
        return;
    }

    const text = `Weather in ${currentCityName}: ${Math.round(currentWeatherData.main.temp)}°C - ${currentWeatherData.weather[0].description}`;
    
    // Simple copy method that always works
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showAlert('Copied to clipboard!', 'success');
    } catch (err) {
        showAlert('Copy failed!', 'error');
    }
    
    document.body.removeChild(textarea);
    
    // Close dropdown after 300ms
    setTimeout(() => {
        shareOptions.classList.add('hidden');
    }, 300);
});

// Facebook button
document.getElementById('btn-share-facebook').addEventListener('click', (e) => {
    e.stopPropagation();
    
    if (!currentWeatherData) {
        showAlert('No weather data!', 'error');
        return;
    }

    const text = `Weather in ${currentCityName}: ${Math.round(currentWeatherData.main.temp)}°C - ${currentWeatherData.weather[0].description}`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
    
    setTimeout(() => {
        shareOptions.classList.add('hidden');
    }, 300);
});
// js/map.js
import { DEFAULT_COORDS } from './config.js';

let map;
let currentMarker = null;

export function initMap() {
    console.log('🗺️ Initializing map...');
    
    if (typeof L === 'undefined') {
        console.error('❌ Leaflet is not loaded!');
        return false;
    }
    
    try {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('❌ Map element not found!');
            return false;
        }
        
        map = L.map('map').setView(
            [DEFAULT_COORDS.lat, DEFAULT_COORDS.lng], 
            DEFAULT_COORDS.zoom
        );
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        console.log('✅ Map created successfully');
        
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
        
        return true;
    } catch (error) {
        console.error('❌ Error initializing map:', error);
        return false;
    }
}

export function updateMap(lat, lng) {
    if (!map) return;
    
    map.flyTo([lat, lng], 10, { duration: 1.5 });
    
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    
    currentMarker = L.marker([lat, lng]).addTo(map);
}

export function createPopupContent(weatherData, cityName, lat, lng, onAddToFavorites) {
    const { main, weather } = weatherData;
    const iconCode = weather[0].icon;
    const temp = Math.round(main.temp);
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    console.log(`🖼️ Icon URL: ${iconUrl}`);
    
    const popupDiv = document.createElement('div');
    popupDiv.className = 'simple-weather-popup';
    
    popupDiv.innerHTML = `
        <div class="popup-city">${cityName}</div>
        <div class="popup-coords">📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
        <div class="popup-icon-wrapper">
            <img src="${iconUrl}" 
                 alt="${weather[0].description}" 
                 class="popup-weather-icon"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="popup-emoji-fallback" style="display:none;">${getWeatherEmoji(weather[0].main)}</div>
        </div>
        <div class="popup-temp">${temp}°C</div>
        
        <button class="details-btn" id="btn-details">
            ℹ️ Details
        </button>
    `;

    // details button

    popupDiv.querySelector('#btn-details').addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (currentMarker) currentMarker.closePopup();
        
        const aiChatToggle = document.getElementById('ai-chat-toggle');
        if (aiChatToggle) aiChatToggle.click();
        
        setTimeout(() => {
            const aiInput = document.getElementById('ai-input');
            const aiForm = document.getElementById('ai-chat-form');
            if (aiInput && aiForm) {
                aiInput.value = `Tell me about weather in ${cityName}`;
                aiForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        }, 500);
    });

    // check if the function exists before it calls
    
    popupDiv.addEventListener('click', (e) => {
        if (e.target.id !== 'btn-details') {
            if (typeof onAddToFavorites === 'function') {
                onAddToFavorites(cityName, lat, lng);
            } else {
                console.warn('⚠️ onAddToFavorites is not a function. Check app.js');
            }
        }
    });
    
    return popupDiv;
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

export function bindPopupToMarker(weatherData, cityName, lat, lng, onAddToFavorites) {
    if (currentMarker) {
        currentMarker.bindPopup(createPopupContent(weatherData, cityName, lat, lng, onAddToFavorites), {
            maxWidth: 200,
            className: 'simple-popup'
        }).openPopup();
    }
}

export function getMap() {
    return map;
}
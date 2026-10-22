// js/chatbot.js
import { elements } from './dom.js';

// Store current weather context
let currentWeatherContext = null;

// Update weather context from app.js
export function updateWeatherContext(weatherData, cityName) {
    currentWeatherContext = {
        city: cityName,
        temp: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        wind: weatherData.wind.speed,
        pressure: weatherData.main.pressure,
        visibility: (weatherData.visibility / 1000).toFixed(1),
        description: weatherData.weather[0].description,
        clouds: weatherData.weather[0].main
    };
}

// Add message to chat
function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}-message`;
    msgDiv.innerHTML = text;
    
    elements.chatMessages.appendChild(msgDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai-message typing-indicator';
    typingDiv.id = 'typing-dots';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    elements.chatMessages.appendChild(typingDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.getElementById('typing-dots');
    if (typing) typing.remove();
}

// Generate intelligent response
function generateResponse(input) {
    const text = input.toLowerCase().trim();
    
    if (!text) return "Please write a clear question.";

    // Greetings
    if (/^(hi|hello|hey|مرحبا|اهلا)/i.test(text)) {
        return "Welcome! 👋 I'm your weather assistant. Ask me about humidity, wind, pressure, visibility";
    }

    // Help
    if (/^(help|مساعدة|commands)/i.test(text)) {
        return `
            <strong>📋 Available Commands:</strong><br>
            • "Humidity" or "رطوبة"<br>
            • "Wind speed" or "رياح"<br>
            • "Pressure" or "ضغط"<br>
            • "Visibility" or "رؤية"<br>
            • "Feels like" or "إحساس"<br>
            • "Weather" or "طقس"
        `;
    }

    // Context-aware responses
    if (currentWeatherContext) {
        const ctx = currentWeatherContext;

        // Temperature
        if (/temp|حرارة|درجة/i.test(text)) {
            return `🌡️ Temperature in <strong>${ctx.city}</strong>: <strong>${ctx.temp}°C</strong> (Feels like: ${ctx.feelsLike}°C)`;
        }

        // Humidity
        if (/humid|رطوبة/i.test(text)) {
            return `💧 Humidity in <strong>${ctx.city}</strong>: <strong>${ctx.humidity}%</strong>`;
        }

        // Wind
        if (/wind|رياح|هواء/i.test(text)) {
            return ` Wind speed in <strong>${ctx.city}</strong>: <strong>${ctx.wind} m/s</strong>`;
        }

        // Pressure
        if (/pressure|ضغط/i.test(text)) {
            return `️ Pressure in <strong>${ctx.city}</strong>: <strong>${ctx.pressure} hPa</strong>`;
        }

        // Visibility
        if (/visib|رؤية/i.test(text)) {
            return `👁️ Visibility in <strong>${ctx.city}</strong>: <strong>${ctx.visibility} km</strong>`;
        }

        // Feels like
        if (/feels|احساس|يشعر/i.test(text)) {
            return `️ Feels like temperature in <strong>${ctx.city}</strong>: <strong>${ctx.feelsLike}°C</strong>`;
        }

        // General weather
        if (/weather|طقس|جو|حالة/i.test(text)) {
            return `🌤️ Weather in <strong>${ctx.city}</strong>: <strong>${ctx.description}</strong><br>Temp: ${ctx.temp}°C | Humidity: ${ctx.humidity}% | Wind: ${ctx.wind} m/s`;
        }
    } else {
        // If asking about weather but no city searched yet
        if (/temp|حرارة|طقس|weather|humid|رطوبة|wind|رياح/i.test(text)) {
            return "⚠️ You haven't searched for a city yet! Please enter a city name in the search box first.";
        }
    }

    // Default response
    return " I didn't understand. Type 'help' for available commands, or ask me about the current city's weather details!";
}

// Initialize chatbot
export function initChatbot() {
    // Open/close modal
    elements.aiChatToggle.addEventListener('click', () => {
        elements.aiChatModal.classList.remove('hidden');
        elements.aiInput.focus();
    });
    
    elements.closeModal.addEventListener('click', () => {
        elements.aiChatModal.classList.add('hidden');
    });
    
    window.addEventListener('click', (e) => { 
        if (e.target === elements.aiChatModal) {
            elements.aiChatModal.classList.add('hidden');
        }
    });

    // Handle form submission
    elements.aiChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const question = elements.aiInput.value.trim();
        if (!question) return;

        // Show user message
        appendMessage(`<span class="msg-label">You:</span> ${question}`, 'user');
        elements.aiInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        // Simulate AI delay
        const delay = Math.random() * 800 + 600;
        setTimeout(() => {
            removeTypingIndicator();
            const response = generateResponse(question);
            appendMessage(`<span class="msg-label">AI Assistant:</span> ${response}`, 'ai');
        }, delay);
    });
}
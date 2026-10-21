// DOM Elements
export const elements = {
    form: document.getElementById('weather-form'),
    cityInput: document.getElementById('city-input'),
    locationBtn: document.getElementById('location-btn'),
    loadingSpinner: document.getElementById('loading-spinner'),
    alertBox: document.getElementById('alert-box'),
    themeToggle: document.getElementById('theme-toggle'),
    favoritesList: document.getElementById('favorites-list'),
    aiChatToggle: document.getElementById('ai-chat-toggle'),
    aiChatModal: document.getElementById('ai-chat-modal'),
    closeModal: document.querySelector('.close-modal'),
    aiChatForm: document.getElementById('ai-chat-form'),
    aiInput: document.getElementById('ai-input'),
    chatMessages: document.getElementById('chat-messages')
};

// Show loading spinner
export function showLoading() {
    elements.loadingSpinner.classList.remove('hidden');
    elements.alertBox.classList.add('hidden');
}

// Hide loading spinner
export function hideLoading() {
    elements.loadingSpinner.classList.add('hidden');
}

// Show alert message
export function showAlert(message, type) {
    elements.alertBox.textContent = message;
    elements.alertBox.className = `alert alert-${type}`;
    elements.alertBox.classList.remove('hidden');
    
    setTimeout(() => {
        elements.alertBox.classList.add('hidden');
    }, 4000);
}

// Initialize theme from localStorage
export function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    updateThemeIcon(savedTheme || 'light');
}

// Toggle between dark and light mode
export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? null : 'dark';
    
    if (newTheme) {
        document.documentElement.setAttribute('data-theme', newTheme);
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    
    localStorage.setItem('theme', newTheme || 'light');
    updateThemeIcon(newTheme || 'light');
}

// Update theme icon
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}
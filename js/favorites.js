// js/favorites.js

// Get favorites from localStorage
export function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

// Add city to favorites
export function addFavorite(city, lat, lon) {
    const favorites = getFavorites();
    
    if (!favorites.some(fav => fav.city === city)) {
        favorites.push({ city, lat, lon });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        return true;
    }
    return false;
}

// Remove city from favorites
export function removeFavorite(city) {
    let favorites = getFavorites();
    favorites = favorites.filter(fav => fav.city !== city);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Render favorites list
export function renderFavorites(onCityClick) {
    const favoritesList = document.getElementById('favorites-list');
    const favorites = getFavorites();
    favoritesList.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="no-favorites">No favorite cities yet. Add one from the map!</p>';
        return;
    }
    
    favorites.forEach(fav => {
        const favItem = document.createElement('div');
        favItem.className = 'fav-item';
        
        const btn = document.createElement('button');
        btn.className = 'fav-btn';
        btn.textContent = fav.city;
        btn.addEventListener('click', () => onCityClick(fav.lat, fav.lon, fav.city));
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-fav-btn';
        removeBtn.textContent = '✕';  
        removeBtn.title = 'Remove from favorites';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavorite(fav.city);
            renderFavorites(onCityClick);
        });
        
        favItem.appendChild(btn);
        favItem.appendChild(removeBtn);
        favoritesList.appendChild(favItem);
    });
}
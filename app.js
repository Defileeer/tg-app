const tg = window.Telegram.WebApp;
tg.expand(); // Разворачиваем окно на весь экран

// Твой актуальный URL ngrok
const API_URL = "https://tg-marketplace-backend.onrender.com";

async function fetchListings() {
    const container = document.getElementById('listings');
    const loading = document.getElementById('loading');

    try {
        // Запрос с заголовком ngrok-skip-browser-warning, чтобы ngrok не выдавал стартовый экран
        const response = await fetch(`${API_URL}/api/listings`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();

        if (loading) {
            loading.style.display = 'none';
        }

        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-msg">Пока нет опубликованных объявлений 😔</div>';
            return;
        }

        container.innerHTML = '';

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';

            const photoUrl = item.photo_id 
                ? `${API_URL}/api/photo/${item.photo_id}` 
                : null;

            const photoHtml = photoUrl
                ? `<img src="${photoUrl}" class="card-img" alt="${item.title}">`
                : `<div class="card-img no-photo">📷 Без фото</div>`;

            card.innerHTML = `
                ${photoHtml}
                <div class="card-content">
                    <div class="card-price">${item.price} ${item.currency || '$'}</div>
                    <div class="card-title">${item.title}</div>
                    <div class="card-location">📍 ${item.location || 'ПМР'}</div>
                    <button class="btn-contact" onclick="contactSeller('${item.user_id}', event)">Связаться</button>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error('Ошибка загрузки:', error);
        if (loading) {
            loading.innerText = '⚠️ Не удалось загрузить объявления';
        }
    }
}

function contactSeller(userId, event) {
    if (event) {
        event.stopPropagation();
    }
    // Переход в профиль / чат с продавцом по его Telegram ID
    tg.openTelegramLink(`https://t.me/user?id=${userId}`);
}

// Запускаем при загрузке
document.addEventListener('DOMContentLoaded', fetchListings);

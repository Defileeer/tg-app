// Безопасная инициализация Telegram WebApp
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : {
    expand: () => {},
    openTelegramLink: (url) => { window.open(url, '_blank'); }
};

try {
    tg.expand();
} catch (e) {
    console.log("WebApp expand not supported here:", e);
}

// Актуальный URL бэкенда на Render
const API_URL = "https://tg-marketplace-backend.onrender.com";

async function fetchListings() {
    console.log("🚀 Запуск загрузки объявлений...");
    const container = document.getElementById('listings');
    const loading = document.getElementById('loading');

    try {
        console.log(`📡 Отправка запроса на: ${API_URL}/api/listings`);
        const response = await fetch(`${API_URL}/api/listings`);

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();
        console.log("📦 Получены данные от сервера:", data);

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

            // Если есть photo_id, рисуем картинку, иначе заглушку
            let photoHtml = `<div class="card-img no-photo">📷 Без фото</div>`;
            if (item.photo_id) {
                const photoUrl = `${API_URL}/api/photo/${item.photo_id}`;
                photoHtml = `<img src="${photoUrl}" class="card-img" alt="Фото товара">`;
            }

            const price = item.price ? item.price : 'Договорная';
            const currency = item.currency || '$';
            const title = item.title || 'Без названия';
            const location = item.location || 'ПМР';

            card.innerHTML = `
                ${photoHtml}
                <div class="card-content">
                    <div class="card-price">${price} ${currency}</div>
                    <div class="card-title">${title}</div>
                    <div class="card-location">📍 ${location}</div>
                    <button class="btn-contact" onclick="contactSeller('${item.user_id}', event)">Связаться</button>
                </div>
            `;

            container.appendChild(card);
        });
        console.log("✅ Карточки успешно отрисованы!");

    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        if (loading) {
            loading.innerText = '⚠️ Не удалось загрузить объявления';
        }
    }
}

function contactSeller(userId, event) {
    if (event) {
        event.stopPropagation();
    }
    tg.openTelegramLink(`https://t.me/user?id=${userId}`);
}

// Запускаем при загрузке документа
document.addEventListener('DOMContentLoaded', fetchListings);

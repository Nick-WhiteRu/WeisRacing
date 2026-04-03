// --- ЛОГИКА КОРЗИНЫ ---
let cart = JSON.parse(localStorage.getItem('weisCart')) || [];

function toggleCart() {
    document.getElementById('sideCart').classList.toggle('open');
}

function addToCartFromForm() {
    const select = document.getElementById('serviceSelect');
    const selectedOption = select.options[select.selectedIndex];
    
    if (!select.value) {
        alert("Выберите услугу!");
        return;
    }

    const item = {
        id: Date.now(),
        name: selectedOption.text,
        price: parseInt(selectedOption.getAttribute('data-price'))
    };

    cart.push(item);
    updateCartUI();
    
    // Авто-открытие корзины при добавлении
    if(!document.getElementById('sideCart').classList.contains('open')) {
        toggleCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('cartItemsList');
    const badge = document.getElementById('cartBadge');
    const total = document.getElementById('cartTotal');
    
    list.innerHTML = '';
    let totalPrice = 0;

    cart.forEach(item => {
        totalPrice += item.price;
        list.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div style="color:red; font-size:12px;">${item.price.toLocaleString()} ₽</div>
                </div>
                <div class="cart-item-remove" onclick="removeFromCart(${item.id})">×</div>
            </div>
        `;
    });

    badge.innerText = cart.length;
    total.innerText = totalPrice.toLocaleString();
    localStorage.setItem('weisCart', JSON.stringify(cart));
}

// --- ЛОГИКА VIN ---
async function checkVin() {
    const vinInput = document.getElementById('vin-input');
    const vin = vinInput.value.toUpperCase();
    const res = document.getElementById('vin-res');
    
    if(vin.length !== 17) { 
        res.innerHTML = "<span style='color:red'>ОШИБКА: НУЖНО 17 СИМВОЛОВ</span>"; 
        return; 
    }
    
    res.innerText = "ЗАПРОС К СЕРВЕРУ NHTSA...";
    
    try {
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
        const data = await response.json();
        
        const brand = data.Results.find(i => i.VariableId === 26)?.Value;
        const model = data.Results.find(i => i.VariableId === 28)?.Value;
        const year = data.Results.find(i => i.VariableId === 29)?.Value;

        if(brand) {
            res.innerHTML = `
                НАЙДЕНО: <span style="color:white">${year || ''} ${brand} ${model || ''}</span>
                <br>
                <p style="color:red; font-size:10px; margin-top:5px;">ДАННЫЕ ПЕРЕДАНЫ МАСТЕРУ ДЛЯ ОЦЕНКИ STAGE</p>
            `;
        } else { 
            res.innerText = "АВТОМОБИЛЬ НЕ НАЙДЕН В БАЗЕ"; 
        }
    } catch(e) { 
        res.innerText = "ОШИБКА ПОДКЛЮЧЕНИЯ К БАЗЕ"; 
    }
}

// --- АНИМАЦИЯ ДОСТИЖЕНИЙ (SCROLL) ---
const statsSection = document.querySelector('.stats');
const statCards = document.querySelectorAll('.stat');
const counters = document.querySelectorAll('.counter');
let started = false;

function startCounters() {
    counters.forEach(c => {
        const target = +c.dataset.target;
        let current = 0;
        const increment = target / 40;
        
        const update = () => {
            current += increment;
            if (current < target) {
                c.innerText = Math.ceil(current);
                setTimeout(update, 40);
            } else { 
                c.innerText = target; 
            }
        };
        update();
    });
}

window.addEventListener('scroll', () => {
    if (!statsSection) return;
    
    const rect = statsSection.getBoundingClientRect();
    if (!started && rect.top < window.innerHeight - 100) {
        started = true;
        statCards.forEach((card, index) => {
            setTimeout(() => card.classList.add('active'), index * 200);
        });
        startCounters();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
});
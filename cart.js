let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(productId, name, price) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, name, price, quantity: 1 });
    }
    updateCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = parseInt(newQuantity);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        }
    }
    updateCart();
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon();
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
}

function updateCartIcon() {
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        cartIcon.textContent = itemCount;
    }
}

function displayCart() {
    const cartItemsElement = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    
    if (cartItemsElement) {
        cartItemsElement.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <span>${item.name}</span>
                <span>${item.price.toLocaleString()} تومان</span>
                <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)">
                <button onclick="removeFromCart(${item.id})">حذف</button>
            `;
            cartItemsElement.appendChild(itemElement);

            total += item.price * item.quantity;
        });

        if (totalElement) {
            totalElement.textContent = total.toLocaleString() + ' تومان';
        }
    }
}

async function sendToTelegram(message) {
    const botToken = '6554434146:AAHNahL_2YGrlzmm-vvVwVikgf5mpheQoMk';
    const chatId = '5619969053';
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const data = {
        chat_id: chatId,
        text: message
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.ok) {
            throw new Error('Telegram API returned an error');
        }

        return true;
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
        return false;
    }
}

async function checkTelegramConnection() {
    try {
        const response = await fetch('https://api.telegram.org', { method: 'HEAD', mode: 'no-cors' });
        return true;
    } catch (error) {
        console.error('Error checking Telegram connection:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateCartIcon();
    displayCart();

    const form = document.getElementById('customer-info-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'در حال ارسال...';

            if (!(await checkTelegramConnection())) {
                alert('لطفاً اتصال اینترنت و فیلترشکن خود را بررسی کنید و دوباره تلاش کنید.');
                submitButton.disabled = false;
                submitButton.textContent = 'ثبت سفارش';
                return;
            }

            const name = document.getElementById('customer-name').value;
            const phone = document.getElementById('customer-phone').value;
            const postcode = document.getElementById('customer-postcode').value;
            const address = document.getElementById('customer-address').value;

            let message = `سفارش جدید:\n\n`;
            message += `نام: ${name}\n`;
            message += `شماره تماس: ${phone}\n`;
            message += `کد پستی: ${postcode}\n`;
            message += `آدرس: ${address}\n\n`;
            message += `محصولات:\n`;

            cart.forEach(item => {
                message += `${item.name} - تعداد: ${item.quantity} - قیمت: ${item.price.toLocaleString()} تومان\n`;
            });

            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            message += `\nجمع کل: ${total.toLocaleString()} تومان`;

            const messageSent = await sendToTelegram(message);

            if (messageSent) {
                alert('سفارش شما با موفقیت ثبت شد. لطفاً منتظر تماس ما باشید.');
                cart = [];
                updateCart();
                form.reset();
            } else {
                alert('متأسفانه در ثبت سفارش مشکلی پیش آمد. لطفاً دوباره تلاش کنید.');
            }

            submitButton.disabled = false;
            submitButton.textContent = 'ثبت سفارش';
        });
    }
});
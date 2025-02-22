document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // غیرفعال کردن دکمه ثبت نام برای جلوگیری از ثبت چندباره
    const submitButton = document.querySelector('.submit-btn');
    submitButton.disabled = true;
    submitButton.textContent = 'در حال ثبت...';

    const formData = {
        fullname: document.getElementById('fullname').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };

    const botToken = '6554434146:AAHNahL_2YGrlzmm-vvVwVikgf5mpheQoMk';
    const chatId = '5619969053';
    
    const message = `
🔥 ثبت نام جدید در دوره هک وای فای

👤 نام و نام خانوادگی: ${formData.fullname}
📧 ایمیل: ${formData.email}
📱 شماره تماس: ${formData.phone}
    `;

    // ایجاد المان برای نمایش پیام‌ها
    const messageDiv = document.createElement('div');
    messageDiv.style.padding = '1rem';
    messageDiv.style.marginTop = '1rem';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.fontWeight = 'bold';

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();

        if (response.ok && data.ok) {
            // موفقیت در ثبت نام
            messageDiv.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
            messageDiv.style.color = '#00ff00';
            messageDiv.textContent = 'ثبت نام شما با موفقیت انجام شد. به زودی با شما تماس خواهیم گرفت.';
            
            // پاک کردن فرم
            document.getElementById('registerForm').reset();
            
            // ریدایرکت بعد از 3 ثانیه
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        } else {
            throw new Error('خطا در ارسال اطلاعات');
        }
    } catch (error) {
        // خطا در ثبت نام
        messageDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        messageDiv.style.color = '#ff0000';
        messageDiv.textContent = 'متأسفانه مشکلی در ثبت نام پیش آمده. لطفاً دوباره تلاش کنید.';
        console.error('Error:', error);
        
        // فعال کردن مجدد دکمه
        submitButton.disabled = false;
        submitButton.textContent = 'ثبت نام و پرداخت';
    }

    // نمایش پیام
    const form = document.getElementById('registerForm');
    form.parentNode.insertBefore(messageDiv, form.nextSibling);
});

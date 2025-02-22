// تایمر معکوس
const countdown = document.getElementById('countdown');
const eventDate = new Date('2025-02-23T21:00:00').getTime(); // تاریخ رویداد: ۵ اسفند ۱۴۰۳ ساعت ۲۱:۰۰

function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdown.innerHTML = `${days} روز ${hours} ساعت ${minutes} دقیقه ${seconds} ثانیه`;

    if (distance < 0) {
        clearInterval(interval);
        countdown.innerHTML = 'رویداد شروع شده است!';
    }
}

const interval = setInterval(updateCountdown, 1000);

// ارسال فرم ثبت نام به تلگرام
document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    const message = `نام: ${fullName}%0Aشماره تماس: ${phone}%0Aایمیل: ${email}`;
    const botToken = '6554434146:AAHNahL_2YGrlzmm-vvVwVikgf5mpheQoMk'; // توکن ربات
    const chatId = '5619969053'; // شناسه چت

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${message}`)
        .then(response => {
            if (response.ok) {
                alert('ثبت نام شما با موفقیت انجام شد!');
            } else {
                alert('خطا در ارسال اطلاعات، لطفاً دوباره تلاش کنید.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

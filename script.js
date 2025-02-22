// Set the target date (5 Esfand 1403 at 21:00)
const targetDate = new Date('2025-02-24T21:00:00');

function updateCountdown() {
    const currentDate = new Date();
    const difference = targetDate - currentDate;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

    if (difference < 0) {
        clearInterval(countdownInterval);
        document.getElementById('countdown').innerHTML = '<h2>دوره شروع شده است!</h2>';
    }
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

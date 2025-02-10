document.querySelector("form").addEventListener("submit", function(event) {
    event.preventDefault();
    alert("پیام شما ارسال شد!");
});
document.querySelectorAll(".product-checkbox").forEach(function(checkbox) {
    checkbox.addEventListener("change", function() {
        let quantityInput = this.nextElementSibling.nextElementSibling; // فیلد عددی کنار چک‌باکس
        quantityInput.disabled = !this.checked; // فعال/غیرفعال کردن فیلد
        if (!this.checked) {
            quantityInput.value = ""; // پاک کردن مقدار اگر چک‌باکس غیرفعال شد
        }
    });
});

<?php
// توکن ربات:
$BOT_TOKEN = '8082033592:AAG-HyRXpNXpq9yViT98Hfib62hsuo-CcIM';
$CHANNEL_ID = '@takhfifdigik';

// تابع ارسال پیام به تلگرام
function sendMessage($token, $chat_id, $text) {
    $url = "https://api.telegram.org/bot$token/sendMessage";
    $post_fields = [
        'chat_id' => $chat_id,
        'text' => $text,
        'parse_mode' => 'HTML'
    ];

    $ch = curl_init(); 
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type:multipart/form-data"]);
    curl_setopt($ch, CURLOPT_URL, $url); 
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields); 
    $output = curl_exec($ch);
    curl_close($ch);

    return json_decode($output, true);
}

// پیام نمونه تخفیف
$discountPercent = 20;
$priceBefore = 1000000;
$priceAfter = 800000;
$productName = "کفش اسپرت مردانه";
$productLink = "https://digikala.com/product/12345";

$message = "🔥 تخفیف جدید 🔥\n";
$message .= "<b>$productName</b>\n";
$message .= "قیمت قبل: <s>" . number_format($priceBefore) . " تومان</s>\n";
$message .= "قیمت بعد از تخفیف: <b>" . number_format($priceAfter) . " تومان</b>\n";
$message .= "تخفیف: $discountPercent%\n";
$message .= "مشخصات محصول را باز کنید 👇\n";
$message .= "<a href='$productLink'>مشاهده محصول</a>";

// ارسال پیام
$response = sendMessage($BOT_TOKEN, $CHANNEL_ID, $message);

if (!$response || !$response['ok']) {
    error_log("Send message failed: " . json_encode($response));
}
?>

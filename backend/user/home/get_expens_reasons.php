<?php
// إضافة هيدرز الـ CORS للسماح بالاتصال من أي مكان
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

$spending_sectors = [
    "Suppliers",
    "Local Shopping",
    "Beverages & Coffee Beans",
    "Staff Salaries & Wages",
    "Bonuses & Incentives",
    "Property Rent",
    "Electricity & Water",
    "Wi-Fi & Phone Lines",
    "Ads & Marketing Campaigns",
    "Photography & Videography",
    "POS System Subscriptions",
    "Maintenance",
    "Knife Sharpening",
    "Pest Control Services",
    "Business Rates",
    "HMRC (PAYE)",
    "HMRC (VAT)",
    "Staff Accommodation & Transportation",
    "Staff Uniforms",
    "Amazon",
    "Marketing",
    "SEO",
    "TIPS"
];

echo json_encode($spending_sectors, JSON_UNESCAPED_UNICODE);

?>
<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Methode nicht erlaubt']);
    exit;
}

$to = 'Herr.heuer2233@gmail.com';

$name    = isset($_POST['name'])    ? strip_tags(trim($_POST['name']))    : '';
$email   = isset($_POST['email'])   ? strip_tags(trim($_POST['email']))   : '';
$phone   = isset($_POST['phone'])   ? strip_tags(trim($_POST['phone']))   : '';

// Validate required fields
if (empty($name) || empty($email) || empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Alle Felder sind erforderlich.']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ungültige E-Mail-Adresse.']);
    exit;
}

$subject = 'Windows Bereinigungsprüfung - Supportanfrage von ' . $name;

$body  = "Name: {$name}\r\n";
$body .= "Email: {$email}\r\n";
$body .= "Telefon: {$phone}\r\n";

$headers  = "From: {$name} <{$email}>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'E-Mail wurde erfolgreich gesendet.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.']);
}

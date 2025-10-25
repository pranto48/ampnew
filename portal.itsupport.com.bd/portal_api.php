<?php
require_once 'includes/functions.php';

header('Content-Type: application/json');

$pdo = getLicenseDbConnection();
$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Allow 'get_demo_license' action without customer login
if ($action !== 'get_demo_license' && !isCustomerLoggedIn()) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access.']);
    exit;
}

$customer_id = $_SESSION['customer_id'] ?? null; // customer_id might be null for demo license

switch ($action) {
    case 'get_profile':
        $customer_data = getCustomerData($customer_id);
        $profile_data = getProfileData($customer_id);
        echo json_encode(array_merge($customer_data, $profile_data));
        break;

    case 'update_profile':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $first_name = trim($input['first_name'] ?? '');
            $last_name = trim($input['last_name'] ?? '');
            $address = trim($input['address'] ?? '');
            $phone = trim($input['phone'] ?? '');
            $avatar_url = trim($input['avatar_url'] ?? '');

            if (empty($first_name) || empty($last_name)) {
                http_response_code(400);
                echo json_encode(['error' => 'First Name and Last Name are required.']);
                exit;
            }

            if (updateCustomerProfile($customer_id, $first_name, $last_name, $address, $phone, $avatar_url)) {
                // Update session name if first/last name changed
                $_SESSION['customer_name'] = $first_name . ' ' . $last_name;
                echo json_encode(['success' => true, 'message' => 'Profile updated successfully.']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update profile.']);
            }
        }
        break;
        
    case 'get_products': // NEW ACTION
        $stmt = $pdo->query("SELECT id, name, description, price, max_devices, license_duration_days FROM `products` ORDER BY price ASC");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'products' => $products]);
        break;

    case 'get_demo_license': // NEW ACTION for demo license
        try {
            $license_key = createDemoLicense();
            if ($license_key) {
                echo json_encode(['success' => true, 'license_key' => $license_key, 'message' => 'Demo license generated successfully. It is valid for 7 days and 5 devices.']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to generate demo license. Product not found or database error.']);
            }
        } catch (Exception $e) {
            error_log("Error generating demo license: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'An internal error occurred while generating demo license.']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Invalid API action.']);
        break;
}
?>
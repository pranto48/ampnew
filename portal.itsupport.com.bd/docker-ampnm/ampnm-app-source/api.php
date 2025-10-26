<?php
require_once __DIR__ . '/includes/bootstrap.php'; // Load bootstrap for DB connection and functions

header('Content-Type: application/json');

$pdo = getAppDbConnection(); // Get connection to the AMPNM app's database
$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Ensure user is logged in for most actions
// 'set_app_license_key' is allowed without user login for initial setup
if (!isUserLoggedIn() && $action !== 'login' && $action !== 'register' && $action !== 'get_license_status' && $action !== 'set_app_license_key') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access.']);
    exit;
}

$user_id = $_SESSION['user_id'] ?? null; // Get logged-in user ID
$user_role = $_SESSION['user_role'] ?? 'guest'; // Get logged-in user role

// Admin-only actions
$admin_actions = ['get_users', 'add_user', 'update_user_role', 'delete_user'];
if (in_array($action, $admin_actions) && $user_role !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Admin privileges required for this action.']);
    exit;
}

switch ($action) {
    case 'get_license_status':
        // This action is allowed without user login, but requires app license key
        $license_status = getAppLicenseStatus();
        echo json_encode(['success' => true, 'license_status' => $license_status]);
        break;

    case 'set_app_license_key':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $license_key = trim($input['license_key'] ?? '');
            if (empty($license_key)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'License key is required.']);
                exit;
            }

            // Before saving, verify the key with the external portal
            $installation_id = getInstallationId();
            if (empty($installation_id)) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Application installation ID missing.']);
                exit;
            }

            $ch = curl_init(LICENSE_API_URL);
            $post_fields = json_encode([
                'app_license_key' => $license_key,
                'user_id' => 'api_call', // A dummy user ID for API validation
                'current_device_count' => 0, // No devices yet for this check
                'installation_id' => $installation_id,
            ]);

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($response === false || $httpCode !== 200) {
                error_log("License API cURL Error during set_app_license_key: " . $curlError . " HTTP: " . $httpCode . " Response: " . $response);
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to verify license with external portal.']);
                exit;
            }

            $licenseData = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE || !isset($licenseData['success']) || $licenseData['success'] !== true) {
                error_log("License API JSON Parse Error or invalid response during set_app_license_key: " . json_last_error_msg() . " Response: " . $response);
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => $licenseData['message'] ?? 'Invalid license key provided.']);
                exit;
            }

            // If verification is successful, save the key
            if (setAppLicenseKey($license_key)) {
                echo json_encode(['success' => true, 'message' => 'License key set successfully.']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to save license key to database.']);
            }
        }
        break;

    case 'get_user_info':
        if ($user_id) {
            $user_info = getUserById($user_id);
            if ($user_info) {
                echo json_encode(['success' => true, 'user' => ['id' => $user_info['id'], 'username' => $user_info['username'], 'email' => $user_info['email'], 'role' => $user_info['role']]]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'User not found.']);
            }
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'User not authenticated.']);
        }
        break;

    // --- Network Device Management ---
    case 'get_network_devices':
        $map_id = $_GET['map_id'] ?? null;
        $devices = getNetworkDevices($user_id, $map_id);
        echo json_encode(['success' => true, 'devices' => $devices]);
        break;

    case 'add_device':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $name = trim($input['name'] ?? '');
            $ip_address = trim($input['ip_address'] ?? '');
            $type = trim($input['type'] ?? '');
            $description = trim($input['description'] ?? '');
            $map_id = trim($input['map_id'] ?? '');
            $position_x = (float)($input['position_x'] ?? 0);
            $position_y = (float)($input['position_y'] ?? 0);

            if (empty($name) || empty($ip_address) || empty($type) || empty($map_id)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Name, IP Address, Type, and Map ID are required.']);
                exit;
            }

            // Check license limits before adding
            $license_status = getAppLicenseStatus();
            if (!$license_status['can_add_device']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => $license_status['license_message'] ?? 'Device limit reached.']);
                exit;
            }

            $device_id = addNetworkDevice($user_id, $name, $ip_address, $type, $description, $map_id, $position_x, $position_y);
            if ($device_id) {
                $new_device = getNetworkDeviceById($device_id); // Fetch the newly added device
                echo json_encode(['success' => true, 'message' => 'Device added successfully.', 'device' => $new_device]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to add device.']);
            }
        }
        break;

    case 'update_device_position':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $updates = $input['updates'] ?? [];
            if (!is_array($updates)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid update format.']);
                exit;
            }

            $success_count = 0;
            foreach ($updates as $device_update) {
                $device_id = $device_update['id'] ?? null;
                $position_x = (float)($device_update['position_x'] ?? 0);
                $position_y = (float)($device_update['position_y'] ?? 0);
                $name = trim($device_update['name'] ?? '');
                $ip_address = trim($device_update['ip_address'] ?? '');
                $type = trim($device_update['type'] ?? '');
                $description = trim($device_update['description'] ?? '');
                $map_id = trim($device_update['map_id'] ?? '');

                if ($device_id && updateNetworkDevice($user_id, $device_id, $name, $ip_address, $type, $description, $map_id, $position_x, $position_y)) {
                    $success_count++;
                }
            }

            if ($success_count > 0) {
                echo json_encode(['success' => true, 'message' => "Updated {$success_count} device(s)."]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'No devices updated or failed to update.']);
            }
        }
        break;

    case 'delete_device':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $device_id = trim($input['id'] ?? '');
            if (empty($device_id)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Device ID is required.']);
                exit;
            }
            if (deleteNetworkDevice($user_id, $device_id)) {
                echo json_encode(['success' => true, 'message' => 'Device deleted successfully.']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to delete device.']);
            }
        }
        break;

    // --- Network Map Management ---
    case 'get_maps':
        $maps = getNetworkMaps($user_id);
        echo json_encode(['success' => true, 'maps' => $maps]);
        break;

    case 'create_map':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $name = trim($input['name'] ?? '');
            if (empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Map name is required.']);
                exit;
            }
            $map_id = createNetworkMap($user_id, $name);
            if ($map_id) {
                $new_map = getNetworkMapById($map_id);
                echo json_encode(['success' => true, 'message' => 'Map created successfully.', 'map' => $new_map]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to create map.']);
            }
        }
        break;

    case 'update_map':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $map_id = trim($input['id'] ?? '');
            $name = trim($input['name'] ?? '');
            if (empty($map_id) || empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Map ID and name are required.']);
                exit;
            }
            if (updateNetworkMap($user_id, $map_id, $name)) {
                $updated_map = getNetworkMapById($map_id);
                echo json_encode(['success' => true, 'message' => 'Map updated successfully.', 'map' => $updated_map]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to update map.']);
            }
        }
        break;

    case 'delete_map':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $map_id = trim($input['id'] ?? '');
            if (empty($map_id)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Map ID is required.']);
                exit;
            }
            if (deleteNetworkMap($user_id, $map_id)) {
                echo json_encode(['success' => true, 'message' => 'Map deleted successfully.']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to delete map.']);
            }
        }
        break;

    // --- User Management (NEW) ---
    case 'get_users':
        $users = getAllUsers();
        echo json_encode(['success' => true, 'users' => $users]);
        break;

    case 'add_user':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = trim($input['username'] ?? '');
            $email = trim($input['email'] ?? '');
            $password = $input['password'] ?? '';
            $role = $input['role'] ?? 'read_user';

            if (empty($username) || empty($email) || empty($password)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Username, email, and password are required.']);
                exit;
            }
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid email format.']);
                exit;
            }
            if (strlen($password) < 6) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters long.']);
                exit;
            }

            $user_id = addUser($username, $email, $password, $role);
            if ($user_id) {
                $new_user = getUserById($user_id);
                echo json_encode(['success' => true, 'message' => 'User added successfully.', 'user' => $new_user]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to add user. User with this email or username might already exist.']);
            }
        }
        break;

    case 'update_user_role':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = trim($input['id'] ?? '');
            $role = $input['role'] ?? 'read_user';

            if (empty($id) || !in_array($role, ['admin', 'network_manager', 'read_user'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'User ID and a valid role are required.']);
                exit;
            }

            if (updateUserRole($id, $role)) {
                $updated_user = getUserById($id);
                echo json_encode(['success' => true, 'message' => 'User role updated successfully.', 'user' => $updated_user]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to update user role.']);
            }
        }
        break;

    case 'delete_user':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = trim($input['id'] ?? '');
            if (empty($id)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'User ID is required.']);
                exit;
            }

            if (deleteUser($id)) {
                echo json_encode(['success' => true, 'message' => 'User deleted successfully.']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to delete user.']);
            }
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Invalid API action.']);
        break;
}
?>
<?php
require_once __DIR__ . '/includes/bootstrap.php'; // Load bootstrap for DB connection and functions

header('Content-Type: application/json');

$pdo = getAppDbConnection(); // Get connection to the AMPNM app's database
$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Ensure user is logged in for most actions
if (!isUserLoggedIn() && $action !== 'login' && $action !== 'register' && $action !== 'get_license_status') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access.']);
    exit;
}

$user_id = $_SESSION['user_id'] ?? null; // Get logged-in user ID

switch ($action) {
    case 'get_license_status':
        // This action is allowed without user login, but requires app license key
        $license_status = getAppLicenseStatus();
        echo json_encode(['success' => true, 'license_status' => $license_status]);
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

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Invalid API action.']);
        break;
}
?>
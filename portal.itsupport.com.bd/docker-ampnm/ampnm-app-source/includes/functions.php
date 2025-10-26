<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Include database configuration for the AMPNM app
require_once __DIR__ . '/../config.php';

// Function to get database connection (defined in config.php for AMPNM app)
// function getAppDbConnection() is already defined in config.php

// Function to check if the AMPNM app database connection is active
function checkAppDbConnection() {
    try {
        $pdo = getAppDbConnection();
        $pdo->query("SELECT 1"); // A simple query to check connection
        return true;
    } catch (PDOException $e) {
        error_log("AMPNM App DB connection check failed: " . $e->getMessage());
        return false;
    }
}

// --- User Authentication Functions ---
function authenticateUser($username, $password) {
    $pdo = getAppDbConnection();
    $stmt = $pdo->prepare("SELECT id, password, username, email, role FROM `users` WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        return true;
    }
    return false;
}

function isUserLoggedIn() {
    return isset($_SESSION['user_id']);
}

function logoutUser() {
    unset($_SESSION['user_id']);
    unset($_SESSION['username']);
    unset($_SESSION['user_email']);
    unset($_SESSION['user_role']);
    session_destroy();
    session_start(); // Start a new session for potential new login
}

function redirectToLogin() {
    header('Location: login.php');
    exit;
}

function getUserById($user_id) {
    $pdo = getAppDbConnection();
    $stmt = $pdo->prepare("SELECT id, username, email, role FROM `users` WHERE id = ?");
    $stmt->execute([$user_id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// --- License Verification Functions ---
function getAppLicenseKey() {
    $pdo = getAppDbConnection();
    $stmt = $pdo->query("SELECT setting_value FROM `app_settings` WHERE setting_key = 'app_license_key'");
    $result = $stmt->fetchColumn();
    return $result ?: null;
}

function setAppLicenseKey($key) {
    $pdo = getAppDbConnection();
    $stmt = $pdo->prepare("INSERT INTO `app_settings` (setting_key, setting_value) VALUES ('app_license_key', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
    return $stmt->execute([$key, $key]);
}

function getInstallationId() {
    $pdo = getAppDbConnection();
    $stmt = $pdo->query("SELECT setting_value FROM `app_settings` WHERE setting_key = 'installation_id'");
    $result = $stmt->fetchColumn();
    return $result ?: null;
}

function setInstallationId($id) {
    $pdo = getAppDbConnection();
    $stmt = $pdo->prepare("INSERT INTO `app_settings` (setting_key, setting_value) VALUES ('installation_id', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
    return $stmt->execute([$id, $id]);
}

function getAppLicenseStatus() {
    $license_key = getAppLicenseKey();
    $installation_id = getInstallationId();
    $current_device_count = 0; // Placeholder, will be updated by verify_license.php

    $status = [
        'app_license_key' => $license_key,
        'can_add_device' => false,
        'max_devices' => 0,
        'license_message' => 'License not configured.',
        'license_status_code' => 'not_configured',
        'license_grace_period_end' => null,
        'installation_id' => $installation_id,
    ];

    if (!$license_key) {
        return $status;
    }

    if (!defined('LICENSE_API_URL') || empty(LICENSE_API_URL)) {
        $status['license_message'] = 'License API URL is not defined in config.php.';
        $status['license_status_code'] = 'config_error';
        return $status;
    }

    // Fetch current device count from the local database
    $pdo = getAppDbConnection();
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM `network_devices` WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id'] ?? 'guest']); // Use actual user_id if logged in
    $current_device_count = $stmt->fetchColumn();

    $ch = curl_init(LICENSE_API_URL);
    $post_fields = json_encode([
        'app_license_key' => $license_key,
        'user_id' => $_SESSION['user_id'] ?? 'guest', // Pass actual user ID or a guest identifier
        'current_device_count' => $current_device_count,
        'installation_id' => $installation_id,
    ]);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5); // 5-second timeout

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        error_log("License API cURL Error: " . $curlError);
        $status['license_message'] = 'Failed to connect to license verification service.';
        $status['license_status_code'] = 'connection_error';
    } elseif ($httpCode !== 200) {
        error_log("License API HTTP Error: " . $httpCode . " - Response: " . $response);
        $status['license_message'] = 'License verification service returned an error.';
        $status['license_status_code'] = 'api_error';
    } else {
        $licenseData = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("License API JSON Parse Error: " . json_last_error_msg() . " - Response: " . $response);
            $status['license_message'] = 'Invalid response from license verification service.';
            $status['license_status_code'] = 'parse_error';
        } elseif (isset($licenseData['success']) && $licenseData['success'] === true) {
            $max_devices = $licenseData['max_devices'] ?? 0;
            $can_add_device = ($current_device_count < $max_devices) || ($max_devices == 99999); // 99999 for unlimited
            
            $status['can_add_device'] = $can_add_device;
            $status['max_devices'] = $max_devices;
            $status['license_message'] = $licenseData['message'] ?? 'License is active.';
            $status['license_status_code'] = $licenseData['actual_status'] ?? 'active';

            if (!$can_add_device) {
                $status['license_message'] = "Device limit reached ({$current_device_count}/{$max_devices}).";
            }
        } else {
            $status['license_message'] = $licenseData['message'] ?? 'Invalid or expired license key.';
            $status['license_status_code'] = $licenseData['actual_status'] ?? 'invalid';
        }
    }
    return $status;
}

// --- Network Device Functions ---
function getNetworkDevices($user_id, $map_id = null) {
    $pdo = getAppDbConnection();
    $sql = "SELECT nd.*, nm.name as map_name FROM `network_devices` nd LEFT JOIN `network_maps` nm ON nd.map_id = nm.id WHERE nd.user_id = ?";
    $params = [$user_id];
    if ($map_id) {
        $sql .= " AND nd.map_id = ?";
        $params[] = $map_id;
    }
    $sql .= " ORDER BY nd.name ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getNetworkDeviceById($device_id) {
    $pdo = getAppDbConnection();
    $stmt = $pdo->prepare("SELECT nd.*, nm.name as map_name FROM `network_devices` nd LEFT JOIN `network_maps` nm ON nd.map_id = nm.id WHERE nd.id = ?");
    $stmt->execute([$device_id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function addNetworkDevice($user_id, $name, $ip_address, $type, $description, $map_id, $position_x = 0, $position_y = 0) {
    $pdo = getAppDbConnection();
    $stmt = $pdo->prepare("INSERT INTO `network_devices` (user_id, name, ip_address, type, description, map_id, position_x, position_y) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt->execute([$user_id, $name, $ip_address, $type, $description, $map_id, $position_x, $position_y])) {
        return $pdo->lastInsertId();
    }
    return false;
}

function updateNetworkDevice($user_id, $device_id, $name, $ip_address, $type, $description, $map_id, $position_x, $position_y) {
    $pdo = getAppDbConnection();
    $sql = "UPDATE `network_devices` SET name = ?, ip_address = ?, type = ?, description = ?, map_id = ?, position_x = ?, position_y = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([$name, $ip_address, $type, $description, $map_id, $position_x, $position_y, $device_id, $user_id]);
}

// --- Network Map Functions ---
function getNetworkMaps($user_id) {
    $pdo = getAppDbConnection();
    $stmt = $pdo->prepare("SELECT * FROM `network_maps` WHERE user_id = ? ORDER BY name ASC");
    $stmt->execute([$user_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getNetworkMapById($map_id) {
    $pdo = getAppDbConnection();
    $stmt = $pdo->prepare("SELECT * FROM `network_maps` WHERE id = ?");
    $stmt->execute([$map_id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function createNetworkMap($user_id, $name) {
    $pdo = getAppDbConnection();
    $stmt = $pdo->prepare("INSERT INTO `network_maps` (user_id, name) VALUES (?, ?)");
    if ($stmt->execute([$user_id, $name])) {
        return $pdo->lastInsertId();
    }
    return false;
}

function updateNetworkMap($user_id, $map_id, $name) {
    $pdo = getAppDbConnection();
    $stmt = $pdo->prepare("UPDATE `network_maps` SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?");
    return $stmt->execute([$name, $map_id, $user_id]);
}

// --- HTML Header/Footer for the AMPNM app ---
function app_header($title = "AMPNM") {
    echo '<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>' . htmlspecialchars($title) . '</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <link rel="stylesheet" href="assets/css/style.css">
    </head>
    <body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col">
        <header class="bg-slate-800 shadow-md py-4">
            <div class="container mx-auto px-4 flex justify-between items-center">
                <a href="index.php" class="text-2xl font-bold text-cyan-400">AMPNM</a>
                <nav>
                    <ul class="flex space-x-4">';
    if (isUserLoggedIn()) {
        echo '<li><a href="dashboard.php" class="text-slate-300 hover:text-cyan-400">Dashboard</a></li>';
        echo '<li><a href="devices.php" class="text-slate-300 hover:text-cyan-400">Devices</a></li>';
        echo '<li><a href="ping.php" class="text-slate-300 hover:text-cyan-400">Ping Test</a></li>';
        echo '<li><a href="network_scanner.php" class="text-slate-300 hover:text-cyan-400">Network Scanner</a></li>';
        echo '<li><a href="logout.php" class="text-slate-300 hover:text-cyan-400">Logout (' . htmlspecialchars($_SESSION['username']) . ')</a></li>';
    } else {
        echo '<li><a href="login.php" class="text-slate-300 hover:text-cyan-400">Login</a></li>';
        echo '<li><a href="register.php" class="text-slate-300 hover:text-cyan-400">Register</a></li>';
    }
    echo '</ul>
                </nav>
            </div>
        </header>
        <main class="container mx-auto px-4 py-8 flex-grow">';
}

function app_footer() {
    echo '</main>
        <footer class="bg-slate-800 text-slate-400 text-center py-4 mt-auto">
            <p>&copy; ' . date("Y") . ' AMPNM. All rights reserved.</p>
        </footer>
    </body>
    </html>';
}
?>
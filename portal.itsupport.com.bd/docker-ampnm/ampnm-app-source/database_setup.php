<?php
// This script runs once to set up the database for the AMPNM application.
// It should be accessed directly only on initial setup.

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$setup_message = '';
$config_file_path = __DIR__ . '/config.php';

// Helper function to check if a column exists (needed for migrations)
function columnExists($pdo, $db, $table, $column) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?");
    $stmt->execute([$db, $table, $column]);
    return $stmt->fetchColumn() > 0;
}

// Function to update config.php with new DB credentials
function updateConfigFile($db_server, $db_name, $db_username, $db_password, $license_api_url) {
    global $config_file_path;
    $content = <<<EOT
<?php
// AMPNM Application Database Configuration
define('APP_DB_SERVER', '{$db_server}');
define('APP_DB_USERNAME', '{$db_username}');
define('APP_DB_PASSWORD', '{$db_password}');
define('APP_DB_NAME', '{$db_name}');

// External License Service API URL
define('LICENSE_API_URL', '{$license_api_url}');

// Function to create database connection for the AMPNM application
function getAppDbConnection() {
    static \$pdo = null;

    if (\$pdo !== null) {
        try {
            \$pdo->query("SELECT 1");
        } catch (PDOException \$e) {
            if (isset(\$e->errorInfo[1]) && \$e->errorInfo[1] == 2006) {
                \$pdo = null;
            } else {
                throw \$e;
            }
        }
    }

    if (\$pdo === null) {
        try {
            \$dsn = "mysql:host=" . APP_DB_SERVER . ";dbname=" . APP_DB_NAME . ";charset=utf8mb4";
            \$options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            \$pdo = new PDO(\$dsn, APP_DB_USERNAME, APP_DB_PASSWORD, \$options);
        } catch(PDOException \$e) {
            die("ERROR: Could not connect to the application database. " . \$e->getMessage());
        }
    }
    
    return \$pdo;
}
EOT;
    return file_put_contents($config_file_path, $content);
}

// Helper to check if config is present and valid
function isConfiguredAndDbConnects($config_file_path) {
    if (!file_exists($config_file_path)) return false;
    require_once $config_file_path;
    if (!defined('APP_DB_SERVER') || !defined('APP_DB_NAME')) return false;
    try {
        getAppDbConnection(); // Attempt connection
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

// Helper to check if tables exist
function areTablesSetup($pdo) {
    $tables_to_check = ['users', 'network_devices', 'ping_history', 'app_settings', 'network_maps']; // Added network_maps
    foreach ($tables_to_check as $table) {
        try {
            $pdo->query("SELECT 1 FROM `$table` LIMIT 1");
        } catch (PDOException $e) {
            return false; // Table doesn't exist
        }
    }
    return true;
}

// Determine current step
$step = 1;
if (isConfiguredAndDbConnects($config_file_path)) {
    require_once $config_file_path; // Ensure config is loaded for getAppDbConnection
    $pdo = getAppDbConnection();
    if (areTablesSetup($pdo)) {
        $step = 2; // All tables exist
    }
}

// Handle POST requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST') { // Modified line
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'configure_db' && $step === 1) {
            $db_server = $_POST['db_server'] ?? '';
            $db_name = $_POST['db_name'] ?? '';
            $db_username = $_POST['db_username'] ?? '';
            $db_password = $_POST['db_password'] ?? '';
            $license_api_url = $_POST['license_api_url'] ?? '';

            if (empty($db_server) || empty($db_name) || empty($db_username) || empty($license_api_url)) {
                $setup_message = '<p class="text-red-500">All database fields and License API URL are required.</p>';
            } else {
                try {
                    // Attempt to connect to MySQL server (without selecting a database)
                    $pdo_root = new PDO("mysql:host=$db_server", $db_username, $db_password);
                    $pdo_root->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                    // Create database if it doesn't exist
                    $pdo_root->exec("CREATE DATABASE IF NOT EXISTS `{$db_name}`");
                    $setup_message .= '<p class="text-green-500">Database ' . htmlspecialchars($db_name) . ' checked/created successfully.</p>';

                    // Update config.php
                    if (updateConfigFile($db_server, $db_name, $db_username, $db_password, $license_api_url)) {
                        $setup_message .= '<p class="text-green-500">Configuration saved to config.php.</p>';
                        $step = 2; // Move to next step
                        // Reload config to use new settings for subsequent checks
                        require_once $config_file_path;
                    } else {
                        $setup_message .= '<p class="text-red-500">Failed to write to config.php. Check file permissions.</p>';
                    }

                } catch (PDOException $e) {
                    $setup_message .= '<p class="text-red-500">Database connection or creation failed: ' . htmlspecialchars($e->getMessage()) . '</p>';
                }
            }
        } elseif ($_POST['action'] === 'setup_tables' && $step === 2) {
            try {
                require_once $config_file_path; // Ensure config is loaded
                $pdo = getAppDbConnection();
                $db_name = APP_DB_NAME; // Get DB name for migration checks

                // Create users table
                $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
                    `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    `username` VARCHAR(255) NOT NULL UNIQUE,
                    `email` VARCHAR(255) NOT NULL UNIQUE,
                    `password` VARCHAR(255) NOT NULL,
                    `role` ENUM('admin', 'network_manager', 'read_user') DEFAULT 'read_user',
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $setup_message .= '<p class="text-green-500">Table `users` checked/created successfully.</p>';

                // Create network_maps table (NEW)
                $pdo->exec("CREATE TABLE IF NOT EXISTS `network_maps` (
                    `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    `user_id` INT(11) UNSIGNED NOT NULL,
                    `name` VARCHAR(255) NOT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $setup_message .= '<p class="text-green-500">Table `network_maps` checked/created successfully.</p>';

                // Create network_devices table (updated to include map_id and position)
                $pdo->exec("CREATE TABLE IF NOT EXISTS `network_devices` (
                    `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    `user_id` INT(11) UNSIGNED NOT NULL,
                    `name` VARCHAR(255) NOT NULL,
                    `ip_address` VARCHAR(255) NOT NULL,
                    `type` VARCHAR(100) DEFAULT 'server',
                    `description` TEXT,
                    `status` ENUM('online', 'offline', 'unknown') DEFAULT 'unknown',
                    `last_ping` TIMESTAMP NULL,
                    `last_ping_result` TEXT NULL,
                    `last_ping_output` TEXT NULL,
                    `map_id` INT(11) UNSIGNED NULL, -- NEW: Foreign key to network_maps
                    `position_x` DECIMAL(10, 2) DEFAULT 0.00, -- NEW: X position for map
                    `position_y` DECIMAL(10, 2) DEFAULT 0.00, -- NEW: Y position for map
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
                    FOREIGN KEY (`map_id`) REFERENCES `network_maps`(`id`) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $setup_message .= '<p class="text-green-500">Table `network_devices` checked/created successfully.</p>';

                // Migration: Add map_id, position_x, position_y if they don't exist
                if (!columnExists($pdo, $db_name, 'network_devices', 'map_id')) {
                    $pdo->exec("ALTER TABLE `network_devices` ADD COLUMN `map_id` INT(11) UNSIGNED NULL AFTER `last_ping_output`;");
                    $pdo->exec("ALTER TABLE `network_devices` ADD CONSTRAINT `fk_map_id` FOREIGN KEY (`map_id`) REFERENCES `network_maps`(`id`) ON DELETE SET NULL;");
                    $setup_message .= '<p class="text-green-500">Migrated `network_devices` table: added `map_id` column and foreign key.</p>';
                }
                if (!columnExists($pdo, $db_name, 'network_devices', 'position_x')) {
                    $pdo->exec("ALTER TABLE `network_devices` ADD COLUMN `position_x` DECIMAL(10, 2) DEFAULT 0.00 AFTER `map_id`;");
                    $setup_message .= '<p class="text-green-500">Migrated `network_devices` table: added `position_x` column.</p>';
                }
                if (!columnExists($pdo, $db_name, 'network_devices', 'position_y')) {
                    $pdo->exec("ALTER TABLE `network_devices` ADD COLUMN `position_y` DECIMAL(10, 2) DEFAULT 0.00 AFTER `position_x`;");
                    $setup_message .= '<p class="text-green-500">Migrated `network_devices` table: added `position_y` column.</p>';
                }


                // Create ping_history table
                $pdo->exec("CREATE TABLE IF NOT EXISTS `ping_history` (
                    `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    `device_id` INT(11) UNSIGNED NOT NULL,
                    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `status` ENUM('online', 'offline') NOT NULL,
                    `latency_ms` INT(11) NULL,
                    `error_message` TEXT NULL,
                    FOREIGN KEY (`device_id`) REFERENCES `network_devices`(`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $setup_message .= '<p class="text-green-500">Table `ping_history` checked/created successfully.</p>';

                // Create app_settings table
                $pdo->exec("CREATE TABLE IF NOT EXISTS `app_settings` (
                    `setting_key` VARCHAR(255) PRIMARY KEY,
                    `setting_value` TEXT,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $setup_message .= '<p class="text-green-500">Table `app_settings` checked/created successfully.</p>';

                // Generate a unique installation ID if not already present
                $stmt = $pdo->query("SELECT setting_value FROM `app_settings` WHERE setting_key = 'installation_id'");
                if (!$stmt->fetchColumn()) {
                    $installation_id = uniqid('ampnm_', true);
                    $stmt = $pdo->prepare("INSERT INTO `app_settings` (setting_key, setting_value) VALUES ('installation_id', ?)");
                    $stmt->execute([$installation_id]);
                    $setup_message .= '<p class="text-green-500">Generated unique installation ID.</p>';
                }

                $setup_message .= '<p class="text-blue-500">Database setup for AMPNM application completed!</p>';
                // Redirect to license setup after successful database setup
                header('Location: license_setup.php');
                exit;

            } catch (PDOException $e) {
                $setup_message .= '<p class="text-red-500">Table creation or data insertion failed: ' . htmlspecialchars($e->getMessage()) . '</p>';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AMPNM Database Setup</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            font-family: sans-serif;
            background-color: #1a202c;
            color: #e2e8f0;
        }
        .setup-card {
            background-color: #2d3748;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            max-width: 500px;
            width: 90%;
        }
        .form-input {
            @apply w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500;
        }
        .btn-primary {
            @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
        }
        .loader { border: 4px solid #334155; border-top: 4px solid #22d3ee; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; display: inline-block; margin-right: 10px; vertical-align: middle; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen">
    <div class="setup-card">
        <h1 class="text-3xl font-bold text-white mb-6 text-center">AMPNM Database Setup</h1>
        
        <div class="mb-6 text-center">
            <?php if ($step === 1): ?>
                <span class="inline-block px-4 py-2 rounded-full bg-blue-500 text-white font-semibold">Step 1 of 2: Database Configuration</span>
            <?php elseif ($step === 2): ?>
                <span class="inline-block px-4 py-2 rounded-full bg-blue-500 text-white font-semibold">Step 2 of 2: Finalizing Tables</span>
            <?php endif; ?>
        </div>

        <?php if (!empty($setup_message)): ?>
            <div class="bg-gray-800 p-4 rounded-lg mb-6 text-sm">
                <?= $setup_message ?>
            </div>
        <?php endif; ?>

        <?php if ($step === 1): ?>
            <form method="POST" class="space-y-4">
                <input type="hidden" name="action" value="configure_db">
                <div>
                    <label for="db_server" class="block text-gray-300 text-sm font-bold mb-2">Database Host:</label>
                    <input type="text" id="db_server" name="db_server" class="form-input" value="<?= htmlspecialchars($_POST['db_server'] ?? 'db') ?>" required>
                </div>
                <div>
                    <label for="db_name" class="block text-gray-300 text-sm font-bold mb-2">Database Name:</label>
                    <input type="text" id="db_name" name="db_name" class="form-input" value="<?= htmlspecialchars($_POST['db_name'] ?? 'network_monitor') ?>" required>
                </div>
                <div>
                    <label for="db_username" class="block text-gray-300 text-sm font-bold mb-2">Database Username:</label>
                    <input type="text" id="db_username" name="db_username" class="form-input" value="<?= htmlspecialchars($_POST['db_username'] ?? 'user') ?>" required>
                </div>
                <div>
                    <label for="db_password" class="block text-gray-300 text-sm font-bold mb-2">Database Password:</label>
                    <input type="password" id="db_password" name="db_password" class="form-input" value="<?= htmlspecialchars($_POST['db_password'] ?? 'password') ?>">
                </div>
                <div>
                    <label for="license_api_url" class="block text-gray-300 text-sm font-bold mb-2">License Portal API URL:</label>
                    <input type="url" id="license_api_url" name="license_api_url" class="form-input" value="<?= htmlspecialchars($_POST['license_api_url'] ?? 'https://portal.itsupport.com.bd/verify_license.php') ?>" required>
                    <p class="text-xs text-gray-400 mt-1">This is the URL of your external license verification service.</p>
                </div>
                <button type="submit" class="btn-primary w-full">
                    <i class="fas fa-database mr-2"></i>Configure Database
                </button>
            </form>
        <?php elseif ($step === 2): ?>
            <form method="POST" class="space-y-4">
                <input type="hidden" name="action" value="setup_tables">
                <p class="text-gray-200 mb-4">Click "Finalize Installation" to create all necessary tables for AMPNM.</p>
                <button type="submit" class="btn-primary w-full">
                    <i class="fas fa-check-circle mr-2"></i>Finalize Installation
                </button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>
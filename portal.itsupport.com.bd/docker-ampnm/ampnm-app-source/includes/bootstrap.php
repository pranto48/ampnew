<?php
// This file is included at the top of every PHP page in the AMPNM app
// It handles session start, database connection, and redirects for setup/licensing

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Include main functions file
require_once __DIR__ . '/functions.php';

// Define paths for setup scripts
$database_setup_script = 'database_setup.php';
$license_setup_script = 'license_setup.php';
$login_script = 'login.php';
$register_script = 'register.php';
$react_app_index = 'index.html';

// Get current script name
$current_script = basename($_SERVER['PHP_SELF']);

// --- Step 1: Check if config.php exists and DB connection is valid ---
if (!file_exists(__DIR__ . '/../config.php') || !checkAppDbConnection()) {
    // If config is missing or DB connection fails, redirect to database setup
    if ($current_script !== $database_setup_script) {
        header('Location: ' . $database_setup_script);
        exit;
    }
} else {
    // Config exists and DB connects, now check if tables are set up
    require_once __DIR__ . '/../config.php'; // Ensure config is loaded
    $pdo = getAppDbConnection();
    
    // Check if essential tables exist (e.g., 'users', 'app_settings')
    try {
        $pdo->query("SELECT 1 FROM `users` LIMIT 1");
        $pdo->query("SELECT 1 FROM `app_settings` LIMIT 1");
    } catch (PDOException $e) {
        // Tables are missing, redirect to database setup
        if ($current_script !== $database_setup_script) {
            header('Location: ' . $database_setup_script);
            exit;
        }
    }

    // --- Step 2: Check if application license key is set ---
    $app_license_key = getAppLicenseKey();
    if (!$app_license_key) {
        // If license key is not set, redirect to license setup
        if ($current_script !== $license_setup_script) {
            header('Location: ' . $license_setup_script);
            exit;
        }
    } else {
        // --- Step 3: Verify license with external portal ---
        $license_status = getAppLicenseStatus();
        if ($license_status['license_status_code'] !== 'active' && $license_status['license_status_code'] !== 'free') {
            // If license is not active or free, redirect to license setup to re-enter/get new key
            if ($current_script !== $license_setup_script) {
                header('Location: ' . $license_setup_script . '?status=' . $license_status['license_status_code']);
                exit;
            }
        }
    }
}

// If we reach here, all setup checks passed.
// Now handle user authentication and redirect to the React app if logged in.

// List of PHP pages that should *not* redirect to index.html if setup is complete
$php_pages_to_render = [
    $database_setup_script,
    $license_setup_script,
    $login_script,
    $register_script,
    'api.php', // API endpoint should always render JSON
];

if (!in_array($current_script, $php_pages_to_render)) {
    if (isUserLoggedIn()) {
        // If logged in and not on a special PHP page, redirect to React app
        if ($current_script !== $react_app_index) {
            header('Location: ' . $react_app_index);
            exit;
        }
    } else {
        // If not logged in and not on login/register page, redirect to login
        if ($current_script !== $login_script && $current_script !== $register_script) {
            header('Location: ' . $login_script);
            exit;
        }
    }
}

// If the script reaches here, it means it's either a setup page, login/register, or the React app's index.html,
// and the bootstrap logic has determined it should be allowed to render.
?>
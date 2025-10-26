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
        // This check is crucial for every page load after initial setup
        $license_status = getAppLicenseStatus();
        if ($license_status['license_status_code'] !== 'active' && $license_status['license_status_code'] !== 'free') {
            // If license is not active or free, redirect to a license expired/invalid page
            // For now, we'll redirect to license_setup.php to re-enter/get new key
            if ($current_script !== $license_setup_script) {
                header('Location: ' . $license_setup_script . '?status=' . $license_status['license_status_code']);
                exit;
            }
        }
    }
}

// If we reach here, all checks passed or we are on a setup page.
?>
<?php
// AMPNM Application Database Configuration
define('APP_DB_SERVER', 'db');
define('APP_DB_USERNAME', 'user');
define('APP_DB_PASSWORD', 'password');
define('APP_DB_NAME', 'network_monitor');

// External License Service API URL
define('LICENSE_API_URL', 'https://portal.itsupport.com.bd/verify_license.php');

// Function to create database connection for the AMPNM application
function getAppDbConnection() {
    static $pdo = null;

    if ($pdo !== null) {
        try {
            $pdo->query("SELECT 1");
        } catch (PDOException $e) {
            if (isset($e->errorInfo[1]) && $e->errorInfo[1] == 2006) {
                $pdo = null;
            } else {
                throw $e;
            }
        }
    }

    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . APP_DB_SERVER . ";dbname=" . APP_DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, APP_DB_USERNAME, APP_DB_PASSWORD, $options);
        } catch(PDOException $e) {
            die("ERROR: Could not connect to the application database. " . $e->getMessage());
        }
    }
    
    return $pdo;
}
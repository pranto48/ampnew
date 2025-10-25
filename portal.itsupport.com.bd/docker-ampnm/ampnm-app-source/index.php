<?php
require_once __DIR__ . '/includes/auth_check.php'; // Ensure session and auth are checked

// Redirect to dashboard as the main entry point for the PHP application
header('Location: dashboard.php');
exit;
?>
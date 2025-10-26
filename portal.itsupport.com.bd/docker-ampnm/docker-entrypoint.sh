#!/bin/bash

# Wait for MySQL to be ready
/usr/local/bin/wait-for-it.sh db:3306 --timeout=60 --strict -- echo 'MySQL is up!'

echo 'Running database setup script...'
# Run the database setup script if it hasn't been run yet
# This will create tables and initial data if needed
php /var/www/html/database_setup.php

echo 'Checking application license status...'
# Check if the app_license_key is set in app_settings
LICENSE_KEY_SET=$(php -r '
    require_once '\''/var/www/html/config.php'\'';
    try {
        $pdo = getAppDbConnection(); // Corrected function name
        $stmt = $pdo->prepare('\''SELECT setting_value FROM app_settings WHERE setting_key = "app_license_key"'\''');
        $stmt->execute();
        echo $stmt->fetchColumn() ? '\''true'\'' : '\''false'\'';
    } catch (PDOException $e) {
        // If app_settings table doesn'\''t exist yet, it means database_setup.php might not have fully completed.
        // In this case, we assume license is not set.
        echo '\''false'\'';
    }
')

# If license key is not set, redirect to license_setup.php
if [ "$LICENSE_KEY_SET" = "false" ]; then
    echo "License key not set. Redirecting to license setup."
    # This will be handled by the PHP bootstrap logic, which will redirect to license_setup.php
    # The Apache server will serve the PHP files, and bootstrap.php will handle the redirect.
else
    echo "License key is set. Starting Apache..."
fi

# Start Apache in the foreground
exec apache2-foreground
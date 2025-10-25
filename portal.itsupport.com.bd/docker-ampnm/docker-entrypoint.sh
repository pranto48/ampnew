#!/bin/bash
set -ex # -x for debugging, -e for exit on error

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
/usr/local/bin/wait-for-it.sh db:3306 --timeout=60 --strict -- echo "MySQL is up!"

# Run database setup script
echo "Running database setup script..."
php /var/www/html/database_setup.php || { echo "ERROR: database_setup.php failed!"; exit 1; }

# Check if license_setup.php needs to be run (if license key is not yet set)
echo "Checking application license status..."
LICENSE_KEY_SET=$(php -r "
    require_once '/var/www/html/config.php';
    try {
        \$pdo = getDbConnection();
        \$stmt = \$pdo->prepare('SELECT setting_value FROM app_settings WHERE setting_key = \"app_license_key\"');
        \$stmt->execute();
        echo \$stmt->fetchColumn() ? 'true' : 'false';
    } catch (PDOException \$e) {
        // If app_settings table doesn't exist yet, it means database_setup.php might not have fully completed.
        // In this case, we assume license is not set.
        echo 'false';
    }
")

if [ "$LICENSE_KEY_SET" = "false" ]; then
    echo "Application license key not found. The application will redirect to license_setup.php."
else
    echo "Application license key is already configured."
fi

# Start Apache in the foreground
echo "Starting Apache..."
exec apache2-foreground
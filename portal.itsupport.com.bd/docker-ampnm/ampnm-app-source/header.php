<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AMPNM</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Chart.js and Vis.js will be included on specific pages that need them -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="bg-slate-900 text-slate-300 min-h-screen">
    <nav class="bg-slate-800/50 backdrop-blur-lg shadow-lg sticky top-0 z-50">
        <div class="container mx-auto px-4">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center">
                    <a href="dashboard.php" class="flex items-center gap-2 text-white font-bold">
                        <i class="fas fa-shield-halved text-cyan-400 text-2xl"></i>
                        <span>AMPNM</span>
                    </a>
                </div>
                <div class="hidden md:block">
                    <div id="main-nav" class="ml-10 flex items-baseline space-x-1">
                        <!-- Dashboard -->
                        <a href="dashboard.php" class="nav-link"><i class="fas fa-tachometer-alt fa-fw mr-2"></i>Dashboard</a>

                        <!-- Monitoring Dropdown -->
                        <div class="relative group">
                            <button class="nav-link dropdown-toggle">
                                <i class="fas fa-chart-line fa-fw mr-2"></i>Monitoring
                                <i class="fas fa-chevron-down ml-2 text-xs"></i>
                            </button>
                            <div class="dropdown-menu absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg hidden">
                                <a href="devices.php" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"><i class="fas fa-server fa-fw mr-2"></i>Devices</a>
                                <a href="ping.php" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"><i class="fas fa-wifi fa-fw mr-2"></i>Browser Ping</a>
                                <a href="server_ping.php" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"><i class="fas fa-desktop fa-fw mr-2"></i>Server Ping</a>
                                <a href="network_status.php" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"><i class="fas fa-network-wired fa-fw mr-2"></i>Network Status</a>
                                <a href="ping_history.php" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"><i class="fas fa-history fa-fw mr-2"></i>Ping History</a>
                            </div>
                        </div>

                        <!-- Network Tools Dropdown -->
                        <div class="relative group">
                            <button class="nav-link dropdown-toggle">
                                <i class="fas fa-tools fa-fw mr-2"></i>Network Tools
                                <i class="fas fa-chevron-down ml-2 text-xs"></i>
                            </button>
                            <div class="dropdown-menu absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg hidden">
                                <a href="network_scanner.php" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"><i class="fas fa-search fa-fw mr-2"></i>Network Scanner</a>
                                <a href="map.php" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"><i class="fas fa-project-diagram fa-fw mr-2"></i>Network Map</a>
                            </div>
                        </div>

                        <!-- Licensing Dropdown -->
                        <div class="relative group">
                            <button class="nav-link dropdown-toggle">
                                <i class="fas fa-key fa-fw mr-2"></i>Licensing
                                <i class="fas fa-chevron-down ml-2 text-xs"></i>
                            </button>
                            <div class="dropdown-menu absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg hidden">
                                <a href="license.php" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"><i class="fas fa-file-invoice fa-fw mr-2"></i>License Details</a>
                                <a href="products.php" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"><i class="fas fa-box-open fa-fw mr-2"></i>Products</a>
                            </div>
                        </div>

                        <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
                            <!-- Admin Tools Dropdown -->
                            <div class="relative group">
                                <button class="nav-link dropdown-toggle">
                                    <i class="fas fa-user-shield fa-fw mr-2"></i>Admin Tools
                                    <i class="fas fa-chevron-down ml-2 text-xs"></i>
                                </button>
                                <div class="dropdown-menu absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg hidden">
                                    <a href="users.php" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"><i class="fas fa-users-cog fa-fw mr-2"></i>Users</a>
                                    <a href="maintenance.php" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"><i class="fas fa-tools fa-fw mr-2"></i>Maintenance</a>
                                </div>
                            </div>
                        <?php endif; ?>

                        <!-- Logout -->
                        <a href="logout.php" class="nav-link"><i class="fas fa-sign-out-alt fa-fw mr-2"></i>Logout</a>
                    </div>
                </div>
            </div>
        </div>
    </nav>
    <?php if (isset($_SESSION['license_status_code']) && ($_SESSION['license_status_code'] === 'grace_period' || $_SESSION['license_status_code'] === 'expired' || $_SESSION['license_status_code'] === 'error' || $_SESSION['license_status_code'] === 'in_use' || $_SESSION['license_status_code'] === 'disabled')): ?>
        <div class="bg-red-600/20 border-b border-red-500 text-red-300 p-3 text-center text-sm font-medium">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            <?= htmlspecialchars($_SESSION['license_message']) ?>
            <?php if ($_SESSION['license_status_code'] !== 'disabled'): ?>
                <a href="https://portal.itsupport.com.bd/products.php" target="_blank" class="underline ml-2 hover:text-red-100">Renew License</a>
            <?php endif; ?>
        </div>
    <?php endif; ?>
    <div class="page-content">
<?php
require_once __DIR__ . '/includes/auth_check.php';
include __DIR__ . '/header.php';
?>

<main id="app">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-white mb-6">License Management</h1>

        <!-- Current License Information -->
        <div class="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 mb-8">
            <h2 class="text-xl font-semibold text-white mb-4">Current License Information</h2>
            <div id="licenseInfoLoader" class="text-center py-8"><div class="loader mx-auto"></div></div>
            <div id="licenseInfoContent" class="hidden space-y-3 text-slate-300">
                <p><strong>App License Key:</strong> <span id="displayLicenseKey" class="font-mono text-white">Loading...</span></p>
                <p><strong>Status:</strong> <span id="displayLicenseStatus" class="font-semibold">Loading...</span></p>
                <p><strong>Message:</strong> <span id="displayLicenseMessage">Loading...</span></p>
                <p><strong>Max Devices:</strong> <span id="displayMaxDevices">Loading...</span></p>
                <p><strong>Current Devices:</strong> <span id="displayCurrentDevices">Loading...</span></p>
                <p><strong>Can Add Device:</strong> <span id="displayCanAddDevice">Loading...</span></p>
                <p><strong>Installation ID:</strong> <span id="displayInstallationId" class="font-mono text-white">Loading...</span></p>
                <p><strong>Last Checked:</strong> <span id="displayLastChecked">Loading...</span></p>
                <p><strong>Grace Period Ends:</strong> <span id="displayGracePeriodEnd">Loading...</span></p>
            </div>
        </div>

        <!-- Update License Key -->
        <div class="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 mb-8">
            <h2 class="text-xl font-semibold text-white mb-4">Update Application License Key</h2>
            <form id="updateLicenseKeyForm" class="space-y-4">
                <div>
                    <label for="newLicenseKey" class="block text-sm font-medium text-slate-400 mb-1">New License Key</label>
                    <input type="text" id="newLicenseKey" name="new_license_key" required
                           class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 text-white"
                           placeholder="XXXX-XXXX-XXXX-XXXX">
                </div>
                <button type="submit" id="updateLicenseKeyBtn" class="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                    <i class="fas fa-save mr-2"></i>Update Key
                </button>
            </form>
        </div>

        <!-- Actions -->
        <div class="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6">
            <h2 class="text-xl font-semibold text-white mb-4">Actions</h2>
            <div class="flex flex-col md:flex-row gap-4">
                <button id="forceRecheckBtn" class="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500">
                    <i class="fas fa-sync-alt mr-2"></i>Force License Re-check
                </button>
                <a href="https://portal.itsupport.com.bd/products.php" target="_blank" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center">
                    <i class="fas fa-shopping-cart mr-2"></i>Go to License Portal
                </a>
            </div>
        </div>
    </div>
</main>

<script src="assets/js/license.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', initLicenseManagement);
</script>

<?php include __DIR__ . '/footer.php'; ?>
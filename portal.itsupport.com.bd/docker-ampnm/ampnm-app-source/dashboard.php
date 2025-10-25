<?php
require_once __DIR__ . '/includes/auth_check.php';
include __DIR__ . '/header.php';
?>

<main id="app">
    <div class="container mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-3xl font-bold text-white">Dashboard</h1>
            <div class="flex items-center gap-2">
                <select id="mapSelector" class="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 text-white"></select>
                <button id="refreshDashboardBtn" class="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                    <i class="fas fa-sync-alt mr-2"></i>Refresh
                </button>
            </div>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 text-center">
                <i class="fas fa-globe text-4xl text-cyan-400 mb-3"></i>
                <h2 class="text-lg font-semibold text-white mb-1">Total Devices</h2>
                <p id="totalDevices" class="text-3xl font-bold text-white">0</p>
            </div>
            <div class="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 text-center">
                <i class="fas fa-check-circle text-4xl text-green-400 mb-3"></i>
                <h2 class="text-lg font-semibold text-white mb-1">Online Devices</h2>
                <p id="onlineDevices" class="text-3xl font-bold text-green-400">0</p>
            </div>
            <div class="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 text-center">
                <i class="fas fa-exclamation-triangle text-4xl text-yellow-400 mb-3"></i>
                <h2 class="text-lg font-semibold text-white mb-1">Warning Devices</h2>
                <p id="warningDevices" class="text-3xl font-bold text-yellow-400">0</p>
            </div>
            <div class="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 text-center">
                <i class="fas fa-times-circle text-4xl text-red-400 mb-3"></i>
                <h2 class="text-lg font-semibold text-white mb-1">Offline Devices</h2>
                <p id="offlineDevices" class="text-3xl font-bold text-red-400">0</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Device List -->
            <div class="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6">
                <h2 class="text-xl font-semibold text-white mb-4">Devices on Map</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="border-b border-slate-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Device</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">IP Address</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Last Seen</th>
                            </tr>
                        </thead>
                        <tbody id="deviceListBody">
                            <tr><td colspan="4" class="text-center py-4 text-slate-500">Select a map to view devices.</td></tr>
                        </tbody>
                    </table>
                </div>
                <div id="deviceListLoader" class="text-center py-8 hidden"><div class="loader mx-auto"></div></div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6">
                <h2 class="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <div id="recentActivityList" class="space-y-4">
                    <p class="text-center py-4 text-slate-500">No recent activity for the selected map.</p>
                </div>
                <div id="activityListLoader" class="text-center py-8 hidden"><div class="loader mx-auto"></div></div>
            </div>
        </div>
    </div>
</main>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
<script src="assets/js/dashboard.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', initDashboard);
</script>

<?php include __DIR__ . '/footer.php'; ?>
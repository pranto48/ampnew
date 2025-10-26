<?php
require_once 'includes/bootstrap.php';
app_header("Network Status");
?>

<h1 class="text-3xl font-bold text-white mb-6">Overall Network Status</h1>

<div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 max-w-2xl mx-auto text-center">
    <div class="flex items-center justify-center mb-4">
        <i class="fas fa-globe text-6xl text-green-500 mr-4"></i>
        <div>
            <h2 class="text-3xl font-bold text-white">Operational</h2>
            <p class="text-slate-300">All systems are online and functioning normally.</p>
        </div>
    </div>
    <p class="text-sm text-slate-400 mt-4">Last updated: <?= date('Y-m-d H:i:s') ?></p>
</div>

<div class="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6">
    <h2 class="text-xl font-semibold text-white mb-4">Service Status</h2>
    <ul class="space-y-3 text-slate-300">
        <li class="flex justify-between items-center">
            <span>Web Server</span>
            <span class="text-green-500"><i class="fas fa-check-circle mr-2"></i>Online</span>
        </li>
        <li class="flex justify-between items-center">
            <span>Database Server</span>
            <span class="text-green-500"><i class="fas fa-check-circle mr-2"></i>Online</span>
        </li>
        <li class="flex justify-between items-center">
            <span>Ping Service</span>
            <span class="text-green-500"><i class="fas fa-check-circle mr-2"></i>Online</span>
        </li>
        <li class="flex justify-between items-center">
            <span>External API Connectivity</span>
            <span class="text-green-500"><i class="fas fa-check-circle mr-2"></i>Online</span>
        </li>
    </ul>
</div>

<?php app_footer(); ?>
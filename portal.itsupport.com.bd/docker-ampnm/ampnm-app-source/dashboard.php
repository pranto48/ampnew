<?php
require_once 'includes/bootstrap.php';
app_header("Dashboard");
?>

<h1 class="text-3xl font-bold text-white mb-6">Dashboard</h1>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-3">Total Devices</h2>
        <p class="text-4xl font-bold text-cyan-400">15</p>
        <p class="text-slate-400">Currently monitored</p>
    </div>
    <div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-3">Online Devices</h2>
        <p class="text-4xl font-bold text-green-500">12</p>
        <p class="text-slate-400">Responding to pings</p>
    </div>
    <div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-3">Offline Devices</h2>
        <p class="text-4xl font-bold text-red-500">3</p>
        <p class="text-slate-400">Not responding</p>
    </div>
</div>

<div class="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6">
    <h2 class="text-xl font-semibold text-white mb-4">Recent Activity</h2>
    <ul class="space-y-3 text-slate-300">
        <li class="flex items-center"><i class="fas fa-check-circle text-green-500 mr-3"></i>Server 1 (192.168.1.10) is online.</li>
        <li class="flex items-center"><i class="fas fa-exclamation-triangle text-yellow-500 mr-3"></i>Router (192.168.1.1) latency increased.</li>
        <li class="flex items-center"><i class="fas fa-times-circle text-red-500 mr-3"></i>Workstation 5 (192.168.1.150) went offline.</li>
        <li class="flex items-center"><i class="fas fa-check-circle text-green-500 mr-3"></i>Switch 2 (192.168.1.20) is online.</li>
    </ul>
</div>

<?php app_footer(); ?>
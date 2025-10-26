<?php
require_once 'includes/bootstrap.php';
app_header("Ping History");
?>

<h1 class="text-3xl font-bold text-white mb-6">Ping History</h1>

<div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 max-w-3xl mx-auto">
    <h2 class="text-xl font-semibold text-white mb-4">Recent Ping Records</h2>
    <div class="bg-slate-900 border border-slate-600 rounded-md p-4 text-slate-300">
        <p>No ping history available yet.</p>
        <!-- Example history (dynamic content would go here) -->
        <!--
        <ul class="space-y-3">
            <li class="flex justify-between items-center">
                <div>
                    <span class="font-semibold">Server 1 (192.168.1.10)</span>
                    <p class="text-sm text-slate-400">2023-10-27 10:30:00</p>
                </div>
                <span class="text-green-500">Online (25ms)</span>
            </li>
            <li class="flex justify-between items-center">
                <div>
                    <span class="font-semibold">Router (192.168.1.1)</span>
                    <p class="text-sm text-slate-400">2023-10-27 10:25:00</p>
                </div>
                <span class="text-green-500">Online (5ms)</span>
            </li>
            <li class="flex justify-between items-center">
                <div>
                    <span class="font-semibold">Workstation 5 (192.168.1.150)</span>
                    <p class="text-sm text-slate-400">2023-10-27 10:20:00</p>
                </div>
                <span class="text-red-500">Offline</span>
            </li>
        </ul>
        -->
    </div>
</div>

<?php app_footer(); ?>
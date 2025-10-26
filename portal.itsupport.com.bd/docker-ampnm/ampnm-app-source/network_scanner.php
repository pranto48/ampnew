<?php
require_once 'includes/bootstrap.php';
app_header("Network Scanner");
?>

<h1 class="text-3xl font-bold text-white mb-6">Network Scanner</h1>

<div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 max-w-2xl mx-auto">
    <h2 class="text-xl font-semibold text-white mb-4">Scan Local Network</h2>
    <form action="#" method="POST" class="space-y-4">
        <div>
            <label for="subnet" class="block text-slate-300 text-sm font-bold mb-2">Subnet (e.g., 192.168.1.0/24):</label>
            <input type="text" id="subnet" name="subnet" class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white" placeholder="Enter subnet" required>
        </div>
        <button type="submit" class="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700">
            <i class="fas fa-search mr-2"></i>Scan Network
        </button>
    </form>

    <div class="mt-6">
        <h3 class="text-lg font-semibold text-white mb-3">Scan Results:</h3>
        <div class="bg-slate-900 border border-slate-600 rounded-md p-4 text-slate-300">
            <p>No scan results yet. Enter a subnet and click "Scan Network".</p>
            <!-- Example results (dynamic content would go here) -->
            <!--
            <ul class="space-y-2">
                <li class="flex justify-between items-center">
                    <span>192.168.1.1 (Router)</span>
                    <span class="text-green-500">Online</span>
                </li>
                <li class="flex justify-between items-center">
                    <span>192.168.1.10 (Server)</span>
                    <span class="text-green-500">Online</span>
                </li>
                <li class="flex justify-between items-center">
                    <span>192.168.1.150 (Workstation)</span>
                    <span class="text-red-500">Offline</span>
                </li>
            </ul>
            -->
        </div>
    </div>
</div>

<?php app_footer(); ?>
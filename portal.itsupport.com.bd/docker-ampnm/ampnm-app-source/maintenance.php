<?php
require_once 'includes/bootstrap.php';
app_header("Maintenance");
?>

<h1 class="text-3xl font-bold text-white mb-6">Maintenance</h1>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-3">Database Backup</h2>
        <p class="text-slate-300 mb-4">Create a backup of your application's database.</p>
        <button class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
            <i class="fas fa-database mr-2"></i>Backup Now
        </button>
    </div>
    <div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-3">Clean Logs</h2>
        <p class="text-slate-300 mb-4">Remove old application log files to free up disk space.</p>
        <button class="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
            <i class="fas fa-trash-alt mr-2"></i>Clean Logs
        </button>
    </div>
</div>

<div class="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 text-center text-slate-400">
    <p>More maintenance options coming soon!</p>
</div>

<?php app_footer(); ?>
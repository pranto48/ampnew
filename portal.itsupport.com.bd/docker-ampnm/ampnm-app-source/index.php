<?php
require_once 'includes/bootstrap.php';
app_header("Welcome to AMPNM");
?>

<div class="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl mb-8">
    <h1 class="text-5xl font-extrabold text-white mb-4">Welcome to AMPNM</h1>
    <p class="text-xl text-slate-200 mb-8">Your Advanced Network Monitoring Platform.</p>
    <a href="index.html" class="px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 text-lg">Go to Dashboard</a>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
    <div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl text-center p-6">
        <i class="fas fa-wifi text-5xl text-cyan-400 mb-4"></i>
        <h2 class="text-2xl font-semibold mb-2 text-white">Real-time Monitoring</h2>
        <p class="text-slate-200">Keep track of your network devices with live status updates.</p>
    </div>
    <div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl text-center p-6">
        <i class="fas fa-map-marked-alt text-5xl text-green-400 mb-4"></i>
        <h2 class="text-2xl font-semibold mb-2 text-white">Network Mapping</h2>
        <p class="text-slate-200">Visualize your network topology with interactive maps.</p>
    </div>
    <div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl text-center p-6">
        <i class="fas fa-shield-alt text-5xl text-purple-400 mb-4"></i>
        <h2 class="text-2xl font-semibold mb-2 text-white">License Management</h2>
        <p class="text-slate-200">Securely manage your application licenses.</p>
    </div>
</div>

<?php app_footer(); ?>
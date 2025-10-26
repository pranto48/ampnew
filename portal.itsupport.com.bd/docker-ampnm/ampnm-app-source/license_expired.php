<?php
require_once 'includes/bootstrap.php';
app_header("License Expired");
?>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 absolute inset-0">
    <div class="max-w-md w-full space-y-8 bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-8 text-center">
        <i class="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
        <h1 class="text-3xl font-bold text-white mb-2">License Expired or Invalid!</h1>
        <p class="text-slate-300 mb-6">Your AMPNM application license has expired or is invalid. Please update your license key to continue using the application.</p>
        
        <a href="license_setup.php" class="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700">
            <i class="fas fa-key mr-2"></i>Update License Key
        </a>
        <p class="text-slate-400 text-sm mt-4">
            If you believe this is an error, please contact support.
        </p>
    </div>
</div>

<?php app_footer(); ?>
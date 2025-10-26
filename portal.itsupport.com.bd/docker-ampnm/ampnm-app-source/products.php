<?php
require_once 'includes/bootstrap.php';
app_header("Products");
?>

<h1 class="text-3xl font-bold text-white mb-6">Products</h1>

<div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 max-w-3xl mx-auto text-center">
    <h2 class="text-xl font-semibold text-white mb-4">AMPNM License Products</h2>
    <p class="text-slate-300 mb-6">
        To view and purchase AMPNM licenses, please visit our external license portal:
    </p>
    <a href="https://portal.itsupport.com.bd/products.php" target="_blank" class="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700">
        <i class="fas fa-external-link-alt mr-2"></i>Go to License Portal
    </a>
    <p class="text-sm text-slate-400 mt-4">
        After purchasing a license, you can enter the key in the "License Setup" section of this application.
    </p>
</div>

<?php app_footer(); ?>
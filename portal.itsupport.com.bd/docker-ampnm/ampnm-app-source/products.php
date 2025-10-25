<?php
require_once __DIR__ . '/includes/auth_check.php';
include __DIR__ . '/header.php';
?>

<main id="app">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-white mb-6">AMPNM Products & Licenses</h1>

        <div class="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 text-center">
            <i class="fas fa-box-open text-6xl text-cyan-400 mb-4"></i>
            <h2 class="text-2xl font-semibold text-white mb-3">Manage Your AMPNM Licenses</h2>
            <p class="text-slate-300 mb-6">
                Your AMPNM application licenses are managed through our dedicated License Portal.
                Here you can view available products, purchase new licenses, and renew existing ones.
            </p>
            <a href="https://portal.itsupport.com.bd/products.php" target="_blank" class="px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 text-lg">
                <i class="fas fa-external-link-alt mr-2"></i>Go to License Portal
            </a>
            <p class="text-sm text-slate-500 mt-4">
                (This will open a new tab to the IT Support BD License Portal)
            </p>
        </div>
    </div>
</main>

<?php include __DIR__ . '/footer.php'; ?>
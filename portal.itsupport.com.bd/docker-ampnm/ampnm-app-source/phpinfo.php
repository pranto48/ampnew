<?php
require_once 'includes/bootstrap.php';
app_header("PHP Info");
?>

<h1 class="text-3xl font-bold text-white mb-6">PHP Information</h1>

<div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 max-w-full overflow-x-auto">
    <?php phpinfo(); ?>
</div>

<?php app_footer(); ?>
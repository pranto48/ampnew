<?php
require_once 'includes/bootstrap.php';
app_header("License Management");
?>

<h1 class="text-3xl font-bold text-white mb-6">License Management</h1>

<div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 max-w-2xl mx-auto">
    <h2 class="text-xl font-semibold text-white mb-4">Application License Status</h2>
    <?php
    $license_status = getAppLicenseStatus();
    ?>
    <div class="space-y-3">
        <p class="text-slate-300"><strong>License Key:</strong> <span class="font-mono break-all"><?= htmlspecialchars($license_status['app_license_key'] ?: 'Not Set') ?></span></p>
        <p class="text-slate-300"><strong>Status:</strong> 
            <span class="font-bold 
                <?php 
                if ($license_status['license_status_code'] === 'active' || $license_status['license_status_code'] === 'free') echo 'text-green-500';
                else if ($license_status['license_status_code'] === 'expired' || $license_status['license_status_code'] === 'revoked') echo 'text-red-500';
                else echo 'text-yellow-500';
                ?>">
                <?= htmlspecialchars(ucfirst(str_replace('_', ' ', $license_status['license_status_code']))) ?>
            </span>
        </p>
        <p class="text-slate-300"><strong>Message:</strong> <?= htmlspecialchars($license_status['license_message']) ?></p>
        <p class="text-slate-300"><strong>Max Devices:</strong> <?= htmlspecialchars($license_status['max_devices']) ?></p>
        <p class="text-slate-300"><strong>Can Add Device:</strong> 
            <span class="font-bold <?= $license_status['can_add_device'] ? 'text-green-500' : 'text-red-500' ?>">
                <?= $license_status['can_add_device'] ? 'Yes' : 'No' ?>
            </span>
        </p>
        <?php if ($license_status['license_grace_period_end']): ?>
            <p class="text-yellow-500"><strong>Grace Period Ends:</strong> <?= htmlspecialchars(date('Y-m-d H:i', strtotime($license_status['license_grace_period_end']))) ?></p>
        <?php endif; ?>
        <p class="text-slate-300"><strong>Installation ID:</strong> <span class="font-mono break-all"><?= htmlspecialchars($license_status['installation_id']) ?></span></p>
    </div>

    <div class="mt-6">
        <a href="license_setup.php" class="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700">
            <i class="fas fa-edit mr-2"></i>Update License Key
        </a>
    </div>
</div>

<?php app_footer(); ?>
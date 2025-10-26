<?php
require_once 'includes/bootstrap.php';
app_header("Users");
?>

<h1 class="text-3xl font-bold text-white mb-6">User Management</h1>

<div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 max-w-3xl mx-auto">
    <h2 class="text-xl font-semibold text-white mb-4">Application Users</h2>
    <div class="bg-slate-900 border border-slate-600 rounded-md p-4 text-slate-300">
        <p>This section is for managing users within the AMPNM application.</p>
        <p class="mt-2">
            For a full user management interface, please use the React frontend's "Users" tab (if you have admin privileges).
        </p>
        <!-- Example user list (dynamic content would go here) -->
        <!--
        <ul class="space-y-2 mt-4">
            <li class="flex justify-between items-center">
                <span>admin (admin@example.com)</span>
                <span class="text-cyan-400">Admin</span>
            </li>
            <li class="flex justify-between items-center">
                <span>john.doe (john.doe@example.com)</span>
                <span class="text-green-500">Network Manager</span>
            </li>
        </ul>
        -->
    </div>
</div>

<?php app_footer(); ?>
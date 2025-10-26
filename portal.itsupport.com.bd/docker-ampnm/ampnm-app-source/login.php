<?php
require_once 'includes/bootstrap.php';

// Redirect if already logged in
if (isUserLoggedIn()) {
    header('Location: index.html'); // Redirect to React app
    exit;
}

$error_message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $error_message = 'Username and password are required.';
    } else {
        if (authenticateUser($username, $password)) {
            header('Location: index.html'); // Redirect to React app
            exit;
        } else {
            $error_message = 'Invalid username or password.';
        }
    }
}

app_header("Login");
?>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 absolute inset-0">
    <div class="max-w-md w-full space-y-8 bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-8 form-fade-in">
        <div class="text-center">
            <i class="fas fa-user-circle text-6xl text-cyan-400 mb-4"></i>
            <h1 class="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
            <p class="text-slate-400">Sign in to your AMPNM account.</p>
        </div>

        <?php if ($error_message): ?>
            <div class="bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 mb-4">
                <?= htmlspecialchars($error_message) ?>
            </div>
        <?php endif; ?>

        <form action="login.php" method="POST" class="mt-8 space-y-6">
            <div>
                <label for="username" class="sr-only">Username</label>
                <input id="username" name="username" type="text" autocomplete="username" required
                       class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                       placeholder="Username" value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
            </div>
            <div>
                <label for="password" class="sr-only">Password</label>
                <input id="password" name="password" type="password" autocomplete="current-password" required
                       class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                       placeholder="Password">
            </div>
            
            <div>
                <button type="submit" class="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                    <i class="fas fa-sign-in-alt mr-2"></i>Login
                </button>
            </div>
        </form>
        <p class="text-center text-slate-400 text-sm mt-4">
            Don't have an account? <a href="register.php" class="text-cyan-400 hover:underline font-medium">Register here</a>.
        </p>
    </div>
</div>

<?php app_footer(); ?>
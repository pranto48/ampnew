<?php
require_once 'includes/bootstrap.php';

// Redirect if already logged in
if (isUserLoggedIn()) {
    header('Location: index.html'); // Redirect to React app
    exit;
}

$error_message = '';
$success_message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    if (empty($username) || empty($email) || empty($password) || empty($confirm_password)) {
        $error_message = 'All fields are required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error_message = 'Invalid email format.';
    } elseif ($password !== $confirm_password) {
        $error_message = 'Passwords do not match.';
    } elseif (strlen($password) < 6) {
        $error_message = 'Password must be at least 6 characters long.';
    } else {
        $pdo = getAppDbConnection();
        $stmt = $pdo->prepare("SELECT id FROM `users` WHERE email = ? OR username = ?");
        $stmt->execute([$email, $username]);
        if ($stmt->fetch()) {
            $error_message = 'Email or username already registered. Please login or use different credentials.';
        } else {
            try {
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                // Default role to 'read_user' for new registrations
                $stmt = $pdo->prepare("INSERT INTO `users` (username, email, password, role) VALUES (?, ?, ?, 'read_user')");
                $stmt->execute([$username, $email, $hashed_password]);
                $success_message = 'Registration successful! You can now <a href="login.php" class="text-cyan-400 hover:underline">login</a>.';
            } catch (PDOException $e) {
                $error_message = 'Something went wrong during registration: ' . htmlspecialchars($e->getMessage()) . '. Please try again.';
                error_log("Registration failed: " . $e->getMessage());
            }
        }
    }
}

app_header("Register");
?>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 absolute inset-0">
    <div class="max-w-md w-full space-y-8 bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-8 form-fade-in">
        <div class="text-center">
            <i class="fas fa-user-plus text-6xl text-cyan-400 mb-4"></i>
            <h1 class="text-3xl font-bold text-white mb-2">Create Your AMPNM Account</h1>
            <p class="text-slate-400">Join us and start monitoring your network.</p>
        </div>

        <?php if ($error_message): ?>
            <div class="bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 mb-4">
                <?= htmlspecialchars($error_message) ?>
            </div>
        <?php endif; ?>

        <?php if ($success_message): ?>
            <div class="bg-green-500/20 border border-green-500/30 text-green-300 text-sm rounded-lg p-3 mb-4">
                <?= $success_message ?>
            </div>
        <?php endif; ?>

        <form action="register.php" method="POST" class="mt-8 space-y-6">
            <div>
                <label for="username" class="sr-only">Username</label>
                <input type="text" id="username" name="username" required
                       class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                       placeholder="Username" value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
            </div>
            <div>
                <label for="email" class="sr-only">Email address</label>
                <input type="email" id="email" name="email" autocomplete="email" required
                       class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                       placeholder="Email address" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
            </div>
            <div>
                <label for="password" class="sr-only">Password</label>
                <input type="password" id="password" name="password" autocomplete="new-password" required
                       class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                       placeholder="Password">
            </div>
            <div>
                <label for="confirm_password" class="sr-only">Confirm Password</label>
                <input type="password" id="confirm_password" name="confirm_password" autocomplete="new-password" required
                       class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                       placeholder="Confirm Password">
            </div>
            
            <div>
                <button type="submit" class="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                    <i class="fas fa-user-plus mr-2"></i>Register
                </button>
            </div>
        </form>
        <p class="text-center text-slate-400 text-sm mt-4">
            Already have an account? <a href="login.php" class="text-cyan-400 hover:underline font-medium">Login here</a>.
        </p>
    </div>
</div>

<?php app_footer(); ?>
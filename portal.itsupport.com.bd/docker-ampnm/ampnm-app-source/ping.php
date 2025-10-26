<?php
require_once 'includes/bootstrap.php';
app_header("Ping Test");
?>

<h1 class="text-3xl font-bold text-white mb-6">Ping Test</h1>

<div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 max-w-2xl mx-auto">
    <h2 class="text-xl font-semibold text-white mb-4">Perform a Ping Test</h2>
    <form action="#" method="POST" class="space-y-4">
        <div>
            <label for="ip_address" class="block text-slate-300 text-sm font-bold mb-2">IP Address or Hostname:</label>
            <input type="text" id="ip_address" name="ip_address" class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white" placeholder="e.g., 8.8.8.8 or google.com" required>
        </div>
        <button type="submit" class="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700">
            <i class="fas fa-paper-plane mr-2"></i>Ping
        </button>
    </form>

    <div class="mt-6">
        <h3 class="text-lg font-semibold text-white mb-3">Ping Result:</h3>
        <div class="bg-slate-900 border border-slate-600 rounded-md p-4 text-slate-300 font-mono">
            <p>No ping performed yet. Enter an IP address or hostname and click "Ping".</p>
            <!-- Example result (dynamic content would go here) -->
            <!-- <pre>Pinging 8.8.8.8 with 32 bytes of data:
Reply from 8.8.8.8: bytes=32 time=15ms TTL=117
Reply from 8.8.8.8: bytes=32 time=14ms TTL=117
Reply from 8.8.8.8: bytes=32 time=16ms TTL=117

Ping statistics for 8.8.8.8:
    Packets: Sent = 3, Received = 3, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 14ms, Maximum = 16ms, Average = 15ms</pre> -->
        </div>
    </div>
</div>

<?php app_footer(); ?>
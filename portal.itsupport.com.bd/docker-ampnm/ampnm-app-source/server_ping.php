<?php
require_once 'includes/bootstrap.php';
app_header("Server Ping Test");
?>

<h1 class="text-3xl font-bold text-white mb-6">Server Ping Test</h1>

<div class="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 max-w-2xl mx-auto">
    <h2 class="text-xl font-semibold text-white mb-4">Perform a Ping Test from Server</h2>
    <form action="#" method="POST" class="space-y-4">
        <div>
            <label for="ip_address" class="block text-slate-300 text-sm font-bold mb-2">IP Address or Hostname:</label>
            <input type="text" id="ip_address" name="ip_address" class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white" placeholder="e.g., google.com" required>
        </div>
        <button type="submit" class="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700">
            <i class="fas fa-server mr-2"></i>Ping from Server
        </button>
    </form>

    <div class="mt-6">
        <h3 class="text-lg font-semibold text-white mb-3">Server Ping Result:</h3>
        <div class="bg-slate-900 border border-slate-600 rounded-md p-4 text-slate-300 font-mono">
            <p>No server ping performed yet. Enter an IP address or hostname and click "Ping from Server".</p>
            <!-- Example result (dynamic content would go here) -->
            <!-- <pre>PING google.com (142.250.190.142) 56(84) bytes of data.
64 bytes from lga25s70-in-f14.1e100.net (142.250.190.142): icmp_seq=1 ttl=117 time=12.3 ms
64 bytes from lga25s70-in-f14.1e100.net (142.250.190.142): icmp_seq=2 ttl=117 time=11.8 ms

--- google.com ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 11.800/12.050/12.300/0.250 ms</pre> -->
        </div>
    </div>
</div>

<?php app_footer(); ?>
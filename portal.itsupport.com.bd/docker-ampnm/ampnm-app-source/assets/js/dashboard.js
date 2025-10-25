function initDashboard() {
    const API_URL = 'api.php';

    const els = {
        mapSelector: document.getElementById('mapSelector'),
        refreshDashboardBtn: document.getElementById('refreshDashboardBtn'),
        totalDevices: document.getElementById('totalDevices'),
        onlineDevices: document.getElementById('onlineDevices'),
        warningDevices: document.getElementById('warningDevices'),
        offlineDevices: document.getElementById('offlineDevices'),
        deviceListBody: document.getElementById('deviceListBody'),
        deviceListLoader: document.getElementById('deviceListLoader'),
        recentActivityList: document.getElementById('recentActivityList'),
        activityListLoader: document.getElementById('activityListLoader'),
    };

    const state = {
        currentMapId: null,
    };

    const api = {
        get: (action, params = {}) => fetch(`${API_URL}?action=${action}&${new URLSearchParams(params)}`).then(res => res.json())
    };

    const statusClasses = {
        online: 'bg-green-500/20 text-green-400',
        warning: 'bg-yellow-500/20 text-yellow-400',
        critical: 'bg-red-500/20 text-red-400',
        offline: 'bg-slate-600/50 text-slate-400',
        unknown: 'bg-slate-600/50 text-slate-400'
    };

    const populateMapSelector = async () => {
        try {
            const maps = await api.get('get_maps');
            if (maps.length > 0) {
                els.mapSelector.innerHTML = maps.map(map => `<option value="${map.id}">${map.name}</option>`).join('');
                state.currentMapId = maps[0].id; // Select the first map by default
            } else {
                els.mapSelector.innerHTML = '<option value="">No maps found</option>';
                state.currentMapId = null;
            }
        } catch (error) {
            console.error("Failed to load maps:", error);
            window.notyf.error("Failed to load maps for dashboard.");
            els.mapSelector.innerHTML = '<option value="">Error loading maps</option>';
            state.currentMapId = null;
        }
    };

    const loadDashboardData = async () => {
        if (!state.currentMapId) {
            els.totalDevices.textContent = '0';
            els.onlineDevices.textContent = '0';
            els.warningDevices.textContent = '0';
            els.offlineDevices.textContent = '0';
            els.deviceListBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-slate-500">No map selected or no devices.</td></tr>';
            els.recentActivityList.innerHTML = '<p class="text-center py-4 text-slate-500">No recent activity.</p>';
            return;
        }

        els.deviceListLoader.classList.remove('hidden');
        els.activityListLoader.classList.remove('hidden');
        els.deviceListBody.innerHTML = '';
        els.recentActivityList.innerHTML = '';

        try {
            const data = await api.get('get_dashboard_data', { map_id: state.currentMapId });

            // Update stats
            els.totalDevices.textContent = data.stats.total;
            els.onlineDevices.textContent = data.stats.online;
            els.warningDevices.textContent = data.stats.warning;
            els.offlineDevices.textContent = data.stats.offline;

            // Update device list
            if (data.devices.length > 0) {
                els.deviceListBody.innerHTML = data.devices.map(device => {
                    const statusClass = statusClasses[device.status] || statusClasses.unknown;
                    const statusIndicatorClass = `status-indicator status-${device.status}`;
                    const lastSeen = device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never';
                    return `
                        <tr class="border-b border-slate-700 hover:bg-slate-800/50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">${device.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">${device.ip || 'N/A'}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex items-center gap-2 text-xs leading-5 font-semibold rounded-full ${statusClass}">
                                    <div class="${statusIndicatorClass}"></div>${device.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400">${lastSeen}</td>
                        </tr>
                    `;
                }).join('');
            } else {
                els.deviceListBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-slate-500">No devices on this map.</td></tr>';
            }

            // Update recent activity
            if (data.recent_activity.length > 0) {
                els.recentActivityList.innerHTML = data.recent_activity.map(activity => {
                    const statusClass = statusClasses[activity.status] || statusClasses.unknown;
                    return `
                        <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                            <p class="text-sm text-slate-400 mb-1">
                                <span class="font-semibold text-white">${activity.device_name} (${activity.device_ip || 'N/A'})</span>
                                changed status to 
                                <span class="font-semibold ${statusClass}">${activity.status}</span>
                                at ${new Date(activity.created_at).toLocaleString()}
                            </p>
                            ${activity.details ? `<p class="text-xs text-slate-500">${activity.details}</p>` : ''}
                        </div>
                    `;
                }).join('');
            } else {
                els.recentActivityList.innerHTML = '<p class="text-center py-4 text-slate-500">No recent activity for this map.</p>';
            }

        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            window.notyf.error("Failed to load dashboard data.");
        } finally {
            els.deviceListLoader.classList.add('hidden');
            els.activityListLoader.classList.add('hidden');
        }
    };

    els.mapSelector.addEventListener('change', (e) => {
        state.currentMapId = e.target.value;
        loadDashboardData();
    });

    els.refreshDashboardBtn.addEventListener('click', () => {
        loadDashboardData();
        window.notyf.success("Dashboard refreshed.");
    });

    // Initial load
    (async () => {
        await populateMapSelector();
        await loadDashboardData();
    })();
}
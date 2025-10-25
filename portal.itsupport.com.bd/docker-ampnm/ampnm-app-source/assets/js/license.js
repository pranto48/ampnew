function initLicenseManagement() {
    const API_URL = 'api.php';

    const els = {
        licenseInfoLoader: document.getElementById('licenseInfoLoader'),
        licenseInfoContent: document.getElementById('licenseInfoContent'),
        displayLicenseKey: document.getElementById('displayLicenseKey'),
        displayLicenseStatus: document.getElementById('displayLicenseStatus'),
        displayLicenseMessage: document.getElementById('displayLicenseMessage'),
        displayMaxDevices: document.getElementById('displayMaxDevices'),
        displayCurrentDevices: document.getElementById('displayCurrentDevices'),
        displayCanAddDevice: document.getElementById('displayCanAddDevice'),
        displayInstallationId: document.getElementById('displayInstallationId'),
        displayLastChecked: document.getElementById('displayLastChecked'),
        displayGracePeriodEnd: document.getElementById('displayGracePeriodEnd'),
        updateLicenseKeyForm: document.getElementById('updateLicenseKeyForm'),
        newLicenseKey: document.getElementById('newLicenseKey'),
        updateLicenseKeyBtn: document.getElementById('updateLicenseKeyBtn'),
        forceRecheckBtn: document.getElementById('forceRecheckBtn'),
    };

    const api = {
        get: (action, params = {}) => fetch(`${API_URL}?action=${action}&${new URLSearchParams(params)}`).then(res => {
            if (!res.ok) {
                return res.json().then(err => { throw new Error(err.error || `HTTP error! status: ${res.status}`); });
            }
            return res.json();
        }),
        post: (action, body = {}) => fetch(`${API_URL}?action=${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(res => {
            if (!res.ok) {
                return res.json().then(err => { throw new Error(err.error || `HTTP error! status: ${res.status}`); });
            }
            return res.json();
        })
    };

    const fetchLicenseInfo = async () => {
        els.licenseInfoLoader.classList.remove('hidden');
        els.licenseInfoContent.classList.add('hidden');

        try {
            const licenseData = await api.get('get_license_status');
            const currentDeviceCount = await api.get('get_devices').then(devices => devices.length);

            els.displayLicenseKey.textContent = licenseData.app_license_key || 'N/A';
            els.displayLicenseStatus.textContent = licenseData.license_status_code ? licenseData.license_status_code.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN';
            els.displayLicenseMessage.textContent = licenseData.license_message || 'No message available.';
            els.displayMaxDevices.textContent = licenseData.max_devices !== undefined ? licenseData.max_devices : 'N/A';
            els.displayCurrentDevices.textContent = currentDeviceCount;
            els.displayCanAddDevice.textContent = licenseData.can_add_device ? 'YES' : 'NO';
            els.displayInstallationId.textContent = licenseData.installation_id || 'N/A';
            els.displayLastChecked.textContent = licenseData.last_license_check ? new Date(licenseData.last_license_check).toLocaleString() : 'Never';
            els.displayGracePeriodEnd.textContent = licenseData.license_grace_period_end ? new Date(licenseData.license_grace_period_end * 1000).toLocaleString() : 'N/A';

            // Apply status styling
            els.displayLicenseStatus.classList.remove('text-green-400', 'text-yellow-400', 'text-red-400');
            if (licenseData.license_status_code === 'active') {
                els.displayLicenseStatus.classList.add('text-green-400');
            } else if (licenseData.license_status_code === 'grace_period') {
                els.displayLicenseStatus.classList.add('text-yellow-400');
            } else {
                els.displayLicenseStatus.classList.add('text-red-400');
            }

            els.licenseInfoContent.classList.remove('hidden');
        } catch (error) {
            console.error('Failed to fetch license info:', error);
            window.notyf.error(error.message || 'Failed to load license information.');
            els.displayLicenseMessage.textContent = `Error: ${error.message}`;
            els.displayLicenseStatus.textContent = 'ERROR';
            els.displayLicenseStatus.classList.add('text-red-400');
            els.licenseInfoContent.classList.remove('hidden');
        } finally {
            els.licenseInfoLoader.classList.add('hidden');
        }
    };

    els.updateLicenseKeyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newKey = els.newLicenseKey.value.trim();
        if (!newKey) {
            window.notyf.error('Please enter a new license key.');
            return;
        }

        els.updateLicenseKeyBtn.disabled = true;
        els.updateLicenseKeyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating...';

        try {
            const result = await api.post('update_app_license_key', { new_license_key: newKey });
            if (result.success) {
                window.notyf.success('License key updated and re-verified successfully!');
                els.newLicenseKey.value = '';
                await fetchLicenseInfo();
            } else {
                throw new Error(result.message || result.error || 'Unknown error.');
            }
        } catch (error) {
            console.error('Failed to update license key:', error);
            window.notyf.error(error.message || 'Failed to update license key.');
        } finally {
            els.updateLicenseKeyBtn.disabled = false;
            els.updateLicenseKeyBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Key';
        }
    });

    els.forceRecheckBtn.addEventListener('click', async () => {
        els.forceRecheckBtn.disabled = true;
        els.forceRecheckBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Re-checking...';
        window.notyf.info('Forcing license re-check...');

        try {
            const result = await api.post('force_license_recheck');
            if (result.success) {
                window.notyf.success(result.message || 'License re-check initiated.');
                await fetchLicenseInfo();
            } else {
                throw new Error(result.message || result.error || 'Unknown error.');
            }
        } catch (error) {
            console.error('Failed to force license re-check:', error);
            window.notyf.error(error.message || 'Failed to force license re-check.');
        } finally {
            els.forceRecheckBtn.disabled = false;
            els.forceRecheckBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Force License Re-check';
        }
    });

    // Initial load
    fetchLicenseInfo();
}
function initUsers() {
    const API_URL = 'api.php';
    const usersTableBody = document.getElementById('usersTableBody');
    const usersLoader = document.getElementById('usersLoader');
    const createUserForm = document.getElementById('createUserForm');
    const currentAdminId = <?php echo $_SESSION['user_id']; ?>; // Get current admin's ID
    const currentUserRole = '<?php echo $_SESSION['role']; ?>'; // Get current user's role

    const api = {
        get: (action) => fetch(`${API_URL}?action=${action}`).then(res => {
            if (!res.ok) {
                return res.json().then(err => { throw new Error(err.error || `HTTP error! status: ${res.status}`); });
            }
            return res.json();
        }),
        post: (action, body) => fetch(`${API_URL}?action=${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(res => {
            if (!res.ok) {
                return res.json().then(err => { throw new Error(err.error || `HTTP error! status: ${res.status}`); });
            }
            return res.json();
        })
    };

    const loadUsers = async () => {
        usersLoader.classList.remove('hidden');
        usersTableBody.innerHTML = '';
        try {
            const users = await api.get('get_users');
            usersTableBody.innerHTML = users.map(user => `
                <tr class="border-b border-slate-700">
                    <td class="px-6 py-4 whitespace-nowrap text-white">${user.username}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${user.id == currentAdminId ? 
                            `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-400">${user.role.replace(/_/g, ' ').toUpperCase()}</span>` :
                            `<select class="user-role-select bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs" data-id="${user.id}" ${currentUserRole !== 'admin' ? 'disabled' : ''}>
                                <option value="read_user" ${user.role === 'read_user' ? 'selected' : ''}>Read User</option>
                                <option value="network_manager" ${user.role === 'network_manager' ? 'selected' : ''}>Network Manager</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>`
                        }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-slate-400">${new Date(user.created_at).toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${user.id != currentAdminId && currentUserRole === 'admin' ? `<button class="delete-user-btn text-red-500 hover:text-red-400" data-id="${user.id}" data-username="${user.username}"><i class="fas fa-trash mr-2"></i>Delete</button>` : '<span class="text-slate-500">Cannot delete self</span>'}
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Failed to load users:', error);
            window.notyf.error(error.message || 'Failed to load users.');
        } finally {
            usersLoader.classList.add('hidden');
        }
    };

    if (currentUserRole === 'admin') {
        createUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target.new_username.value;
            const password = e.target.new_password.value;
            const role = e.target.role.value; // Correctly get selected role from the 'role' select element
            if (!username || !password) {
                window.notyf.error('Username and password are required.');
                return;
            }

            const button = createUserForm.querySelector('button[type="submit"]');
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating...';

            try {
                const result = await api.post('create_user', { username, password, role }); // Pass role
                if (result.success) {
                    window.notyf.success('User created successfully.');
                    createUserForm.reset();
                    await loadUsers();
                } else {
                    window.notyf.error(`Error: ${result.error}`);
                }
            } catch (error) {
                window.notyf.error(error.message || 'An unexpected error occurred.');
                console.error(error);
            } finally {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-user-plus mr-2"></i>Create User';
            }
        });
    } else {
        // Hide the create user form if not admin
        createUserForm.closest('.bg-slate-800').style.display = 'none';
    }


    usersTableBody.addEventListener('change', async (e) => {
        if (e.target.classList.contains('user-role-select')) {
            const selectElement = e.target;
            const userId = selectElement.dataset.id;
            const newRole = selectElement.value;

            if (userId == currentAdminId && newRole !== 'admin') {
                window.notyf.error('You cannot change your own role from admin.');
                selectElement.value = 'admin'; // Revert selection
                return;
            }

            selectElement.disabled = true;
            try {
                const result = await api.post('update_user_role', { id: userId, role: newRole });
                if (result.success) {
                    window.notyf.success('User role updated successfully.');
                } else {
                    window.notyf.error(`Error: ${result.error}`);
                    await loadUsers(); // Reload to revert if update failed on server
                }
            } catch (error) {
                window.notyf.error(error.message || 'An unexpected error occurred during role update.');
                console.error(error);
                await loadUsers(); // Reload to revert if update failed
            } finally {
                selectElement.disabled = false;
            }
        }
    });

    usersTableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('.delete-user-btn');
        if (button) {
            const { id, username } = button.dataset;
            if (id == currentAdminId) {
                window.notyf.error('You cannot delete your own admin account.');
                return;
            }
            if (confirm(`Are you sure you want to delete user "${username}"?`)) {
                try {
                    const result = await api.post('delete_user', { id });
                    if (result.success) {
                        window.notyf.success(`User "${username}" deleted.`);
                        await loadUsers();
                    } else {
                        window.notyf.error(`Error: ${result.error}`);
                    }
                } catch (error) {
                    window.notyf.error(error.message || 'An unexpected error occurred during deletion.');
                    console.error(error);
                }
            }
        }
    });

    loadUsers();
}
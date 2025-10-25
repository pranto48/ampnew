document.addEventListener('DOMContentLoaded', function() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation(); // Prevent click from immediately propagating to document
            const dropdownMenu = this.nextElementSibling;

            // Close any other open dropdowns
            dropdownToggles.forEach(otherToggle => {
                const otherDropdownMenu = otherToggle.nextElementSibling;
                if (otherDropdownMenu !== dropdownMenu && !otherDropdownMenu.classList.contains('hidden')) {
                    otherDropdownMenu.classList.add('hidden');
                    otherToggle.querySelector('.fa-chevron-down').classList.remove('rotate-180');
                }
            });

            // Toggle the clicked dropdown
            dropdownMenu.classList.toggle('hidden');
            this.querySelector('.fa-chevron-down').classList.toggle('rotate-180');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        dropdownToggles.forEach(toggle => {
            const dropdownMenu = toggle.nextElementSibling;
            if (!dropdownMenu.classList.contains('hidden') && !toggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.add('hidden');
                toggle.querySelector('.fa-chevron-down').classList.remove('rotate-180');
            }
        });
    });

    // Highlight active navigation link (including submenu items)
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('#main-nav .nav-link, .dropdown-menu a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('bg-slate-700', 'text-cyan-400');
            // If it's a submenu item, also highlight its parent toggle
            const parentDropdownMenu = link.closest('.dropdown-menu');
            if (parentDropdownMenu) {
                const parentToggle = parentDropdownMenu.previousElementSibling;
                if (parentToggle && parentToggle.classList.contains('dropdown-toggle')) {
                    parentToggle.classList.add('bg-slate-700', 'text-cyan-400');
                    parentDropdownMenu.classList.remove('hidden'); // Keep parent dropdown open
                    parentToggle.querySelector('.fa-chevron-down').classList.add('rotate-180');
                }
            }
        } else {
            link.classList.remove('bg-slate-700', 'text-cyan-400');
        }
    });
});
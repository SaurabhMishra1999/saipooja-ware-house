
document.addEventListener('DOMContentLoaded', () => {
    const authLink = document.getElementById('auth-link');
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        // User is logged in
        authLink.textContent = 'Logout';
        authLink.href = '#'; // Prevent redirection to login page

        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Confirm before logging out
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('user'); // Clear user data
                window.location.reload(); // Refresh the page
            }
        });
    } else {
        // User is not logged in
        authLink.textContent = 'Client Login';
        authLink.href = 'login.html';
    }
});

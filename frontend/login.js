document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = loginForm['email'].value;
        const password = loginForm['password'].value;

        // Basic validation
        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        // This will not work until you provide the configuration in firebase-config.js
        if (typeof firebase === 'undefined') {
            alert('Firebase is not configured correctly. Please fill in frontend/firebase-config.js');
            return;
        }

        // Use Firebase Authentication to sign in
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                console.log('User logged in successfully:', userCredential.user);

                // Redirect to the dashboard
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                const errorMessage = error.message;
                console.error('Login Error:', error);
                alert(`Login failed: ${errorMessage}`);
            });
    });
});

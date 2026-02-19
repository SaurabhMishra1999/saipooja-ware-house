document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = signupForm['email'].value;
        const password = signupForm['password'].value;
        const confirmPassword = signupForm['confirm-password'].value;

        // Basic validation
        if (!email || !password || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        // This will not work until you provide the configuration in firebase-config.js
        if (typeof firebase === 'undefined') {
            alert('Firebase is not configured correctly. Please fill in frontend/firebase-config.js');
            return;
        }

        // Use Firebase Authentication to create a new user
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in 
                console.log('User created successfully:', userCredential.user);
                
                // Redirect to the dashboard
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                const errorMessage = error.message;
                console.error('Signup Error:', error);
                alert(`Signup failed: ${errorMessage}`);
            });
    });
});

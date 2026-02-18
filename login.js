document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorElement = document.getElementById('login-error');

  const login = firebase.functions().httpsCallable('login');

  try {
    const result = await login({ email, password });
    const data = result.data;

    if (data.success) {
      window.location.href = data.dashboard;
    } else {
      errorElement.textContent = data.message || 'An unknown error occurred.';
    }
  } catch (error) {
    console.error('Error calling login function:', error);
    errorElement.textContent = error.message;
  }
});

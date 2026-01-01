(function() {
  console.log('🔐 Auth.js loaded');

  // DOM elements
  const tabs = document.querySelectorAll('.tab');
  const loginForm = document.getElementById('login');
  const signupForm = document.getElementById('signup');
  const loginError = document.getElementById('login-error');
  const signupError = document.getElementById('signup-error');
  const signupSuccess = document.getElementById('signup-success');
  const loginLoading = document.getElementById('login-loading');
  const signupLoading = document.getElementById('signup-loading');
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show correct form
      document.querySelectorAll('.form-container').forEach(f => {
        f.classList.remove('active');
      });
      document.getElementById(`${tabName}-form`).classList.add('active');
      
      // Clear messages
      clearMessages();
    });
  });

  // Helper functions
  function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
  }

  function showSuccess(element, message) {
    element.textContent = message;
    element.classList.add('show');
  }

  function clearMessages() {
    loginError.classList.remove('show');
    signupError.classList.remove('show');
    signupSuccess.classList.remove('show');
  }

  function showLoading(loading, button) {
    loading.classList.add('show');
    button.disabled = true;
  }

  function hideLoading(loading, button) {
    loading.classList.remove('show');
    button.disabled = false;
  }

  function saveToken(token) {
    localStorage.setItem('ampai_token', token);
  }

  function saveUser(user) {
    localStorage.setItem('ampai_user', JSON.stringify(user));
  }

  function redirectToApp() {
    window.location.href = '/app';
  }

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    showLoading(loginLoading, loginBtn);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      
      console.log('✅ Login successful');
      
      // Save token and user info
      saveToken(data.token);
      saveUser(data.user);
      
      // Redirect to app
      redirectToApp();
      
    } catch (error) {
      console.error('❌ Login error:', error);
      showError(loginError, error.message || 'Login failed. Please try again.');
    } finally {
      hideLoading(loginLoading, loginBtn);
    }
  });

  // Signup handler
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    if (password.length < 6) {
      showError(signupError, 'Password must be at least 6 characters');
      return;
    }
    
    showLoading(signupLoading, signupBtn);
    
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed');
      }
      
      console.log('✅ Signup successful');
      
      // Save token and user info
      saveToken(data.token);
      saveUser(data.user);
      
      // Show success and redirect
      showSuccess(signupSuccess, 'Account created! Redirecting...');
      setTimeout(redirectToApp, 1500);
      
    } catch (error) {
      console.error('❌ Signup error:', error);
      showError(signupError, error.message || 'Signup failed. Please try again.');
    } finally {
      hideLoading(signupLoading, signupBtn);
    }
  });

  // Check if already logged in
  const token = localStorage.getItem('ampai_token');
  if (token) {
    console.log('🔑 Token found, checking validity...');
    // Could verify token here, for now just redirect
    redirectToApp();
  }

  console.log('✅ Auth.js initialized');
})();
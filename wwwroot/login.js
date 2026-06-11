document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('role') === 'admin') {
        const titleH2 = document.querySelector('.form-container h2');
        titleH2.innerHTML = `Admin <span class="text-gradient">Login</span>`;
        document.getElementById('studentId').placeholder = 'Admin ID';
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        studentId: document.getElementById('studentId').value,
        password: document.getElementById('password').value
    };

    const messageEl = document.getElementById('message');
    messageEl.className = 'message';
    messageEl.textContent = 'Logging in...';
    messageEl.style.display = 'block';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            messageEl.className = 'message success';
            messageEl.textContent = 'Success! Redirecting...';
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            messageEl.className = 'message error';
            messageEl.textContent = data.message || 'Login failed';
        }
    } catch (err) {
        messageEl.className = 'message error';
        messageEl.textContent = 'Failed to connect to server';
    }
});

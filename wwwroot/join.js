document.getElementById('joinForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        studentId: document.getElementById('studentId').value,
        password: document.getElementById('password').value,
        name: document.getElementById('fullName').value,
        department: document.getElementById('department').value,
        year: document.getElementById('year').value,
        semester: document.getElementById('semester').value
    };

    const messageEl = document.getElementById('message');
    messageEl.className = 'message';
    messageEl.textContent = 'Submitting...';
    messageEl.style.display = 'block';

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            messageEl.className = 'message success';
            messageEl.textContent = data.message;
            document.getElementById('joinForm').reset();
        } else {
            messageEl.className = 'message error';
            messageEl.textContent = data.message || 'An error occurred';
        }
    } catch (err) {
        messageEl.className = 'message error';
        messageEl.textContent = 'Failed to connect to server';
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/user/dashboard');
        
        if (response.status === 401 || response.status === 403) {
            window.location.href = 'login.html';
            return;
        }
        
        if (!response.ok) throw new Error('Failed to fetch user data');

        const user = await response.json();

        document.getElementById('userName').textContent = user.name;
        document.getElementById('userStudentId').textContent = user.studentId;
        document.getElementById('userRole').textContent = user.role;
        document.getElementById('userDept').textContent = user.department;
        document.getElementById('userYear').textContent = user.year;
        document.getElementById('userSem').textContent = user.semester;

        if (user.profilePicturePath) {
            document.getElementById('profileAvatar').src = user.profilePicturePath;
        }

        const profilePicInput = document.getElementById('profilePicInput');
        profilePicInput.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const uploadRes = await fetch('/api/user/upload-profile-picture', {
                        method: 'POST',
                        body: formData
                    });

                    if (!uploadRes.ok) {
                        const errText = await uploadRes.text();
                        throw new Error(errText);
                    }

                    const result = await uploadRes.json();
                    document.getElementById('profileAvatar').src = result.profilePicturePath;
                } catch (error) {
                    console.error('Upload error:', error);
                    alert('Failed to upload profile picture: ' + error.message);
                }
            }
        });

        if (user.role === 'Admin') {
            const adminLink = document.getElementById('adminLink');
            adminLink.style.display = 'inline-block';
            adminLink.href = 'admin.html';
        }

        const contributionsList = document.getElementById('contributionsList');
        if (user.contributions && user.contributions.length > 0) {
            contributionsList.innerHTML = user.contributions.map(c => `
                <div class="contribution-card">
                    <h3>${c.projectTitle}</h3>
                    <p>${c.details}</p>
                </div>
            `).join('');
        } else {
            contributionsList.innerHTML = '<p>No contributions found.</p>';
        }

    } catch (err) {
        console.error(err);
        alert('An error occurred while loading the dashboard.');
    }
});

document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = 'login.html';
    } catch (err) {
        console.error('Logout failed', err);
    }
});

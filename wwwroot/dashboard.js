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
        } else {
            const memberSecurityBtn = document.getElementById('memberSecurityBtn');
            if (memberSecurityBtn) {
                memberSecurityBtn.style.display = 'inline-block';
            }
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

const changePasswordForm = document.getElementById('changePasswordForm');
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword !== confirmNewPassword) {
            alert("New passwords do not match!");
            return;
        }

        try {
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Password changed successfully!");
                changePasswordForm.reset();
                const securityModal = document.getElementById('securityModal');
                if (securityModal) {
                    securityModal.classList.remove('active');
                }
            } else {
                alert(data.message || "Failed to change password.");
            }
        } catch (err) {
            console.error('Error changing password:', err);
            alert("An error occurred while changing your password.");
        }
    });
}

// Modal handling
const memberSecurityBtn = document.getElementById('memberSecurityBtn');
const securityModal = document.getElementById('securityModal');
const closeSecurityModal = document.getElementById('closeSecurityModal');

if (memberSecurityBtn && securityModal) {
    memberSecurityBtn.addEventListener('click', (e) => {
        e.preventDefault();
        securityModal.classList.add('active');
    });
}

if (closeSecurityModal && securityModal) {
    closeSecurityModal.addEventListener('click', () => {
        securityModal.classList.remove('active');
    });
}

// Close modal if clicking outside of the content
window.addEventListener('click', (e) => {
    if (e.target === securityModal) {
        securityModal.classList.remove('active');
    }
});

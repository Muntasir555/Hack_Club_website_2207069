let allUsers = [];
let currentTab = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    setupTabs();
    await loadUsers();
});

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const usersContent = document.getElementById('usersContent');
    const noticesContent = document.getElementById('noticesContent');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active class
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Set current tab
            currentTab = btn.getAttribute('data-tab');

            // Handle content display
            if (currentTab === 'notices') {
                usersContent.style.display = 'none';
                noticesContent.style.display = 'block';
                loadNotices();
            } else {
                usersContent.style.display = 'block';
                noticesContent.style.display = 'none';
                renderUsers();
            }
        });
    });

    // Handle notice form submission
    const noticeForm = document.getElementById('noticeForm');
    if (noticeForm) {
        noticeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('noticeTitle').value;
            const content = document.getElementById('noticeContent').value;
            await postNotice(title, content);
        });
    }
}

async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        
        if (response.status === 401 || response.status === 403) {
            alert('Unauthorized access. Redirecting to login.');
            window.location.href = 'login.html';
            return;
        }

        allUsers = await response.json();
        renderUsers();
    } catch (err) {
        console.error(err);
        alert('Failed to load users.');
    }
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    // Filter users based on current tab
    let filteredUsers = allUsers;
    if (currentTab === 'pending') {
        filteredUsers = allUsers.filter(u => u.status === 'Pending');
    } else if (currentTab === 'members') {
        filteredUsers = allUsers.filter(u => u.role === 'Member' && u.status === 'Approved');
    }

    filteredUsers.forEach(user => {
        const tr = document.createElement('tr');
        
        let actions = '';
        if (user.status === 'Pending') {
            actions += `<button class="action-btn btn-approve" onclick="approveUser(${user.id})">Approve</button>`;
        }
        if (user.role !== 'Admin') {
            actions += `<button class="action-btn btn-remove" onclick="removeUser(${user.id})">Remove</button>`;
        }

        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.studentId}</td>
            <td>${user.name}</td>
            <td class="${user.status === 'Pending' ? 'status-pending' : 'status-approved'}">${user.status}</td>
            <td>${user.role}</td>
            <td>${actions}</td>
        `;
        tbody.appendChild(tr);
    });
}

async function approveUser(id) {
    if(!confirm('Approve this user?')) return;
    try {
        const response = await fetch(`/api/admin/approve/${id}`, { method: 'POST' });
        if(response.ok) {
            loadUsers();
        } else {
            alert('Failed to approve user.');
        }
    } catch(err) {
        console.error(err);
    }
}

async function removeUser(id) {
    if(!confirm('Are you sure you want to remove this user?')) return;
    try {
        const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if(response.ok) {
            loadUsers();
        } else {
            alert('Failed to remove user.');
        }
    } catch(err) {
        console.error(err);
    }
}

// Notice Board Functions
async function loadNotices() {
    try {
        const response = await fetch('/api/notices');
        if (response.ok) {
            const notices = await response.json();
            renderNotices(notices);
        } else {
            console.error('Failed to load notices');
        }
    } catch (err) {
        console.error(err);
    }
}

function renderNotices(notices) {
    const list = document.getElementById('noticesList');
    list.innerHTML = '';
    
    if (notices.length === 0) {
        list.innerHTML = '<p style="color: #aaa;">No notices posted yet.</p>';
        return;
    }

    notices.forEach(notice => {
        const div = document.createElement('div');
        div.style.background = 'rgba(255,255,255,0.05)';
        div.style.padding = '1rem';
        div.style.borderRadius = '8px';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'flex-start';

        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = `
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.2rem;">${notice.title}</h3>
            <p style="margin: 0; color: #ccc; font-size: 0.9rem; white-space: pre-wrap;">${notice.content}</p>
            <small style="color: #888; display: block; margin-top: 0.5rem;">Posted: ${new Date(notice.datePosted).toLocaleString()}</small>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn btn-remove';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteNotice(notice.id);

        div.appendChild(contentDiv);
        div.appendChild(deleteBtn);
        list.appendChild(div);
    });
}

async function postNotice(title, content) {
    try {
        const response = await fetch('/api/admin/notices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });
        
        if (response.ok) {
            document.getElementById('noticeForm').reset();
            loadNotices(); // Refresh the list
        } else {
            alert('Failed to post notice.');
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteNotice(id) {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
        const response = await fetch(`/api/admin/notices/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadNotices();
        } else {
            alert('Failed to delete notice.');
        }
    } catch (err) {
        console.error(err);
    }
}

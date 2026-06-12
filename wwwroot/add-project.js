document.addEventListener('DOMContentLoaded', () => {
    const mediaInput = document.getElementById('projectMedia');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const mediaPreviewContainer = document.getElementById('mediaPreviewContainer');
    
    // File preview logic
    mediaInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadPrompt.style.display = 'none';
            mediaPreviewContainer.style.display = 'flex';
            mediaPreviewContainer.innerHTML = ''; // Clear existing

            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                mediaPreviewContainer.appendChild(img);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.controls = true;
                mediaPreviewContainer.appendChild(video);
            }
        } else {
            uploadPrompt.style.display = 'block';
            mediaPreviewContainer.style.display = 'none';
        }
    });

    const addProjectForm = document.getElementById('addProjectForm');
    
    addProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('projectTitle').value;
        const description = document.getElementById('projectDescription').value;
        const mediaFile = mediaInput.files[0];

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (mediaFile) {
            formData.append('media', mediaFile);
        }

        const messageEl = document.getElementById('message');
        const submitBtn = document.getElementById('submitBtn');
        
        messageEl.className = 'message';
        messageEl.textContent = 'Uploading project...';
        messageEl.style.display = 'block';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/project/add', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                messageEl.className = 'message success';
                messageEl.textContent = 'Project added successfully! Redirecting...';
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                messageEl.className = 'message error';
                messageEl.textContent = data.message || data.title || 'Failed to add project';
                submitBtn.disabled = false;
            }
        } catch (err) {
            console.error('Add project error:', err);
            messageEl.className = 'message error';
            messageEl.textContent = 'Network error occurred.';
            submitBtn.disabled = false;
        }
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    await fetchAndRenderNotices();
});

async function fetchAndRenderNotices() {
    const listContainer = document.getElementById('publicNoticesList');
    try {
        const response = await fetch('/api/notices');
        if (response.ok) {
            const notices = await response.json();
            
            listContainer.innerHTML = '';
            
            if (notices.length === 0) {
                listContainer.innerHTML = '<div class="glass-container p-4" style="text-align: center; color: #aaa;">No events or notices posted yet. Check back later!</div>';
                return;
            }

            notices.forEach(notice => {
                const noticeCard = document.createElement('div');
                noticeCard.className = 'glass-container p-4';
                noticeCard.style.padding = '2rem';
                noticeCard.style.display = 'flex';
                noticeCard.style.flexDirection = 'column';
                noticeCard.style.gap = '1rem';

                const dateStr = new Date(notice.datePosted).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                noticeCard.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                        <h2 style="margin: 0; font-size: 1.5rem; color: #fff;">${notice.title}</h2>
                        <span style="font-size: 0.85rem; color: #888; background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 4px;">
                            ${dateStr}
                        </span>
                    </div>
                    <div style="color: #ddd; line-height: 1.6; white-space: pre-wrap; font-size: 1.05rem;">${notice.content}</div>
                `;

                listContainer.appendChild(noticeCard);
            });
        } else {
            listContainer.innerHTML = '<div class="glass-container p-4" style="text-align: center; color: #ff6b6b;">Failed to load events. Please try again later.</div>';
        }
    } catch (err) {
        console.error(err);
        listContainer.innerHTML = '<div class="glass-container p-4" style="text-align: center; color: #ff6b6b;">Error connecting to the server.</div>';
    }
}

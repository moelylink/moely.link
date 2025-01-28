const supabaseUrl = 'https://fefckqwvcvuadiixvhns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZmNrcXd2Y3Z1YWRpaXh2aG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDE5OTUsImV4cCI6MjA1MTkxNzk5NX0.-OUllwH7v2K-j4uIx7QQaV654R5Gz5_1jP4BGdkWWfg';
const client = supabase.createClient(supabaseUrl, supabaseKey);

let masonryInstance = null;
let currentPage = 1;
let isLoading = false;
let notificationCount = 0;
const notifications = new Set();

const style = document.createElement('style');
style.textContent = `
    .notification { position: fixed; bottom: 16px; right: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1); z-index: 1000; width: 300px; height: 48px; backdrop-filter: blur(10px); transform: translateX(calc(100% + 32px)); overflow: hidden; }
    .notification.show { transform: translateX(0); }
    .notification-wrapper { width: 100%; height: 100%; display: flex; align-items: center; }
    .notification-content { flex: 1; padding: 0 16px; z-index: 2; background: white; height: 100%; display: flex; align-items: center; }
    .notification-content p { margin: 0; padding: 0; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notification-icon { width: 48px; display: flex; align-items: center; justify-content: center; z-index: 1; height: 100%; }
    .notification-icon .material-icons-round { font-size: 20px; color: white; }
    .notification.error .notification-icon { background: #ff4d4f; }
    .notification.error .notification-content p { color: #cf1322; }
    .notification.success .notification-icon { background: #52c41a; }
    .notification.success .notification-content p { color: #389e0d; }
    .notification.warning .notification-icon { background: #faad14; }
    .notification.warning .notification-content p { color: #d48806; }
`;
document.head.appendChild(style);

function showMessage(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'check_circle' : 
                type === 'error' ? 'error' : 
                'warning';
    notification.innerHTML = `
        <div class="notification-wrapper">
            <div class="notification-icon">
                <span class="material-icons-round">${icon}</span>
            </div>
            <div class="notification-content">
                <p>${message}</p>
            </div>
        </div>
    `;

    document.body.appendChild(notification);
    notifications.add(notification);
    
    updateNotificationsPosition();
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notifications.delete(notification);
            notification.remove();
            updateNotificationsPosition();
        }, 300);
    }, 3000);
}

function updateNotificationsPosition() {
    const notificationsArray = Array.from(notifications);
    for (let i = notificationsArray.length - 1; i >= 0; i--) {
        const notification = notificationsArray[i];
        const offset = 16 + (notificationsArray.length - 1 - i) * 70;
        notification.style.transition = 'all 0.3s ease-in-out';
        notification.style.bottom = `${offset}px`;
    }
}

function initMasonry() {
    if (masonryInstance) {
        masonryInstance.destroy();
    }
    
    masonryInstance = new Masonry('.portfolio', {
        itemSelector: '.portfolio-item',
        columnWidth: '.portfolio-item',
        percentPosition: true,
        gutter: 0,
        transitionDuration: 0
      });
}

async function loadFavorites(userId, page = 1) {
    if (isLoading) return;
    isLoading = true;
    
    try {
        const itemsPerPage = 20;
        const { data: bookmarks, error } = await client
            .from('bookmarks')
            .select('id, url, image, created_at')
            .eq('user_id', userId)
            .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

        if (error) throw error;

        renderBookmarks(bookmarks, page);
        currentPage = page;
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('加载失败，请稍后重试', 'error');
    } finally {
        isLoading = false;
    }
}

function renderBookmarks(bookmarks, page) {
    const portfolioContainer = document.querySelector('.portfolio');
    if (!portfolioContainer) return;

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    let htmlContent = '';

    if (page === 1) {
        portfolioContainer.innerHTML = '';
    }

    bookmarks.forEach(item => {
        htmlContent += `
            <div class="portfolio-item" data-id="${item.id}">
                <div class="thumb">
                    <a href="${item.url}" target="_blank">
                        <img class="lazyload" 
                             data-src="${item.image}" 
                             src="/assets/img/loading.gif" 
                             alt="Bookmarked content">
                    </a>
                    <div class="widget-tags">
                        <span>${new Date(item.created_at).toLocaleDateString()}</span>
                        ${!isMobile ? `<button class="delete-btn" onclick="deleteBookmark('${item.id}')">🗑️</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const newElements = Array.from(tempDiv.children);

    portfolioContainer.append(...newElements);
    
    if (!masonryInstance) {
        initMasonry();
    } else {
        masonryInstance.appended(newElements);
    }

    imagesLoaded(portfolioContainer).on('progress', () => {
        masonryInstance.layout();
    });

    if (isMobile) {
        setupMobileEvents();
    }
}

async function deleteBookmark(bookmarkId) {
    if (!confirm('确定要删除这个收藏吗？')) return;

    try {
        const { error } = await client
            .from('bookmarks')
            .delete()
            .eq('id', bookmarkId);

        if (error) throw error;

        const item = document.querySelector(`[data-id="${bookmarkId}"]`);
        if (item) {
            masonryInstance.remove(item);
            masonryInstance.layout();
        }
        showMessage('删除成功', 'success');
        
    } catch (error) {
        console.error('Delete error:', error);
        showMessage('删除失败，请重试', 'error');
    }
}

function setupMobileEvents() {
    let pressTimer;
    
    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                e.preventDefault();
                const bookmarkId = item.dataset.id;
                deleteBookmark(bookmarkId);
            }, 800);
        });

        item.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        item.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    });
}

function handlePagination() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                loadFavorites(currentUserId, currentPage + 1);
            }
        });
    });

    const sentinel = document.createElement('div');
    sentinel.style.height = '100px';
    document.querySelector('.container').appendChild(sentinel);
    observer.observe(sentinel);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { session } } = await client.auth.getSession();
        if (!session) window.location.href = '/login';

        const userId = session.user.id;
        window.currentUserId = userId;
        
        await loadFavorites(userId);
        handlePagination();
        
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (masonryInstance) {
                    masonryInstance.options.transitionDuration = '0.4s';
                    masonryInstance.layout();
                }
            }, 200);
        });

    } catch (error) {
        console.error('Init error:', error);
        window.location.href = '/login';
    }
});
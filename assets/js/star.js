const supabaseUrl = 'https://fefckqwvcvuadiixvhns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZmNrcXd2Y3Z1YWRpaXh2aG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDE5OTUsImV4cCI6MjA1MTkxNzk5NX0.-OUllwH7v2K-j4uIx7QQaV654R5Gz5_1jP4BGdkWWfg';
const client = supabase.createClient(supabaseUrl, supabaseKey);

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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { session }, error } = await client.auth.getSession();
        
        if (error || !session) {
            window.location.href = '/user/login';
            return;
        }

        const user = session.user;
        const page = getPageFromUrl();
        await loadFavorites(user.id, page);
    } catch (error) {
        console.error('Error loading session:', error);
    }
});

/**
 * 从 Supabase 加载用户的书签并显示
 * @param {string} userId - 用户ID
 */
async function loadFavorites(userId, page = 1) {
    const itemsPerPage = 20;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    try {
        const { data: bookmarks, error } = await client
            .from('bookmarks')
            .select('id, url, image, created_at')
            .eq('user_id', userId)
            .range(from, to);

        if (error) {
            console.error('Error fetching bookmarks:', error);
            return;
        }

        const portfolioContainer = document.querySelector('.portfolio');
        if (portfolioContainer) {
            let htmlContent = '';

            bookmarks.forEach(item => {
                if (isMobile) {
                    // 移动端版本 - 长按触发
                    htmlContent += `
                        <div class="portfolio-item" data-bookmark-id="${item.id}">
                            <div class="thumb">
                                <a href="${item.url}">
                                    <img class="img-item lazyload" data-src="${item.image}" src="/assets/img/loading.gif" alt="Image">
                                </a>
                                <div class="widget-tags" style="background-color: rgba(0,0,0,0.3);">
                                    <span>收藏时间: ${new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    // PC版本 - 悬停显示删除按钮
                    htmlContent += `
                        <div class="portfolio-item">
                            <div class="thumb">
                                <a href="${item.url}">
                                    <img class="img-item lazyload" data-src="${item.image}" src="/assets/img/loading.gif" alt="Image">
                                </a>
                                <div class="widget-tags" style="background-color: rgba(0,0,0,0.3);">
                                    <span>收藏时间: ${new Date(item.created_at).toLocaleDateString()}</span>
                                    <button class="delete-btn" onclick="deleteBookmark('${item.id}')">删除</button>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });

            portfolioContainer.innerHTML = htmlContent;

            // 如果是移动设备，添加长按事件监听
            if (isMobile) {
                const portfolioItems = document.querySelectorAll('.portfolio-item');
                portfolioItems.forEach(item => {
                    let pressTimer;
                    const bookmarkId = item.dataset.bookmarkId;

                    item.addEventListener('touchstart', () => {
                        item.style.opacity = '0.7';
                        pressTimer = setTimeout(() => {
                            if (confirm('确定要删除这张图片吗？')) {
                                deleteBookmark(bookmarkId);
                            } else {
                                item.style.opacity = '1';
                            }
                        }, 800);
                    });

                    item.addEventListener('touchend', () => {
                        clearTimeout(pressTimer);
                        item.style.opacity = '1';
                    });

                    item.addEventListener('touchmove', () => {
                        clearTimeout(pressTimer);
                        item.style.opacity = '1';
                    });
                });
            }
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

/**
 * 删除书签
 * @param {string} bookmarkId - 书签ID
 */
async function deleteBookmark(bookmarkId) {
    try {
        const { error } = await client
            .from('bookmarks')
            .delete()
            .eq('id', bookmarkId);

        if (error) {
            console.error('Error deleting bookmark:', error);
            showMessage('删除失败，请重试', 'error');
        } else {
            showMessage('删除成功', 'success');
            const page = getPageFromUrl();
            const user = await client.auth.getUser();
            await loadFavorites(user.data.user.id, page);
        }
    } catch (error) {
        console.error('Error deleting bookmark:', error);
    }
}

function getPageFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page'), 10);
    return isNaN(page) || page < 1 ? 1 : page;
}

document.addEventListener('DOMContentLoaded', () => {
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const portfolioItems = document.querySelectorAll('.portfolio-item');

        portfolioItems.forEach(item => {
            const thumb = item.querySelector('.thumb');
            const widgetTags = item.querySelector('.widget-tags');

            thumb.addEventListener('mouseenter', () => {
                widgetTags.style.display = 'block';
                widgetTags.style.opacity = '1';
            });

            thumb.addEventListener('mouseleave', () => {
                widgetTags.style.display = 'none';
                widgetTags.style.opacity = '0';
            });
        });
    }
});

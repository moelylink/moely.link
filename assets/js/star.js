const supabaseUrl = 'https://fefckqwvcvuadiixvhns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZmNrcXd2Y3Z1YWRpaXh2aG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDE5OTUsImV4cCI6MjA1MTkxNzk5NX0.-OUllwH7v2K-j4uIx7QQaV654R5Gz5_1jP4BGdkWWfg';
const client = supabase.createClient(supabaseUrl, supabaseKey);

const materialIconsLink = document.createElement('link');
materialIconsLink.rel = 'stylesheet';
materialIconsLink.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css';
document.head.appendChild(materialIconsLink);

let masonryInstance = null;
let currentPage = 1;
let isLoading = false;
let notificationCount = 0;
const notifications = new Set();

const style = document.createElement('style');
style.textContent = `.notification{position:fixed;bottom:16px;right:16px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .3s cubic-bezier(.645,.045,.355,1);z-index:1000;width:300px;height:48px;backdrop-filter:blur(10px);transform:translateX(calc(100% + 32px));overflow:hidden}.notification.show{transform:translateX(0)}.notification-wrapper{width:100%;height:100%;display:flex;align-items:center}.notification-content{flex:1;padding:0 16px;z-index:2;background:#fff;height:100%;display:flex;align-items:center}.notification-content p{margin:0;padding:0;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.notification-icon{width:48px;display:flex;align-items:center;justify-content:center;z-index:1;height:100%}.notification-icon .material-icons-round{font-size:20px;color:#fff}.notification.error .notification-icon{background:#ff4d4f}.notification.error .notification-content p{color:#cf1322}.notification.success .notification-icon{background:#52c41a}.notification.success .notification-content p{color:#389e0d}.notification.warning .notification-icon{background:#faad14}.notification.warning .notification-content p{color:#d48806}`;
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
            .order('created_at', { ascending: false })
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
                    <a href="${item.url}">
                        <img class="lazyload" data-src="${item.image}" src="/assets/img/loading.gif" alt="Bookmarked content">
                    </a>
                    <div class="widget-tags">
                        <span>${new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <button class="delete-btn" onclick="showConfirmDialog('${item.id}')">
                        <span class="mdi mdi-delete"></span>
                    </button>
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
    // 不再需要移动端特殊处理
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
        if (!session) window.location.href = '/user/login';

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
        window.location.href = '/user/login/';
    }
});

// 添加删除按钮样式
const deleteBtnStyle = document.createElement('style');
deleteBtnStyle.textContent = `.delete-btn{position:absolute;top:8px;right:8px;width:32px;height:32px;border-radius:4px;background:rgba(255,255,255,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s ease;box-shadow:0 2px 4px rgba(0,0,0,.1);color:#666}.delete-btn:hover{background:#ff4d4f;color:#fff}.delete-btn .mdi{font-size:20px}.portfolio-item{position:relative}`;
document.head.appendChild(deleteBtnStyle);

// 添加确认弹窗样式
const confirmDialogStyle = document.createElement('style');
confirmDialogStyle.textContent = `.confirm-dialog{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:2147483647;opacity:0;visibility:hidden;transition:all .3s ease}.confirm-dialog.show{opacity:1;visibility:visible}.confirm-content{background:#fff;padding:24px;border-radius:8px;width:90%;max-width:400px;box-shadow:0 2px 10px rgba(0,0,0,.1);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);margin:0}.confirm-icon{text-align:center;margin-bottom:16px;color:#ff4d4f}.confirm-icon .mdi{font-size:48px}.confirm-title{font-size:18px;margin-bottom:20px;color:#333;text-align:center}.confirm-buttons{display:flex;justify-content:center;gap:12px}.confirm-btn{padding:8px 24px;border-radius:4px;border:none;cursor:pointer;font-size:14px;transition:all .3s ease;min-width:80px}.confirm-cancel{background:#f5f5f5;color:#666}.confirm-cancel:hover{background:#e8e8e8}.confirm-delete{background:#ff4d4f;color:#fff}.confirm-delete:hover{background:#ff7875}@media(max-width:480px){.confirm-content{width:85%;padding:20px}.confirm-icon .mdi{font-size:40px}.confirm-title{font-size:16px;margin-bottom:16px}.confirm-btn{padding:8px 16px;min-width:70px}}`;
document.head.appendChild(confirmDialogStyle);

// 创建确认弹窗
const confirmDialog = document.createElement('div');
confirmDialog.className = 'confirm-dialog';
confirmDialog.innerHTML = `
    <div class="confirm-content">
        <div class="confirm-icon">
            <span class="mdi mdi-alert"></span>
        </div>
        <div class="confirm-title">确定要删除这个收藏吗？</div>
        <div class="confirm-buttons">
            <button class="confirm-btn confirm-cancel">取消</button>
            <button class="confirm-btn confirm-delete">删除</button>
        </div>
    </div>
`;
document.body.appendChild(confirmDialog);

let currentBookmarkId = null;

// 显示确认弹窗
function showConfirmDialog(bookmarkId) {
    currentBookmarkId = bookmarkId;
    confirmDialog.classList.add('show');
}

// 隐藏确认弹窗
function hideConfirmDialog() {
    confirmDialog.classList.remove('show');
    currentBookmarkId = null;
}

// 绑定确认弹窗事件
confirmDialog.querySelector('.confirm-cancel').addEventListener('click', hideConfirmDialog);
confirmDialog.querySelector('.confirm-delete').addEventListener('click', () => {
    if (currentBookmarkId) {
        deleteBookmark(currentBookmarkId);
        hideConfirmDialog();
    }
});
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

// 添加确认弹窗样式
const confirmDialogStyle = document.createElement('style');
confirmDialogStyle.textContent = `.confirm-dialog{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:2147483647;opacity:0;visibility:hidden;transition:all .3s ease}.confirm-dialog.show{opacity:1;visibility:visible}.confirm-content{background:#fff;padding:24px;border-radius:8px;width:90%;max-width:400px;box-shadow:0 2px 10px rgba(0,0,0,.1);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);margin:0}.confirm-icon{text-align:center;margin-bottom:16px;color:#ff4d4f}.confirm-icon .mdi{font-size:48px}.confirm-title{font-size:18px;margin-bottom:20px;color:#333;text-align:center}.confirm-buttons{display:flex;justify-content:center;gap:12px}.confirm-btn{padding:8px 24px;border-radius:4px;border:none;cursor:pointer;font-size:14px;transition:all .3s ease;min-width:80px}.confirm-cancel{background:#f5f5f5;color:#666}.confirm-cancel:hover{background:#e8e8e8}.confirm-ok{background:#1890ff;color:#fff}.confirm-ok:hover{background:#40a9ff}@media(max-width:480px){.confirm-content{width:85%;padding:20px}.confirm-icon .mdi{font-size:40px}.confirm-title{font-size:16px;margin-bottom:16px}.confirm-btn{padding:8px 16px;min-width:70px}}`;
document.head.appendChild(confirmDialogStyle);

// 创建确认弹窗
const confirmDialog = document.createElement('div');
confirmDialog.className = 'confirm-dialog';
confirmDialog.innerHTML = `
    <div class="confirm-content">
        <div class="confirm-icon">
            <span class="mdi mdi-alert"></span>
        </div>
        <div class="confirm-title"></div>
        <div class="confirm-buttons">
            <button class="confirm-btn confirm-cancel">取消</button>
            <button class="confirm-btn confirm-ok">确定</button>
        </div>
    </div>
`;
document.body.appendChild(confirmDialog);

// 显示确认弹窗
function showConfirmDialog(title, callback, icon = "mdi-alert") {
    confirmDialog.querySelector('.confirm-title').textContent = title;
    confirmDialog.querySelector('.confirm-icon .mdi').className = `mdi ${icon}`;
    confirmDialog.classList.add('show');
    
    const okBtn = confirmDialog.querySelector('.confirm-ok');
    const cancelBtn = confirmDialog.querySelector('.confirm-cancel');
    
    const handleOk = () => {
        hideConfirmDialog();
        if (callback) callback(true);
    };
    
    const handleCancel = () => {
        hideConfirmDialog();
        if (callback) callback(false);
    };
    
    okBtn.onclick = handleOk;
    cancelBtn.onclick = handleCancel;
}

// 隐藏确认弹窗
function hideConfirmDialog() {
    confirmDialog.classList.remove('show');
}

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

async function addStar(id, imgUrl) {
    starText.innerText = "请稍候…";

    const userId = await getUserId();
    if (!userId) {
        showConfirmDialog('请先登录以使用收藏功能!', (confirmed) => {
            if (confirmed) {
                window.location.href = '/user/login';
            }
            starText.innerText = "请先登录";
        }, "mdi-login");
        return;
    }

    const detailUrl = `/img/${id}/`;
    const isBookmarked = await Bookmarked(detailUrl, userId);
    if(isBookmarked) {
        showMessage('您已经收藏过了！', 'warning');
        starText.innerText = "已收藏";
        return;
    }

    try {
        const { error } = await client
            .from('bookmarks')
            .insert([{ user_id: userId, url: detailUrl, image: imgUrl, created_at: new Date().toISOString() }]);

        if (error) {
            starText.innerText = "收藏失败";
            showConfirmDialog('添加收藏失败，请重试', () => {
                starText.innerText = "添加收藏";
            }, "mdi-alert-circle");
        } else {
            starText.innerText = "收藏成功";
            showMessage('已添加到收藏！', 'success');
        }
    } catch (error) {
        console.error('Error adding to favorites:', error);
        showConfirmDialog('添加收藏失败，请重试', () => {
            starText.innerText = "添加收藏";
        }, "mdi-alert-circle");
    }
}

async function getUserId() {
    const { data: { session }, error } = await client.auth.getSession();
    if (error || !session) {
        return null;
    }
    return session.user.id;
}

async function Bookmarked(url, userId) {
    // 查询用户的所有收藏
    const { data: bookmarks, error } = await client
      .from("bookmarks")
      .select("url")
      .eq("user_id", userId);
  
    if (error) {
      showMessage(error.message, 'error');
      return;
    }

    // 判断 URL 是否已经存在于收藏夹
    const isBookmarked = bookmarks.some((bookmark) => bookmark.url === url);
    return isBookmarked;
}
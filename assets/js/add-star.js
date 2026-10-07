let notificationCount = 0;
const notifications = new Set();

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

async function addStar(buttonID, id, imgUrl) {
    var starBtn = document.getElementById(`${buttonID}`);
    starBtn.innerText = "请稍候…";

    const userId = await getUserId();
    if (!userId) {
        showConfirmDialog('请先登录以使用收藏功能!', (confirmed) => {
            if (confirmed) { window.location.href = 'https://user.moely.link/login/?redirect=' + window.location.href; starBtn.innerText = "添加收藏"; }
            else { showMessage('用户未登录！', 'warning'); starBtn.innerText = "请先登录"; }
        }, "mdi-login");
        return;
    }

    const detailUrl = `/img/${id}/`;
    const isBookmarked = await Bookmarked(detailUrl, userId);
    if(isBookmarked) {
        showMessage('您已经收藏过了！', 'warning');
        starBtn.innerText = "已收藏";
        return;
    }

    try {
        const { error } = await client
            .from('bookmarks')
            .insert([{ user_id: userId, url: detailUrl, image: imgUrl, created_at: new Date().toISOString() }]);

        if (error) {
            starBtn.innerText = "收藏失败";
            showConfirmDialog('添加收藏失败，请重试', () => {
                starBtn.innerText = "添加收藏";
            }, "mdi-alert-circle");
        } else {
            starBtn.innerText = "收藏成功";
            showMessage('已添加到收藏！', 'success');
        }
    } catch (error) {
        console.error('Error adding to favorites:', error);
        showConfirmDialog('添加收藏失败，请重试', () => {
            starBtn.innerText = "添加收藏";
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

async function downloadImg(buttonID, imageID, imageEncode) {
    var downloadBtn = document.getElementById(`${buttonID}`);
    downloadBtn.innerText = "请稍候…";

    const userId = await getUserId();
    if (!userId) {
        showConfirmDialog('登录账号后即可下载原图!', (confirmed) => {
            if (confirmed) { window.location.href = 'https://user.moely.link/login/?redirect=' + window.location.href; downloadBtn.innerText = "下载原图"; }
            else { showMessage('用户未登录！', 'warning'); downloadBtn.innerText = "登录后下载"; }
        }, "mdi-login");
        return;
    }
    
    var imageUrl = atob(imageEncode)
    fetch(imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result;

                // 在 Android WebView 中发送 base64 数据给原生应用
                if (window.Android && typeof window.Android.downloadBlob === 'function') {
                    window.Android.downloadBlob(base64data, `${imageID}.jpg`);
                    downloadBtn.innerText = "下载成功";
                } else {
                    // Web 浏览器备用方案
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.style.display = "none";
                    a.href = url;
                    a.download = `${imageID}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    downloadBtn.innerText = "下载成功";
                }
            };
            reader.readAsDataURL(blob); // 将Blob转换为Base64
        })
        .catch(() => {
            downloadBtn.innerText = "下载失败";
            showConfirmDialog("下载失败！尝试手动下载？", (confirmed) => {
                if (confirmed) {
                    window.open(`${imageUrl}`, "长按保存图片");
                }
            }, "mdi-download-off");
        });
}

const supabaseUrl = 'https://fefckqwvcvuadiixvhns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZmNrcXd2Y3Z1YWRpaXh2aG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDE5OTUsImV4cCI6MjA1MTkxNzk5NX0.-OUllwH7v2K-j4uIx7QQaV654R5Gz5_1jP4BGdkWWfg';
const client = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session }, error } = await client.auth.getSession();
    
    if (error || !session) {
        window.location.href = '/user/login';
        return;
    }

    const user = session.user;
    updateWelcomeTitle(user.email);
    displayUserInfo(user);
    setupCollapsibleForms();
    setupFormHandlers();
    setupEmailValidation();
    setupStarLink();
    setupThirdPartyLinks();
    setupLogoutButton();
});

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

function updateWelcomeTitle(email) {
    const emailPrefix = email.split('@')[0];
    const capitalizedPrefix = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    const welcomeTitle = document.getElementById('UC-welcome-title');
    if (welcomeTitle) {
        welcomeTitle.textContent = `欢迎回来  ${capitalizedPrefix}`;
    }
}

function setupCollapsibleForms() {
    const toggleHeaders = document.querySelectorAll('.toggle-form');
    toggleHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const targetFormId = header.getAttribute('data-target');
            const targetForm = document.getElementById(`UC-change-${targetFormId}-form`);
            
            document.querySelectorAll('.collapsible-form').forEach(form => {
                if (form !== targetForm) {
                    form.classList.remove('active');
                }
            });

            if (targetForm) {
                targetForm.classList.toggle('active');
            }
        });
    });
}

function setupFormHandlers() {
    const passwordForm = document.getElementById('UC-change-password-form');
    const emailForm = document.getElementById('UC-change-email-form');

    if (passwordForm) {
        passwordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const currentPassword = document.getElementById('UC-current-password').value;
            const newPassword = document.getElementById('UC-new-password').value;
            const repeatNewPassword = document.getElementById('UC-repeat-new-password').value;

            if (newPassword.length < 8) {
                showMessage('密码长度必须大于8位', 'error');
                return;
            }

            if (newPassword !== repeatNewPassword) {
                showMessage('新密码和重复新密码不匹配', 'error');
                return;
            }

            const { data: { user }, error: userError } = await client.auth.getUser();
            if (userError) {
                showMessage('无法获取用户信息: ' + userError.message, 'error');
                return;
            }

            if (user.password && !currentPassword) {
                showMessage('请输入当前密码', 'error');
                return;
            }

            const { error } = await client.auth.updateUser({ password: newPassword });
            if (error) {
                showMessage('修改密码失败: ' + error.message, 'error');
            } else {
                showMessage('密码修改成功', 'success');
                passwordForm.reset();
            }
        });
    }

    if (emailForm) {
        emailForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const newEmail = document.getElementById('UC-new-email').value;

            if (!validateEmail(newEmail)) {
                showMessage('请输入有效的邮箱地址', 'error');
                return;
            }

            const { error } = await client.auth.updateUser({ email: newEmail });
            if (error) {
                showMessage('修改邮箱失败: ' + error.message, 'error');
            } else {
                showMessage('邮箱修改成功，请检查您的新邮箱以确认更改', 'success');
                emailForm.reset();
            }
        });
    }
}

function setupEmailValidation() {
    const emailInput = document.getElementById('UC-new-email');
    const emailError = document.getElementById('email-error');

    if (emailInput && emailError) {
        emailInput.addEventListener('input', () => {
            if (emailInput.value === '') {
                emailError.classList.remove('active');
            } else if (!validateEmail(emailInput.value)) {
                emailError.classList.add('active');
            } else {
                emailError.classList.remove('active');
            }
        });
    }
}

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}

function setupStarLink() {
    const starLink = document.getElementById('star-link');
    if (starLink) {
        starLink.addEventListener('click', () => {
            window.location.href = '/user/star';
        });
    }
}

function setupThirdPartyLinks() {
    const githubLink = document.getElementById('github-link');
    const microsoftLink = document.getElementById('microsoft-link');
    const googleLink = document.getElementById('google-link');

    if (githubLink) {
        githubLink.addEventListener('click', async () => {
            const { error } = await client.auth.signInWithOAuth({ provider: 'github' });
            if (error) console.error('Error linking GitHub:', error);
        });
    }

    if (microsoftLink) {
        microsoftLink.addEventListener('click', async () => {
            const { error } = await client.auth.signInWithOAuth({ provider: 'microsoft' });
            if (error) console.error('Error linking Microsoft:', error);
        });
    }

    if (googleLink) {
        googleLink.addEventListener('click', async () => {
            const { error } = await client.auth.signInWithOAuth({ provider: 'google' });
            if (error) console.error('Error linking Google:', error);
        });
    }
}

/**
 * 显示用户的当前邮箱和注册时间
 * @param {object} user - 用户对象
 */
function displayUserInfo(user) {
    const emailElement = document.getElementById('current-email');
    const registrationDateElement = document.getElementById('registration-date');

    if (emailElement) {
        emailElement.textContent = user.email;
    }

    if (registrationDateElement) {
        const registrationDate = new Date(user.created_at).toLocaleDateString();
        registrationDateElement.textContent = registrationDate;
    }
}

function setupLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            const { error } = await client.auth.signOut();
            if (error) {
                console.error('Error logging out:', error);
            } else {
                window.location.href = '/user/login';
            }
        });
    }
}

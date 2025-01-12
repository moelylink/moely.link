document.addEventListener('DOMContentLoaded', (event) => {
    const supabaseUrl = 'https://fefckqwvcvuadiixvhns.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZmNrcXd2Y3Z1YWRpaXh2aG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDE5OTUsImV4cCI6MjA1MTkxNzk5NX0.-OUllwH7v2K-j4uIx7QQaV654R5Gz5_1jP4BGdkWWfg';
    const client = supabase.createClient(supabaseUrl, supabaseKey);
    
    let notificationCount = 0;
    const notifications = new Set();

    const style = document.createElement('style');
    style.textContent = `
        .notification { position: fixed; bottom: 16px; right: 16px; border-radius: 8px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1); z-index: 1000; width: 250px; height: 48px; backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.06); transform: translateX(calc(100% + 32px));  display: flex; align-items: center; justify-content: flex-start; }
        .notification.show { transform: translateX(0); }
    
        .notification-wrapper { display: flex; width: 100%; height: 100%; align-items: center; justify-content: flex-start;}
    
        .notification-icon { width: 48px; display: flex; align-items: center; justify-content: center; z-index: 1; opacity: 0.15; flex-shrink: 0;}
        .notification-icon .material-icons-round { font-size: 24px; }
    
        .notification-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 16px; z-index: 2; }
        .notification-content p { margin: 0; padding: 0; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    
        .notification.error { background: rgba(255, 242, 240, 0.95); border-color: #ffccc7; }
        .notification.error .notification-icon { color: #ff4d4f; }
        .notification.error .notification-content p { color: #cf1322; }
    
        .notification.success { background: rgba(246, 255, 237, 0.95); border-color: #b7eb8f; }
        .notification.success .notification-icon { color: #52c41a; }
        .notification.success .notification-content p { color: #389e0d; }
    
        .notification.warning { background: rgba(255, 251, 230, 0.95); border-color: #ffe58f; }
        .notification.warning .notification-icon { color: #faad14; }
        .notification.warning .notification-content p { color: #d48806; }
    `;
    document.head.appendChild(style);
    
    function updateNotificationsPosition() {
        let offset = 0;
        notifications.forEach(notification => {
            notification.style.bottom = `${16 + offset}px`;
            offset += 56;
        });
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

    const UserLogin = document.getElementById('UserLogin');
    const UserRegister = document.getElementById('UserRegister');
    const ResetPwd = document.getElementById('ResetPwd');

    if (UserLogin) {
        UserLogin.addEventListener('click', async (e) => {
            e.preventDefault();
            const useremail = document.getElementById('login-email').value;
            const userpwd = document.getElementById('login-password').value;
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;
            if (!hcaptchaResponse) { 
                showMessage('请完成人机验证！', 'warning');
                return; 
            }
            const { data, error } = await client.auth.signInWithPassword({
                email: useremail,
                password: userpwd,
                options: {
                    captchaToken: hcaptchaResponse
                }
            });
            if (error) {
                showMessage(error.message, 'error');
                if (window.hcaptcha) {
                    window.hcaptcha.reset();
                }
            } else {
                showMessage('登录成功！', 'success');
                setTimeout(() => {
                    window.location.href = '/user/';
                }, 1000);
            }
        });
    }

    if (UserRegister) {
        UserRegister.addEventListener('click', async (e) => {
            e.preventDefault();
            const useremail = document.getElementById('register-email').value;
            const userpwd = document.getElementById('register-password').value;
            const repeatpwd = document.getElementById('password-repeat').value;
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;
            if (!hcaptchaResponse) { 
                showMessage('请完成人机验证！', 'warning');
                return; 
            }
            if( repeatpwd != userpwd ) { 
                showMessage('两次输入的密码不同！', 'warning');
                return; 
            }
            const { data, error } = await client.auth.signUp({
                email: useremail,
                password: userpwd,
                options: {
                    captchaToken: hcaptchaResponse
                }
            });
            if (error) {
                showMessage(error.message, 'error');
                if (window.hcaptcha) {
                    window.hcaptcha.reset();
                }
            } else {
                showMessage('注册成功，请前往邮箱激活您的账号。记得检查垃圾收件箱！', 'success');
                setTimeout(() => {
                    window.location.href = '/user/login/';
                }, 3000);
            }
        });
    }

    if (ResetPwd) {
        ResetPwd.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('user-email').value;
            const newPwd = document.getElementById('new-password').value;
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;
            if (!hcaptchaResponse) { 
                showMessage('请完成人机验证！', 'warning');
                return; 
            }
            const { data, error } = await client.auth.resetPasswordForEmail(
                email,
                {
                    captchaToken: hcaptchaResponse,
                    redirectTo: 'https://www.moely.link/user/login/'
                }
            );

            if (error) { 
                showMessage(error.message, 'error');
                if (window.hcaptcha) {
                    window.hcaptcha.reset();
                }
                return; 
            }
            showMessage('密码重置链接已发送，请检查邮箱！', 'success');
            setTimeout(() => {
                window.location.href = '/user/login/';
            }, 3000);
            
            client.auth.onAuthStateChange(async (event, session) => {
                if (event === "PASSWORD_RECOVERY") {
                    const { data, error } = await client.auth.updateUser({ 
                        password: newPwd 
                    });
                    if (error) {
                        showMessage('密码更新失败：' + error.message, 'error');
                        if (window.hcaptcha) {
                            window.hcaptcha.reset();
                        }
                    } else {
                        showMessage('密码已更新！', 'success');
                        setTimeout(() => {
                            window.location.href = '/user/login/';
                        }, 3000);;
                    }
                }
            });
        });
    }
});

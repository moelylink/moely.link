document.addEventListener('DOMContentLoaded', (event) => {
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

    const UserLogin = document.getElementById('UserLogin');
    const UserRegister = document.getElementById('UserRegister');
    const ResetPwd = document.getElementById('ResetPwd');

    if (UserLogin) {
        UserLogin.addEventListener('click', async (e) => {
            e.preventDefault();
            const useremail = document.getElementById('login-email').value.trim();
            const userpwd = document.getElementById('login-password').value.trim();
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;

            if (!useremail) {
                showMessage('请输入邮箱！', 'warning');
                return;
            }
            if (!userpwd) {
                showMessage('请输入密码！', 'warning');
                return;
            }
            if (userpwd.length < 8) {
                showMessage('密码长度必须大于8位！', 'warning');
                return;
            }
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
                }, 3000);
            }
        });
    }

    if (UserRegister) {
        UserRegister.addEventListener('click', async (e) => {
            e.preventDefault();
            const useremail = document.getElementById('register-email').value.trim();
            const userpwd = document.getElementById('register-password').value.trim();
            const repeatpwd = document.getElementById('password-repeat').value.trim();
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;
            const checkbox = document.getElementById('checkbox');

            if (!useremail) {
                showMessage('请输入邮箱！', 'warning');
                return;
            }
            if (!userpwd) {
                showMessage('请输入密码！', 'warning');
                return;
            }
            if (userpwd.length < 8) {
                showMessage('密码长度必须大于8位！', 'warning');
                return;
            }
            if (!repeatpwd) {
                showMessage('请重复输入密码！', 'warning');
                return;
            }
            if (!checkbox.checked) {
                showMessage('请阅读并同意用户协议！', 'warning');
                return;
            }
            if (!hcaptchaResponse) { 
                showMessage('请完成人机验证！', 'warning');
                return; 
            }
            if (repeatpwd != userpwd) { 
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
            const email = document.getElementById('user-email').value.trim();
            const newPwd = document.getElementById('new-password').value.trim();
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;

            if (!email) {
                showMessage('请输入邮箱！', 'warning');
                return;
            }
            if (!newPwd) {
                showMessage('请输入新密码！', 'warning');
                return;
            }
            if (newPwd.length < 8) {
                showMessage('密码长度必须大于8位！', 'warning');
                return;
            }
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
                        }, 3000);
                    }
                }
            });
        });
    }

    const toRegister = document.getElementById('toRegister');
    const toLogin = document.getElementById('toLogin');
    const toRegisterMobile = document.getElementById('toRegisterMobile');
    const toLoginMobile = document.getElementById('toLoginMobile');
    const container = document.querySelector('.auth-container');
    
    if (toRegister) {
        toRegister.addEventListener('click', switchToRegister);
    }
    
    if (toLogin) {
        toLogin.addEventListener('click', switchToLogin);
    }

    if (toRegisterMobile) {
        toRegisterMobile.addEventListener('click', switchToRegister);
    }
    
    if (toLoginMobile) {
        toLoginMobile.addEventListener('click', switchToLogin);
    }

    function switchToRegister() {
        container.classList.add('show-register');
        if (window.hcaptcha) {
            window.hcaptcha.reset();
        }
        document.querySelectorAll('form').forEach(form => form.reset());
    }

    function switchToLogin() {
        container.classList.remove('show-register');
        if (window.hcaptcha) {
            window.hcaptcha.reset();
        }
        document.querySelectorAll('form').forEach(form => form.reset());
    }

    const githubLogin = document.querySelector('.github-login');
    const microsoftLogin = document.querySelector('.microsoft-login');
    const googleLogin = document.querySelector('.google-login');

    if (githubLogin) {
        githubLogin.addEventListener('click', async () => {
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;
            if (!hcaptchaResponse) { 
                showMessage('请完成人机验证！', 'warning');
                return; 
            }
            const { data, error } = await client.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `https://www.moely.link/user/`,
                },
            })              
            if (error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('前往GitHub授权！', 'success');
            }
        });
    }

    if (microsoftLogin) {
        microsoftLogin.addEventListener('click', async () => {
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;
            if (!hcaptchaResponse) { 
                showMessage('请完成人机验证！', 'warning');
                return; 
            }
            const { data, error } = await client.auth.signInWithOAuth({
                provider: 'azure',
                options: {
                    scopes: 'email',
                    redirectTo: `https://www.moely.link/user/`,
                },
            })              
            if (error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('前往Microsoft授权！', 'success');
            }
        });
    }

    if (googleLogin) {
        googleLogin.addEventListener('click', async () => {
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;
            if (!hcaptchaResponse) { 
                showMessage('请完成人机验证！', 'warning');
                return; 
            }
            const { data, error } = await client.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    scopes: 'email',
                    redirectTo: `https://www.moely.link/user/`,
                },
            })              
            if (error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('前往Google授权！', 'success');
            }
        });
    }
});

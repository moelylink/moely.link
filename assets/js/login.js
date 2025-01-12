document.addEventListener('DOMContentLoaded', (event) => {
    const supabaseUrl = 'https://fefckqwvcvuadiixvhns.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZmNrcXd2Y3Z1YWRpaXh2aG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDE5OTUsImV4cCI6MjA1MTkxNzk5NX0.-OUllwH7v2K-j4uIx7QQaV654R5Gz5_1jP4BGdkWWfg';
    const client = supabase.createClient(supabaseUrl, supabaseKey);
    
    const UserLogin = document.getElementById('UserLogin');
    const UserRegister = document.getElementById('UserRegister');
    const ResetPwd = document.getElementById('ResetPwd');

    if (UserLogin) {
        UserLogin.addEventListener('click', async (e) => {
            e.preventDefault();
            const useremail = document.getElementById('login-email').value;
            const userpwd = document.getElementById('login-password').value;
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;
            if (!hcaptchaResponse) { alert('请完成人机验证！'); return; }
            const { data, error } = await client.auth.signInWithPassword({
                email: useremail,
                password: userpwd,
                options: {
                    captchaToken: hcaptchaResponse
                }
            });
            if (error) {
                alert(error.message);
                if (window.hcaptcha) {
                    window.hcaptcha.reset();
                }
            } else {
                alert("登录成功！");
                window.location.href = '/user/';
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
            if (!hcaptchaResponse) { alert('请完成人机验证！'); return; }
            if( repeatpwd != userpwd ) { alert('两次输入的密码不同！'); return; }
            const { data, error } = await client.auth.signUp({
                email: useremail,
                password: userpwd,
                options: {
                    captchaToken: hcaptchaResponse
                }
            });
            if (error) {
                alert(error.message);
                if (window.hcaptcha) {
                    window.hcaptcha.reset();
                }
            } else {
                alert("注册成功，请前往邮箱激活您的账号。记得检查垃圾收件箱！");
                window.location.href = '/user/login/';
            }
        });
    }

    if (ResetPwd) {
        ResetPwd.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('user-email').value;
            const newPwd = document.getElementById('new-password').value;
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;
            if (!hcaptchaResponse) { alert('请完成人机验证！'); return; }
            const { data, error } = await client.auth.resetPasswordForEmail(
                email,
                {
                    captchaToken: hcaptchaResponse,
                    redirectTo: 'https://www.moely.link/user/login/'
                }
            );

            if (error) { 
                alert(error.message);
                if (window.hcaptcha) {
                    window.hcaptcha.reset();
                }
                return; 
            }
            alert("密码重置链接已发送，请检查邮箱！");
            window.location.href = '/user/login/';
            
            client.auth.onAuthStateChange(async (event, session) => {
                if (event === "PASSWORD_RECOVERY") {
                    const { data, error } = await client.auth.updateUser({ 
                        password: newPwd 
                    });
                    if (error) {
                        alert("密码更新失败：" + error.message);
                        if (window.hcaptcha) {
                            window.hcaptcha.reset();
                        }
                    } else {
                        alert("密码已更新！");
                        window.location.href = '/user/login/';
                    }
                }
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', (event) => {
    const supabaseUrl = 'https://fefckqwvcvuadiixvhns.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZmNrcXd2Y3Z1YWRpaXh2aG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDE5OTUsImV4cCI6MjA1MTkxNzk5NX0.-OUllwH7v2K-j4uIx7QQaV654R5Gz5_1jP4BGdkWWfg';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    
    const UserLogin = document.getElementById('UserLogin');
    const UserRegister = document.getElementById('UserRegister');
    const ResetPwd = document.getElementById('ResetPwd');

    if (UserLogin) {  // Check if the element exists
        UserLogin.addEventListener('click', async (e) => {
            e.preventDefault();
            const useremail = document.getElementById('login-email').value;
            const userpwd = document.getElementById('login-password').value;
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;
            if (!hcaptchaResponse) { alert('请完成人机验证！'); return; }
            const { error } = await supabase.auth.signInWithPassword({
                email: useremail,
                password: userpwd,
                options: {
                    captchaToken,
                    redirectTo: 'https://www.moely.link/user/',
                }
            });
            if (error) alert(error.message);
            else alert("登录成功！");
            captcha.current.resetCaptcha();
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
            const { error } = await supabase.auth.signUp({
                email: useremail,
                password: userpwd,
                options: {
                    captchaToken,
                    emailRedirectTo: 'https://www.moely.link/user/',
                }
            });
            if (error) alert(error.message);
            else alert("注册成功，请前往邮箱激活您的账号。记得检查垃圾收件箱！");
            captcha.current.resetCaptcha();
        });
    }
    if (ResetPwd) {
        ResetPwd.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('user-email').value;
            const newPwd = document.getElementById('new-password').value;
            const hcaptchaResponse = document.querySelector("[name='h-captcha-response']").value;
            if (!hcaptchaResponse) { alert('请完成人机验证！'); return; }
            const { error } = await supabase.auth.resetPasswordForEmail(email,{
                redirectTo: 'https://www.moely.link/user/login/',
            });
            if (error) { alert(error.message); return; }
            else alert("密码重置链接已发送，请检查邮箱！");
            useEffect(() => {
                supabase.auth.onAuthStateChange(async (event, session) => {
                    if (event == "PASSWORD_RECOVERY") {
                        const { data, error } = await supabase.auth.updateUser({ password: newPwd });
                        if (data) alert("密码已更新！");
                        if (error) alert("密码更新失败！");
                    }
                })
            }, [])
        });
    }
});

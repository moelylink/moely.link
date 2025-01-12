const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const UserLogin = document.getElementById('UserLogin');
const UserRegister = document.getElementById('UserRegister');
const ResetPwd = document.getElementById('ResetPwd');

// 用户登录
UserLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const hcaptchaResponse = grecaptcha.getResponse();
    if (!hcaptchaResponse) { ('请完成人机验证！'); return; }
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
            captchaToken,
            redirectTo: 'https://www.moely.link/user/',
        }
    });
    if (error) alert(error.message);
    else alert("登录成功！");
});

// 用户注册
UserRegister.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const repeatpwd = document.getElementById('password-repeat').value;
    const hcaptchaResponse = grecaptcha.getResponse();
    if (!hcaptchaResponse) { ('请完成人机验证！'); return; }
    if( repeatpwd != password ) { alert('两次输入的密码不同！'); return; }
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            captchaToken,
            emailRedirectTo: 'https://www.moely.link/user/',
        }
    });
    if (error) alert(error.message);
    else alert("注册成功，请前往邮箱激活您的账号。记得检查垃圾收件箱！");
    captcha.current.resetCaptcha()
});

// 找回密码
UserRegister.addEventListener('click', async (e) => {
    const email = document.getElementById('user-email').value;
    const newPwd = document.getElementById('user-email').value;
    const { error } = await supabase.auth.resetPasswordForEmail(email,{
        redirectTo: 'https://www.moely.link/user/login/',
    });
    if (error) alert(error.message);
    else alert("密码重置链接已发送，请检查邮箱！");
    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event == "PASSWORD_RECOVERY") {
                const { data, error } = await supabase.auth.updateUser({ password: newPwd })
                if (data) alert("密码已更新！")
                if (error) alert("密码更新失败！")
            }
        })
    }, [])     
});

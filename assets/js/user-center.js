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
    setupCollapsibleForms();
    setupFormHandlers();
    setupEmailValidation();
    setupStarLink();
});

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
                alert('密码长度必须大于8位');
                return;
            }

            if (newPassword !== repeatNewPassword) {
                alert('新密码和重复新密码不匹配');
                return;
            }

            const { error } = await client.auth.updateUser({ password: newPassword });
            if (error) {
                alert('修改密码失败: ' + error.message);
            } else {
                alert('密码修改成功');
                passwordForm.reset();
            }
        });
    }

    if (emailForm) {
        emailForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const newEmail = document.getElementById('UC-new-email').value;

            if (!validateEmail(newEmail)) {
                alert('请输入有效的邮箱地址');
                return;
            }

            const { error } = await client.auth.updateUser({ email: newEmail });
            if (error) {
                alert('修改邮箱失败: ' + error.message);
            } else {
                alert('邮箱修改成功，请检查您的新邮箱以确认更改');
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

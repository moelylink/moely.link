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
    const dashboardContainer = document.querySelector('.dashboard-container');
    dashboardContainer.innerHTML = `
        <h1>欢迎, ${user.email}</h1>
        <button id="logout">登出</button>
    `;

    const logoutButton = document.getElementById('logout');
    logoutButton.addEventListener('click', async () => {
        const { error } = await client.auth.signOut();
        if (!error) {
            window.location.href = '/user/login';
        }
    });
});


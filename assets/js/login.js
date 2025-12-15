const supabaseUrl = 'https://fefckqwvcvuadiixvhns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZmNrcXd2Y3Z1YWRpaXh2aG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDE5OTUsImV4cCI6MjA1MTkxNzk5NX0.-OUllwH7v2K-j4uIx7QQaV654R5Gz5_1jP4BGdkWWfg';

// ============================================================
// 1. 读取 .moely.link 下的 Cookie
// ============================================================
const rootDomainStorage = {
    getItem: (key) => {
        const name = key + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
        }
        return null;
    },
    setItem: (key, value) => {
        const d = new Date();
        d.setTime(d.getTime() + (365*24*60*60*1000));
        const expires = "expires="+ d.toUTCString();
        // 关键：domain=.moely.link 使得 user 和 www 子域名互通
        document.cookie = `${key}=${value};${expires};domain=.moely.link;path=/;SameSite=Lax;Secure`;
    },
    removeItem: (key) => {
        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;domain=.moely.link;path=/;`;
    }
};

// ============================================================
// 2. 初始化 Supabase 客户端 (带 auth 配置)
// ============================================================
const client = supabase.createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: rootDomainStorage, // 必须使用这个自定义存储
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

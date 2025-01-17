const supabaseUrl = 'https://fefckqwvcvuadiixvhns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZmNrcXd2Y3Z1YWRpaXh2aG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDE5OTUsImV4cCI6MjA1MTkxNzk5NX0.-OUllwH7v2K-j4uIx7QQaV654R5Gz5_1jP4BGdkWWfg';
const client = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { session }, error } = await client.auth.getSession();
        
        if (error || !session) {
            window.location.href = '/user/login';
            return;
        }

        const user = session.user;
        loadFavorites(user.id);
        setupThirdPartyLinks();
    } catch (error) {
        console.error('Error loading session:', error);
    }
});

/**
 * 从 Supabase 加载用户的喜欢并显示
 * @param {string} userId - 用户ID
 */
async function loadFavorites(userId) {
    try {
        const { data: bookmarks, error } = await client
            .from('bookmarks')
            .select('id, url, image, created_at')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching bookmarks:', error);
            return;
        }

        const portfolioContainer = document.querySelector('.portfolio');
        if (portfolioContainer) {
            portfolioContainer.innerHTML = '';

            bookmarks.forEach(item => {
                const itemHtml = `
                    <div class="portfolio-item">
                        <div class="thumb">
                            <a href="${item.url}">
                                <img class="img-item lazyload" data-src="${item.image}" src="/assets/img/loading.gif" alt="Image"></img>
                            </a>
                            <div class="widget-tags" style="background-color: rgba(0,0,0,0.3);">
                                <span>创建于: ${new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                `;
                portfolioContainer.insertAdjacentHTML('beforeend', itemHtml);
            });
        }
    } catch (error) {
        console.error('Error loading bookmarks:', error);
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

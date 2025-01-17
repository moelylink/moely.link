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
        const { data: favorites, error } = await client
            .from('favorites') // 名为 favorites 的表，并且表中有 user_id、id、image_url、title 和 tags 字段
            .select('id, image_url, title, tags')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching favorites:', error);
            return;
        }

        const portfolioContainer = document.querySelector('.portfolio');
        if (portfolioContainer) {
            portfolioContainer.innerHTML = '';

            favorites.forEach(item => {
                const itemHtml = `
                    <div class="portfolio-item">
                        <div class="thumb">
                            <a href="/favorites/${item.id}/">
                                <img class="img-item lazyload" data-src="${item.image_url}" src="/assets/img/loading.gif" alt="${item.title}"></img>
                            </a>
                            <div class="widget-tags" style="background-color: rgba(0,0,0,0.3);">
                                ${item.tags.map(tag => `<span><a href="/tags/${tag}/" rel="tag">#${tag}</a></span>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
                portfolioContainer.insertAdjacentHTML('beforeend', itemHtml);
            });
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

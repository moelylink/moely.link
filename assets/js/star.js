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
        const page = getPageFromUrl();
        loadFavorites(user.id, page);
        setupThirdPartyLinks();
    } catch (error) {
        console.error('Error loading session:', error);
    }
});

/**
 * 从 Supabase 加载用户的书签并显示
 * @param {string} userId - 用户ID
 */
async function loadFavorites(userId,) {
    try {
        const { data: bookmarks, error } = await client
            .from('bookmarks')
            .select('id, url, image, created_at')
            .eq('user_id', userId)
            .range(from, to);

        if (error) {
            console.error('Error fetching bookmarks:', error);
            return;
        }

        const portfolioContainer = document.querySelector('.items');
        if (portfolioContainer) {
            portfolioContainer.innerHTML = '';

            bookmarks.forEach(item => {
                const portfolioItem = document.createElement('div');
                portfolioItem.className = 'portfolio-item';

                const link = document.createElement('a');
                link.href = item.url;

                const img = document.createElement('img');
                img.className = 'img-item lazyload';
                img.setAttribute('data-src', item.image);
                img.src = '/assets/img/loading.gif';

                const widgetTags = document.createElement('div');
                widgetTags.className = 'widget-tags';
                widgetTags.style.backgroundColor = 'rgba(0,0,0,0.3)';

                const span = document.createElement('span');
                span.textContent = `收藏时间: ${new Date(item.created_at).toLocaleDateString()}`;

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.textContent = '删除';
                deleteButton.onclick = () => deleteBookmark(item.id);

                widgetTags.appendChild(span);
                widgetTags.appendChild(deleteButton);
                link.appendChild(img);
                portfolioItem.appendChild(link);
                portfolioItem.appendChild(widgetTags);
                portfolioContainer.appendChild(portfolioItem);
            });

            setupPagination(userId, page, itemsPerPage);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

/**
 * 删除书签
 * @param {string} bookmarkId - 书签ID
 */
async function deleteBookmark(bookmarkId) {
    try {
        const { error } = await client
            .from('bookmarks')
            .delete()
            .eq('id', bookmarkId);

        if (error) {
            console.error('Error deleting bookmark:', error);
            alert('删除失败，请重试');
        } else {
            alert('删除成功');
            const page = getPageFromUrl();
            const user = await client.auth.getUser();
            loadFavorites(user.data.user.id, page);
        }
    } catch (error) {
        console.error('Error deleting bookmark:', error);
    }
}

/**
 * 设置分页控件
 * @param {string} userId - 用户ID
 * @param {number} currentPage - 当前页码
 * @param {number} itemsPerPage - 每页项目数
 */
async function setupPagination(userId, currentPage, itemsPerPage) {
    const { count, error } = await client
        .from('bookmarks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching bookmark count:', error);
        return;
    }

    const totalPages = Math.ceil(count / itemsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    const quickJumpContainer = document.querySelector('.quick-jump');

    if (paginationContainer && quickJumpContainer) {
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            quickJumpContainer.style.display = 'none';
        } else {
            paginationContainer.style.display = 'block';
            quickJumpContainer.style.display = 'block';
            paginationContainer.innerHTML = '';

            for (let i = 1; i <= totalPages; i++) {
                const pageLink = document.createElement('a');
                pageLink.href = `?page=${i}`;
                pageLink.textContent = i;
                if (i === currentPage) {
                    pageLink.classList.add('active');
                }
                paginationContainer.appendChild(pageLink);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach(item => {
        const thumb = item.querySelector('.thumb');
        const widgetTags = item.querySelector('.widget-tags');

        thumb.addEventListener('mouseenter', () => {
            widgetTags.style.display = 'block';
            widgetTags.style.opacity = '1';
        });

        thumb.addEventListener('mouseleave', () => {
            widgetTags.style.display = 'none';
            widgetTags.style.opacity = '0';
        });
    });
});

async function addFavorite(userId, imageId, imageUrl) {
    try {
        const { error } = await client
            .from('bookmarks')
            .insert([{ user_id: userId, image_id: imageId, image: imageUrl, created_at: new Date().toISOString() }]);

        if (error) {
            console.error('Error adding favorite:', error);
            alert('添加收藏失败，请重试');
        } else {
            alert('已添加到收藏');
        }
    } catch (error) {
        console.error('Error adding favorite:', error);
    }
}

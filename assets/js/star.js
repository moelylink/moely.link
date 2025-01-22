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
 * 从 URL 获取当前页码
 * @returns {number} 当前页码
 */
function getPageFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page'), 10);
    return isNaN(page) || page < 1 ? 1 : page;
}

/**
 * 从 Supabase 加载用户的书签并显示
 * @param {string} userId - 用户ID
 * @param {number} page - 当前页码
 */
async function loadFavorites(userId, page = 1) {
    const itemsPerPage = 20;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

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

        const portfolioContainer = document.querySelector('.portfolio');
        if (portfolioContainer) {
            portfolioContainer.innerHTML = '';

            bookmarks.forEach(item => {
                const itemHtml = `
                    <div class="portfolio-item" data-id="${item.id}">
                        <div class="thumb">
                            <a href="${item.url}">
                                <img class="img-item lazyload" data-src="${item.image}" src="/assets/img/loading.gif" alt="Image"></img>
                            </a>
                            <div class="widget-tags" style="background-color: rgba(0,0,0,0.3);">
                                <span>收藏于: ${new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                            <button class="delete-btn" onclick="deleteBookmark('${item.id}')">删除</button>
                        </div>
                    </div>
                `;
                portfolioContainer.insertAdjacentHTML('beforeend', itemHtml);
            });

            setupPagination(userId, page, itemsPerPage);
        }
    } catch (error) {
        console.error('Error loading bookmarks:', error);
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
    if (paginationContainer) {
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

function quickjump() {
    const pagenum = document.getElementById("jumpTo").value.trim();
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlParams.get('page'), 10) || 1;
    const baseUrl = window.location.href.split('?')[0];

    if (pagenum === '' || isNaN(pagenum) || pagenum < 1) {
        alert('请输入有效的页码');
        return;
    }

    const newPage = parseInt(pagenum, 10);
    if (newPage === 1) {
        window.location.href = baseUrl;
    } else {
        window.location.href = `${baseUrl}?page=${newPage}`;
    }
}

let masonryInstance = null;
let allData = [];
let isLoading = false;
let loadedGroups = 0;
const MAX_GROUPS = 5;

// 随机打乱
function shuffleArray(arr) {
    return arr.map(v => ({ sort: Math.random(), value: v }))
        .sort((a, b) => a.sort - b.sort)
        .map(a => a.value);
}

document.addEventListener('DOMContentLoaded', () => {
    initMasonry();
    loadAllDataAndFirstPage();

    // 额外再绑一次 lazysizes 完全加载事件
    document.addEventListener('lazyloaded', () => {
        if (masonryInstance) masonryInstance.layout();
    });

    // 监听滚动
    window.addEventListener('scroll', handleScroll);
});

function initMasonry() {
    const container = document.querySelector('.portfolio');
    if (!container) return;
    masonryInstance = new Masonry(container, {
        itemSelector: '.portfolio-item',
        columnWidth: '.portfolio-item',
        percentPosition: true,
        gutter: 0,
        transitionDuration: '0.4s'
    });
}

async function loadAllDataAndFirstPage() {
    try {
        const resp = await fetch('/index.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        // 随机排序好
        allData = shuffleArray(data);
        
        // 加载第一批
        loadNextBatch();
    } catch (err) {
        console.error(err);
        const c = document.querySelector('.portfolio');
        if (c) c.textContent = '加载数据出错：' + err.message;
    }
}

function loadNextBatch() {
    if (isLoading || allData.length === 0 || loadedGroups >= MAX_GROUPS) return;
    isLoading = true;

    // 取出20个
    const itemsToTake = 20;
    const batch = allData.splice(0, itemsToTake);
    
    if (batch.length === 0) {
        isLoading = false;
        return;
    }
    
    loadedGroups++;

    const container = document.querySelector('.portfolio');
    
    // 生成DOM元素数组
    let elements = batch.map(item => {
        const div = document.createElement('div');
        div.className = 'portfolio-item';
        div.innerHTML = `
            <div class="thumb">
                <a href="/img/${item.id}/">
                    <img class="img-item lazyload" data-src="${item.urls}" src="/assets/img/loading.gif" alt="${item.id}">
                    ${item.total ? `<span class="total-num">${item.total}</span>` : ''}
                </a>
                <div class="widget-tags">
                    ${item.id}
                    <br/>By ${item.category} ${item.user}
                </div>
            </div>
        `;
        return div;
    });

    // 穿插广告
    if (window.sitePromos && window.sitePromos.length > 0 && Math.random() > 0.2) {
        const promo = window.sitePromos[Math.floor(Math.random() * window.sitePromos.length)];
        const adDiv = document.createElement('div');
        adDiv.className = 'portfolio-item promo-item';
        adDiv.innerHTML = `
            <div class="thumb">
                <a href="/v/?url=${promo.url}" target="_blank" rel="nofollow">
                    <img class="img-item" src="${promo.img}" alt="${promo.title}" style="width: 100%; display: block;">
                </a>
                <div class="widget-tags">
                    ${promo.title}
                    <br/>${promo.description}
                </div>
            </div>
        `;
        // 随机插个位置
        const pos = Math.floor(Math.random() * elements.length);
        elements.splice(pos, 0, adDiv);
    }

    // 添加到 DOM 中
    const fragment = document.createDocumentFragment();
    elements.forEach(el => fragment.appendChild(el));
    container.appendChild(fragment);

    // 立即通知 Masonry 新元素进来了，并触发一次排版
    if (masonryInstance) {
        masonryInstance.appended(elements);
        masonryInstance.layout();
    }

    // 只针对这批新元素监听图片加载，而不是整个 container
    imagesLoaded(elements, function() {
        if (masonryInstance) {
            masonryInstance.layout();
        }
        isLoading = false;
    }).on('progress', function() {
         // 某张图加载后，再次重排修正高度
         if (masonryInstance) masonryInstance.layout();
    });
}

function handleScroll() {
    if (loadedGroups >= MAX_GROUPS) return;

    // 视窗高度 + 滚动距离 >= 页面高度 - 触发距离 (e.g., 800px)
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || window.pageYOffset;
    const clientHeight = window.innerHeight;

    if (scrollTop + clientHeight >= scrollHeight - 1000) {
        loadNextBatch();
    }
}


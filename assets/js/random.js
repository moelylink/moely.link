// 随机打乱
function shuffleArray(arr) {
    return arr.map(v => ({ sort: Math.random(), value: v }))
        .sort((a, b) => a.sort - b.sort)
        .map(a => a.value);
}

document.addEventListener('DOMContentLoaded', () => {
    loadAndRender();
  
    // 额外再绑一次 lazysizes 完全加载事件
    document.addEventListener('lazyloaded', () => {
      if (masonryInstance) masonryInstance.layout();
    });
});
  
let masonryInstance = null;
function initMasonry() {
    if (masonryInstance) {
        masonryInstance.destroy();
    }
    masonryInstance = new Masonry('.portfolio', {
        itemSelector: '.portfolio-item',
        columnWidth: '.portfolio-item',
        percentPosition: true,
        gutter: 0,
        transitionDuration: '0.4s'
    });
    console.log('Masonry initialized, items:', masonryInstance.items.length);
}
  
async function loadAndRender() {
    try {
        const resp = await fetch('/index.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const items = shuffleArray(data).slice(0, 20);
    
        const container = document.querySelector('.portfolio');
        container.innerHTML = items.map(item => `
            <div class="portfolio-item">
                <div class="thumb">
                    <a href="/img/${item.id}/">
                        <img  class="img-item lazyload" data-src="${item.urls}" src="/assets/img/loading.gif" alt="${item.id}">
                        ${item.total ? `<span class="total-num">${item.total}</span>` : ''}
                    </a>
                    <div class="widget-tags">
                        ${item.id}
                        <br/>By ${item.category} ${item.user}
                    </div>
                </div>
            </div>
        `).join('');
    
        // 先初始化一次
        initMasonry();
    
        // 然后实时监听所有 <img>（含占位&真实）加载进度，不断触发布局
        imagesLoaded(container).on('progress', () => {
            masonryInstance.layout();
        });
    
    } catch (err) {
        console.error(err);
        const c = document.querySelector('.portfolio');
        if (c) c.textContent = '加载数据出错：' + err.message;
    }
}

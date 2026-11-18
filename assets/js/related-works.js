document.addEventListener('DOMContentLoaded', () => {
    const dataEl = document.getElementById('related-works');
    const sectionEl = document.getElementById('related-works-section');
    const gridEl = document.getElementById('related-works-grid');
    if (!dataEl || !sectionEl || !gridEl) return;

    let items = [];
    try {
        items = JSON.parse(dataEl.textContent || '[]');
    } catch (e) {
        console.warn('Failed to parse related-works JSON:', e);
        return;
    }

    if (!Array.isArray(items) || items.length === 0) return;

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
        if (!item || !item.id || !item.thumb) return;

        const card = document.createElement('div');
        card.className = 'thumb related-work-thumb';

        const link = document.createElement('a');
        link.href = `/img/${item.id}/`;
        link.title = item.title || `ID: ${item.id}`;

        const img = document.createElement('img');
        img.className = 'img-item';
        img.src = item.thumb;
        img.alt = item.title || `ID: ${item.id}`;
        img.loading = 'lazy';
        link.appendChild(img);
        card.appendChild(link);

        const tagsOverlay = document.createElement('div');
        tagsOverlay.className = 'widget-tags';
        tagsOverlay.appendChild(document.createTextNode(item.title || `ID: ${item.id}`));
        tagsOverlay.appendChild(document.createElement('br'));
        const byParts = ['By', item.category, item.artist].filter(Boolean).join(' ');
        tagsOverlay.appendChild(document.createTextNode(byParts));
        card.appendChild(tagsOverlay);

        fragment.appendChild(card);
    });

    if (fragment.childNodes.length === 0) return;
    gridEl.appendChild(fragment);
    sectionEl.style.display = '';
});

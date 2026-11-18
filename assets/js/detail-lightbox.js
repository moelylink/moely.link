document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.jQuery === 'undefined' || !window.jQuery.fancybox) return;
    const $ = window.jQuery;

    let currentScale = 1;
    let currentRotate = 0;

    function applyTransform(instance) {
        if (!instance || !instance.current) return;
        const $img = instance.current.$image || (instance.current.$content && instance.current.$content.find('img'));
        if (!$img || !$img.length) return;
        $img.css({
            transform: `scale(${currentScale}) rotate(${currentRotate}deg)`,
            transition: 'transform 0.2s ease'
        });
    }

    $.extend($.fancybox.defaults.btnTpl, {
        fbZoomIn: '<button type="button" data-fancybox-zoom-in class="fancybox-button" title="放大"><i class="fa-solid fa-magnifying-glass-plus"></i></button>',
        fbZoomOut: '<button type="button" data-fancybox-zoom-out class="fancybox-button" title="缩小"><i class="fa-solid fa-magnifying-glass-minus"></i></button>',
        fbRotateLeft: '<button type="button" data-fancybox-rotate-left class="fancybox-button" title="逆时针旋转"><i class="fa-solid fa-rotate-left"></i></button>',
        fbRotateRight: '<button type="button" data-fancybox-rotate-right class="fancybox-button" title="顺时针旋转"><i class="fa-solid fa-rotate-right"></i></button>',
        fbDownload: '<button type="button" data-fancybox-dl class="fancybox-button" title="下载原图"><i class="fa-solid fa-download"></i></button>',
        fbStar: '<button type="button" data-fancybox-star class="fancybox-button" title="添加收藏"><i class="fa-solid fa-star"></i></button>',
        fullScreen: '<button type="button" data-fancybox-fullscreen class="fancybox-button fancybox-button--fsenter" title="全屏"><i class="fa-solid fa-expand"></i></button>',
        close: '<button type="button" data-fancybox-close class="fancybox-button fancybox-button--close" title="关闭"><i class="fa-solid fa-xmark"></i></button>',
        arrowLeft: '<button type="button" data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="上一张"><i class="fa-solid fa-chevron-left"></i></button>',
        arrowRight: '<button type="button" data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="下一张"><i class="fa-solid fa-chevron-right"></i></button>'
    });

    $('[data-fancybox="gallery"]').fancybox({
        buttons: [
            'fbZoomIn',
            'fbZoomOut',
            'fbRotateLeft',
            'fbRotateRight',
            'fbDownload',
            'fbStar',
            'fullScreen',
            'close'
        ],
        clickContent: false,
        wheel: false,
        afterShow: function (instance) {
            currentScale = 1;
            currentRotate = 0;
            applyTransform(instance);
        }
    });

    $(document).on('click', '[data-fancybox-zoom-in]', function () {
        const instance = $.fancybox.getInstance();
        currentScale = Math.min(4, +(currentScale + 0.25).toFixed(2));
        applyTransform(instance);
    });

    $(document).on('click', '[data-fancybox-zoom-out]', function () {
        const instance = $.fancybox.getInstance();
        currentScale = Math.max(0.5, +(currentScale - 0.25).toFixed(2));
        applyTransform(instance);
    });

    $(document).on('click', '[data-fancybox-rotate-left]', function () {
        const instance = $.fancybox.getInstance();
        currentRotate -= 90;
        applyTransform(instance);
    });

    $(document).on('click', '[data-fancybox-rotate-right]', function () {
        const instance = $.fancybox.getInstance();
        currentRotate += 90;
        applyTransform(instance);
    });

    $(document).on('click', '[data-fancybox-dl]', function () {
        const instance = $.fancybox.getInstance();
        const $orig = instance && instance.current && instance.current.opts && instance.current.opts.$orig;
        if (!$orig || !$orig.length || typeof window.downloadImg !== 'function') return;
        const dlId = $orig.attr('data-dl-id');
        const dlKey = $orig.attr('data-dl-key');
        const dlEnc = $orig.attr('data-dl-enc');
        if (dlId && dlKey && dlEnc) {
            window.downloadImg(dlId, dlKey, dlEnc);
        }
    });

    $(document).on('click', '[data-fancybox-star]', function () {
        const instance = $.fancybox.getInstance();
        const $orig = instance && instance.current && instance.current.opts && instance.current.opts.$orig;
        if (!$orig || !$orig.length || typeof window.addStar !== 'function') return;
        const starId = $orig.attr('data-star-id');
        const workId = $orig.attr('data-work-id');
        const starThumb = $orig.attr('data-star-thumb');
        if (starId && workId && starThumb) {
            window.addStar(starId, workId, starThumb);
        }
    });

    // Left vertical timeline scrubber for multi-image pages
    const timelineEl = document.getElementById('multipageTimeline');
    const trackEl = document.getElementById('timelineTrack');
    const thumbEl = document.getElementById('timelineThumb');
    const infoEl = timelineEl ? timelineEl.querySelector('.timeline-info') : null;
    const currentTextEl = document.getElementById('timelineCurrentText');
    const subTextEl = document.getElementById('timelineSubText');
    const prevBtn = document.getElementById('timelinePrevBtn');
    const nextBtn = document.getElementById('timelineNextBtn');
    const pageItems = Array.from(document.querySelectorAll('.multipage-item[id^="page-p"]'));

    if (timelineEl && trackEl && thumbEl && pageItems.length > 1) {
        const total = pageItems.length;
        let activeIdx = 0;
        let isDragging = false;
        let ticking = false;

        function setUI(idx) {
            activeIdx = Math.max(0, Math.min(total - 1, idx));
            const ratio = total > 1 ? activeIdx / (total - 1) : 0;
            const maxTop = Math.max(0, trackEl.clientHeight - thumbEl.offsetHeight);
            const thumbTop = Math.round(ratio * maxTop);
            thumbEl.style.top = `${thumbTop}px`;
            if (infoEl) {
                const maxInfoTop = Math.max(0, trackEl.clientHeight - infoEl.offsetHeight);
                const centeredTop = thumbTop + Math.round((thumbEl.offsetHeight - infoEl.offsetHeight) / 2);
                const infoTop = Math.max(0, Math.min(centeredTop, maxInfoTop));
                infoEl.style.transform = `translateY(${infoTop}px)`;
            }
            if (currentTextEl) currentTextEl.textContent = `${activeIdx + 1} / ${total}`;
            if (subTextEl) {
                const resBadge = pageItems[activeIdx].querySelector('.img-res-badge');
                const resText = resBadge ? resBadge.textContent.trim() : '';
                subTextEl.textContent = resText;
            }
            trackEl.setAttribute('aria-valuenow', String(activeIdx + 1));
            if (prevBtn) prevBtn.disabled = activeIdx === 0;
            if (nextBtn) nextBtn.disabled = activeIdx === total - 1;
        }

        function scrollToIndex(idx, smooth = true) {
            const clamped = Math.max(0, Math.min(total - 1, idx));
            const target = pageItems[clamped];
            if (!target) return;
            setUI(clamped);
            const stickyTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--detail-sticky-top'), 10) || 84;
            const top = target.getBoundingClientRect().top + window.scrollY - stickyTop;
            window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
        }

        function syncFromScroll() {
            if (isDragging) return;
            const anchorY = window.innerHeight * 0.32;
            let bestIdx = 0;
            let bestDist = Infinity;
            pageItems.forEach((el, idx) => {
                const rect = el.getBoundingClientRect();
                const dist = Math.abs(rect.top - anchorY);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = idx;
                }
            });
            setUI(bestIdx);
        }

        window.addEventListener('scroll', () => {
            if (ticking || isDragging) return;
            ticking = true;
            requestAnimationFrame(() => {
                syncFromScroll();
                ticking = false;
            });
        }, { passive: true });

        if (prevBtn) {
            prevBtn.addEventListener('click', () => scrollToIndex(activeIdx - 1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => scrollToIndex(activeIdx + 1));
        }

        function scrubToClientY(clientY, smooth) {
            const rect = trackEl.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / Math.max(1, rect.height)));
            const targetIdx = Math.round(ratio * (total - 1));
            scrollToIndex(targetIdx, smooth);
        }

        trackEl.addEventListener('pointerdown', (e) => {
            isDragging = true;
            trackEl.classList.add('dragging');
            timelineEl.classList.add('is-dragging');
            trackEl.setPointerCapture(e.pointerId);
            scrubToClientY(e.clientY, false);
        });

        trackEl.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            scrubToClientY(e.clientY, false);
        });

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            trackEl.classList.remove('dragging');
            timelineEl.classList.remove('is-dragging');
        };
        trackEl.addEventListener('pointerup', endDrag);
        trackEl.addEventListener('pointercancel', endDrag);

        setUI(0);
    }

    // Keep sticky detail card below fixed header & announcement banner
    function updateStickyTop() {
        const header = document.querySelector('header.l-header');
        const banner = document.getElementById('daily-notification-banner');
        let bottom = header ? header.getBoundingClientRect().bottom : 64;
        if (banner && getComputedStyle(banner).display !== 'none' && !banner.classList.contains('closing')) {
            const bRect = banner.getBoundingClientRect();
            if (bRect.bottom > bottom) bottom = bRect.bottom;
        }
        document.documentElement.style.setProperty('--detail-sticky-top', `${Math.max(72, Math.ceil(bottom + 16))}px`);
    }

    updateStickyTop();
    window.addEventListener('load', updateStickyTop);
    window.addEventListener('resize', updateStickyTop);
    const bannerEl = document.getElementById('daily-notification-banner');
    if (bannerEl) {
        new MutationObserver(updateStickyTop).observe(bannerEl, { attributes: true, attributeFilter: ['style', 'class'] });
        const closeBtn = bannerEl.querySelector('.close-banner');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => setTimeout(updateStickyTop, 550));
        }
    }
});

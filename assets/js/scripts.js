(function () {
    "use strict";

    var $window, $document, $body;

    $window = $(window);
    $document = $(document);
    $body = $("body");


    /*==============================================
     Pre loader init
     ===============================================*/

    var $portfolio = $('.portfolio').not('#search-portfolio, .random-portfolio').masonry({
        itemSelector: '.portfolio-item',
        percentPosition: true,
        columnWidth: '.portfolio-item'
    });

    // 挂载全局对象以便 HTML 模版的 img onload / onerror 能正确回调重排
    window.portfolioMasonry = $portfolio.data('masonry') || { layout: function() { lazyloaded(); } };

    if (typeof $.fn.imagesLoaded === 'function') {
        $portfolio.imagesLoaded(function () {
            $portfolio.masonry('layout');
        });
    }

    if ($('.ajaxloadpost .next').length > 0) {
        var masonry = $portfolio.data('masonry');
        $portfolio.infiniteScroll({
            path: '.next',
            append: '.portfolio-item',
            hideNav: '.ajaxloadpost',
            status: '.page-load-status',
            history: false,
            scrollThreshold: 100,
            outlayer: masonry
        });

        $('.portfolio').on('append.infiniteScroll', function () {
            $("img.lazyload").lazyload({
                onLoaded: lazyloaded
            });
        });
    }

    var layoutTimer = null;
    function lazyloaded() {
        if (layoutTimer) clearTimeout(layoutTimer);
        layoutTimer = setTimeout(function () {
            if ($portfolio && $portfolio.data('masonry')) {
                $portfolio.masonry('layout');
            }
        }, 60);
    }

    // 立即为首屏已有的 lazyload 元素绑定监听
    if (typeof $.fn.lazyload === 'function') {
        $("img.lazyload").lazyload({
            onLoaded: lazyloaded
        });
    }

    $window.on("load", function () {
        $("#loading").fadeOut();
        $("#tb-preloader").fadeOut("slow", function () {
            $(this).remove();
        });
        if (typeof $.fn.lazyload === 'function') {
            $("img.lazyload").lazyload({
                onLoaded: lazyloaded
            });
        }
        if ($portfolio && $portfolio.data('masonry')) {
            $portfolio.masonry('layout');
        }
    });

    // 若 3 秒后页面资源仍未就绪，自动平滑切入循环态（低网速待机）
    setTimeout(function () {
        var $pre = $("#tb-preloader");
        if ($pre.length && $pre.is(":visible")) {
            $pre.removeClass("is-animating").addClass("is-looping");
        }
    }, 3000);

    /*==============================================
     Wow init
     ===============================================*/
    if (typeof WOW == "function")
        new WOW().init();

})(jQuery);

// ============================================================
// 横幅通知与导航栏布局同步
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
    var bannerId = "daily-notification-banner";
    var preloaderId = "tb-preloader"; 
    var masonrySelector = ".portfolio-masonry, .isotope, .blog-masonry"; 
    var headerSelectors = [".site-navbar-wrapper", ".l-header", ".l-navbar", ".menuzord", "header"]; 
    var storageKey = "BannerClosed";
    
    var checkInterval = setInterval(waitForMasonryReady, 200); // 循环检查，直到 Masonry 初始化完毕
    var maxRetries = 50; // 最多等待 10秒 (50 * 200ms)，防止死循环
    var retryCount = 0;

    function waitForMasonryReady() {
        retryCount++;
        var preloader = document.getElementById(preloaderId);
        var isPreloaderGone = !preloader || preloader.style.display === 'none' || getComputedStyle(preloader).display === 'none' || getComputedStyle(preloader).opacity === '0';
        var masonryContainer = document.querySelector(masonrySelector);
        var isMasonryReady = true; // 默认 true，如果页面没瀑布流也视为 Ready
        if (masonryContainer) {
            // 如果页面有瀑布流容器，必须等它高度大于 0
            isMasonryReady = masonryContainer.offsetHeight > 50;
        }
        if ((isPreloaderGone && isMasonryReady) || retryCount >= maxRetries) {
            clearInterval(checkInterval);
            initDailyBanner();
        }
    }
    
    function initDailyBanner() {
        var banner = document.getElementById(bannerId);
        if (!banner) return;

        var closeBtn = banner.querySelector(".close-banner");
        
        // 日期检查
        var dateObj = new Date();
        var today = dateObj.getFullYear() + "-" + ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" + ("0" + dateObj.getDate()).slice(-2);
        var lastClosedDate = localStorage.getItem(storageKey);
        
        // 获取导航栏真实高度
        function getRealNavHeight() {
            for (var i = 0; i < headerSelectors.length; i++) {
                var el = document.querySelector(headerSelectors[i]);
                if (el) {
                    var rect = el.getBoundingClientRect();
                    if (rect.height > 0) return rect.height;
                }
            }
            return 64; // 兜底标准导航高度
        }

        // 触发 Masonry 重排 (Resize)
        function triggerMasonryRefresh() {
            try {
                window.dispatchEvent(new Event('resize'));
            } catch (e) {
                var evt = window.document.createEvent('UIEvents'); 
                evt.UIEvent('resize', true, false, window, 0); 
                window.dispatchEvent(evt); 
            }
        }

        // 布局计算
        function repositionElements() {
            var navHeight = getRealNavHeight();
            
            if (banner.style.display !== 'none' && !banner.classList.contains('closing')) {
                var bannerHeight = banner.offsetHeight || 0;
                banner.style.top = navHeight + "px";
                document.body.style.paddingTop = bannerHeight + "px";
            } else {
                document.body.style.paddingTop = "";
            }
        }

        if (lastClosedDate !== today) {
            banner.style.display = "block";
            repositionElements();
            setTimeout(function() {
                banner.classList.add("visible");
                repositionElements();
                triggerMasonryRefresh();
            }, 100);
            
            // 监听变化
            window.addEventListener('resize', repositionElements);
            window.addEventListener('scroll', repositionElements);
        } else {
            banner.style.display = "none";
            document.body.style.paddingTop = "";
        }
        
        if (closeBtn) {
            closeBtn.addEventListener("click", function() {
                localStorage.setItem(storageKey, today);
                banner.classList.remove("visible");
                banner.classList.add("closing");
                repositionElements();
                
                setTimeout(function() {
                    banner.style.display = "none";
                    banner.classList.remove("closing");                    
                    repositionElements();
                    triggerMasonryRefresh();                    
                    window.removeEventListener('resize', repositionElements);
                    window.removeEventListener('scroll', repositionElements);
                }, 550);
            });
        }
    }
});

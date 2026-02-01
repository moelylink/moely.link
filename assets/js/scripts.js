(function () {
    "use strict";

    var $window, $document, $body;

    $window = $(window);
    $document = $(document);
    $body = $("body");


    /*==============================================
     Pre loader init
     ===============================================*/

    var $portfolio = $('.portfolio').masonry({
        itemSelector: '.portfolio-item',
    });

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

    function lazyloaded() {
        $portfolio.masonry('layout');
    }

    $window.on("load", function () {
        $("#loading").fadeOut();
        $("#tb-preloader").delay(200).fadeOut("slow").remove();
        $("img.lazyload").lazyload({
            onLoaded: lazyloaded
        });
        $(".js-primary-navigation").menuzord();
    });

    /*==============================================
     Wow init
     ===============================================*/
    if (typeof WOW == "function")
        new WOW().init();

})(jQuery);

// ============================================================
// 横幅通知
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
    var bannerId = "daily-notification-banner";
    var preloaderId = "tb-preloader"; 
    var masonrySelector = ".portfolio-masonry, .isotope, .blog-masonry"; 
    var headerSelectors = [".l-header", ".l-navbar", ".menuzord", "header"]; 
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
        var closeBtn = banner ? banner.querySelector(".close-banner") : null;
        
        // 日期检查
        var dateObj = new Date();
        var today = dateObj.getFullYear() + "-" + ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" + ("0" + dateObj.getDate()).slice(-2);
        var lastClosedDate = localStorage.getItem(storageKey);
        if (!banner) return;

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
            document.body.style.paddingTop = "15px";
        }
        
        // 获取导航栏真实高度
        function getRealNavHeight() {
            for (var i = 0; i < headerSelectors.length; i++) {
                var el = document.querySelector(headerSelectors[i]);
                if (el) {
                    var rect = el.getBoundingClientRect();
                    if (rect.height > 0) return rect.height;
                }
            }
            return 0; // 如果没找到，返回0
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
                var bannerHeight = banner.offsetHeight;
                banner.style.top = navHeight + "px";
                document.body.style.paddingTop = (navHeight + bannerHeight - 50) + "px";
            } else {
                document.body.style.paddingTop = "15px";
            }
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
                    triggerMasonryRefresh();                    
                    window.removeEventListener('resize', repositionElements);
                    window.removeEventListener('scroll', repositionElements);
                }, 550);
            });
        }
    }
});

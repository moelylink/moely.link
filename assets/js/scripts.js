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
    // 1. 配置部分
    var bannerId = "daily-notification-banner";
    var storageKey = "dailyBannerClosedDate";
    var banner = document.getElementById(bannerId);
    var closeBtn = banner.querySelector(".close-banner");

    // 2. 获取当前本地日期，手动拼接本地时间，确保准确。
    var dateObj = new Date();
    var year = dateObj.getFullYear();
    var month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    var day = ("0" + dateObj.getDate()).slice(-2);
    var today = year + "-" + month + "-" + day;

    // 3. 检查逻辑
    var lastClosedDate = localStorage.getItem(storageKey);
    if (lastClosedDate !== today) {
        banner.style.display = "block";
    } else {
        banner.style.display = "none";
    }

    // 4. 点击关闭事件
    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            // A. 添加动画类
            banner.classList.add("closing");
            // B. 写入 LocalStorage
            try {
                localStorage.setItem(storageKey, today);
            } catch (e) {
                console.error("处理横幅状态失败。", e);
            }
            // C. 动画结束后隐藏
            setTimeout(function() {
                banner.style.display = "none";
            }, 500); 
        });
    }
});

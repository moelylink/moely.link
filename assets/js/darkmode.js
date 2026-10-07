/**
 * Dark / Light Mode Controller
 * Synchronizes theme state between document, localStorage, and navbar toggle buttons.
 */
(function () {
    'use strict';

    function getIsDarkMode() {
        return document.documentElement.classList.contains('dark-mode') || 
               document.body.classList.contains('dark-mode');
    }

    function syncThemeUI(isDark) {
        // Ensure both html and body stay in sync
        document.documentElement.classList.toggle('dark-mode', isDark);
        if (document.body) {
            document.body.classList.toggle('dark-mode', isDark);
        }

        const buttons = document.querySelectorAll('#navbar-theme-toggle, #drawer-theme-toggle');
        buttons.forEach(btn => {
            btn.setAttribute('aria-pressed', String(isDark));
            btn.setAttribute('title', isDark ? '切换浅色模式' : '切换深色模式');
        });
    }

    function toggleTheme() {
        const currentlyDark = getIsDarkMode();
        const nextIsDark = !currentlyDark;
        
        try {
            localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
        } catch (e) {
            console.warn('Unable to access localStorage for theme:', e);
        }

        syncThemeUI(nextIsDark);
        window.dispatchEvent(new CustomEvent('themechange', { detail: { isDark: nextIsDark } }));
    }

    function initTheme() {
        let isDark = false;
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                isDark = true;
            } else if (savedTheme === 'light') {
                isDark = false;
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                isDark = true;
            }
        } catch (e) {}

        syncThemeUI(isDark);

        const buttons = document.querySelectorAll('#navbar-theme-toggle, #drawer-theme-toggle');
        buttons.forEach(btn => {
            btn.removeEventListener('click', toggleTheme);
            btn.addEventListener('click', toggleTheme);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();

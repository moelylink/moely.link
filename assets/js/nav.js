/**
 * Modern Navigation & Authentication Hydration Script
 * Provides smooth drawer interaction, GPU accelerated toggling, and Supabase Auth integration.
 */
(function () {
    'use strict';

    // ==========================================
    // 1. Mobile Drawer & Interaction Controller
    // ==========================================
    function initDrawer() {
        const hamburger = document.getElementById('site-nav-hamburger');
        const drawer = document.getElementById('site-nav-drawer');
        const overlay = document.getElementById('site-nav-drawer-overlay');
        const closeBtn = document.getElementById('site-drawer-close');

        if (!hamburger || !drawer || !overlay) return;

        function openDrawer() {
            drawer.classList.add('active');
            overlay.classList.add('active');
            hamburger.classList.add('is-active');
            hamburger.setAttribute('aria-expanded', 'true');
            document.body.classList.add('nav-drawer-open');
        }

        function closeDrawer() {
            drawer.classList.remove('active');
            overlay.classList.remove('active');
            hamburger.classList.remove('is-active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-drawer-open');
        }

        hamburger.addEventListener('click', function (e) {
            e.preventDefault();
            if (drawer.classList.contains('active')) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                closeDrawer();
            });
        }

        overlay.addEventListener('click', closeDrawer);

        // Escape key to close drawer
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawer.classList.contains('active')) {
                closeDrawer();
            }
        });

        // Close drawer on desktop resize breakpoint
        window.addEventListener('resize', function () {
            if (window.innerWidth >= 992 && drawer.classList.contains('active')) {
                closeDrawer();
            }
        });

        // Mobile drawer accordion submenu toggles
        const accordionTriggers = drawer.querySelectorAll('.site-drawer-accordion-btn');
        accordionTriggers.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const parentItem = btn.closest('.site-drawer-item');
                if (!parentItem) return;
                const isOpen = parentItem.classList.contains('is-open');
                
                // Close other open siblings if desired or simply toggle current
                parentItem.classList.toggle('is-open', !isOpen);
                btn.setAttribute('aria-expanded', String(!isOpen));
            });
        });
    }

    // ==========================================
    // 2. Auth State Management & Hydration
    // ==========================================
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderGuestAuth() {
        const currentUrl = encodeURIComponent(window.location.href);
        const loginUrl = 'https://user.moely.link/login/?redirect=' + currentUrl;

        // Top Navbar Auth (Desktop & Mobile)
        const navAuthSlot = document.getElementById('site-nav-auth');
        if (navAuthSlot) {
            navAuthSlot.innerHTML = `
                <div class="site-nav-auth-guest">
                    <a href="${loginUrl}" class="site-nav-btn site-nav-btn-login" title="登录或注册账号">
                        <i class="fa fa-user"></i>
                        <span>登录 / 注册</span>
                    </a>
                </div>
            `;
        }
    }

    function renderLoggedInAuth(session) {
        const user = session.user;
        const meta = user.user_metadata || {};
        const avatarUrl = meta.avatar_url;
        const emailText = escapeHtml(user.email || '');

        const avatarHtml = avatarUrl
            ? `<img src="${escapeHtml(avatarUrl)}" alt="用户中心" class="nav-user-avatar-img" />`
            : `<i class="fa fa-circle-user nav-user-avatar-placeholder"></i>`;

        // Top Navbar Auth (Desktop & Mobile)
        const navAuthSlot = document.getElementById('site-nav-auth');
        if (navAuthSlot) {
            navAuthSlot.innerHTML = `
                <div class="site-nav-user-dropdown-container">
                    <button type="button" class="site-nav-user-pill" id="site-nav-user-btn" aria-haspopup="true" aria-expanded="false">
                        <span class="nav-user-avatar-wrap">${avatarHtml}</span>
                        <span class="nav-user-name">用户中心</span>
                        <i class="fa fa-angle-down nav-user-arrow"></i>
                    </button>
                    <div class="site-nav-user-menu" id="site-nav-user-menu">
                        <div class="site-nav-user-header">
                            <span class="site-nav-user-email">${emailText}</span>
                        </div>
                        <div class="site-nav-user-divider"></div>
                        <a href="https://user.moely.link/" target="_blank" class="site-nav-user-item">
                            <i class="fa fa-gear"></i> 账号设置
                        </a>
                        <a href="https://user.moely.link/star/" target="_blank" class="site-nav-user-item">
                            <i class="fa fa-heart"></i> 美图收藏
                        </a>
                        <a href="https://user.moely.link/anime/" target="_blank" class="site-nav-user-item">
                            <i class="fas fa-circle-play"></i> 番剧收藏
                        </a>
                        <div class="site-nav-user-divider"></div>
                        <button type="button" class="site-nav-user-item site-nav-user-logout" id="nav-btn-logout">
                            <i class="fa fa-arrow-right-from-bracket"></i> 退出登录
                        </button>
                    </div>
                </div>
            `;

            // Attach logout listener
            const logoutBtn = document.getElementById('nav-btn-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        }
    }

    async function handleLogout(e) {
        if (e) e.preventDefault();
        if (window.client && window.client.auth) {
            try {
                await window.client.auth.signOut();
            } catch (err) {
                console.error('SignOut error:', err);
            }
        }
        // 清理顶级域 cookie 缓存
        if (window.rootDomainStorage && window.rootDomainStorage.removeItem) {
            // 清理可能遗留的 supabase token cookie
            for (let i = 0; i < document.cookie.split(';').length; i++) {
                const cookie = document.cookie.split(';')[i];
                const eqPos = cookie.indexOf('=');
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                if (name.includes('sb-') || name.includes('auth')) {
                    window.rootDomainStorage.removeItem(name);
                }
            }
        }
        window.location.reload();
    }

    function initNavAuth() {
        // Initial fallback
        renderGuestAuth();

        if (typeof window.client !== 'undefined' && window.client.auth) {
            window.client.auth.getSession().then(function (res) {
                if (res && res.data && res.data.session) {
                    renderLoggedInAuth(res.data.session);
                } else {
                    renderGuestAuth();
                }
            }).catch(function (err) {
                console.warn('Get session error in nav:', err);
                renderGuestAuth();
            });

            // Listen to auth changes
            window.client.auth.onAuthStateChange(function (event, session) {
                if (session) {
                    renderLoggedInAuth(session);
                } else {
                    renderGuestAuth();
                }
            });
        }
    }

    // ==========================================
    // 3. Document Ready Bootstrap
    // ==========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initDrawer();
            initNavAuth();
        });
    } else {
        initDrawer();
        initNavAuth();
    }
})();

(function(){"use strict";function t(){const t=document.getElementById("site-nav-hamburger"),e=document.getElementById("site-nav-drawer"),s=document.getElementById("site-nav-drawer-overlay"),o=document.getElementById("site-drawer-close");if(!t||!e||!s)return;function i(){e.classList.add("active"),s.classList.add("active"),t.classList.add("is-active"),t.setAttribute("aria-expanded","true"),document.body.classList.add("nav-drawer-open")}function n(){e.classList.remove("active"),s.classList.remove("active"),t.classList.remove("is-active"),t.setAttribute("aria-expanded","false"),document.body.classList.remove("nav-drawer-open")}t.addEventListener("click",function(t){t.preventDefault(),e.classList.contains("active")?n():i()}),o&&o.addEventListener("click",function(e){e.preventDefault(),n()}),s.addEventListener("click",n),document.addEventListener("keydown",function(t){t.key==="Escape"&&e.classList.contains("active")&&n()}),window.addEventListener("resize",function(){window.innerWidth>=992&&e.classList.contains("active")&&n()});const a=e.querySelectorAll(".site-drawer-accordion-btn");a.forEach(function(e){e.addEventListener("click",function(t){t.preventDefault();const n=e.closest(".site-drawer-item");if(!n)return;const s=n.classList.contains("is-open");n.classList.toggle("is-open",!s),e.setAttribute("aria-expanded",String(!s))})})}function n(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function e(){const t=encodeURIComponent(window.location.href),n="https://user.moely.link/login/?redirect="+t,e=document.getElementById("site-nav-auth");e&&(e.innerHTML=`
                <div class="site-nav-auth-guest">
                    <a href="${n}" class="site-nav-btn site-nav-btn-login" title="登录或注册账号">
                        <i class="fa fa-user"></i>
                        <span>登录 / 注册</span>
                    </a>
                </div>
            `)}function i(e){if(!e)return;const t=e.querySelector("#site-nav-user-btn"),c=e.querySelector("#site-nav-user-menu");if(!t||!c)return;let n=!1;function s(){e.classList.remove("is-open"),t.setAttribute("aria-expanded","false")}function o(){if(!e.isConnected){window.removeEventListener("scroll",o);return}const i=e.matches(":hover"),a=e.classList.contains("is-open"),t=e.contains(document.activeElement);(i||a||t)&&(n=!0,e.classList.add("is-closed-on-scroll"),s(),t&&document.activeElement&&typeof document.activeElement.blur=="function"&&document.activeElement.blur())}t.addEventListener("click",function(o){o.stopPropagation(),n=!1,e.classList.remove("is-closed-on-scroll");const i=e.classList.contains("is-open");i?s():(e.classList.add("is-open"),t.setAttribute("aria-expanded","true"))}),e.addEventListener("mouseenter",function(){n||t.setAttribute("aria-expanded","true")}),e.addEventListener("mouseleave",function(){n=!1,e.classList.remove("is-closed-on-scroll"),s()});function i(t){if(!e.isConnected){document.removeEventListener("mousemove",i);return}n&&!e.contains(t.target)&&(n=!1,e.classList.remove("is-closed-on-scroll"))}function a(t){if(!e.isConnected){document.removeEventListener("click",a);return}e.contains(t.target)||s()}function r(n){if(!e.isConnected){document.removeEventListener("keydown",r);return}n.key==="Escape"&&(e.classList.contains("is-open")||e.matches(":hover"))&&(s(),t.blur())}document.addEventListener("mousemove",i),document.addEventListener("click",a),document.addEventListener("keydown",r),window.addEventListener("scroll",o,{passive:!0})}function s(e){const t=e.user,r=t.user_metadata||{},s=r.avatar_url,c=n(t.email||""),l=s?`<img src="${n(s)}" alt="用户中心" class="nav-user-avatar-img" />`:`<i class="fa fa-circle-user nav-user-avatar-placeholder"></i>`,o=document.getElementById("site-nav-auth");if(o){o.innerHTML=`
                <div class="site-nav-user-dropdown-container" id="site-nav-user-dropdown-container">
                    <button type="button" class="site-nav-user-pill" id="site-nav-user-btn" aria-haspopup="true" aria-expanded="false">
                        <span class="nav-user-avatar-wrap">${l}</span>
                        <span class="nav-user-name">用户中心</span>
                        <i class="fa fa-angle-down nav-user-arrow"></i>
                    </button>
                    <div class="site-nav-user-menu" id="site-nav-user-menu">
                        <div class="site-nav-user-header">
                            <span class="site-nav-user-email">${c}</span>
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
            `;const e=document.getElementById("nav-btn-logout");e&&e.addEventListener("click",a);const t=document.getElementById("site-nav-user-dropdown-container");t&&i(t)}}async function a(e){if(e&&e.preventDefault(),window.client&&window.client.auth)try{await window.client.auth.signOut()}catch(e){console.error("SignOut error:",e)}if(window.rootDomainStorage&&window.rootDomainStorage.removeItem)for(let e=0;e<document.cookie.split(";").length;e++){const t=document.cookie.split(";")[e],s=t.indexOf("="),n=s>-1?t.substr(0,s).trim():t.trim();(n.includes("sb-")||n.includes("auth"))&&window.rootDomainStorage.removeItem(n)}window.location.reload()}function o(){e(),typeof window.client!="undefined"&&window.client.auth&&(window.client.auth.getSession().then(function(t){t&&t.data&&t.data.session?s(t.data.session):e()}).catch(function(t){console.warn("Get session error in nav:",t),e()}),window.client.auth.onAuthStateChange(function(t,n){n?s(n):e()}))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",function(){t(),o()}):(t(),o())})()
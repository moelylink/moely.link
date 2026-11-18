let masonryInstance=null,allData=[],isLoading=!1,loadedGroups=0;const MAX_GROUPS=10;function showEndTip(){const e=document.getElementById("random-end-tip");e&&(e.style.display="flex")}function shuffleArray(e){return e.map(e=>({sort:Math.random(),value:e})).sort((e,t)=>e.sort-t.sort).map(e=>e.value)}document.addEventListener("DOMContentLoaded",()=>{initMasonry(),loadAllDataAndFirstPage(),document.addEventListener("load",e=>{e.target&&e.target.tagName==="IMG"&&masonryInstance&&masonryInstance.layout()},!0),document.addEventListener("error",e=>{e.target&&e.target.tagName==="IMG"&&masonryInstance&&masonryInstance.layout()},!0),window.addEventListener("scroll",handleScroll)});function initMasonry(){const e=document.querySelector(".portfolio");if(!e)return;masonryInstance=new Masonry(e,{itemSelector:".portfolio-item",columnWidth:".portfolio-item",percentPosition:!0,gutter:0,transitionDuration:"0.4s"}),window.masonryInstance=masonryInstance}async function loadAllDataAndFirstPage(){try{const[e,t]=await Promise.all([fetch("/index.json"),fetch("/promos.json").catch(e=>(console.warn("Failed to load promos:",e),null))]);if(!e.ok)throw new Error(`HTTP ${e.status}`);const n=await e.json();if(allData=shuffleArray(n),t&&t.ok)try{window.sitePromos=await t.json()}catch(e){console.error("Failed to parse promos.json:",e)}loadNextBatch()}catch(e){console.error(e);const t=document.querySelector(".portfolio");t&&(t.textContent="加载数据出错："+e.message)}}function loadNextBatch(){if(isLoading||allData.length===0||loadedGroups>=MAX_GROUPS)return;isLoading=!0;const s=20,t=allData.splice(0,s);if(t.length===0){isLoading=!1;return}loadedGroups++;const o=document.querySelector(".portfolio"),i=e=>String(e).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[e]));let e=t.map(e=>{let t=e.user||"";t.startsWith("@")&&(t=t.substring(1));const s=i(e.title||e.id),n=document.createElement("div");return n.className="portfolio-item",n.innerHTML=`
            <div class="thumb">
                <a href="/img/${e.id}/">
                    <img class="img-item lazyload" data-src="${e.urls}" src="/assets/img/loading.gif" alt="${s}" onload="if(window.masonryInstance) window.masonryInstance.layout();" onerror="if(window.masonryInstance) window.masonryInstance.layout();">
                    ${e.total?`<span class="total-num">${e.total}</span>`:""}
                </a>
                <div class="widget-tags">
                    ${s}
                    <br/>By ${e.category} ${t}
                </div>
            </div>
        `,n});if(window.sitePromos&&window.sitePromos.length>0){const t=window.sitePromos[Math.floor(Math.random()*window.sitePromos.length)],n=document.createElement("div");n.className="portfolio-item promo-item",n.innerHTML=`
            <div class="thumb">
                <a href="/v/?url=${t.url}" target="_blank" rel="nofollow">
                    <img class="img-item" src="${t.img}" alt="${t.title}" style="width: 100%; display: block;">
                </a>
                <span class="promo-tag">AD</span>
                <div class="widget-tags">
                    ${t.title}
                    <br/>${t.description}
                </div>
            </div>
        `;const s=Math.floor(Math.random()*e.length);e.splice(s,0,n)}const n=document.createDocumentFragment();e.forEach(e=>n.appendChild(e)),o.appendChild(n),window.jQuery&&typeof window.jQuery.fn.lazyload=="function"&&window.jQuery(e).find("img.lazyload").lazyload({onLoaded:function(){masonryInstance&&masonryInstance.layout()}}),masonryInstance&&(masonryInstance.appended(e),masonryInstance.layout()),imagesLoaded(e,function(){masonryInstance&&masonryInstance.layout(),isLoading=!1,(loadedGroups>=MAX_GROUPS||allData.length===0)&&showEndTip()}).on("progress",function(){masonryInstance&&masonryInstance.layout()})}function handleScroll(){if(loadedGroups>=MAX_GROUPS){showEndTip();return}const e=document.documentElement.scrollHeight,t=window.scrollY||window.pageYOffset,n=window.innerHeight;t+n>=e-1e3&&loadNextBatch()}
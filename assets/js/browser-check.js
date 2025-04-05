(function(){
    try {
        if(sessionStorage.getItem('browserCheckDismissed')) return;
        const ua=navigator.userAgent;
        let b='',v=0;
        if(ua.indexOf('MSIE')!==-1||ua.indexOf('Trident/')!==-1){
            b='IE';
            v=11;
        }else if(ua.match(/Edg\/([0-9.]+)/)){
            b='Edge';
            v=parseInt(ua.match(/Edg\/([0-9.]+)/)[1]);
        }else if(ua.match(/Chrome\/([0-9.]+)/)){
            b='Chrome';
            v=parseInt(ua.match(/Chrome\/([0-9.]+)/)[1]);
        }else if(ua.match(/Firefox\/([0-9.]+)/)){
            b='Firefox';
            v=parseInt(ua.match(/Firefox\/([0-9.]+)/)[1]);
        }else if(ua.match(/Version\/([0-9.]+).*Safari/)){
            b='Safari';
            v=parseInt(ua.match(/Version\/([0-9.]+).*Safari/)[1]);
        }
        if(b==='IE'||(b==='Chrome'&&v<120)||(b==='Firefox'&&v<125)||(b==='Safari'&&v<17)||(b==='Edge'&&v<120)){
            const p=document.createElement('div');
            p.id='browser-check-popup';
            p.innerHTML='<div class="popup-content"><div class="popup-message"><i class="fas fa-exclamation-triangle"></i><span>检测到您的浏览器版本过低（'+b+' '+v+'），部分功能可能无法正常使用。建议升级浏览器以获得更好的浏览体验。<a href="https://www.moely.link/update/" style="color:#ff9800;text-decoration:underline;margin-left:5px">了解详情</a></span></div><div class="popup-buttons"><button class="popup-close">不再显示</button></div></div>';
            const s=document.createElement('style');
            s.textContent='#browser-check-popup{position:fixed;bottom:-100px;left:50%;transform:translateX(-50%);background:#fff;color:#333;z-index:2147483647;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,.2);width:90%;max-width:500px;transition:bottom .3s;border:1px solid #ddd}#browser-check-popup.show{bottom:20px}.popup-content{padding:15px}.popup-message{display:flex;align-items:flex-start;margin-bottom:15px}.popup-message i{color:#ff9800;margin:2px 10px 0 0;font-size:20px}.popup-message span{flex:1;line-height:1.5}.popup-buttons{display:flex;justify-content:flex-end}.popup-close{background:#ff9800;color:#fff;border:0;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:14px;transition:background .3s}.popup-close:hover{background:#f57c00}@media(max-width:480px){#browser-check-popup{width:95%}.popup-message{flex-direction:column;text-align:left}.popup-message i{margin-bottom:10px}.popup-message span{display:block}}';
            function init(){
                if(!document.getElementById('browser-check-popup')){
                    document.head.appendChild(s);
                    document.body.appendChild(p);
                    setTimeout(()=>p.classList.add('show'),1000);
                    p.querySelector('.popup-close').addEventListener('click',()=>{
                        p.classList.remove('show');
                        setTimeout(()=>p.remove(),300);
                        sessionStorage.setItem('browserCheckDismissed','true');
                    });
                    p.querySelector('a').addEventListener('click',()=>{
                        p.classList.remove('show');
                        setTimeout(()=>p.remove(),300);
                        sessionStorage.setItem('browserCheckDismissed','true');
                    });
                }
            }
            if(document.body) init();
            else document.addEventListener('DOMContentLoaded',init);
        }
    }catch(e){}
})(); 
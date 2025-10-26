document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    const bodyElement = document.body; 

    if (!toggleBtn || !bodyElement) return;

    function updateButtonIcon(isDarkMode) {
        if (isDarkMode) {
            toggleBtn.innerHTML = '<i class="fa fa-sun"></i> 切换浅色';
            localStorage.setItem('theme', 'dark');
        } else {
            toggleBtn.innerHTML = '<i class="fa fa-moon"></i> 切换深色';
            localStorage.setItem('theme', 'light');
        }
    }

    // 监听按钮点击事件
    toggleBtn.addEventListener('click', (event) => {
        // 如果事件被标记为 "dragged"，则阻止默认行为和传播
        if (toggleBtn.isDragged) {
            event.preventDefault(); 
            event.stopPropagation();
            // 重置标志，为下一次操作做准备
            toggleBtn.isDragged = false; 
            return;
        }
        // 正常的点击逻辑
        const isDarkMode = bodyElement.classList.toggle('dark-mode');
        updateButtonIcon(isDarkMode);
    });

    // 1. 加载保存的位置
    const savedPosition = localStorage.getItem('themeToggleButtonPosition');
    if (savedPosition) {
        // A. 如果有保存的位置，直接应用 left/top
        try {
            const pos = JSON.parse(savedPosition);
            toggleBtn.style.left = pos.left;
            toggleBtn.style.top = pos.top;
            toggleBtn.style.right = 'auto'; // 确保清除 right 
        } catch (e) {
            console.error("Error parsing saved position:", e);
            localStorage.removeItem('themeToggleButtonPosition');
        }
    } else {
        // B. 如果没有保存的位置 (第一次访问)，根据 CSS 初始值计算 left
        
        // 获取按钮的初始位置 (假设 CSS 中仍然保留 right: 20px; top: 80px;)
        // 1. 临时设置 position: fixed; right: 20px; top: 80px; 来获取位置
        toggleBtn.style.position = 'fixed'; // 确保定位正确
        toggleBtn.style.right = '20px';
        toggleBtn.style.top = '80px';
        
        // 2. 强制浏览器计算并获取其精确的 left 坐标
        const rect = toggleBtn.getBoundingClientRect();
        const initialLeft = rect.left;
        const initialTop = rect.top; // 再次获取 top 确保准确
        
        // 3. 将定位方式永久改为 left/top
        toggleBtn.style.right = 'auto'; 
        toggleBtn.style.left = initialLeft + 'px';
        toggleBtn.style.top = initialTop + 'px';

        // 4. 将这个初始位置保存到 localStorage，避免下次再计算
        const initialPosition = {
            left: toggleBtn.style.left,
            top: toggleBtn.style.top
        };
        localStorage.setItem('themeToggleButtonPosition', JSON.stringify(initialPosition));
    }

    let isDragging = false;
    let shiftX, shiftY; 
    let startX, startY; // <-- 新增：记录拖动/点击的起始坐标
    const DRAG_THRESHOLD = 5; // 拖动的最小距离阈值 (像素)

    // 统一处理 mousedown 和 touchstart
    function startDrag(event) {
        // 阻止默认行为，特别是在移动端长按时
        // 注意：这里不能阻止所有默认行为，否则会影响正常的点击事件触发
        // if (event.type === 'touchstart') {
        //     event.preventDefault(); 
        // }

        isDragging = true;
        toggleBtn.style.position = 'fixed';
        toggleBtn.style.right = 'auto';

        const clientX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
        const clientY = event.clientY || (event.touches ? event.touches[0].clientY : 0);

        // 记录起始坐标
        startX = clientX;
        startY = clientY;
        
        const rect = toggleBtn.getBoundingClientRect();
        shiftX = clientX - rect.left;
        shiftY = clientY - rect.top;
        
        toggleBtn.style.zIndex = 1000;

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: false }); 
        document.addEventListener('touchend', onEnd);
        
        // 在拖动开始时，确保 isDragged 是 false
        toggleBtn.isDragged = false;
    }

    // 统一处理 mousemove 和 touchmove
    function onMove(event) {
        if (!isDragging) return;

        // 阻止默认滚动行为（仅对触摸事件有效）
        if (event.cancelable) {
            event.preventDefault();
        }
        
        const clientX = event.clientX || event.touches[0].clientX;
        const clientY = event.clientY || event.touches[0].clientY;

        let newLeft = clientX - shiftX;
        let newTop = clientY - shiftY;
        
        // 限制拖动范围在视口内
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - toggleBtn.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - toggleBtn.offsetHeight));

        // 应用新位置
        toggleBtn.style.left = newLeft + 'px';
        toggleBtn.style.top = newTop + 'px';
        
        // 如果移动距离超过阈值，标记为拖动
        const deltaX = Math.abs(clientX - startX);
        const deltaY = Math.abs(clientY - startY);
        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
            toggleBtn.isDragged = true;
        }
    }

    // 统一处理 mouseup 和 touchend
    function onEnd(event) {
        if (!isDragging) return;
        isDragging = false;
        
        // 移除监听器
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        
        toggleBtn.style.zIndex = 999;
        
        // 如果 isDragged 为 true，则 click 事件会被阻止（在 click 监听器中处理）
        // 如果 isDragged 为 false，则 click 事件会被正常触发

        // 2. 保存位置到 localStorage
        if (toggleBtn.isDragged) {
             const finalPosition = {
                left: toggleBtn.style.left,
                top: toggleBtn.style.top
            };
            localStorage.setItem('themeToggleButtonPosition', JSON.stringify(finalPosition));
        } else {
             // 如果是点击，但没有移动，我们只需要确保 click 事件能正常通过。
             // 这里的 else 分支可以不做任何操作，因为 isDragged 默认为 false
             // 并在 onMove 中才会变为 true。
        }
    }
    
    // --- 监听拖动事件 ---
    toggleBtn.addEventListener('mousedown', startDrag);
    toggleBtn.addEventListener('touchstart', startDrag);
});

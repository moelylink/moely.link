importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');

if (workbox) {
  console.log('Workbox 加载成功 🎉');

  // **说明**: 对于纯静态网站且资源路径不经常变化的情况，
  // 移除 skipWaiting() 和 clientsClaim() 可以避免在 Service Worker 更新时，
  // 正在使用旧版本页面的用户加载到新版本资源导致的不一致问题。
  // 新的 Service Worker 将在所有旧的客户端关闭后自动激活。
  // workbox.core.skipWaiting(); // 移除此行
  // workbox.core.clientsClaim(); // 移除此行

  const cacheVersion = '-v250504'; // 请在 Service Worker 逻辑或缓存策略重大变化时更新此版本号
  const maxEntries = 500;
  const maxAgeDays = 30;
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;

  // Helper plugin for caching successful and opaque responses
  const cacheableResponsePlugin = new workbox.cacheableResponse.CacheableResponsePlugin({
    statuses: [0, 200],
  });

  // Helper plugin for expiration
  const expirationPlugin = new workbox.expiration.ExpirationPlugin({
    maxEntries,
    maxAgeSeconds,
  });

  // HTML 文件 (StaleWhileRevalidate 是一个平衡离线访问和更新的好策略)
  workbox.routing.registerRoute(
    /\.html$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'html-cache' + cacheVersion,
      matchOptions: { ignoreSearch: true },
      plugins: [
        expirationPlugin,
        cacheableResponsePlugin,
      ],
    })
  );

  // 字体文件（**优化说明**: 改为优先缓存 CacheFirst，以提高字体加载速度）
  workbox.routing.registerRoute(
    /\.(?:woff2?|ttf|otf|eot)$/,
    new workbox.strategies.CacheFirst({ // 策略修改为 CacheFirst
      cacheName: 'fonts-cache' + cacheVersion,
      plugins: [
        expirationPlugin,
        cacheableResponsePlugin,
      ],
    })
  );

  // 公共 CDN 库 (CacheFirst 适合不经常变化的第三方库)
  workbox.routing.registerRoute(
    /^https:\/\/(?:cdn\.bootcdn\.net|unpkg\.com|cdn\.jsdelivr\.net)/,
    new workbox.strategies.CacheFirst({
      cacheName: 'cdn-cache' + cacheVersion,
      fetchOptions: {
        mode: 'cors',
        credentials: 'omit',
      },
      plugins: [
        expirationPlugin,
        cacheableResponsePlugin,
      ],
    })
  );

  // hCaptcha (CacheFirst 适合稳定的第三方脚本)
  workbox.routing.registerRoute(
    /^https:\/\/js\.hcaptcha\.com/,
    new workbox.strategies.CacheFirst({
      cacheName: 'hcaptcha-cache' + cacheVersion,
      plugins: [
        expirationPlugin,
        cacheableResponsePlugin,
      ],
    })
  );

  // 站点图片（moely.link - CacheFirst 合理）
  workbox.routing.registerRoute(
    /^https:\/\/(?:t|i)\.moely\.link/,
    new workbox.strategies.CacheFirst({
      cacheName: 'image-cache' + cacheVersion,
      plugins: [
        expirationPlugin,
        cacheableResponsePlugin,
      ],
    })
  );

  // Bing 图片 (**优化说明**: 改为 SWR，在快速展示缓存图片的同时检查更新，获取最新每日图片)
  workbox.routing.registerRoute(
    /^https:\/\/bing\.img\.run/,
    new workbox.strategies.StaleWhileRevalidate({ // 策略修改为 StaleWhileRevalidate
      cacheName: 'bing-cache' + cacheVersion,
      plugins: [
        new workbox.expiration.ExpirationPlugin({ // Bing图片使用单独的过期配置
           maxEntries,
           maxAgeSeconds: 7 * 24 * 60 * 60, // 7 天
        }),
        cacheableResponsePlugin,
      ],
    })
  );

  // 静态图片资源 (StaleWhileRevalidate 合理，确保更新)
  workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-images' + cacheVersion,
      matchOptions: { ignoreSearch: true },
      plugins: [
        expirationPlugin,
        cacheableResponsePlugin,
      ],
    })
  );

  // CSS 和 JS 文件 (StaleWhileRevalidate 合理，确保更新)
  workbox.routing.registerRoute(
    /\.(?:css|js)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources' + cacheVersion,
      matchOptions: { ignoreSearch: true },
      plugins: [
        expirationPlugin,
        cacheableResponsePlugin,
      ],
    })
  );

  // 默认网络优先处理 (对其他未匹配的资源，优先网络)
  workbox.routing.setDefaultHandler(
    new workbox.strategies.NetworkFirst({
      cacheName: 'default-cache' + cacheVersion,
      networkTimeoutSeconds: 3, // 网络超时时间
      plugins: [
        new workbox.expiration.ExpirationPlugin({ // 默认缓存使用单独的过期配置
          maxEntries: 200, // 默认缓存条目少一些
          maxAgeSeconds: 7 * 24 * 60 * 60, // 默认缓存时间短一些
        }),
      ],
    })
  );

} else {
  console.error('Workbox 加载失败 😬');
}
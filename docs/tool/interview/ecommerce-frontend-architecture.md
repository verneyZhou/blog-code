---
title: ecommerce-frontend-architecture
date: 2026-08-10 17:24:10
permalink: /pages/ffde21/
categories:
  - tool
  - interview
tags:
  - 
---
# C端电商系统前端技术架构方案设计

> **文档定位**：从真实用户交互旅程出发，覆盖商品浏览 → 秒杀 → 下单 → 支付 → 支付后导航的完整链路，输出业务场景分析、重点难点拆解、解决方案设计、架构流程图与迭代计划。
>
> **适用范围**：C端电商 H5 / 小程序 / APP（Web 容器），以 H5 为主视角。

---

## 目录

- [一、业务场景全景分析](#一业务场景全景分析)
- [二、重点难点分析](#二重点难点分析)
- [三、首页加载策略与性能优化](#三首页加载策略与性能优化)
- [四、商品列表滚动加载](#四商品列表滚动加载)
- [五、弱网与断网容灾](#五弱网与断网容灾)
- [六、秒杀页面与倒计时](#六秒杀页面与倒计时)
- [七、秒杀按钮全场景处理](#七秒杀按钮全场景处理)
  - [7.3 资格令牌与公平性（常见误区）](#73-资格令牌与公平性常见误区)
- [八、下单链路设计](#八下单链路设计)
- [九、支付链路设计](#九支付链路设计)
- [十、支付成功后导航与防回退](#十支付成功后导航与防回退)
- [十一、订单状态展示与全生命周期](#十一订单状态展示与全生命周期)
- [十二、整体架构设计流程图](#十二整体架构设计流程图)
- [十三、迭代计划](#十三迭代计划)

---

## 一、业务场景全景分析

### 1.1 用户全链路旅程地图

```
用户旅程：从浏览到售后

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  商品首页  │───→│ 商品详情页 │───→│ 秒杀会场页 │───→│ 下单结算页 │───→│ 支付收银台 │
│          │    │          │    │          │    │          │    │          │
│ · 轮播图  │    │ · SKU选择 │    │ · 倒计时  │    │ · 地址选择│    │ · 渠道选择│
│ · 商品列表│    │ · 加入购物车│   │ · 立即抢购│    │ · 优惠券  │    │ · 支付验证│
│ · 推荐    │    │ · 立即购买 │    │ · 库存展示│    │ · 提交订单│    │ · 支付结果│
│ · 秒杀入口│    │ · 评价预览 │    │ · 售罄状态│    │ · 库存锁定│    │ · 状态收敛│
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └─────┬────┘
                                                                         │
                    ┌──────────┐    ┌──────────┐    ┌──────────┐        │
                    │   售后    │←───│ 订单详情  │←───│ 支付成功页│←───────┘
                    │          │    │          │    │          │
                    │ · 退款申请│    │ · 订单状态│    │ · 防回退 │
                    │ · 退货物流│    │ · 物流跟踪│    │ · 引导跳转│
                    │ · 进度展示│    │ · 再次购买│    │ · 订单入口│
                    └──────────┘    └──────────┘    └──────────┘
```

### 1.2 核心业务模块拆解

| 业务域 | 核心页面 | 关键技术挑战 | 优先级 |
|--------|---------|-------------|--------|
| 商品域 | 首页、列表页、详情页 | 首屏性能、无限滚动、图片优化、SEO | P0 |
| 营销域 | 秒杀会场、优惠券中心 | 倒计时精度、高并发防刷、库存一致性 | P0 |
| 交易域 | 购物车、结算页、订单管理 | 库存锁定、幂等、价格防篡改 | P0 |
| 支付域 | 收银台、支付结果页 | 防重复扣款、状态收敛、安全合规 | P0 |
| 售后域 | 售后申请、退款进度 | 退款金额计算、流程状态机 | P1 |
| 用户域 | 登录、个人中心 | Token管理、多端登录、登录拦截 | P0 |

### 1.3 用户核心交互路径与技术关注点

```
路径1（常规购物）：首页 → 列表 → 详情 → 购物车 → 结算 → 支付 → 结果页
  关注：首屏性能、列表流畅、结算价格准确、支付安全

路径2（秒杀直达）：首页秒杀入口 → 秒杀会场 → 点击抢购 → 结算 → 支付 → 结果页
  关注：倒计时精度、高并发防刷、按钮防重、库存一致性

路径3（支付后回退）：支付结果页 → 用户点返回 → ???
  关注：防回退到收银台/结算页、订单状态正确展示、优雅导航
```

---

## 二、重点难点分析

### 2.1 难点矩阵

| # | 难点 | 场景 | 影响 | 难度 |
|---|------|------|------|------|
| 1 | 首页多模块加载策略 | 轮播图+列表+推荐+秒杀同时渲染 | LCP/FCP退化，首屏白屏 | ★★★★ |
| 2 | 弱网/断网页面展示 | 移动端地铁/电梯等弱网场景 | 白屏、数据丢失、重复提交 | ★★★★ |
| 3 | 秒杀倒计时精度与性能 | 倒计时渲染导致全局重绘、时间不准 | 性能卡顿、业务漏洞 | ★★★★★ |
| 4 | 秒杀按钮高并发处理 | 瞬时万级QPS冲击 | 重复订单、后端雪崩 | ★★★★★ |
| 5 | 下单库存校验与锁定 | 库存超卖、锁定后不释放 | 超卖损失、用户流失 | ★★★★★ |
| 6 | 支付防重复扣款 | 网络超时、用户连点、多标签页 | 用户被多扣款、客诉 | ★★★★★ |
| 7 | 支付成功后防回退 | 用户疯狂点返回重新进入支付链路 | 重复加载、状态混乱、二次支付 | ★★★★ |
| 8 | 订单状态最终一致性 | 支付成功但前端超时、回调丢失 | 状态不一致、用户焦虑 | ★★★★★ |

### 2.2 技术约束

```
性能约束：
  · 首页 FCP < 1.0s（WiFi）/ < 1.8s（弱网 4G P75）
  · 首页 LCP < 2.0s（WiFi）/ < 3.0s（弱网 4G P75）
  · 首页 INP < 200ms（INP 于 2024-03 正式替代 FID 成为 Core Web Vitals，P75 口径）
  · 首屏 JS chunk < 150KB（gzip）（业务代码预算；框架 runtime 另算，
    React+Next.js runtime 约 65-85KB，需严格代码分割达成）
  · 首屏请求数 < 15

一致性约束：
  · 下单：幂等率 100%，绝不产生重复订单
  · 支付：绝不重复扣款，状态可收敛
  · 库存：不超卖，锁定库存 15-30 分钟自动释放

安全约束：
  · 交易链路全 HTTPS + 接口签名
  · 敏感信息前端脱敏展示
  · 防重放、防篡改、防爬虫
```

---

## 三、首页加载策略与性能优化

### 3.1 场景描述

用户第一次进入商品首页，首页包含多个模块：

- **轮播图**（Banner）—— 运营活动入口，图片较大
- **秒杀单品**（Seckill）—— 倒计时 + 商品卡片，实时性强
- **商品列表**（ProductList）—— 无限滚动，分页加载
- **商品推荐**（Recommend）—— 个性化推荐，依赖用户画像
- **分类导航**（Category）—— 快速入口

### 3.2 重点难点

1. **多模块并行渲染导致资源争抢**：每个模块都需求数据和图片，首屏同时发起大量请求
2. **LCP元素不明确**：轮播图？秒杀主图？推荐首图？谁是LCP元素影响优化策略
3. **弱网白屏**：接口串行依赖导致首屏数据迟迟不到
4. **二次进入体验**：第一次进入慢可以理解，第二次进入必须秒开

### 3.3 解决方案

#### 3.3.1 加载策略：分层分优先级

```
首页加载分层策略

第一层：静态骨架（SSG/SSR，0ms 可见）
  │  ── 页面框架、导航、布局骨架屏
  │  ── SSG 预渲染到 CDN，TTFB < 50ms
  │  ── 骨架屏与最终布局像素级一致，CLS ≈ 0
  │
第二层：P0 核心数据（首屏可见区域，并行请求）
  │  ── 轮播图数据（运营配置，可 SSG/ISR）
  │  ── 秒杀单品核心信息（活动时间、商品ID、价格）
  │  ── BFF 接口聚合：1 个请求拿首屏所有 P0 数据
  │
第三层：P1 可视区域数据（IntersectionObserver 触发）
  │  ── 商品列表第一屏数据
  │  ── 秒杀倒计时启动（服务端时间注入）
  │
第四层：P2 延后数据（requestIdleCallback / 空闲时加载）
  · 个性化推荐（需用户画像，延迟加载）
  · 分类导航数据
  · 埋点 SDK、客服 SDK
  · 注意：requestIdleCallback 在 iOS Safari 17.4 以下不支持，
    需降级为 requestAnimationFrame 或 setTimeout(fn, 0)
  │
第五层：预获取（Prefetch）
     ── 用户 hover/touch 商品时 prefetch 详情页资源
     ── 用户 hover 秒杀入口时 prefetch 秒杀会场资源
```

#### 3.3.2 BFF 接口聚合

```
// 弱网下 5 个串行接口 = 5 × RTT（可能 3-5s）
// BFF 聚合后 = 1 × RTT（可能 0.5-1s）

Client ──→ BFF (1 request) ──→ 并行调用后端微服务
                                ├── /api/banner
                                ├── /api/seckill/items
                                ├── /api/products?page=1
                                ├── /api/user/profile
                                └── /api/recommend
                              ←── 合并返回（partial success 支持）
```

**关键设计**：
- BFF 用 `Promise.allSettled` 而非 `Promise.all`，部分接口失败不影响整体
- 返回结构支持 `degraded` 标记：`{ banner: {...}, seckill: null, degraded: ['seckill'] }`
- 前端根据 `degraded` 标记隐藏对应模块，不显示报错

#### 3.3.3 LCP 元素优化

LCP（最大内容绘制）元素通常是首屏最大的图片或文本块。策略：

```
LCP 优化链路：

1. 确定LCP元素：首页通常是轮播图第一张或秒杀主视觉图
2. 资源加载优先级：
   <link rel="preload" as="image" href="banner-1.webp" fetchpriority="high" />
3. 图片格式：WebP/AVIF + CDN 实时裁剪
   <img src="banner.webp?w=750&format=webp" />
4. 域名预连接：
   <link rel="preconnect" href="https://cdn.example.com" />
   <link rel="dns-prefetch" href="https://api.example.com" />
5. 不对LCP图片做懒加载：首屏图必须立即可见
```

#### 3.3.4 二次进入秒开策略

**缓存策略分层**

| 资源类型 | SW 缓存策略 | 说明 |
|---------|------------|------|
| App Shell（HTML骨架 + 核心 CSS/JS） | Cache-First | 带 contenthash，内容不变就命中缓存 |
| 首屏 P0 接口数据 | Stale-While-Revalidate | 先返旧数据，后台静默拉新数据 |
| 商品图片 | Stale-While-Revalidate | 先出旧图，后台更新（防换图不及时） |
| 支付/结算/账户安全页 | **不缓存（直通网络）** | 涉及资金安全，绝不走 SW 缓存 |

```
结果：
  · 第一次进入：CDN 返回 SSG HTML（TTFB ≈ 10-50ms）+ 接口加载（~1-2s）
  · 第二次进入：SW 从 CacheStorage 读 HTML（≈1-5ms，不走网络）+ 缓存数据先展示（<300ms），后台静默更新
```

**方案一：手写 sw.js（理解原理）**

适用于想精细控制每条路由缓存策略的场景。

```javascript
// public/sw.js

const CACHE_VER   = 'v1';
const SHELL_CACHE = `shell-${CACHE_VER}`;  // App Shell（长效）
const DATA_CACHE  = `data-${CACHE_VER}`;   // 接口数据（短效）

// 预缓存的静态资源（构建时由 Vite 注入 contenthash 文件名）
const SHELL_ASSETS = [
  '/',
  '/assets/index.abc123.css',
  '/assets/index.abc123.js',
  '/assets/vendor.abc123.js',
];

// ── install：预缓存 App Shell ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// ── activate：删除旧版本缓存 ──────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── fetch：按路由分发缓存策略 ─────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源请求
  if (url.origin !== location.origin) return;

  // ① 交易/安全敏感路由：绝不缓存，直通网络
  const BYPASS_PATHS = ['/checkout', '/pay', '/account/security'];
  if (BYPASS_PATHS.some((p) => url.pathname.startsWith(p))) return;

  // ② 敏感接口：绝不缓存
  const BYPASS_APIS = ['/api/order', '/api/pay', '/api/user/sensitive'];
  if (BYPASS_APIS.some((p) => url.pathname.startsWith(p))) return;

  // ③ 普通 API（首页数据、商品列表）→ Stale-While-Revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
    return;
  }

  // ④ 带 contenthash 的静态资源 → Cache-First（内容不变永久缓存）
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // ⑤ 页面 HTML 导航请求 → Network-First + 骨架兜底
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }
});

// ── 缓存策略函数 ──────────────────────────────────────────────────────

/** Cache-First：先读缓存，未命中再走网络并写入缓存 */
async function cacheFirst(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

/** Stale-While-Revalidate：立刻返缓存，同时后台更新 */
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  // 后台静默更新（不阻塞返回）
  const fetchPromise = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  });

  return cached ?? fetchPromise;  // 有缓存立刻返，无缓存等网络
}

/** Network-First：优先网络，断网时返骨架 HTML */
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    const cache    = await caches.open(SHELL_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cache    = await caches.open(SHELL_CACHE);
    const fallback = await cache.match('/');
    return fallback ?? new Response('离线中，请检查网络连接', { status: 503 });
  }
}
```

**注册 SW（`main.tsx`）**

```typescript
// src/main.tsx
if ('serviceWorker' in navigator) {
  // load 后注册，不和首屏资源抢优先级
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.error('SW failed:', err));
  });
}
```

---

**方案二：Vite + React 项目用 vite-plugin-pwa（推荐生产使用）**

手写 sw.js 需要自己维护 SHELL_ASSETS 文件名（带 contenthash，每次构建都变），容易漏掉。`vite-plugin-pwa` 基于 Workbox，构建时自动注入产物清单，更可靠。

**安装**

```bash
npm install -D vite-plugin-pwa
```

**vite.config.ts**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate'：新版本 SW 自动激活，用户无感刷新
      // 'prompt'：提示用户"有新版本，是否更新"
      registerType: 'autoUpdate',

      // SW 预缓存的静态资源（构建时自动注入所有 Vite 产物）
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],

      // 指定 SW 文件（选 generateSW 或 injectManifest 两种模式）
      // generateSW：全自动，Workbox 直接生成 SW，适合大多数场景
      // injectManifest：半自动，可以自定义 SW 逻辑（电商场景推荐此模式）
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',          // 自定义 SW 入口文件

      manifest: {
        name: '电商 H5',
        short_name: 'Shop',
        theme_color: '#ffffff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },

      workbox: {
        // 以下路由的请求完全跳过 SW（直通网络）
        // 对应手写版的 BYPASS_PATHS
        navigateFallbackDenylist: [
          /^\/checkout/,
          /^\/pay/,
          /^\/account\/security/,
        ],
      },
    }),
  ],
});
```

**自定义 SW 文件（`src/sw.ts`，injectManifest 模式）**

```typescript
// src/sw.ts
// Workbox 在构建时会把产物清单注入到 self.__WB_MANIFEST

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute }           from 'workbox-routing';
import {
  CacheFirst,
  StaleWhileRevalidate,
  NetworkFirst,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// 1. 预缓存所有 Vite 构建产物（含 contenthash 文件名）
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();            // 清理旧版本产物缓存

// 2. 普通 API（首页数据、商品列表）→ Stale-While-Revalidate
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/') &&
    // 排除敏感接口
    !url.pathname.startsWith('/api/order') &&
    !url.pathname.startsWith('/api/pay') &&
    !url.pathname.startsWith('/api/user/sensitive'),
  new StaleWhileRevalidate({
    cacheName: 'api-data',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,          // 最多缓存 50 条接口
        maxAgeSeconds: 60 * 60,  // 接口数据最长缓存 1 小时
      }),
    ],
  })
);

// 3. 商品图片 → Stale-While-Revalidate + 容量限制
registerRoute(
  ({ url }) => url.hostname.includes('cdn.example.com'),
  new StaleWhileRevalidate({
    cacheName: 'product-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 图片缓存 7 天
      }),
    ],
  })
);

// 4. 页面导航 → Network-First + 骨架兜底
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'pages',
      networkTimeoutSeconds: 3,   // 3s 超时则返缓存
    }),
    {
      // 这些页面不走 SW：直通网络
      denylist: [/^\/checkout/, /^\/pay/, /^\/account\/security/],
    }
  )
);
```

**注册（vite-plugin-pwa 自动处理，main.tsx 无需手动注册）**

```typescript
// src/main.tsx
// vite-plugin-pwa 的 registerType: 'autoUpdate' 会自动注入注册逻辑
// 只需在 main.tsx 中引入虚拟模块即可

import { registerSW } from 'virtual:pwa-register';

// autoUpdate 模式：有新版本自动更新，不打扰用户
const updateSW = registerSW({
  onNeedRefresh() {
    // prompt 模式时：询问用户是否更新
    // if (confirm('有新版本，是否刷新？')) updateSW(true);
  },
  onOfflineReady() {
    console.log('已可离线使用');
  },
});
```

---

**两种方案对比**

| 维度 | 手写 sw.js | vite-plugin-pwa |
|------|-----------|----------------|
| 产物清单维护 | **手动**（每次构建后要更新文件名） | **自动**（构建时注入） |
| 缓存策略灵活度 | 完全自定义 | Workbox 策略覆盖 90% 场景 |
| 学习成本 | 低（理解 fetch 事件即可） | 中（需理解 Workbox API） |
| 推荐场景 | 学习原理、简单项目 | **React+Vite 生产项目** |
| 版本更新处理 | 自己实现 skipWaiting / claim | registerType 控制 |
| TypeScript 支持 | 需手动配置 | 原生支持（sw.ts） |

**电商项目建议**：用 `vite-plugin-pwa` + `injectManifest` 模式，精确控制哪些路由/接口绕过 SW，支付链路相关的资源绝对不缓存。

#### 3.3.5 性能指标控制策略

```
性能保障体系：

实验室指标（Lighthouse CI 门禁）：
  · FCP < 1.0s / LCP < 2.0s / CLS < 0.1 / INP < 200ms（INP 替代 FID，2024-03 生效）
  · 首屏 JS < 150KB（gzip）（业务代码）+ 框架 runtime ≈ 65-85KB（React+Next.js，需通过 code-splitting 控制不进一步膨胀）
  · 首屏请求数 < 15
  · CI 中 Lighthouse 分数低于阈值阻断合并

线上指标（RUM 真实用户监控）：
  · 按网络分桶：WiFi / 4G / 3G / 弱网
  · 按机型分桶：高端机 / 中端机 / 低端机
  · 关注 P75 和 P90，不只看平均值
  · 性能退化告警：P75 LCP 环比上升 20% 触发告警

优化手段清单：
  · SSR/SSG 降低 TTFB
  · 代码分割 + Tree Shaking 降低 JS 体积
  · 图片 WebP/AVIF + srcset 响应式
  · HTTP/2 多路复用
  · Brotli 压缩
  · 关键 CSS 内联
  · font-display: swap
```

### 3.4 首页加载架构图

```
                        首页加载时序

时间轴 ─────────────────────────────────────────────────────→

CDN层    │=== SSG HTML 命中 (< 50ms) ===│
                                          │
浏览器    │== 解析 HTML ==│== 骨架屏可见 (FCP) ==│
  |                                          │
  |     ┌── preconnect CDN/API ──┐           │
  |     │                        │           │
请求层 │  │== P0聚合接口 (BFF) ==│           │
  |     │                        │           │
  |     │  ┌── preload LCP图片 ──┤           │
  |     │  │                     │           │
  |     │  │    ┌── P0数据返回 ──┤           │
  |     │  │    │                │           │
渲染层 │  │    │  == 首屏内容渲染 (LCP) ==│
  |     │  │    │                │           │
  |     │  │    │   ┌── IO触发P1列表 ──┤
  |     │  │    │   │              │   │
  |     │  │    │   │  ┌── idle加载P2推荐 ┤
  |     │  │    │   │  │           │   │
  |     │  │    │   │  │  ┌── prefetch详情 ┤
  ▼     ▼  ▼    ▼   ▼  ▼  ▼           ▼   ▼

目标：FCP < 1.0s, LCP < 2.0s, 完全可交互 < 3.0s
```

---

## 四、商品列表滚动加载

### 4.1 重点难点

1. **大量 DOM 节点导致卡顿**：直接渲染1000+商品卡片，主线程阻塞
2. **滚动加载时的闪烁/跳动**：新数据插入导致布局抖动
3. **图片加载引起的 CLS**：图片没有预设尺寸导致布局偏移
4. **滚动位置恢复**：从详情页返回列表时，需要恢复滚动位置

### 4.2 解决方案

#### 4.2.1 分页加载策略

```
商品列表分页加载流程：

初始化：
  · 首屏加载 page=1，获取前 20 条（SSR 返回，利于 SEO）
  · 同时预取 page=2 缓存到内存

滚动触发加载：
  · IntersectionObserver 监听哨兵元素（列表底部占位 div）
  · 哨兵进入视口 → 触发加载下一页
  · 加载中显示底部骨架屏（3-5个占位卡片）
  · 加载完成后追加到列表

预取策略：
  · 当用户滚动到第 3/4 时，预取下一页
  · 最多预取 1 页（避免浪费流量）
  · 预取数据缓存在内存，用户继续滚动时直接使用

边界处理：
  · 到底显示"没有更多了"
  · 加载失败显示"加载失败，点击重试"
  · 总数未知时，不显示"第 X/Y 页"
```

#### 4.2.2 虚拟列表（可选，视场景而定）

```
何时使用虚拟列表？

商品数 < 50：普通列表 + 图片懒加载（IntersectionObserver）
商品数 50-200：普通列表 + 图片懒加载 + 组件 memo 优化
商品数 > 200：虚拟列表（只渲染可视区 + overscan 缓冲区）

虚拟列表关键设计：
  · 高度缓存池（HeightCache）：渲染后用 getBoundingClientRect 测量真实高度
  · 估算高度 + 真实高度修正：首次用估算值，渲染后更新
  · 动态 overscan：滚动速度越快 overscan 越大（预渲染更多节点）
  · 滚动恢复：记录 scrollTop，返回时恢复到精确位置

避坑：
  · 商品卡片高度不固定（标签/标题行数不同）→ 推动UI统一卡片高度
  · 或者使用"高度缓存 + 前缀和数组 + 二分查找"做精确定位
```

#### 4.2.3 图片加载与 CLS 防护

```html
<!-- 每个商品卡片图片必须有固定宽高比 -->
<!-- 推荐方案A：原生懒加载（简单，浏览器直接处理） -->
<div class="product-card">
  <div class="img-wrapper" style="aspect-ratio: 1/1;">
    <img
      src="product-123.webp?w=300&format=webp"
      alt="商品名称"
      width="300"
      height="300"
      loading="lazy"
      decoding="async"
      onload="this.classList.add('loaded')"
      onerror="this.classList.add('error')"
    />
  </div>
  <div class="product-info">...</div>
</div>

<!--
  注意：原生 loading="lazy" 与 data-src + JS 懒加载应择一使用。
  混用不会导致图片不加载（JS 动态修改 src 会触发新的资源请求），
  但会造成两套懒加载逻辑冗余——浏览器原生判定和 JS IO 判定各自独立工作，
  可能产生行为不一致（如浏览器认为未接近视口，但 JS IO 认为已接近）。
  简单场景用方案 A（原生）；需要 LQIP 占位 + 淡入动效时用方案 B（JS IO），去掉 loading="lazy"。
-->

<!-- 可选方案B：LQIP + JS 懒加载（需要淡入动效时使用，去掉 loading="lazy"） -->
<!--
<div class="img-wrapper" style="aspect-ratio: 1/1;">
  <img
    src="data:image/svg+xml,..."  // 极小 base64 模糊占位
    data-src="product-123.webp?w=300&format=webp"
    alt="商品名称"
    decoding="async"
    onload="this.classList.add('placeholder-loaded')"
  />
</div>
-->

<!-- 关键CSS -->
.img-wrapper {
  aspect-ratio: 1/1;        /* 固定宽高比，防 CLS */
  background: #f5f5f5;       /* 加载中背景色 */
  overflow: hidden;
}
.img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s;
}
.img-wrapper img.loaded {
  opacity: 1;               /* 加载完成淡入 */
}
```

#### 4.2.4 滚动位置恢复

```typescript
// 列表页：记录滚动位置
const saveScrollPosition = () => {
  sessionStorage.setItem('list_scroll', String(window.scrollY));
  sessionStorage.setItem('list_page', String(currentPage));
};

// 从详情页返回时：恢复滚动位置
const restoreScrollPosition = () => {
  const savedScroll = sessionStorage.getItem('list_scroll');
  const savedPage = sessionStorage.getItem('list_page');

  if (savedScroll && savedPage) {
    // 先恢复数据到之前的页数
    restoreData(Number(savedPage)).then(() => {
      // 数据渲染后恢复滚动位置
      // 普通列表：数据渲染完即可恢复
      requestAnimationFrame(() => {
        window.scrollTo(0, Number(savedScroll));
      });

      // 虚拟列表：需先通过 scrollToOffset(index) 跳转到对应数据偏移量，
      // 渲染该区域元素后，再精确恢复 scrollTop（否则目标位置元素未渲染，出现空白闪烁）
      if (isVirtualList) {
        const targetIndex = scrollTopToIndex(Number(savedScroll));
        virtualListRef.current?.scrollToOffset({ index: targetIndex, align: 'start' });
        requestAnimationFrame(() => {
          virtualListRef.current?.scrollTo(Number(savedScroll));
        });
      }
    });
  }
};
```

---

## 五、弱网与断网容灾

### 5.1 重点难点

1. **弱网白屏**：接口超时，页面没有内容展示
2. **断网操作**：用户在弱网下点击下单/支付，请求发不出去
3. **网络恢复后的状态同步**：断网期间的操作如何补发
4. **弱网下的用户焦虑**：没有明确反馈，用户会疯狂点击

### 5.2 解决方案

#### 5.2.1 弱网分级策略

```
网络状况分级与应对：

检测方式：
  · 主：navigator.connection?.effectiveType（注意：iOS Safari 不支持，需安全访问）
  · 辅：请求 RTT 采样估算（兜底方案，兼容所有平台）
  · navigator.connection 在 Android Chrome 支持较好，但 iOS Safari 返回 undefined，
    必须做兼容处理：const conn = navigator.connection; const etype = conn?.effectiveType ?? 'unknown';

┌──────────┬──────────┬────────────────────────────────┐
│ 网络等级  │ 判定条件  │ 应对策略                        │
├──────────┼──────────┼────────────────────────────────┤
│ 良好(4G+) │ RTT<50ms │ 正常加载，高清图片               │
│ 一般(4G)  │ RTT<200ms│ 正常加载，图片质量降低一档        │
│ 弱网(3G)  │ RTT<500ms│ · 首屏接口强制聚合              │
│          │          │ · 图片用最低清晰度               │
│          │          │ · 关闭动效/装饰性图片             │
│          │          │ · 骨架屏优先，数据延后            │
│ 断网      │ 请求失败 │ · 展示离线缓存数据               │
│          │          │ · 标记"离线浏览"，联网后刷新       │
│          │          │ · 关键操作进入"待发送"队列        │
└──────────┴──────────┴────────────────────────────────┘
```

#### 5.2.2 断网展示策略

```
断网场景的分层降级：

Level 1：Service Worker 兜底（离线可用）
  · App Shell（HTML骨架）→ 离线也能打开"壳"
  · 上次缓存的数据 → 展示"您正在离线浏览，数据可能不是最新"
  · 图片缓存 → 上次看过的图片仍可展示

Level 2：功能降级（离线不可用）
  · 下单/支付按钮 → 置灰，提示"网络不可用"
  · 搜索 → 提示"网络不可用，请稍后重试"
  · 评论/推荐 → 隐藏模块

Level 3：操作暂存（网络恢复后补发）
  · 加入购物车 → 写入 IndexedDB，联网后同步
  · 非关键操作 → 进入"待发送"队列
  · 交易类操作 → 不暂存（风险太高），明确提示失败

全局网络状态感知：
  · online/offline 事件监听
  · 恢复联网时：静默刷新当前页数据 + 同步暂存操作
  · 全局 Toast 提示："网络已恢复"
```

**离线操作队列实现（购物车暂存示例）**

```typescript
// src/lib/offline-queue.ts
// 断网时把「加入购物车」等非关键写操作写入 IndexedDB
// 联网恢复后自动补发

import { openDB } from 'idb';  // npm install idb（轻量 IndexedDB 封装）

interface PendingOp {
  id?: number;
  type: 'addToCart' | 'updateCartQty';
  payload: unknown;
  createdAt: number;
}

const db = openDB('offline-queue', 1, {
  upgrade(db) {
    db.createObjectStore('ops', { keyPath: 'id', autoIncrement: true });
  },
});

/** 断网时：把操作写入队列 */
export async function enqueue(op: Omit<PendingOp, 'id' | 'createdAt'>) {
  const store = await db;
  await store.add('ops', { ...op, createdAt: Date.now() });
}

/** 联网后：取出队列里所有操作并补发 */
export async function flushQueue() {
  const store = await db;
  const ops = await store.getAll('ops') as PendingOp[];

  for (const op of ops) {
    try {
      await sendOp(op);           // 补发请求
      await store.delete('ops', op.id!);  // 成功后删除
    } catch {
      // 失败保留，下次联网再重试
    }
  }
}

async function sendOp(op: PendingOp) {
  switch (op.type) {
    case 'addToCart':
      return fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(op.payload),
      });
    case 'updateCartQty':
      return fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(op.payload),
      });
  }
}

// 在 main.tsx 中监听网络恢复事件
// window.addEventListener('online', flushQueue);
```

**全局网络状态感知（React Hook）**

```typescript
// src/hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';
import { flushQueue } from '@/lib/offline-queue';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // 联网后：1. 刷新当前页数据  2. 补发离线队列
      window.dispatchEvent(new CustomEvent('app:online'));
      flushQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// 使用示例（App.tsx）
// const isOnline = useNetworkStatus();
// {!isOnline && <OfflineBanner />}  // 全局顶部离线提示条
```

#### 5.2.3 请求超时与重试策略

```typescript
// 弱网下的请求策略矩阵

const requestStrategy = {
  // P0 核心数据：快速超时 + 有限重试
  productCore: {
    timeout: 3000,        // 3秒超时
    retry: 2,             // 最多重试2次
    retryDelay: 'exponential', // 指数退避
    fallback: 'cache',    // 失败后用缓存
  },

  // P1 列表数据：容忍超时
  productList: {
    timeout: 5000,
    retry: 1,
    retryDelay: 'exponential',
    fallback: 'empty',    // 失败显示空状态
  },

  // P2 推荐/埋点：静默失败
  recommend: {
    timeout: 8000,
    retry: 0,
    fallback: 'silent',   // 静默隐藏
  },

  // 交易类：不自动重试
  createOrder: {
    timeout: 10000,
    retry: 0,             // 不自动重试！
    fallback: 'error',    // 展示错误 + 手动重试
  },

  // 支付类：绝不自动重试
  payment: {
    timeout: 15000,
    retry: 0,
    fallback: 'query',    // 超时后查订单状态
  },
};
```

---

## 六、秒杀页面与倒计时

### 6.1 场景描述

秒杀页面包含：
- 多场次倒计时（如 10:00场、12:00场、14:00场）
- 商品卡片列表（每个卡片有自己的状态：未开始/进行中/售罄）
- 实时库存展示
- 立即抢购按钮

### 6.2 重点难点

1. **倒计时渲染性能**：几十个倒计时同时 `setInterval` 每秒更新，触发全局重绘
2. **时间精度**：用户本地时间不准，甚至恶意篡改
3. **浏览器后台休眠**：切到后台后 `setInterval/setTimeout` 被节流甚至暂停
4. **零点请求风暴**：倒计时归零瞬间，所有用户同时发请求

### 6.3 解决方案

#### 6.3.1 倒计时时间同步

```
倒计时时间同步链路（三步）：

Step 1：获取服务端权威时间
  · 页面加载时 GET /api/server-time
  · 客户端在发送请求前记录本地时间戳 sendTime
    （Cristian 算法仅需客户端本地记录，无需发送给服务端）
  · 服务端返回 { serverTime: T_server }（服务端在响应时的当前时间）
  · 客户端记录收到响应时的本地时间 receiveTime
  · 单次请求估算（Cristian 算法）：
    RTT = receiveTime - sendTime
    校正后的服务端时间 ≈ T_server + RTT / 2
    （T_server 是服务端打时间戳那一刻的时间，加上半个 RTT 估算"此刻"服务端时间）
    （假设上下行延迟对称，各占 RTT/2）
  · 注意：单次估算假设上下行对称，移动弱网下可能不对称，
    精度有限。生产环境建议多次采样取最小 RTT 对应的样本（类 NTP）

Step 2：建立单调时钟锚点（核心，只在这一瞬间碰网络时间）
  收到响应那一刻，同时记录两个值作为"锚点"：
    · anchorServerTime = T_server + RTT / 2   ← 校正后的服务端时间
    · anchorPerfTime   = performance.now()    ← 同一瞬间采的单调时钟读数
  之后倒计时全程只依赖这两个锚点，不再碰 Date.now()：
    elapsed     = performance.now() - anchorPerfTime
    currentTime = anchorServerTime + elapsed   ← 推算"此刻"的服务端时间
    remaining   = endTime - currentTime
    （endTime 为业务接口下发的活动结束时间戳，与时间同步接口无关）

  为什么必须这样（而不是 clientNow + offset）：
    · performance.now() 单调递增，不受用户改系统时间 / NTP 跳变影响
    · 倒计时不会跳秒、倒流
    · 全程可以不出现 offset 这个中间变量

Step 3：tick + 定期重新校准
  · tick 频率（按场景）：
      - 普通倒计时（秒级显示）：250-500ms 一次（比 1s 密一点，
        防定时器漂移导致"卡 1 秒不动"，秒数没变就不触发渲染）
      - 原生 DOM 逃生舱：rAF 每帧驱动（~16ms），但仅在秒数变化时才写 DOM
      - 临界点（最后 3-5 秒）：提高到 100-200ms
  · 定期重校准（performance.now() 相对真实时间有晶振漂移，
    每天可漂移数百 ms，锚点不能只建一次）：
      - 每 30s 轻量校准一次（重新走 Step 1/2，重建锚点）
      - 最后 3-5 秒提高校准频率（如每 1s）
      - visibilitychange（从后台回来）立即重新校准
        （后台期间 setInterval 被节流，单调时钟虽不跳，但漂移已积累）
      - 若校准接口走 CDN 缓存，必须用响应 Age 头补偿（serverTime + Age），
        否则缓存的响应会导致时间戳失真 1-2s。
        更推荐使用 HTTP Date 响应头做轻量校准（零额外请求，无缓存精度问题）。

  关于 offset 的真实用途（避免误导）：
    · offset = 校准时的服务端时间 - 此刻 Date.now()
    · 它不是倒计时的必需变量（Step 2 锚点法不需要它）
    · 它的价值在于：a) 每次重校准时衡量"这段时间单调时钟漂了多少"，
      用于判断校准频率是否足够；b) 日志/埋点等其他代码需要把本地时间
      换算成服务端时间时的现成系数

防篡改核心原则：
  · 客户端倒计时只是"展示"，不是"判定"
  · 是否可下单永远以服务端校验为准（时间窗 + 资格令牌 + 库存）
```

#### 6.3.2 倒计时渲染性能优化

```
渲染优化三层方案（按性能从高到低）：

Level 1：React/Vue 组件隔离（常规场景）
  · 倒计时抽成独立组件，状态内部管理
  · 父组件不会因倒计时 tick 而 re-render
  · 使用 React.memo / Vue shallowRef 隔离

Level 2：CSS content: attr() / data-attr（中等场景）
  · 倒计时值存入 data-attr，CSS 伪元素通过 content: attr() 显示
  · JS 只更新 data-attr，不触发 re-render
  · 适合不需要复杂格式化逻辑的简单数字
  · 注意：CSS counter 是计数器机制（如有序列表自动编号），
    不能直接绑定 data-* 的任意值，纯 CSS 显示 data-* 用 content: attr(data-time)

Level 3：原生 DOM 逃生舱（极限场景）
  · 极端情况：会场有几百个秒杀商品的倒计时同时运行
  · 连局部 Diff 都嫌慢 → 绕过框架直接操作 DOM
  · 使用 requestAnimationFrame 驱动循环，但仅在秒数实际变化时才写 DOM
  · 倒计时每秒只需变化一次，每帧（~60fps）写 textContent 仍是浪费（GC 压力 + 样式重算）

function useCountdown(targetTime: number, ref: RefObject<HTMLElement>) {
  // 用 ref 存储最新的 targetTime，避免校准时重启 rAF 循环
  const targetRef = useRef(targetTime);
  targetRef.current = targetTime;

  useEffect(() => {
    let rafId: number;
    let lastDisplayed = ''; // 记录上次显示内容，避免重复写 DOM

    const tick = () => {
      const remaining = calcRemaining(targetRef.current);
      if (remaining <= 0) {
        ref.current!.textContent = '已结束';
        return;
      }
      // 格式化后仅在秒数变化时才写 DOM，其余帧不触发重排
      const formatted = formatTime(remaining);
      if (formatted !== lastDisplayed) {
        ref.current!.textContent = formatted;
        lastDisplayed = formatted;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [ref]); // calcRemaining/formatTime 为纯函数定义在组件外部，无需列入依赖
}

// 极端场景（几百个倒计时）的关键优化：共享 rAF 调度器
// 避免每个倒计时实例各创建一个 rAF 循环（N 个实例 = N 个循环）
// 所有倒计时注册到同一个 rAF 循环，无论多少个实例只有 1 个 rAF 在运行
const sharedRafScheduler = {
  callbacks: new Set<() => void>(),
  rafId: 0,
  register(fn: () => void) {
    this.callbacks.add(fn);
    if (this.callbacks.size === 1) {
      const loop = () => {
        // try-catch 隔离：单个回调异常不影响其他倒计时继续运行
        this.callbacks.forEach(cb => {
          try { cb(); } catch (e) { console.error('Countdown callback error:', e); }
        });
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }
    return () => this.unregister(fn);
  },
  unregister(fn: () => void) {
    this.callbacks.delete(fn);
    if (this.callbacks.size === 0) cancelAnimationFrame(this.rafId);
  },
};
```

#### 6.3.3 零点请求风暴防护

倒计时归零瞬间会同时涌出两类请求，必须分开处理，**不能都加随机抖动**：

```
① 读请求（可以 jitter）
   刷新活动状态、拉按钮是否可点、校准时间、查库存展示
   → 加 0～1.5s 随机延迟，把「一百万个前端同时问一遍」打散
   → 这不决定谁买到；UI 明示「正在加载开抢状态」

② 写请求（禁止 jitter）
   提交抢购、锁库存、创建订单
   → 用户一点就发，前端不得偷偷 sleep、不得随机延迟激活按钮
   → 谁赢由服务端接收时间 / 排队号决定
```

硬约束：jitter 只用于「失败后的重试退避 / 轮询间隔 / 开抢状态的读请求」，**不用于首发抢购提交**。写请求加 jitter，会把「用户的竞争」变成「客户端 `Math.random()` 的竞争」，公平性不可解释。

```
削峰三层（修正后，职责拆开）：

开抢前
  · 服务端预发资格令牌（前端申请、服务端签发，详见 7.3）
  · 静态页 / 核心 JS 已在 CDN
  · 把「领令牌」和「抢库存」两波洪峰错开

开抢瞬间
  · 读：状态刷新 / 按钮可用性 → 可以 jitter
  · 写：用户点击 → 立刻发，携带 token，禁止 jitter

网关 + 核心链路
  · 无 token / 过期 / 绑定错误 → 直接拒（拦脚本）
  · 有 token → 入队，按队列或接收时间进入核心扣库存
  · 不在网关随机丢弃「已经扣成功」的单

失败之后
  · 429 / 超时重试 → 指数退避 + jitter（重试不是第一名竞争，打散没有公平性问题）
```

一句话：**令牌管「你是不是合法入场」，排队管「洪峰怎么消化」，抖动只管「别一起去问状态 / 别一起重试」，谁买到由服务端说了算。**

---

## 七、秒杀按钮全场景处理

### 7.1 重点难点

秒杀按钮是整个交易链路的"入口"，需要考虑的真实场景：

| 场景 | 问题 | 风险 |
|------|------|------|
| 用户疯狂连点 | 发出多个下单请求 | 重复订单、后端雪崩 |
| 弱网下请求超时 | 用户以为没点，再次点击 | 重复提交 |
| 用户未登录 | 点击后才发现需要登录 | 体验差、流失 |
| 库存不足 | 服务端返回售罄 | UI 状态正确展示 |
| 风控拦截 | 被判定为机器人 | 需要验证码/提示 |
| 限购已达 | 用户已抢过 | 友好提示 |
| 多标签页同时操作 | 跨标签页重复下单 | 幂等失效 |
| 活动未开始 | 按钮可点但服务端拒绝 | 误导用户 |

### 7.2 解决方案

#### 7.2.1 按钮状态机

```
秒杀按钮完整状态机：

                 ┌─────────┐
                 │ NOT_AUTH│ ← 未登录
                 └────┬────┘
                      │ 登录成功
                      ▼
                 ┌─────────┐
                 │ NOT_READY│ ← 活动未开始
                 └────┬────┘
                      │ 倒计时归零
                      ▼
                 ┌─────────┐
          ┌─────→│  READY  │ ← 可抢购
          │      └────┬────┘
          │           │ 用户点击
          │           ▼
          │      ┌──────────┐
          │      │SUBMITTING│ ← 请求中（按钮置灰）
          │      └────┬─────┘
          │           │
          │     ┌─────┼──────────┬──────────┐
          │     │     │          │          │
          │     ▼     ▼          ▼          ▼
          │  ┌─────┐┌──────┐┌──────┐┌─────────┐
          │  │SOLD ││FAILED││QUEUE ││CAPTCHA  │
          │  │_OUT ││      ││_WAIT││_NEEDED  │
          │  └──┬──┘└──┬───┘└──┬───┘└────┬────┘
          │     │      │       │         │ 验证通过
          │     │      │ 超时   │ 叫号     │
          │     │      │重试    │         │
          └─────┘      │       │         │
                       ▼       │         │
                  ┌─────────┐  │         │
                  │ SUCCESS │  │         │
                  │跳转结算页│  │         │
                  └─────────┘  │         │
                               ▼
                          ┌─────────┐
                          │ ERROR   │ ← 系统异常
                          │引导重试  │
                          └─────────┘
```

#### 7.2.2 防重复点击（核心方案）

```
防重三道防线：

第一道：UI 层 —— 按钮状态锁
  · 点击瞬间 → 按钮进入 isSubmitting = true
  · 按钮置灰 + Loading 动画 + "提交中..."文案
  · 直到接口返回（成功/失败/超时）才释放
  · 不是 debounce/throttle！是状态锁！

第二道：请求层 —— 幂等 Key
  · 点击"立即抢购"瞬间，前端生成 Idempotency-Key（UUID）
  · 同一次用户意图内的重试，复用同一个 Key
  · 后端以 (userId, activityId, key) 做幂等去重
  · 即使连点发了多个请求，后端只处理第一个

第三道：跨页面 —— BroadcastChannel
  · 多标签页同时打开秒杀页
  · 通过 BroadcastChannel 广播"正在下单"状态和幂等 Key
  · 其他标签页收到消息后禁用按钮
  · 防止跨标签页重复下单
  · 兼容性：BroadcastChannel 需 iOS 15.4+（2022.03），
    旧版降级为 localStorage + storage 事件 或 SharedWorker

关键原则：
  · 防抖(debounce)会吃掉用户在弱网下的合法重试 → 不用
  · 状态锁保证"一次意图只提交一次" → 用这个
  · 幂等Key保证"即使多次提交也只生效一次" → 后端兜底
```

#### 7.2.3 完整点击处理流程

```typescript
async function handleSeckillClick() {
  // 1. 前置校验
  if (!isLoggedIn()) {
    return redirectToLogin();  // 未登录 → 跳登录
  }

  if (buttonState !== 'READY') return;  // 状态守卫

  // 2. 幂等 Key 生成（一次意图一个 Key）
  const idempotencyKey = generateUUID();

  // 3. 按钮锁定
  buttonState = 'SUBMITTING';  // UI 置灰
  saveToStorage('seckill_attempt', { key: idempotencyKey, activityId });

  // 4. 跨标签页通知
  broadcastChannel.postMessage({
    type: 'SECKILL_SUBMITTING',
    activityId,
    idempotencyKey,
  });

  try {
    // 5. 提交抢购请求
    const result = await request('/api/seckill/submit', {
      method: 'POST',
      headers: { 'X-Idempotency-Key': idempotencyKey },
      body: { activityId, skuId, purchaseToken },
      timeout: 10000,
      retry: 0,  // 不自动重试
    });

    // 6. 处理结果
    switch (result.status) {
      case 'SUCCESS':
        buttonState = 'SUCCESS';
        // 秒杀返回抢购资格令牌，携带到结算页真正创建订单
        navigateToCheckout(result.seckillToken);
        break;

      case 'SOLD_OUT':
        buttonState = 'SOLD_OUT';
        showToast('手慢了，商品已售罄');
        break;

      case 'QUEUED':
        buttonState = 'QUEUE_WAIT';
        startQueuePolling(result.queueId);
        break;

      case 'NEED_CAPTCHA':
        buttonState = 'CAPTCHA_NEEDED';
        showCaptcha(result.captchaToken);
        break;

      case 'LIMIT_REACHED':
        buttonState = 'LIMIT_REACHED';
        showToast('您已抢购过该商品');
        break;

      default:
        buttonState = 'FAILED';
        showToast('抢购失败，请重试');
    }
  } catch (error) {
    // 7. 超时/网络错误 → 不判失败，查状态
    if (error.type === 'timeout' || error.type === 'network') {
      buttonState = 'UNKNOWN';
      showLoading('处理中，请稍候...');
      // 用幂等Key查询结果
      pollSeckillResult(idempotencyKey);
    } else {
      buttonState = 'FAILED';
      showToast('系统繁忙，请重试');
    }
  } finally {
    // UNKNOWN（轮询中）不清除 storage，保持跨标签页锁，轮询收敛后再清理
    if (buttonState !== 'UNKNOWN') {
      clearStorage('seckill_attempt');
    }
  }
}
```

#### 7.2.4 风控配合

```
前端风控配合：

1. 设备指纹采集（开抢前）
   · 采集设备环境信息（UA、屏幕、字体、Canvas指纹等）
   · 上报后端做风控评分
   · 低分用户：开抢时弹出滑块/点选验证码
   · 高分用户：直接放行

2. 行为检测
   · 检测自动化脚本特征：
     - 无鼠标轨迹（直接click事件，无mousemove）
     - 请求间隔过于均匀（机器人节奏）
     - 点击坐标固定（脚本固定坐标）
   · 异常行为 → 触发验证码

3. 频率限制
   · 前端按钮级：isSubmitting 状态锁
   · 请求级：同一用户 3 秒内最多 1 次抢购请求
   · IP级：后端网关限流
```

### 7.3 资格令牌与公平性（常见误区）

> 面试高频追问：令牌是前端发的吗？网关会把已经抢到的人取消吗？随机抖动是不是把「手速」交给随机数？
>
> 结论先给：**令牌由服务端签发，前端只申请、携带；它是入场券不是中奖券。抖动不能加在抢购提交上。** 公平性由服务端用同一把尺子裁决（接收时间 / 排队号 / 抽签），前端既不发令牌，也不用随机数替用户比赛。

#### 7.3.1 令牌不是前端发的

前端没有签发资格的权力。`purchaseToken` 解决的是：**没走正规页面的脚本，能不能直接打到下单接口**——不是在已经抢到之后再取消。

```
开抢前 1～2 分钟（用户已经在会场页上）
  前端 → GET/POST /seckill/token
  后端签发 purchaseToken
    绑定：userId + activityId + SKU
    短 TTL（如 5 分钟）
    一次性 / 限次

开抢后用户点击
  前端把 token 放进抢购请求（立刻发，不加 jitter）
  网关：没 token / token 过期 / 绑定不对 → 直接拦
  有合法 token → 放进核心下单链路
  核心链路按服务端接收时间 / 排队号扣库存
```

时间线：

```
T-2min     在会场的人陆续拿到 token（预热，流量分散）
T=0        开抢，用户点击
T+几毫秒   带 token 的请求到达网关 → 进核心链路抢库存
           没 token 的脚本请求 → 网关丢掉
```

可以把它想成演唱会检票：检票员查的是「你有没有票」，不是「你是不是已经坐到座位上了再把你赶出去」。票是场馆发的，不是观众自己印的。

#### 7.3.2 会不会把「已经凭手速赢了」的人拦掉？

在这条链路上**不会发生**「已经扣完库存却被网关取消」。原因有三：

1. **令牌在点击之前就拿到了**，不是抢到之后再发。正规用户点「立即抢购」时，请求里已经带着 token。
2. **网关拦的是「没资格进门的人」**，不是「已经扣完库存的人」。扣库存发生在网关后面的业务层；过了网关、已经原子扣减成功的，不会因为网关再被取消。
3. **没 token 进不了核心链路，谈不上「已经赢了」**。被拦的主要是：没打开会场页的脚本、过期 token、绑错 SKU/用户的伪造包。

对「人」基本不公平，对「脚本」故意不公平——这正是目的。正规用户只要在会场页等着，开抢前就会预申请到 token。

不公平感通常来自三种**误用**，必须避开：

| 误用 | 后果 | 正确做法 |
|------|------|----------|
| 开抢瞬间才去申请 token | 申请接口被打爆，手快的人也拿不到 token | **开抢前预发**，把申请洪峰和抢购洪峰错开 |
| token 名额做成「先到先得、发完即停」 | 变成「谁先刷到 token 谁赢」，和抢库存叠了两层不公平 | token 对**在场合法用户尽量发**，限的是伪造/脚本，不是库存 |
| 网关限流把「已持有 token 的请求」也随机丢 | 手快且合法的人被随机踢掉 | 网关对**无 token** 直接拒；**有 token** 进排队/令牌桶，按服务端规则排队，不要随机丢弃成功单 |

所以令牌的定位是：**入场券，不是中奖券。** 中不中奖看后面的库存原子扣减和排队号。

#### 7.3.3 随机抖动会不会把「手速」交给随机数？

**会。如果加在「提交抢购 / 锁库存 / 下单」上，就是把用户竞争变成客户端 `Math.random()` 的竞争，公平性不可解释。**

硬约束（与 6.3.3 一致）：

- jitter **只用于**失败后的重试退避、轮询间隔、开抢状态的**读请求**
- jitter **不用于**首发请求、抢购提交、锁库存、创建订单
- UI **不要偷偷延迟提交**；读侧打散时可以明示「正在加载开抢状态 / 排队中」

即便前端完全不 delay，「纯手速公平」在互联网秒杀里也成立不了：用户到机房的 RTT、手机性能、WebView、DNS/TLS 都有差，脚本还可以在 T=0 之前把请求准备好。所以公平不能承诺「谁手指快谁赢」，只能承诺：

1. **前端不额外掺随机数**，不偷偷延后合法用户的首次提交
2. **服务端用同一把尺子**：接收时间、排队号或抽签，规则对所有人一样、可解释
3. **脚本不能靠跳过页面直打接口**（这就是 token 的价值）

淘宝、12306 后来也不拼「谁先点到」，而是**排队 + 叫号**：点下去先进队，按服务端队列消化。手速只决定「几点进队」，不决定「前端随机让你晚发 300ms」。这才是可对用户讲清楚的公平。

#### 7.3.4 面试口径（30 秒）

> 资格令牌是服务端签发的入场券，前端只在开抢前申请、开抢时携带。网关拦的是没票的脚本，不会把已经扣成功的单再取消。随机抖动只打散读请求和失败重试，抢购提交不加 jitter，否则公平性变成客户端抽签。谁买到由服务端接收时间或排队号说了算。

---

## 八、下单链路设计

### 8.1 场景描述

用户从秒杀/商品详情进入下单结算页：
- 选择/确认收货地址
- 选择/确认优惠券
- 确认商品信息和数量
- 查看价格明细（商品价格、运费、优惠、实付）
- 提交订单

### 8.2 重点难点

1. **库存校验**：下单时库存够不够，库存锁定后超时怎么办
2. **幂等策略**：绝不产生重复订单
3. **价格防篡改**：用户不能篡改请求参数修改价格
4. **地址变更联动**：换地址后运费/区域库存重算
5. **订单超时关闭**：锁定库存后未支付，自动释放

### 8.3 解决方案

#### 8.3.1 下单状态机

```
下单状态机：

IDLE（初始）
  │
  │ 用户点击"提交订单"
  │ ── 生成 Idempotency-Key
  │ ── 采集风控因子
  │
  ▼
VALIDATING（校验中）
  │ ── 前端校验：地址、库存、优惠券
  │ ── 风控校验
  │
  ├── 校验失败 ──→ FAILED（提示原因）
  │
  │ 校验通过
  ▼
SUBMITTING（提交中）
  │ ── POST /api/order/create
  │    Header: X-Idempotency-Key
  │    Body: { items, addressId, couponId, seckillToken }
  │    （不传价格！价格由服务端计算。秒杀场景携带 seckillToken 核销抢购资格）
  │
  ├── 成功 ──→ SUCCESS
  │             │ ── 记录 orderId + 锁定倒计时
  │             │ ── 跳转收银台
  │             ▼
  │           跳转支付流程
  │
  ├── 库存不足 ──→ STOCK_OUT（提示并返回）
  │
  ├── 超时 ──→ UNKNOWN
  │             │ ── 不判失败
  │             │ ── 用 Idempotency-Key 查询结果
  │             ▼
  │           POLLING（查单收敛）
  │             │
  │             ├── 查到成功 ──→ SUCCESS
  │             └── 查到失败 ──→ FAILED
  │
  └── 失败 ──→ FAILED（提示重试）

关键原则：
  · 前端不传价格：items + couponId → 服务端计算最终价格
  · 超时 ≠ 失败：用幂等Key查单，绝不重复下单
  · 幂等Key持久化：提交前将 idempotencyKey 写入 sessionStorage，
    UNKNOWN 状态下页面刷新后读取并继续查单（与支付链路 payAttemptId 一致）
  · 竞态防护：状态机拒绝非法状态迁移（SUCCESS后不接受FAILED）
```

#### 8.3.2 库存锁定与超时释放

```
库存锁定全流程：

下单成功
  │
  ├── 后端：锁定库存（Redis 原子预扣）
  ├── 后端：创建订单，设置过期时间（如 30 分钟）
  └── 前端：启动支付倒计时（30:00）

支付倒计时进行中
  │
  ├── 前端：展示剩余时间
  ├── 前端：最后 5 分钟强提示"订单即将关闭"
  └── 后端：定时任务扫描即将过期的订单

倒计时归零 / 用户取消
  │
  ├── 后端：关闭订单，释放库存
  └── 前端：引导用户重新下单

前端倒计时设计：
  · 用下单接口返回的 expireTime（服务端绝对时间）
  · 复用秒杀倒计时方案（服务端校准锚点 + 单调时钟）
  · 页面不可见时 rAF 自然暂停（浏览器后台不触发 rAF 回调）
  · 页面恢复可见时（visibilitychange），通过 performance.now() 差值
    重算剩余时间并一次性更新显示（时间差不会丢失）
```

#### 8.3.3 价格计算与防篡改

```
价格计算安全设计：

原则：前端不计算最终价格，只做"预估展示"

用户操作（选地址/选优惠券）
  │
  ├── 前端：展示"预估价格"（乐观更新，给用户即时反馈）
  ├── 前端：同时发请求到后端计算"权威价格"
  │         POST /api/order/preview { items, addressId, couponId }
  │
  └── 后端返回权威价格
        ├── 前端用权威价格覆盖预估价格
        └── 如果有差异，平滑过渡（不突兀跳变）

提交订单时：
  · 只传 items + addressId + couponId
  · 不传 price、shippingFee、discountAmount
  · 服务端重新计算，防止篡改

优惠券防篡改：
  · 前端只传 couponId
  · 后端校验：券是否属于用户、是否在有效期、是否满足使用门槛
  · 前端不做券的"可用性"判定，只做展示
```

#### 8.3.4 地址变更联动

```
地址变更处理链路：

用户切换收货地址
  │
  ├── UI 状态：地址区域 Loading
  ├── 乐观更新：先展示新地址
  │
  ├── 并发请求（注意竞态！）：
  │   ├── 运费计算 POST /api/shipping/calc { addressId, items }
  │   ├── 区域库存校验 GET /api/stock/region { addressId, skuIds }
  │   └── 预计送达时间 GET /api/delivery/eta { addressId }
  │
  ├── 竞态防护：
  │   · 用 AbortController 取消上一次地址变更的未完成请求
  │   · 或用"请求版本号"忽略旧请求的响应
  │
  └── 结果处理：
      ├── 运费变化 → 更新价格明细
      ├── 区域无库存 → 提示"该地区暂时缺货"
      └── 全部完成 → 关闭 Loading
```

#### 8.3.5 竞态条件处理

```
下单场景的竞态问题与防护：

问题1：多次提交订单的并发返回
  · 场景：用户点了提交，网络慢，又点了一次
  · 防护：isSubmitting 状态锁 + 幂等Key（前面已讲）

问题2：地址变更触发的价格重算竞态
  · 场景：用户快速切换地址A→B→C，A的响应最后才回来
  · 防护：请求版本号 / AbortController

  // 在组件内用 useRef 维护版本号，避免多实例共享同一计数器
  const priceCalcVersion = useRef(0);

  async function recalcPrice(addressId) {
    const myVersion = ++priceCalcVersion.current;
    showPriceLoading();
    try {
      const result = await api.calcPrice(addressId);
      // 版本号不匹配，忽略过期响应
      if (myVersion !== priceCalcVersion.current) return;
      updatePriceUI(result);
    } catch (err) {
      // 请求失败：仅当仍是最新请求时才更新 UI，避免覆盖后续成功的响应
      if (myVersion === priceCalcVersion.current) {
        showPriceError(err);
      }
    } finally {
      if (myVersion === priceCalcVersion.current) hidePriceLoading();
    }
  }

问题3：优惠券变更与地址变更同时发生
  · 场景：用户同时改了地址和券，两个请求并发
  · 防护：合并为一次请求（参数都包含），或序列化执行
```

---

## 九、支付链路设计

### 9.1 场景描述

支付是涉及金钱交易的最核心环节，场景包括：
- 选择支付渠道（微信/支付宝/银行卡/余额）
- 调起三方支付/收银台
- 支付结果回调
- 支付状态查询与收敛

### 9.2 重点难点

| # | 难点 | 风险 |
|---|------|------|
| 1 | 网络超时无法确认支付结果 | 不确定是否扣款 |
| 2 | 用户疯狂点击支付 | 重复扣款 |
| 3 | 支付成功但后端回调丢失 | 订单状态不一致 |
| 4 | 三方支付渠道故障 | 用户无法支付 |
| 5 | 多标签页/多设备同时支付 | 重复扣款 |
| 6 | 支付页安全性 | 钓鱼、中间人攻击 |

### 9.3 解决方案

#### 9.3.1 支付流程状态机

```
支付流程完整状态机（FSM）：

IDLE（未发起）
  │ ── 用户点击"确认支付"
  │ ── 前端生成 payAttemptId（幂等键）
  │ ── 持久化 orderId → payAttemptId（防刷新丢失）
  │
  ▼
CREATING（创建支付单）
  │ ── POST /api/pay/create
  │    Header: X-Idempotency-Key: payAttemptId
  │    Body: { orderId, channel }
  │ ── 后端返回: { payId, payToken, expiresAt }
  │
  ├── 失败 ──→ FAILED（可重试，生成新 payAttemptId）
  │
  │ 成功
  ▼
QUEUEING（高峰排队，可选）
  │ ── POST /api/queue/join { orderId }
  │ ── 返回 queueId + position + eta
  │ ── SSE/WebSocket 订阅排队状态
  │ ── 展示"排队中... 前面还有 N 人"
  │
  ├── 叫号 ──→ AWAITING_CHANNEL
  ├── 超时 ──→ UNKNOWN
  └── 取消 ──→ CANCELLED
  │
  ▼
AWAITING_CHANNEL（拉起收银台/三方）
  │ ── 调起微信/支付宝/银行SDK
  │ ── 使用 payToken 拉起支付
  │
  ├── 通道打开成功 ──→ PROCESSING
  ├── 通道打开失败 ──→ FAILED
  └── 用户取消 ──→ CANCELLED
  │
  ▼
PROCESSING（支付处理中）
  │ ── 三方扣款处理中
  │ ── 前端轮询/SSE 查询订单状态
  │    GET /api/order/status/{orderId}
  │
  ├── 查询结果=SUCCESS ──→ SUCCESS（终态）
  ├── 查询结果=FAILED ──→ FAILED（终态）
  ├── 超时/断网 ──→ UNKNOWN
  │
  ▼
UNKNOWN（不确定态）
  │ ── 展示"支付处理中，请稍候"
  │ ── 提供"继续等待"和"返回订单页"选项
  │ ── 后台持续轮询查单
  │ ── 最终收敛到 SUCCESS 或 FAILED
  │
  ▼
SUCCESS / FAILED / CANCELLED（终态）

核心原则：防重复（幂等）→ 可恢复（回放）→ 能收敛（查单）
```

#### 9.3.2 支付防重与双凭证机制（先分清三种接入形态）

> 设计支付防重前，必须先明确自己的接入形态——"直连三方 / 自建聚合网关 / 第三方聚合服务商"三者的凭证和流程不同。混淆这三种形态，是支付架构最常见的理解误区。

**三种接入形态概览：**

```
形态A：直连三方（无中间层，最常见的生产形态）
  前端 ──→ 我们后端 ──→ 微信支付 API
                    └──→ 支付宝 API
  · 每个渠道独立对接，各自商户号、各自密钥
  · 前端只带幂等Key，一次调用直接拿三方参数唤起收银台
  · 没有 payToken 概念（不需要中间凭证）

形态B：自建聚合网关（自研中间层）
  前端 ──→ 我们后端 ──→ [自建收银台/网关] ──→ 微信支付 API
                                            └──→ 支付宝 API
                                            └──→ 银联/花呗/余额...
  · 前端只跟网关打交道，网关统一路由、对账、风控、渠道容灾
  · 前端带幂等Key + 网关签发的 payToken（两次调用）
  · payToken 是网关签发的中间凭证，不是三方的

形态C：第三方聚合服务商（买别人的网关）
  前端 ──→ 我们后端 ──→ [Ping++ / 收钱吧 / 云闪付聚合...]
                              └──→ 微信 / 支付宝 / 银联
  · 不自研网关，买现成的聚合能力
  · 本质上=别人替你实现了形态B，参数形态由服务商定义
```

**三形态异同对比：**

| 维度 | A 直连三方 | B 自建聚合网关 | C 第三方聚合服务商 |
|------|-----------|---------------|-------------------|
| 接入难度 | 低（各渠道各接一套） | 高（网关本身是套系统） | 低（接入服务商） |
| 渠道扩展 | 每加渠道业务各接一遍 | 只改网关，业务透明 | 服务商已聚合 |
| 统一对账/退款/风控 | 各渠道分散 | 网关集中 | 服务商提供 |
| 渠道容灾 | 业务层自己做 | 网关自动路由/降级 | 看服务商能力 |
| 前端凭证 | 只有幂等Key | 幂等Key + payToken | 幂等Key + 服务商token |
| 调用次数 | 一次 | 两次 | 通常一次 |
| 额外成本 | 无 | 网关开发+运维+高可用 | 每笔分成 |
| 适用规模 | 渠道少（1-2个） | 渠道多、要统一收银台 | 不想自研又想多渠道 |

**共同底线（三种形态都一样）：**
```
  · 商户私钥/API密钥永远在服务端，前端拿不到
  · 防重复扣款的核心永远是"我们自己的支付单 + 幂等"，不因形态改变
  · 前端都只是"拿参数唤起收银台"，不参与签名、不接触密钥
  · 支付结果一律以后端查单为准，前端 SDK 的 success 回调不作数
```

---

**形态A（直连三方）：一次调用，前端只有幂等Key**

```
前端只调一次：
  POST /pay/create
  Header: X-Idempotency-Key: payAttemptId（前端生成 UUID）
  Body: { orderId, channel }

后端一次性完成：
  1. 幂等校验 (orderId, attemptId) → 已处理直接返回已有结果
  2. 创建支付单（INIT）
  3. 直接调三方"下单"接口（携带商户密钥签名）
  4. 拿到三方参数（prepay_id+paySign / mweb_url / orderStr）
  5. 更新支付单为 AWAITING_CHANNEL
  6. 返回 { payId, 三方参数 }

前端拿到 → 直接用三方参数唤起收银台
  · 微信 JSAPI：wx.chooseWXPay({ timeStamp, nonceStr, package, paySign })
  · 支付宝 H5：ap.tradePay({ orderStr })

防重：前端只有幂等Key一个凭证，"双 token"不成立
  · 防重（幂等Key职责）：仍在，靠 (orderId, attemptId) 后端去重
  · 防篡改（原 payToken 职责）：转移给后端全权承担
      - 三方参数后端生成，前端参与不了、改不了
      - 三方回调必须验签，防伪造
      - 支付单状态机单向流转，防重复入账
```

**形态B（自建聚合网关）：两次调用，前端有幂等Key + payToken**

```
两次调用的原因：自建网关需要"建支付意图"和"向三方下单"之间留中间态，
用于排队削峰、渠道延迟选择、统一风控前置。

1. 点击支付 → 前端生成 payAttemptId（幂等Key）
2. POST /pay/create
   Header: X-Idempotency-Key: payAttemptId
   Body: { orderId, channel }
   → 网关校验幂等 → 创建支付单（INIT）→ 签发 payToken
   → 返回 { payId, payToken }
3. 前端拿 payToken 调 /pay/channel（或 /pay/params）
   → 网关验证 payToken + 携带订单信息调三方"下单"接口
   → 三方返回可唤起收银台的参数
   → 网关返回参数给前端
4. 前端用三方参数拉起收银台
5. 用户在三方完成支付（输密码等），扣款发生在三方系统内部
6. 三方异步回调网关（Webhook）→ 网关校验后更新支付单

payToken 是网关签发的中间凭证（一次性、短TTL、绑定用户+订单+渠道），
不是三方的参数。防参数篡改由接口签名（ts+nonce+sign）保障，不由 payToken 承担。

无排队/无延迟拉起需求时，网关形态也可合并为一次调用（网关顺手路由完返回参数），
payToken 只保留"建意图→换参数"分离语义，防重仍由 (orderId, attemptId) 承担。
```

**幂等Key与回调幂等（所有形态通用，两套机制不可混淆）：**

```
幂等Key（attemptId）：前端→后端提交去重
  · 前端生成 UUID，同一 attemptId 内重试复用同一Key
  · 后端 (userId, orderId, attemptId) 联合唯一
  · 只传我们后端接口，绝不传给三方（三方不认）

回调幂等：三方→后端回调去重
  · 三方 Webhook 回调中不包含前端的 payAttemptId
  · 基于三方交易流水号（微信 transaction_id / 支付宝 trade_no）去重
  · 同时校验：商户订单号(out_trade_no)查到支付单、金额一致性、签名有效性
  · 支付单已 SUCCESS 的不再重复处理
```

**防重复的三道关卡（所有形态通用）：**
```
  关卡1（前端）：isSubmitting 锁 + 按钮置灰
  关卡2（后端幂等）：(orderId, attemptId) 已处理 → 返回已有结果
  关卡3（后端事实）：支付单表记录状态，不重复调三方
```

#### 9.3.2.1 三方支付到底是什么（调研：微信/支付宝生产落地形态）

> 三方支付不是一个 npm 包，而是一套**远程 API 服务**（微信支付平台 / 支付宝开放平台）。npm 包只是官方 SDK 封装，且**分前后端两套**：

```
后端 SDK（服务端，持有商户私钥/API密钥）：
  · wechatpay-node-v3   —— 微信支付官方 Node SDK v3
  · alipay-sdk          —— 支付宝官方 Node SDK
  · 职责：统一下单、生成签名（paySign / orderStr）、验签、退款、对账

前端 SDK（浏览器/端内，只负责"唤起收银台"）：
  · weixin-js-sdk       —— 微信 JS-SDK，wx.chooseWXPay()
  · ap.tradePay / AlipayJSBridge —— 支付宝，拉起收银台
  · 职责：把后端给的三方参数提交给微信/支付宝客户端
  · 注意：前端 SDK 不参与签名、不接触密钥，只是"唤起"壳
```

**各端真实参数形态：**

| 场景 | 后端从三方拿到 | 前端拿到后做什么 |
|------|--------------|-----------------|
| 微信 JSAPI（微信内 H5/公众号） | `prepay_id` + 后端生成 `paySign` | `wx.chooseWXPay({ timeStamp, nonceStr, package: "prepay_id=xxx", signType, paySign })` |
| 微信 H5（外部浏览器） | `mweb_url` | `location.href = mweb_url` 跳转 |
| 支付宝 H5 / JSAPI | `orderStr`（后端 alipay-sdk 加签生成） | `ap.tradePay({ orderStr })` |
| 支付宝 APP | `orderStr` | 唤起支付宝 App 支付 |

**生产落地关键约束：**
  · 商户私钥/API密钥**只能存服务端**，绝不下发前端（微信/支付宝文档明确要求）
  · 支付宝同步返回（return_url）只是"通知"，是否支付成功必须依赖**异步通知 + 主动查询**双向确认
  · 回调必须验签（验证通知里的 sign），防止伪造回调
  · 直连形态（形态A）下后端返回的即为三方参数（prepay_id/mweb_url/orderStr），
    前端只有幂等Key，防重由 (orderId, attemptId) 承担；
    自建网关形态（形态B）下才存在 payToken 中间凭证（见 9.3.2）
    

#### 9.3.2.2 不同接入形态下前端如何拉起收银台（落地）

> 前端"拉起收银台"本质上只有三招：`wx.chooseWXPay`（微信内）、`location.href` 跳 `mweb_url`（微信外）、`ap.tradePay`（支付宝）。**形态A/B 都是拿这三方参数用这三招拉起，形态C 则只对接聚合服务商**（不接触微信/支付宝）。关键原则：**无论哪种形态，SDK 的 success 回调都不等于支付成功，一律以查单收敛（9.3.3）**。

**三种形态前端拉起方式总览：**

```
形态A 直连三方
  后端返回三方参数（prepay_id+paySign / mweb_url / orderStr）
  前端用 wx.chooseWXPay / location.href / ap.tradePay 直接拉起
  → 直接接触微信/支付宝

形态B 自建网关
  前端两次调用：先拿 payToken，再换三方参数
  换到三方参数后，拉起方式与形态A 完全一致（wx.chooseWXPay 等）
  → 间接接触微信/支付宝（参数由自己网关给）

形态C 聚合服务商
  后端返回服务商的 charge 对象 或 收银台 URL
  前端用服务商 SDK（如 pingpp-js）唤起，或 location.href 跳转
  → 完全不接触微信/支付宝，只对接服务商
```

**底层三招（形态A/B 共用）：**

微信 JSAPI（微信内）—— 必须先 `wx.config` 注入签名：
```js
import wx from 'weixin-js-sdk';  // npm install weixin-js-sdk

// 1. 先拿 JSSDK 签名（后端用 appId 换 ticket 生成，URL 必须当前页完整地址）
const cfg = await request('/api/wx/jssdk-config', { params: { url: location.href.split('#')[0] } });

// 2. 注入配置（含 chooseWXPay 权限）
await new Promise((res, rej) => {
  wx.config({ debug: false, appId: cfg.appId, timestamp: cfg.timestamp,
              nonceStr: cfg.nonceStr, signature: cfg.signature, jsApiList: ['chooseWXPay'] });
  wx.ready(res); wx.error(rej);
});

// 3. 调起支付（package 值带 prepay_id= 前缀；success 不代表扣款成功）
wx.chooseWXPay({
  timestamp: p.timeStamp, nonceStr: p.nonceStr,
  package: p.package, signType: p.signType, paySign: p.paySign,
  success: () => { /* 去查单，不是最终结果 */ },
  cancel: () => { /* 用户取消 */ },
  fail: (err) => { /* SDK 失败 */ },
});
```

微信 H5（外部浏览器）—— 整页跳转，走后查单：
```js
sessionStorage.setItem('pay_started_at', String(Date.now()));
window.location.href = mwebUrl;   // 跳转微信收银台，注意 referer 必须备案域名
// 跳回后：pageshow 事件 + 查单收敛
window.addEventListener('pageshow', () => {
  if (Date.now() - Number(sessionStorage.getItem('pay_started_at')) > 1000) pollOrderStatus();
});
```

支付宝（端内/端外）：
```js
// 端内：AlipayJSBridge（ap 由客户端注入，无需 npm 包）
window.AlipayJSBridge.call('tradePay', { orderStr }, (r) => {
  // r.resultCode: 9000=成功 6001=取消 4000=失败（仍以查单为准）
});
// 端外：后端拼好支付宝网关 URL，前端 location.href 跳转
```

**形态C 的两种真实服务商接入方式（调研 Ping++/收钱吧/云闪付）：**

方式1——JS-SDK 唤起（Ping++ 代表）：
```js
import Pingpp from 'pingpp-js';   // npm install pingpp-js

// 后端创建 charge 对象（服务商签发，已封装渠道/金额/凭证）
const charge = await request('/api/aggregate-pay/create', {
  method: 'POST', headers: { 'X-Idempotency-Key': uuid() }, body: { orderId },
});
Pingpp.createPayment(charge, (result) => {
  // result: success / fail / cancel，仍以查单为准
});
```

方式2——收银台 URL 跳转（收钱吧/云闪付代表）：
```js
// 后端调服务商预下单，返回收银台链接 h5_url / mweb_url
const { h5Url } = await request('/api/aggregate-pay/redirect', {
  method: 'POST', headers: { 'X-Idempotency-Key': uuid() },
  body: { orderId, terminalSn, clientSn: orderId },
});
sessionStorage.setItem('pay_started_at', String(Date.now()));
window.location.href = h5Url;   // 聚合收银台内让用户选微信/支付宝/云闪付
```

**架构建议：自研网关也应提供统一 SDK（对标 pingpp），业务层不判断渠道。**

关键认知：环境的判断（在微信内/支付宝内/外部浏览器）**绕不开**，但它应该封装在客户端 SDK 内部，而不是让页面业务代码去 switch。Ping++ 的 `createPayment(charge)` 就是在 SDK 内部完成渠道路由，业务方永远只调一个方法。自研网关完全可以照做：

```
理想形态（前端业务方视角，无论 A/B/C 都应如此）：
  const result = await paymentSDK.pay(orderId);   // 就一行，不分渠道
  // result.status: success / cancel / fail → 仍以查单收敛

SDK 内部（把环境判断收进来）：
  switch (session.channel) {
    case 'wx_jsapi':  return inWechat()  ? openWxJsapi(params)  : throw 环境不匹配;
    case 'wx_h5':     return redirect(mwebUrl);
    case 'alipay':    return inAlipayApp() ? openAlipayBridge(orderStr) : redirect(网关URL);
  }
```

注意：即使有统一 SDK，微信内的 `wx.config`（JSSDK 签名注入，绑定当前页面 URL）依然绕不开——这是微信客户端的硬性要求，连 Ping++ 也不例外，属于"环境初始化仪式"而非"业务判断"。

**前端集成清单（React H5）：**
  · npm 依赖：`weixin-js-sdk`（仅微信内场景需引入，建议路由级懒加载，非首屏）
  · 支付宝 JSAPI 走 AlipayJSBridge（端内注入），端外走 mweb_url/网关跳转
  · 自建网关建议沉淀统一 `paymentSDK.pay(orderId)`，把渠道路由收进 SDK
  · 支付结果一律以后端查单为准（9.3.3），前端 SDK 的 success 回调不当作最终结果

#### 9.3.3 支付超时的最终一致性

```
"支付成功但后端超时"的最终一致方案：

问题场景：
  · 三方扣款成功 → 后端回调接口超时/丢失
  · 前端拿不到成功响应 → 展示"处理中"
  · 用户焦虑，可能再次点击支付

后端保障：
  · 支付单表（事实源）：每笔支付都有 INIT → PROCESSING → SUCCESS/FAILED
  · 三方回调（Webhook）：三方主动通知后端支付结果
  · 主动查单（补偿）：定时扫描 PROCESSING 太久的单，主动查三方
  · 对账文件：每日与三方对账，保证不漏

前端保障：
  · 超时不判失败：一律展示"支付处理中"
  · 持续查单收敛：轮询 /api/order/status 直到终态
  · 防二次提交：同 attemptId 在飞 → 禁用按钮
  · 刷新恢复：从 sessionStorage 读取 payAttemptId，继续查单
  · 引导查单：提供"查看订单状态"入口

最终收敛链路：

  前端展示"处理中"
       │
       ├── 轮询 /api/order/status（阶梯式退避）
       │     · 前 30s：每 3s 轮询（收敛期，快速捕获结果）
       │     · 30s-2min：每 10s 轮询
       │     · 2min-5min：每 30s 轮询
       │     · 最多轮询约 25 次（10+9+6）
       │     │
       │     ├── PROCESSING → 继续等待（按上述间隔退避）
       │     ├── SUCCESS → 跳转成功页
       │     └── FAILED → 提示失败
       │
       ├── 超时阈值到达（如 5 分钟）
       │     └── 展示"如已扣款，系统将在X小时内自动对账"
       │
       └── 用户主动查单
             └── 调用 /api/order/status → 按结果展示
```

#### 9.3.4 支付渠道容灾

```
支付渠道选择与容灾：

正常流程：
  · 展示可用支付渠道（微信/支付宝/银行卡/余额）
  · 用户选择渠道 → 按渠道发起支付

容灾策略：
  · 渠道可用性检测：后端返回每个渠道的状态（正常/维护中/异常）
  · 渠道降级：某渠道不可用 → 置灰该选项 + 提示"暂不可用"
  · 自动推荐：推荐当前最优渠道（成功率最高/手续费最低）
  · 备选渠道：用户首选渠道失败 → 引导尝试其他渠道
```

#### 9.3.5 支付安全

```
支付页安全清单：

网络安全：
  · 全链路 HTTPS + HSTS
  · APP 端 SSL 证书固定（Certificate Pinning）——运行时防 MITM 的有效手段
    注意：Pinning 在证书轮换时可能导致 APP 无法联网，推荐使用动态 Pin
    （从服务端下发 Pin 列表，支持热更新）而非硬编码证书指纹。
    补充：Certificate Transparency (CT) 日志监控是事后审计手段（发现未授权证书签发），
    不能替代 Pinning 的运行时拦截能力，两者结合使用而非二选一。
  · 接口签名（ts + nonce + sign），防重放防篡改

页面安全：
  · CSP（Content-Security-Policy）限制脚本来源
  · X-Frame-Options: DENY（防点击劫持）
  · Referrer-Policy: no-referrer（支付页最严格，避免订单参数通过 Referer 泄漏）

数据安全：
  · 敏感信息脱敏：银行卡只显示后四位，姓名掩码
  · 支付金额、商户信息强展示（防替换金额）
  · 日志/埋点不记录完整卡号、CVV

APP 端额外安全：
  · 禁用截屏/录屏（Android: FLAG_SECURE；iOS: 截屏检测 + 水印覆盖）
  · 水印（用户ID + 时间）
  · Root/越狱/模拟器检测 → 风控拦截
  · 键盘安全（自定义安全键盘输入密码）
```

---

## 十、支付成功后导航与防回退

### 10.1 场景描述

这是一个容易被忽视但极其影响体验的场景：

> 用户支付成功 → 进入支付结果页 → 用户点击返回（可能多次）
> → 如果不做处理，会返回到收银台/结算页 → 重新加载支付链路
> → 甚至可能触发二次支付、状态混乱

### 10.2 重点难点

1. **路由回退污染**：浏览器 history 栈中残留了收银台/结算页的记录
2. **用户习惯性返回**：用户支付成功后焦虑/习惯性点多次返回
3. **页面状态恢复**：返回到旧页面时，页面的定时器/请求可能还在运行
4. **多入口导航**：从不同路径进入支付（购物车/商品详情/订单列表），返回目标不同

### 10.3 解决方案

#### 10.3.1 路由清理：支付链路用 replace 而非 push

```
支付链路路由管理：

错误做法（push）：
  首页 → 列表 → 详情 → 结算页 → 收银台 → 结果页
  history: [首页, 列表, 详情, 结算页, 收银台, 结果页]
  返回 → 收银台 → 结算页 → 详情 → 列表 → 首页
  问题：返回会经过收银台和结算页，可能触发重新加载

正确做法（关键跳转用 replace）：
  首页 → 列表 → 详情
  → 结算页（push）
  → 收银台（replace 结算页！结算页不需要保留）
  → 结果页（replace 收银台！收银台不需要保留）
  history: [首页, 列表, 详情, 结果页]
  返回 → 详情 → 列表 → 首页
  ✅ 不会经过收银台和结算页

路由跳转策略：
  · push：首页 → 列表 → 详情（正常浏览路径，需要保留）
  · replace：详情/购物车 → 结算页（可选）
  · replace：结算页 → 收银台（必须！结算页不应回退）
  · replace：收银台 → 结果页（必须！收银台不应回退）
```

#### 10.3.2 结果页导航守卫

```typescript
// 支付结果页的路由守卫

// 方案1：history API 拦截（单一 popstate + replace）
function setupPaymentResultGuard() {
  // 注入一个"缓冲历史条目"：用户按返回时会被拦截到当前页
  // 注意：pushState 不会触发 popstate，只有用户主动前进/后退才触发
  window.history.pushState({ isGuard: true }, '', window.location.href);

  const handler = () => {
    // 用户在结果页按了返回 → 拦截，引导到目标页（订单详情/首页）
    window.removeEventListener('popstate', handler); // 清理自身，避免重复触发
    const targetRoute = getTargetRoute(); // 根据来源决定返回目标
    // 用 replace 跳转，不留额外 history 记录
    navigateTo(targetRoute, { replace: true });
    showNavigateToast('正在为您跳转...');
  };
  window.addEventListener('popstate', handler);

  // 返回清理函数，供组件卸载时调用（防止重复注册导致内存泄漏）
  return () => {
    window.removeEventListener('popstate', handler);
  };
}

// 方案2（推荐）：页内引导 + 按钮优先
function PaymentResultPage() {
  return (
    <div>
      <div className="success-animation">支付成功</div>
      <div className="order-info">订单号: {orderId}</div>

      {/* 主要行动按钮（大、醒目） */}
      <button onClick={() => navigate('/orders/' + orderId, { replace: true })}>
        查看订单
      </button>
      <button onClick={() => navigate('/', { replace: true })}>
        返回首页
      </button>

      {/* 不提供"返回"按钮，引导用户用以上按钮 */}
    </div>
  );
}
```

#### 10.3.3 源路由感知导航

```typescript
// 根据支付来源决定"返回"的目标页

function getReturnTarget(): string {
  const source = sessionStorage.getItem('payment_source');

  switch (source) {
    case 'cart':
      // 从购物车来的 → 返回首页（购物车已清空）
      return '/';

    case 'product_detail':
      // 从商品详情来的 → 返回首页（详情页可能已过期）
      return '/';

    case 'order_list':
      // 从订单列表来的 → 返回订单列表
      return '/orders';

    case 'seckill':
      // 从秒杀来的 → 返回首页
      return '/';

    default:
      // 兜底 → 返回首页
      return '/';
  }
}

// 下单时记录来源
function navigateToPayment(source: string) {
  sessionStorage.setItem('payment_source', source);
  // 使用 replace 确保结算页不在 history 中
  navigate('/checkout', { replace: true });
}
```

#### 10.3.4 完整防回退流程

```
支付成功后的完整导航流程：

支付完成（PROCESSING → SUCCESS）
  │
  ├── 1. 停止所有轮询/定时器（防止内存泄漏）
  ├── 2. 清理支付相关 sessionStorage（payAttemptId 等）
  ├── 3. 路由 replace 到结果页（收银台不留在 history）
  │
  ▼
支付结果页
  │
  ├── 展示：支付成功动画 + 订单摘要 + 行动按钮
  ├── 不提供返回按钮
  ├── 提供"查看订单"（replace 跳转）和"返回首页"（replace 跳转）
  │
  ├── 用户点击"查看订单"
  │     └── navigate('/orders/' + orderId, { replace: true })
  │         history: [首页, ..., 结果页] → [首页, ..., 订单详情]
  │
  ├── 用户点击"返回首页"
  │     └── navigate('/', { replace: true })
  │
  └── 用户按物理返回键 / 浏览器返回
        └── popstate 监听 → replace 到目标路由
            → 不会回到收银台或结算页

结果：无论用户怎么操作，都不会回到支付链路中间页
```

---

## 十一、订单状态展示与全生命周期

### 11.1 订单状态流转

```
订单全生命周期状态流转：

待付款（PENDING_PAYMENT）
  │ ── 用户已下单，库存已锁定
  │ ── 展示：支付倒计时、去支付按钮
  │
  ├── 支付成功 ──→ 待发货（PAID）
  ├── 超时未付 ──→ 已关闭（CLOSED）── 释放库存
  └── 用户取消 ──→ 已取消（CANCELLED）── 释放库存
  │
  ▼
待发货（PAID）
  │ ── 展示：等待商家发货
  │
  ▼
待收货（SHIPPED）
  │ ── 展示：物流信息、确认收货按钮
  │
  ├── 确认收货 ──→ 已完成（COMPLETED）
  ├── 超时自动确认 ──→ 已完成（COMPLETED）
  │
  ▼
已完成（COMPLETED）
  │ ── 展示：评价入口、再次购买、申请售后
  │
  ├── 申请售后 ──→ 售后流程
  └── 正常结束
  │
  ▼
售后中（AFTER_SALE）
  │ ── 退款申请 → 审核 → 退款中 → 退款完成
  │ ── 展示：售后进度
  │
  ▼
售后完成（AFTER_SALE_DONE）
```

### 11.2 订单列表页设计

```
订单列表页关键技术点：

1. 数据缓存策略
   · staleTime = 0（每次进入都刷新，保证最新状态）
   · 但用 SWR 的 keepPreviousData：切换 Tab 时保留旧数据展示，新数据到了再覆盖
   · 避免每次切 Tab 都白屏

2. 多 Tab 状态筛选
   · 全部 / 待付款 / 待发货 / 待收货 / 已完成
   · Tab 切换时取消上一次请求（AbortController）
   · 每个 Tab 维护独立的分页状态

3. 订单状态实时更新
   · 待付款订单：展示支付倒计时
   · 支付完成后从其他页回来：静默刷新列表
   · 可选：WebSocket 推送订单状态变更

4. 空状态设计
   · 各 Tab 分别设计空状态
   · 待付款空状态："暂无待付款订单"
   · 待收货空状态 + 引导："去逛逛"按钮

5. 订单卡片信息
   · 商品缩略图 + 名称 + 规格 + 数量
   · 订单状态标签（醒目颜色区分）
   · 订单金额
   · 操作按钮（根据状态动态显示）
     - 待付款：去支付、取消订单
     - 待收货：确认收货、查看物流
     - 已完成：再次购买、评价、申请售后
```

### 11.3 订单详情页设计

```
订单详情页关键模块：

1. 状态进度条
   · 待付款 → 待发货 → 待收货 → 已完成
   · 当前状态高亮 + 动画过渡
   · 可视化展示订单进度

2. 倒计时（待付款状态）
   · 复用秒杀倒计时方案
   · 最后 5 分钟强提示
   · 归零后状态自动变更为"已关闭"

3. 物流跟踪（待收货/已完成状态）
   · 物流时间线（从发货到签收）
   · 复制快递单号
   · 跳转物流详情页

4. 价格明细
   · 商品金额、运费、优惠券、积分抵扣、实付金额
   · 每项清晰展示

5. 操作区域（按状态动态）
   · 联系客服（始终展示）
   · 再次购买（已完成）
   · 申请售后（已完成，在售后期内）
```

---

## 十二、整体架构设计流程图

### 12.1 用户全链路技术流程图

```
                         用户全链路技术流程

┌─────────────────────────────────────────────────────────────────────────┐
│                              商品浏览层                                   │
│                                                                         │
│  首页(SSG+CSR)         列表页(SSR+虚拟列表)       详情页(ISR+按需水合)    │
│  ┌──────────┐          ┌──────────┐              ┌──────────┐          │
│  │轮播图P0  │          │分页加载   │              │SKU选择岛  │          │
│  │秒杀入口P0│          │图片懒加载 │              │购买栏岛   │          │
│  │商品列表P1│          │滚动恢复   │              │评价懒加载 │          │
│  │推荐    P2│          │竞态防护   │              │推荐懒加载 │          │
│  └──────────┘          └──────────┘              └──────────┘          │
│       │                     │                        │                  │
│       │    BFF聚合           │   BFF聚合               │                 │
│       ▼                     ▼                        ▼                  │
├─────────────────────────────────────────────────────────────────────────┤
│                              交易核心层                                   │
│                                                                         │
│           秒杀会场(SSG+CSR分级)          下单结算(CSR受保护)              │
│           ┌────────────────┐            ┌────────────────┐              │
│           │倒计时(原生DOM)  │            │地址选择(联动)   │              │
│           │库存展示(WS推送)  │            │优惠券(防篡改)   │              │
│           │抢购按钮(状态机)  │──────────→ │价格预览(服务端) │              │
│           │资格令牌(服务端签发)│           │提交订单(幂等)   │              │
│           │防重(三道防线)   │            │库存锁定(倒计时) │              │
│           └────────────────┘            └───────┬────────┘              │
│                                                 │                        │
│                                          replace(不留history)            │
│                                                 │                        │
│                                                 ▼                        │
│                                        支付收银台(CSR安全域)             │
│                                        ┌────────────────┐              │
│                                        │渠道选择(容灾)   │              │
│                                        │幂等Key+凭证防重 │              │
│                                        │支付FSM         │              │
│                                        │排队削峰        │              │
│                                        │查单收敛        │              │
│                                        │超时不判失败    │              │
│                                        └───────┬────────┘              │
│                                                │                        │
│                                         replace(不留history)            │
│                                                │                        │
│                                                ▼                        │
│                                        支付结果页(导航守卫)             │
│                                        ┌────────────────┐              │
│                                        │成功动画        │              │
│                                        │订单摘要        │              │
│                                        │查看订单/首页   │              │
│                                        │防回退路由      │              │
│                                        └───────┬────────┘              │
│                                                │                        │
├────────────────────────────────────────────────┼────────────────────────┤
│                              售后服务层        │                        │
│                                                ▼                        │
│                           订单管理(SSR+SWR缓存)  售后(CSR)               │
│                           ┌────────────────┐  ┌──────────┐             │
│                           │订单列表(多Tab)  │  │退款申请   │             │
│                           │订单详情(进度条) │  │退货物流   │             │
│                           │物流跟踪        │  │进度展示   │             │
│                           │再次购买        │  │金额计算   │             │
│                           └────────────────┘  └──────────┘             │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                              横切关注点                                   │
│                                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │请求层    │  │状态管理  │  │缓存层    │  │安全层    │  │监控层    │      │
│  │拦截器链  │  │Zustand  │  │CDN      │  │签名/脱敏 │  │RUM      │      │
│  │请求队列  │  │SWR      │  │SW缓存   │  │CSP/HSTS │  │错误监控  │      │
│  │幂等管理  │  │XState   │  │SWR内存   │  │防重放   │  │性能埋点  │      │
│  │重试/熔断 │  │useState │  │IndexedDB│  │防爬虫   │  │业务漏斗  │      │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

> **渲染策略说明**：
> - 下单结算页用 **CSR（受保护）**：内容高度个性化（地址、优惠券、库存联动），不需 SEO，且涉及安全敏感操作不宜预渲染。
> - 收银台用 **CSR（安全域）**：支付信息敏感，避免缓存到 CDN / Service Worker，CSP 最严格，且独立子域隔离。

### 12.2 秒杀→下单→支付完整时序

```
秒杀→下单→支付 完整时序

用户        前端          BFF/API        后端微服务      三方支付
 │           │              │              │              │
 │  进入秒杀  │              │              │              │
 │──────────→│              │              │              │
 │           │  申请资格令牌   │              │              │
 │           │  （前端申请，   │              │              │
 │           │   服务端签发）  │              │              │
 │           │─────────────→│──────────────→│              │
 │           │  purchaseToken│              │              │
 │           │←─────────────│←─────────────│              │
 │           │              │              │              │
 │  点击抢购  │              │              │              │
 │──────────→│              │              │              │
 │           │  生成幂等Key   │              │              │
 │           │  按钮锁定      │              │              │
 │           │  广播跨页面    │              │              │
 │           │              │              │              │
 │           │  POST /seckill/submit        │              │
 │           │  Header: X-Idempotency-Key   │              │
 │           │─────────────→│──────────────→│              │
 │           │              │  原子预扣库存   │              │
 │           │              │  签发抢购资格   │              │
 │           │              │←─────────────│              │
 │           │  {seckillToken, status:SUCCESS}│             │
 │           │←─────────────│              │              │
 │           │              │              │              │
 │           │  replace到结算页（携带seckillToken）│           │
 │  确认下单  │              │              │              │
 │──────────→│              │              │              │
 │           │  生成下单Key   │              │              │
 │           │  POST /order/create          │              │
 │           │  (不传价格，携带seckillToken!)│              │
 │           │─────────────→│──────────────→│              │
 │           │              │  核销资格令牌   │              │
 │           │              │  创建订单      │              │
 │           │              │  锁定库存      │              │
 │           │              │  设过期时间    │              │
 │           │              │←─────────────│              │
 │           │  {orderId, expireTime}       │              │
 │           │←─────────────│              │              │
 │           │              │              │              │
 │           │  replace到收银台              │              │
 │  确认支付  │              │              │              │
 │──────────→│              │              │              │
 │           │  生成payAttemptId            │              │
 │           │  POST /pay/create            │              │
 │           │  Header: X-Idempotency-Key   │              │
 │           │─────────────→│──────────────→│              │
 │           │              │  创建支付单    │              │
 │           │              │←─────────────│              │
 │           │  {payId, payToken}           │              │
 │           │←─────────────│              │              │
 │           │              │              │              │
 │           │  拉起三方支付  │              │              │
 │           │──────────────────────────────────────────────→│
 │           │              │              │  扣款处理     │
 │  输入密码  │              │              │←─────────────│
 │──────────────────────────────────────────────────────→  │
 │           │              │              │  支付成功     │
 │           │              │              │←─────────────│
 │           │              │              │  回调更新     │
 │           │              │              │  订单状态     │
 │           │              │              │              │
 │           │  轮询订单状态  │              │              │
 │           │  GET /order/status          │              │
 │           │─────────────→│──────────────→│              │
 │           │              │              │  返回SUCCESS  │
 │           │              │←─────────────│              │
 │           │  {status:SUCCESS}           │              │
 │           │←─────────────│              │              │
 │           │              │              │              │
 │           │  replace到结果页              │              │
 │  查看订单  │              │              │              │
 │──────────→│              │              │              │
 │           │  replace到订单详情            │              │
 │           │              │              │              │
```

### 12.3 技术架构分层图

```
技术架构分层

┌─────────────────────────────────────────────────────────┐
│                      用户端                              │
│            H5(Next.js)  |  小程序(Taro)  |  APP(Webview) │
├─────────────────────────────────────────────────────────┤
│                      视图层                              │
│    页面组件  |  业务组件  |  基础UI组件  |  模板         │
├─────────────────────────────────────────────────────────┤
│                    状态管理层                            │
│  ┌──────────┐ ┌───────────┐ ┌──────────────────────┐   │
│  │ Zustand  │ │ SWR/Query │ │ XState(交易状态机)    │   │
│  │ 全局状态  │ │ 服务端状态 │ │ 下单FSM | 支付FSM    │   │
│  └──────────┘ └───────────┘ └──────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                    请求层(SDK)                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  拦截器链: auth | trace | idempotency | retry    │  │
│  │  调度器:  并发控制 | 优先级队列 | 熔断            │  │
│  │  响应链:  业务码路由 | token刷新 | 错误标准化     │  │
│  └──────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    缓存层                               │
│  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ CDN    │ │ Service  │ │ SWR      │ │ IndexedDB  │  │
│  │ 边缘缓存│ │ Worker   │ │ 内存缓存  │ │ 持久化缓存  │  │
│  └────────┘ └──────────┘ └──────────┘ └────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    安全层                               │
│  签名 | 脱敏 | CSP | 防重放 | 防爬虫 | 风控             │
├─────────────────────────────────────────────────────────┤
│                    监控层                               │
│  错误监控 | 性能RUM | 业务埋点 | 告警 | 录屏回放         │
├─────────────────────────────────────────────────────────┤
│                    BFF层(Node.js)                       │
│  接口聚合 | 数据裁剪 | SSR | 缓存代理 | 限流降级         │
├─────────────────────────────────────────────────────────┤
│                    后端微服务                            │
│  商品服务 | 交易服务 | 支付服务 | 用户服务 | 营销服务    │
└─────────────────────────────────────────────────────────┘
```

---

## 十三、迭代计划

### Phase 1：基础架构搭建（P0 核心）

```
目标：搭建项目骨架，跑通核心链路

工程基建：
  · Monorepo 初始化（pnpm + Turborepo）
  · 技术选型落地（Next.js + TypeScript + Tailwind）
  · 请求 SDK 核心能力（拦截器、超时、重试、错误处理）
  · 基础 UI 组件库（按钮、Loading、Toast、Modal）
  · 路由框架 + 登录拦截

核心页面（MVP）：
  · 首页（SSG + 模块化加载）
  · 商品列表页（SSR + 分页 + 图片懒加载）
  · 商品详情页（ISR + Server/Client Components 按需水合）
  · 简易下单页（CSR + 基础校验）
  · 简易支付页（CSR + 基础流程）

交付标准：
  · 首页 FCP < 1.5s
  · 核心链路可跑通（浏览→下单→支付）
  · 基础错误监控接入
```

### Phase 2：性能优化与体验提升

```
目标：首屏性能达标，用户体验流畅

性能优化：
  · BFF 接口聚合层搭建
  · Service Worker 缓存（App Shell + SWR 策略）
  · 图片优化体系（WebP/AVIF + srcset + LQIP + CLS防护）
  · 代码分割 + 预加载策略
  · 虚拟列表（商品数 > 200 的场景）
  · 性能预算 + CI 门禁（Lighthouse）
  · RUM 真实用户监控接入

体验提升：
  · 弱网分级策略
  · 断网容灾（离线提示 + 数据恢复）
  · 列表滚动位置恢复
  · 骨架屏体系完善

交付标准：
  · 首页 FCP < 1.0s / LCP < 2.0s（WiFi）
  · 弱网(4G) LCP P75 < 3.0s
  · 二次进入 < 300ms 秒开
```

### Phase 3：交易核心链路深化

```
目标：秒杀→下单→支付全链路安全稳定

秒杀模块：
  · 倒计时组件（时间同步 + 单调时钟 + 原生DOM渲染）
  · 秒杀按钮状态机
  · 资格令牌预申请（服务端签发；写请求不加 jitter，公平性见 7.3）
  · 排队机制（SSE/WebSocket 订阅）
  · 防重三道防线（状态锁 + 幂等Key + BroadcastChannel）

下单模块：
  · 下单状态机（XState）
  · 库存锁定与倒计时
  · 价格防篡改（前端不传价格）
  · 地址变更联动（竞态防护）
  · 订单超时自动关闭

支付模块：
  · 支付状态机（完整FSM）
  · 幂等Key + 支付凭证防重（直连/网关形态见 9.3.2）
  · 支付排队削峰
  · 超时查单收敛
  · 支付渠道容灾
  · 支付安全（CSP/HSTS/签名/脱敏）

交付标准：
  · 幂等率 100%
  · 支付状态最终一致
  · 秒杀倒计时精度误差 < 500ms（弱网下需多次采样校准）
  · 支付链路安全审计通过
```

### Phase 4：支付后体验与全链路打通

```
目标：支付后导航优雅，订单全生命周期覆盖

支付后导航：
  · 路由 replace 策略（支付链路不留 history）
  · 结果页导航守卫
  · 源路由感知返回
  · 防回退兜底

订单管理：
  · 订单列表（多Tab + SWR缓存）
  · 订单详情（状态进度条 + 倒计时 + 物流跟踪）
  · 订单状态实时更新（WebSocket推送）

售后模块：
  · 退款/退货申请流程
  · 售后进度状态机
  · 退款金额计算

购物车：
  · 本地+服务端同步
  · 离线编辑 + 联网同步
  · 价格实时更新
  · 失效商品处理

交付标准：
  · 支付后返回不触发二次支付
  · 订单状态展示准确
  · 购物车多端同步
```

### Phase 5：安全加固与监控完善

```
目标：安全合规，可观测性完善

安全加固：
  · XSS 体系化治理（CSP + 转义 + 白名单 sanitizer）
  · CSRF 防护（SameSite Cookie + Token）
  · 敏感信息脱敏（手机号/地址/银行卡/姓名）
  · 防爬虫（字体反爬 + 行为检测 + 频率限制）
  · 日志/埋点脱敏（上报 SDK 层拦截）
  · 支付页防截屏（APP端）

监控完善：
  · 全链路 traceId 贯通
  · 性能告警（P75退化阈值）
  · 业务告警（下单失败率、支付失败率）
  · 应急响应（远程开关 + 灰度回滚）
  · 会话录屏回放（采样）

交付标准：
  · 安全扫描无高危漏洞
  · 核心链路告警覆盖率 100%
  · 安全合规审计通过
```

### Phase 6：持续优化与演进

```
目标：长期可维护，持续迭代

工程化：
  · 组件文档站（Storybook）
  · E2E 测试覆盖核心链路
  · 性能基准自动化回归
  · A/B 实验框架

架构演进：
  · 微前端拆分（按业务域独立部署）
  · AI 辅助开发（代码生成 + 智能测试）
  · 边缘计算（Edge SSR/Edge Function）
  · 更多端适配（PC站/智能设备）
```

### 迭代节奏总览

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5 ──→ Phase 6
 基础架构     性能优化     交易深化     全链路打通    安全监控     持续演进

每个 Phase 的验收标准：
  · 功能验收：核心场景全部跑通
  · 性能验收：指标达标（不回退）
  · 安全验收：无高危风险
  · 代码质量：Code Review 通过 + 测试覆盖
```

---

## 附录：关键设计原则速查

| 原则 | 一句话总结 |
|------|----------|
| **动静分离** | 能静态化的绝不走动态请求，能在CDN解决的绝不回源 |
| **分层降级** | 非核心组件崩溃不能影响核心交易链路 |
| **状态机驱动** | 交易链路用FSM管理状态，拒绝非法迁移 |
| **幂等第一** | 幂等Key防重 + 支付凭证校验（直连一次 / 网关 payToken 视形态） |
| **服务端为准** | 时间、价格、库存、支付状态，一切以服务端为准 |
| **超时不判失败** | 交易类请求超时 → 进入UNKNOWN → 查单收敛 |
| **防重三道关** | UI状态锁 + 请求幂等 + 跨页面同步 |
| **不留中间页** | 支付链路用replace跳转，不留在history栈中 |
| **弱网优先骨架** | 弱网下先展示骨架/缓存，数据延后补齐 |
| **可观测可回放** | 全链路traceId，异常会话可回放定位 |

---

> **文档版本**：v1.5（经六轮对抗性审查，共修复 55+ 个技术问题，涵盖架构矛盾、算法正确性、API 兼容性、代码健壮性、支付安全等维度）
> **最后更新**：2026-08-10
> **关联文档**：[interview2026.md](./interview2026.md) 中的秒杀/下单/支付相关章节

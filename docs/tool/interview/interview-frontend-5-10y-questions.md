---
title: interview-frontend-5-10y-questions
date: 2026-03-15 01:46:14
permalink: false
article: false
categories:
  - tool
  - interview
tags:
  - 
---
## 方向1：JavaScript / TypeScript 基础与语言功底
 - 问题1：解释宏任务与微任务的执行顺序，并写出一段会“误判输出顺序”的示例代码说明原因
 回答：浏览器事件循环一般是“取一个宏任务执行 → 清空本轮产生的所有微任务 → 必要的渲染 → 下一轮宏任务”。微任务优先于下一轮宏任务，但不会打断当前同步代码。常见微任务：Promise.then/catch/finally、MutationObserver；常见宏任务：setTimeout/setInterval、UI 事件、I/O、MessageChannel 等。
 常见误判是认为 setTimeout(0) 会早于 Promise.then，实际上 then 会先执行。下面这段代码很多人会误以为输出是 sync1 → sync2 → macro → micro：

 ```js
 console.log('sync1')
 setTimeout(() => console.log('macro'), 0)
 Promise.resolve().then(() => console.log('micro'))
 console.log('sync2')
 ```

 实际输出通常是：sync1 → sync2 → micro → macro。原因是微任务会在本轮宏任务（当前脚本）结束后立刻被清空，然后才进入下一轮宏任务（setTimeout）。

 - 问题2：分别用例子说明普通函数、箭头函数在 this 绑定上的差异，以及 call/apply/bind 的适用边界
 回答：普通函数的 this 由调用方式决定；箭头函数没有自己的 this，捕获定义时的词法 this，call/apply/bind 对箭头函数无效。
 普通函数的 this 规则优先级通常是：new 绑定 > 显式绑定（call/apply/bind）> 隐式绑定（obj.fn()）> 默认绑定（严格模式 undefined）。
 适用边界：需要临时指定 this 用 call/apply；需要生成固定 this 的可复用函数（事件回调）用 bind；需要继承外层 this 的回调用箭头函数。

 ```js
 function C() {
   this.x = 1
   this.arrow = () => this.x
   this.normal = function () {
     return this.x
   }
 }

 const c = new C()
 const { arrow, normal } = c

 console.log(c.normal())
 console.log(normal())
 console.log(arrow())
 console.log(c.normal.call({ x: 2 }))
 console.log(c.normal.bind({ x: 3 })())
 ```

 以上在严格模式/ESM 中通常输出：1、undefined、1、2、3；其中 normal() 丢失了隐式绑定，this 回落为 undefined。

 - 问题3：解释原型链查找规则与 class/extends 的本质；如何实现一个可靠的继承与方法覆盖
 回答：属性访问先查对象自身属性，找不到沿 [[Prototype]] 向上查找直到 null。class/extends 是语法糖，本质是构造函数 + 原型链；extends 会把子类 prototype 链接到父类 prototype，并处理 super 与静态继承关系。
 可靠继承与覆盖要点：实例方法放在 prototype 上；覆盖方法同名并按需调用 super；手写继承需正确设置 prototype 与 constructor（Object.create + defineProperty）。

 - 问题4：闭包在工程中最常见的价值与风险分别是什么；举一个你遇到过的“闭包导致内存无法释放”的场景并给出修复方式
 回答：价值：封装私有状态、函数工厂/柯里化、在异步中保留上下文。风险：延长变量生命周期导致内存无法释放；捕获旧值造成逻辑错误（stale data）。
 常见泄漏场景：组件卸载后仍存在事件监听器/定时器/订阅回调，其闭包引用 DOM 或大对象，导致无法 GC。
 修复：在卸载时 removeEventListener/clearTimeout/unsubscribe；避免长期闭包捕获大对象（只捕获 id/key，执行时再读取）；在组件卸载或任务完成后断开引用（置 null）并确保缓存有上限/可淘汰策略。

 - 问题5：Promise 链式调用中 error 的传播规则是什么；如何避免 unhandledrejection，并设计统一的错误兜底策略
 回答：then 回调抛异常或返回 rejected Promise，会跳到后续最近的 catch；catch 若返回普通值会把链恢复为 fulfilled，若再次抛错则继续向下传播。
 避免 unhandledrejection：所有异步入口都要保证最终被 catch（或 await 包裹在 try/catch）；不要创建“悬空 Promise”（创建后不 return/不 await）。
 统一兜底：请求层归一化错误类型（网络/业务/权限/超时/取消）并携带 traceId；UI 层对可恢复错误做局部兜底与重试，对不可恢复错误走错误边界；全局 unhandledrejection 只做上报与轻提示。

 - 问题6：ESM 与 CommonJS 的差异是什么；它们分别如何影响 tree-shaking、循环依赖与打包产物形态
 回答：ESM 是静态结构（编译期可分析 import/export），CommonJS 是运行时加载（require 动态执行）。tree-shaking 依赖静态分析，因此 ESM 更友好。
 循环依赖：ESM 是 live binding，导出是绑定关系；CommonJS 常见是导出对象的引用，循环依赖容易拿到未初始化完成的导出。两者都需避免复杂循环；当出现初始化顺序问题（拿到 undefined 导出）时，重构依赖方向或拆分模块。
 组件库产物：通常提供 ESM（利于 tree-shaking）+ CJS（兼容 Node/旧工具），并正确配置 exports 与 sideEffects。

 - 问题7：用 TypeScript 设计一个类型安全的 API Client：要求根据接口定义自动推导 request/response 类型，并能区分错误类型
 回答：用一个 endpoint map 作为单一事实来源，为每个接口定义 method/path/request/response/error 类型；client 的 request 通过泛型 key 推导入参出参。
 关键设计：把 params 分为 path/query/body/headers；返回值用可辨识联合类型（例如 {ok:true,data} | {ok:false,error}）以便调用方用条件分支自动收窄；在边界层对不可信数据做 runtime 校验或适配，避免“类型安全停在编译期”。

 ```ts
 type Result<T, E> = { ok: true; data: T } | { ok: false; error: E }

 type Api = {
   getUser: {
     method: 'GET'
     path: '/users/:id'
     params: { path: { id: string } }
     response: { id: string; name: string }
     error: { code: 'NOT_FOUND' } | { code: 'UNAUTHORIZED' }
   }
 }

 type ParamsOf<K extends keyof Api> = Api[K]['params']
 type ResOf<K extends keyof Api> = Api[K]['response']
 type ErrOf<K extends keyof Api> = Api[K]['error']

declare function request<K extends keyof Api>(
  key: K,
  params: ParamsOf<K>
): Promise<Result<ResOf<K>, ErrOf<K>>>
 ```

 - 问题8：解释 any、unknown、never 的使用场景；如何在“不可信数据（例如接口返回）”进入业务前完成类型收敛
 回答：any 会关闭类型检查并污染下游，应尽量避免；unknown 表示未知类型，必须先做类型守卫/校验后才能使用；never 表示不可能发生，常用于穷尽检查与不可达分支。
 收敛策略：入口层把外部数据视为 unknown → 在 adapter 层用 schema 校验或 type guard 收敛到业务类型 → 失败返回可控错误（带 code）→ 业务层只消费已收敛类型。

 - 问题9：实现 debounce/throttle 的高级版本：支持 leading/trailing/maxWait/cancel/flush，并给出你会如何给它设计 TS 类型
 回答：实现上维护 lastCallTime/lastInvokeTime/timerId，并根据 leading/trailing/maxWait 决定何时 invoke；cancel 清理 timer 与状态；flush 立即执行 pending 的 trailing。
 类型上让包装函数保留参数与返回值：T extends (...args:any[])=>any，包装函数签名为 (...args: Parameters<T>) => ReturnType<T> | undefined，并在返回值上挂载 cancel/flush 方法（DebouncedFn<T>）。当被包装函数显式声明了 this 参数时，用 ThisParameterType/OmitThisParameter 把 this 从入参里剥离并保留类型信息。

 ```ts
 type Fn = (this: HTMLButtonElement, e: MouseEvent) => void
 type FnThis = ThisParameterType<Fn>
 type FnArgs = Parameters<OmitThisParameter<Fn>>
 ```

 ```ts
 export type DebouncedFn<T extends (...args: any[]) => any> = ((
   ...args: Parameters<T>
 ) => ReturnType<T> | undefined) & {
   cancel: () => void
   flush: () => ReturnType<T> | undefined
 }
 ```

 - 问题10：解释 Map/Set/WeakMap/WeakSet 的差异；分别适合用在缓存、去重、私有数据与避免内存泄漏的哪些场景
 回答：Map/Set 可遍历、强引用；WeakMap/WeakSet 的 key 必须是对象且弱引用、不可遍历，GC 可在无其他强引用时回收 key 对象，适合避免缓存导致对象常驻内存。
 场景：缓存与统计用 Map；值去重用 Set；以对象为 key 的私有字段或关联数据用 WeakMap；对象集合且不想阻止回收用 WeakSet。

## 方向2：浏览器与 Web 基础（渲染/网络/安全/存储）
 - 问题1：从用户输入 URL 到页面可交互，浏览器经历了哪些关键阶段（DNS/TCP/TLS/HTTP/解析/渲染），每一步常见瓶颈是什么
 回答：关键链路通常是 DNS → TCP/TLS → 请求/响应（TTFB）→ 下载 HTML/关键资源 → 解析（HTML/CSS/JS）→ 构建 DOM/CSSOM → 布局/绘制/合成 → JS 执行与事件绑定 → 可交互（受主线程长任务影响）。
 瓶颈常见在：网络（握手/丢包/带宽）、服务端（TTFB/缓存未命中）、前端（资源体积大/阻塞渲染/长任务/图片解码/布局抖动）。

 - 问题2：解释重排/重绘/合成的区别；列举 5 个会触发重排的操作，并说出你在工程里如何避免
 回答：重排是几何计算变化（layout），重绘是像素重画（paint），合成是图层在 GPU 上组合（composite）。transform/opacity 通常更容易走合成路径。
 触发重排的典型操作：修改 width/height/margin/padding/border/font-size/position/top/left；改变 display；增删 DOM；读取 offsetWidth/getBoundingClientRect（在写后读会强制同步布局）；窗口尺寸/字体加载变化。
 避免：读写分离（先读后写）、用 transform 替代布局属性动画、减少同步布局读取、局部渲染与虚拟列表；在大区域频繁重绘或复杂组件树下用 contain 或分层隔离影响范围。

 - 问题3：HTTP 缓存（强缓存/协商缓存）各靠哪些头字段控制；如果加上 Service Worker，你会如何设计缓存分层、更新与回滚策略
 回答：强缓存由 Cache-Control（max-age、immutable 等）/Expires 控制；协商缓存由 ETag/If-None-Match 与 Last-Modified/If-Modified-Since 控制。
 加 SW 后建议分层：入口 HTML 短缓存/网络优先；带 hash 的静态资源长缓存+cache-first（可 precache）；接口数据按业务选 network-first 或 stale-while-revalidate，并带 TTL/版本。
 更新回滚：缓存 key 版本化（app-vxxx）；install/activate 阶段原子化切换并清理旧缓存；谨慎 skipWaiting，避免“半更新”；回滚以入口指向旧 hash 为主，防止坏缓存固化。

 - 问题4：Cookie、localStorage、sessionStorage、IndexedDB 的差异是什么；在安全与性能维度如何选择
 回答：Cookie 会随请求携带、容量小，可 HttpOnly/Secure/SameSite；localStorage/sessionStorage 是同步 API，容量更大但易被 XSS 读取；IndexedDB 异步、容量更大、可结构化查询，适合离线与大数据。
 选择：身份凭证优先 Cookie（HttpOnly）；敏感数据不要放 Web Storage；大数据与离线用 IndexedDB；避免在关键路径频繁读写同步 storage。

 - 问题5：解释 CORS 的工作原理与预检请求触发条件；你会如何定位一次“线上跨域失败”
 回答：CORS 由服务端用响应头声明允许的跨域访问范围；非简单请求会先 OPTIONS 预检。触发预检的常见原因：自定义头、Content-Type=application/json、PUT/DELETE/PATCH、携带 credentials 等。
 定位：看 Network 的 OPTIONS 是否成功、Allow-Origin/Headers/Methods/Credentials 是否匹配；检查 credentials 与 * 的冲突；排查代理/CDN 是否吞 OPTIONS 或未透传头；多域名时注意 Vary: Origin 防缓存污染。

 - 问题6：设计一个大文件上传方案：要求支持分片、断点续传、秒传、并发控制与失败重试，并说明前后端的契约
 回答：三段式：init（传文件指纹 hash/size，返回 uploadId、chunkSize、已上传分片列表；命中秒传直接完成）→ uploadPart（uploadId+chunkIndex+chunkHash，前端控制 3-6 并发与重试/取消）→ complete（提交分片清单合并，后端校验整体 hash）。
 断点续传：前端持久化 uploadId 与文件指纹，刷新后 init 获取已上传分片并跳过；后端保证分片幂等与校验，合并前做最终一致性校验。

 - 问题7：主线程卡顿时你会如何把计算移到 Worker；Worker/SharedWorker 与主线程通信的取舍是什么
 回答：把纯计算与可序列化任务（解析/压缩/加密/大 JSON 处理）放 Worker；通信用 postMessage，优先 Transferable（ArrayBuffer）减少拷贝。
 Worker 是页面私有；SharedWorker 可跨同源 tab 共享（适合复用连接/共享状态），但复杂度与兼容性更高。取舍看是否需要共享、数据体积与任务生命周期。

 - 问题8：Performance API/PerformanceObserver 能采集到哪些关键数据；你会如何设计“从本地复现到线上归因”的性能排障闭环
 回答：可采集 navigation/resource/paint、LCP、CLS、INP/longtask、以及自定义 mark/measure 等。
 闭环：本地用 Performance 面板定位长任务与关键链路 → 线上 RUM 采样上报指标与维度（版本/路由/设备/网络）→ 仪表盘/告警定位异常分组与资源归因 → 灰度验证修复效果并复盘。

 - 问题9：解释 XSS 的分类与典型注入点；你会如何制定编码规范与 CSP 策略来降低风险
 回答：XSS 分存储型、反射型、DOM 型；典型注入点是 innerHTML、富文本渲染、URL 拼接到 DOM/属性、第三方脚本等。
 防护：默认禁止 innerHTML，必须用时做白名单清洗；对 URL/属性/文本做正确转义；CSP 限制 script-src 并使用 nonce/hash，尽量禁用 unsafe-inline；敏感 Cookie 用 HttpOnly，配合上报机制（report-to）做监测。

 - 问题10：解释 CSRF 的成因与 SameSite 的作用；在“第三方登录/内嵌 iframe/跨站跳转”场景如何权衡
 回答：CSRF 利用浏览器自动携带 Cookie，诱导用户在登录态下发起跨站写操作。SameSite 能限制 Cookie 在跨站请求中的携带（Lax/Strict/None）。
 权衡：第三方登录/iframe 场景常需要 SameSite=None; Secure，同时必须加 CSRF token/state 校验与 Origin/Referer 校验；普通业务优先 SameSite=Lax 并对写接口做 token 防护。

## 方向3：HTML/CSS 与 UI 实现（响应式/动效/A11y）
 - 问题1：语义化 HTML 的价值是什么；请以“表单+校验+错误提示”为例说明如何做到对读屏与键盘友好
 回答：语义化能提升可访问性、默认交互一致性与可维护性。表单实践：label-for 绑定、required/aria-required；错误信息用 aria-describedby 关联并在 aria-live 区域播报；键盘可达（button/role 正确、Tab 顺序合理）；校验时机避免每次输入都打断读屏，通常在 blur/submit 时提示并聚焦到首个错误。

 - 问题2：实现水平垂直居中有哪些方式；分别说明适用场景与潜在坑（例如未知尺寸、文本换行、动态内容）
 回答：Flex（align-items/justify-content）与 Grid（place-items）最通用；绝对定位 + transform 适合未知尺寸但会影响 stacking context；line-height 只适合单行文本；历史 table-cell 不推荐。注意溢出与省略号场景下常需要 min-width:0/overflow 控制。

 - 问题3：解释 BFC、外边距折叠与清除浮动；给出一个你曾经用 BFC 解决布局问题的例子
 回答：BFC 是独立布局上下文，可包含浮动并隔离外部布局影响；常见触发：display:flow-root、overflow 非 visible、position:absolute/fixed、float、inline-block 等。外边距折叠发生在相邻块级垂直 margin 或父子 margin 条件满足时。清除浮动可用 clearfix 或让父形成 BFC（flow-root/overflow）。
 例子：父容器只有浮动子元素高度塌陷，给父加 display:flow-root 形成 BFC 后高度恢复。

 ```html
 <div class="parent">
   <div class="left"></div>
 </div>
 ```

 ```css
 .parent {
   display: flow-root;
 }
 .left {
   float: left;
   width: 100px;
   height: 100px;
 }
 ```

 - 问题4：移动端适配你会如何选型（rem/vw/媒体查询/容器查询等）；如何处理不同 DPR 与字体缩放
 回答：等比缩放需求强可用 vw 或 rem；断点式布局用媒体查询；组件在不同容器宽度复用可考虑容器查询并做降级。DPR 处理：图像/图标尽量用 SVG 或多倍图；布局要容错字体缩放，避免锁死字体导致可读性问题。

 - 问题5：解释 CSS 层叠与优先级、stacking context 与 z-index；给出一个“z-index 不生效”的排查路径
 回答：层叠由来源/important/特异性/顺序决定。z-index 只在堆叠上下文内比较；transform、opacity<1、position+z-index 等会创建 stacking context，子元素再高也无法“穿透”父上下文。
 排查：确认元素是否可设置 z-index（定位/网格/弹性项等）→ 沿父链找 stacking context 创建点 → 确认比较发生在哪一层 → 把 z-index 放到正确层级或移除不必要的 stacking context。

 ```html
 <div class="a">
   <div class="a-child"></div>
 </div>
 <div class="b"></div>
 ```

 ```css
 .a {
   transform: translateZ(0);
   position: relative;
 }
 .a-child {
   position: absolute;
   z-index: 9999;
 }
 .b {
   position: relative;
   z-index: 1;
 }
 ```

 - 问题6：CSS Modules、CSS-in-JS、原子化 CSS 的取舍是什么；从性能、可维护性、主题化、团队协作角度回答
 回答：CSS Modules 编译期隔离、性能好；CSS-in-JS 动态能力强、主题友好但可能有运行时成本；原子化 CSS 规则复用与一致性强但可读性与条件组合复杂。中大型团队建议以 tokens（CSS 变量）统一主题与设计语言，再选一种主要样式方案，避免多套混用。

 - 问题7：如何实现可扩展的主题系统（亮/暗/品牌色）并支持运行时切换；请说明你会选择 CSS 变量还是运行时计算
 回答：优先 CSS 变量：定义语义 token（背景/文本/主色等），用 [data-theme] 或租户标识覆写变量即可运行时切换；配合 prefers-color-scheme 做默认。运行时计算适合生成色阶，但最终仍建议落到 CSS 变量，便于 SSR、调试与性能。

 - 问题8：如何做“既顺滑又不掉帧”的动画；为什么 transform/opacity 更优，何时需要 will-change，如何兼顾 prefers-reduced-motion
 回答：避免动画触发布局与重绘，优先 transform/opacity 走合成；JS 动画用 rAF。will-change 只给关键元素短期启用，动画结束移除，避免显存占用。对 prefers-reduced-motion 提供减少动画或替代过渡。

 - 问题9：Flex/Grid 布局下内容溢出与省略号失效的常见原因是什么（例如 min-width:auto）；你会如何系统性解决
 回答：Flex/Grid 子项默认 min-width:auto 导致不允许收缩，从而溢出并使 ellipsis 失效；Grid 常需 minmax(0, 1fr)。解决：对可收缩子项设置 min-width:0（或 grid minmax(0,1fr)）+ overflow:hidden；省略号按单行/多行分别用 text-overflow 或 line-clamp；确保父容器有明确宽度约束。

 - 问题10：实现一个“粘性头部 + 分区滚动 + 吸顶 tab + 锚点高亮”的复杂页面，你如何保证可维护性与性能
 回答：吸顶优先用 position:sticky，减少 JS；高亮用 IntersectionObserver 监听 section 可见性并更新 activeId；点击 tab 用 scrollIntoView/scrollTo 并处理 sticky 偏移；长内容按需渲染/虚拟化，避免滚动回调里频繁读写布局。把“section 注册/导航/高亮”封装成独立逻辑层（Hook/模块），视图层只消费状态与动作。

## 方向4：框架能力（以你最熟悉的 React 或 Vue 为例）
 - 问题1：受控组件与非受控组件的差异是什么；在表单/编辑器这类场景你如何选择
 回答：受控组件的值由状态驱动（value + onChange），便于联动、校验、回填、可回放；非受控组件让 DOM 自己保存值（defaultValue + ref 读取），渲染压力更小。
 选择：需要跨字段联动/统一提交/复杂校验优先受控；超大表单/富文本编辑器可用“字段级订阅/半受控”，减少每次输入引发的大范围渲染。
 - 问题2：解释一次渲染触发的完整链路（状态变化→调度→渲染→提交）；如何判断“为什么它又渲染了”
 回答：状态更新触发调度（批处理/优先级）→ render 阶段计算新 UI（虚拟树/依赖收集）→ diff → commit 阶段落 DOM 并触发副作用（React effects/Vue effects）。
 定位重渲染：先找触发源（props/state/context/store）→ 看渲染范围（父带动/订阅触发）→ 检查引用稳定性（新对象/新函数导致 memo 失效）→ 用 Profiler/DevTools 的 “Why did this render”/Profiler 定位具体依赖。

 - 问题3：React 中 stale closure 的成因是什么；在定时器/订阅/事件回调里你如何避免它带来的 bug
 回答：回调捕获了某次 render 的 state/props，后续更新并不会自动更新已注册回调，导致读到旧值。
 规避：正确声明 effect 依赖并在变化时重建订阅；用函数式更新 setState(prev=>...)；对不想频繁重建的高频值用 ref 保存最新值并在回调里读 ref.current。

 - 问题4：组件拆分的边界如何定义；什么时候提取自定义 Hook/Composable，什么时候保持在组件内更好
 回答：按“变化原因”拆分：UI 展示、领域规则、数据访问、副作用订阅分层。复用价值高且可被多处消费的逻辑（订阅/状态机/数据获取/校验规则）提取为 Hook/Composable；只服务当前组件且难复用的逻辑留在组件内更清晰。

 - 问题5：Context/Provider 滥用会带来什么问题；你会怎么做渲染隔离与性能优化
 回答：Context 值变化会触发消费者重渲染，滥用会导致大范围更新与依赖难追踪。
 优化：按领域拆分 context；value 用 useMemo 保持引用稳定；引入 selector/细粒度订阅（状态库或 context selector）；把重组件下沉并 memo 化，隔离更新边界。

 - 问题6：解释 Suspense/Transition（或 Vue 的异步组件/KeepAlive 等同类能力）的设计初衷；你会怎么用它改善体验
 回答：把异步加载与渲染协同起来：Suspense 提供一致的 fallback；Transition 把非紧急更新降级优先级以降低输入卡顿。Vue 异步组件/KeepAlive 用于按需加载与缓存实例，减少切换成本。
 用法：路由/模块懒加载配合 skeleton；筛选/搜索结果用 transition 保证输入流畅；KeepAlive 保留滚动位置与状态（注意缓存上限与失效策略）。

 - 问题7：SSR/同构中 hydration mismatch 常见原因有哪些；如何定位与避免（时间、随机数、客户端差异等）
 回答：常见原因：时间/随机数/时区差异；基于 window/尺寸/媒体查询的条件渲染；首屏数据不一致；第三方在 hydration 前改写 DOM。
 避免：首屏数据注水并复用；仅客户端逻辑延迟到 mounted/effect；对不可避免差异用 client-only 边界；定位时对比 SSR HTML 与客户端首次渲染输出并锁定节点。

 - 问题8：路由级数据预取怎么做更合理；你如何处理“切页闪烁、重复请求、缓存一致性、错误兜底”
 回答：把路由与数据绑定：进入路由触发 loader 预取，并与代码分割并行。去重用 query key 复用 in-flight Promise；一致性用 key/tag 失效；闪烁用 SWR 或保留旧数据过渡；错误用路由级错误边界 + 可重试提示；切换时取消过期请求（AbortController）。

 - 问题9：设计一个通用组件（如 Table/Form/Modal）的 API：如何平衡易用性、扩展性、可测试性与破坏性变更风险
 回答：核心能力有合理默认值，扩展点语义化（slots/render props），支持受控/非受控双模式（open/defaultOpen），并提供可访问性与可测试性约定（role/aria/data-testid）。
 破坏性变更控制：deprecate 周期、兼容层与迁移方案；避免把内部 DOM 结构当成 API。

 - 问题10：框架升级（例如 React 大版本/Vue 大版本）你会怎么评估与推进；如何控制兼容成本与线上风险
 回答：先做依赖矩阵与 breaking changes 评估（构建链、组件库、SSR/微前端）、PoC 跑通关键页面与产物；再分阶段推进（基建→核心路由灰度→扩大范围），用指标与错误率观测。
 风险控制：feature flag、灰度分流、可回滚入口；当升级涉及大量调用点修改或上下游生态（组件库/SSR/微前端）无法同步升级时，通过适配层把变更集中在边界，避免在业务里“到处打补丁”。

## 方向5：状态管理与复杂业务建模
 - 问题1：什么状态应该放全局，什么状态应该放组件内；请用“筛选条件/用户信息/权限/草稿”分别举例
 回答：判断标准：是否跨路由/跨模块共享、是否需要持久化、订阅者数量、变更频率与影响范围。
 示例：筛选条件仅本页用则页面内；需要“返回列表保留条件”则放路由 query 或全局并持久化。用户信息与权限通常全局（并配刷新/失效策略）。草稿更适合页面内 + 本地持久化（避免全局内存无限增长）。
 - 问题2：设计一个电商类业务的状态结构（商品、购物车、订单、用户）；如何做数据归一化与派生状态
 回答：归一化：entities（productsById/ordersById/usersById）+ ids 列表；购物车只存 skuId→quantity（或 itemId→quantity），避免复制商品信息。UI 状态（筛选、分页、选中）单独存。
 派生状态用 selector 计算（总价/优惠/是否可结算/库存校验），避免写死导致不一致。
 - 问题3：如何处理请求去重、缓存、过期与刷新（stale-while-revalidate）；你会选择在哪一层做（组件/Hook/全局层）
 回答：通用策略应放在数据访问层（query layer），而不是散落在组件里：同 key 去重复用 Promise；按 key 缓存并带 TTL；SWR 先返回缓存再后台刷新；写操作后按 key/tag 失效。
 组件只消费数据与状态；Hook 承载页面特有的刷新时机与组合逻辑。
 - 问题4：解释竞态条件在前端的常见形态；如何用 AbortController 或其他机制保证“最后一次请求生效”
 回答：典型是“先发后到覆盖”或“路由切换后旧请求回写”。保证最后一次生效：每次请求前 abort 上一次（AbortController）；或用 requestId 序号只处理最新响应；把参数纳入 query key 防止覆盖错误缓存；卸载时取消/忽略响应避免 setState on unmounted。
 - 问题5：乐观更新（optimistic update）怎么做；失败回滚与用户提示如何设计才不伤体验
 回答：本地先更新 UI，同时发请求；保存快照或反向补丁用于失败回滚；成功后用服务端返回对齐最终状态。
 体验：失败提示要可操作（重试/撤销）；批量操作允许部分成功；对资金/不可逆操作用 pending 状态而非盲目乐观。
 - 问题6：复杂表单/多步骤流程的状态如何管理；如何保证性能（局部更新/字段级订阅/不可变更新成本）
 回答：字段级 store（value/touched/error）+ 步骤级状态机（当前步、可达性、提交中）。异步校验要防抖+取消+竞态控制。
 性能：字段级订阅/selector、memo 组件、局部不可变更新（按字段 key 更新），避免每次输入 deep clone 整个表单对象。
 - 问题7：前端权限体系你会怎么建模（路由、按钮、数据级权限）；如何避免“只做前端拦截”的误区
 回答：三层：路由权限（可见/可访问）、操作权限（按钮/动作点）、数据级权限（行/字段级）。前端用于体验增强与减少无效操作；真正安全必须后端接口强校验并返回最小必要数据。前端还应统一处理 401/403（刷新/跳转/提示）。
 - 问题8：实时数据（WebSocket/SSE）进入状态树后如何保持一致性；如何处理乱序、补偿与重连
 回答：事件必须带序列号/版本号/时间戳并具备幂等标识（eventId 去重），乱序按序列号丢弃/缓冲。丢事件通过“全量快照 + 增量补拉”补偿并定期 reconcile。
 重连用指数退避+抖动；重连成功先同步快照再继续增量；UI 显示离线/重连状态并限制高风险写操作。
 - 问题9：Redux/Zustand/MobX/Pinia/Context 等方案如何选；请给出你实际会用的评估维度与踩坑点
 回答：维度：状态规模与可预测性要求、订阅粒度（selector）、异步与缓存能力、调试工具与团队约束力、SSR/持久化需求。
 踩坑：Context 大对象导致无关重渲；MobX 隐式依赖难追踪；Redux 未工具化导致样板多。实践上“数据获取/缓存”优先交给 query 层，UI 状态用轻量 store 或组件内，强规范场景用 Redux Toolkit/Pinia 等。
 - 问题10：你如何做领域分层（UI/领域/数据访问）；如何让业务逻辑可复用、可测试、可迁移
 回答：数据访问层处理请求、序列化、错误归一化与缓存；领域层承载用例/规则/状态机（尽量纯逻辑）；UI 层只负责渲染与交互。这样领域层可单测、可跨框架复用，迁移时主要重写 UI 层。

## 方向6：性能优化（指标→定位→方案→验证闭环）
 - 问题1：解释 LCP/CLS/INP/TTFB 分别代表什么；每个指标常见的“首要影响因素”有哪些
 回答：TTFB 受服务端处理/缓存/网络影响；LCP 受 TTFB、关键资源（CSS/图片/JS）、渲染阻塞与主线程负载影响；CLS 多由未预留尺寸的媒体、字体切换、动态插入造成；INP 主要受主线程长任务、事件处理过重、同步渲染阻塞影响。

 - 问题2：首屏慢你会如何拆解问题：网络、服务端、资源体积、执行、渲染分别怎么验证
 回答：Network 看 waterfall 与关键资源阻塞；服务端看 TTFB/Tracing；体积看 bundle/analyzer 与资源大小；执行看 Performance 主线程长任务与脚本解析执行；渲染看 Layout/Paint/CLS。优化后用指标对比与灰度验证闭环。

 - 问题3：代码分割你会怎么做：按路由、按组件、按能力（feature）分别有什么利弊；如何避免分割过度
 回答：路由分割收益最大；组件分割适合低频大组件；feature 分割利于按角色/能力加载。过度分割会导致请求过多与瀑布加载。避免：以关键路径为中心做 chunk grouping，配合预取与并行加载，对小模块不拆或合并。

 - 问题4：静态资源优化的系统方案是什么：图片与字体（FOIT/FOUT）、第三方脚本、懒加载、占位策略、CDN 处理如何组合
 回答：图片用现代格式+多尺寸 srcset，首屏关键图 preload，非首屏 lazy，并用 aspect-ratio/骨架预留空间降低 CLS；字体子集化、只加载必要字重，font-display:swap；对首屏必需字体（品牌字体/关键字重）可 preload；第三方脚本延后/按需加载并监控其对 INP 的影响；CDN 用 hash 长缓存+入口短缓存，压缩与 HTTP/2/3 配齐。

 - 问题5：大列表/大表格性能问题怎么解决；虚拟列表的关键参数如何选择（高度估算、overscan、滚动同步）
 回答：核心是虚拟化（只渲染可视区域+buffer）。固定高度最好；动态高度需测量与缓存。overscan 在平滑与渲染量间权衡（常 2-5 屏）；固定表头/列避免 scroll 中触发布局，减少每行组件复杂度与无谓重渲。

 - 问题6：如何定位并修复内存泄漏；你会如何用 Heap Snapshot/Allocation Timeline 找到引用链
 回答：复现并观察是否能回落；用 Heap Snapshot 对比找持续增长对象与 retained size；看 retainers 定位引用链（监听器/缓存 Map/闭包/单例/定时器）；Allocation Timeline 找创建高峰与调用栈。修复通常是清理订阅/监听、避免强引用缓存；当缓存 key 是对象且生命周期不受控时改用 WeakMap/WeakSet，或在卸载时断开引用。

 - 问题7：如何降低 JS 执行与解析成本；你会如何处理 polyfill、第三方包体积、重复依赖与按需加载
 回答：减少首屏 JS（路由/模块分割、延后低优先级逻辑）；polyfill 按目标浏览器按需引入；第三方包做替换/按需引入/tree-shaking/sideEffects 配置；治理重复依赖（锁文件、overrides/resolutions）；大组件交互后再加载并用 skeleton 过渡。

 - 问题8：SSR/SSG/预渲染/ISR 怎么选；请用“营销页/后台系统/内容站/互动强页面”各举一个适配理由
 回答：营销页适合 SSG/预渲染（SEO+极快首屏）；后台系统多为 CSR（SEO 不重要、交互重）或轻 SSR；内容站适合 SSG+ISR（兼顾 SEO 与更新）；互动强页面可 SSR 首屏 + CSR 接管（兼顾首屏与实时交互）。

 - 问题9：如何建立性能预算（performance budget）并接入 CI；你会监控哪些关键资源与阈值
 回答：预算包含：核心指标阈值（LCP/CLS/INP 的目标与回归上限）+ 资源阈值（首屏/关键路由 JS、图片、字体、第三方数量与大小）+ 产物阈值（bundle size、单包上限、重复依赖）。CI 中对比基线，超标阻断或要求说明与审批。

 - 问题10：线上 RUM 监控你会怎么做：采集、采样、归因、报警、回滚策略如何设计
 回答：采集 Web Vitals + 自定义关键链路 + 错误（onerror/unhandledrejection），注意脱敏；分层采样（PV/用户/异常加采样）；归因维度含版本/路由/设备/网络/地区/第三方；报警以 p75/p95 与异常检测为主；与发布系统联动支持灰度回退与 feature flag 快速止血。

## 方向7：工程化与交付（构建体系/依赖治理/发布体系）
 - 问题1：Vite 与 Webpack 的核心差异是什么；分别适合什么项目形态，迁移成本怎么评估
 回答：Vite 开发阶段基于原生 ESM + 依赖预构建，启动与 HMR 更快；Webpack 以 bundle 为中心，生态与可定制性更强，适配复杂存量项目更稳。
 迁移评估重点：自定义构建链（loader/plugin）、SSR/微前端、环境变量注入、产物形态与线上缓存策略，先做关键页面 PoC 再分阶段迁移。

 - 问题2：解释打包产物中 ESM/CJS/UMD 的差异；一个组件库应该如何选择产物形态与导出策略
 回答：ESM 静态导入利于 tree-shaking；CJS 面向 Node/旧工具；UMD 面向浏览器全局（现较少）。组件库通常提供 ESM+CJS 双产物，用 exports 做条件导出，并正确声明 sideEffects（尤其样式）与提供 d.ts/sourcemap。

 - 问题3：Monorepo 你会如何落地：包边界、依赖约束、构建缓存、版本管理（统一版本 vs 独立版本）
 回答：先定分层与包边界（ui/utils/data/app 等），再用工具约束跨层依赖与禁止循环依赖；构建用任务编排+缓存（按输入输出 hash）。统一版本适合强耦合统一发布；独立版本适合包可独立演进但治理成本更高。

 - 问题4：CI 门禁你会怎么设计：lint/typecheck/test/build/安全扫描分别放在哪个阶段更合理
 回答：PR 阶段跑 lint+typecheck+关键单测；合并主干跑全量单测+build+产物检查（bundle size/重复依赖）；发布前跑关键 E2E/回归与更严格的安全/许可证检查（视要求）。原则是越早越快、越晚越全。

 - 问题5：环境配置与 Feature Flag 你会怎么做；如何避免把敏感信息塞到前端构建产物里
 回答：区分构建时配置与运行时配置：构建时只放非敏感开关；运行时通过配置接口/配置中心下发，支持灰度与回滚。前端产物可被任何人获取，密钥等敏感信息必须只在服务端。

 - 问题6：如何做灰度发布与回滚；前端在“多版本并存、缓存未刷新、CDN 回源”下如何保证可控
 回答：入口可控与资源版本化：静态资源内容 hash 长缓存，HTML/入口短缓存或不缓存。灰度按用户维度分流到不同入口配置并保证会话一致性；回滚通过入口切回旧 hash。注意 Service Worker/客户端缓存的更新与失效策略避免坏版本固化。

 - 问题7：依赖治理你会怎么做：升级策略、锁文件、重复依赖、漏洞修复与 breaking change 风险控制
 回答：建立固定升级节奏与评审机制；统一包管理器与锁文件并在 CI 校验；治理重复依赖（overrides/resolutions）与产物体积；SCA 扫描高危优先修复并做回归与灰度。当 breaking change 无法一次性改完全量调用方时，引入适配层/兼容层把风险收敛在少数入口并提供迁移路径。

 - 问题8：如何提升本地研发效率：Mock、联调、代理、快速启动、统一脚手架你会怎么设计
 回答：统一 dev proxy 与环境切换；Mock 支持本地/远端/录制回放并对齐契约；按需启动子应用与增量构建缓存提速；脚手架一键生成页面/模块/接口层代码，把规范与最佳实践工具化。

 - 问题9：你如何制定代码规范与最佳实践并让团队真正执行；如何处理“规范与效率冲突”
 回答：规范要可自动化执行：formatter/lint/typecheck 进入 pre-commit 与 CI，尽量自动修复；PR 评审清单聚焦高价值问题。对收益不明确的规则先试点并收集反馈，对高收益规则保持强约束并提供工具降低执行成本。

 - 问题10：微前端/模块联邦/多应用集成你如何选型；隔离、通信、样式冲突与部署策略怎么设计
 回答：选型看组织与发布诉求：多团队独立发布强、技术栈多样且需要隔离时考虑微前端；诉求是共享依赖与按需加载可考虑模块联邦但需治理版本与运行时兼容。
 隔离用样式命名空间/Shadow DOM/容器隔离；通信用协议化 API/事件总线并尽量单向；部署以入口配置化加载子应用，支持灰度与回滚。
## 方向8：测试策略与质量保障
 - 问题1：测试金字塔在前端如何落地；单测/组件测试/E2E 各自覆盖哪些风险最划算
 回答：单测覆盖领域规则/工具函数/状态机，最稳定性价比最高；组件测试覆盖交互与渲染分支、可访问性；E2E 只覆盖关键链路（登录/支付/权限/下单），数量控制以降低 flaky 与维护成本。
 - 问题2：如何为一个复杂组件写测试：异步请求、定时器、防抖、动画、Portal、路由依赖分别怎么处理
 回答：异步请求用 mock API/MSW，断言 loading→success/error；定时器/防抖用 fake timers 推进时间；动画尽量关闭或把时长设为 0，断言最终状态；Portal 提供测试容器并断言内容；路由依赖用 memory router 注入上下文并模拟跳转。
 - 问题3：如何做前后端契约测试（Contract Testing）；接口变更如何在上线前被发现
 回答：用可执行契约（OpenAPI/JSON Schema）作为事实来源：前端基于契约生成类型/客户端；后端在 CI 做兼容性校验（字段新增/删除/类型变更/枚举变更）；关键接口可用消费者驱动契约，变更必须跑契约检查并在灰度环境回归。
 - 问题4：E2E 测试为什么容易 flaky；你会如何设计稳定的定位与等待策略
 回答：flaky 多因异步未稳定（请求/动画/渲染）、依赖外部不稳定数据、选择器不稳定。策略：等待可观测条件而非 sleep；固定测试数据/专用环境；使用 role/aria/data-testid 作为稳定选择器；失败时输出截图/录屏/网络日志便于复现。
 - 问题5：Snapshot 测试的价值与陷阱是什么；你如何避免“快照一大片但没人看”
 回答：价值是快速发现 UI 结构变化；陷阱是快照过大、频繁变化导致审查失效。避免：只对关键子树做小快照；动态值固定或过滤；重要行为用显式断言；快照更新必须说明原因并通过 review。
 - 问题6：如何测试自定义 Hook/Composable；如何把副作用隔离到可注入依赖以提升可测性
 回答：把副作用（fetch/storage/timer/event）抽到 adapter 并可注入；Hook 内尽量只做状态机与组合逻辑。测试时注入 mock 依赖、控制返回与时序，结合 fake timers，断言状态转移与调用参数。
 - 问题7：视觉回归测试你会怎么做；对动态内容（时间、随机数、数据波动）如何消噪
 回答：固定渲染环境（视口、字体、无动画）、固定数据（种子/录制回放），时间/随机数 mock；对易抖动区域 mask 或设置像素差异阈值；在 PR 里产出 diff 供人工审核后更新基线。
 - 问题8：测试数据如何管理：Mock 数据、种子数据、录制回放各有什么 trade-off
 回答：Mock 最快最稳但可能偏离真实；种子数据贴近真实但维护成本高且需可重置；录制回放真实性高但对接口变更敏感且需脱敏。组合：单测/组件测用 mock，关键链路 E2E 用种子数据，复杂联调用录制回放辅助。
 - 问题9：CI 中如何做并行与缓存以提升测试速度；如何防止“为了快而丢失有效覆盖”
 回答：并行按测试分片跑；缓存依赖、构建与测试缓存提升速度；可按变更影响范围选择性运行，但关键模块仍强制跑全量。防止丢覆盖：设置覆盖率阈值与关键用例门禁，失败必须阻断合并。
 - 问题10：线上出现“测试没覆盖到的 bug”，你会如何做复盘并调整测试策略
 回答：先分类根因（需求遗漏/用例遗漏/环境差异/数据差异/兼容性/测试不稳定），在最靠近根因的层补测试（优先单测/组件测），并把该类风险加入评审清单或 CI 门禁；同时加强线上监控与灰度策略，缩短发现与回滚时间。
## 方向9：架构与系统设计（高级岗区分度核心）
 - 问题1：设计一个“可配置表单引擎”：Schema、校验、联动、动态渲染、性能与可扩展性如何设计
 回答：以 Schema 为单一事实来源（字段、布局、默认值、可见/可用规则），渲染器只做 schema→组件树映射。校验分同步/异步两层，异步要防抖、可取消并处理竞态。联动用依赖图与规则引擎/状态机，拓扑更新并检测循环依赖。性能用字段级订阅、分段渲染、memo 与大表单虚拟化。扩展用插件机制（自定义字段/校验器/布局容器）与 schema 版本化。

 - 问题2：设计一个“企业级表格组件”：10 万行、列固定、复杂筛选、服务端分页/排序、可编辑单元格怎么做
 回答：数据与 UI 状态分层：服务端分页/排序/筛选用 query key 管理并做取消与去重；核心用行虚拟化。列数非常多且存在横向滚动/固定列时，再引入列虚拟化或列分组渲染，避免“行虚拟化但列把 DOM 撑爆”。固定列/表头用同滚动容器同步与分层渲染，避免滚动中触发布局。编辑用单元格状态机（编辑/校验/提交/回滚），支持乐观更新与失败回滚；大数据场景把聚合/筛选尽量放服务端。

 - 问题3：设计一个设计系统与组件库：主题化、无障碍、版本策略、迁移策略、灰度升级如何落地
 回答：主题化以 design tokens 为核心（语义 token→CSS 变量），组件只消费语义 token。无障碍做成默认能力（键盘交互、焦点管理、aria），并接入自动化检查。版本策略用语义化版本与弃用周期；迁移提供 codemod/兼容层；灰度升级按应用/租户/路由分批启用并用监控与回滚开关兜底。

 - 问题4：设计一个低代码页面搭建平台：物料体系、渲染器、数据源、权限、发布与回滚如何设计
 回答：物料以“组件元信息+props schema+事件协议”注册，渲染器解析页面 schema 并做隔离（样式命名空间/沙箱）。数据源层统一鉴权、缓存、错误归一化，支持 mock 与联调。权限分页面/组件/数据源三级并可审计。发布以版本化 schema 与资源为中心，支持灰度、回滚与历史追溯。

 - 问题5：设计前端鉴权体系：登录态、Token 刷新、单点登录、跨域与多端同步如何处理
 回答：优先用 HttpOnly Cookie 承载登录态；跨域按 SameSite/Domain 配置并配合 CSRF 防护。若使用 token，短 access+长 refresh，刷新要做并发合并、可取消与失败降级（回登录）。SSO 采用 OIDC/SAML 并处理 state/nonce。多端同步依赖服务端会话与失效机制，前端统一处理 401/403 与登出广播。

 - 问题6：设计全局异常与容错体系：错误边界、重试/降级、兜底页、告警与定位信息怎么组织
 回答：请求层归一化错误类型（网络/超时/取消/业务/权限）；UI 层用错误边界做渲染兜底并提供重试；关键操作做幂等与指数退避重试（可取消）。当关键依赖不可用（例如权限/订单/配置中心）或异常率在灰度期显著升高时，触发降级到只读/简化模式并通过开关可快速恢复。上报要带版本、路由、traceId、用户维度与关键上下文，告警以异常率/影响面为主并可关联发布与回滚。

 - 问题7：当业务变复杂时你如何拆分应用：单体、微前端、多仓库/Monorepo 的决策依据是什么
 回答：单体适合强耦合与统一发布；Monorepo 适合强共享与统一规范；微前端适合多团队独立发布且需要隔离。决策看边界清晰度、运行时隔离成本、依赖治理能力、性能与观测成本、交付节奏与事故半径；先模块化再演进到更重的形态。

 - 问题8：设计一个多租户 SaaS 前端：运行时租户配置、主题品牌、菜单权限与资源隔离怎么做
 回答：租户配置运行时下发并带版本，缓存按 tenantId 分区；主题用 tokens+CSS 变量按租户覆写；菜单/路由按权限裁剪并在服务端强校验；资源隔离用命名空间（storage key、缓存 key、埋点维度）与按租户加载资源包，避免串租。

 - 问题9：设计一个离线优先应用：本地存储、同步策略、冲突解决、回放队列与一致性如何保证
 回答：本地用 IndexedDB 存“业务数据+操作日志（outbox）”，写操作入队并带幂等键；同步采用“本地优先→后台同步”，失败重试与断网恢复。冲突以版本号/时间戳/CRDT/业务规则解决，并提供人工处理入口。回放队列要可重放、可回滚，定期与服务端快照 reconcile。

 - 问题10：国际化方案你会怎么做：文案、格式化、RTL、动态语言包加载、性能与协作流程如何落地
 回答：文案抽取与 key 规范化（含命名空间），格式化用 ICU Message（复数/性别/日期货币）；RTL 在样式层支持方向切换；语言包按路由/模块动态加载并缓存，首屏只加载必要集合。流程上接入翻译平台与校验（缺失/冗余 key），发布前做覆盖率与回归。

## 方向10：调试与问题定位（线上战斗力）
 - 问题1：线上出现白屏你会按什么顺序排查；从监控到用户环境还原你会如何做
 回答：先看监控定位范围（版本、路由、UA、错误率、资源失败率）；再查 Network/控制台（入口 HTML、关键 chunk 404、CSP、跨域、SW 缓存）；结合 sourcemap/traceId 还原堆栈。复现用同版本同条件（AB/地区/网络），用 feature flag/入口回滚先止血再修复。

 - 问题2：线上 CLS 或 LCP 突然恶化你会如何定位；如何把一次变更与具体资源/渲染行为关联起来
 回答：RUM 按版本/路由/设备分组对比 p75/p95，锁定回归窗口并关联发布；用 PerformanceObserver/resource timing 找 LCP 元素与阻塞资源，CLS 看未预留尺寸/字体切换/动态插入等根因。对可疑变更用灰度回退或开关验证，并把修复效果回写指标闭环。

 - 问题3：内存持续增长但没有明显泄漏点，你会如何用工具与方法缩小范围并确认根因
 回答：确认是否可回落（手动 GC/空闲回落），用 Heap Snapshot 对比找 retained size 最大对象与引用链，Allocation Timeline 看分配峰值与调用栈。线上通过 feature flag 与采样埋点做路由/功能二分，重点排查缓存、订阅、事件监听、长列表与闭包强引用。

 - 问题4：某个布局在 Safari/Android WebView 上异常，你会如何复现、定位与制定兼容方案
 回答：用真实设备/远程调试复现并最小化 demo，定位到具体 CSS/JS；检查兼容性（sticky、viewport、flex/grid、字体渲染）与特性支持。方案优先渐进增强：能力检测+降级布局；把该问题加入回归用例并覆盖目标 WebView 版本区间。

 - 问题5：依赖升级后构建失败/类型爆炸，你如何判断是配置问题、依赖冲突还是类型变更导致
 回答：对比 lockfile 与日志定位首个错误点；检查 tsconfig/moduleResolution、jsx/runtime、types 版本是否匹配；查依赖树定位重复依赖与不兼容 peerDependencies。当日志不足以直接锁定问题或一次升级牵涉多个包时，用二分回退/二分升级定位引入破坏的最小版本范围，再通过升级链路依赖或 overrides/resolutions 修复。

 - 问题6：只有生产环境才出现的 bug（压缩/Tree-shaking/条件编译相关），你会如何验证与修复
 回答：用生产构建在本地/预发复现，开启 sourcemap 并确保产物可定位；逐步关闭 minify 或切换压缩器定位；检查 define/环境变量、dead code elimination 与 sideEffects 标记。修复后灰度验证并准备入口回滚与开关止血方案。

 - 问题7：接口偶发超时/失败导致页面状态错乱，你会如何设计重试、超时、幂等与状态回收
 回答：请求层统一超时（AbortController）与可取消；幂等写操作用幂等键，重试用指数退避并限次；UI 用状态机建模避免“半成功”脏状态；参数变化或路由切换时取消旧请求并回收状态。

 - 问题8：出现 “Invalid hook call” 或渲染异常，你会如何快速判断是否多份 React/依赖重复/打包问题
 回答：检查依赖树是否多份 React/react-dom（monorepo/link/打包产物常见）；确保组件库把 React 设为 peerDependency 且未打进包；模块联邦确保 React 单例共享且版本满足约束；用构建分析与运行时校验来源路径验证修复生效。

 - 问题9：SSR 场景 hydration mismatch 只在特定用户出现，你会如何抓取信息并定位到触发条件
 回答：采集该用户 UA/语言时区/AB 开关/首屏数据版本与服务端渲染参数；对比服务端 HTML 与客户端首屏渲染（采样上报关键节点）。重点排查时间/随机数、媒体查询分支、首屏数据不一致与第三方改写 DOM，修复后做针对性回归。

 - 问题10：缓存导致数据不一致（CDN/浏览器/Service Worker/客户端缓存），你会如何定位是哪一层并修复
 回答：分层绕过定位：禁用 SW/加 no-cache 验证是否仍复现；看响应头与 CDN 命中（Age/X-Cache）检查 Vary 与缓存键；检查 SW 的 cache name/version 与更新策略；客户端缓存按 key/tag 失效。修复以入口短缓存+资源 hash 长缓存为基础，SW 做版本化与可控更新，并提供紧急清缓存/回滚开关。

## 方向11：协作、影响力与技术负责人能力
 - 问题1：需求不清晰时你会如何推进：你会问哪些问题来定义范围、验收标准与风险
 回答：明确目标与用户（谁用、解决什么、成功指标），补齐关键场景与边界（异常/权限/兼容/性能），形成可验收标准与数据口径；识别依赖与风险并给出方案与备选，推动对齐后再开工。

 - 问题2：你如何做技术选型与决策记录；当团队意见不一致时你如何达成共识并承担结果
 回答：用 ADR 记录：背景、目标、备选、评估维度（成本/风险/性能/可维护性/人才）、PoC 结论与决策。分歧时用数据与约束对齐；当两条路线都可行但风险不确定时，用小范围试点（低风险业务/灰度租户）获取真实数据；落地后用指标复盘并在需要时纠偏。

 - 问题3：面对“必须快速交付但技术债巨大”的项目，你如何制定分阶段方案并控制线上风险
 回答：先交付最小闭环（MVP）并把风险收敛到可控范围（feature flag、灰度、回滚）；并行建立技术债清单按影响度排序，规划“止血→优化→重构”阶段目标，把关键债务纳入迭代与验收。

 - 问题4：你如何组织代码评审：评审重点是什么，如何避免流于形式，如何提升团队整体产出
 回答：评审聚焦正确性、安全、性能、可维护性与 API 设计；配合自动化门禁与小 PR；把重复问题工具化（lint/模板/脚手架），用评审准则与复盘提升团队共识与产出质量。

 - 问题5：你如何带教与培养新人：能力模型、成长路径、任务拆解与反馈机制怎么设计
 回答：建立能力模型与分级标准，为新人制定阶段目标与可验证任务；通过结对、代码走读、复盘与定期 1:1 反馈形成闭环，让新人逐步承担更高不确定性与更大范围的 owner 责任。

 - 问题6：线上事故发生后你如何主导复盘：如何界定问题、形成行动项并确保真正落地
 回答：先止血与恢复服务，再做无责复盘：时间线、影响面、根因（技术/流程/监控/发布）、为什么未提前发现。行动项必须可执行（owner/截止/验收），纳入迭代跟踪直至关闭。

 - 问题7：你如何做项目排期与风险管理：依赖、关键路径、缓冲、范围变更如何处理
 回答：拆里程碑与关键路径，显式列依赖与前置条件；为高风险环节留缓冲并设触发条件；范围变更走“影响评估→取舍→重新承诺”流程，对外沟通透明并确保可回滚。

 - 问题8：当产品/运营/后端与前端目标冲突时你如何沟通与协调；你会如何量化取舍
 回答：用共同指标对齐（转化、留存、错误率、性能、成本），把方案拆成可量化 trade-off（收益、风险、工期、长期成本）。优先提出可灰度验证的折中方案，对不可兼得的决策给出责任边界与回滚预案。

 - 问题9：你如何设计面试评估标准：能力维度、打分 rubric、反偏见措施如何做
 回答：定义能力维度（基础、工程、架构、协作、owner）与分级 rubric（行为证据/正反例），结构化面试与统一题库校准面试官；多面交叉验证与定期复盘减少印象分与偏见。

 - 问题10：你如何制定团队技术路线与年度规划：指标、投入产出、里程碑与复盘机制如何设计
 回答：从业务目标拆解技术指标（稳定性/性能/效率/质量/成本），按 ROI 排序投入并设里程碑与可观测指标；季度复盘目标达成与投入产出，基于数据调整路线并沉淀可复用的平台化能力。

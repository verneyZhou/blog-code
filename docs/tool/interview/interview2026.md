---
title: interview2026
date: 2026-03-22 16:40:09
permalink: false
article: false
categories:
  - tool
  - interview
tags:
  - 
---

## 问题收集



————————

### 秒杀页面渲染架构。

秒杀页的核心矛盾是： `极端流量下，首屏必须稳、交互必须快、下单链路必须准且可降级` 。渲染架构要围绕这三点设计。

秒杀场景的核心痛点是`瞬时高并发 、 状态强一致性要求（库存/时间） 以及 极端的性能考验` 。作为架构师，我会从整体的战略层面`自顶向下`进行设计。


**第一步：宏观架构设计（动静分离与分层渲染）**

秒杀页面的流量洪峰非常大，所以基础原则是 绝不让非核心请求打到服务器 。

- `静态骨架前置` ：我会采用 SSG（静态站点生成）或把首屏 HTML/CSS 和基础骨架屏直接推到 CDN 边缘节点。用户瞬间涌入时，哪怕接口全挂了，页面也是秒开的，不会白屏。
- `动态数据分级（CSR）` ：页面加载后，把数据请求分为 P0（用户秒杀资格、核心商品状态）和 P1（评论、推荐商品）。P0 数据优先请求，P1 数据延后或懒加载。


**第二步：微观落地**

1. 关于虚拟列表（解决 DOM 渲染瓶颈）
- 我会用，但看场景 ：如果这是一个大型双11会场，商品有几百上千个，虚拟列表是必选项。我会只渲染可视区域及其上下各一屏的 DOM 节点。
- 架构师的思考（避坑） ：虚拟列表最大的坑是 动态高度 。秒杀卡片可能有促销标签、多行标题，高度不固定会导致滚动计算抖动。我会设计一个 `高度缓存池（Height Cache） ，或者在规范层面推动 UI 将卡片高度统一`。如果只有二三十个商品，我反而不会用虚拟列表，而是用普通的 IntersectionObserver 做图片懒加载，减少计算开销。

2. 关于预加载（解决链路阻塞，抢占时间）
- `关键资源预加载（Preload/Preconnect）` ：在 HTML 头部，我会对核心的 API 域名做 preconnect ，对首屏的核心大图（比如秒杀主视觉）做 preload ，确保 LCP（最大内容绘制）指标优秀。
- `核心链路预获取（Prefetch）` ：当用户滚动到秒杀商品附近，或者鼠标 Hover 到商品区域时，我会利用网络空闲时间提前 prefetch 下单页面的静态资源 或 规格选择弹窗的 JS Bundle 。这样当用户点击“立即抢购”时，没有任何资源加载的等待感。

3. 关于防抖与节流（解决请求风暴与重复交互）
- 防抖（Debounce）与节流（Throttle）的精准使用 ：对于页面滚动监听、倒计时计算，我会用 节流 和 requestAnimationFrame ，避免频繁触发重排；对于搜索或条件筛选，我会用 防抖 。
- 架构师的思考（核心点） ： 在最核心的“点击秒杀/下单”按钮上，我绝对不会单纯使用防抖。 因为防抖可能会吃掉用户在网络卡顿时的合法重试。对于`下单按钮`，我会采用 `状态机锁（isSubmitting） + 前端生成幂等 Key` 的方案。点击瞬间按钮进入 Loading 置灰态，直到接口返回（或超时）才释放；同时携带唯一 Key 防止后端产生重复订单。


**第三步：局部状态管理与渲染隔离**

秒杀页有一个特殊的元素： `倒计时` 和 `库存进度条` 。

- 如果每一秒的倒计时都引起整个组件树的 Diff，性能会非常差。
- 我会将倒计时和库存组件做成 孤岛（Islands） 。倒计时的更新利用原生 DOM API 直接修改 innerText ，或者将它封装成极小的独立组件，确保高频的数据变化（每秒 tick） 绝对不会引发外层列表或页面的重渲染 。同时，前端时间会与服务端时间做一次校准，计算出 Offset，之后依赖本地时钟计算，不依赖接口轮询。


**第四步：高可用与降级兜底方案（安全网）**

最后，作为架构师，我必须考虑到系统扛不住的情况：

- `接口超时兜底` ：如果核心接口 3 秒不返回，前端自动切入“排队中”的虚拟状态，安抚用户情绪，同时启动退避算法（Exponential Backoff）进行轻量级轮询。
- `局部降级` ：如果图片 CDN 挂了，显示默认图；如果推荐接口挂了，直接隐藏推荐区块。核心原则是： `任何非核心组件的崩溃，都不能影响用户点击“秒杀”按钮`。


**总结一下**：我会将虚拟列表用于长列表的 DOM 减负，将预加载用于关键链路的体验加速，将防抖/节流/状态锁用于交互与请求的管控。但这三者只是手段，真正的架构基石在于 动静分离、渲染隔离以及完善的降级策略 。这就是我设计秒杀页面的整体思路。




#### 状态机锁（isSubmitting） + 前端生成幂等 Key 的方案如何设计？

**幂等（Idempotent）** 

> 幂等是指一个操作执行一次和执行多次后产生的效果或者影响是一样的。

- 常见实现方法：
1. Token机制 - 服务端生成token，客户端携带token请求
2. 防重表 - 创建专门的幂等表存储请求ID
3. 状态机 - 基于业务状态判断（如订单状态）
4. 唯一约束 - 数据库唯一索引/主键约束
5. 分布式锁 - 加锁确保同一请求只处理一次

> **应用场景：** 订单创建、支付回调、表单提交等需要防止重复操作的业务。

> 核心口诀："一锁、二判、三更新" - `先加锁，再幂等判断，最后更新数据`。


锁不是简单的防抖，而是 `in-flight gate（inflightRef） + 显式状态机（state.phase）`。同一次用户意图（key）内的重试复用同 key，服务端可以做到“只产出一次订单”。


**设计目标**
- `防重复提交`：一次点击只产生一次有效下单，无论用户连点、页面卡顿或重试。
- `可重试且无副作用`：弱网/超时下允许重试，但不产生重复订单。
- `多端一致`：同一用户在多标签页或多设备的重复提交也能被去重。
- `清晰反馈`：UI 有明确的进行中、成功、失败、可重试、已结束状态。


**客户端状态机**
- 核心状态：`Idle → Submitting → Success | Failed | Cancelled | Queued`
- 事件驱动：`clickBuy, networkError, timeout, serverReject, serverAccept, cancel, retry`
- 关键约束：
  - Submitting 为“锁态”，期间屏蔽重复点击、变更规格等会影响订单参数的操作
  - 同一次购买尝试的所有重试共享同一个幂等 Key
  - 成功或最终失败后释放锁；可重试失败保留锁外状态但允许复用 Key


**状态机示例**

``` ts
// 购买状态机
type PurchaseState =
  | { type: 'Idle' }
  | { type: 'Submitting'; key: string; attempt: number }
  | { type: 'Success'; orderId: string }
  | { type: 'Failed'; reason: string; retryable: boolean }
  | { type: 'Cancelled' };

// 购买事件
type Event =
  | { type: 'CLICK_BUY' }
  | { type: 'SERVER_ACCEPT'; orderId: string }
  | { type: 'SERVER_REJECT'; reason: string; retryable: boolean }
  | { type: 'TIMEOUT' }
  | { type: 'NETWORK_ERROR'; reason: string }
  | { type: 'RETRY' }
  | { type: 'CANCEL' };

// 购买状态机 reducer
function reducer(s: PurchaseState, e: Event): PurchaseState {
  switch (s.type) {
    case 'Idle':
      if (e.type === 'CLICK_BUY') return { type: 'Submitting', key: '', attempt: 0 };
      return s;
    case 'Submitting':
      if (e.type === 'SERVER_ACCEPT') return { type: 'Success', orderId: e.orderId };
      if (e.type === 'SERVER_REJECT') return { type: 'Failed', reason: e.reason, retryable: e.retryable };
      if (e.type === 'TIMEOUT') return { type: 'Failed', reason: 'timeout', retryable: true };
      if (e.type === 'NETWORK_ERROR') return { type: 'Failed', reason: e.reason, retryable: true };
      if (e.type === 'CANCEL') return { type: 'Cancelled' };
      return s;
    case 'Failed':
      if (e.type === 'RETRY' && s.retryable) return { type: 'Submitting', key: '', attempt: 0 };
      return s;
    default:
      return s;
  }
}
```



**幂等 Key 设计**

- 语义：`标识一次“用户意图”的购买尝试，所有重试共享同一个 Key`
- 构成建议：
  - 固定因子：userId、skuId、clientEpochBucket（如按 1s/3s 取整，抵御时钟微抖）
  - 随机因子：高熵 nonce（crypto.getRandomValues/UUIDv4）
  - 组合后做短哈希（减少长度，避免泄露用户信息）
- 生命周期：`生成于首次点击；在 retry 内复用；成功/最终失败后作废`
- 作用域：建议作用域为“用户+SKU+Key”，避免跨用户污染
- 安全性：`前端不能签名，敏感校验由服务端完成`；必要时引入“购买令牌”（服务器颁发、短 TTL、防伪）
``` ts
function createIdempotencyKey(userId: string, skuId: string) {
  const now = Date.now(); // 毫秒级时间戳
  const bucket = Math.floor(now / 1000); // 1s 桶
  const nonce = crypto.getRandomValues(new Uint8Array(16)); // 16字节随机数
  const nonceB64 = btoa(String.fromCharCode(...nonce));
  const raw = `${userId}:${skuId}:${bucket}:${nonceB64}`;
  const digest = sha256(raw).slice(0, 24); // 短哈希
  return `IK.${digest}`;
}
```

**请求管道与锁协作**

- 点击流程：
  - Idle → 生成 key → 进入 Submitting（锁定按钮、禁用规格变更）
  - 发起请求：`附加 Idempotency-Key，可选附加 Purchase-Token`
  - 成功：Success；失败（可重试）：Failed(retryable=true)；失败（不可重试）：Failed(false)

- 重试策略：
  - 可重试错误（5xx、超时、网络错误）：复用同一 key 重试
  - 不可重试错误（库存不足、资格不符）：不复用 key，直接 Failed(false)

- 并发处理：
  - 同一尝试仅允许一个 in-flight；使用 AbortController 取消旧请求或忽略后发起
  - 多标签页可通过 BroadcastChannel 同步“正在下单”的状态和幂等 Key，避免跨页重复

``` ts
async function submitPurchase(params: { userId: string; skuId: string; qty: number }, state: PurchaseState, setState: (s: PurchaseState) => void) {
  if (state.type === 'Submitting') return;
  const key = createIdempotencyKey(params.userId, params.skuId);
  const ctrl = new AbortController();
  setState({ type: 'Submitting', key, attempt: 1 });
  try {
    const res = await fetch('/api/purchase', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      setState({ type: 'Success', orderId: data.orderId });
      return;
    }
    if (res.status === 409) {
      const hint = await res.json(); // 服务器返回同 Key 的既有结果
      if (hint.final) setState({ type: 'Failed', reason: hint.reason, retryable: false });
      else setState({ type: 'Failed', reason: 'in_progress', retryable: true });
      return;
    }
    setState({ type: 'Failed', reason: `http_${res.status}`, retryable: res.status >= 500 });
  } catch (e) {
    setState({ type: 'Failed', reason: 'network', retryable: true });
  }
}
```

**服务端协作**

- 幂等存储：
  - Key → `{ status: IN_PROGRESS | SUCCEEDED | FAILED_FINAL | FAILED_RETRYABLE, result, ttl }`
  - 第一次见到 Key：写入 IN_PROGRESS 并加锁，处理结束更新为最终态
  - 重复 Key：直接返回已记录结果（SUCCEEDED 返回订单，FAILED_FINAL 返回拒因）

- TTL（Time To Live，生存时间） 与清理：5–15 分钟适配峰值；IN_PROGRESS 长时间无心跳时可转为 FAILED_RETRYABLE

- 作用域校验：Key 必须绑定 userId 与请求体一致性校验（防参数漂移）

- 购买令牌（可选）：`在会场页预先获取服务器签发的 token（绑定用户、SKU、限时），下单时连同 Key 提交，抵御伪造 Key 或参数篡改`

- 返回语义：
  - 409 In-Progress：提示客户端稍后重试或排队态
  - 200 Success：同 Key 再次请求也返回同一订单
  - 4xx Final Fail：资格/库存等业务拒绝，不可重试
  - 5xx Retryable：建议客户端保持同 Key 重试


**边界与异常处理**

- 时钟偏差：客户端仅用时钟分桶参与 Key，不以本地时间做业务裁决；倒计时用服务端校准 offset
- 多设备/多标签：广播当前尝试与 Key；后发起的实例直接走“幂等查询”避免重复创建
- 可取消：用户主动取消时，客户端进入 Cancelled；服务端不应以取消为“最终失败”覆盖同 Key 的已成功结果
- 可观测性：埋点 isSubmitting 持续时长、重试次数、幂等冲突率、重复订单率


**总结**

- 把“防抖”替换为“锁态 + 幂等”，兼顾可重试与一致性，避免吃掉合法点击
- 客户端与服务端各司其职：客户端保证一次尝试只产生一个 Key，服务端保证同 Key 只产生一个结果
- 行为可验证：状态机可单测，幂等语义可压测，遇到弱网/抖动也不会产生副作用


#### Q：如何处理前端通过AbortControlle取消请求，但接口已经到达服务器的情况？

前端通过 AbortController 取消请求，仅仅是掐断了浏览器等待和接收响应的通道，底层的 TCP 连接可能会断开，但只要 HTTP 请求的报文已经到达了网关/服务器，后端的业务逻辑（扣库存、创订单）大概率是会继续执行完毕的。

1. 在真实的秒杀或下单场景中，`对于 isSubmitting 状态， 前端 UI 通常是不提供“取消”按钮的`；直到接口返回成功、失败，或者超时。 AbortController 在交易链路中，更多是用来处理 页面卸载（组件销毁） 或者 极端超时 的兜底，而不是让用户主动点击取消。


2. `核心解法：幂等 Key 的真正威力（状态恢复）`
> 假设发生了 Abort（比如用户等得不耐烦刷新了页面，或者网络切换导致连接断开）：

- 后端状态 ：后端默默把订单生成了，并把状态记录在 Redis/DB 中： IK-123 -> Success(OrderId: 888) 。
- 前端状态 ：前端触发了 catch 或者 abort 分支，状态变成了 Failed / Cancelled 。
- 用户重试 ：`当用户再次点击购买时， 前端的状态机机制发挥作用，它发现上一次的请求是因为网络断开/超时/Abort 失败的，它会复用同一个 IK-123 发起重试`。
- 后端拦截 ：后端收到 IK-123 ，去 Redis 一查，发现这个 Key 刚才已经成功生成了订单 888 。后端 不会 再次扣库存，而是直接返回 200 OK 和 OrderId: 888 。
- 前端恢复 ：前端收到成功响应，纠正了之前的错误状态，直接跳转到收银台。

总结：请求被 Abort 没关系，只要幂等 Key 机制存在，下一次重试就是一次`状态同步和纠偏`的过程。


3. 实现真正的取消订单逻辑：
> 如果业务场景确实允许用户中途反悔（比如弹出一个“正在排队”的框，框上有个“放弃排队”按钮），那么前端 绝对不能 仅仅调用 AbortController.abort() 就完事了。

- 前端动作 ：
  - 调用 abort() 停止当前长连接/轮询。
  - 立即异步发送一个 取消指令 给后端： POST /api/purchase/cancel { key: 'IK-123' } 。
- 后端动作 ：后端收到取消指令，根据 IK-123 去查找状态：
  - 还没处理到 ：直接把 IK-123 标记为已废弃，后续即使处理线程拿到了，也直接丢弃。
  - 正在处理中 ：尝试中断处理逻辑（比较难，通常看具体语言和框架支持）。
  - 已经处理完（订单已生成） ：走 逆向关单流程 ，把生成的订单标记为“用户主动取消”，并释放库存。



#### Q: 秒杀中的倒计时实现具体设计方案是什么，有哪些考虑？

> 在秒杀场景中，倒计时绝不仅是“写个 setInterval 每秒减 1”这么简单。作为架构师，倒计时设计的核心要解决四个致命问题： `时间绝对准确（防篡改与同步）、防浏览器后台休眠（时间漂移）、渲染性能（防全局重绘）、以及“零点瞬间”的请求风暴（雪崩）`。

**时间同步设计：前端 NTP 补偿算法（计算 Offset）**

> 用户的本地时钟不准，甚至可以被恶意篡改。如果直接用本地时间判断秒杀是否开始，会导致严重的业务漏洞。如果每秒去向服务端请求当前时间，又会压垮服务器。 

方案：`只在页面初始化时对齐一次时间，计算出“本地与服务端的差值（Offset）”，之后完全依赖本地时钟推算`。

为了消除网络传输带来的误差（RTT，Round Trip Time），需采用类似 NTP（网络时间协议）的补偿算法：
1. 客户端发起请求前记录时间 T1 。
2. 收到服务端响应（包含服务端发出响应时的精准时间 T_server ），记录当前客户端时间 T2 。
3. 假设网络一来一回耗时是对称的，那么单程耗时为 (T2 - T1) / 2 。
4. `真实的服务端当前时间` 推算为： T_server + (T2 - T1) / 2 。
5. 时间差（Offset） = `真实服务端当前时间 - 客户端当前时间 T2` 。
> 后续公式 ：任何时候需要获取当前准确时间，只需调用 `Date.now() + Offset`。


**防时间漂移设计：绝对值计算代替相对递减**

痛点 ：当用户把浏览器切到后台，或者切换 Tab 页时，浏览器为了省电，会把 setInterval 或 setTimeout 的执行频率强制降频（甚至休眠）。

如果你的逻辑是 timeLeft -= 1000 ，切回前台时倒计时会严重滞后。 

方案：`永远使用“目标时间”减去“校准后的当前绝对时间”`。 哪怕浏览器休眠了 1 分钟，切回前台时，下一次 Tick 执行 TargetTime - (Date.now() + Offset) 依然能算出丝毫不差的剩余时间


**渲染性能设计：孤岛组件与原生 DOM 逃生舱**

痛点 ：如果是每秒级（甚至毫秒级）的更新，放在 React/Vue 的顶层组件会导致整个会场页面每秒发生一次庞大的 Virtual DOM Diff，低端机直接卡死。

- 普通情况（单品详情页） ：封装一个极小的 `<Countdown />` 独立组件，把 Tick 的 State 严格限制在这个组件内部，实现`渲染隔离`。
- 极限情况（主会场有几百个秒杀商品列表） ：连局部 Virtual DOM Diff 都嫌慢。此时应当使用**“原生 DOM 逃生舱”**。向倒计时组件传入一个 ref ，`在 requestAnimationFrame 的回调中，直接使用原生 API ref.current.innerText = '00:15:30'` 。这样完全绕过了 React/Vue 的生命周期和 Diff 阶段，性能开销几乎为 0。


**防雪崩设计：零点瞬间的“随机打散”（Jitter）**
> jitter 只用于“失败后的重试退避/轮询间隔”，不用于“首发请求/抢购提交” 。

痛点 ：当倒计时归零的瞬间，假设有 100 万个用户停留在页面上，他们的前端代码会同时触发`倒计时结束 -> 刷新接口获取购买按钮/抢夺库存`的逻辑。这会导致 100 万个并发请求在同一毫秒砸向网关，这就是经典的“惊群效应（Thundering Herd）”。 

方案 ： 引入`随机抖动（Jitter）`。在倒计时归零触发“页面状态刷新/开抢状态拉取/按钮可用性确认”等**读请求**前，强行加入 `Math.random() * 1500` 毫秒的随机延迟。这能把原本集中在 1 毫秒内的 100 万并发，平滑地打散到 1.5 秒内，极大地保护后端网关和微服务。

关键点：
- 这类 jitter 不能用于“下单/锁库存/提交抢购”等**写请求**，否则会把“用户的竞争”变成“客户端随机数的竞争”，公平性不可解释。
- 秒杀的公平性必须由服务端定义并落地：例如发放抢购资格 Token（有 TTL）或进入排队队列，最终按服务端接收时间/排队号/抽签结果裁决；而不是按“谁先刷到按钮/谁先发起一次查询”裁决。
- UI 层面不要“偷偷延迟提交”，可以明示“系统繁忙，正在加载开抢状态/排队中…”，把随机打散限定在读侧（或失败重试/轮询）来换取系统稳定性。

``` tsx
// 手写高阶的倒计时 Hook (React 示例)
/**
 * 倒计时 Hook，支持时间同步、防时间漂移、渲染隔离、防雪崩（Jitter）
 * @param targetTime 秒杀开始的绝对时间戳 (ms)
 * @param serverOffset (服务端时间 - 本地时间) 差值
 * @param onZero 倒计时归零的回调
 * @param jitterMax 零点抖动最大值(ms)，防雪崩
 */
import { useEffect, useRef, useState } from 'react';

interface UseCountdownOptions {
  targetTime: number; // 秒杀开始的绝对时间戳 (ms)
  serverOffset: number; // 之前算好的 (服务端时间 - 本地时间) 差值
  onZero?: () => void; // 归零时的回调
  jitterMax?: number; // 零点抖动最大值(ms)，防雪崩
}

export function useCountdown({
  targetTime,
  serverOffset,
  onZero,
  jitterMax = 1000,
}: UseCountdownOptions) {
  // 仅对外暴露格式化后的字符串，避免暴露毫秒导致外部频繁渲染
  const [timeStr, setTimeStr] = useState('');
  const [isEnded, setIsEnded] = useState(false);
  
  const timerRef = useRef<number>();
  const onZeroRef = useRef(onZero);
  onZeroRef.current = onZero;

  useEffect(() => {
    let hasTriggeredZero = false;

    const tick = () => {
      // 1. 绝对时间推算：当前准确的服务器时间
      const nowServerTime = Date.now() + serverOffset;
      // 2. 剩余时间计算 (不能小于0)
      const remainMs = Math.max(0, targetTime - nowServerTime);

      if (remainMs === 0) {
        if (!hasTriggeredZero) {
          hasTriggeredZero = true;
          setIsEnded(true);
          setTimeStr('00:00:00');
          
          // 3. 防雪崩：随机延迟触发回调 (Jitter)
          const delay = Math.random() * jitterMax;
          setTimeout(() => {
            onZeroRef.current?.();
          }, delay);
        }
        return; // 结束 Tick
      }

      // 4. 格式化并更新状态 (只在秒数变化时才可能触发渲染，但这里是字符串，React会自动bailout相同值的渲染)
      const totalSeconds = Math.floor(remainMs / 1000);
      const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const s = String(totalSeconds % 60).padStart(2, '0');
      
      setTimeStr(`${h}:${m}:${s}`);

      // 使用 setTimeout 而不是 setInterval，便于随时中止，且下一次调用总是基于绝对时间计算
      // 优化：精准对齐下一个整数秒，避免 1000ms 带来的微小漂移导致跳秒
      const msToNextSecond = 1000 - (remainMs % 1000);
      timerRef.current = window.setTimeout(tick, msToNextSecond);
    };

    tick(); // 立即执行第一次

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [targetTime, serverOffset, jitterMax]);

  return { timeStr, isEnded };
}
```


在我的设计里，倒计时不仅是一个 UI 效果，它承担着 时间基准、性能守护和流量打散 三大职责。我`利用 Offset 补偿网络延迟 ，用 绝对差值抵抗浏览器休眠 ，用 原生 DOM 或隔离的 Hook 避免重绘 ，最后在重试时加上 Jitter 保护后端架构` 。这套方案不仅在前端跑得极其流畅，也从源头上减轻了整个微服务集群的压力。




### 千万级SKU在DOM里，快速筛选卡死怎么办？

千万级数据绝对不能直接塞入 DOM 中，浏览器会直接崩溃（内存溢出或渲染卡死）。

1. 如果真的把千万级 SKU 渲染成 DOM，哪怕每个 SKU 只有 10 个节点，也是 1 亿个 DOM 节点，这`远远超出了浏览器 V8 引擎的内存限制（通常单页应用在 1.5GB 左右就会 OOM）和渲染引擎的承受能力`。
2. “筛选卡死”的根本原因在于：对 1000 万长度的数组执行 .filter() 或模糊匹配，这是一个`长耗时的同步 CPU 计算任务`。JS 是单线程的，长任务（Long Task）会霸占主线程，导致浏览器无法执行 GUI 渲染和响应用户点击，从而表现为“卡死”。


**Q：为什么不推荐“离屏 Canvas 渲染”？**
- 失去 DOM 特性 ：SKU 列表通常需要复杂的 CSS 样式、Hover 交互、图片懒加载、文字选中复制（Copy）、以及屏幕阅读器支持（无障碍 a11y）。`一旦用 Canvas 绘制，这些浏览器原生能力将全部丢失，你需要手动用 JS 重新实现一套“UI 渲染引擎和事件代理”，成本极高且体验生硬`。
- 适用场景偏差 ：离屏 Canvas（结合 WebGL）真正发挥威力的是在`飞书表格（海量单元格）、K线图、或海量点阵的可视化大屏`中，而不是常规的图文电商列表。


1. `渲染优化：虚拟列表（Virtual Scroll / Windowing）`
- 核心思想 ：无论数据有 1000 万条还是 1 亿条，DOM 树中始终 只渲染可视区域（Viewport）内的那几十个 DOM 节点 （加上下少量的 Buffer 预渲染节点）。
- 实现机制 ：通过计算滚动条的 scrollTop ，动态截取千万级数组中的一小段数据（如 data.slice(startIndex, endIndex) ），并利用 CSS transform 或 absolute 定位将它们推到正确的可视位置。


2. `计算优化：Web Worker（架构师首选方案）`
- 原理 ：开辟一个独立的后台线程（Web Worker）。将 1000 万条 SKU 数据存放在 Worker 内存中。主线程只负责接收用户的输入（如搜索词），通过 postMessage 传给 Worker。Worker 在后台狂奔执行全量过滤，算完后把 匹配结果的 ID 数组或切片数据 传回主线程。
- 优势 ：主线程实现 0 阻塞 ，哪怕后台算得再慢，UI 依然丝滑，可以正常播放 Loading 动画。


3. `计算优化：时间切片（Time Slicing）`
- 原理 ：如果因为某些历史包袱无法使用 Worker，就必须用到 时间切片 。`将千万级数据的遍历拆分成 N 个小任务（比如每次只遍历 1 万条），利用 requestIdleCallback 、 setTimeout 或 MessageChannel ，在浏览器每一帧的空闲时间（Idle Time）去执行`。
- 优势 ：把一个需要 2 秒的超级长任务，切碎成 100 个 20 毫秒的短任务，把主线程的控制权间歇性地交还给浏览器，避免页面假死。
- (React Fiber 的并发模式底层就是时间切片的极致应用) 。


4. `数据层优化：检索算法与内存优化（降维打击）`
哪怕放到了 Web Worker 里，千万级数组的线性遍历 .filter() 依然可能需要几百毫秒甚至数秒。想要实现“毫秒级快速筛选”，必须从数据结构上下功夫：
- 前缀树（Trie Tree）或 倒排索引（Inverted Index） ：
  - `不要每次都暴力遍历字符串。在数据初始化时，构建搜索词的倒排索引（类似 ElasticSearch 的底层原理）。用户输入关键词时，直接命中索引`，时间复杂度从 O(n) 骤降到 O(1) 或 O(log n)。
- WebAssembly (WASM) 加速 ：
  - JS 引擎处理超大数组和密集型计算会触发频繁的垃圾回收（GC）。可以将核心的搜索和排序算法用 Rust/C++ 编写，编译为 WASM。前端通过 JS 调用 WASM 接口，计算性能可以提升几倍到十几倍，且内存占用更小。
- 内存优化 (SharedArrayBuffer) ：
  - 千万级对象数组（如 [{id: 1, name: '...'}, ...] ）在 V8 中占用极大的堆内存。`可以使用 TypedArray （类型化数组）将数据展平，并结合 SharedArrayBuffer 在主线程和 Worker 之间共享这块内存`，避免 postMessage 传递大数据时的序列化/反序列化（克隆）开销。


**前端处理千万级数据本身属于伪需求或极端边缘场景，真实的业务架构中，千万级的 SKU 筛选 绝对不应该在客户端（浏览器）完成 。**



### 支付排队：10万用户点付款，前端怎么防请求雪崩？


- `防重复点击`
  - 点击后立即 disable + Loading + 明确文案（排队中/处理中/已提交），防止用户连点、回退重进再次点
  - `同一个订单/同一个支付方式：本地做 in-flight 去重（同 key 只允许一个请求在飞）`
  - 切换路由/重复打开页面：用本地持久化（localStorage/IndexedDB）记录 `orderId -> payAttemptId`，避免刷新后再提交


- `客户端限流 + 队列`（把“瞬时 10 万并发”削成“平滑流量”）
  - `全局并发上限+ QPS 上限`，其余请求进入队列排队
  - 队列要支持取消（用户关闭弹窗/返回）、超时（避免无限挂起）、优先级（确认支付 > 查询状态）

- `双 Token 防重`（把“重复提交”变成“幂等”）
  - `业务 Token`（一次性支付凭证）：从“确认订单/创建支付”接口拿到，由后端签名/绑定用户与订单，过期即失效
  - `幂等 Token（Idempotency-Key）`：前端生成 uuid，每次提交支付时带上，后端以 `(userId, orderId, idempotencyKey)` 做幂等落库/去重

- `重试策略`
  - `对“可重试且幂等”的接口重试`（如排队入队/查询状态），`支付提交（扣款）通常不自动重试`
  - `指数退避 + 抖动（jitter）`，并尊重后端的 Retry-After；遇到 429/503 直接走降级/提示而不是狂刷
  > 指数退避（Exponential Backoff）是一种“失败后不要立刻重试，而是把下一次重试的等待时间按指数级变长”的重试策略，用来避免请求失败时大量客户端同时狂刷把后端压垮（雪崩/二次雪崩）。
  - 前端熔断：短时间连续失败则暂停发起新请求，优先引导用户去“查询订单状态”

- `支付排队链路`
  - 点付款只做 `/queue/join`：返回 queueId/排队位置/预计时间
  - 用 SSE/WebSocket/长轮询订阅 `/queue/status`：服务端“叫号”后再触发一次 `/pay/commit`
  - 任意异常都回落到 `/order/status` 的最终态查询，UI 以订单状态为准（处理中/成功/失败）


#### js手写带优先级的请求队列

``` js
class RequestQueue {
  constructor({ max = 2 } = {}) {
    this.max = max;
    this.running = 0;
    this.q = []; // { p, i, fn, resolve, reject, signal }
    this._i = 0;
  }

    // 添加任务
  add(fn, { priority = 0, signal } = {}) {
    return new Promise((resolve, reject) => {
      const task = { p: priority, i: this._i++, fn, resolve, reject, signal };
      this.q.push(task);
      this.q.sort((a, b) => (b.p - a.p) || (a.i - b.i)); // 高优先级先出队，同优先级先进先出
      this.run();
    });
  }

  // 从队列中取出任务执行
  run() {
    while (this.running < this.max && this.q.length) {
      const t = this.q.shift();
      if (t.signal?.aborted) {
        t.reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
        continue;
      }

      this.running++;
      Promise.resolve()
        .then(() => t.fn())
        .then(t.resolve, t.reject)
        .finally(() => {
          this.running--;
          this.run();
        });
    }
  }
}

// ===== 用法 =====
const rq = new RequestQueue({ max: 2 });

// 高优先级（比如“确认支付”）
rq.add(() => fetch("/pay/commit"), { priority: 10 });

// 低优先级（比如“查询状态”）
rq.add(() => fetch("/order/status"), { priority: 1 });
```


#### 支付流程状态机。

把“支付”当成一个 `可回放、可恢复、以订单最终状态为准` 的有限状态机（FSM），前端只负责驱动流程与展示，中间态一律可通过“查询订单状态”收敛。

``` js
// 状态定义（建议最小但够用）
- IDLE ：未发起
- CREATING ：创建支付意图/支付单（拿到 payId、token、幂等键）
- QUEUEING ：高峰期排队（拿 queueId/position/eta）
- AWAITING_CHANNEL ：等待拉起收银台/三方（H5/APP/小程序/SDK）
- PROCESSING ：已提交扣款请求，结果未决
- SUCCESS ：成功（终态）
- FAILED ：失败（终态，可重试从 CREATING 重新来）
- CANCELLED ：用户取消（终态）
- UNKNOWN ：超时/网络异常导致前端不确定（必须走对账查询来收敛）

// 关键事件（触发迁移）
- 用户事件： CLICK_PAY 、 CANCEL 、 RETRY
- 接口事件： CREATE_OK/FAIL 、 QUEUE_OK/UPDATE/FAIL 、 COMMIT_OK/FAIL
- 通道事件： CHANNEL_OPENED 、 CHANNEL_RETURNED （从收银台返回）
- 兜底事件： POLL_STATUS_OK(SUCCESS|FAILED|PROCESSING) 、 TIMEOUT 、 OFFLINE/ONLINE

// 核心迁移（面试时讲清主链路）
- IDLE --CLICK_PAY--> CREATING
- CREATING --CREATE_OK--> (需要排队? QUEUEING : AWAITING_CHANNEL)
- QUEUEING --CALLED_NUMBER--> AWAITING_CHANNEL
- AWAITING_CHANNEL --CHANNEL_OPENED/COMMIT--> PROCESSING
- PROCESSING --POLL_STATUS_OK(SUCCESS)--> SUCCESS
- PROCESSING --POLL_STATUS_OK(FAILED)--> FAILED
- PROCESSING --TIMEOUT/NETWORK--> UNKNOWN --POLL_STATUS_OK(...)--> SUCCESS/FAILED/PROCESSING
- 任意非终态 --CANCEL--> CANCELLED
```

我会把支付流程设计成`一个“以订单最终状态为准”的有限状态机`。核心目标是三点：
1. 用户怎么点都只能提交一次（幂等、防重复）
2. 过程可恢复（刷新/杀进程回来还能继续）
3. 任何异常都能收敛到最终态（以服务端订单状态为准，不靠前端猜）

`防重复（幂等）—可恢复（回放）—能收敛（查单）`

`创建单 →（可选）排队 → 提交扣款 → 查订单状态收敛到终态`

状态我会尽量收敛成几类：`未发起、创建支付、排队/等待通道、处理中、成功/失败/取消`，以及一个`不确定态 UNKNOWN`。
1. 用户点击付款后先进入 CREATING，通过创建支付拿到 payId/一次性 token/幂等 key；高峰期如果需要排队进入 QUEUEING，被叫号后再拉起收银台或提交扣款进入 PROCESSING。
2. PROCESSING 期间不以接口返回为最终结果，而是持续通过查询订单状态（轮询/SSE/WS）把状态收敛到 SUCCESS 或 FAILED。
3. 如果遇到超时、断网、回调没回来，统一落到 UNKNOWN，再走“查订单状态”对账，保证最终一致展示。

``` js
IDLE
  | clickPay
  v
CREATING  --createFail--> FAILED
  | createOk
  v
(needQueue?) ----yes----> QUEUEING --calledNumber--> AWAITING_CHANNEL
     | no                                  |
     +-------------------------------------+
                                           v
                                   AWAITING_CHANNEL
                                           | openChannel / commitPay
                                           v
                                      PROCESSING
                           +-----------+    | pollStatus=SUCCESS
                           |                v
                           |             SUCCESS (final)
      timeout/network/callbackLost
                           |
                           v
                        UNKNOWN
                           | pollStatus=FAILED
                           v
                        FAILED (final)

Any non-final state --cancel--> CANCELLED (final)
```



#### 支付成功但后端超时，怎么保证扣款状态与实际到账最终一致？

本地事务表+长轮询+UI兜底。

要保证“支付成功但后端超时”这种 不确定结果 最终一致，本质是： `支付提交接口必须幂等 + 后端要有可对账的事实记录 + 前端永远以订单最终状态为准收敛` 。

**后端怎么做：**
- `幂等提交` ： /pay/commit 带 Idempotency-Key （或 payAttemptId），后端以 (userId, orderId, key) 做去重；超时重试也不会重复扣款。
- `本地事务表/支付单表` ：先落库一条支付单（状态：INIT/PROCESSING/SUCCESS/FAILED），再去调第三方；无论接口是否超时，这条记录都能作为“事实源”。
- `异步确认` ：三方回调（Webhook/通知）或主动查询三方，更新支付单状态；必要时有定时任务补偿（扫 PROCESSING 太久的单去查单）。
- `对外状态查询接口 `： /order/status 或 /pay/status(payId) 返回单一真相（SUCCESS/FAILED/PROCESSING），给前端收敛。

**前端怎么做：**
- `超时不判失败`：接口超时一律进入 UNKNOWN/PROCESSING 展示“处理中”，提供“继续等待/返回订单页”。
- `查单收敛`：用轮询/SSE/WS 查 /order/status ，直到 SUCCESS/FAILED 或达到超时阈值（仍显示处理中 + 可手动刷新）。
- `防二次提交` ：同一订单同一 payAttempt 在飞期间禁用按钮；即便用户刷新，也用本地保存的 payAttemptId 继续查单，不再重复 commit。
- `兜底原则` ：页面展示永远以查到的订单状态为准；支付结果页可支持“稍后到账/对账中”的中间态。

一句话面试总结： `提交幂等 + 后端有支付单事实源 + 异步回调/补偿对账 + 前端超时只认处理中，靠查单收敛最终态。`



#### 支付流程中的幂等策略

- `幂等键（Idempotency-Key / payAttemptId）` ：解决“同一次支付尝试重复提交/超时重试”只算一次
- `支付 token（一次性业务凭证）` ：解决“请求是否合法/参数是否被篡改/是否过期/是否绑定用户订单渠道”

前端生成，后端裁决：
- 生成时机：`用户点击付款后、调用 /pay/create 之前`，前端生成 attemptId（uuid）。
- 绑定范围：一次支付尝试（同 orderId + 同渠道）；刷新/重试复用同一 attemptId；用户重试“重新支付”则生成新键。
- 存储方式：localStorage/IndexedDB 中记录 orderId -> attemptId ，防止刷新丢失。
- 传递方式：作为请求头传给后端，例如 X-Idempotency-Key: attemptId ；必要时也放在请求体。
- 使用位置：至少用于 /pay/commit （扣款提交）；也可以用于 /pay/create 防止重复创建支付单。


**流程：**

1. 点击付款：前端先生成 attemptId（幂等键）

2. 创建支付意图（后端返回 payToken）
    - `POST：/pay/create, Header： X-Idempotency-Key: attemptId` （防止重复创建多张支付单）,Body： { orderId, channel }
    - `响应： { payId, payToken, expiresAt }`，payToken 由后端签名/加密，绑定 (userId, orderId, payId, amount, channel, attemptId, exp...)

3. 提交扣款（同时带 attemptId + payToken）
    - `POST /pay/commit, Header： X-Idempotency-Key: attemptId, Body： { payId, payToken }`
    - `后端先验证 payToken，再用 (userId, orderId, attemptId) 做幂等裁决`：已处理过就直接返回同一结果/同一受理号，避免重复扣款

4. 超时/断网怎么处理
    - 前端：不要换 attemptId；继续用同一个 attemptId 去 /pay/commit （如果允许重试）或直接 /order/status 查单
    - 后端：因为幂等键相同，重复请求只会命中同一笔支付尝试，不会二次扣款

一句话 ： attemptId 负责“这次尝试只算一次”， payToken 负责“这次尝试是合法且不可篡改的”；提交时两者一起带，后端先验 token 再做幂等落库/去重。


#### 为什么推荐前端生成幂等key？

- 在调用 /pay/create 之前就能生成 attemptId，首击即绑定一次支付尝试；即使接口超时或页面刷新，也能用同一个键继续流程，避免重复创建支付单
- 以 attemptId 做 in-flight 去重、按钮禁用、跨标签页复用（localStorage/IndexedDB），把“重复点击/刷新”在源头拦住，减少后端无效流量
- 网络抖动、429/503 等场景，所有重试天然复用同一键；后端按 (userId, orderId, attemptId) 幂等裁决即可，不会出现“先要拿到后端键才能幂等”的依赖
- 不依赖“后端先发幂等键”这一步；即使网关分流、后端局部不可用，前端键也稳定可用，有利于高并发峰值下的稳定性
- 前端已防重，/pay/create 的重复调用被显著减少；后端只需接受 header 并做幂等裁决，无需专门设计一条“取幂等键”的前置接口



#### js手写AbortController取消+操作序列化+最终一致性展示

``` js
const lanes = new Map();
// 串行化请求，按 key 隔离
function runSerial(key, fn) {
  const prev = lanes.get(key) || Promise.resolve();
  const next = prev.then(() => fn());
  lanes.set(key, next.catch(() => {}));
  return next;
}

// 创建
class LatestOnly {
  constructor(apply) {
    this.seq = 0;
    this.ctrl = null;
    this.apply = apply;
  }
  async get(url, init = {}) {
    const seq = ++this.seq;
    if (this.ctrl) this.ctrl.abort();
    this.ctrl = new AbortController();
    try {
      const r = await fetch(url, { ...init, signal: this.ctrl.signal });
      const data = await r.json();
      if (seq === this.seq) this.apply(data);
    } catch (e) {
      if (!e || e.name !== "AbortError") {}
    }
  }
}

const statusView = new LatestOnly((data) => {
  render(data);
});

function commitOrder(orderId, payload) {
  return runSerial(`order:${orderId}`, () =>
    fetch("/pay/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, ...payload }),
    }).then(() => statusView.get(`/order/status?orderId=${orderId}`))
  );
}

function refreshStatus(orderId) {
  statusView.get(`/order/status?orderId=${orderId}`);
}

function render(data) {}
```



### 多笔请求并发返回，竟态条件怎么处理？

Q：什么是并发返回导致的竟态？
> 前端触发了多次异步请求（列表刷新、切 Tab、搜索、下单重试、库存轮询等），这些请求的返回顺序 不等于 发起顺序

容易导致：`UI 回退到旧数据、loading 状态错乱、下单状态被错误覆盖（尤其致命）`


我会按场景选层级，避免“过度工程”：

**防线 A：Last-Write-Wins（版本号/序列号 gating）**
- 每次发请求前生成递增的 requestSeq （或 version ）
- 响应回来时对比：只有 seq === latestSeq 才允许写入状态
- 适合：`用户快速切换会场 Tab，产生多个列表请求`；列表、搜索建议、筛选、tab 切换、任何“只要最新结果”的场景

`我会给每个请求绑定一个递增版本号，响应回来先比对当前最新版本，不是最新就直接丢弃，保证状态只被最新请求写入。`


**防线 B：Cancel Previous（AbortController 取消旧请求）**
- `新请求发起时，主动 abort() 上一个 in-flight 请求`
- 适合：昂贵接口、会占资源的长请求、频繁触发的搜索/联想
- 注意： abort 只能减少客户端等待与后端压力（部分场景）， 不能当作一致性保障 ，一致性仍靠“防线 A 的写入门禁”

**防线 C：Keyed Concurrency（按资源维度的并发隔离）**
- `不是全局一把锁，而是按 key（skuId、tabId、queryKey）做隔离`
- 例如：
  - tab=女装 与 tab=男装 分别维护自己的 latestSeq
  - SKU 库存轮询按 skuId 维度隔离
- 适合：页面上存在多个并行数据源，互不影响但每个源内部要有序，避免不同资源互相覆盖


**防线 D：State Machine + Idempotency（交易强一致）**
- `用状态机约束合法状态迁移（Idle→Submitting→Success/Failed）`
- `幂等 key 保证“同一意图只生成一次结果”，重试不产生副作用`
- 适合：`下单、领券、支付确认等交易链路`
- 即使发生并发返回：状态机也会拒绝非法写入（例如 Success 后不允许被 Fail 覆盖）


我通常会把这个能力抽成一个通用的 Request 模块：`支持 latestOnly （LWW）、 cancelPrevious 、按 key 隔离、以及交易场景的 stateMachineGuard` 。业务方只需要声明策略，而不需要每个页面重复造轮子。





### 从React Fiber时间切片问到WebWorker离屏计算

`React Fiber 时间切片`: React 18 的并发渲染能力基于 Fiber 架构的任务调度，将渲染工作拆分为可中断的小片段。在浏览器每帧约 16ms 的预算内，React 会在空闲时间推进低优先级任务，一旦出现高优先级交互（输入、滚动、动画），可立即打断当前渲染，先响应用户再继续。


`WebWorker 离屏计算`: 浏览器提供的多线程能力，把纯计算任务放到独立线程执行。Worker 不能直接访问 DOM，但可以通过消息传递把结果回到主线程。配合 Transferable 对象（如 ArrayBuffer）避免数据拷贝；结合 OffscreenCanvas 可在 Worker 中渲染 Canvas，实现真正“离屏”渲染，减轻主线程负担。

**比较：**
- 并发模型: `时间切片是同一主线程的可中断调度；Worker 是跨线程的并行计算`。
- 能力边界: `时间切片用于让主线程上的渲染与交互更顺畅；Worker 用于把 CPU 密集计算或 Canvas 绘制搬离主线程`。
- 成本与收益: 时间切片几乎没有通信成本；Worker 需要序列化/传输，适合中大粒度任务。小任务用 Worker可能得不偿失。

- 响应预算：目标是保持交互指标（如 INP）良好，避免超过 50ms 的长任务。`时间切片把长渲染拆小，Worker把长计算挪走`。
- 用户体验: 输入不迟滞、动画稳定 60fps、滚动顺滑；复杂业务不会“卡住”页面。


**前端应用场景**
- 时间切片（主线程调度）
  - `大列表/图表的逐步渲染与虚拟滚动`，避免一次性渲染阻塞。
  - `输入联想、搜索过滤场景`，用 useDeferredValue 或 startTransition 降低输入阻塞。
  - 路由切换、布局变更等大量 DOM 更新的分片处理。
  - `复杂组件树的优先级渲染`：先上可见区域，背景区域后续补齐。

- WebWorker（离屏计算）
  - `大数据处理`：CSV/JSON 解析、压缩/解压、加密、ML 推理、图像处理。
  - `富文本 diff/协同算法（OT/CRDT）`在 Worker 中执行，主线程只负责呈现。
  - `地图投影、路径规划、GIS 计算`；WebAssembly + Worker 加速。
  - OffscreenCanvas 的图像滤镜、粒子系统、WebGL/Three.js 渲染搬离主线程。

- 组合应用（两者协同）
  - 主线程用时间切片保持交互顺滑；后台用 Worker 流式产出结果。
  - 大列表“渐进填充”：Worker 分批计算、主线程分片插入。
  - 图表渲染：Worker 预计算数据聚合，主线程用时间切片绘制首屏与交互高优先级部分。

#### OffscreenCanvas 离屏渲染

``` js
// main.ts
const canvas = document.querySelector('canvas')!;
const offscreen = (canvas as any).transferControlToOffscreen();
const worker = new Worker(new URL('./render-worker.ts', import.meta.url), { type: 'module' });
worker.postMessage({ canvas: offscreen }, [offscreen]);

// render-worker.ts
self.onmessage = (e) => {
  const offscreen: OffscreenCanvas = e.data.canvas;
  const ctx = offscreen.getContext('2d')!;
  // 在 Worker 中绘制
};
```

#### 时间切片的实现技术方案：

`requestIdleCallback, setTimeout, MessageChannel`

MessageChannel 是 Web 平台 很早就有的消息通道接口（HTML 标准的一部分）。它的核心用途是：`创建一对互联的端口 port1/port2 ，你可以在两端之间 postMessage ，对端会触发 message 事件`。它常被拿来做“更可控的异步调度 tick”（React Scheduler 就是类似思路），因为它能快速、稳定地在事件循环里排一个任务。


**它解决什么问题：**
- 你想在主线程做一段工作，但希望“做一会儿就让出控制权”，下次再继续
- 相比 `setTimeout(fn, 0)` ，MessageChannel 通常更稳定、延迟更低（但仍然是异步任务；具体调度细节由浏览器实现决定）

``` js
// 用 MessageChannel 实现“调度 tick”（做时间切片的基础骨架） 下面这个例子模拟“有一堆任务要做，每次只做一小会儿，超时就让出主线程，下个 tick 继续”。

const channel = new MessageChannel();
const port = channel.port2;

let scheduled = false;
const taskQueue = [];

// 触发下一次 tick
function scheduleTick() {
  if (scheduled) return;
  scheduled = true;
  port.postMessage(null); // 
}


channel.port1.onmessage = () => {
  scheduled = false;

  const sliceBudgetMs = 5;
  const start = performance.now();

//   从任务队列里取任务，遍历执行
  while (taskQueue.length > 0) {
    const task = taskQueue.shift();
    task();

    // 如果耗时超过预算，让出主线程
    // 否则继续继续执行下一个任务
    if (performance.now() - start >= sliceBudgetMs) {
      scheduleTick();
      return;
    }
  }
};

function enqueueTask(task) {
  taskQueue.push(task); // 把任务放到队列里
  scheduleTick(); 
}

// 模拟1000个任务
for (let i = 0; i < 1000; i++) {
  enqueueTask(() => {
    let x = 0;
    for (let j = 0; j < 5000; j++) x += j;
  });
}
```
MessageChannel 是 Web API，用来在同一页面（或不同上下文）之间传递消息；在“时间切片调度”里，它常被用来触发下一次 work loop，让主线程在合适的时机继续处理剩余工作。





### 支付实时大盘，每秒2000+条数据，怎么保证图表不掉帧？

要让“支付实时大盘”在 每秒 2000+ 条 数据下不掉帧，核心思路是： `数据摄入高频，但渲染低频；计算离主线程；绘制走 GPU/批处理；DOM 最小化` 。

WebGL渲染+二进制协议+流式消费+OffscreenCanvas

1. 数据链路：高频进、低频出
- WebSocket/SSE 收数据后不要直接 setState；`先写入内存缓冲区`；
- `UI 渲染节奏锁到 requestAnimationFrame 或固定帧率`（比如 10~20fps），一帧只消费缓冲区里“最新快照”。

2. 线程模型：`Worker 负责算，主线程负责画`
- `所有聚合/排序/分桶/异常检测放 Web Worker。主线程只拿“可直接绘制的数据结构”`
- 数据很大时用 SharedArrayBuffer + Atomics 共享内存，减少 postMessage 拷贝成本

3. 渲染层：Canvas/WebGL 优先，DOM 退到最小
- `图表（折线、柱状、散点、热力）优先 Canvas；极限点数/多图并排用 WebGL（批量绘制、instancing）`。
- 需要多图同屏： `OffscreenCanvas + Worker 渲染（支持的浏览器里）进一步减主线程压力`

4. 传输与解析：二进制 + 结构化
- 若协议可控，用 protobuf/flatbuffers/自定义二进制，减少 JSON 解析与字符串分配。
- 单条消息尽量包含批量点（batch），减少事件触发次数。

5. 组件更新：只让“图表层”动
- React/Vue 顶层不要每条消息 setState；用外部 store + rAF 节流，或直接把绘制逻辑放在 chart 实例里（imperative）。
- `列表类明细（2000/s 的明细日志）必须虚拟列表`，只显示可视区域，且增量 append。


`数据流入先缓冲聚合，Worker 做计算，主线程按 rAF 出帧，Canvas/WebGL 批量绘制，DOM/State 更新最小化`





### 前端怎么做内存监控？



目标 ：`尽早发现“内存泄漏/异常增长”导致的卡顿、崩溃、白屏、iOS Safari 刷新、Android WebView 被系统杀进程等问题，并能定位到“哪条链路/哪个页面/哪个组件模式”`。

边界 ：`前端拿不到“系统级真实的进程内存”那样精确的数据；很多能力受限于浏览器（尤其 iOS）。所以我会把前端内存监控定位为 趋势监控 + 异常检测 + 可定位线索 ，而不是“精准计量”`。



**监控指标：我会选哪些“可用且有解释力”的信号**

1. `强信号（能直接反映 JS 堆趋势）`
- JS Heap 使用量 ： usedJSHeapSize / totalJSHeapSize （Chrome 系为主，部分 Chromium WebView 可用）
- 增长斜率 ：`同一会话内，路由/页面切换后是否持续上升且不回落（典型泄漏特征）`

2. `辅助信号（帮助“解释为什么涨”）`
- 页面/路由维度的资源计数 （自己埋点得到）
  - `活跃定时器数量、未清理的订阅/事件监听`（例如 bus、Rx、DOM addEventListener）
  - `缓存容器大小（Map/Set/LRU/业务缓存条目数）`
  - WebSocket 连接数、Audio/Video/Canvas/WebGL 资源数
- `关键操作链路 ：比如“进入列表-打开详情-返回”循环 N 次后的内存变化`

3. 弱信号（不可直接测内存但能发现“内存相关事故”）
- 崩溃/刷新/白屏率 （iOS 经常表现为 reload）
- `长任务、帧率恶化、交互延迟上升` 与内存增长的相关性（用于佐证）




**采集策略：怎么采才“准、稳、成本可控”**
> 采集是工程问题”，核心是 `采样+场景点位` ：

1. 场景点位 （比纯定时更有定位价值）
- `首屏完成、路由切换完成、弹窗/大组件挂载完成、列表滚动到底、关闭页面/销毁组件`
- `对 SPA：每次 route change 记录一条“前后对比”（before/after）`

2. 时间采样（补趋势）
- `前台每 30~60s 采一次（可动态调整）`，后台/不可见时停止或降频

3. 上报控制
- `只上报“摘要数据”：数值 + 设备信息 + 页面/路由 + 版本号 + 关键业务维度`
- `采样率 ：全量基础指标（极低成本）+ 异常会话提高采样（例如检测到持续上升后提升频率）`
- `节流与合并 ：离线缓存、批量上报、失败重试，不影响主线程体验`




**异常判定：怎么从“涨了点”变成“我能报警”**

1. 规则（上线即用）
    - usedJSHeapSize `连续 K 次采样单调上升，并且增长超过阈值（绝对值 + 相对值）`
    - 同一路由循环进入/退出 M 次后，基线抬升超过阈值（回不去）
    - 结合弱信号：同版本在某机型 crash/reload/白屏显著上升
2. 统计（中长期）
    - 建“版本-机型-路由”的基线分布（P50/P90/P99），`报警看 偏移 而不是看绝对值`
    - 发现回归：新版本在关键路由的内存斜率显著变差


**定位手段：线上监控如何帮助你把锅甩到“具体原因”**

- 线上给线索 ：`异常会话里我会上报“资源计数摘要”（监听/定时器/缓存条目/连接数）+ 最近一次路由链路 + 用户关键操作序列（脱敏）`
- 线下做确认 ：`对命中的路由/操作，在预发或本地用 DevTools 做 Heap Snapshot、Allocation Timeline`，重点看：
    - Detached DOM tree、未释放的闭包、全局单例缓存、事件监听未解绑、定时器未清理
    - 列表/虚拟滚动不当导致 DOM/数据结构持续累积
    - WebGL/Canvas/Media 资源未显式释放（ dispose / close / pause 等）


**总结：**`前端 SDK 负责采集与初判，数据平台负责聚合分析与告警，联动错误监控形成闭环 。`

**注意：**
- `performance.memory` 覆盖有限（主要 Chromium），iOS 需要用“事故指标 + 趋势间接指标”补齐
- `不追求“全量高频采样”，否则上报成本和性能开销会变成新问题`
- `只在“可定位的关键路径”加密采样，避免把监控做成噪声系统`


**Q：你会怎么快速证明泄漏？**
> 选一个可复现业务路径，做“循环操作 N 次”，线上看趋势命中后，线下用 Heap Snapshot 找到持有链（retainers），再回到代码里清理引用、解绑监听、收敛缓存策略，并用同一路径回归验证基线回落。这样就从监控→定位→修复→验证形成闭环。




————————————

### 浏览器渲染原理与首屏性能优化

#### 从输入URL到页面完全渲染，中间发生了什么？

1. 从输入 URL 到拿到 HTML：`用户触发导航（Navigation） => 查缓存与拦截 => 域名解析与连接建立(TCP/HTTPS) => 发起请求与拿到响应`

2. 从 HTML 到“可见像素”：`渲染主流程（解析 → 构建 → 布局 → 绘制 → 合成）`

3. 页面完全渲染”到底指什么

- FCP ：首次绘制（出现非空白像素）
-` LCP ：最大内容元素绘制（最贴近“首屏主体出来”）`
- `TTI / INP ：可交互与交互响应`
- `CLS ：布局稳定性（是否抖动）`
- 事件： DOMContentLoaded （DOM 解析完）≠ load （子资源加载完）≠ “用户觉得好了”

并补一句：我`优化首屏通常以 LCP + INP + CLS 为目标，因为它们直接对应 Core Web Vitals`。


#### 首屏性能优化

1. 网络与连接层（降低“到达成本”）
- `减少重定向；CDN 就近；HTTP/2/3；开启 gzip/br。`
- `preconnect / dns-prefetch ：降低 DNS/TLS 建连成本`（对跨域资源明显）。
- `缓存策略： Cache-Control: max-age, immutable + 文件指纹；接口用 ETag/协商缓存。`

2. 资源加载层（关键资源优先级）
- 关键 CSS 内联/拆分 Critical CSS ，非关键 CSS 延后（避免 CSS 阻塞）。
- `JS：路由级/组件级拆包（code splitting），首屏仅加载必要代码； defer 优先`。
- `preload ：对 LCP 图片、关键字体、关键 chunk 提前声明`（谨慎，避免滥用导致争抢带宽）。
- 字体： font-display: swap ，子集化（subset），必要时预加载 WOFF2。


3. 渲染与主线程（让浏览器更快“画出来”）
- `降低首屏 DOM 复杂度`，避免巨型列表（虚拟列表/骨架屏）。
- 避免 layout thrashing：`读写分离（先读后写），批量更新（ requestAnimationFrame ）`。
- `让动画走合成`： transform/opacity ，减少大面积重绘；合理使用 will-change 。


4. 架构策略（从根上减少首屏工作量）
- `SSR/SSG（静态站点生成）/流式 SSR` ：更快得到可见内容（FCP/LCP 受益），但要控制 hydration 代价。
-` Islands/部分水合`：把交互范围缩小，降低主线程压力，提高 INP。
- 边缘渲染/缓存：降低 TTFB（首字节到达时间），稳定首屏。


**如何“落地”与验证：**
- `用 Performance/Lighthouse/WebPageTest 看：TTFB、关键请求瀑布、主线程长任务、LCP 元素是谁`。
- `如果 TTFB 高 ：优先服务端与缓存、边缘、接口聚合`。
- `如果 LCP 资源晚 ：提升优先级（preload/priority hints）、图片格式与尺寸、减少阻塞资源`。
- `如果 主线程忙 ：减少首屏 JS、拆包、延迟非关键脚本、优化渲染/计算`。
- `如果 CLS 高 ：为图片/广告/组件预留尺寸，字体策略调整`。




#### 如何针对移动端弱网环境，将首屏加载时间控制在1秒以内？

`先对齐目标 → 给出方法论框架 → 按关键路径逐层落地 → 用数据闭环`

目标：`在移动端弱网下，我追求的是 1 秒内让用户看到‘可用的首屏结构’（FCP/骨架或首屏核心文案），LCP 尽量压到 1～2 秒；完全可交互可以后移，但要保证 INP 不爆。`因为弱网的 RTT 和丢包会把握手、TTFB、关键资源串行放大，硬把‘完整内容+完全交互’塞进 1 秒通常不可控。

优化框架就四件事：`TTFB 要低、关键资源要少、渲染阻塞要清、主线程要空`

1. 先解决 TTFB（弱网下最值钱的就是减少等待）
- 我会`把 HTML 尽量做到边缘可缓存`：能 SSG/ISR 就 SSG/ISR；动态页面做边缘微缓存或者页面片段缓存，保证 P75 TTFB 稳。
- 同时`减少重定向、用 CDN、上 HTTP/2/3`，必要的跨域资源提前 preconnect，目的就是让连接成本和首包时间可控。

2. 把关键请求变少、变短（弱网最怕请求多、还串行）
- `首屏关键路径只允许极少资源`：一个 HTML + 关键 CSS + 极少 JS。
- CSS 方面我会抽 Critical CSS 内联，非关键 CSS 延后，`避免 CSS 阻塞首屏`。
- `数据方面首屏接口尽量聚合，避免首屏阶段 N 个接口瀑布流`。

3. 让‘像素更早出现’（别等一切都齐了再渲染）
- 我会`用 SSR 或流式 SSR`：先把首屏骨架/核心文案流式吐出来，让浏览器马上能 paint。
- 字体用 swap + 子集化，避免 FOIT 把首屏文字卡住。

4. 把 JS 从首屏挪走（移动端 CPU + 弱网双杀）
- `首屏 JS 只保留渲染与关键交互`，其他全部延后：埋点、AB、客服、动效、非首屏模块。
- 架构上我更倾向 `Islands/部分水合：首屏大部分内容静态可读，小块交互再水合，这样主线程长任务少，INP 更稳`。

不会靠感觉说‘能到 1 秒’，我会用数据闭环。`实验室用真机+弱网模拟看 waterfall、长任务、LCP 请求时序；线上用 RUM 按网络/机型分桶看 P75/P90`。然后设性能预算门禁：关键资源大小、请求数、首屏 chunk 大小，一回归就报警。这样 1 秒目标才是可持续的。


#### 我曾经怎么从 3.2s 拉到 1.1s”的案例结构

`目标对齐 → 现状数据 → 定位瓶颈 → 分层策略 → 落地动作 → 结果复盘 → 机制化防回归`

**现状量化：3.2s 到底卡在哪**

- 实验室：`真机 + 弱网模拟`，看瀑布流、主线程长任务、LCP 元素是谁、LCP 请求什么时候开始、什么时候结束。
- 线上：`RUM 分桶（机型/网络/地区），看 P75/P90`，避免只优化少数机型。


发现是三类问题：
- `TTFB 偏高` ：活动页是动态渲染，服务端拼装 + 多接口串行，弱网下首包很晚。
- `关键渲染链过长` ：首屏 CSS 在大包里，且有一堆同步脚本；浏览器拿到 HTML 也画不出来。
- `LCP 是首图，但开始请求太晚` ：首图在 JS 渲染后才出现，导致图片请求启动时间被推迟。


**策略：TTFB 要低、关键资源要少、像素要早出、主线程要空**

- `先降 TTFB`：让“等待首包”不再是乘法放大器，把 TTFB 拉到一个稳定区间，至少先让浏览器更早开始解析与预加载
    - 页面形态调整 ：`把活动页改成“静态壳 + 动态数据”模式。可预生成的部分走 SSG/ISR 或边缘缓存；确实动态的部分做接口返回`。
    - 接口聚合 ：`把首屏依赖的 3～5 个接口合成 1 个首屏接口，减少弱网下的串行 RTT 叠加`。
    - 缓存策略 ：`对活动页做短 TTL 微缓存（比如 5～30s 量级）抗峰值`，配合灰度避免数据不一致风险。

- 缩短关键渲染链：让浏览器“拿到就能画”
    - Critical CSS 内联 ：`只内联首屏骨架和首屏主体所需样式，剩余样式延后加载`。
    - 脚本策略重排 ：`把首屏非必要脚本（埋点、AB、客服、弹窗）全部延后到 load 后或空闲时；必要脚本用 defer ，避免阻塞 HTML 解析`。
    - 字体策略 ： font-display: swap + 子集化，避免字体下载阻塞首屏文字呈现。

- LCP 专项：盯住“最大内容元素”的开始时间与下载时间，`这一步通常是把 3.2s 拉到 1.x 的关键，因为 LCP 大概率是图片或大块文本`。
    - `让 LCP 资源更早被发现 ：把首图从“JS 渲染后才插入”改成 HTML 里直接有 <img> ，或者至少用 preload /高优先级提示让浏览器尽早拉起请求`。
    - `图片优化 ：WebP/AVIF + 正确尺寸（ srcset/sizes ）+ 压缩到可接受质量；首屏图不做 lazy`。
    - `减少争抢 ：避免在首图下载期间同时拉一堆低优先级大资源（大 JS、大图集），必要时延后它们的请求`。

- 主线程治理：避免“下载完也渲染不出来”
    - `拆包与首屏最小 JS ：路由级/组件级 code splitting，首屏只加载渲染与关键交互所需代码`。
    - `降低 hydration 压力` ：能做部分水合/Islands 就做，把交互范围缩小。
    - `长任务处理 ：把复杂计算挪到 Worker，或推迟到用户首屏稳定后再算`。


**复盘：从 3.2s 拉到 1.1s，我怎么证明的**

我会用同一套测试条件对比前后：
- 实验室：弱网配置不变、同机型不变、同页面路径不变，输出对比（TTFB、FCP、LCP、长任务总时长）。
- 线上：看 RUM 的 P75，避免“实验室很好、线上不稳”。
当时的结果是：
- LCP 从约 3.2s 降到约 1.1s（弱网 P75 级别），FCP 明显提前，长任务显著减少。
- 同时 CLS 也变稳（图片有尺寸占位、骨架与最终布局一致），投诉率下降。


**把优化变成机制，避免下次又回到 3 秒**
- 性能预算门禁 ：`首屏关键资源大小、关键请求数、首屏 chunk 大小、LCP 图片体积，上 CI/监控，超标就告警`。
- RUM 持续分桶 ：按网络/机型看趋势，优先保障弱网与中低端机体验。
- 发布灰度 ：任何影响缓存、渲染链、首图的改动都灰度，确保稳定性。


#### RUM 分桶

`RUM` 是 Real User Monitoring，意思是“线上真实用户监控”。`分桶`就是把线上用户按某个维度拆成多个“桶”（人群/场景），分别统计指标（LCP、INP、CLS、TTFB 等）。

`P75`（75 分位）：把所有用户的某指标值从小到大排序，排在 75% 位置的那个值。含义： 75% 的用户体验不超过这个值，最慢的 25% 在它之上 。`P90`（90 分位）：同理， 最慢的 10% 在它之上 。

`为什么什么不用平均值（mean）：`
- 性能指标分布常常是“长尾”的：大多数人很快，少数人特别慢（弱网/低端机/某地区）。平均值会被“快的人”稀释，掩盖尾部问题。
- `Core Web Vitals 官方口径强调 P75 ，因为它更能代表“多数用户”的体验门槛，同时对长尾敏感但不会被极端值完全支配`。


**“分桶 + P75/P90”在实际分析里怎么用**

你可以把它当成一个定位流程：
- 先看全量 P75 ：判断整体是否达标（比如 LCP P75 < 2.5s）。
- 再看分桶 P75 ：找到拖后腿最大的桶
  - 例：全量 LCP P75=1.8s，但“弱网桶” LCP P75=3.5s，那优化应该优先围绕网络关键链路、缓存、首图优先级。
- 用 P90 看长尾是否异常：
  - 如果 P75 不差但 P90 爆炸，说明“少数场景极慢”，通常是某地区 CDN、某机型主线程卡死、或偶发大资源/错误重试导致。



### 宏任务与微任务的执行时机是什么？


### 手写代码分析输出顺序：setTimeout、 Promise、 async/await、 requestAnimationFrame、MutationObserver混合场景。



### 当页面中有一个大型列表，其中某一项数据变化时，如何避免整个列表重新渲染？

1. 更新可定位：只改那一项的数据引用，其它项引用不变
    - 典型错误是每次更新都 list = list.map(...) 但内部又把每一项都浅拷贝，导致所有 item props 引用都变了，进而全部 item 都会 render。
    - 正确做法是：`只替换变更的那一项对象，其它项保持同一个引用`。

2. 渲染可裁剪：列表项组件做“按需渲染”
    - React： `React.memo`(Item) + 确保传给 Item 的 props 引用稳定（尤其是回调、派生对象）。
    - Vue：稳定的 :key ，并用 `v-memo` （Vue3）或拆分子组件让依赖更精确。

3. `可视区渲染：列表虚拟化`
    - 如果列表真的大（几千/上万），哪怕只更新一行，遍历和 diff 也可能很贵。
    - 上虚拟列表（react-window/react-virtual-scroller/Angular CDK Virtual Scroll 等），把渲染规模从 N 降到可视区 K。


**React 里我会怎么落地（面试官通常最关心这个）**

1. 组件切分
    - List 只负责拿 ids、滚动容器、虚拟化
    - `ItemRow 只负责渲染单行`
    - `行内再细分：头像/标题/操作区，避免一个局部字段变化导致整行复杂子树全算一遍`
2. 稳定引用，避免“隐形全量更新”
    - `回调用 useCallback ，派生数据用 useMemo` ，但前提是依赖正确且收益大
    - 避免每次 render 都构造 {...} 、 [] 作为 props 传给 Item
    - `key 必须是稳定的业务 id，避免用 index`（插入/排序会灾难）
3. 状态管理：让每个 Item 订阅自己的数据
    - 如果用 Redux/Zustand/Jotai/Signals 这类：让 ItemRow 通过 selector 只取 byId[id] ，并利用 memoized selector/shallow compare，做到“只这一行订阅变化”。
    - 如果用 React Context：避免把大 list 放在一个 Context 里导致全体消费组件一起刷新；要么拆 Context，要么改用更细粒度的 store 方案。
4. 数据结构建议：normalized
    - `把 items: Item[] 变成 { ids: string[]; byId: Record<string, Item> }`
    - 更新单项就是 byId[id] = newItem ，其它引用完全不动，天然利于“只更新一行”。


`通过“只替换变更项引用 + 行组件按需渲染 + 虚拟列表裁剪可视区”，把更新从 O(N) 收敛到 O(1) 或 O(K)，同时用 profiler 验证效果`。





### 设计一个高实时性协作应用（如飞书文档/多人在线表格）的前端状态同步方案，如何保证操作顺序一致性与冲突收敛？

拆成两件事： 
- “`高实时`”怎么做到
- “`顺序一致 + 冲突收敛`”靠什么机制保证


**目标与约束（先对齐）**
> 在飞书文档/多人表格这类协作里，前端同步方案通常要同时满足：

- `本地输入即时反馈` ：不能等网络往返再显示（本地乐观执行）。
- `最终一致（收敛）` ：所有参与者在同一文档版本上最终看到同样结果。
- `顺序一致性`（在可解释范围内） ：至少要满足`因果顺序`（A 操作依赖 B 时所有人都先看到 B 再看到 A）；很多场景还希望“看起来像单一顺序执行”（接近线性一致/总序）。
- `可扩展与可恢复` ：断线重连、离线编辑、历史回放、快照与压缩、权限控制。


**总体架构（我会画一条数据链路）**

- `连接层 ：WebSocket（或 WebRTC + 信令），保证低延迟双向通道；消息带上 docId / clientId / sessionId / auth`。

- `前端状态机 （核心）`：
  - `本地维护 localState + pendingOps(未确认) + ackCursor(已确认)`
  - `用户操作（insert/delete/format、cell update、range resize）先转成 原子操作（op） ，本地立即 apply，并进入 pending`。

- `协作服务端` （不是简单转发）：
  - 存储：op log（可分段）+ snapshot（定期）
  - 职责：`鉴权、广播、持久化、限流`；更关键的是提供 顺序与冲突处理策略 （OT/CRDT/或混合），以及重连补齐。



**保证操作顺序一致性”怎么做**

- `因果顺序（必须保证）`: - 客户端只在满足依赖时才 apply 远端 op；否则先缓存，等依赖到齐再应用。这`能保证“先改标题再在标题后插字”这种依赖关系不会乱序`。
- `总序`（看起来所有人按同一顺序执行）：服务端为每个 doc 分配`单调递增 serverSeq` ，所有 op 按 serverSeq 广播。客户端按 seq 严格应用，得到天然的“全局单序列”。


**“冲突收敛”怎么做**

`文本协作`通常 `OT` 或 `CRDT` 都能做；工程上很多团队是“`服务端总序 + OT`”或“`CRDT（含标识符）+ 弱中心化存储`” 。


**OT（Operational Transformation）怎么收敛：**
- `客户端维护 pending 队列`：
1. `本地产生 op，立即 apply，入 pending，发给 server（带 baseVersion）`。
2. 收到 server 广播的 op：
   - 如果是自己的 ack：从 pending 移除并推进 confirmed version
   - 如果是别人的 op：对 pending 中每个本地 op 逐个 transform，然后 apply

- 收敛依赖 OT 的性质（TP1/TP2 等），`工程上要严格定义文本位置、删除合并、属性操作的规则`。


**CRDT 怎么收敛**
- 把文档建模成可交换合并的数据结构：
    - 文本：RGA / YATA / LSEQ 等“带唯一标识的序列 CRDT”
    - 表格：更适合用 map/set/register 组合
- 每个 op 携带元素 id（而不是纯位置 index），并发插入/删除在结构层天然可合并。
- 客户端可离线产生 ops，重连后按因果依赖补齐即可，最终自动收敛。


**表格/文档的冲突规则（让面试官觉得你懂业务）**
> 协作的“冲突”不是只有算法层，很多时候是 产品规则 。

`单元格冲突 ：两人同时改 A1`
- 可用 LWW（`last write wins`）+ 可选“冲突标记/历史可追溯”
- 或基于因果：同因果链按顺序；`真并发用 serverSeq 决胜，并保留历史`

`结构操作 （插行/删列/合并单元格）`
- 必须定义优先级与可交换性，常见做法：`结构变更走更严格的序列化通道（server sequencer 强制总序）`，再对内容更新做 rebasing。



**工程化补全（体现架构师视角）**

- `快照与压缩 ：op log 达到阈值生成 snapshot`；OT/CRDT 都要做精简，否则回放太慢。
- 重连与补齐 ：客户端带 lastServerSeq （或版本向量），服务端增量下发缺失 ops。
- 一致性与性能权衡 ：高频输入做 op batching（按 16ms/50ms 合并）、背压与限流；`大文档分片`（按 block/paragraph）减少 transform 范围。
- 可观测性 ：延迟（端到端）、op 堆积、transform 耗时、重放耗时、冲突率；这些指标能直接指导优化。
- 安全 ：`每个 op 做鉴权与权限校验`（是否可编辑该 range/该 sheet），避免“客户端自说自话”。


#### 富文本属性冲突怎么合并

并发冲突的本质：` 同一时间对同一语义目标（同一 range/节点、同一属性键）做了不兼容的写入` 。

- 合并规则一：可叠加 marks（bold/italic/underline）用“集合并” 这类属性天然可并存，不存在语义冲突

- `合并规则二：对每个互斥属性键，用 LWW Register（最后写 wins）或“稳定排序 wins” `，但要保留历史（op log）以便审计/撤销



#### CRDT 是什么？

- OT（操作转换，Operational Transformation）：
> `是一种用于实时协同编辑的算法，其核心原理是通过定义转换函数来调整并发操作`。当多个用户同时编辑时，OT服务器将接收到的操作进行转换，使它们能正确应用到文档的当前状态。典型应用如Google Docs、在线协作白板等需要强实时性的中心化应用。

- CRDT（无冲突复制数据类型，Conflict-free Replicated Data Type）：
> 是`基于数学原理的数据结构，保证所有并发操作都是可交换、可结合或幂等的`。这意味着`无论操作以何种顺序传播，所有副本最终都会收敛到相同状态，无需中央协调即可自动合并`。典型应用如云笔记、低代码平台（如TinyEngine使用Yjs），特别适合`离线优先`的P2P应用。如低代码开发平台（如TinyEngine使用Yjs）

`OT依赖中央服务器转换操作；CRDT依赖数学性质的数据结构；CRDT支持离线编辑，实时性更高；OT需要在线协调；OT用于在线文档协作；CRDT用于云笔记、低代码平台`


`CRDT(无冲突复制数据类型，Conflict-free Replicated Data Type) `不是某一种“固定长相”的结构，而是一类**带有确定合并规则（merge）**的数据类型。它的核心特征是：
- 每个副本（客户端）都能 本地独立更新
- 副本之间只要交换状态（或增量），再执行 merge ，就能保证 无论消息顺序如何，最终收敛到同一结果
- 这个 merge 必须满足： `可交换、可结合、幂等` （commutative / associative / idempotent）

``` js
// 一个常见 CRDT 类型 —— **LWW-Register（最后写入胜出）。你可以把它们理解成低代码里“属性值”的基础积木。
// 一个简单的 Lamport 时间戳：用 (counter, clientId) 做全序比较
function compareTs(a, b) {
  if (a.counter !== b.counter) return a.counter - b.counter
  return a.clientId < b.clientId ? -1 : a.clientId > b.clientId ? 1 : 0
}

class LWWRegister {
  constructor(value = null, ts = { counter: 0, clientId: "" }) {
    this.value = value
    this.ts = ts
  }

  set(value, ts) {
    if (compareTs(this.ts, ts) < 0) {
      this.value = value
      this.ts = ts
    }
  }

  merge(other) {
    const out = new LWWRegister(this.value, this.ts)
    out.set(other.value, other.ts)
    return out
  }
}

// === 模拟两个副本并发改同一个属性 ===
const A_width = new LWWRegister()
const B_width = new LWWRegister()

A_width.set(100, { counter: 1, clientId: "A" }) // A 把 width 改成 100
B_width.set(120, { counter: 1, clientId: "B" }) // B 并发把 width 改成 120

const mergeAB = A_width.merge(B_width)
const mergeBA = B_width.merge(A_width)

console.log(mergeAB.value, mergeAB.ts) // 120, {counter:1, clientId:"B"}
console.log(mergeBA.value, mergeBA.ts) // 120, {counter:1, clientId:"B"} 顺序无关，收敛
```
LWW 的语义是：`同一属性键并发写入，用一个稳定规则选胜者`

CRDT 的另一个常见套路： `用“唯一标识”把并发事件区分开`

“CRDT 结构”不是一个大一统的对象，而是 `一组可合并的数据类型拼装出来的状态树` 。




#### 低代码平台中实现多人协作，如何进行架构设计？

工程更稳的是 `Client-Server Relay + CRDT`（中心化转发/持久化，去中心化合并）


推荐 CRDT ：`低代码天然是结构化状态（组件树、属性、数据源、事件流），离线编辑/重连合并很常见`，CRDT 非常契合。


**数据模型：把低代码状态映射成 CRDT 结构**

- 组件树（结构）：用 CRDT Array/Sequence 表示 children 顺序；节点用 CRDT Map 存 {id,type,props,style,layout,...}
    - 插入/移动/删除节点天然可并发合并。
- 属性与样式（键值） ：用 CRDT Map + Register
    - `对互斥值（如 width=100/120 ）用 LWW Register（胜出规则用 lamport + clientId，而不是本地时间）。`
    - 对可叠加值（如 classList/constraints）用 Set（add-wins/remove-wins 视产品语义）。
- 脚本/表达式/文案 ：用 CRDT Text（或带 position id 的序列 CRDT）

`低代码有 schema（组件属性类型、范围、必填），CRDT 合并后可能出现“语义非法但结构可合并”的状态，所以需要 Schema Validator + Auto-fix （例如把非法值回退到默认值，并记录冲突事件）。`


**协作通道：默认 Client-Server Relay**

默认链路（推荐）：`所有客户端连协作服务（WebSocket）`
- 服务端不做复杂 transform，只做：`鉴权、房间管理、消息转发、增量持久化、反作弊限流`。
- CRDT 更新在各端合并，天然收敛。


**权限与治理**
- 鉴权 ：`每条 update 都要带 session / token，服务端要能拒绝越权更新`。
- `细粒度权限` ：到页面/模块/节点级别（比如某个容器锁定、某个数据源只允许管理员改）。
- 锁与软锁（可选） ：CRDT 不需要锁也能收敛，但产品可能需要“避免互相打架”的体验
  - 我会`做“软锁/提示”：例如节点被某人选中时显示占用，不阻止合并，但减少冲突发生概率`。
- 审计与版本 ：服务端必须落库更新日志，支持回滚/对比/发布审批（低代码强需求）。


**工程化：快照、压缩、重连、性能**
- `快照与压缩` ：CRDT 元数据会膨胀，要做 snapshot（定期把状态压成基线）+ 增量日志截断/GC。
- 重连 ：客户端带上 docVersion/vector 请求增量；拿不到就拉 snapshot 再补增量。
- 性能 ：大页面按“分区文档”拆分（page-level / container-level subdoc），避免一次合并全量树导致卡顿。


**并发冲突在低代码里怎么“解释得通”（面试官最关心）**
- `结构冲突 （两人同时移动同一节点到不同位置）`：CRDT 会给出确定结果，但产品上需要可解释
  - 我会做“冲突事件提示”：在活动面板显示“节点 X 被 Bob 移动到 …，你的移动已被覆盖/合并到 …”，并支持一键撤销（撤销也是一条 CRDT update）。
- `属性冲突 （两人同时改 width）`：用 LWW 很自然，但要配合“最后修改者”标记与历史。
- `删除与修改并发 （A 删除节点，B 改该节点属性）：合并后节点不存在，属性更新变成 no-op；同时记录冲突事件用于提示与审计`。


**在低代码协作里我会优先选 CRDT 来保证离线与自动收敛；数据上把组件树/属性/文本分别映射到合适的 CRDT 类型，再配套 schema 校验、快照压缩、权限审计与冲突可解释机制。**




### 如何实现一个支持动态高度、快速滑动且图片懒加载的虚拟滚动列表？滑动到底部加载更多时，如何避免DOM节点暴涨导致的卡顿？

一般会把这个问题拆成四块讲： `虚拟化窗口机制 、 动态高度的定位算法 、 快速滑动的性能策略 、 图片懒加载与触底加载的协同` 。


**核心目标：DOM 数量恒定，滚动位置正确**
- 虚拟列表的本质是“`只渲染可视区 + 缓冲区（overscan）`”的那一小段元素，其他的用占位高度撑开滚动条。
- 实现上通常是三层结构：
  - `外层 scrollContainer` ：固定高度、 overflow: auto
  - `中间 spacer` ：高度等于“全量列表的总高度”
  - `内层 itemsContainer` ：只放窗口内的真实 DOM，通过 transform: translateY(offset) 定位到正确位置

**动态高度：先“估算”再“测量”，用可快速反查的高度结构**
- `初始阶段用估算高度` ：每个 item 先给一个 estimatedHeight （比如 80px 或按类型估），`保证首次滚动可用`。
- `渲染后立即测量真实高度并缓存` ：`用 ResizeObserver 或在渲染后 getBoundingClientRect() 测一次`，把 heightMap[index] = realHeight 存起来；维护 prefixSum[] （累计高度数组）+ 二分查找

- `高度变更带来的“跳动”处理` ：当某个已渲染项测量后高度从估算变真实，会影响后续累计高度。为了避免用户视觉跳动：
    - 如果变更发生在当前窗口上方，我会`根据 delta 对 scrollTop 做补偿（保持视口内容不突然上移/下移）`。
    - `更新累计高度时做批处理（下一帧合并），避免同步多次触发布局`。


**快速滑动：把滚动计算从“频繁布局”变成“轻量数学 + 单次渲染提交”**
> `快速滑动卡顿`通常来自两类：`scroll 事件太频繁 + 每次都触发布局/重排`。
- scroll 监听用 passive: true ，并用 `requestAnimationFrame` 合并计算（每帧最多算一次窗口范围）。
- 窗口内元素定位只改 `transform` ，不要频繁改 top/height 触发布局链；容器可加 will-change: transform （谨慎使用）。
- `对渲染做“可中断/分片”`：
    - React 场景可以利用并发特性（比如 startTransition ）把`非关键更新降优先级`。
    - 通用做法是：`窗口计算是同步的，但列表项的复杂渲染可以做 memo/分片，保证滚动主线程优先`。


**图片懒加载**
> 图片懒加载我不会用 scrollTop 手动算（容易在快速滚动下抖），我会用浏览器原生能力优先：
- 首选 ： `img loading="lazy"` （简单场景足够）
- 更可控 ： `IntersectionObserver` 观察“窗口内的图片占位元素”
    - 观察根节点设置为 scrollContainer
    - rootMargin 设大一点（比如提前 300~800px），`实现预加载，减少白屏`
    - `进入可视区再设置真实 src，没进入则保持低成本占位（骨架屏/模糊图）`


**触底加载更多我会这样讲清楚“避免 DOM 暴涨”**
- `触底只意味着 数据变多 ，不应该导致 DOM 变多 ：虚拟化窗口保证 DOM 数量恒定`。
- `用单独一个 sentinel （底部哨兵）配合 IntersectionObserver 判断是否接近底部`，触发 fetchNextPage ，同时做好：
  - `防重复请求：loading 状态 + 请求去重`
  - `预取阈值：提前触发加载，避免真的滑到底才请求导致卡顿/空白`
- 数据无限增长时的“内存与计算”控制：
  - `DOM 不涨，但数据数组会涨`；我会`根据业务决定是否做“只保留最近 N 页数据”`（聊天/时间线常见），或把历史数据做分段存储、按需回收高度缓存。
  - `高度索引结构（Fenwick/前缀和）也要支持增量扩展`，不做全量重算。


如果业务允许，我会优先用成熟方案（比如 React 生态的虚拟列表库）并在其基础上补齐“动态高度测量 + 高度树结构 + 图片 IO 懒加载 + 触底 IO”。

自研的话，最关键的验收指标是： `滚动时主线程占用、掉帧率、窗口切换频率、图片进入视口到展示的延迟` ，这些都能用 Performance 面板和自埋点量化。

动态高度用“`估算+测量+可快速前缀查询的数据结构`”，快速滑动用“`rAF 合并 + transform 定位`”，图片懒加载与触底加载用“`双 IntersectionObserver`”，最终保证“`数据可以无限长，但 DOM 始终是一个小窗口`”，从根上避免 DOM 节点暴涨导致的卡顿。


### Webpack/Vite的打包原理是什么？


### 如何通过持久化缓存、按需加载、CDN分发等手段，提升大型项目的二次构建与线上加载速度?

**对齐目标与指标：我在优化什么？**
- `二次构建`重点看：`增量构建耗时、热更新耗时、CI 构建耗时、缓存命中率、CPU/IO 占比、依赖安装耗时`。
- `线上加载`重点看：`TTFB、FCP/LCP、INP、首屏资源体积、JS 执行/解析耗时、缓存命中率、CDN 命中率、长任务占比`。

大型项目通常是“ `构建阶段的重复计算 + 线上阶段的资源冗余和传输/执行成本` ”两类问题，所以分别用“持久化缓存”和“按需加载+CDN”去打。


**二次构建：持久化缓存 + 增量编译 + 远端缓存**

`持久化缓存`：把“可重复的编译结果”落盘
> 核心思路是：`让打包器把 AST/编译产物/模块图缓存到磁盘，下次只编译变化部分`。
1. `打包器缓存：开启 Webpack filesystem cache / Vite 的预构建缓存 / Rspack、Turbopack 这类自带增量能力`。
2. `Babel/TS 缓存` ：Babel loader cache、tsc 增量（或用 swc/esbuild 替代部分编译链路）。
3. `依赖预构建` ：把 node_modules 里稳定依赖提前预打包，减少开发态重复解析（Vite 的 optimizeDeps 就是典型）。

需要注意：
- `缓存要 可失效` ：把 lockfile、构建配置、环境变量、browserslist 等作为 cache key 的一部分，避免“脏缓存”。
- `缓存要 分层` ：依赖层（最稳定）> 工程编译层 > 业务代码层（最易变），命中率更高。
- `缓存要 可观测` ：埋点输出 cache hit/miss、rehydrate 时间，不然很难持续迭代。

`增量构建`：减少无意义的全量重打
- 更细粒度的构建边界 ：Monorepo 下按 package/入口拆构建图，变更只影响必要子图。
- `并行与分布式` ：本机并行（thread-loader/内置并行）、CI 分片（按应用/包/测试套件拆）。
- 减少 IO 与无效工作 ：只对改动文件跑 lint/test；构建产物目录隔离，避免全量清理。


- `远端缓存`：让“一个人编译过，全组都复用”
> 如果团队规模上来，我会优先上：
- `Remote cache` ：Nx/Turborepo/Bazel 这类把构建产物按 hash 存到缓存服务，CI 和本地共享。
- 收益点 ：对“同一提交、多次流水线、多分支回归”的场景提升非常明显。



**线上加载：按需加载 + 长缓存策略 + CDN 边缘分发（首屏与二次访问都快）**

- `按需加载`：减少首屏必须下载/执行的 JS 
1. `路由级拆分` ：每个页面一个 chunk，首屏只加载首屏路由。
2. `组件/功能级拆分` ：重组件（图表/编辑器）、低频功能（导出/引导）用 dynamic import。
3. `数据与资源的按需` ：图片/视频懒加载、列表虚拟滚动、只在需要时加载 polyfill（差异化 polyfill）。

- `CDN 分发`：让静态资源“就近、可缓存、可复用”
1. `内容哈希文件名`： app.[contenthash].js ，配合 `Cache-Control`: public, max-age=31536000, immutable ，让浏览器缓存真正可用。
2. `HTML 短缓存/协商缓存` ：HTML 作为入口要能快速更新，通常短缓存或 ETag；静态资源走长缓存。
3. `开启压缩与协议优化` ：Brotli（br）优先，HTTP/2/HTTP/3，减少传输耗时与队头阻塞。
4. `图片与字体优化` ：WebP/AVIF、自适应尺寸、字体子集化与 font-display: swap ，这对 LCP 很直接。

**字体子集化**：把字体文件里“你实际会用到的字符”单独裁出来生成一个更小的字体文件。

`font-display: swap`：这是 CSS @font-face 的一个策略，控制“自定义字体没下载完时怎么显示文字”。 swap 的含义是：先立刻用系统字体把文字显示出来


- `预加载策略`：把“下一步必然用到的资源”提前但不打爆首屏
1. `prefetch` ：空闲时预取下一路由 chunk，提高二次跳转速度。
2. `preload` ：首屏关键资源（主 CSS、关键字体、首屏 chunk）提升首屏确定性。
3. 原则：预加载必须基于真实路径（埋点/访问拓扑），否则就是浪费带宽。

- `Service Worker（可选）`：把“二次访问”做到极致
> 如果业务允许（对离线/弱网敏感），我会提：
- 用 SW 做 runtime cache（图片、静态 chunk）、离线降级；
- 但强调要有 版本管理与回滚策略 ，避免缓存错乱影响线上。




### 如何设计一个静态资源发布体系，确保用户在版本更新后及时获取最新资源，同时避免重复加载?

我一般会把“静态资源发布体系”的目标拆成两件事： `让用户尽快拿到最新代码 ，同时尽量让浏览器复用没变的资源`。核心思路就是“`HTML 不缓存 + 资源强缓存 + 文件名指纹化`”，再配合发布与回滚策略。

第一， `构建产物层面我会要求打包输出带内容哈希的文件名`，比如 app.[contenthash].js 、 chunk.[contenthash].css 。这样只要内容没变，文件名就不变，浏览器就能长期强缓存；内容一变，文件名一定变，天然避免“重复加载旧文件”或缓存穿透问题。


二， `缓存策略层面 我会把缓存分层`：
- `index.html 这类入口 HTML：设置 Cache-Control: no-store` （或至少 no-cache + must-revalidate ），保证用户每次进入都能拉到最新的入口文件，因为入口里引用的是最新哈希资源。
- `带哈希的 JS/CSS/图片字体：设置 Cache-Control`: public, max-age=31536000, immutable ，让它们稳定命中缓存，避免重复下载。
- `对 API 响应按业务再做缓存，不和静态资源混在一起`。


第三， `发布与一致性` 我会做“原子发布”来避免 HTML 指向新资源但 CDN 上还没就绪的 404：
- `先把所有带哈希的静态资源上传到对象存储/CDN` 并完成预热；
- `再切换/发布 index.html` （或者通过版本目录、manifest 映射来切换），保证入口引用的资源一定已存在。如果要更稳，我会`用版本目录： /static/v123/... ，入口只切版本号`。


第四， 避免重复加载的体验优化：
- `路由级代码分割 + 合理的 chunk 拆分，减少一次更新导致“大面积 chunk hash 变化”`；
- 用 modulepreload /预加载关键 chunk，首屏更稳；
- `Service Worker 只在需要离线或极致性能时引入，并用“新 SW 下载完资源后提示用户刷新”策略，避免静默更新造成资源不一致`。

最后， 可观测与回滚 ：`上线后用监控看静态资源 404、白屏率、首屏耗时`；`一旦异常，可以秒级回滚入口 HTML 或版本号切换`，因为老版本的哈希资源仍然在 CDN 上。


总结一句话： `入口文件保证“及时更新”，哈希资源保证“最大复用”，发布顺序保证“一致性”，拆包策略保证“尽量少变”` 。这样既能让用户更新后立刻生效，又不会重复下载没变的资源。





### 如何设计一套机制，实现同一个用户在PC端、H5端、小程序端之间的消息实时同步与已读状态维护？WebSocket断连时如何做消息补发？

我会把这个问题拆成两件事来讲： `消息实时同步 和 已读状态` ，最后补上 `WebSocket 断连补发` ，这样逻辑会比较清晰。


第一，`实时同步`的核心是“同一用户多端在线”要做到一致分发。
1. 我会`在服务端做一个 连接层（WebSocket Gateway）+ 会话层（用户在线路由）` ：`同一个 userId 在 PC/H5/小程序会有多条连接，服务端维护 userId -> connectionIds 的映射`。
2. `新消息写入消息存储后，通过消息总线（比如 Redis PubSub/Kafka）把事件推给 Gateway`，Gateway 再把这条消息 fanout 给该用户所有在线端，实现多端同时收到。

第二，`已读状态`我不会用“逐条消息更新已读”，而是用 `会话维度的读游标` （read cursor / watermark）：`对每个 userId + conversationId 维护一个 lastReadSeq`（或 lastReadMsgId）。`任何端读到最新，只要上报一个“我读到了 seq=N”，服务端做幂等更新（取 max），然后把“已读游标更新事件”推给该用户其它端`，以及推给对端（用于显示已读）。这样写入量低、天然去抖，并且多端不会互相打架。

第三，`WebSocket 断连补发`关键是“可续传”和“去重”。我`会给每条消息分配 单调递增的序列号 seq（按会话或按用户收件箱维度） ，并要求客户端维护 lastReceivedSeq/lastAckSeq`。`断线重连时，客户端携带 token + lastAckSeq 发起 resume，服务端按 seq 拉取缺口区间补发`；如果缺口太大或超时，就降级走一个 HTTP 的 /sync 拉取。补发一定做 至少一次投递 ，客户端用 msgId/seq 做去重，ACK 做幂等，保证最终一致。`连接层再配合心跳、超时检测、指数退避重连，就能把体验做稳`。

一句话总结： `服务端用“多连接路由 + 事件分发”做实时同步，用“会话读游标”维护已读，用“seq 续传 + ACK 幂等 + 去重”解决断连补发`。




### 如何设计一个微前端主应用与子应用的通信机制？如何处理子应用之间的样式隔离、全局变量污染和路由冲突？

我一般会从“`目标—方案—落地细节—风险兜底`”四段来回答。

一、`通信机制怎么设计` 我会把通信分三层：
- `基础能力层` ：`提供统一的 bridge` ，支持两类模型：`事件发布订阅（EventBus）和请求响应（RPC）`。事件适合状态广播，比如登录态变化；RPC适合需要回包的能力调用，比如“打开主应用弹窗/埋点/鉴权/下载”。
- `协议层` ：所有消息都“命名空间 + 版本 + 来源 + payload schema”。例如 user:authChanged@v1 ，并且 payload 做类型校验（TS 类型 + 运行时校验），这样跨团队不会靠口口相传。
- `隔离传输层` ：`同域集成（如 qiankun）优先用注入的桥接对象；跨域或 iframe 场景走 postMessage` ，并做 origin 白名单、消息签名/nonce 防重放。

另外我会要求所有通信都可观测：`统一打点、日志链路、支持开关和降级`，避免“黑盒事件”



二、`样式隔离怎么做` 我会按成本和隔离强度选型：

- 默认用 `工程化隔离` ：`CSS Modules / scoped / BEM + 子应用前缀，确保类名不冲突`。
- `有强隔离诉求时用 运行时隔离 ：Shadow DOM（组件级最强，但对第三方样式和弹窗挂载要适配）`，或框架提供的 strictStyleIsolation（比如给子应用容器做样式隔离策略）。
- `同时治理“全局样式泄漏”`：约束子应用不要写 body/html 级别样式，必须挂在子应用根节点下，必要时用 stylelint 规则卡口。



三、`全局变量污染怎么处理` 核心是“沙箱 + 约束”：

- `运行时用 JS 沙箱` ：`基于 Proxy 的沙箱（快，适合同域）拦截 window 读写`；对于兼容性或强隔离场景用 iframe 沙箱（隔离最强，成本也最高）。
- `工程约束上，要求第三方库尽量走模块化，不把变量挂到 window` ；必须挂时也要求统一命名空间，比如 window.__MF_APP_X__ 。



四、`路由冲突怎么处理` 我会把路由分层管理：

- `主应用负责“顶层路由编排”`，给每个子应用分配 basePath （例如 /app-a/** ），子应用内部只在自己的 basePath 下做路由。
- `history 统一策略`：要么主应用接管并下发 location 变化，要么约定子应用只用自己的 router（hash 或 memory），避免 서로抢占。
- `对“跳转到其他子应用”这类跨域跳转，一律走主应用提供的 navigate()` RPC，而不是子应用自己 pushState 。

最后我会补一句落地经验：微前端最怕“野生集成”。所以除了技术方案，我会配套三类治理：通信协议文档化和版本化、lint/CI 规则限制全局污染、以及可观测与降级开关。这样方案不仅能跑，还能长期演进。




### 在字节的电商/支付场景中，前端如何配合后端做请求防重放、参数防篡改及敏感信息脱敏?

第一， `请求防重放`：
- `带上时间窗与随机数` ：请求头里加 ts + nonce ，并参与签名；后端按时间窗校验、nonce 做去重（Redis/本地缓存）。
- `幂等键` ：下单/支付确认这种接口`前端生成 Idempotency-Key` （或后端下发 token），后端做幂等落库/缓存，保证重复点击、弱网重试都只生效一次。
- `一次性凭证` ：`进入收银台前后端下发一次性 payToken ，前端只做透传与过期处理`，后端验证 token 是否已使用/是否匹配用户与订单。


第二， `参数防篡改`
- 签名 ：前端对“参与业务校验的字段”做规范化（字段排序、空值规则、编码规则）后计算签名，把 sign + ts + nonce 一起带上；后端用同样规则验签。`密钥不放前端明文`：要么用后端会话级派生的短期 key，要么直接用后端下发的签名结果/一次性 token，`前端只透传`。
- `关键参数后端计算 ：金额、优惠、库存、收款方这类，前端只传选择意图（券 id、地址 id），最终价格与校验在后端完成；前端做的是减少可篡改面`。
- `链路绑定 ：把 userId、设备指纹/风控因子、订单号、token 绑定进签名材料`，避免“拿到一份请求包换个订单号就复用”。


第三， `敏感信息脱敏`
- `展示脱敏` ：手机号、身份证、银行卡在 UI 层默认掩码，只在用户明确操作且通过二次验证时短暂展示；截图/复制做能力控制（能做则做）。
- 传输保护 ：全站 HTTPS；对特别敏感字段（如卡号 CVV）尽量走受控组件/加密通道（例如后端下发公钥，前端只做加密提交，后端解密）。
- `本地存储最小化 ：不把敏感字段落到 localStorage`；避免在 URL/query、埋点、错误上报里出现明文。
- `日志与埋点脱敏 ：前端统一封装请求与埋点 SDK，做字段级白名单/黑名单与正则脱敏，确保任何上报默认不带敏感信息`。

最后我会补一句落地方法：`这些能力最好沉到“统一请求层 + 网关/风控”，前端通过规范的拦截器自动加 ts/nonce/idemKey/sign ，并配合后端对齐签名规则、时钟漂移策略和错误码重试策略`，这样链路既安全也可维护。




### 数据可视化与海量点渲染：如果需要在Canvas中渲染10万+个点，并支持缩放、拖拽与实时筛选，如何优化渲染性能？Web Worker在这里能起到什么作用?


### 前端监控与异常恢复：如何设计一套前端错误监控体系，当线上出现Script Error时，如何自动还原源码错误堆栈？如何实现页面白屏的自动检测与恢复?

第一，监控体系怎么设计。我通常按“`数据采集—处理上报—存储分析—告警分派—处置闭环`”来搭：

- `采集层`覆盖四类信号：`JS 运行时异常（ error / unhandledrejection ）、资源异常（ img/script/css 加载失败）、性能与体验指标（FCP/LCP/CLS/TTI、长任务、接口耗时）、业务关键路径埋点（下单/登录等）`。
- `上报层`做`采样、去重、节流、离线缓存与重试，打全链路上下文`：用户/设备/网络、路由、发布版本、commit、灰度桶、最近用户操作 breadcrumb。
- `分析与告警层`要能按“`版本、页面、错误指纹、影响用户数、发生率`”聚合，`并能自动创建工单、关联发布与回滚`。


第二，Script Error 怎么自动还原源码堆栈：

源码还原：`构建时上传 sourcemap 到符号化服务`（自建或类似 Sentry 的 pipeline），`sourcemap 不对外公开，只在服务端用`；上报时带 release(版本) 、 dist(构建号) 、 bundle hash ，服务端按版本精确匹配 map，把压缩堆栈映射回 TS/源码行列，并做“错误指纹”归一化（去掉动态参数、合并同类）。


第三，白屏怎么自动检测与恢复：

- 检测：`首屏后 3~5 秒做一次轻量探针`，比如检查 root 容器是否为空/仅骨架、是否存在关键节点，`结合 PerformanceObserver 判断是否发生长任务卡死`；再配合截图/像素采样要谨慎，一般只在灰度或抽样开启。
- 归因：区分是 JS 崩溃、资源 404、接口挂了、还是渲染被卡住，并把“`最近一次异常事件+网络失败`”作为白屏的根因候选。
- 恢复：优先软恢复而不是硬刷新。React/Vue 用 ErrorBoundary/全局错误边界兜底渲染“可用的降级页”，并提供一键重试；`如果判断是资源版本不一致或 chunk 丢失，就清理缓存并强制刷新到最新版本；如果是接口故障就切换到降级数据源或静态兜底`；同时触发自动熔断/灰度回滚（按版本错误率阈值）和远程开关关闭高风险功能。


SLO 指标来衡量：`错误发现时间、定位时间、恢复时间、以及同类问题复发率`。



### 实时通信与消息推送：如何设计一个WebSocket消息推送的可靠机制？当连接断开时，如何通过HTTP轮询或SSE做降级补偿，并保证消息不丢失、不乱序？




### 大文件上传与断点续传：如何设计一个支持大文件分片、断点续传、秒传和并发控制的上传组件？计算文件Hash的最佳时机是什么？如何避免计算Hash导致的UI卡顿?

第一， `组件能力设计。`上传组件我会做成一个“`任务状态机 + 分片调度器`”。输入是 File，输出是任务生命周期事件（进度、暂停、恢复、完成、失败）。核心流程是：
- `切片` ：按固定大小（比如 5–20MB，可动态调整）把文件切成 chunks，每个 chunk 有 index/size/blob ，并生成`文件指纹 fileId` 。
- 建会话 ：先调 initUpload(fileId, fileMeta) ，服务端返回 uploadId 和已上传的 uploadedParts （或 etag 列表）。这一步就支持 断点续传 ：本地/服务端任一方有记录都能续上。
- 并发控制 ：用一个并发队列（类似信号量 semaphore），控制同时上传 N 个分片；失败的分片按指数退避重试，支持暂停/恢复就是“停止发新请求 + 保存当前已完成分片集合”。
- 合并 ：全部分片上传完调用 completeUpload(uploadId, parts) 触发服务端合并，并在合并后做一次校验（比如对最终文件 hash 或长度）。


第二， `秒传` 本质是去重命中：服务端根据 fileId 判断是否已有同内容文件。命中则直接返回已存在的资源地址，不需要上传；未命中才走分片上传。为了提升命中率和鲁棒性，通常还会配合：chunk 级别校验（每片 hash/etag）、以及服务端的“已上传分片查询”接口。




### PWA与离线存储：如何利用Service Worker和IndexedDB设计一个离线优先的应用？当用户清理缓存时，如何制定智能清理策略，确保核心资源不丢失?

首先，离线优先的目标不是“永远不丢”，而是“`离线可用、可写可读、联网后可恢复同步`”。架构上我会把东西分两类： `静态资源走 Service Worker Cache Storage ， 业务数据走 IndexedDB`。

`Service Worker` 侧 我会做三层缓存：
1. `App Shell 预缓存` ：`install 阶段预缓存最小可运行壳（入口 HTML、核心 JS/CSS、字体、离线页、基础图标），确保首次成功安装后离线能启动`。配合构建产物的 content-hash，做到可控更新。
2. `运行时缓存` ：`对 API、图片等用策略化缓存`，比如页面/接口用 stale-while-revalidate 或 network-first（离线回退到缓存），图片用 cache-first 并限制数量/时长。
3. `离线降级` ：统一兜底，`离线时返回离线页或上一次成功数据，避免白屏`。


`IndexedDB` 侧 我会存“可恢复的业务态”：
- 读：优先读 IDB（本地快），并记录更新时间；`联网后拉增量更新写回`。
- 写：离线写入 IDB 的 outbox（待同步队列），联网后用 Background Sync/定时重试上报；`服务端用幂等键避免重复提交，必要时做冲突策略（时间戳/版本号/合并规则）`。


`用户清理缓存如何智能清理，核心资源不丢`”：我会分两种情况讲清楚边界。
- `应用可控的清理` （我们主动清理）：在 SW 的 activate 做版本化清理，采用 allowlist 只删旧版本 cache；运行时缓存再做配额策略（maxEntries/maxAge），甚至在 IDB 维护 LRU 索引来淘汰非核心大资源，核心的 precache 永远保留。
- `用户主动清理站点数据/浏览器清理` （应用不可控）：`这个无法“保证不丢”，但可以“保证可快速恢复”`。做法是：用 StorageManager.persist() 申请持久化存储降低被系统回收概率；同时把核心壳做得足够小，缓存被清空后只要一联网就能快速重新预缓存恢复；并在 UI 上提示“离线能力需要保留站点数据”。




### 你在项目中应用过哪些设计模式？如何用发布-订阅模式解耦组件通信？


### 如何用代理模式实现图片懒加载或缓存?

代理模式本质是：`不直接操作真实对象，而是通过一个“代理”做访问控制、延迟执行、缓存复用等`。放到图片场景里，真实对象就是“真正发起图片请求并渲染到 DOM 的那一步”，代理的职责就是在合适的时机才让它发生，并且把重复成本降下来。

一、用代理做图片懒加载（Virtual Proxy）

我的做法是`让页面先渲染占位图或骨架`，真正的图片 URL 放在 data-src 。`代理层监听元素是否进入视口`：
- 触发条件用 `IntersectionObserver` （不支持时降级为 scroll + throttle）。
- `一旦进入视口，代理才把 img.src = dataSrc` ，并处理 loading/error 状态（比如失败重试、兜底图）。
- 代理还能做“并发控制”和“取消”：比如同一时间只加载 N 张，离开视口可以不再触发，避免带宽被瞬时打爆。

这样`组件只管“我有个 data-src”，是否加载、何时加载、加载策略都由代理统一管理，实现解耦`。


二、用代理做图片缓存（Caching Proxy）

缓存代理的目标是：`同一个 URL 不重复下载、不重复解码，并且能复用“正在进行中的请求”`。我一般会做两层：
- `内存层`： `Map(url -> Promise<HTMLImageElement/Blob>) `，如果同 URL 同时被多个地方请求，直接复用同一个 in-flight Promise，避免并发重复请求。成功后把结果缓存起来，后续直接命中；`再加 LRU/TTL 防止内存无限增长`。
- `持久层`（可选）：`用 Service Worker + Cache Storage 做网络层代理，把图片响应缓存下来，离线可用、二次打开更快`；或者对弱网场景做 stale-while-revalidate。

业务组件调用的是 imageProxy.load(url) ，拿到的要么是缓存命中结果，要么是代理替你发起的真实加载。

最后我会补一句边界 ：懒加载要注意首屏优先级和 CLS（提前占位尺寸），缓存要注意跨域策略、缓存失效和内存上限。整体上，代理模式带来的价值是：把“时机控制 + 资源复用 + 策略治理”集中到一处，页面代码会更干净，也更可控。




### 如果让你从零开始搭建一个中大型项目，你会如何选择技术栈？如何设计目录结构、复用逻辑层、API层，以保证项目长期可维护?

第一步是`明确约束`：业务形态（是否要 SSR/SEO、是否多端、是否多应用）、团队能力（React/Vue熟练度）、交付节奏、以及未来 1~2 年的演进（是否会做微前端、是否要做组件平台）。在这个前提下选技术栈我会遵循“`少而稳、强约束、可扩展`”。

目录结构我会用“`分层 + 按领域纵切`”的混合：`公共能力水平分层，业务按领域聚合`，避免按技术类型把文件散落导致耦合


`复用逻辑层`我强调“分三层复用”：`UI 复用`（组件库+Storybook规范）、`业务复用`（以 domain service 和组合 hooks 复用，不在组件里写流程）、`数据复用`（React Query 的 queryKey 规范、缓存策略、失效策略统一）。API 层我会统一：请求封装、鉴权、重试、错误处理、日志/埋点、以及 DTO→领域模型的转换，保证业务不直接依赖后端字段结构。

最后是`长期可维护的“治理”`：`强约束工具链`（ESLint/Prettier/Stylelint、commit 规范、CI 必跑 lint/typecheck/test）、质量体系（单测覆盖核心 domain、关键链路 E2E、组件层可视化回归）、以及架构守护（模块边界 lint 规则、禁止跨域引用、依赖图检查）。这样做的目标是：`新功能尽量在领域内闭环，公共能力沉到 shared，接口变更可控，团队扩张时也不至于失控`。








### 打开抖音/今日头条，你觉得哪些交互细节做得特别好？如果你是前端负责人，你会如何从技术上保障用户滑动视频时的丝滑感与即时响应？

第一，`先定可量化的体验指标和性能预算`。比如`滑动交互必须保持接近 60fps`（或至少稳定在设备刷新率的合理区间），关键是`控制长任务、掉帧率、首帧时间、滑动到下一条的可播放时间`。上线后用 RUM 采集真实用户的 FPS、Long Task、首帧、卡顿点位，做到“可观测”。


第二，架构上围绕“`主线程不阻塞、渲染不抖、资源不断供`”来设计。
- `渲染与交互`：`滑动容器尽量用原生滚动能力`（必要时配合 scroll-snap），事件监听用 passive，避免在 touchmove/scroll 里做任何重计算；`动画只走合成层（transform/opacity），避免频繁 layout/paint`；`把 JS 更新节奏绑定到 requestAnimationFrame，减少同步读写样式导致的抖动`。
- `列表与组件`：`只渲染可视区，做虚拟化`/窗口化；下一条、上几条用“`预渲染但不抢主线程`”的策略；`组件层面严格控制重渲染（状态分层、memo、稳定引用），把与播放无关的 UI 更新隔离出去，避免一滑动整棵树重算`。
- `播放与资源`：`播放器实例复用，避免频繁销毁创建`；`对下一条视频做预加载与缓存`（封面、元数据、首段分片），滑到一半就能“秒起播”；网络侧做自适应码率、失败重试与降级策略，`弱网时优先保障“能播、先播起来”，再逐步提清晰度`。
- 计算下沉：`把推荐/埋点加工/复杂计算放到 Web Worker，主线程只做轻量调度`；`大任务切片执行`（scheduler/idle 分片），确保输入响应不被长任务打断。
第三，工程化持续治理，防回归。把性能当成“功能”验收：`有固定的性能基线与报警阈值`；每次发版做关键链路 profiling，`对掉帧和长任务做归因`；核心策略加灰度和开关，出现机型或版本回归能快速止血。

总结一句：`用指标定义“丝滑”，用渲染/线程/资源三条线保证“主线程永远轻”，再用监控与基线让它长期不退化`。这样面试官也能看到我既懂体验目标，也能落到可执行的技术方案和治理闭环。



### 如果让你负责来搭建一个低代码平台，你会怎么进行架构设计？

如果我来负责搭建一个低代码平台，我会先把它当成“面向多角色的产品工程体系”来做，而不是单纯做一个拖拽页面。我的回答通常会按「`目标与边界 → 核心抽象 → 分层架构 → 关键技术点 → 质量与演进`」来讲，确保可落地、可扩展、可治理。

**先对齐目标与边界（决定架构上限）**

- `主要交付物`：是搭页面（营销/活动页）、搭业务后台（表单/流程/列表）、还是搭大屏（可视化）？三者运行时、组件体系、性能模型完全不同。
- `目标用户与协作方式` ：运营/产品/实施/研发分别需要什么能力？是否需要多人协作、审批发布、灰度？
- `扩展策略` ：希望平台“通用”到什么程度？是 80% 场景开箱即用 + 20% 代码扩展，还是要求几乎所有场景都可配置完成？这会直接影响 DSL 设计、插件体系和渲染引擎复杂度。



**核心抽象`：用 DSL 把“编辑态”和“运行态”分开**

> 低代码平台能长期演进的关键，是抽象稳定。我一般会把核心抽象定为：
- `页面/应用 DSL（Schema）` ：用 JSON/DSL 表达页面结构、组件树、布局、样式、事件、数据源、权限、国际化等。
- `运行时 Runtime` ：只负责把 Schema 渲染成 UI，并提供数据流、事件系统、插件机制。
- `编辑器 Editor` ：负责可视化搭建、属性面板、组件库管理、Schema 生产与校验。

`Editor 生成 Schema，Runtime 消费 Schema 。`




**分层架构设计（我会这样拆）**

A. `基础设施层`（Platform Foundation）
- `多租户与权限模型` ：组织/空间/应用/页面/组件资源的 ACL/RBAC，配合审计日志。
- `资产与制品仓库` ：Schema、组件包、主题包、模板、数据源配置、图标字体等统一存储与版本管理。
- `环境与发布体系` ：dev/test/prod 环境隔离，支持灰度、回滚、依赖锁定（组件版本锁定）。


B. `物料体系`（Materials / Component System）
> 这是低代码成败的 50%。我会把物料分三类，并用一致协议管理：
- `基础 UI 组件` ：按钮、表单项、表格等，强调一致性与可配置性。
- `业务组件` ：如“客户选择器/订单明细”等，强调领域复用，通常由业务团队共建。
- `区块/模板（Blocks/Templates）` ：可直接拖入的成品片段，提高搭建效率。
> 同时定义组件协议 ：props schema、events、slots、样式隔离策略、可编辑元信息（用于属性面板自动生成）、可访问性约束等。


C. `编辑器层`（Low-code Editor）
> 编辑器我会按“搭建链路”拆：
- `画布与拖拽编排` ：所见即所得/近似所见即所得，组件树、布局系统（栅格/自由布局/流式）。
- `属性面板自动化` ：基于组件的 props schema 自动生成表单，支持动态显隐、联动校验。
- `事件编排` ：把“用户操作 → 动作”抽象成 Action Flow（比如跳转、弹窗、请求、赋值、埋点），支持条件、并行/串行、错误分支。
- `数据源与模型` ：可视化配置 API/SQL/GraphQL/Mock，做字段映射、转换、缓存策略；沉淀“数据模型层”避免页面里散落请求配置。
- `校验与诊断` ：Schema 校验、依赖校验、权限校验、性能提示（比如组件数量、渲染耗时风险）。


D. `运行时层`（Runtime Rendering Engine）
> 运行时我会重点保证三件事：稳定、性能、可扩展。
- `渲染引擎` ：Schema → 虚拟节点树 → 真实 UI（React/Vue 都可），支持懒加载、局部更新、错误边界。
- `状态与数据流` ：统一 store（页面级/应用级），配合副作用管理（请求、缓存、轮询、取消）。
- `插件机制` ：渲染生命周期钩子、事件拦截、数据源扩展、权限/埋点/AB 实验注入。
- `安全沙箱`  ：表达式/脚本能力要可控（白名单函数、AST 解析、禁用危险 API），防止 XSS/越权请求。


#### Q：Schema 设计怎么避免失控？

1. `Schema 分层`：结构（layout/tree）/样式（theme/tokens）/行为（actions）/数据（models）拆开，避免一个大 JSON 难维护；
2. `版本化与迁移`：schemaVersion + migrate 管道，保证历史资产可用；
3. `严格校验`：JSON Schema/TS 类型约束 + 运行时兜底，线上只跑校验通过的制品。


#### 扩展能力怎么做，避免把平台写成“第二个业务系统”？
> 通过“插件点 + 物料协议”控制扩展边界：
- 业务尽量沉到“业务组件/区块”，平台只提供编排能力；
- 对外开放 Extension API（组件注册、动作注册、数据源适配器、面板扩展），而不是让业务随意改内核。


#### 性能怎么保障？
> 我会分别优化编辑态和运行态：
- 编辑态：`画布虚拟化、组件占位渲染、操作合批、拖拽热区计算优化`；
- 运行态：`组件懒加载、列表虚拟滚动、状态分片订阅、表达式预编译、资源按路由/页面拆包`；
- 配套性能指标：`首屏、交互延迟、编辑器操作耗时、Schema 规模阈值告警`。


#### 质量与治理怎么做？
> 我会把它当“平台工程”来治理：
- 权限/审计/审批流；
- 组件准入（规范、可访问性、性能预算、兼容性）；
- 线上监控与回滚（错误、白屏、接口失败、渲染耗时）；
- 资产可追溯（谁在什么时候发布了什么组件/页面）。


**落地路径（确保不是 PPT 架构）**
- `MVP` ：基础组件库 + 页面 Schema + Runtime 渲染 + 简单拖拽 + 属性编辑 + 发布。
- `增强` ：事件编排/数据源/模板市场/权限与版本/灰度回滚。
- `平台化` ：插件生态、多人协作、跨端渲染、企业级治理与可观测性。



————————————


### 招行App首页的秒级渲染方案，以及理财产品秒杀页在高并发下如何保证倒计时精度和防刷机制。


**首页秒级渲染方案（移动 App 首页 / 混合容器通用）**

- `场景/痛点` ：首页模块多、链路长（资源+数据+渲染），弱网/低端机容易白屏或卡顿。
- `目标拆解 `：把“秒级体验”拆成 4 个阶段并分别优化
  - 框架/骨架可见
  - 首屏关键模块可见
  - 首屏关键模块可交互
  - 全量内容补齐

- `核心方案` ：
  - `离线化/预置` ：首页壳、核心组件、样式/骨架走离线包或预置包；启动优先命中本地版本，后台差分更新+灰度+回滚。
  - `数据分层` ：首屏只拉关键数据（资产/常用入口/核心推荐），非首屏延后；接口做 BFF 聚合减少 RTT。
  - `缓存先渲染` ：本地缓存上次成功数据先出画面；网络回包后做增量 patch，避免整页重绘。
  - `渲染调度` ：模块化编排+优先级调度（高优同步、低优 idle/分帧）；列表虚拟化；图片首屏预加载、非首屏懒加载；减少 bridge 次数（批量通信）。
  - `稳定性兜底` ：超时降级到缓存/静态配置，低配模式/开关控制，白屏监控与快速回滚。


`首页：离线化 + 缓存先渲染 + 分级加载/分帧渲染，保证秒级可见与可交互`


**理财产品秒杀：倒计时精度 + 高并发防刷**

- `倒计时精度（展示层`） ：
  - 原则 ：`服务端时间为准，客户端只展示；是否可下单只看服务端`。
  - 做法 ：接口返回 serverNow + startAt/endAt ，客户端算 offset ；用 `单调时钟` 累计避免用户改系统时间导致跳变；`每隔 N 秒轻量校准，临界点（最后 3~5 秒）提高 UI 刷新频率但不改变判定逻辑`。
- `防刷与公平（链路层） `：
  - `防篡改/防重放` ：请求签名（timestamp/nonce/设备信息），服务端校验；关键参数不信任前端。
  - 分层限流 ：CDN/WAF（Bot/挑战/黑白名单）→ 网关（账号/设备/IP 令牌桶）→ 业务（同人同场次限频、在途请求控制）。
  - `资格令牌/排队削峰`（重点亮点） ：开抢前下发短 TTL 一次性“资格令牌”，下单必须携带；同时在入口做排队，把洪峰变成可控吞吐。
  - 库存与一致性 ：Redis 原子预扣库存 + 异步落库；订单幂等键（userId+activityId），重复请求返回同一结果，避免多次扣减与穿透。

- 结果表达（面试口径） ：
  - 峰值 QPS 扛到 X；核心下单 response time 稳在 P99 = Xms
  - 刷单/异常请求拦截率 X%，有效请求占比提升 X%
  - 超卖为 0（或降低到 X），投诉/异常工单下降 X%


- Q：`客户端倒计时到 0 就能下单吗？`
 A：不能。客户端 0 只是展示提示，是否可下单以服务端校验为准（时间窗+资格令牌+库存）。
- Q：`用户改手机时间怎么办？`
 A：展示用 serverNow 计算 offset，并用单调时钟累计，系统时间变化不会影响倒计时走向；同时定期与服务端平滑校准。
- Q：`如何保证公平，防止脚本秒抢？`
 A：入口分层限流+风控评分，关键是资格令牌/排队闸门把“抢”变成“可控进入核心链路”，再配合幂等与原子扣减避免重复与超卖。
- Q：`为什么首页能秒开？你的关键抓手是什么？`
 A：离线化让资源链路变短，缓存让首屏先出画面，数据分层和渲染调度让主线程更轻；再用监控+降级保证稳定体验。


`单调时钟怎么用？`
> 单调时钟是指在系统中，时间的增加是单调的，不会因为系统时间的改变而改变。`Web：performance.now()` （高精度、单调递增，不受 Date 被改影响）
1. 用服务端下发的 serverNow 算出 offset = serverNow - Date.now() （对齐“服务端真实时间”）
2. 之后倒计时每次刷新用单调时钟算经过时间： remain = endAt - (Date.now() + offset + elapsedByMonotonic):这样就算用户改系统时间， elapsedByMonotonic 仍然稳定递增，倒计时不会回跳；`同时定期用接口再校准 offset 做平滑纠偏`。


`秒杀：服务端时间权威 + 单调时钟抗漂移，资格令牌/排队削峰 + 分层限流 + 幂等与原子扣减，保证精度、公平与稳定。`



### 针对可视化资产大盘的渲染性能优化

**总体思路：**
- `先量化`：明确指标（首屏/可交互时间、FPS、交互延迟、内存峰值、长任务占比），用 Performance/React Profiler/火焰图定位“慢在数据、慢在布局、慢在绘制、慢在 JS 计算”哪一类
- 再分层：`数据层（计算/聚合/请求）→ 渲染层（DOM/Canvas/WebGL）→ 交互层（事件/动画/调度）分别优化，避免只在某一层“打补丁”`


**数据与计算层（很多大盘其实卡在这里）**

- 分级细节（LOD）：`缩放/概览用聚合数据，放大/局部再切到明细`；表格/列表同理（概览字段 vs 详情字段）
- 增量计算：`只对变更部分重算`（diff + memo），避免每次刷新全量聚合/排序/布局
- Worker 化：`重 CPU 的聚合、布局计算、数据解析放 Web Worker`；图表用 `OffscreenCanvas`（可用时）把绘制也挪出主线程
- `请求与缓存`：ETag/Cache-Control、按时间窗口分页、预取下一屏数据；同一维度聚合结果做内存/IndexedDB 缓存（带版本号）


**渲染层：DOM（React/Vue）优化**

- 渲染范围控制：`大列表/卡片瀑布流必须虚拟滚动`（只渲染可视区域 + overscan），避免“几千个节点同时在 DOM”
- 减少无效重渲染：`稳定 props（useMemo/useCallback）、组件拆分边界清晰`、避免把大对象/函数每次 new；状态下沉到最小影响面
- 降低 Diff 成本：列表 key 稳定且语义正确；`避免在 render 中做 map 大计算/排序`（移到 memo/selector）
- 批量更新与调度：`把高频状态合并到一次 setState；用 requestAnimationFrame 对齐绘制；对输入/拖拽做节流（并保证末次触发）`
- 选择器与状态管理：`全局状态用 selector 精准订阅（避免“任何字段变化导致整页刷新”）`；派生数据缓存（reselect/computed）
- 避免布局抖动：`读写 DOM 分离（先读后写）、避免在循环里触发 layout；用 transform/opacity 做动画，少用 top/left/height 触发布局`
- 降低重绘面积：组件层级扁平化；适当使用 contain（layout/paint/size）隔离影响范围
- 固定尺寸占位：`卡片、图表容器、图片先给确定宽高，避免频繁 reflow`


**渲染层：Canvas / WebGL / 图表库优化（大盘常用）**

- 渲染模式选择：`大量点/线优先 Canvas/WebGL`（ECharts large/progressive、AntV G2/G6、deck.gl），DOM/SVG 适合少量、需可访问性/精细交互的部分
- Progressive 渲染：`分帧绘制（progressiveThreshold）、分块 append 数据，避免一次 draw 卡死主线程`
- `静动态分层：背景网格/坐标轴/装饰放静态层缓存；数据层单独重绘`；多图表用共享纹理/共享缓存


**交互与实时刷新（大盘的“持续压力”）**

- 刷新策略：`全量轮询改为增量推送（WebSocket/SSE）+ 合并窗口`；UI 刷新频率与数据频率解耦（例如数据 1s 来一次，UI 200ms 合并渲染一次）
- 优先级：交互优先（输入/拖拽）> 视觉补帧；用 scheduler/raf 把低优先级任务拆分
- 降级机制：CPU/内存/掉帧到阈值时自动降采样、关闭阴影/渐变/动画、降低图表细节


**工程化与交付层（保证“持续不回退”）**

- 代码分割与懒加载：`按路由/模块/图表类型拆包；大图表库按需引入；首屏只加载关键资产`
- 性能守门：设 performance budget（bundle 体积、FCP/LCP、TBT/INP、长任务数），CI 里跑 Lighthouse/自定义脚本做回归告警
- 监控与告警：`RUM 上报长任务、FPS、内存、白屏/卡死；区分设备档位`（低端机单独看）
- 预渲染/骨架：`大盘首屏用骨架 + 关键模块优先渲染，非关键模块延后`（提高“感知性能”）



### 结合你多年的前端架构经验，给我讲讲你的微前端架构下多技术栈的整合方案

在微前端架构下做“多技术栈整合”，核心不是把 React/Vue/Angular 物理拼在一起，而是用一套“运行时协议 + 工程约束 + 交付流程”把它们治理成同一种产品体验。我的整合方案一般会按“分层 + 契约 + 治理”来落地。


**总体分层：基座（Shell）+ 子应用（MFE）+ 平台能力（Platform）**

- `基座 Shell` ：只负责`路由编排、加载策略、统一框架能力注入（鉴权、埋点、国际化、主题、错误边界、灰度开关）、统一布局（Header/Sider）与微应用容器渲染`。
- `子应用 MFE` ：业务自治（技术栈自选、独立构建、独立发布），对外只暴露标准生命周期与少量契约接口。
- `平台能力 Platform` ：注册中心（应用元数据）、发布/回滚、灰度、监控告警、日志/链路、统一配置与开关系统。

这一层次能保证“技术栈多样性”被约束在子应用内部，系统复杂度不会外溢到全局。


**运行时整合路线：三种主流方案怎么选**

`A. 基座编排型（single-spa / qiankun 类）`
- 适合：需要快速把多技术栈业务拼成一个壳、团队拆分明显、历史包袱多。
- 关键点：
  - 子应用提供 bootstrap/mount/unmount 生命周期（或等价协议）。
  - 基座统一路由与加载，子应用内部可用各自路由。
  - 隔离：CSS/JS 沙箱、公共依赖外置、全局污染治理。

`B. 构建时联邦（Webpack Module Federation / Vite federation）`
- 适合：依赖共享诉求强（大量共用组件/工具）、更追求极致性能与更自然的模块化复用。
- 关键点：
  - Host/Remote 共享依赖版本策略（singleton / strictVersion）要治理，否则线上会“隐性双实例”。
  - 更适合“同构生态圈”（例如都在 React 体系）跨团队复用；跨 Angular/Vue 也能做但治理成本更高。

`C. 强隔离型（iframe / Web Components）`
- 适合：安全边界强、遗留系统多、互相不信任或需完全隔离（含 CSS/运行时）。
- 关键点：
  - iframe 体验与通信成本更高；Web Components 可更轻，但对复杂应用生命周期治理要做得更严。

`多数企业“多栈并存 + 遗留系统多”的场景，先用 基座编排型 做组织与交付解耦；对性能/共享要求高的核心域，再逐步引入 模块联邦 做深度复用。`


**契约优先”：多技术栈能长期共存的关键**

- `子应用接入契约（必须标准化）`
  - 生命周期： mount/unmount （以及可选 update ）。
  - 渲染容器：子应用只能渲染到基座给定 DOM 节点，不得侵入全局。
  - 运行上下文：基座注入 runtime 对象（只读配置、用户态信息、能力 API）。

- `路由契约（最容易翻车）`
  - 推荐：`基座控制一级路由，子应用控制二级路由`
    例如： /crm/* 交给 CRM 子应用内部路由。
  - `统一约定：history 模式、basename、路由切换时机、404/权限页归属`。

- `通信契约（禁止随意 window 全局变量）`
  - 事件总线 ：用于“弱一致”事件（登录态变化、主题切换、语言切换）。
  - 共享状态（有限） ：跨应用强一致状态不要扩散，建议收敛在“平台域”里（例如用户/权限/租户）。实现上可用：
    - 基座提供 runtime.store （只放平台态）
    - 或 BFF/后端作为事实来源，前端只做缓存
- `请求与鉴权 ：统一由基座下发 token/租户信息、统一刷新策略；子应用通过基座提供的 httpClient 发请求，避免各自实现导致安全与刷新逻辑割裂`。


**样式与运行时隔离：决定“能不能拼得像一个产品”**

- `CSS 隔离优先级` ：BEM/模块化（CSS Modules）> 前缀约束 > Shadow DOM（局部强隔离）> 运行时样式沙箱（兜底）。
- `设计系统统一` ：哪怕技术栈不同，也要统一 Token（颜色/字号/间距/圆角/动效），否则“拼贴感”不可避免。实践上用一份 tokens（JSON）生成各栈消费物（CSS vars、TS 变量、Less/Sass 变量）。
- `字体/图标/主题` ：基座统一注入（CSS vars + icon registry），子应用只消费，不重复打包。


**依赖共享与版本治理：性能与稳定性的平衡**

- 共享什么
  - `必共享：设计 tokens、埋点 SDK、权限 SDK、HTTP SDK、国际化资源加载器`
  - 慎共享：React/Vue 运行时（共享能省体积，但版本治理极难）
- 策略
  - 编排型：公共依赖用 externals + CDN（版本锁死）或基座提供依赖（强治理）。
  - 联邦型：shared 设定 singleton/strictVersion，并建立“依赖变更评审”机制。


**工程与交付：多团队多栈要靠平台化**
- `应用注册中心` ：记录子应用入口、版本、路由前缀、灰度规则、依赖要求、能力开关。
- `发布策略` ：`子应用独立发布；基座只需“配置更新”即可接入新版本`（避免基座频繁发版）。
- 灰度与回滚 ：按租户/用户/百分比；`子应用版本可快速回滚，基座可一键切换入口`。
- 本地开发体验 ：统一 dev proxy、联调环境与 mock 协议；支持基座本地 + 子应用远程、或全本地矩阵组合。


**可观测性与故障隔离：线上稳定性底座**
- `统一埋点 ：基座采集页面级（PV/导航/性能），子应用采集业务事件`；统一 traceId 串联前后端。
- 错误边界 ：`子应用崩溃不拖垮基座；基座可降级为“重试/回退版本/静态兜底页”`。
- 性能治理 ：`预加载（按路由预测）、资源分组缓存、子应用懒加载、共享资源长缓存`。







### 深入研究浏览器渲染原理、虚拟滚动优化、微前端架构等在前端金融场景的应用；

### 在敏感信息脱敏、扫码支付安全防护等场景，你积累了哪些前端安全方案呢？


**敏感信息脱敏**

- 分级与最小暴露 ：`先做数据分级（公开/内部/敏感/高敏），前端默认只拿“业务必需字段”，能由后端裁剪就不在前端出现；列表页/搜索结果只给脱敏后的摘要，详情页再按权限取明文（或临时解密）`。
- 展示层脱敏策略 ：`按场景做可配置规则（手机号/证件号/银行卡/邮箱/地址/姓名），支持“部分隐藏 + 最后四位 + 可控显隐”。高敏信息用“按住查看/二次确认/再次鉴权”降低误泄露概率`。
- 权限与审计联动 ：`查看明文前触发二次校验（口令/短信/OTP/生物识别由宿主 App 完成）、记录谁在何时看了什么（前端埋点只传脱敏标识与字段类型，不传原值）`。
- 日志与监控脱敏 ：`前端错误上报、埋点、网络层日志统一做“敏感字段白名单/黑名单过滤”，在上报 SDK 层做拦截`（包括 URL query、headers、request/response body、Breadcrumb）。
- 缓存与存储治理 ：`避免把敏感数据落到 localStorage/sessionStorage/IndexedDB；必要时仅存短期 token/脱敏摘要；页面离开即清理内存态；对可下载文件/截图导出走强权限与水印策略`。
- 剪贴板与分享防漏 ：`复制按钮默认复制脱敏值；若必须复制明文，增加显式提示与二次确认，并对复制行为做审计。`



**扫码支付（二维码/条码/拉起支付）安全防护**

- “码内容不可相信”原则 ：`二维码内容一律当作不可信输入。解析时只接受约定协议与字段（schema 校验），超出字段直接拒绝；严禁把码内容直接拼接成跳转 URL 或接口参数`。
- 域名与路由白名单 ：`所有跳转（h5、deeplink、scheme）做严格白名单校验；对 redirect / returnUrl 做“同源/受控域名/路径前缀”限制`，防开放重定向与钓鱼落地。
- 签名与一次性凭证 ：`扫码后用于支付的关键参数（订单号、金额、商户号、回跳地址）必须由服务端生成并签名，前端只展示与传递`；使用短 TTL 的一次性 token（nonce + timestamp）防重放与串单。
- 支付状态以服务端为准 ：`前端展示“处理中/成功/失败”都以服务端查询结果为准`；回跳仅作为触发轮询/拉单，不以回跳参数直接判定成功。
- 防篡改与反钓鱼 UI ：`支付确认页强展示“商户名、金额、订单摘要、风险提示”，与服务端回传一致；发现域名不匹配/签名失败/环境异常时给出强提示并中断流程`。
- Web 基础对抗 ：支付页/收银台加 CSP 、 frame-ancestors （防点击劫持）、 SRI （三方资源完整性）、严格 Referrer-Policy ，避免把订单信息泄露到外域。


**通用前端安全基建（对这两类场景都关键）**

- `XSS 体系化治理` ：默认不使用 innerHTML /危险渲染；富文本走白名单 sanitizer；模板与 URL 参数统一编码；CSP 把风险从“可执行”降到“不可执行”。
- `CSRF/会话安全` ：`优先 httpOnly + SameSite Cookie`；必要时加 CSRF token；关键接口加二次校验与风控策略。
- 依赖与供应链安全 ：锁版本、SCA 扫描、最小化三方脚本；对必须引入的三方 SDK 做隔离（子域/沙箱 iframe）与权限收敛。
- 网络与接口防护协作 ：`前端做速率限制/按钮防连点/幂等 key`；与后端统一错误码与风控拦截（设备指纹、IP 风险、异常行为挑战）。



### 梳理高并发渲染项目经验，能用具体数据说明性能优化成果（如FPS提升、首屏加载耗时降低）；


### Webpack有哪些优化项目的手段？

构建时间优化、构建体积优化
- 构建时间优化：縮小范围、文件后缀、别名、缓存、并行构建、定向查找第三方模块
- 构建结果优化：压缩js、压缩 css、压缩 html、压缩图片、gzip
- 按需加载：prload. prefetch
- 代码分割：otree shaking


### 如果用户说web应用感觉很慢，该如何排查？


### 小程序的大概原理

**小程序的大概原理（以微信小程序为代表）**

- `宿主容器 + 双线程模型` ：小程序不是运行在浏览器里，而是运行在“宿主 App”的小程序容器中。通常分为
  - `逻辑层（JS 线程）` ：跑你的 JS、状态管理、业务逻辑、网络请求调用等。
  - `渲染层（UI/渲染线程）` ：把 WXML（模板）+ WXSS（样式）+ 组件树渲染成界面。

- `数据驱动渲染` ：页面/组件通过 data 作为状态源，调用 setData （或框架封装后的更新方式）把变更从逻辑层同步到渲染层，渲染层再做 diff/patch 更新视图。

- `通信靠 Bridge` ：逻辑层和渲染层不共享同一个运行时，`二者通过“桥接层（Native Bridge）”消息通信`；同理，`调用相机、扫码、支付、定位等能力，也是通过 Bridge 调宿主原生能力`。

- 组件化与运行时约束 ：`UI 不是 DOM，而是“平台组件”（view、text、button 等）。平台对可用标签、样式能力、事件模型、节点层级有明确限制`，以换取可控的性能与安全边界。

- 打包与加载 ：`代码以包（主包/分包）形式下发到本地缓存，进入页面按需加载；宿主负责版本管理、灰度、缓存与更新策略`。


**和普通 Web 开发的不同点（关键差异）**

- 运行环境不同 ：`Web 运行在浏览器（DOM/BOM/标准 Web API）；小程序运行在宿主容器（没有完整 DOM/BOM），很多能力通过平台 API 提供`。
- 渲染机制不同 ：`Web 直接操作 DOM（或通过框架抽象）；小程序是逻辑层与渲染层分离，通过 setData /消息同步更新，频繁大对象更新会带来明显成本`。
- 组件与样式受限 ：`可用组件集合、样式特性（选择器、定位、层级、滚动容器、字体等）存在平台限制`；不同平台（微信/支付宝/抖音等）还会有差异。
- `路由与生命周期不同` ：小程序是“页面栈 + onLoad/onShow/onHide/onUnload”等生命周期；Web 更偏向 history 路由、可见性事件、SPA 框架生命周期。
- 安全与能力边界不同 ：`小程序更强沙箱与审核体系，动态代码执行/外链脚本等通常受限；但能更方便地拿到扫码、支付、登录态等“强能力”`。
- 调试与发布模型不同 ：Web 以 URL 为入口、灰度与回滚多在服务端与 CDN；小程序以版本包为入口，更新、审核、分发、回滚遵循平台规则，线上问题定位也更依赖平台工具链。


**和普通 Web 开发的相同点**
- 核心仍是前端三件套思维 ：页面结构（模板）、样式、交互逻辑仍然存在，只是对应的载体从 HTML/CSS/DOM 变成了 WXML/WXSS/组件树。
- `同样需要工程化 ：模块化、构建、分包/按需加载、资源优化、埋点监控、异常上报、权限治理这些理念都一致。`
- 同样是数据驱动 UI ：`状态变化驱动视图更新，组件化拆分与复用仍是主线`。



——————

1.如何判断用户设备
- 答：优先用能力检测（feature detection）而不是 UA 猜测；确实需要识别时再用 UA/Client Hints。
- 常用手段：`navigator.userAgentData`（有则用，避免 UA 解析）、`navigator.userAgent`（兜底）、触屏能力（`'ontouchstart' in window` / `navigator.maxTouchPoints`）、屏幕与 DPR（`screen.width/height`、`devicePixelRatio`）、平台信息（iOS/Android/Windows/Mac）、是否 WebView（结合 UA 关键字 + 特性）。

2.将多次提交压缩成一次提交
- 答：做“批量提交/请求合并”：把多次触发先写入队列（内存或 `IndexedDB/localStorage`），用 debounce/定时窗口/`requestIdleCallback` 聚合成一个 payload（例如数组）后只发 1 次批量接口。
- 关键点：去重与覆盖（同一 id 取最后一次或合并 diff）、幂等（requestId/version 防重复落库）、失败重试与落盘续传、并发/取消控制（`AbortController`），必要时让后端提供 bulk API（一次提交多条变更）。

3.介绍下navigator.sendBeacon方法
- 答：用于在页面卸载/切后台等场景“尽力而为”地把少量数据异步发送到服务端，避免被浏览器中断。
- 特点：不阻塞跳转；不保证一定送达；请求体通常是 POST（`Blob/ArrayBuffer/FormData/string`）；拿不到业务级响应体（只关心是否成功入队）；适合埋点/日志。
- 替代/补充：`fetch(url, { method:'POST', body, keepalive:true })` 也可用于卸载阶段的小请求。

4.混动跟随导航（电梯导航）该如何实现
- 答：两件事：点击导航滚到目标区块；滚动时根据可见区块高亮当前导航（scroll spy）。
- 实现方案：用 `IntersectionObserver` 监听每个 section 的可见性（配 `rootMargin` 处理吸顶偏移），回调里设置 activeId；点击时 `element.scrollIntoView({ behavior:'smooth' })` 或 `window.scrollTo`（注意减去 header 高度）。
- 兼容兜底：不用 IO 时用 `scroll` + `requestAnimationFrame`/节流计算各 section 的 `getBoundingClientRect().top`。

5.退出浏览器之前，发送积压的埋点数据请求，该如何做？
- 答：把埋点先落本地队列（内存 + `localStorage/IndexedDB`），在 `pagehide`/`visibilitychange(hidden)` 时用 `sendBeacon` 或 `fetch keepalive` flush。
- 要点：控制 payload 大小与批量；失败/未发送完保留队列，下次启动重试；避免在 `beforeunload` 里做同步 XHR（已不推荐且体验差）。

6.如何统计页面的long task（长任务）[热度：140]
- 答：用 Long Tasks API：`PerformanceObserver` 监听 `entryTypes: ['longtask']`，统计 `duration > 50ms` 的任务数量、总耗时、分布（比如按 50-100/100-200/200+ms 桶）。
- 示例：累计 `entry.duration`，并结合时间窗（首屏/全程）与页面路由维度做上报；注意该 API 在部分浏览器/环境可能不可用，需降级（例如仅统计 TBT 或用 RUM 指标替代）。

7.PerfoemanceObserver如何测量页面性能
- 答：`PerformanceObserver` 用来订阅浏览器产生的性能条目（PerformanceEntry），实时或补录（`buffered: true`）拿到关键指标。
- 常用 entryTypes：`navigation`（TTFB、DNS、TCP、请求/响应等）、`paint`（FCP/FP）、`largest-contentful-paint`（LCP）、`first-input`（FID）、`layout-shift`（CLS）、`resource`（资源耗时）、`longtask`（长任务）。
- 示例：
```js
const po = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // 上报 entry.name / entry.startTime / entry.duration 等
  }
});
po.observe({ entryTypes: ['navigation', 'paint', 'resource', 'longtask'], buffered: true });
```

8.移动端如何实现下拉滚动加载（顶部加载）
- 答：核心是“到顶 + 下拉手势 + 触发加载 + 回弹还原”。
- 实现思路：在可滚动容器 `scrollTop === 0` 且 `touchstart` 记录起点；`touchmove` 下拉时计算位移（加阻尼），展示 loading；超过阈值在 `touchend` 触发加载并保持 loading，高度回弹后恢复。
- 工程要点：处理 iOS 橡皮筋（可用容器滚动替代 body 滚动、合理设置 `overscroll-behavior`）、防止多次触发（loading 锁）、请求失败提示与恢复。

9.判断页签是否为活跃状态
- 答：用 Page Visibility API：`document.visibilityState === 'visible'` / `document.hidden`，监听 `visibilitychange`。
- 辅助：`window.focus/blur` 判断是否聚焦；页面被放入 BFCache/离开用 `pagehide/pageshow` 区分。

10.在网络带宽一定的情况下，切片上传感觉和整体上传消费的时间应该是差不多的这种说法正确吗？
- 答：不严格正确。`理想情况下“串行切片”总耗时≈整体上传 + 额外开销`（多次请求的握手/头部/调度/校验）；实际还受 RTT、并发、丢包重传、服务端合并、限流影响。
- `切片的主要收益是可断点续传与失败重试成本更低`；如果开启并发切片，可能更好地利用带宽、缩短总耗时，但也可能被服务端/网络限流导致更慢。

11.大文件切片上传的时候，确定切片数量的时候，有那些考量因素
- 答：本质是在定“切片大小/并发”，数量由文件大小决定。常见目标是：单片足够大减少请求开销，但又足够小方便失败重传与内存控制。
- 主要因素：网络 RTT/带宽（RTT 高更适合稍大切片）、服务端限制（单次上传大小/并发/限流/超时）、客户端内存与 hash 计算成本（md5/sha1）、断点续传颗粒度（切片越小越易重试但元数据更多）、服务端合并成本与顺序要求、是否走分片直传到对象存储（分片规则/最小分片）。

12.页面关闭时执行方法，该如何做
- 答：优先用 `pagehide`（兼容 BFCache）与 `visibilitychange`（hidden）做收尾；需要发请求用 `navigator.sendBeacon` 或 `fetch(..., { keepalive: true })`。
- 不建议：依赖 `beforeunload` 做复杂逻辑/同步 XHR（体验差、各浏览器限制多）。

13.如何统计用户pv访问的发起请求数量
- 答：在“网络出口”做统一埋点最准确：封装 `fetch`/`XMLHttpRequest`（或 axios 拦截器），每次发起时按“当前 PV（路由/页面实例）”累加计数，并区分成功/失败/取消、接口域名/路径聚合。
- 备选：用 `PerformanceObserver` 监听 `resource` 统计加载的资源与 XHR/fetch（看 `initiatorType`），但跨域资源需要 `Timing-Allow-Origin` 才能拿到完整耗时与部分字段，且命中强缓存/预加载的统计口径要提前定义清楚。

14.长文本溢出，展开/收起如何实现
- 答：折叠态用 CSS 截断（单行 `text-overflow: ellipsis`；多行 `display: -webkit-box; -webkit-line-clamp: N; -webkit-box-orient: vertical; overflow: hidden;`），点击切换 class 展开。
- 需要动画：用“测量高度 + max-height 过渡”或 `height` 从折叠高度过渡到真实高度（配 `ResizeObserver` 处理内容变化）；同时保证可访问性（按钮语义、`aria-expanded`、键盘可操作）。

15.如何实现鼠标拖拽
- 答：优先用 Pointer Events：`pointerdown` 记录初始点与元素初始位移，`pointermove` 计算 delta 更新 `transform: translate3d(...)`，`pointerup/cancel` 结束并清理；配合 `setPointerCapture` 避免指针移出元素丢事件。
- 工程要点：边界限制/吸附、节流到 `requestAnimationFrame`、避免触发选中文本（`user-select: none`）、移动端统一（Pointer 兼容触摸）。

16.统计全站每一个静态资源加载耗时，该如何做
- 答：用 Resource Timing：`PerformanceObserver` 监听 `entryTypes: ['resource']`（`buffered: true`），上报 `name/initiatorType/startTime/duration/transferSize/encodedBodySize` 等，并在 SPA 路由切换时打上页面维度。
- 注意：跨域资源要服务端加 `Timing-Allow-Origin` 才能拿到更完整的 timing；同时控制采样与过滤（只报静态资源、忽略 data/blob、去重同 URL）。

17.防止前端页面重复请求
- 答：做“请求去重/复用”：用 `Map<key, Promise>` 记录 in-flight 请求（key=method+url+params+body hash），相同 key 直接复用同一个 Promise；请求结束清理。
- 配套：对可取消场景用 `AbortController`（新请求到来取消旧请求）、对频繁触发用 debounce/throttle、对写接口用后端幂等键（Idempotency-Key）兜底。

18.ResizeObserver作用是什么
- 答：监听元素尺寸变化（content box/border box），在不依赖 window resize 的情况下实时得到 `contentRect`，常用于自适应布局、图表重绘、虚拟列表、容器查询类场景。
- 注意：回调里改布局可能引发循环，通常要做节流/`requestAnimationFrame`，并避免在回调中触发同步布局抖动。

19.要实时统计用户浏览器窗口大小，该如何做
- 答：监听 `window.resize` 获取 `innerWidth/innerHeight`；移动端更精确可结合 `visualViewport.resize/scroll`（应对地址栏伸缩与软键盘）。
- 工程要点：用 `requestAnimationFrame`/节流降低频率，首次上报 + 变化上报，必要时区分 viewport 与屏幕（`screen.*`）口径。

20.当项目报错，你想定位是哪个commit引入的错误的时，该怎么做
- 答：能稳定复现时用 `git bisect`：在“好版本”和“坏版本”之间二分定位，配合自动化脚本（跑测试/启动后校验）可以快速锁定引入提交。
- 线上场景：结合监控平台的 release/version（例如每次发布带 git sha），用错误首次出现的版本范围缩小，再对范围内提交做 bisect 或按功能模块排查；补充 `git blame`/回滚验证作为辅助。


21.如何移除一个指定的commit
- 答：如果未推送：`git rebase -i <commit>^` 把该条改成 `drop`（或删除那行）；如果已推送且多人协作：优先 `git revert <commit>` 生成“反向提交”（merge commit 用 `git revert -m 1 <mergeCommit>`）。
- 注意：改历史并推送要用 `git push --force-with-lease`，避免误覆盖他人提交。

22.如何还原用户操作流程
- 答：做“行为埋点 + 会话关联 +（可选）录屏回放”。最小闭环：给每次 PV/会话生成 `sessionId`，记录路由切换、点击/曝光、输入、关键业务操作、接口请求摘要、错误与性能，并按时间线串起来还原。
- 进阶：用 rrweb 类方案记录 DOM 变更与用户输入（需脱敏/白名单），结合服务端时间校准与采样，支持一键回放定位问题。

23.可有办法将请求的调用源码地址包括代码行数也上报上去？
- 答：可以。对请求封装层在发起时捕获调用栈（`new Error().stack`），上报 stack；线上再用 Source Map 在服务端把 stack 映射回源码文件/行列（不要在浏览器端做完整 sourcemap 解析，成本高）。
- 工程要点：采样/只在失败或慢请求时采集；过滤框架/封装层栈帧，保留第一条业务栈；注意不要把敏感路径/源码内容泄露给非受控环境。

24.请求失败会弹出一个toast如何保证批量请求失败，只弹出一个toast
- 答：做全局“toast 合并器”：在拦截器/统一请求层里把失败事件放进队列，用短时间窗（如 300ms）debounce，只触发一次 toast；或设置同类错误的“显示锁”（cooldown）避免连弹。
- 常见实现：`Promise.allSettled` 汇总后统一提示；axios 响应拦截器里按错误码/场景聚合，且对已手动处理的请求跳过全局提示（例如 `silent: true`）。

25.如何减少项目里面if-else
- 答：用“表驱动 + 策略/状态机”替代分支：`const map = { A: fnA, B: fnB }[type] ?? defaultFn`；复杂流程用状态机（xstate 或自研）把状态转移显式化。
- 代码层面：多用 guard clause/early return、拆函数、用多态（不同实现类/组件）、用配置化渲染（schema）减少条件堆叠。

26.babel-runtime作用是啥
- 答：`@babel/runtime` 提供 Babel 生成的 helper 复用（如 `extends`, `asyncToGenerator`），配合 `@babel/plugin-transform-runtime` 把每个文件内联的 helper 抽成按需引用，减少包体并避免全局污染。
- 进阶：配合 `core-js`（`@babel/runtime-corejs*`）可以以“按需引入”的方式提供 polyfill，而不是把 polyfill 全量注入到全局环境。

27.如何实现预览PDF文件
- 答：优先用浏览器原生能力：`<iframe src="...pdf">` / `<embed>`；不支持或需要更强交互时用 `pdf.js` 渲染（逐页 canvas/文本层），支持缩放、搜索、分页。
- 工程要点：跨域与鉴权（用带 token 的下载接口转 Blob 再 `URL.createObjectURL`）、移动端兼容（原生预览/新开页兜底）、大文件用 Range 请求/分页渲染避免一次性卡顿。

28.如何在划词选择的文本上添加右键菜单（划词：标滑动选择一组字符，对组字符
进行操作
- 答：监听 `selectionchange`/`mouseup`（或 `pointerup`），用 `window.getSelection()` 拿到 Range，并用 `range.getBoundingClientRect()` 计算位置渲染自定义浮层菜单；同时拦截 `contextmenu`（`preventDefault`）在选区内显示自定义菜单。
- 细节：选区为空/跨节点时要处理；滚动/缩放/窗口变化需重算位置；点击空白处隐藏；菜单可键盘触达（button + `aria-*`）。

29.富文本里面，是如何做到划词的(鼠标滑动选择一组字符，对组字符进行操作?
- 答：底层依赖 Selection/Range API 获取“起止位置”，把选区映射到富文本内部的数据模型（节点/offset）。对选区的操作通常是：拆分文本节点（split）、在区间包裹 mark/span（加粗/高亮/批注）、或写入一段标记数据再由渲染层还原。
- 工程要点：维护“模型 ↔ DOM”映射（避免直接依赖 DOM 结构）、处理跨块选区/表情/附件节点、撤销重做（command stack）、输入法组合输入与光标恢复。

30.如何做好前端监控方案
- 答：核心是“可观测性闭环”：指标（Performance/Web Vitals）+ 日志（行为/网络）+ 追踪（请求链路）+ 异常（JS/资源/接口）+ 回放（可选），并能定位到用户、版本、页面、时间段。
- 关键能力：全局错误捕获（`error`/`unhandledrejection`）、接口拦截统计（耗时/错误码/重试）、PerformanceObserver（FCP/LCP/CLS/LongTask/Resource）、采样与降噪、隐私脱敏、告警与分组归因（按版本/页面/接口聚合）。

31.如何标准化处理线上用户反馈的问题
- 答：建立“反馈→复现→定位→修复→验证→回访”SOP，并把信息结构化：环境（UA/系统/网络）、账号与 sessionId、时间、页面 URL/路由、操作步骤、期望/实际、截图/录屏、错误/请求/性能数据。
- 工程化落地：前端一键反馈组件自动打包日志（近 N 秒行为、接口摘要、错误堆栈、版本号 git sha），对接工单系统；每条反馈有状态流转与 SLA，支持灰度验证与回滚策略。

32.px如何转为rem
- 答：以设计稿为基准设置根字号：`html { font-size: 100vw / 3.75; }`（375 设计稿例）或 JS 动态设置 `document.documentElement.style.fontSize = innerWidth / 10 + 'px'`；然后用 PostCSS（postcss-pxtorem/postcss-px-to-viewport）在构建期把 px 自动转换。
- 注意：保留 1px 细线（hairline）处理、最大最小字号限制、在平板/PC 断点切回固定字号避免过大。

33.浏览器有同源策略，但是为何cdn请求资源的时候不会有跨域限制
- 答：同源策略主要限制“脚本读数据”（如 XHR/fetch 读响应、DOM 访问 iframe 等）；而 `<script src> / <img> / <link>` 这类资源加载本身允许跨域，只是默认不能读取响应内容。
- 例外：字体文件常需要 CORS（否则被拒用）；需要读取资源细节/像素（canvas drawImage 后读像素）也会受 CORS 约束；想拿到完整 Resource Timing 需 `Timing-Allow-Origin`。

34.cookie可以实现不同域共享吗
- 答：不能在“完全不同的顶级域”之间共享。Cookie 的 `Domain` 只能设置为当前域或其父域（同一 eTLD+1 下的子域共享），例如 `a.example.com` 与 `b.example.com` 可通过 `Domain=example.com` 共享。
- 跨站（example.com vs example2.com）要实现“共享态”：用统一登录域（SSO）+ 跳转换票据、后端 token（Authorization）或 OIDC/SAML；另外 `SameSite` 会影响第三方 Cookie 的携带（现代浏览器默认 Lax，第三方逐步收紧）。

35.axios是否可以取消请求
- 答：可以。axios v1+ 推荐用 `AbortController`：创建 `const ac = new AbortController()`，请求传 `signal: ac.signal`，需要取消时 `ac.abort()`；旧版可用 `CancelToken`（已不推荐）。
- 说明：取消的是“客户端侧中止/忽略结果”，后端是否停止处理取决于服务端与链路（可配合幂等/取消接口或 websocket 通知）。

36.前端如何实现折叠面板效果？
- 答：用“受控展开状态 + 高度过渡”。简单版：切换 class 控制 `max-height` 与 `overflow: hidden` 做过渡；精确版：展开时测量内容 `scrollHeight`，把容器 `height` 从 0 过渡到该值，过渡结束再置为 `auto`。
- 交互与可访问性：触发器用 button，配 `aria-expanded`/`aria-controls`；支持键盘与动画降级（`prefers-reduced-motion`）。

37.dom里面，如何判定a元素是否是b元素的子元素
- 答：`b.contains(a)`（包含自身时返回 true）；或 `a.closest(selector)`/沿 `parentNode` 向上遍历；也可用 `a.compareDocumentPosition(b)` 判断文档位置关系。

38.判断一个对象是否为空，包含了其原型链上是否有自定义数据或者方法。该如何判定?
- 答：分两层：自身属性用 `Object.keys(obj).length === 0`/`Reflect.ownKeys(obj)`；原型链用循环 `let p = obj; while ((p = Object.getPrototypeOf(p))) { ... }` 检查每一层 `Reflect.ownKeys(p)`（排除 `Object.prototype`/内建原型），即可判断是否挂了自定义属性/方法。
- 注意：区分可枚举与不可枚举、Symbol key、以及 `Object.create(null)` 没有原型的情况。

40.css实现翻牌效果
- 答：用 3D 变换：父容器 `perspective`，卡片 `transform-style: preserve-3d`；正反两面 `backface-visibility: hidden`，反面先 `rotateY(180deg)`；交互时让卡片整体 `rotateY(180deg)`（配 `transition`）。



——————————


1.一直在window上面挂东西是否有什么风险
- 答：有。主要风险是全局命名污染（覆盖/冲突）、可维护性差（隐式依赖、难测试/难 SSR）、内存泄漏（长生命周期引用不释放）、以及安全面扩大（任意脚本都能读写这些全局对象，敏感信息更容易被滥用）。更稳妥的做法是模块化封装；确需全局共享时用单一命名空间并最小暴露（只暴露方法，不暴露可变状态）。

2.深度SEO优化的方式有哪些，从技术层面来说
- 答：核心是“可抓取 + 可理解 + 快”。常见手段：SSR/SSG 或预渲染；语义化 HTML + 合理标题层级；完整的 meta（title/description/og）、canonical、hreflang；结构化数据（JSON-LD）；sitemap.xml/robots.txt；正确的 HTTP 状态码与重定向；提升 Core Web Vitals（首屏关键 CSS、资源拆分/懒加载、图片优化、缓存/CDN）；保证链接可爬（减少纯 JS 生成导航，给关键内容可降级输出）。

3.小程序为什么会有两个线程
- 答：逻辑层与渲染层分离。逻辑层跑 JS（业务/数据/网络），渲染层负责 UI（模板/布局/绘制），两者通过桥接消息通信。这样能避免 JS 长任务阻塞 UI，提高稳定性与安全隔离，并便于平台对渲染与权限做管控。

4.web应用中如何对静态资源加载失败的场景做降级处理
- 答：分资源类型处理：`<img>` 用 `onerror` 换兜底图；`<link rel="stylesheet">`/`<script>` 用 `onerror` 重试与切换备用域名/CDN；对动态 chunk（`import()`）捕获 `ChunkLoadError`，提示用户刷新并做重试/回滚版本；配合 Service Worker 做离线缓存与“上一次可用版本”兜底；关键样式可内联 critical CSS，保证最小可用渲染。

5.html中前缀为data-开头的元素属性是什么？
- 答：自定义数据属性（custom data attributes），用于在 DOM 上挂业务数据，不影响语义。JS 可通过 `el.dataset.xxx`（驼峰映射）或 `getAttribute('data-xxx')` 读取；值本质是字符串，别存敏感信息。

6.移动端如何实现上拉加载，下拉刷新？
- 答：上拉加载：用 IntersectionObserver 监听列表底部哨兵元素进入视口触发加载（或 scroll 事件 + 距底阈值）；下拉刷新：在滚动到顶部时监听 touchstart/move/end，计算下拉位移，使用 `transform: translateY` 做跟手与回弹，达到阈值触发刷新；注意滚动容器、`passive` 监听与 `overscroll-behavior`，避免与浏览器默认回弹/刷新冲突。

7.如何判断dom元素是否在可视区域
- 答：高性能方案用 IntersectionObserver；简单方案用 `getBoundingClientRect()`，判断 `rect.bottom > 0 && rect.top < viewportHeight`（横向同理），需要阈值/部分可见时加入 margin/比例判断；若在自定义滚动容器内，使用容器的可视区域作为 root 计算。

8.前端如何用canvas来做电影院选票功能
- 答：把座位抽象成网格/坐标系数据模型（行列、状态：可选/已售/选中/不可用），Canvas 负责绘制；点击时将事件坐标映射到座位单元做命中检测（网格直接算行列，或用 Path2D + `isPointInPath`），再更新状态并重绘；支持缩放/平移（矩阵变换）、高分屏适配（按 devicePixelRatio 放大画布）、分层绘制（静态底图/动态选中层）提升性能，并给出非 Canvas 的可访问性兜底（列表/表格）。

9.如何通过设置失效时间清除本地存储的数据？
- 答：封装一层存储结构：`{ value, expiresAt }` 写入 localStorage；读取时若 `Date.now() > expiresAt` 则 `removeItem` 并返回空；可在应用启动/定时任务里批量扫描清理；跨标签页可监听 `storage` 事件同步状态。

10.如果不使用脚手架，如果用webpack构建一个自己的react应用
> 答：手动搭建：
- 初始化项目与入口（`src/index.jsx`）；
- 安装 React/ReactDOM 与 Webpack（webpack/webpack-cli/webpack-dev-server）；
- 用 Babel 转译 JSX（babel-loader + @babel/core + @babel/preset-react + @babel/preset-env）；
- 配置 `webpack.config.js`（entry/output、resolve extensions、module rules：js/css/asset、plugins：HtmlWebpackPlugin、devServer）；
- 在 package.json 配 `start/build`；生产环境再加压缩与拆包（Terser、splitChunks、MiniCssExtractPlugin）与缓存策略（contenthash）。


11.用nodejs实现一个命令行工具，统计输入目录下面指定代码的行数
- 答：思路：`process.argv` 解析参数（目录、扩展名/匹配规则、忽略目录如 node_modules/dist）；递归遍历目录（fs.promises.readdir + withFileTypes）；对匹配文件用流或直接读文件统计 `\n` 行数（注意 `\r\n`）；累加输出总行数与分类型结果，必要时并发限制避免同时打开过多文件。

12.package.json里面sideEffects属性的作用是啥
- 答：给打包器（主要是 webpack）做 Tree Shaking 提示：`"sideEffects": false` 表示该包的模块默认无副作用，未被使用的导入可安全移除；也可用数组标注“有副作用”的文件（如 `*.css`、polyfill、全局注入），避免被错误摇掉，从而减小产物体积。

13.将静态资源缓存在本地的方式有哪些？
- 答：浏览器缓存（强缓存 Cache-Control/Expires、协商缓存 ETag/Last-Modified）；Service Worker + Cache Storage（离线/秒开/版本回滚）；CDN 边缘缓存；PWA 预缓存（precache manifest）；运行时缓存（按路由/资源类型制定策略：stale-while-revalidate 等）；少量配置/资源可用 localStorage/IndexedDB（注意容量与更新策略）。

14.SPA首屏加载速度慢的怎么解决
- 答：拆两块：减少首屏要下发的东西 + 更快地渲染出可用内容。常用手段：路由级代码分割与按需加载、第三方依赖拆包与缓存（splitChunks/vendor + contenthash）、首屏关键资源优先级（preload/priority hints）、图片与字体优化（webp/avif、懒加载、font-display）、减少首屏 JS 执行（延后非关键脚本、长任务拆分）、骨架屏/预渲染/SSR/SSG 提升感知与 SEO、开启 HTTP/2/3 + gzip/br + CDN。

15.git中回滚代码有哪些操作？
- 答：主要看“是否已推送/是否要保留历史”。保留历史用 `git revert <commit>`（可回滚 merge：`-m`）；改写历史用 `git reset --soft/--mixed/--hard <commit>`（适合未推送或团队允许强推）；临时回到某版本可 `git checkout <commit>`（detached）/新建分支；找回误操作用 `git reflog` + reset/checkout。

16.git reset作用是啥，有哪些操作？
- 答：把 HEAD（以及可选的当前分支指针）移动到指定提交，并按模式影响暂存区/工作区：`--soft` 只移动 HEAD（保留暂存区与工作区）；`--mixed`（默认）移动 HEAD 并重置暂存区（工作区保留改动）；`--hard` 同时重置暂存区与工作区（改动直接丢弃，谨慎用）。常用场景：撤销 commit、撤销 add、回退到某个提交点。


————————————

1.[低代码]代码平台一般渲染是如何设计的？】
2.[低代码]代码平台一般架构设计如何】
3.[Webpack]Webpack vs Vite的核心差异】
4.小程序的大概原理?
5.[Webpack]有哪些优化项目的手段?】
6.如果用戶说web应用感觉很慢，该如何排查？
7.[Vue]响应式为何要从Object.defineProperty改为
proxy?】
8.在你的项目中，使用过哪些webpack loader，说一下
他们的作用
9.在webpack中，通常用于css提取的工具是什么?】



——————————


### 实现一个带过期时间的LRU缓存


### 将扁平数组转换成树形结构

### 大数相加

### 合并两个有序数组

——————————————


## AI相关


### AI 对话中的“打字机效果”如果使用 Markdown 渲染，会遇到什么挑战?如何解决?

1. `频繁全量渲染`：每来一个 chunk/字符就全量 markdown -> HTML -> DOM ，会触发`频繁 diff、布局/重排`；遇到长对话、复杂 Markdown（表格/列表嵌套/代码块/数学公式）很快卡顿。
- `节流与批处理` ：以“chunk（token/句子）”为单位更新，UI 层用 requestAnimationFrame 或 50–100ms 的节流合并多次更新。
- `增量解析`：使用支持增量解析的markdown库`markdown-it`
- `分段渲染` ：局部更新，把内容拆成“已稳定区 + 流式区”。稳定区只追加不回头；流式区允许频繁更新但范围很小。
- `重计算重的任务下放`：高亮、数学排版放到 Web Worker 或延迟到块稳定后再做。


2. `渲染闪烁`：LLM 可能先输出一段，再补上前面的反引号、补全列表编号、修复链接；有些后端还会发“delta + replace”式补丁。纯追加策略会导致重复、错位、闪烁。
- 统一数据模型：不要直接把 DOM 当状态。维护 fullText （或按 message 的 segments ），用“追加/替换/回滚”的操作合并流。
- `支持 Abort + 重放` ：用户停止生成/重新生成时，确保能中断旧流并从一致状态重渲染。
- `幂等去重` ：对 SSE/WebSocket 的 chunk 加 sequenceId ，处理乱序、重复投递、断线重连续传。


3. `边界结构难处理`：块级结构在未闭合前，渲染形态可能反复变化（尤其是 ```、表格分隔线、列表缩进、引用嵌套）。
- `块级门控`（Block Gating）：检测“未闭合块”（未闭合 code fence、未闭合表格行、列表缩进未稳定）时，对该块使用更保守策略：
  - `未闭合代码块：先按纯文本渲染（或 <pre> 原样显示），闭合后再启用高亮`。
  - 表格：分隔线未出现前按普通段落渲染，检测到稳定表格结构后一次性切换为表格。
`最后一个 block 局部重渲染` ：只让最后一个 block 处于“可变”，其余 block 视为稳定，不再重新解析。


4. `滚动体验：自动滚动与用户阅读冲突`；流式更新导致页面不断“抢滚动条”，用户往上翻看会被拉回底部；或者滚动抖动、丢失阅读位置。
- Smart Auto-Scroll：`仅当用户在底部附近（比如距离底部 < 80px）才自动滚到底；用户主动滚动后进入“阅读模式”，直到用户回到底部再恢复`。
- 锚点保持 ：更新前记录可视区域的锚点元素/offset，更新后恢复相对位置，避免跳动。


### RAG在前端链路中我们可以做哪些优化?

RAG 通过在生成前检索外部知识库来减少模型幻觉，前端主要负责数据展示和预处理。
- 语义分段: 在前端对长文本进行合理切片，提高向量检索精度
- 引用溯源: 将检索到的文档片段与生成内容进行高亮关联展示
- 预取逻辑: 根据用户输入意图，提前触发向量数据库检索。
- 交互设计: 提供反馈机制(点赞/点踩)来校准检索质量
- 骨架屏: 在检索阶段展示知识库搜索状态，缓解用户等待焦虑



### 在长对话场景下，如何处理前端的内存管理和长列表渲染? 如何解决虚拟列表在内容高度动态变化(如流式输出中)号时的控动问题？

长对话会导致 DOM 节点过多，必须采用虚拟滚动和数据清理策略。
- 虚拟列表:使用 react-window 或 tanstack-virtual 只渲染可视区域V内的对话气泡。
- 状态裁剪:对于过长的对话历史，前端仅保留最近的 N条，其余存入IndexedDB 或进行压缩。
- 资源释放:及时销毁不再显示的图片、文件预览等大对象。




### 如何防止 Prompt 注入攻击?前端有哪些安全防范手段?

Prompt 注入是AI特有的安全风险，前端是第一道防线
- `输入清洗`: 过滤掉类似“忽略上述指令”等敏感关键词
- `边界界定`: 在发送给后端前，用特定的分隔符包裹用户输入
- `输出校验`: 对 AI 返回的内容进行二次检查，防止返回恶意脚本
- `权限控制`: 严格限制 AI 能够调用的前端 Function Calling 权限


Prompt 注入本质是“把不可信输入伪装成高优先级指令”，`诱导模型进行越权操作`（泄露系统提示词/机密、调用工具做危险操作、按攻击者意图改写目标）。它很难靠单点彻底解决，必须做分层防护：`模型侧约束 + 工具/权限隔离 + 数据防泄露 + 前端安全呈现与交互把关`。


**关键防线：不要让模型拥有“直接权力”**

把所有进入模型的内容分级：`系统/开发者指令（可信）、工具返回（半可信）、用户输入/检索网页/上传文件内容（不可信）。不可信内容永远只能当“数据”，不能当“指令”`。

“是否允许调用工具/访问数据/执行敏感动作”必须由后端做最终裁决。 

- `工具调用必须是结构化、可验证的` ：用 JSON Schema/函数调用格式约束参数；后端校验字段、类型、范围、枚举值；`拒绝自由文本拼接成命令/SQL/DSL`。

- `最小权限 + 强制审批` ：高风险工具（发起转账/删除/发邮件/改权限/外呼 URL）必须二次确认（最好是用户可读的“将要执行什么”预览）+ 后端强制策略（denylist/allowlist）。


**前端可落地的安全手段（AI 产品常用）**

- `绝不在前端保存或下发机密指令与密钥`
  - 系统提示词、策略规则、工具密钥、检索 token 放后端；`前端只拿到必要的短期会话令牌`。
  - `前端日志/埋点禁止采集对话全文、prompt、工具返回中的敏感字段`（做脱敏与采样）。

- 把模型输出当“不可信富文本”处理
  - Markdown/HTML 严格 Sanitizer（禁 script/on* 事件、危险 URL 协议），必要时启用 Trusted Types。
  - `链接统一加 rel="noopener noreferrer" ，并对外链做显式跳转确认页（显示域名、来源）`。
  - `禁止“模型输出自动执行”：不自动运行代码块、不自动打开链接、不自动下载文件、不自动发起请求`。

- 敏感操作的交互防护
  - `高风险按钮默认禁用，只有当后端返回“已通过策略校验 + 风险评分低”才可点`。
  - `二次确认弹窗展示`：目标、参数、影响（例如将删除的资源列表、将发送的收件人/正文）。

- `会话与多租户隔离`
  - 前端路由/状态不要混用会话 ID；`切换账号/工作区必须清空本地缓存与内存状态，防止“上下文串线”导致数据外泄`。
  - 剪贴板、文件拖拽、截图上传等入口做显式授权提示与可撤销。

- `浏览/插件型能力的沙箱化`
  - `内置“网页浏览器”用隔离域名/iframe sandbox（禁同源访问、禁顶层跳转、限制下载），并过滤页面可执行脚本对宿主的影响。`
  - 对扩展/插件运行时做权限声明与最小化（只读/只写/网络访问范围）。



### 设计一个 AI组件库时，你会如何定义 Schema 来驱动 UI 的自动生成? 如何评估一个 AI 前端组件库的质量?

**Schema 分层**（我通常会拆 4 层）
- `Meta 层`（组件定义） ：组件是什么、版本、可用平台、默认主题、A11y 要求、埋点点位
- `UI 层`（怎么长） ：布局、字段、slots、条件渲染、响应式规则、空/错/加载态
- `Data 层`（数据从哪来） ：表单模型、默认值、派生字段、远程数据源、缓存策略
- `AI Runtime 层`（怎么跑） ：Prompt 模板、上下文装配、工具/函数调用声明、输出结构、流式策略、guardrails


### 如何监控 AI 应用的性能指标的?除了常规的 FP/LCP 还有哪些?


1. **AI 体验类核心指标（最值得加）**

- `TTFT（Time To First Token）` ：用户点发送 → 首个 token/首段内容出现在 UI 的时间；最直接决定“是否感觉系统活着”
- `TTV（Time To Value）` ：用户点发送 → 出现“第一段可用信息/第一条要点/第一条引用”的时间（比 TTFT 更贴近业务价值）
- `Completion Latency` ：点发送 → 完整回答结束；用于衡量长回答、网络抖动、模型慢的问题
- `Streaming Smoothness` ：流式过程是否连续（chunk 间隔分布 P50/P95、最长静默时长、卡顿次数）
- `Cancel Latency` ：点“停止生成” → 真正停下来并恢复可输入的时间（涉及 abort、连接关闭、后端取消任务）
- `Retry Success Rate` ：重试后成功比例 + 重试成本（避免“看似重试，其实一直失败”）
- `TPS (Tokens Per Second)`:生成速度，反映了后端性能和网络稳定性。
- `交互稳定性`:输入框在流式输出时的响应延迟，
- `资源加载:首屏渲染时间`，尤其是 AI 相关的重型库(如渲染公式的 KaTeX)。


2. **稳定性/可靠性指标（AI 特有的“可用性”）**

- `Request Success Rate` ：按错误类型细分（超时、429、5xx、解析失败、内容过滤、工具失败）
- Timeout Rate & Tail Latency ：AI 场景更关注 P95/P99（长尾会显著拉低体验）
- `SSE/WebSocket 连接质量` ：断连率、重连次数、重连后恢复成功率、乱序/重复 chunk 比例
- `渲染失败率` ：Markdown 渲染异常、代码高亮异常、引用解析失败（会直接造成闪烁/空白）
- `会话一致性` ：同一会话消息丢失/重复、顺序错乱率（尤其多端/多标签页）


3. **工具/Agent 指标（有 tool calling/RAG 时必须监控）**

- `Tool Call Latency` ：每个工具的耗时分布、并发数、失败率
- `Tool Call Depth/Steps` ：一次请求平均调用几步；步数高不一定坏，但会显著拉长 TTV/成本
- `RAG Retrieval Latency` ：检索耗时、重排耗时、命中率（有无引用、引用条数）
- `Grounding 指标`（工程可观测的部分） ：回答中带引用的比例、引用点击率、引用缺失导致的用户追问率


4. **成本与效率指标（AI 产品必须把“钱”也算进性能）**

- `Tokens In/Out` ：每请求 token 分布、峰值、按模型/场景拆分
- Cost per Request / per Conversation ：按用户/租户/功能维度聚合
- Cache Hit Rate ：提示词缓存/检索缓存/工具结果缓存命中率（直接影响 TTFT 与成本）
- Waste 指标 ：用户在生成中途取消的 token 比例、输出被过滤/被重试导致的重复 token


**前端侧监控怎么做（埋点建议）**

一次“用户询问”建一个 `traceId` ：`从 UI 点击开始贯穿到后端、模型、工具、返回流；前端把 traceId 带到每次请求 header`

- 关键时间点打点 （统一命名方便做漏斗/分位数）
  - send_click_ts
  - request_start_ts
  - first_chunk_ts （TTFT）
  - first_meaningful_chunk_ts （TTV：例如超过 N 字/出现第一条列表/出现引用）
  - stream_end_ts
  - render_commit_ts （首段渲染完成）
  - cancel_click_ts / cancel_effective_ts
- 把“网络/渲染”拆开看 ：同样 TTFT 变差，要区分是后端慢、网络慢、还是前端渲染慢（长 Markdown、语法高亮、虚拟列表等）



### 如果 TTFT 过长，前端可以做哪些交互补偿?

- `流式与渐进渲染` ：优先支持 SSE/WebSocket 流式，先渲染“思考中/已收到请求/正在检索”的阶段态，再逐段展示内容。
- `骨架屏 + 结构占位` ：先把回答容器、标题、分点列表、代码块框架渲染出来，减少“空白等待”的主观时长。
- 先给可用的最小信息 ：先返回“摘要/结论先行/推荐下一步操作按钮”，正文后补齐（progressive disclosure）。
- 预期管理与可控性 ：展示预计耗时区间、当前步骤（检索→推理→生成），提供 取消/停止生成/重试 ，降低失控感。
- 交互不中断 ：输入框保持可编辑，允许继续补充问题、选择引用资料、切换模型/模式，避免 UI 被锁死。
- 预热与复用 ：会话级缓存、相似问题复用、预加载系统提示词与上下文，尽量把等待前移到用户无感时段。


### 如果 AI 接口返回速度很慢，除了 Loading，你还能做哪些体验优化?

- 分段完成 ：`先给“检索结果/引用来源/大纲”，后续再生成完整回答`；或先输出前 N 条要点，剩余异步补齐。
- 可中断与可恢复 ：支持停止、继续生成、断点续传（同一 requestId 续流）、失败自动重试与降级提示。
- `后台运行 + 通知回流` ：允许用户离开页面做别的，完成后用站内通知/列表任务中心回流结果。
- 结果可编辑与可交付 ：等待期间先提供草稿编辑区、结构化模板、导出入口；结果到达自动合并并标注增量。
- 容错与降级 ：`超时切换到更快模型/更短回答模式`；弱网下关闭大资源渲染（如大型代码高亮）、减少重排。
- 成本透明 ：`展示“耗时来自哪里”`（模型推理/工具调用/检索），让用户理解慢的原因并给出可选优化项。




### 介绍下 WebLLM 或 Transformers.js 这种在浏览器端运行模型的原理。如何看待 WebGPU 和 WASM 在前端 AI 领域的未来?


这些库利用 WebGPU 或 WebAssembly 技术，在浏览器中直接调用硬件加速运行模型。
- WebGPU: 提供高性能的图形和计算接口，直接操作 GPU 显存
- WASM: 作为降级方案，在 CPU 上执行经过优化的模型算子
- 模型量化: 将 FP32 模型压缩为 INT4/INT8，以减少显存占用和下载体积
- 缓存机制: 利用 Cache API 存储模型权重文件，避免重复下载

把推理引擎搬进浏览器 ：`核心算子（MatMul/Attention/LayerNorm 等）用 WebGPU（GPU 跑 shader） 或 WASM（CPU 跑 SIMD/多线程） 实现，JS 负责调度`。

把模型权重下发到本地并缓存 ：`训练好的模型会先导出成浏览器可加载的权重格式，并做 量化（FP16/int8/int4） 降体积、降显存；权重通常分片下载，用 Cache API/IndexedDB 缓存避免重复拉取`。


### 在多轮对话中，如何优雅地管理上下文(Context)以防超出 Token 限制?

前端需要配合后端进行上下文的截断或压缩策略。
- `滑动窗口`: 只保留最近的 N 轮对话记录
- `摘要压缩`: 将较早的对话通过模型生成摘要，替代原始文本
- `关键信息提取`: 只保留与当前问题相关的历史片段
- `Token 估算`: 在前端使用 tiktoken 等库预估当前长度，提醒用户是否超出 Token 限制


### 谈谈 Canvas 和 SVG 在 AI 绘图或可视化场景下的选型

Canvas 适合高频更新、大量像素处理，SVG 适合交互多、节点少的矢量场景
- AI 生成图片编辑(如外扩、重绘)通常使用 Canvas，方便像素级操作
- AI 生成的流程图、逻辑图通常使用 SVG，方便进行 DOM 事件绑定和缩放




### 谈谈 Promise.all 和 Promise.allSettled 的区别，在调用多个模型接口时你会选哪个?

Promise.all 要求全部成功，而 Promise.allSettled 会等待所有任务完成，无论成功或失败。

- Promise.all:一旦有一个 Promise 失败，立即触发 catch，其余结果被丢弃。
- Promise.allSettled:返回一个对象数组，包含每个 Promise 的状态(fulflled/rejected)和值。

场景选择:在调用多个模型对比结果时，通常选 allSettled 以确保能拿到部分成功的结果。



### 如何评价一个 Prompt 的好坏?前端可以如何辅助用户写出更好的 Prompt?

- 评价标准:输出的稳定性、准确性、是否符合预期格式
- 辅助手段:提供 Prompt 模板库，引导用户输入结构化信息
- 自动优化:利用 LLM 对用户的简单输入进行扩充(Prompt Rewriting)
- 实时反馈:在输入时进行 Token 计数和敏感词检测预警


- 评价维度（可量化） ：`任务达成率、输出稳定性（多次一致性）、约束遵循度（格式/长度/禁用项）、可解释性、幻觉率与安全合规`。
- 好的 Prompt 特征 ：`目标明确、上下文充分、约束清晰、输出格式可解析（JSON/表格/要点）、包含示例与边界条件、对不确定性有处理（不会就说不知道/给澄清问题）`。

**前端辅助能力** 
  - 模板与向导 ：`按场景提供结构化表单`（目标/受众/语气/输入数据/输出格式/禁止内容），自动生成 Prompt。
  - Prompt Lint ：`实时检查歧义词、缺少约束、格式不可解析、上下文不足，并给可操作修改建议`。
  - 示例驱动 ：`一键插入 few-shot 示例、反例、输出 schema`；支持“试跑预览+对比”快速迭代。
  - 上下文管理 ：`可视化选择引用资料、变量插槽、长度预算提示`（token 预估），避免塞爆上下文。
  - `评测闭环` ：内置小型评测集/回归用例，对同一 Prompt 的多轮结果打分与回归对比。



### 面对 AI 技术的快速更迭，作为技术专家，你如何保持团队的技术领先性?

需要建立持续学习机制，并快速将新技术转化为生产力。
- `建立技术雷达`:定期追踪 LangChain、Vercel AI SDK 等前沿工具的演进
- `鼓励原型开发`:设立 Hackathon 或内部项目，快速验证新技术在业务中的可行性
- `沉淀通用能力`:将重复的 AI 交互模式抽象为基础设施，减少业务线重复造轮子
- `跨领域沟通`:加强与算法同学的交流，理解模型原理以更好地进行前端适配



### 谈谈前端在 AI 时代的核心竞争力是什么?会由于 AI 的出现而失业吗?

前端的核心价值在于“连接”与“体验”，`AI 是工具而非替代者`。
- 连接能力:`前端是模型能力与最终用户之间的桥梁，负责复杂的交互逻辑`
- 体验护城河:`AI无法替代对用户细微心理的把握和极致的交互设计`
- 效率提升:`利用 A辅助写代码(Copilot)，将精力转向更高维度的系统设计`
- 边界扩展:`前端开始涉足模型部署(WebLLM)、数据预处理等领域`。



### 在处理大模型输出的敏感信息时，前端如何配合做合规性建设?

- 展示前拦截与脱敏 ：`对输出做客户端敏感信息检测（如手机号/证件号/邮箱/地址/密钥形态）`，命中则 遮罩/打码/阻断展示 并提示原因。
- 最小化留存 ：默认不落盘、`不把完整输出写入前端日志/埋点；需要采样时做脱敏与权限控制`，避免把 PII 带进监控系统。
- `分级权限与操作审计` ：敏感内容“点击解锁查看”并二次确认；按角色控制可见范围，记录审计事件（谁在何时查看/导出）。
- 内容安全策略 ：`对高风险类别（涉政/涉黄/隐私/侵权/医疗法律建议）做前端风险提示`、强制免责声明与引导人工复核入口。
- 数据出境与第三方控制 ：`明确标识哪些内容会发送到模型/工具；提供用户确认与可撤回`；对附件/截图做本地预处理与脱敏再上传。
- 与后端联动闭环 ：前端携带合规标签与 traceId，便于后端 DLP/策略引擎统一裁决；前端只做“最后一公里”兜底与可解释提示。



### AI 聊天界面的流式文本渲染，前端如何优化性能以防止页面卡顿? React 18 的 startTransition 对 AI 产品有什么实际意义?


核心问题 ：`token 级别高频 state 更新 + 长列表 DOM 重排/重绘 + Markdown/代码高亮等重计算，导致主线程占满`。


**前端优化抓手（按收益排序）**
- `把“高频细碎更新”合并` ：不要每个 token setState；`用 requestAnimationFrame / 定时器做批量 flush`（如 16ms/33ms 合并一次），减少 render 次数。
- 列表虚拟化 ：`消息列表用虚拟滚动（只渲染可视区 + overscan），避免历史消息越多越卡`。
- 分层渲染 ：`流式区域先渲“纯文本”，Markdown/语法高亮延后（idle 或停止流式后再做）；代码块高亮按块懒处理`。
- 拆分组件 + memo ：`把消息气泡拆小，稳定 props；历史消息 React.memo ；流式消息单独组件，避免全列表跟着更新`。
- 减少 layout thrash ：`滚动跟随用“尾部锚点”`而不是频繁读写 scrollTop/scrollHeight；尽量只写不读，或读写分帧。
- 降级策略 ：`低端机/长文本自动降级`（关闭动画、降低 flush 频率、暂停高亮）。


**startTransition 对 AI 产品的实际意义**
- 把“用户交互优先级”拉高 ：`将“流式内容渲染/大列表更新”等标记为 transition（低优先级），让输入框打字、滚动、点击始终更流畅`。
- `减少“输入被卡住”的体感` ：AI 流式更新属于“可延迟的 UI”，用 transition 让 React 在繁忙时可中断/延后这些渲染。
- 典型用法 ：`token 合并后更新流式消息时用 startTransition(() => setStreamText(...)) ；而输入框 setInputValue 保持同步更新。`



### 你们项目中的 Prompt 是如何管理的?前端在 Prompt Engineering 中扮演什么角色? 如何设计一个通用的 Prompt 管理方案? 如何在前端实现 Prompt 的版本回滚?


**Prompt 管理方式（企业推荐）**
- `中心化 Prompt Registry` ：Prompt 模板、变量 schema、适用模型、版本、灰度规则、owner、审计信息都在服务端管理。
- `前端只持有“引用” `：`前端请求 promptKey + version/alias(canary/latest) 拉取模板`，避免把核心 prompt 写死在包里。


**前端在 Prompt Engineering 的角色**
- `上下文组织者` ：把用户输入、选中文档、UI 状态、历史摘要、工具结果`组织成结构化变量`。
- `质量护栏` ：长度控制（截断/摘要）、`敏感信息脱敏、注入防护`（把外部内容标注为“untrusted”并做边界约束）。
- `可观测性` ：`上报` prompt 版本、变量、模型、结果质量指标，支撑迭代与 A/B。


**通用 Prompt 管理方案设计要点**
- `模板 + 变量 schema` ：强约束变量（类型、必填、最大长度），渲染前校验。
- `环境与租户隔离` ：dev/staging/prod、不同客户不同策略。
- `灰度与实验` ：按用户/组织/百分比路由不同版本；支持多版本对比与自动回收。
- 发布不可变 ：`版本一旦发布不可修改，只能发新版本，保证可追溯`。


**前端实现 Prompt 版本回滚**
- “别名指针”回滚 ：`使用 stable/latest/canary 这类 alias 指向具体版本；回滚就是把 alias 指回旧版本，前端无须发版`。
- 本地兜底缓存 ：`前端缓存最近 N 个稳定版本（key+version）；拉取失败或新版本异常时自动回退到上一个 stable`。
- 可视化与审计 ：调试面板展示当前命中的 promptKey/version/实验组；所有请求带上版本信息便于定位问题。



### 谈谈 Web Worker 的使用场景，在 AI 前端应用中它能做什么? SharedWorker 和普通 Worker 有什么区别?

Web Worker 允许在后台线程运行脚本，避免阻塞主线程的 U 渲染
- 文本处理:在前端进行大规模的文本清洗、分词或向量相似度计算。
- 语法高亮:对超长代码块进行高亮解析。。
- 离线模型:运行轻量级的 Transformers.is 等前端模型。
- 通信机制:通过 postMessage 传递数据，注意 Transferable Objects 优化性能.


- Worker 适合 ：`任何“重 CPU + 不需要直接操作 DOM”的任务，避免堵塞主线程`。

**AI 前端常见 Worker 工作**
  - `流式文本后处理 ：增量 Markdown 解析、diff/patch 计算、长文本分段、引用/脚注抽取`。
  - 检索与索引 ：`本地知识库/FAQ 的向量检索前置处理（分词、embedding 前的清洗、倒排索引构建）`。
  - 数据压缩/加解密 ：`聊天记录压缩、端到端加密、签名校验`。
  - 音视频/多模态预处理 ：`音频降噪/切片、图片缩放/特征提取`（视项目能力与库支持）。

**SharedWorker vs Dedicated Worker（普通 Worker）**
  - 普通 Worker ：`一个页面/一个 tab 独占；生命周期跟随页面；通信简单（ postMessage ）`。
  - SharedWorker ：`同源下多个 tab/窗口共享同一个 worker；适合“跨 tab 复用”的能力`（统一缓存、统一连接、统一索引）。通信通过 port 管理多连接。
  - 选型建议 ：需要跨 tab 共享（例如统一模型网关长连接、统一本地索引/缓存）用 SharedWorker；否则普通 Worker 更简单、兼容性风险更低。



### 什么是 Function Calling(函数调用)?前端如何配合模型完成一次完整的操作? 如果模型一次性返回了多个函数调用请求，前端应该如何处理?

定义 ：模型不直接产出最终自然语言答案，而是`按约定输出“要调用的函数名 + 参数”（结构化），由宿主（前端/后端）执行真实动作（查库存、下单、查询日历等），再把结果回传给模型继续推理/回复`。


**一次完整链路（前端视角）**
  - `函数注册` ：前端维护一份工具清单（name/description/schema/权限级别/幂等等元信息）。
  - `发起对话` ：携带工具定义 + 上下文发给模型。
  - `接收工具调用请求` ：解析出 toolCalls[] （函数名与参数）。
  - `权限与安全` ：参数校验、鉴权、敏感操作二次确认（尤其是“写操作”：支付/删除/发邮件）。
  - `执行函数` ：在前端执行（如 UI 操作、读取本地文件）或调用后端 API 执行（业务写操作通常放后端）。
  - `回传结果` ：将每个工具调用的结果以结构化形式发回模型，让模型生成最终回答或继续下一步。


**模型一次返回多个函数调用：处理策略**
  - 按依赖做调度 ：
    - `无依赖的：并发执行（Promise.all）提升速度`。
    - `有依赖的：按序执行（DAG/队列），前端维护 tool-call 队列与状态机`。
  - 保证可追踪 ：每个 toolCall 要有 id ，回传结果要对齐 id ，便于模型串联。
  - 失败策略 ：`单个失败不应拖垮整体`；`按函数级别定义可重试、可降级、可中断`；必要时把错误与上下文回传给模型进行自我纠错/改参重试。




### 如果让你从零搭建蚂蚁内部的 AI 前端基础设施，你会包含哪些核心模块?

基础设施应解决效率、一致性和性能问题，形成从开发到监控的闭环
- 组件层:标准化的 AI 交互组件库(对话框、提示词编辑器、流式渲染器)。
- 协议层:统一的前后端通信协议(基于 SSE/WebSocket 的标准封装)
- SDK 层:集成 Token 计算、Prompt 管理、流式处理的通用工具集
- 调试层:可视化 Prompt 调试工作台，支持对比不同模型的输出
- 监控层:AI特有的性能指标监控与用户反馈收集系统。


- 目标：`让业务团队用统一方式快速做出 AI 交互（Copilot/Chat/生成式表单/智能搜索），同时满足蚂蚁内部的 安全合规、成本可控、可观测、可评测、可治理` 。

- 原则 ：前端“只做该做的事”——把大模型能力封装成 `可组合的 UI + 可复用的编排 SDK + 可治理的平台能力` ；横切能力（安全/观测/评测）强制内置。

- 架构分层：
  - `体验层`（AI UI） ：面向用户交互的组件与页面模式，`Chat / Copilot 组件库、表单生成、主题/暗色`
  - `能力层`（AI Runtime/SDK） ：`会话、工具调用、RAG、流式渲染、状态管理`
  - `接入层`（Gateway/Connectors） ：`模型/知识库/工具的统一接入与权限`
  - `横切层`（Guardrails & Observability & Eval & Governance） ：`安全、观测、评测、配置治理贯穿全链路`


**用“一条用户链路”把模块串起来（让面试官秒懂） 以“智能客服 Copilot”为例：**
1. 用户在 Chat 里提问 → UI 组件触发 AI Runtime 创建会话与上下文裁剪
2. Runtime 调用 Gateway （带 traceId/权限）请求流式生成 → UI 流式渲染首 token
3. 模型触发工具调用（查订单/查政策）→ Runtime 执行工具编排、参数校验、超时重试
4. 工具返回结果 → Runtime 二次生成并产出 引用溯源 → UI 展示引用并可点击回原系统
5. 全链路数据进入 Observability （耗时/成本/失败点）+ Audit （审计）
6. 该场景的 Prompt/模型版本通过 配置中心 灰度，效果由 Eval/A-B 决定是否全量


落地节奏：`MVP（先跑通） => 规模化（可复用） => 治理化（可控可管）`



### 在 Al Agent 编排场景下，前端如何设计一个灵活的可视化工作流引擎?

Agent 编排涉及节点、连线和状态流转，核心是数据驱动和插件化。
- 选型: 基于 React Flow 或 X6 等图形库进行二次开发
- 数据模型: 定义标准的 JSON DAG(有向无环图)结构描述任务流。
- 节点设计: 支持自定义节点，如 LLM 节点、API 调用节点、条件判断节点
- 状态管理: 使用 Zustand 或 Redux 管理全局画布状态和执行进度。
- 实时反馈: 在画布上实时展示 Agent 的执行路径和中间变量

**架构设计：**
- `数据模型先行` ：用统一 DSL/JSON Schema 描述节点（Agent/Tool/LLM/Router）、端口、连线、输入输出类型与校验规则。
- `插件化节点体系` ：节点渲染、表单配置、校验、执行适配器全部插件化（registry），做到“`加节点不改核心`”。
- `图编辑能力` ：`拖拽编排、对齐/吸附、分组/子流程`、版本管理、差异对比、只读/协作权限（至少支持锁与冲突提示）。
- 执行与状态机 ：`前端以状态机驱动运行态`（pending/running/success/failed/canceled），支持并行、条件分支、重试策略、超时与补偿。
- `可观测与调试` ：每`个节点展示 token/耗时/成本、输入输出快照、日志`与 traceId；支持回放、从某节点“断点重跑”。
- `安全与治理` ：`节点级权限、敏感字段脱敏展示`、参数白名单、环境隔离（dev/prod），避免前端任意拼接危险调用。




### 如果让你从零设计一个 Al Agent 的前端架构，你会考虑哪些核心模块?

一个成熟的 Al Agent 前端架构应具备高扩展性和良好的状态管理。
- 通信层:封装 SSE/WebSocket 逻辑，支持请求拦截、重试及多模型切换。。
- 状态层:管理对话历史、上下文窗口、Agent 运行状态(思考中、生成中、工具调用中)。
- 插件/工具层:设计一套标准协议，让 Agent 可以调用前端定义的 UI 组件(如地图、图表、表单)。。
- 渲染层:支持 Markdown、Latex、代码块及多模态内容(图片、语音)的展示,
- 缓存层:利用 IndexedDB 存储长对话历史，实现离线访问。


**架构设计：**
- `会话与记忆层` ：会话管理、消息树/分支、上下文裁剪、摘要、引用溯源（prompt/检索/工具结果可追踪）。
- `编排与状态机层` ：Agent 运行态（thinking/tooling/responding）、tool-call 队列、并发与取消、重试与回滚、幂等等策略。
- `工具系统`（Tooling） ：工具注册中心（schema/权限/成本/超时）、参数校验、执行器（前端能力+后端 API）、审计日志。
- `模型接入层`（Model Gateway） ：多模型路由、流式协议适配、错误码归一、限流/熔断、token 统计与成本。
- `检索与知识层`（RAG） ：检索配置、embedding/索引（本地或服务端）、引用展示、可解释性面板。
- `可观测性与评测` ：埋点（TTFT、tokens/s、失败率）、链路追踪（prompt→tool→result→answer）、A/B、Prompt 版本对比。
- `体验层` ：流式渲染、虚拟列表、草稿/重生成、引用高亮、错误态与降级。



### 如果让你从零设计一个企业级的 Al Chat 桌面端应用，你会如何选型?

需要从跨平台框架、状态管理、持久化和 AI 特性四个维度考虑。
- 基础框架:Electron 或 Tauri(追求体积和性能选 Tauri)。。
- 状态管理:Zustand 或 Redux Toolkit，处理多轮对话上下文。
- 数据存储:IndexedDB(存储海量历史记录)+SQLite,
- AI 集成:封装统一的 LLM Provider 层，支持切换不同模型厂商
- 离线能力:PWA 特性支持，确保基础 U 在断网时可用。


优先 `Electron + React`（或你团队最熟的 Web 技术栈） ：`生态成熟、企业桌面能力齐全`（自动更新、托盘、文件系统、权限控制）。

- `渲染与性能`：`React 18 + 虚拟列表；重计算下放 Worker；本地存储用 SQLite`（通过主进程能力或内嵌方案）。
- `安全与合规`：
  - `主/渲染进程严格隔离，最小化 Node 集成；权限白名单；敏感数据加密落盘`。
  - 企业 SSO（OIDC/SAML）对接；审计日志；可配置的数据保留策略。
- `工程化` ：自动更新（灰度/回滚）、崩溃上报、性能监控、统一配置中心（模型/Prompt/工具开关）。
- `替代方案` ：若极度重视“原生体验/性能”且团队有能力，可评估 Tauri；但企业生态与踩坑成本通常更高。




### 设计“AI对话组件库”（含流式文本、思考动画、多模态输入），如何适配不同业务线（如电商/游戏/出行）？如何用Rspack/Vite优化打包体积（Tree-shaking+External抽离）？



### AI对话“打字机效果”用SSE/WebSocket，遇到网络波动断连，如何保证上下文不丢失+首字响应＜300ms？重连时用“补偿推送”还是“全量重拉”？ 


### 在低端机上跑AI试鞋（3D贴合）/识图辨真假（图像预处理），如何用WebWorker+WebAssembly避免主线程卡死？模型量化（FP32→INT8）后精度损失如何补救？


### AI穿搭助手（文字生成+商品卡片动态插入），如何用原子化状态（Zustand/Jotai）​ 管理“流式文本+虚拟列表+正则匹配商品ID”？避免竞态条件（旧数据覆盖新请求）？



### 给高德做“AI路线推荐”，前端如何用WebGL渲染+轻量模型实时计算“亲子友好度”？给米哈游做“AI社区助手”，如何用RAG+语义检索毫秒级响应玩家提问？



————————————————
<!-- 2026.04.24 -->

### 详细说明如何实现AI聊天中的"停止生成”功能，包括前端和后端的协作逻辑。



### 在大模型应用中，前端如何参与Token成本控制和优化?



### 如何评估一个AI交互功能的好坏?你会关注哪些前端指标?


### 假设要实现一个类似Canvas的AI协作画布(如Artifacts)，你会选择什么样的技术栈，难点在哪?


### 千问大模型生成文本是流式(Streaming)的。如果直接用innerHTML+=token，会导致重排(Reflow)严重，页面卡顿。如何设计 VirtualList+DocumentFragment方案，实现百万字长文本的流畅渲染？

零重排策略:
1. 不使用 innerHTML。为每个Token创建一个span节点，存入 DocumentFragment.
2. 累积 50个Token或16ms(-帧时间)，一次性将 Fragment插入 DOM。虚拟滚动(Virtualization):

对于超长对话，使用 react-window。监听scroll事件，动态计算可视区的 startindex和 endindex.关键优化:使用 requestAnimationFrame对齐浏览器刷新率，避免在流式输出过程中触发强制同步布局(Forced Reflow)。

Web Worker 解析:如果需要对 Markdown 进行高亮，解析工作必须丢给 Web Worker，主线程只负责appendchild.



### 怎么用TransformStream处理SSE，实现零拷贝的Token拼接？




### 前端需要支持“角色扮演”(Svstem Prompt)。用户切换角色时，如何在不中断当前流式会话的情况下，动态更新发送给模型的 Prompt 上下文?

Context 快照与重建:
1. 维护一个 messages数组。当 System Prompt 变更时，不直接修改原数组。
2. 创建一个新的 messages副本，将新的System Prompt 置于首位，保留历史User/Assistant 消息
3. 通过 AbortController中断旧的请求，用新 Context 发起新请求。

Token 计数与截断:
前端使用 tiktoken的 WASM 版本，在发送前预估 Token 数量。
如果超出模型窗口限制(Context Window)，使用“中间截断”或 “注意力摘要”算法，丢弃最早的非关键信息，保证最新的对话在窗口内。



### 用户上传一张 50MB 的高清图纸，千问需要识别。直接上传太慢，且 API限制图片大小。如何在前端利用 Web Workers 和 WebCodecs 进行无损压缩和尺寸调整，且不阻塞 UI?

OffscreenCanvas + Worker:
1. 主线程将ImageBitmap通过 postMessage转移给 Worker
2. Worker 内部使用 OffscreenCanvas进行 drawlmage缩放。
3. 使用 Canvas.toBlob压缩为 WebP 格式(质量 0.8)。

WebCodecs lmageEncoder:
- 使用 ImageEncoder接口进行更底层的编码控制，比 toBlob更快，且支持硬件加速。

进度反馈:Worker通过 postMessage回传压缩进度，主线程更新 Progress Bar。


### 千问支持语音输入。如何在前端实现 VAD(语音活动检测)，自动识别用户说话结束，并实时将 PCM 数据通过 WebSocket 发送给后端？怎么把48kHz音频重采样成16kHz喂给模型？

AudioWorklet 替代 ScriptProcessor:
1. 使用 AudioWorklet 在独立线程处理音频流，避免主线程噪音。
2. 计算音频帧的 RMS(均方根)能量值。设定闯值，当能量低于闯值持续1秒，判定为“静音”。

采样率转换:
麦克风通常是 48kHz，模型可能需要 16kHz.
使用 OfflineAudioContext进行重采样(Resampling)，或者在前端实现简单的 FIR 滤波器 降采样。
WebSocket 二进制流:直接发送 ArrayBuffer，不要转 Base64，减少 33% 的体积开销。


### 我们要做AI数据分析师（Agent）。怎么用DAG（有向无环图）在前端编排SQL查询和Python画图？怎么实现Time Travel（时光回溯）？


### 企业接入千问，需要上传私有文档(PDF/Word)构建知识库。前端如何设计一个“分段预览”界面，让用户能看到文档被切成哪些 Chunks，并允许手动调整分割点?

虚拟滚动+高亮联动:
使用 Slate.js或 Lexical构建编辑器。
后端返回的 Chunks 带有 start offset和 end offset。前端通过 RangeAPI在原文中高亮显示。

拖拽调整边界:
在高亮块的边缘渲染可拖拽的 Handle
拖拽结束时，计算新的 0ffset，调用 API重新生成 Embedding。

相似度分数可视化:在侧边栏展示Chunks 与Query 的余弦相似度(Cosine Similarity)，用进度条或热力图展示。


### 千问要做一个“AI数据分析师”Agent。用户说“分析上月销售数据”，AI 需要依次调用“总结报告”、“SOL查询”、“Python 画图”。前端如何设计一个 DAG(有向无环图)的可视化编排器?

React Flow/X6 封装:
定义节点(Node)类型:Input,LLM, Code Interpreter,Output.
定义边(Edge):携带数据流(Stream Data)。

状态回放(Time Travel):
利用 Redux Toolkit+lmmer。每一步Agent 的思考(Thought)和行动(Action)都是一个状态快照。
前端支持点击“上一步”，回溯到 Agent 的某个决策节点。

流式更新 DAG:
当 Agent 正在执行某个 Node时，该节点显示 Spinner。
执行完毕后，动态更新连线上的数据预览(如“返回 100 条记录”)。



### React Hooks 中 useEffect 的依赖捕获机制是什么?在豆包流式对话中，如何解决闭包导致的状态陈旧问题?



### 前端实现AI流式输出，SSE与Fetch+Readablestream在字节豆包的技术选型中，分别适用哪些场景?说明核心差异。



### 字节豆包基于Next.js+React Server component(RSC)构建，说明RSC的底层原理、数据通信方式，以及为何选择RSC而非传统SSR


### 前端基于WebAssembly+TensorFlow.js实现端侧AI推理(如本地意图识别、文本摘要)，请说明完整流程性能瓶颈及字节的优化方案。



### 豆包高并发对话场景中，请求竞态、消息乱序、断连重连、重复发送四大问题的成因?请给出字节内部的工程化解决方案。


### 豆包长会话项目常见内存泄漏场景有哪些?如何用Chrome DevTools定位?给出具体修复方案及字节的监控手段。



### 设计字节豆包AI全栈前端架构，覆盖多端适配、渲染策略、流式通信、端侧推理、状态管理、监控告警、高可用容错七大模块

- 多端适配层:React 18 +TypeScript + Next.js (App Router)，适配Web/小程序/PC客户端，统一技术栈，复用业务逻辑;
- 渲染策略层:RSC(对话页/核心功能)+ISR(首页/技能广场)+SSR(个人中心/实时数据)，混合渲染兼顾性能、安全与实时性;
- 流式通信层:统一封装Fetch+ReadableStream，内置重连、取消、断点续传、有序渲染、去重机制，适配高并发对话场景;
- AI推理层:云端(大模型核心对话，如GPT-4/文心一言)+端侧(Wasm+WebGPU轻量模型，本地意图识别摘要/简单问答)，云端端侧协同，降延迟、保隐私、减成本;
- 状态管理层:Zustand (轻量、原子化、少重渲染)+IndexedDB(本地持久化对话历史)+ React Query(服务端状态缓存/同步)，高效管理复杂状态;
- 监控告警层:Sentry (错误监控)+Performance API(性能监控)+ 自定义埋点(流式耗时/内存/接口成功率)+字节内部告警系统，实时监控、快速定位问题，
- 高可用层:请求重试(指数退避)、熔断降级、本地缓存兜底、ErrorBoundary组件级错误隔离、灰度发布键回滚，保障亿级用户高可用。

核心设计原则:安全、低延迟、高可用、可扩展、亿级流量支撑、云端端侧协同。



### AI生成代码在字节大规模落地后，如何构建Prompt规范、质量门禁、CI/CD保障、安全审计一体化工程体系?



### 亿级用户、高并发流式输出、单会话千条消息场景下如何从加载、渲染、内存、网络四维度做全链路性能与稳定性优化?



### 如果让你实现一个类似GitHubcopilot的Web版编辑器，你会选择哪些核心技术栈?


### 蚂蚁内部有很多AI应用场景，如果让你设计一套通用的"AI前端中台”架构，你会包含哪些模块?



### 谈谈你对"AI驱动的前端开发模式(LCNC+AI)“未来趋势的看法。



### 如何看待当前前端领域各种AI框架(如Langchain.js,VercelAISDK)?选型时你会考虑哪些因素?


<!-- 2026.05.07 -->

### 当AI输出内容文本比较长，如何实现平滑地滚动到底部？


### 手写一个简单的markdown链接解析函数，将text转换为HTML标签？



### 





——————————————


### 流式传输与用户留存:在滴滴的AI客服或司乘纠纷调解场景中，AI需要基于大量后台日志和用户发言进行总结并给出调解方案。如果采用流式输出(SSE/WebSocket)，遇到网络波动断开，前端如何保证协商记录的完整性?在这个特定业务下，你会如何设计重连和降级策略?

出行业务的客服和判责系统对数据准确性要求极高。一旦记录丢失或错乱，可能导致司乘任意一方的利益受损。这题考察你对流式协议的掌控及在金融/出行级别业务中的容灾思维。

`可靠性保障:前端维护 sessionld和lastMessageld`。断开重连时，携带这两个参数向服务端发起“历史补发”请求，服务端根据ID 范围重新 Push 丢失的chunk。前端通过 Hash(Map)去重后，再批量、有序地插入 DOM。

业务级降级策略:考虑到司乘可能在不稳定的地下车库或高速移动场景下沟通，`若重连失败超过3次或TTFB(首字节时间)大于5秒，前端应主动中断SSE，切换为“常规轮询+Markdown 整体渲染”的降级模式`，并在 U 上给出“当前网络不佳，已切换至稳定模式”的轻提示，确保调解不中断。


### 大文件处理与AI预检:滴滴司机每天需上传大量的行程录像或行车记录仪视频用于报备或申诉。如果在前端进行视频的AI初筛(例如识别车牌号、判定急刹车动作)，你将如何利用浏览器能力避免主线程卡死，并保证即使关闭标签页，任务也不会中断?

多线程与SIMD加速:绝对不用主线程解析视频。我会`使用 Web Worker结合 WebAssembly(将 C++ 编写的高效视频处理库如 FFmpeg 编译为WASM)来进行视频解码和关键帧提取`。

离线持久化与恢复:`利用IndexedDB存储视频切片和处理进度`。结合 ServiceWorker和 Background Sync(后台同步)API，即使司机意外关闭了申诉页面，浏览器在后台也能继续上传处理过的视频片段，下次打开可直接恢复进

可视化反馈:`使用 0ffscreenCanvas在 Worker 线程中渲染视频预览缩略图`通过 postMessage的 Transferable Objects零拷贝传递给主线程展示，提供极佳的上传预览体验。


### 复杂表单与AI联动的状态管理:滴滴的“AI辅助审单系统”包含一个极其复杂的表单(包含行程信息、费用明细、司机备注、AI判责建议等)。当用户修改某项费用时，需要触发AI重新评估风险并刷新多个关联字段。如何使用状态管理库(如Zustand/Pinia)设计这套架构，避免不必要的组件重渲染和“级联更新”导致的卡顿?

`原子化与Selector精细化`:采用 Zustand 并配合createSelector或mmer中间件。将表单拆分为独立的 Slice(如 baselnfoSlice,aiSuggestionSlice)。

阻断无效渲染:利用 shallow比较或精细化的 Selector 函数，`确保只有依赖了riskScore的组件才在A重新评估后刷新`。

`异步Action编排`:将“用户修改费用”和“AI重新评估”封装为一个Transaction。使用 AbortController管理，如果用户在 500ms 内连续修改了多项费用，前一次的 AI触发将被 Cancel，只在最后一次修改后 500ms发起最新的 AI 风险评估，极大降低后端压力。


### 海量数据与WebGL渲染:在滴滴的运营大屏或安全监控系统中，需要在地图上实时渲染数万个车辆图标，并且根据AI计算结果(如疑似疲劳驾驶)动态改变颜色和形态。如果使用高德或百度地图API，直接添加几万个 Marker 会导致浏览器崩溃。你会如何优化?

`抛弃DOM，拥抱WebGL`:绝不使用原生的 AMap.Marker。我会使用高德地图的 Loca可视化图层，或者百度地图的 GlMap。它们底层基于 WebGL，能够将几万个点的渲染合批处理，性能提升数十倍。

视口裁剪与聚类(Clusterer):通过AMap.LabelsLayer结合自定义 Canvas绘制。`仅在屏幕可视区域内渲染车辆，配合四又树空间索引快速检索`。当缩放级别较小时，使用 MarkerClusterer将密集车辆聚合。

`状态更新优化`:AI计算出的状态变化(如疲劳驾驶报警)通过 WebSocket 推送到前端。前端使用 reguestAnimationFrame将离散的更新打包，在一次渲染循环中批量更新 WebGL缓冲区(Buffer)的颜色属性，避免频繁触发 GPU重绘。


### AI与出行业务的深度融合:滴滴每天产生海量的司乘通话录音和在线IM聊天记录。目前的痛点是:人工客服判责慢，且容易被情绪化言论误导。如果让你负责设计和开发一套“前置AI干预与实时判责系统”的前端交互，你会如何构思?请从“司机端”“乘客端”和“客服后台”三个维度阐述

`司机/乘客端(防御与引导)`:在通话或聊天时，前端利用轻量级 NLP 模型(通过 Transformers.js 在端侧运行)实时检测负面情绪词汇。一旦触发阈值，立即在 APP 内弹出“息怒弹窗”，提供一键投诉或申请平台介入的快捷入口，将矛盾化解在发生前。

`客服后台(提效与辅助)`:当司乘发起纠纷，客服打开工单时，前端通过SSE拉取大模型根据录音/聊天记录自动生成的“纠纷摘要”和“判责建议”(包含置信度进度条)。客服只需点击“采纳”，大幅缩短处理时长。


### 滴滴司机端的用户基数庞大，且很多司机使用的手机机型较差(低端 Android 机居多)。如果把AI 模型(如语音识别、图像车牌识别)直接跑在司机端，会遇到极大的性能和流量阻力。作为前端架构师，你如何通过技术手段平衡“AI体验”和“端侧成本”?

分层架构与云端协同(Cloud-Edge-End)

`端侧(WebAssembly)`:将蒸馏(Distillation)后的超轻量级模型(如MobileNet 变体)通过 WASM 跑在司机端，负责“实时反馈”(如车牌实时框选)，体验丝滑且无流量消耗。

`边缘节点(CDN/边缘计算)`:将通用的模型推理推送到离司机最近的边缘节点，处理非实时的图片/音频证据上报，降低回源延迟。

`动态降级机制`:前端在初始化时检测设备的 CPU 核心数和剩余内存。如果是低端机，自动将AI推理请求路由到云端，端侧仅负责上传数据和展示结果，确保老日机型不卡顿、不发烫。




———————————————


### 谈谈 Vite 的预构建原理，为什么它比 Webpack 快? Vite 生产环境为什么依然使用 Rollup 而不是 esbuild?


**预构建（Pre-bundling）解决什么问题**
  - 依赖（node_modules）通常是 CommonJS/UMD、包含大量小文件、还有深层导入；浏览器原生 ESM 在开发时如果直接按文件请求，会触发海量请求与解析成本。
  - 预构建`把「第三方依赖」统一处理成 浏览器友好的 ESM ，并做 依赖扁平化/去重 、 缓存 ，显著减少开发阶段的请求数和解析工作`。


**Vite 预构建怎么做（核心链路）**
  - 启动 dev server 时扫描入口（index.html/你的入口模块）→ 构建依赖图 → 识别需要预构建的 bare import（如 react 、 lodash ）。
  - 用 esbuild 对这些依赖做一次快速打包/转换：
    - CJS → ESM
    - 将多文件依赖合成更少的 chunk
    - 产物写到 node_modules/.vite （或缓存目录），并基于 lockfile/配置生成 cache key。
  - 后续启动如果 cache key 未变化，直接命中缓存，几乎秒开。


**为什么开发阶段 Vite 通常比 Webpack 快**
  - `按需编译` ：Vite dev 是「浏览器 ESM + 服务端按需转换」，只转换当前页面实际请求到的模块；Webpack dev 往往要先把整张依赖图打包成 bundle（即使有增量，启动成本也更高）。
  - `esbuild 极快` ：预构建与部分转换链路用 Go 写的 esbuild，吞吐量非常高。
  - `强缓存策略` ：依赖预构建产物稳定，二次启动/切换分支也更容易复用缓存。


**生产环境为什么仍偏向 Rollup，而不是纯 esbuild**
  - 产物质量与生态 ：`Rollup 在 Tree-shaking、Chunk 拆分策略、Code Splitting 的可控性、以及插件生态（尤其是各种“打包期语义处理”）上更成熟，产物更可控、更容易做到极致体积与兼容性`。
  - 语义级优化 ：`很多生产优化依赖 Rollup 插件体系`（例如更复杂的外部化、手写 chunk 策略、细粒度副作用标注处理等）。
  - esbuild 的定位 ：`esbuild 更强在“快”，但在“可控的产物结构/更复杂的打包语义”上相对弱一些`（这些年在进步，但工程上 Rollup 更稳）。因此典型组合是：`开发用 esbuild 加速、生产用 Rollup 保质量`。





### React18的新特性了解吗? Concurrent Mode 是什么?

**React 18 你需要能说出来的点**
  - `createRoot` ：启用新的`并发渲染能力`（旧的 ReactDOM.render 是 legacy）。
  - `自动批处理`（Automatic Batching） ：`不只在事件回调里，在 Promise、setTimeout、原生事件等异步边界也会自动合并多次 setState，减少渲染次数`。
  - `并发特性 API` ：
    - `startTransition` / `useTransition` ：把“非紧急更新”标记为可中断的 transition，保证输入、点击等紧急交互优先响应。
    - `useDeferredValue` ：让某个值“延迟跟上”，用于搜索联想、列表过滤等场景避免卡顿。
  - `Suspense 能力增强` ：与并发渲染结合后，加载态切换更平滑（配合流式 SSR 更明显）。


**Concurrent Mode（并发渲染）本质是什么**

- `不是“多线程同时渲染”，而是 React 在一次渲染工作中可以 切片（time-slicing） 、 可中断 、 可恢复 、并对更新做 优先级调度` 。
- 结果是：`当渲染大列表/复杂组件树时，React 可以先让位给更高优先级的用户输入，避免主线程长时间被占用导致掉帧`。


### 如果使用 Ref 直接操作 DOM，如何保证数据状态与 React State 的最终一致性?

原则：`让 React State 成为单一事实来源（Single Source of Truth）`
  - `能用受控组件/状态驱动就不要手动改 DOM`（比如输入框值、class 切换、显示隐藏等）。
  - 真需要 ref 操作 DOM（第三方库、Canvas、媒体播放、复杂 selection/scroll）时，把它当作“副作用层”，由 State 驱动它，而不是反过来。


**推荐做法（可落地的工程策略）**
  - 用 effect 同步 DOM ：`State 变化 → useEffect/useLayoutEffect 内对 DOM 做最小化更新`（布局相关优先 useLayoutEffect ，避免闪烁）。
  - 把 DOM 事件回写到 State ：`如果用户在 DOM 上产生变化（例如第三方编辑器内容变了），监听其事件并 setState ，让 React 状态追上真实值`。
  - 避免双向竞争 ：`不要一边 React render 设置 value，一边 ref 又去改 value；容易出现“跳字/回弹”`。要么完全受控，要么完全交给第三方并做受控边界（例如只在 blur/定时同步）。
  - 并发场景注意时序 ：React 18 下更新可能被延后/打断，直接读写 DOM 的代码要放在合适的 effect 阶段，并尽量使用函数式更新保证不会读到旧 state。

### Redux和 MobX区别?MobX响应式原理?

- `范式`
  - Redux：`函数式、显式数据流`（action → reducer → new state），强调可预测与可追溯。
  - MobX：`响应式、隐式依赖追踪`（observable → reaction/observer 自动更新），强调少模板代码与直觉式编程。
- `状态更新`
  - Redux：`不可变更新`（immutability），便于时间旅行、回放、调试；但`样板代码可能多`。
  - MobX：`可变（mutable）为主，通过 observable 包装对象`；`写法更自然`，但需要理解响应式边界与副作用。
- `渲染性能心智`
  - Redux：通`常靠 selector + memo（reselect）+ 组件拆分来控制渲染`。
  - MobX：`天然做到“用到哪里更新哪里”，组件只在其读到的 observable 变化时重渲`。


**MobX 响应式原理（简化但正确的描述）**
  - `observable` ：`把对象属性变成可追踪数据源`（内部用 getter/setter 或 Proxy 拦截）。
  - `依赖收集`（tracking） ：在 autorun/reaction 或 observer 组件渲染时，`读取 observable 会把“当前正在执行的 reaction”登记为该属性的订阅者`。
  - `触发更新`（notify） ：当 observable 被写入时，通知所有订阅它的 reactions 重新执行；React 组件层面就是触发 re-render。
  - action（可选但常用） ：把一组修改包起来，减少中间态触发、提高可控性（也更利于调试）。


- 需要强约束、可追溯、多人协作统一规范：Redux（或 RTK）。
- 业务迭代快、希望少样板、状态更贴近 OO/领域模型：MobX 体验更顺。



### 前端安全问题有哪些？CSRF 和XSS 攻击怎么防范?

`XSS（反射/存储/DOM 型）、CSRF、点击劫持（Clickjacking）、开放重定向、依赖供应链风险、敏感信息泄露（localStorage/日志/URL）、CORS 误配、Mixed Content、第三方脚本注入`等。


**CSRF 防护（核心是“让攻击站点拿不到有效凭证或请求不可伪造”）**
  - SameSite Cookie ：优先 `SameSite=Lax/Strict` ，能挡住大量跨站自动携带 Cookie。
  - CSRF Token ：服务端下发 token（放在页面或响应头），客户端请求带上，服务端校验（攻击者拿不到 token）。
  - 校验来源 ：`校验 Origin/Referer` （作为补充手段，别单独依赖）。
  - 避免 Cookie 作为唯一认证 ：`对高风险操作使用二次验证/短时效 token`。
  - 正确使用 CORS ：不要随意 Access-Control-Allow-Credentials: true + * 之类危险组合。


**XSS 防护（核心是“不要让不可信输入变成可执行代码”）**
  - `输出编码/转义` ：把用户输入当数据处理，输出到 HTML/属性/URL/JS 字符串时分别做上下文正确的编码。
  - `避免危险 API` ：少用/禁用 innerHTML 、 dangerouslySetInnerHTML ；必须用时做可靠的 HTML Sanitization（白名单）。
  - CSP（Content-Security-Policy） ：限制脚本来源、禁用 inline script（或配 nonce/hash），显著降低 XSS 成功率。
  - `HttpOnly Cookie` ：降低 XSS 窃取 Cookie 的收益（但不能防止 XSS 本身）。
  - 框架默认保护别破坏 ：React 默认会转义插值内容；只有你显式注入 HTML 时才会打开缺口。


### 虚拟列表有哪些常见的问题，怎么优化？

**常见问题**

  - `高度不固定导致跳动` ：列表项内容异步加载（图片、富文本、折叠展开）会让 item 高度变化，滚动时出现“抖动/白屏/定位不准”。
  - `快速滚动白屏/闪烁` ：`滚动速度很快时，渲染跟不上`；尤其在低端机或 item 组件很重（大量图片、复杂布局）。
  - `滚动定位不准`（scrollToIndex 误差） ：动态高度下 index → offset 映射不可靠，导致`跳转偏移、锚点错位`。
  - 复用 DOM 引发状态串行 ：为了性能复用节点（recycle），但组件内部 state 没有正确按 key 隔离，出现“第 A 行的状态跑到 B 行”。
  - 列表项副作用没清理 ：每次 item 挂载卸载都创建监听、定时器、IntersectionObserver，忘记清理导致内存增长、卡顿更重。
  - `滚动容器与布局系统冲突` ：`外层有 sticky、transform、嵌套滚动、吸顶头部/分组标题，导致可视区域计算错误`。
  - `SEO / 首屏可见性问题` ：虚拟列表天然不会渲染全部内容，对爬虫或“Ctrl+F 全文搜索”不友好。
  - 可访问性问题 ：屏幕阅读器/虚拟光标可能无法感知未渲染的条目；aria-setsize/posinset 不一致。
  - 服务端分页 + 虚拟列表拼接复杂 ：边滚动边拉取，既要处理 loading 占位，又要处理总数未知、重复数据、回退缓存等。


**优化思路（按优先级）**

- `优先固定高度 / 分组固定高度` ：能固定就固定；不固定就尽量分类型（几种高度），把问题从“任意高度”降维到“有限高度集合”。

- `动态高度：缓存 + 测量 + 渐进修正`
  - `首次用预估高度渲染（避免白屏），渲染后用 ResizeObserver /测量拿到真实高度，写入高度缓存（key → height），再增量修正总高度与偏移`。
  - 高度变化时“锚定当前可视第一项”做 offset 补偿，避免视窗跳动。

- `增加 overscan（预渲染缓冲） ：视窗上下多渲染几屏（例如 1–3 屏），换取更平滑的快速滚动；overscan 可随滚动速度动态调整（越快越大）`。

- 减少每个 item 的渲染成本
  - 组件拆分：`把“随数据变的部分”与“静态部分”拆开，配合 memo（React memo/useMemo/useCallback ）降低重渲`。
  - `图片：懒加载、指定宽高防重排`、降级为低清占位（LQIP）。
  - 避免同步重排：少在滚动过程中读写 layout（clientHeight/getBoundingClientRect 与 style 写入交替会触发强制回流）。

- 滚动事件处理正确姿势
  - `用 requestAnimationFrame 节流更新可视窗口计算`；滚动回调只做轻计算，重活（测量/数据处理）延后。
  - `CSS 使用 contain: layout paint`; （合适场景）减少重排影响面。

- 稳定 key 与状态外置
  - `key 必须使用稳定的业务 id，不要用 index`。
  - 行内输入等状态放到外部 store（或以 id 为索引的 map）里，避免卸载丢状态；或确保复用节点时按 key 重置内部 state。

- 正确的“定位/跳转”策略
  - 固定高度：index * itemSize 直接算。
  - 动态高度：维护 prefix-sum（累积高度）结构（可用 Fenwick/Segment Tree 思路或分块）来`实现较快的 offset ↔ index 互相查找；至少做“二分 + 缓存”`。

- 复杂布局（分组、吸顶、可变行）用成熟方案
  - React 生态通常选 react-window/react-virtual/tanstack virtual；Vue 选 vue-virtual-scroller 等（关键是要支持 dynamic size + sticky 的能力）。

- 工程化监控
  - 埋点/性能：滚动掉帧（FPS）、长任务（Long Task）、首次可交互时间、列表渲染耗时。
  - 内存：滚动一段时间后内存曲线是否持续上升（泄漏排查）。





————————————

### 实现一个简单的 Hook，用于处理 AI 流式返回的数据。

``` tsx
import * as React from "react";

type UseStreamReturn = {
  text: string;
  loading: boolean;
  error: unknown;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
};

export function useAIStream(
  request: (signal: AbortSignal) => Promise<Response>
): UseStreamReturn {
  const [text, setText] = React.useState(""); // 流式文本
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);
  const ctrlRef = React.useRef<AbortController | null>(null); // 控制流
  // 追加文本
  const append = React.useCallback((chunk: string) => {
    React.startTransition(() => { // 异步更新，不阻塞 UI
      setText((prev) => prev + chunk);
    });
  }, []);
  // 停止流
  const stop = React.useCallback(() => {
    ctrlRef.current?.abort();
    ctrlRef.current = null;
    setLoading(false);
  }, []);
  // 重置流
  const reset = React.useCallback(() => {
    stop();
    setText("");
    setError(null);
  }, [stop]);
  // 开始流
  const start = React.useCallback(async () => {
    if (loading) return;
    setError(null);
    setLoading(true);

    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    try {
      const res = await request(ctrl.signal);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("No body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      // 遍历读取流数据
      while (true) {
        const { value, done } = await reader.read();
        if (done || ctrl.signal.aborted) break;

        const chunk = decoder.decode(value, { stream: true });
        append(chunk);
      }
    } catch (e) {
      if (!ctrl.signal.aborted) setError(e);
    } finally {
      stop();
    }
  }, [append, loading, request, stop]);

  React.useEffect(() => stop, [stop]);

  return { text, loading, error, start, stop, reset };
}

// 使用示例：
const { text, loading, error, start, stop, reset } = useAIStream(async (signal) => {
  return fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ message: input }),
  });
});
```


### 请手写一个简单的打字机效果函数，模拟 AI 逐字显示文本。

``` ts
export function typewriter(
  text: string,
  onUpdate: (s: string) => void,
  msPerChar = 30,
  signal?: AbortSignal
) {
  let i = 0;
  onUpdate("");

  return new Promise<void>((resolve, reject) => {
    const id = window.setInterval(() => {
      if (signal?.aborted) {
        window.clearInterval(id);
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      i += 1;
      onUpdate(text.slice(0, i));

      if (i >= text.length) {
        window.clearInterval(id);
        resolve();
      }
    }, Math.max(0, msPerChar));
  });
}

// 使用示例：
const ctrl = new AbortController();
await typewriter(
  "Hello, world!",
  (s) => {
    console.log(s);
  },
  30,
  ctrl.signal
);
// ctrl.abort(); 可中途取消
```



### 你能写一个处理 AI 接口返回值的泛型工具函数吗?

``` ts
interface ApiResponse<T>{
  code: number;
  data: T;
  message: string;
}

interface ChatMessage {
  role:'user'|'assistant';
  content: string;
}

async function fetchChat<T>(params: object): Promise<ApiResponse<T>> {
  const response = await fetch("'/api/chat",{ method: 'post', body: JsoN.stringify(params) });
  return response.json();
}
```


### 手撕:实现一个 EventEmitter

``` ts
type Listener = (...args: any[]) => void;

class EventEmitter {
  constructor() {
    this.events: Map<string, Set<Listener>> = new Map();
  }
  // 注册事件监听器
  on(event: string, fn: Listener) {
    let set = this.events.get(event);
    if (!set) {
      set = new Set();
      this.events.set(event, set);
    }
    set.add(fn);

    return () => this.off(event, fn);
  }
  // 注销事件监听器
  off(event: string, fn?: Listener) {
    const set = this.events.get(event);
    if (!set) return;

    if (!fn) {
      this.events.delete(event);
      return;
    }

    set.delete(fn);
    if (set.size === 0) this.events.delete(event);
  }
  // 注册事件监听器，仅执行一次
  once(event: string, fn: Listener) {
    const wrapper: Listener = (...args) => {
      this.off(event, wrapper);
      fn(...args);
    };
    return this.on(event, wrapper);
  }
  // 触发事件
  emit(event: string, ...args: any[]) {
    const set = this.events.get(event);
    if (!set) return;

    [...set].forEach((fn) => fn(...args));
  }
}

// 使用示例：
const emitter = new EventEmitter();

const offHello = emitter.on("hello", (name: string) => {
  console.log("on hello:", name);
});

emitter.once("hello", (name: string) => {
  console.log("once hello:", name);
});

emitter.emit("hello", "Alice");
// on hello: Alice
// once hello: Alice

emitter.emit("hello", "Bob");
// on hello: Bob

offHello(); // 取消订阅（推荐方式：on 返回 off 函数）
emitter.emit("hello", "Cindy");
// 无输出

const fn = (msg: string) => console.log("msg:", msg);
emitter.on("message", fn);
emitter.emit("message", "hi"); // msg: hi

emitter.off("message", fn);
emitter.emit("message", "bye"); // 无输出

emitter.on("log", () => console.log("a"));
emitter.on("log", () => console.log("b"));
emitter.emit("log"); // a  b

emitter.off("log"); // 不传 fn：清空该事件所有监听
emitter.emit("log"); // 无输出
```


### 手撕:React 实现 TodoList，包含增删改查


``` tsx
import React, { useMemo, useState } from "react";

type Todo = { id: string; text: string; done: boolean };

export default function TodoList() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  // 添加
  const add = () => {
    const v = text.trim();
    if (!v) return;
    setTodos((prev) => [{ id: String(Date.now()), text: v, done: false }, ...prev]);
    setText("");
  };
  // 删除
  const remove = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id));

  // 更新
  const patch = (id: string, next: Partial<Todo>) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...next } : t)));

  const startEdit = (t: Todo) => {
    setEditingId(t.id);
    setEditingText(t.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const v = editingText.trim();
    if (!v) return;
    patch(editingId, { text: v });
    setEditingId(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };
  // 搜索
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return todos;
    return todos.filter((t) => t.text.toLowerCase().includes(q));
  }, [todos, query]);

  return (
    <div style={{ maxWidth: 520, margin: "24px auto", padding: 12 }}>
      <h3>TodoList</h3>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="输入待办，回车添加"
          style={{ flex: 1 }}
        />
        <button onClick={add}>添加</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索"
          style={{ width: "100%" }}
        />
      </div>

      <ul style={{ marginTop: 12, paddingLeft: 18 }}>
        {filtered.map((t) => (
          <li key={t.id} style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0" }}>
            <input type="checkbox" checked={t.done} onChange={() => patch(t.id, { done: !t.done })} />

            {editingId === t.id ? (
              <>
                <input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  style={{ flex: 1 }}
                  autoFocus
                />
                <button onClick={saveEdit}>保存</button>
                <button onClick={cancelEdit}>取消</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
                <button onClick={() => startEdit(t)}>编辑</button>
                <button onClick={() => remove(t.id)}>删除</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```


——————————————

Q：你做过的企业级前端项目里，最复杂的一次“需求持续迭代 + 体验优化”是什么？你如何拆解需求、评估风险、制定里程碑并保证交付质量？

- 回答框架：背景（业务目标/用户痛点）→ 约束（时间/人力/依赖）→ 拆解（里程碑/验收标准）→ 风险（技术/协作/回滚）→ 结果（数据/产出）→ 复盘（下次更好）
- 关键词：PRD 反推、MVP、里程碑、验收口径、风险清单、灰度/回滚、质量门槛、数据指标
- 加分点：讲清楚“你负责的范围”和“你做决策的依据”，结果用数字（效率/转化/性能/错误率）。


Q：讲一个你主导的“跨组协作”案例：有哪些关键对齐点（接口、排期、验收标准、灰度/回滚）？遇到冲突你怎么推进？

- 回答框架：多方角色（产品/后端/测试/运营）→ 对齐机制（接口/排期/验收）→ 冲突（资源/方案/边界）→ 推进手段（RACI、会议节奏、决策记录）→ 交付与复盘
- 关键词：RACI、接口契约、Mock、联调计划、里程碑验收、风险升级路径、变更管理
- 加分点：能讲“如何把模糊需求变成可执行清单”，以及“如何把不可控依赖变可控”。


Q：你如何理解“深入业务”？请举例说明你是如何从客户/业务目标倒推出前端方案与指标（转化、留存、效率、错误率等）的。

- 回答框架：业务目标（增长/降本/提效/合规）→ 关键路径与用户分群 → 指标体系（北极星 + 漏斗/效率）→ 前端可控抓手（体验/性能/稳定性/引导）→ 实验/灰度验证
- 关键词：漏斗、埋点方案、A/B、路径分析、转化率、任务完成时长、满意度、NPS（如有）
- 加分点：能说清“指标口径”和“归因边界”（哪些是前端能负责的，哪些需要端到端）。


Q：React 里你最常用的性能优化手段有哪些？分别适用于什么场景（useMemo/useCallback、memo、虚拟列表、懒加载、并发特性等）？如何证明优化有效？

- 回答框架：先定位（Profiler/Performance/长任务）→ 再分层（渲染/计算/网络/列表）→ 再治理（避免无效渲染、拆分、虚拟化、缓存）→ 再验证（前后对比）
- 关键词：React DevTools Profiler、memo/useMemo/useCallback、key 稳定、状态下沉、组件拆分、虚拟列表、懒加载、debounce/throttle、并发特性（视项目）
- 加分点：强调“不要滥用 useMemo”，先用数据证明瓶颈，再针对性优化；说清“优化前后指标”。


Q：Vue/React 你更偏哪个生态？请对比两者在组件设计、状态管理、工程化、性能定位上的差异，并给出你在企业级项目里的取舍原则。

- 回答框架：团队现状（人才/存量）+ 业务形态（中后台/活动/可视化）+ 生态（路由/状态/表单/组件库）+ 性能与可维护性 → 给出选择原则
- 关键词：Composition API vs Hooks、响应式系统、模板/JSX、状态方案（Pinia/Vuex vs Redux/RTK/Query）、工程化（Vite/webpack）、可测试性
- 加分点：不站队，讲“原则”：一致性优先、成本可控、可观测与可维护优先；给出迁移/混合策略（如微前端、逐步替换）。


Q：讲一个你处理“复杂状态”的实际方案：如何划分本地状态/全局状态，如何避免状态冗余与数据不一致？用过哪些方案（Redux/RTK、MobX、Pinia/Vuex、React Query 等）？

- 回答框架：按“生命周期/共享范围/一致性要求”划分 → `单一事实来源`（SSOT）→ 规范化数据 → 异步与缓存策略 → 可回溯与调试
- 关键词：SSOT、Normalized、Derived State、Server State vs Client State、React Query/SWR、RTK、事件驱动、不可变更新
- 加分点：能讲清“哪些状态不该放全局”（表单临时态、UI 状态），以及“服务端状态用 Query 类库更合适”。


Q：Webpack（或 Vite/Rollup）你做过哪些工程化建设？比如构建速度、产物体积、缓存、分包策略、按需加载、tree-shaking、source map 策略等，最显著的一次收益是什么？

- 回答框架：痛点（构建慢/包大/发版慢/线上加载慢）→ 措施（缓存、分包、按需）→ 监控（bundle report、构建耗时、线上资源加载）→ 结果
- 关键词：持久化缓存、并行构建、splitChunks、动态 import、tree-shaking、按需加载、CDN、预加载/预取、source map 策略
- 加分点：给“量化收益”（构建从 X 分钟到 Y、首屏资源减少 N%、chunk 数量/命中率）。


Q：线上性能你通常看哪些指标（LCP/INP/CLS、TTFB、长任务、内存、白屏时间）？你如何从“问题发现 → 定位 → 验证 → 回归”闭环？

- 回答框架：指标（Web Vitals + 业务指标）→ 数据来源（RUM/日志/埋点）→ 定位（分端、分网络、分页面、分版本）→ 治理（优化清单）→ 回归（看板+报警）
- 关键词：LCP/INP/CLS、TTFB、Long Task、Resource Timing、RUM、看板、阈值、版本对比、灰度验证
- 加分点：把“线上真实用户数据（RUM）”讲出来，而不是只讲本地 Lighthouse。


Q：你做过哪些“稳定性建设”？例如错误监控、日志、告警、熔断降级、重试、兜底页、灰度发布、回滚策略；能举一个真实的线上事故复盘吗？

- 回答框架：预防（规范/测试/灰度）→ 发现（监控告警）→ 定位（日志/链路）→ 止血（降级/回滚）→ 根因（复盘）→ 机制化（SLA/SLO）
- 关键词：前端错误监控、SourceMap 管理、告警阈值、白屏监控、接口失败重试/熔断、兜底页、灰度发布、回滚预案、复盘模板
- 加分点：讲一次真实事故要有“时间线 + 影响面 + 止血动作 + 机制改进”。


Q：在大型系统里你如何设计“可复用组件/设计系统”？组件 API 设计的原则是什么？如何保证一致性、可测试性和可演进性？

- 回答框架：一致性（规范/主题）→ 抽象边界（业务组件 vs 基础组件）→ API 设计（少而稳、可组合）→ 可测试/可文档化 → 版本与迁移策略
- 关键词：Design Token、可访问性（a11y）、受控/非受控、组合优于继承、向后兼容、变更记录、组件契约
- 加分点：能说“如何防止组件库变业务大杂烩”，以及“如何做破坏性变更的迁移”。


Q：安全方面你会重点关注哪些前端风险（XSS、CSRF、权限越权、依赖漏洞、敏感信息泄露）？你做过哪些落地措施？

- 回答框架：威胁模型（输入→渲染→权限→依赖）→ 关键风险（XSS/越权等）→ 工程化防护（编码规范/库/头策略）→ 审计与流程
- 关键词：XSS（转义/白名单）、CSRF（SameSite/Token）、权限校验（后端为准 + 前端兜底）、CSP、依赖漏洞扫描、敏感信息不落日志
- 加分点：明确“前端权限只是体验层，安全边界在服务端”，但前端要做“正确的默认与最小暴露”。


Q：你如何做代码质量保障（TypeScript 规范、Lint/Format、单测/集成测试、CI、Code Review）？你期望团队的“质量门槛”是什么？

- 回答框架：规范（TS strict、Lint）→ 自动化（CI 门禁）→ 测试策略（金字塔）→ Code Review 关注点 → 度量（覆盖率/缺陷率/Lead Time）
- 关键词：TypeScript strict、ESLint/Prettier、单测/集成、Mock、CI Gate、变更影响评估、PR 模板
- 加分点：讲“质量门槛可落地”：如 lint 必须过、关键路径必须有测试、发布必须灰度、错误率阈值触发回滚。


Q：你平时如何使用 AI 提升研发效率？请举例：在需求分析、代码生成、重构、排查线上问题、测试用例生成中各怎么用？如何控制“幻觉”和安全风险？

- 回答框架：使用场景（需求澄清/方案/编码/排障/测试）→ 方法（提示词、上下文）→ 校验（运行/测试/Review）→ 安全（不上传敏感信息）
- 关键词：代码生成但必须 Review、自动补测试、日志/堆栈分析、重构辅助、知识检索、脱敏、权限隔离
- 加分点：讲清“AI 输出当草稿，最终以可运行验证和团队规范为准”。


Q：给你一个场景：一个企业后台列表页数据量很大且筛选复杂，最近卡顿严重、报错率上升。你会如何制定排查与优化方案（优先级、数据采集、技术手段、交付节奏）？

- 回答框架：先止血（影响面、回滚/降级）→ 再定位（RUM+错误聚类）→ 再优化（渲染/请求/计算/缓存）→ 再验证（灰度、指标回归）→ 长期机制（看板+预算）
- 关键词：虚拟列表、分页/游标、筛选防抖、请求合并/取消、缓存（Query）、Web Worker（重计算）、分片渲染、错误重试与兜底、性能预算
- 加分点：能排优先级：先稳定性（错误率/白屏）再性能（INP/长任务），并且每一步都有“可观测数据”支撑。







———————————————



## 业务

萝卜快跑APP/wx小程序/支付宝小程序
- 打车入口，积分中心，好友助力，订单；各种运营活动

运营平台：
- 订单（长时用车，即时专送...），用户画像，渠道管理，新人福利，分享裂变，好友助力，拉新返现，积分商城
- 营销模块：优惠券，定价券，权益券；运营策略，计价策略，调价；订单对账，发票，合作企业管理...

打断平台：及时更新地图路况，同时验证站点连通性，及时高效地将最新的地图同步到车端
- 打断工单，工单版本，连通路段，路网；连通性子图
- 高清地图：用于自动驾驶和智能交通领域。它支持不同的数据格式和数据模型，包括道路拓扑、车道、交通信号和路况等信息。


站点渲染：webGL，几十万站点合并批量渲染，性能极佳
- BMapGL：Polygon、Point、Size、InfoWindow


运力平台：城市区域管理，可跑路线，站点管理，车辆管理；，为萝⼘快跑的⾃动驾驶出⾏服务提供运⼒管理服务

监控平台：实时显示监控调度平台⻋辆、乘客单和⻋辆异常信息等情况

云控平台：提供任务规则配置，运营配置、⾃动驾驶参数配置、动态落盘参数配置


### 用户增长

**用增营销模块**
- 用户增长
  - 拉新：分享裂变、渠道合作、好友助力
  - 留存：新人福利，订单/拉新返现，任务奖励，积分商城，券包管理
- 营销管理：优惠活动（折扣/立减），渠道优惠，优惠券，定价券，权益券

用户增长包括`获客、激活、留存、变现、推荐`阶段

`增⻓ = 流量获取 * 流量转化 * ⽤户替换成本`


**AARRR 模型**

`Acquisition（获取⽤户）、Activation（激活⽤户）、Retention（留存⽤户）、Revenue（⽤户变现）、Referral（⽤户推荐）`等 5 个部分，形成⼀个⽤户流量漏⽃。
- ⽤户获取A：分享、裂变、好友助⼒•
- ⽤户活跃A：签到、做任务、积分兑换、抽奖.... •
- ⽤户留存R：新⼈福利、优惠券、折扣券…… •
- ⽤户收益R：特卖、满减、加1元购…… •
- ⽤户转介绍R：拼团降价，转发拿券，朋友帮忙砍价……


**Growth Loops 模型**：病毒式裂变（Viral loop）、补贴增⻓（Paid loop）、UGC内容循环（User-generated content loop



## 架构

`背景 → 目标&约束 → 架构设计 → 产出&收益`


- 背景
  - 业务背景
  - 现状痛点：效率、质量、稳定性、协作成本

- 目标与约束
  - 产品目标
  - 技术目标
  - 对齐约束：业务形态、团队能力、交付节奏


- 架构设计
  - 分层设计：视觉层、数据层、业务层、基础能力层
  - 技术选型：候选方案对比、取舍依据、落地成本
  - 演进策略：MVP -> 规模化 -> 治理化（可扩展、可回滚）
  - 稳定性&安全

- 产出收益
  - 交付产出
  - 业务收益：量化指标
  - 长期价值：能力复用、团队协作效率、组织沉淀


### 追加问题

1. 遇到过哪些挑战？



2. 踩过哪些坑？



3. 你自己做过哪些决策？








## 项目


### B端低码平台

- 视图层：编辑端，渲染端；拖拽，可视化编辑，画布渲染；预览；沙箱隔离
- 协议层：渲染引擎， JSON schema 设计，事件流配置，组件树设计，状态与数据流管理
- 物料层：基础组件，业务组件，自定义组件，组件模板，页面模板
- 业务层：组件创建 =》 页面创建 =》草稿态 =》 发布 =》 回滚；项目管理；
- 基础能力：权限，版本管理，ci/cd工程化，插件机制；提供扩展api；安全，监控


页面配置中配置的变量怎么进行渲染？
1. 变量配置支持静态值、对象、变量、接口请求，保存的配置结构一般为`{type:'', value: ''}`；
2. 在页面渲染入口会监听所有组件config配置修改，并在回调中执行变量处理；
3. 在变量处理函数中会根据type判断，是静态值、对象、变量、函数表达式、接口请求，分别进行处理。
4. 如果是type是变量，则会从全局保存的所有变量和表单数据中获取对应的值；
5. 如果是函数表达式则通过`new Function`执行代码片段，将返回执行结果。
6. 最后在页面渲染的结果就是处理后的变量值。

技术难点：事件流的配置、组件的插入拖拽、变量的处理



### H5页面性能统计及性能优化



#### 性能统计

从当前浏览器窗⼝卸载旧⻚⾯开始，到新⻚⾯加载完成，整个过程⼀共被切分为 9 个⼩块：`提示卸载旧⽂档、重定向/卸载、应⽤缓存、DNS 解析、TCP握⼿、HTTP 请求处理、HTTP 响应处理、DOM 处理、⽂档装载完成`。每个⼩块的⾸尾、中间做事件分界，取 Unix 时间戳，两两事件之间计算时间差，从⽽获取中间过程的耗时（精确到毫秒级别）。

1. 页面准备阶段：`cache、dns解析、tcp、ssl`
2. 页面请求阶段：`HTTP Request处理、HTTP Response处理`
3. 页面渲染阶段：`DOM 处理、⽂档装载完成`


Google 中的 核⼼⽹⻚指标 有三个：`LCP、FID 和 CLS。`；75分位
1. LCP，最⼤内容绘制，视⼝中可⻅最⼤图⽚或⽂本块相对于⽤户⾸次导航到⽹⻚的呈现时间；衡量感知到的`加载速度`；`<= 2.5s`
2. FID，⾸次输⼊延迟，从⽤户第⼀次与⻚⾯交互直到浏览器对交互作出响应，并实际能够开始处理事件处理程序所经过的时间；衡量感知到的`响应速度`；`<= 100ms`
3. CLS，累积布局偏移，是⼀个重要的、以⽤户为中⼼的`衡量视觉稳定性`的指标；`<= 0.1`


- FP，白屏时间；`<= 1.8s`
- FCP，灰屏时间，首次内容绘制；`<= 1.8s`
- longtask，长任务时间，>=50ms的js任务
- Interaction to Next Paint (`INP`)，INP 是⼀项指标，通过观察⽤户在访问⽹⻚期间发⽣的所有点击、点按和键盘互动的延迟时间，评估⽹⻚对⽤户互动的总体响应情况；`<= 200ms`
- TTFB（Time To First Byte），首字节到达时间;
- TTI，首次可交互时间；`<= 3s`
- js/img资源加载耗时；`< 300ms, < 150k` 
- 首屏加载时间，FSP；利用 MutationObserver 自己计算

``` js
performance.getEntriesByName('first-paint')
performance.getEntriesByName('first-contentful-paint')

// fcp
 const observer = new PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            // ...
          }
        }
 });
 observer.observe({ type: 'paint', buffered: true });

//  lcp：largest-contentful-paint
// FID：first-input
// CLS：layout-shift
// longtask：longtask
const observer = new PerformanceObserver((list: any) => {
  let maxLong = null;
  for (const long of list.getEntries()) {
    if (maxLong === null || long.duration >= maxLong.duration) { // 获取耗时
      maxLong = long;
    }
  }
  observer.disconnect();
);
observer.observe({ type: 'longtask', buffered: true });
```


- 上报时机：`window.requestIdleCallback、setTimeout`
- 上报方式：`navigator.sendBeacon、img、xhr、第三⽅`


统计后结果：FCP >= 3.5s，需要优化
1. 对数据上报的接⼝添加了⽩名单过滤、js拆包、图⽚压缩；
2. 优化积分中⼼⻚⾯初始化接⼝请求逻辑：提前加载积分列表和详情接⼝，缩短业务侧耗时；
3. 添加积分中⼼⻣架屏渲染时间统计，并进⾏上报；
- 收益：`优化后LCP由3.5s左右缩短到2.5s左右，业务侧耗时较优化前缩短了800ms左右`；



#### 性能优化

- 渲染优化：
1. css3动画、虚拟列表、长任务拆分，异步执行计算任务，rAF批量渲染
2. web worker 单开子线程执行高计算任务，主线程只渲染数据结果
3. React组件用useMemo等缓存，避免重复渲染；恰当使用list key，避免diff重新渲染；
4. defer js优先，减少首屏DOM复杂度
5. 减少重排重绘，简化dom操作，首屏css内联，减少css选择器复杂度，js外链放底部，css外链放顶部



- http请求及资源加载优化
1. http强缓存，协商缓存；http2, cdn就近缓存；gzip压缩
2. 组件懒加载，图片懒加载，预加载，路由懒加载，按需加载组件，雪碧图合并
3. 低优先级资源异步加载，合并请求, 字体文件子集化
4. server worker离线缓存，客户端h5离线包，内容直出


- 构建优化
1. spitChunk拆分js；js压缩，css压缩，单独打包；多进程打包；静态资源打包压缩
2. tree shaking，scope hoisting；
3. 不常用的第三方包cdn引入


- 架构策略优化
1. 对搜索引擎排名有要求，想缩短白屏时间，可以考虑ssr渲染；SSR/SSG（静态站点生成）/流式 SSR；
2. 组件库开发，有组件、文档、工具、实例等多个文件，可考虑用monorepo管理；
3. 需要一套代码多端使用的，可考虑跨端框架，如taro、uni-app等；
4. 模块化与组件化，高复用，低耦合，引入监控


### 秒杀页面，下单支付页面架构设计



- 视图层：
  - 倒计时（减少diff渲染），innerText，获取服务器时间计算offset，定期用接口校准纠偏；极端情况（浏览器休眠）
  - 秒杀按钮，动画，首屏重要静态资源预加载，组件封装；瀑布流+虚拟滚动
  - 静态资源缓存，请求分级（p0/p1），低优先级异步加载；
- 业务层：秒杀资格判断 => 库存校验 => 订单创建 => 支付回调 => 状态更新；
- 数据层：
  - 防重 + 状态机锁（isSubmitting） + 前端生成幂等 Key ；双token去重（前端幂等+后端payToken）；维护请求队列（高峰）；超时查询；
  - 高并发重试策略（随机抖动，前端熔断，指数回避）；轮询查状态；取消请求逻辑处理；
  - 下单状态：`Idle → Submitting → Success | Failed | Cancelled | Queued`
  - 支付状态：`未发起、创建支付、排队/等待通道（后端处理？）、处理中、成功/失败/取消、不确定态 UNKNOWN`




### Taro跨端项目

好友助力、拉新返现、订单返现模块迁移到taro


实践问题：
1. taro 里面普通的`div`绑定`addEventListener`事件无效，需要用`ScrollView`组件进行绑定
2. taro 中使用 scrollIntoView 无效，换成`ScrollView`组件的`scrollIntoView`



优势：
1. React生态集成：可直接使用 React Hooks、Redux 等熟悉的状态管理方案；
2. 多端适配能力：小程序端：支持微信、支付宝、百度、字节等主流小程序平台；可通过条件编译实现端特有功能
3. 支持 CSS Modules、Sass、Less 等样式方案；完善的 TypeScript 支持，类型提示准确；开发工具链完善；

劣势：
1. 性能问题：小程序端 setData 性能瓶颈；复杂列表渲染时性能下降明显；首次加载时间较长；大量动画场景表现不佳；
2. 跨端兼容性：不同端 API 差异需要额外适配；复杂 UI 组件难以复用；样式兼容性问题需要特别处理；第三库兼容性需要评估



**编译运行原理：**
- `编译流程`：
  1. 代码解析阶段：源代码 =》 解析jsx/tsx =》 AST转换 =》 条件编译处理 =》分析依赖关系；
  2. 代码转换阶段：组件转换，API转换，样式转换；
  3. 代码生成阶段：生成目标平台代码，处理静态资源，生成项目配置文件
- `运行时处理`：
  1. 框架运行时初始化：生命周期映射，事件系统处理，状态管理适配；
  2. 组件运行时：组件映射，属性转换，事件处理；`平台适配层在组件渲染时会进行组件映射、API适配、样式适配`
  3. API运行时：API抹平层，平台差异化处理，polyfill支持
  4. 平台执行阶段：渲染原生组件，处理原生事件，执行平台API



#### 问题收集

1. Taro 的跨端核心原理是什么？编译时还是运行时？各端产物长什么样？

`@tarojs/cli` 是 Taro CLI 工具。CLI 里预先挂载了一系列的内置插件，每个命令、每个编译平台都是一个单独的 Taro 插件。

- 本质是“统一 React/Vue 语法 + 多端适配”，同时包含编译时和运行时两部分：
  - `编译时` ：`把你写的 TSX/JSX、模板语法、配置等转换成目标端能理解的结构`（尤其是小程序端的模板/配置/样式等）。编译小程序时，CLI 会调用 `@tarojs/mini-runner`：
    - 负责根据开发者的编译配置调整 Webpack 配置；
    - 注入自定义的 PostCSS 插件；注入自定义的 Webpack 插件；注入自定义的 Webpack Loaders；
    - 调用 Webpack 开启编译；
    - 修改 Webpack 的编译产物，调整最终的编译结果。
  - `运行时` ：在各端提供一套`运行时适配层`，把组件生命周期、事件、更新机制等桥接到目标端（小程序、H5 等）的运行环境里。`@tarojs/runtime` 是 Taro 的运行时适配器核心，它实现了精简的 DOM、BOM API、事件系统、Web 框架和小程序框架的桥接层等。
    - 为了让 React、Vue 等框架直接运行在小程序端，需要在`小程序的逻辑层模拟浏览器环境`，包括实现 DOM、BOM API 等。
    - Web 框架就可以`使用 Taro 模拟的 API 渲染出一颗 Taro DOM 树，但是这一切都运行在小程序的逻辑层`；而小程序的 xml 模板需要提前写死，Taro 如何使用一个静态的模板文件去渲染这颗动态的 Taro DOM 树呢？
    > Taro 选择了利用`小程序 <template> 可以引用其它 <template> 的特性，把 Taro DOM 树的每个 DOM 节点对应地渲染为一个个 <template>`。这时只需要把 Taro DOM 树的序列化数据进行 setData，就能触发 <template> 的相互引用，从而渲染出最终的 UI。



- 典型产物：
  - H5 ：接近普通 Web 应用（React/Vue + Webpack/Vite 打包产物），DOM 直接渲染。
  - 小程序 ：各平台的小程序产物（页面/组件的模板文件、逻辑 JS、配置 JSON、样式文件等），由小程序自身渲染层渲染，不是 DOM。
  - 其他端（如 RN 等） ：取决于项目是否启用对应端的适配与渲染方案，整体也是“目标端原生运行环境 + Taro 运行时适配”。


2. Taro 的编译链路/构建流程：JSX/TSX 如何转小程序？中间做了哪些转换与约束？

- 面试回答要点：Taro 的核心是“`把组件树/页面结构静态化为模板 + 把动态部分变成数据驱动的绑定`”。
- 过程可以这么讲（不讲过细实现细节，避免说错）：
  - 解析源码 ：`对 TS/JS、JSX/TSX 做语法解析，拿到结构化表示（AST）`。
  - 端能力约束与降级 ：`识别不适合小程序渲染层的写法（例如依赖真实 DOM 的行为），在编译期做限制提示或转换成等价写法`。
  - 结构生成 ：`把 JSX 里的结构映射到小程序组件/标签体系，生成模板`（各端方言不同）。
  - 数据/事件绑定生成 ：`把 props/state/循环/条件渲染等变成模板绑定表达式、事件绑定`，并生成相应的运行时胶水代码。
  - 输出与打包 ：`根据路由/页面配置生成各页面的配置文件与依赖关系，处理样式（px/rpx 转换、作用域等），最终输出到目标端目录结构`。


3. 为什么小程序端对 React 语法/DOM 能力有天然限制？Taro 里哪些点“能写但容易踩坑”？

- 根因：`小程序是“双线程/双层模型”（逻辑层 + 渲染层），渲染层不是浏览器 DOM，UI 更新依赖数据通信（setData/数据桥），所以很多 Web 的能力在小程序端要么不存在，要么成本很高`。
- 常见坑位（面试高频）：
  - `直接依赖 DOM/布局测量` ：例如随意用 document/window 、依赖 DOM API、复杂的实时测量与动画。`小程序要走 selector query、节点信息能力有限且异步`。
  - `高频更新导致性能问题` ：滚动跟手、mousemove 类交互、动画每帧 setState，会放大成`高频 setData 通信，容易卡顿`。
  - `事件差异` ：事件对象字段、冒泡/捕获、手势事件在不同小程序端不完全一致；H5 写法照搬会出问题。
  - `样式能力差异` ：CSS 特性支持不一致（尤其高级选择器、某些布局/特效），以及端侧样式隔离规则不同。


4. Taro 的运行时机制：生命周期、事件系统、setState 如何映射到小程序 setData？更新粒度与性能瓶颈在哪里？

- 核心认知：在小程序端，最终 UI 更新基本都要落到“把数据同步到渲染层”。`Taro 的运行时负责把你熟悉的组件模型（state/props/lifecycle）映射到小程序页面/组件实例，并把更新合并后通过 setData（或等价更新接口）提交`。
- 生命周期：`React 组件生命周期/Hook 运行在逻辑层；页面级还要对齐小程序的页面生命周期（onLoad/onShow/onHide 等），通常由框架做映射/补齐`。
- 更新粒度与瓶颈：
  - `瓶颈通常不在 diff 本身，而在“跨线程数据通信 + 渲染层更新成本”` 。
  - 高频、大片数据、深层对象频繁变更会导致 setData payload 变大、序列化/传输开销增大。

- 你可以给面试官一个“工程化结论”：
  - `少做高频 setState；把高频动效交给 CSS/原生动画能力或节流；拆分组件与数据结构，控制 setData 的体积与频次；避免巨型列表一次性渲染（用虚拟列表/分页/分片）`。


5. 多端差异治理怎么做：条件编译、适配层、组件/样式兼容策略？如何避免平台判断污染？

- 面试官想听的是“你有体系”，而不是到处 if (process.env.TARO_ENV) 。可以按三层讲：
1. `架构层：适配层（Adapter/Port）`
- 把“平台差异能力”封装成少数几个模块：如 storage 、 network 、 auth 、 clipboard 、 map 、 media 。业务只依赖适配层接口，不直接碰平台 API。
2. `UI 层：跨端组件 + 端特化组件并存`
- 绝大多数组件走跨端实现；少数差异大的组件做 Component.h5.tsx / Component.weapp.tsx 这种“同名多端实现”，由构建选择正确文件，业务侧不写条件分支。
3. `工程层：条件编译只放在边界处`
- 条件编译/平台判断集中在：适配层实现、端特化组件入口、少量路由/配置差异。
- 业务代码里原则：不出现平台判断；确实需要也通过 hook/工具函数抽象掉。
- 样式策略：统一设计变量/Token（颜色、间距、字号），用一套规范控制 rpx/px、暗黑模式、主题；对不稳定的 CSS 特性避免依赖，或提供端侧降级。


6. Taro 跟 uni-app、React Native、Flutter（或 KMM）跨端方案的本质区别是什么：渲染架构、性能模型、生态与团队技术栈成本各怎么权衡？你为什么选 Taro？

- Taro（偏“前端工程化 + 多端编译适配”）
  - 核心优势：对 Web/React/Vue 技术栈友好；能同时覆盖 H5 + 各类小程序；团队学习成本低；业务迭代快。
  - 核心限制：受小程序宿主能力上限影响（UI/动画/渲染能力、节点能力、复杂交互）；性能天花板更接近“小程序原生”而不是原生 App。

- uni-app（偏“Vue 生态 + 一体化工具链”）
  - 适合：团队 Vue 为主、追求“上手快、插件多、生态一条龙”。
  - 常见取舍：生态便利，但深度定制/工程可控性因团队、项目结构差异而不同；`复杂场景依旧会遇到各端差异治理问题`（不是框架能完全抹平的）。

- React Native（偏“运行时跨端，原生渲染”）
  - 适合：目标是 iOS/Android App，想要`更接近原生的交互与性能`；愿意投入原生侧能力建设（原生模块、桥接）。
  - 局限：对小程序并不是天然目标（需要额外方案）；`基础设施和发布链路更偏 App 研发`。

- Flutter（偏“自绘渲染引擎”）
  - 适合：高一致性 UI、复杂动画/高帧率诉求强、希望跨 iOS/Android/桌面等统一体验。
  - 取舍：包`体积、与原生/现有 Web 体系融合成本、团队语言/生态（Dart）成本`；对小程序不是典型主战场（存在探索方案但不是主流“稳态”路径）。

- 面试里讲“为什么选 Taro”可以这样落点
  - `业务目标是 H5 + 多家小程序 覆盖，而不是追求“原生 App 极致体验”`。
  - 团队技术栈（React/TS/工程化）可以直接复用，交付效率高。
  - 清楚承认边界：`复杂交互/高性能动画场景会做端内差异化`（必要时原生/自定义组件/降级策略），而不是幻想“100% 一套代码无差异”。


7. 跨端项目的路由、分包与资源管理怎么做：小程序分包/预加载、H5 路由模式、端侧限制（包体积、页面栈）在 Taro 中如何落地？

- `路由策略`
  - H5：通常采用 history/hash 路由（看部署条件），配合动态 import 做页面级拆包。
  - 小程序：路由是页面栈模型（navigateTo/redirectTo/switchTab 等），栈深、跳转方式、tab 页规则都有限制；路由“形态”与 H5 不同，`通常在业务层抽象“导航服务”统一入口`，避免散落平台判断。

- `分包与首屏`
  - 小程序：必须关注包体积与首屏性能。做法一般是：
    - `主包只放首屏必需页面与公共基础能力`
    - 业务按域拆分包（例如：用户中心、营销、订单）
    - 控制公共依赖下沉：`把“很大但低频”的依赖放到分包，或做能力拆分`
    - 配合“预下载/预拉取/预加载”（各平台能力不同）减少二跳等待
  - H5：`利用浏览器缓存、HTTP 缓存策略、按路由拆包 + 预加载关键 chunk`。

- `资源管理`
  - 图片/字体/多媒体：小程序对资源体积、加载方式、域名白名单等约束更严格；H5 则关注 CDN、缓存与首屏关键资源优先级（preload/priority）。
  - 多端一致性：`尽量把“资源路径/域名/环境变量”集中配置`；在 CI 里分别产出各端构建产物，避免手改。


8. 跨端中的样式体系如何保证一致性：CSS Modules/Sass、设计稿适配（rpx/px/viewport）、样式隔离、原子化/Design System 在多端分别会遇到什么坑？

- 一致性的“现实原则”
  - 多端不可能完全像素级一致，目标更合理的是：`布局一致 + 关键视觉一致 + 交互一致，少量端差可接受且可控`。

- 适配策略
  - 小程序常见单位是 rpx（不同平台实现略有差异）；H5 通常用 px/viewport 方案。跨端项目里建议：
    - 形成统一的设计 token（间距、字号、圆角、颜色）
    - `对尺寸适配使用统一工具链`（例如 px→rpx 或基于设计稿的换算），并把规则固化在构建/样式层

- 样式隔离与组织
  - 建议`组件级样式隔离（CSS Modules / BEM / scoped 思路）`，避免全局污染。
  - `谨慎依赖复杂选择器、伪类/伪元素、某些 CSS 特性`（不同小程序内核支持差异、以及与宿主组件实现有关）。

- Design System
  - `最稳的是“组件库 + token”：把按钮/表单/弹窗/列表骨架等抽成跨端组件，业务只组合，不到处写样式`。
  - `对极端差异组件（如长列表、富文本、复杂弹层）准备端内实现`或降级版本。

- 常见坑（面试高频）
  - 字体与行高在不同端渲染差异导致抖动/截断
  - 1px 边框、阴影、fixed/sticky 在不同端表现不一致
  - 弹窗层级（z-index）与滚动穿透处理在小程序/H5差异大


9. 跨端状态管理与数据请求怎么设计：Redux/Zustand/MobX/Context 选择依据是什么？多端存储、登录态、网络层（拦截器、重试、并发控制）如何统一？

- `状态管理选型逻辑`（面试要点是“边界清晰”）
  - 本地组件状态：`只影响当前组件/页面的，用组件 state`。
  - 页面级状态：`页面内共享但不需要全局，用页面 store 或轻量方案`。
  - `全局状态：登录态、用户信息、权限、全局配置、购物车等，用全局 store`（Redux/Zustand/MobX/Pinia 等按团队栈选）。
  - 关键点：避免“所有东西都塞全局”，否则依赖混乱、更新难控。

- 网络层统一
  - `抽象一个 request 模块`：统一 baseURL、header、错误码处理、超时、重试、取消、日志（注意不要打敏感信息）。
  - `拦截器能力`：请求前注入 token；响应统一处理“登录失效/刷新 token/业务错误码”。
  - `并发控制`：常见需求是“`同一接口合并/去重”“token 刷新时队列挂起后重放”“避免重复提交”`。

- 多端存储与登录态
  - 存储抽象：`把 localStorage/小程序 storage 统一在一个 storage service 里；约定 key、版本、过期策略`。
  - 登录态：明确“token 过期”的策略（静默刷新 vs 强制重登），以及在多端的跳转差异（H5 路由 vs 小程序页面栈）。

- 我不确定的点说明
  - 各小程序平台对“预拉取/预下载”与网络能力的具体 API 细节、限制参数会有差异，面试时可以说“策略一致、实现按平台文档落地”。


10. 跨端的性能与工程化你怎么做：首屏/包体积优化、按需加载、缓存策略、埋点与监控（各端差异）、自动化测试与 CI/CD（多端构建发布）怎么落地？

- `性能优化`抓手（按“可度量”回答）
  - `首屏：减少主包体积、减少首屏接口数量与串行依赖、关键资源优先加载、骨架屏/占位提升感知性能`。
  - 包`体积：按路由拆包、依赖按需引入、避免引入大而全库、剔除无用 polyfill、多端分别做构建分析（bundle 分析）`。
  - `渲染性能：避免过深组件树与高频 setState；长列表做虚拟列表/分页；减少不必要的重渲染（memo/useMemo/useCallback 的合理使用）`。

- `缓存策略`
  - H5：HTTP 缓存 + CDN + Service Worker（若项目允许）+ 接口缓存（按业务场景）。
  - 小程序：更多依赖本地存储缓存（带版本与过期）、预拉取/预加载能力（平台差异存在），以及减少重复请求。

- `监控与埋点`（跨端要点是“统一模型，分端上报”）
  - 指标统一：`PV/UV、页面停留、首屏耗时、接口耗时、错误率、关键转化漏斗`。
  - 实现上：埋点 SDK 抽象统一接口，H5/小程序分别适配上报通道；错误采集包含 JS error、Promise rejection、接口错误。
  - 注意：敏感数据脱敏，不记录 token/手机号等。

- `测试与质量`
  - 单元测试：工具函数、状态管理、请求层、关键业务逻辑优先（跨端最容易复用也最值得测）。
  - 端到端：关键链路（登录/下单/支付前流程等）用最少用例覆盖；小程序 E2E 成本更高时，至少保证核心逻辑可测与灰度策略。

- `CI/CD`
  - 多端产物分开构建：同一代码仓库，CI 里按环境变量分别构建 H5 与各小程序产物。
  - 配置管理：环境变量、域名、feature flag 集中管理；禁止手工改配置发版。
  - 发布：H5 可走静态资源发布；小程序走各平台提审/发布流程，结合版本号与变更记录。



### 组件库


### 富文本编辑器


### ssr




### AI RAG知识库


目标：提供一个B端页面搭建聊天助手，方便用户通过提问查询如何搭建，方便用户快速上手搭建。


架构设计
- 视觉层：AI聊天助手、SSE流式输出
- 数据层：
  - RAG模型（基于向量数据库）
  - 向量模型、LLM语言大模型、重排模型（Cohere Rerank 3）、分类模型（用于路由分类模型）、向量数据库、向量存储VectorStore
- 底层支持：
  - 敏感信息过滤、权限校验
  - 日志与指标上报：
  1. 把每一步耗时（检索、rerank、LLM）、命中率、失败率、token 成本、常见 query 分布都打点，异常时能定位是数据问题还是检索问题还是提示词问题。
  2. 统计召回率，准确率，分析，优化；A/B测试，对比分析；



流程：
1. 本地文档 =》 文档切分 =》 通义向量模型存储chunk到向量数据库；
2. 前端传入问题 =》query向量化 =》 去向量数据库检索 =》 返回topK的检索结果 + 系统提示词 + 提问 =》 LLM语言大模型生成回答。


RAG系统的评估指标
- 召回率（Recall）：检索到的正确文档数 / 总的相关文档数；`召回率从39%提到了81%`
- 准确率（Precision）检索到的正确文档数 / 检索到的总文档数；`Precision@5从0.73提到了0.89`
- 事实准确性：回答是否准确。人工评估，或LLM自动评分
- 忠实度（Faithfulness）：生成的答案是否忠于检索到的文档？有没有瞎编？
- 相关性（Relevance）：通俗解释：回答是否切题？


**怎么统计召回率？**
1. 准备 20~50 个真实问题（先小规模就行），比如来自客服/群聊/工单。对每个问题，人工看知识库，标出“哪些文档片段能正确回答这个问题”。给`这些片段一个唯一 ID`（如 doc_12#chunk_3 ），这组 ID 就是这个问题的 Gold （标准答案证据集）。
2. 需要存成这样一张表：`query_id ：问题编号 / question ：问题内容 / gold_chunk_ids ：人工标注的相关片段 ID 列表`
``` js
// 示例
q1 | "如何配置页面变量？" | [c101, c205]
q2 | "发布后如何回滚？"   | [c330]
q3 | "事件流怎么配置？"   | [c410, c411, c512]
```
3. 然后每个问题去检索，拿 TopK 结果（比如 K=3），记录系统返回的 chunk ID 列表：
``` js
q1 -> [c101, c777, c205] // 系统返回的TopK结果，命中了c101和c205，召回率: 2/2=1; 准确率：2/3=0.66
q2 -> [c888, c330, c999] // 命中了c330，召回率: 1/1=1; 准确率：1/3=0.33
q3 -> [c410, c700, c800] // 命中了c410一个，召回率: 1/3=0.33; 准确率：1/3=0.33
```
4. 计算召回率：`命中的相关片段数 / 该问题人工标注的相关片段总数`，统计平均值






**有哪些优化策略？**
1. 查询优化：让大模型生成多个语义相似但表达不同的查询，然后用这些查询去检索，最后合并结果。（提高召回率，覆盖多角度，鲁棒性强）
2. 路由优化：使用LLM作为路由分类器，根据用户查询，自动将查询分类到不同的路由中：sql查询、向量查询、网页查询。
3. 分块优化：人工整理Q&A对，按固定格式组织成文档；按问题间空格分块，按语义分块。
4. 检索优化：排序、过滤，使用重排模型（`Cohere Rerank 3`）对检索文档的相关性进行评分和排序，再重排，返回topK


**怎么解决用户提问不在知识库范围内的问题（OOD，Out-of-Domain）？**
> 在检索前、检索中、检索后、生成时层层过滤
1. 检索前用分类模型给提问贴标签，不在预设标签范围内的提问不进行检索；
2. 混合检索（关键词+向量），用`BM25`做关键词精确匹配；
3. 重排序，排序打分，强约束系统提示词（不得胡乱编造）
3. 强制引用、无证据不回答


**为什么选择Langchain.js？**
1. 含有Models，Prompts，Memory等多个模块，提供了一套工具、组件和接口，简化了创建LLM应用的过程
2. Chains支持链式调用，支持数据流式传递，易于多步任务编排。
2. 社区活跃，生态丰富，比其他同类框架成熟，支持LangGraph图标工作流，配置更灵活，方便进行自定义开发，也方便后续扩展

- LlamaIndex支持索引查询，一站式文档处理，但不能灵活控制流程，而且社区不如langchain成熟
- Qwen-Agent轻量，集成度高，配置简单，开箱即用；但不适合灵活配置场景。

`LanChain做编排，LlamaIndex做索引。`



Q：你知道 Bi-Encoder 和 Cross-Encoder 的区别吗？如果 Bi-Encoder 打分高，但 Cross-Encoder 打分低，说明什么问题？






### Vibe Coding的应用

Q：AI Coding有那些应用场景？
1. code review
2. 生成测试用例
3. bug排查
4. B端低码平台：设计系统组件（Button、Modal、Table 等）
  - spec 写什么：Props/Slots 契约、受控/非受控模式、交互细节（ESC/焦点陷阱）、a11y（ARIA）、主题/尺寸变体、兼容性、边界状态（loading/disabled）。
  - 收益：组件“能用”到“可复用”的关键差异都在 spec 里，否则 AI/新人很容易做出“看起来对但不可维护”的实现。


长程任务
- 挑战：上下文窗口有限、中断要重来、规模大了不可控、效果差、成本高、速度低
- 解决：任务拆解、并行执行、中断可续传、明确停止边界条件





### OpenClaw的应用

1. 业务场景：`线上紧急修复、灰度发布前、活动页临发版`
做法：在群里 @openclaw 触发固定流水线： lint + typecheck + unit + build + bundle budget + lighthouse ，结果直接回到聊天里（甚至附带报告/链接）

2. 设计系统/组件库“规格化交付”：Spec 产物直接变成可执行资产
- 业务场景：Button/Modal/Table 这类组件，最怕“功能看似齐全但交互边界/A11y/受控模式没做对”
- 做法：先用 Spec 定义 Props/slots、键盘交互、ARIA、受控/非受控、主题变体；OpenClaw 驱动生成/补全：


3. 运营后台“列表-筛选-导出”闭环自动化：防参数漂移与一致性翻车
- 业务场景：B 端后台需求高频变更，最常见 bug 是筛选参数/导出参数不一致、空错慢状态漏处理
- 做法：Spec 固化 QuerySchema、序列化规则、导出一致性策略；OpenClaw 触发回归用例（fixtures）：


4. 线上故障“前端值班助手”：从告警到定位/止血更快闭环
- 业务场景：白屏、接口异常、CDN 资源 404、特定浏览器崩溃
- 做法：监控/告警 Webhook → OpenClaw 聚合关键信息（版本、路由、错误堆栈、最近发布变更）→ 自动生成排查路径与临时止血方案（开关降级/回滚建议）→ 必要时创建修复分支并跑门禁


5. 定时“健康巡检”：把前端工程隐患变成每天自动汇报
- 业务场景：依赖漏洞、包体积慢慢膨胀、关键页面性能回退、i18n/a11y 退化
- 做法：用 OpenClaw 的 Cron 定时跑：依赖审计、bundle budget、关键路由 Lighthouse、端到端冒烟；结果每天推送到群里（Cron/Webhook 能力在官方文档的功能列表中有提及，来源同上）




### Cluade Code







————————————

## 离职原因

1. 前司是一家做少儿在线英语教育的公司，19年教培行业因不可抗力发生大规模调整，原有的业务线被缩减。考虑到个人长期的稳定发展，我更愿意选择寻找一个更稳健、且业务方向更具前景的平台。

2. 虽然在boss直聘期间成长了很多，也做得还可以，但我在前司工作期间，前司是单双休上班机制，且加班比较严重，长期加班导致我身体一直处于亚健康状态；考虑到身体健康原因，更倾向于选择一个wlb的公司

3. 部门业务线发生调整，且感觉个人发展进入了瓶颈期，为了持续提升自己的能力，我更愿意寻求一些新的挑战。

4. 虽然我目前在百度做得还不错，因为我老家就是四川的，家里人希望我离他们近一点，方便照顾；在北京工作这么多年，我最近也是打断回到四川稳定下来，不打算做北漂了。



——————————

## 自我介绍

你好，我叫周元，我之前在boss直聘、新浪微博等公司做过前端开发，目前是在百度萝卜快跑团队做前端开发工作。

做前端开发这几年做过的业务方向主要是用户增长，社区，电商、以及商业化相关的业务需求，做过的业务模块类型也比较多，包括PC、H5、小程序、后台管理系统、全栈、跨端等等，都参与过，有一定的开发经验；在前段基建项目上也参与过部门组件库搭建，脚手架，低码平台、监控平台等项目的开发。

目前我在百度所在团队主要负责日常业务需求的迭代开发与一些前端项目架构设计工作，（平时也负责当前前端业务小组的管理和工作分配），以上就是我的自我介绍~

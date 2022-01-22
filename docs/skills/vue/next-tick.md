---
title: 深入vue.$nextTick实现原理
date: 2021-10-10 23:11:46
permalink: /pages/497095/
categories:
  - vue
tags:
  - vue
---
# 深入vue.$nextTick实现原理


## 源码分析
> vue版本：`v2.6.14`

源码位置：
``` js
// src/core/util/next-tick.js

/* @flow */
/* globals MutationObserver */

import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'

export let isUsingMicroTask = false // 是否使用微任务

const callbacks = [] // 回调队列
let pending = false // 是否正在等待

// 遍历执行回调
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0) // 复制
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).

// 这里我们有使用微任务的异步延迟包装器。
// 在2.5中，我们使用了(宏)任务(结合了微任务)。
//然而，它有微妙的问题，在重绘之前状态会改变 (例如#6813,out-in过渡)。
//同样，在事件处理程序中使用(宏)任务会导致一些奇怪的行为，不能被绕过的(例如#7109，#7153，#7546，#7834，#8109)。
//因此，我们现在再次到处使用微任务。
//这种权衡的一个主要缺点是存在一些场景
//这里的微任务优先级太高，介于两者之间
//连续事件(例如#4521，#6690，它们有变通方法)
//甚至在同一个事件的冒泡之间(#6566)。
let timerFunc

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:

// nextTick行为利用了微任务队列，该队列可以被访问
// 通过native Promise.then or MutationObserver。
// MutationObserver有更广泛的支持，但是它被严重地bug
// UIWebView在iOS中>= 9.3.3当在触摸事件处理程序中触发。它
// 触发几次后完全停止工作…所以,如果native Promise是可用的，我们将使用它:
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) { // 首先检测浏览器是否原生支持 Promise
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks) // 支持 Promise 的话，在Promise.then之后执行回调函数flushCallbacks

    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.

    // 在有问题的uiwebview中，Promise.then不会完全崩溃，但是
    // 它可能会陷入一种奇怪的状态，其中回调被推入
    //微任务队列，但队列没有被刷新，直到浏览器
    //需要做一些其他的工作，例如处理一个计时器。因此,我们可以
    //通过添加空定时器强制刷新微任务队列
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true // 是使用的微任务
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) { // 再检测浏览器是否原生支持 MutationObserver

  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks) // 创建并返回一个新的 MutationObserver 它会在指定的DOM发生变化时被调用。
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, { // 对 textNode 进行监听,当 textNode 改变时，会执行回调函数 flushCallbacks
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter) // 改变 textNode，触发回调执行
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) { // 检测浏览器是否原生支持 setImmediate
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks) // 调用 flushCallbacks 执行回调
  }
} else { // 否则都用 setTimeout 执行回调
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

/**
 * 
 * @param {*} cb 回调函数
 * @param {*} ctx 上下文
 * // 对外暴露了 nextTick 函数
 */
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  // 把传入的回调函数 cb 压入 callbacks 数组
  // 这里使用 callbacks 而不是直接在 nextTick 中执行回调函数的原因是保证在同一个 tick 内多次执行 nextTick，
  // 不会开启多个异步任务，而把这些异步任务都压成一个同步任务，在下一个 tick 执行完毕。
  callbacks.push(() => {
    if (cb) { //如果有回调
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick') // 报错
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc() // 最后一次性执行 timerFunc
  }
  // $flow-disable-line
  // 当 nextTick 不传 cb 参数的时候，提供一个 Promise 化的调用
  // 当 _resolve 函数执行，就会跳到 then 的逻辑中，例：nextTick().then(() => {})
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}

```

## 手写实现



## 参考

- [简单理解Vue中的nextTick](https://juejin.cn/post/6844903557372575752)
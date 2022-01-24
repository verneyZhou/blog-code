---
title: vue2与vue3的差异
date: 2021-09-01 23:12:04
# permalink: false # 0194e6/
categories: 
  - vue
tags: 
  - vue3
permalink: false # 0e94b1/
---

# vue2与vue3的差异


## 前言

- [vue v2.x官方文档](https://cn.vuejs.org/)
- [vue v3.x官方文档](https://v3.cn.vuejs.org/)


## 原理

### Options API vs Composition API


- [Vue2的Options API](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE)

::: tip Options API
- data
- methods
- mounted
- watch
- computed
:::
> 当这个组件的代码超过几百行时，这时增加或者修改某个需求， 就要在` data、methods、computed` 以及 `mounted` 中反复的跳转~


- [Vue3的Composition API](https://v3.cn.vuejs.org/guide/composition-api-introduction.html)

::: tip Composition API
- **setup**： `setup` 是 `Vue3.x` 新增的一个选项， 他是组件内使用 `Composition API`的入口。
- **reactive、ref 与 toRefs**：响应式
    - reactive: 返回对象的响应式副本; [参考](https://v3.cn.vuejs.org/api/basic-reactivity.html#reactive)
    ``` js
    const obj = reactive({ count: 0 })
    ```
    - ref: 接受一个内部值并返回一个响应式且可变的 `ref` 对象。`ref` 对象仅有一个 `.value` property，指向该内部值。[参考](https://v3.cn.vuejs.org/api/refs-api.html#ref)
    ``` js
    const count = ref(0)
    console.log(count.value) // 0

    count.value++
    console.log(count.value) // 1
    ```
    - toRefs: 将响应式对象转换为普通对象，其中结果对象的每个 `property` 都是指向原始对象相应 `property` 的 `ref`。

:::


### 生命周期

beforeDestroy名称变更成beforeUnmount; destroyed 表更为 unmounted。

- [vue2 生命周期](https://cn.vuejs.org/v2/api/#%E9%80%89%E9%A1%B9-%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E9%92%A9%E5%AD%90)
- [vue3 生命周期](https://v3.cn.vuejs.org/api/options-lifecycle-hooks.html)


### 响应式原理

- [vue2的响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)
- [vue3的响应式原理](https://v3.cn.vuejs.org/guide/reactivity.html)

::: tip Object.defineProperty 与 Proxy
1. `Object.defineProperty`只能劫持对象的属性， 而 `Proxy` 是直接代理对象
> 由于Object.defineProperty只能劫持对象属性，需要遍历对象的每一个属性，如果属性值也是对象，就需要递归进行深度遍历。但是 Proxy 直接代理对象， 不需要遍历操作
2. `Object.defineProperty`对新增属性需要手动进行`Observe`
> 因为`Object.defineProperty`劫持的是对象的属性，所以新增属性时，需要重新遍历对象， 对其新增属性再次使用`Object.defineProperty`进行劫持。也就是 `Vue2.x` 中给数组和对象新增属性时，需要使用`$set`才能保证新增的属性也是响应式的, `$set`内部也是通过调用`Object.defineProperty`去处理的。
:::


## 使用

### 初始化
新的全局API`createApp`，调用返回一个应用实例, 区别于`new Vue()` 返回的根组件的实例
> 避免从同一个 `Vue` 构造函数创建的每个根实例共享相同的全局变量


``` js
import App from "./App.vue";
import router from "./router";
import store from "./store";


////// vue2
import Vue from 'vue';
// 根实例
const app = new Vue({
    router,
    store,
    el: '#app',
    render: h => h(App)
});

///// vue3
import { createApp } from "vue";
const app = createApp(App)
app.use(router).use(store).mount("#app");
```

### v-model
在 `vue 2.x` 中，`v-model` 是 `v-bind:value` 和 `@input="value=$event.target.value"` 的语法糖，需要使用名为 `value` 的`prop`，且一个组件上只能使用一个 `v-model` 绑定；

`vue 3.x` 中`prop`和事件默认名称已更改，且支持多个`v-model`绑定, `value` 变为 `modelValue`; 事件 `input` 变为 `update:modelValue`

``` html
<!-- vue2 -->
<comp v-model="value" :title:sync="titleVal" />

<!-- vue3 -->
<comp v-model:title="titleVal" v-model:name="nameVal">
```

### watch 与 watchEffect

[参考](https://v3.cn.vuejs.org/api/computed-watch-api.html#watcheffect)

- `watch`: `watch API` 与选项式 `API this.$watch` (以及相应的 `watch` 选项) 完全等效。`watch` 需要侦听特定的数据源，并在单独的回调函数中执行副作用。默认情况下，它也是惰性的——即回调仅在侦听源发生变化时被调用。

- `watchEffect`: 立即执行传入的一个函数，同时响应式追踪其依赖，并在其依赖变更时重新运行该函数。
``` js
const count = ref(0)

watchEffect(() => console.log(count.value))
// -> logs 0

setTimeout(() => {
  count.value++
  // -> logs 1
}, 100)
```

## Vue3 新特性

### Teleport

[参考](https://v3.cn.vuejs.org/guide/teleport.html)


### Suspense

[参考](https://v3.cn.vuejs.org/guide/migration/suspense.html)





## 参考

- [Vue3 对比 Vue2.x 差异性、注意点、整体梳理](https://juejin.cn/post/6892295955844956167)
- [Vue3.0 新特性以及使用经验总结](https://juejin.cn/post/6940454764421316644)
- [2021年，让我们手写一个mini版本的vue2.x和vue3.x框架](https://segmentfault.com/a/1190000040236708)
- [阿里妈妈又做了新工具，帮你把 Vue2 代码改成 Vue3 的](https://juejin.cn/post/6977259197566517284)
- [vue2升vue3官方迁移指南](https://v3.cn.vuejs.org/guide/migration/introduction.html)
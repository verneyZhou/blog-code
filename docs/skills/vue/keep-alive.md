---
title: Vue深入：vue中keep-alive的实现原理
date: 2023-07-25 23:54:15
permalink: false
categories:
  - vue
tags:
  - keep-alive
  - vue
---


# Vue深入：vue中keep-alive的实现原理

在我们的平时开发工作中，经常为了组件的缓存优化而使用 `<keep-alive>` 组件，接下来简单分析下它的实现原理~

[keep-alive的使用](https://v2.cn.vuejs.org/v2/api/#keep-alive)

## 实现原理


> 先看一个简单的使用例子：

``` html
<!-- 正则表达式 (使用 `v-bind`) -->
<keep-alive :include="/a|b/" :max="10">
  <component :is="view"></component>
</keep-alive>

<!-- 数组 (使用 `v-bind`) -->
<keep-alive :include="['a', 'b']" :max="10">
  <component :is="view"></component>
</keep-alive>
```

> 关于它的使用，这里就不多说了，直接进入源码学习环节吧~



### keep-alive组件

- `<keep-alive>` 是 Vue 源码中实现的一个内置组件，先看下源码中是如何实现的：
``` js
// src/core/components/keep-alive.js

const patternTypes: Array<Function> = [String, RegExp, Array]

export default {
  name: 'keep-alive',
  abstract: true, //  是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在组件的父组件链中。

  props: {
    include: patternTypes, // 只有名称匹配的组件会被缓存
    exclude: patternTypes, // 任何名称匹配的组件都不会被缓存
    max: [String, Number] // 最多可以缓存多少组件实例
  },

  methods: {
    cacheVNode() {
      // ...  
    }
  },

  created () {
    this.cache = Object.create(null) // 缓存组件实例
    this.keys = []
  },

  destroyed () {
    // ...
  },

  mounted () {
    // ...
  },

  updated () {
    this.cacheVNode()
  },

  render() {
    // ...
  }
}
```
> 上面的代码是`keep-alive.js`完整的源码，刚开始看可能没什么头绪，我们先从`export default`开始~

- 可以看到 `<keep-alive>` 组件的实现也是一个对象，注意它有一个属性 `abstract` 为 `true`，是一个抽象组件，在生命周期初始化的时候对抽象组件做了处理：
``` js
// src/core/instance/lifecycle.js

// 初始化生命周期
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) { // 当前组件的父组件是一个抽象组件，继续向上查找
      parent = parent.$parent // 改变父组件指向，一直向上查找，直到找到一个非抽象组件
    }
    parent.$children.push(vm)
  }
}
```
> 在组件生命周期初始化的时候，会判断当前组件父组件是否是抽象组件，如果是，则一直往上查找，直到找到一个非抽象组件~


- 执行 `<keep-alive>` 组件渲染的时候，就会执行到 `render` 函数, 接下来着重看下`render`：

``` js
  render () {
    const slot = this.$slots.default // 获取<keep-alive>...</keep-alive>中的内容
    // 由于我们也是在 <keep-alive> 标签内部写 DOM，所以可以先获取到它的默认插槽，然后再获取到它的第一个子节点。
    // <keep-alive> 只处理第一个子元素，所以一般和它搭配使用的有 component 动态组件或者是 router-view，这点要牢记。
    const vnode: VNode = getFirstComponentChild(slot)
    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // check pattern 
      // 判断了当前组件的名称和 include、exclude 的关系
      const name: ?string = getComponentName(componentOptions)
      const { include, exclude } = this
      // 如果当前组件不满足匹配规则，直接返回 vnode，不缓存了
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      /**
       * 缓存逻辑
       */
      const { cache, keys } = this
      const key: ?string = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
      if (cache[key]) { // 有缓存
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        // 并且重新调整了 key 的顺序放在了最后一个，这样就保证了最近使用的组件会被缓存下来，而不常用的组件会被移除缓存。
        remove(keys, key)
        keys.push(key)
      } else { // 无缓存, 把 vnode 设置进缓存 （首次渲染）
        this.vnodeToCache = vnode // 当前缓存的 vnode
        this.keyToCache = key // 当前缓存的 key
      }

      vnode.data.keepAlive = true // 添加 keepAlive 标记
    }
    return vnode || (slot && slot[0])
  }
```

`render`方法主要做了这些事情：

1. 先获取到它的默认插槽，然后再获取到它的第一个子节点`vnode`，获取 `vnode` 名称 `name`;
> `<keep-alive>` 只处理第一个子元素，所以一般和它搭配使用的有 `component` 动态组件或者是 `router-view`，这点要牢记~

2. 然后开始校验组件名称，如果组件名不匹配设置的`include`或`exclude`，那么就直接返回这个组件的 `vnode`，不缓存了；否则的话走下一步缓存逻辑；

3. 缓存的逻辑是：如果是首次渲染，先存下当前`vnode`和`key`；如果有缓存，则直接从缓存中拿 `vnode` 的组件实例，并且重新调整了 `key` 的顺序放在了最后一个。

4. 最后设置`vnode.data.keepAlive = true`,标记当前组件已缓存；




- **`keep-alive`组件中对缓存还有些其他处理：**

1. `pruneCache`: 对 cache 做遍历，发现缓存的节点名称和新的规则没有匹配上的时候，就把这个缓存节点从缓存中摘除。
    > 一般在`include`或`exclude`发生变化时会再次出发这个方法；

2. `pruneCacheEntry`: 删除指定key的缓存组件实例，并从keys数组中移除key。
    > 一般在组件`destroy`、调用`pruneCache`方法、缓存组件个数超了的时候会调用~

3. `cacheVNode`: 缓存组件；在生命周期为`mounted`和`updated`的时候会调用；

> 具体代码如下：

``` js
// src/core/components/keep-alive.js

// 对 cache 做遍历，发现缓存的节点名称和新的规则没有匹配上的时候，就把这个缓存节点从缓存中摘除。
function pruneCache (keepAliveInstance: any, filter: Function) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const entry: ?CacheEntry = cache[key]
    if (entry) {
      const name: ?string = entry.name
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}


// 删除指定key的缓存组件实例，并从keys数组中移除key
function pruneCacheEntry (
  cache: CacheEntryMap,
  key: string, // 要移除的缓存组件的 key
  keys: Array<string>,
  current?: VNode
) {
  const entry: ?CacheEntry = cache[key]
  // 判断如果要删除的缓存组件 tag 是不是当前渲染组件 tag，不是的话，删除当前缓存的组件实例。
  if (entry && (!current || entry.tag !== current.tag)) {
    entry.componentInstance.$destroy()
  }
  cache[key] = null // 置空缓存
  remove(keys, key) // 从 keys 数组中移除 key
}

export default {
  name: 'keep-alive',
  // ...
  methods: {
    // 缓存当前vnode
    cacheVNode() {
      const { cache, keys, vnodeToCache, keyToCache } = this
      // 如果之前已经缓存过
      if (vnodeToCache) {
        const { tag, componentInstance, componentOptions } = vnodeToCache
        // 将当前vnode添加进缓存
        cache[keyToCache] = {
          name: getComponentName(componentOptions),
          tag,
          componentInstance,
        }
        keys.push(keyToCache)
        // prune oldest entry
        // 校验缓存数量是否超出最大值
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode) // 移除第一个缓存的组件实例
        }
        this.vnodeToCache = null // 置空
      }
    }
  },
  destroyed () {
    // 遍历删除所有缓存的组件实例
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },
  mounted () {
    this.cacheVNode()
    // 监听include和exclude的变化，动态更新缓存
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },
  updated () { // 更新缓存
    this.cacheVNode()
  },
```

> 上面分析了 `<keep-alive>` 的组件实现，接下来分析在渲染流程中它是怎么处理普通组件跟缓存组件的~

### 渲染流程

- **首次渲染**

>  Vue 的渲染最后都会到 `patch` 过程，而组件的 `patch` 过程会执行 `createComponent` 方法：

``` js
// src/core/vdom/patch.js

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    let i = vnode.data
    if (isDef(i)) { // 首先对 vnode.data 做了一些判断
      // 判断 vnode 是否是一个被 keep-alive 缓存过的组件，如果是则直接调用 prepatch 钩子函数进行处理
      // 第一次渲染的时候，它的父组件 <keep-alive> 的 render 函数会先执行, 所以 vnode.componentInstance 为 undefined，vnode.data.keepAlive 为 true，因此 isReactivated 为 false，那么走正常的 init 的钩子函数执行组件的 mount。
      const isReactivated = isDef(vnode.componentInstance) && i.keepAlive

      // 如果 vnode 是一个组件 VNode，那么条件会满足，并且得到 i 就是 init 钩子函数
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        // 走正常的 init 的钩子函数执行组件的 mount
        // vnode.componentInstance 会在这一步创建 
        i(vnode, false /* hydrating */) 
      }
      
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue) // 当 vnode 已经执行完 patch 后，执行 initComponent 函数
        insert(parentElm, vnode.elm, refElm)
        if (isTrue(isReactivated)) { // 缓存渲染：在 isReactivated 为 true 的情况下会执行 reactivateComponent 方法
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
        }
        return true
      }
    }
  }

  // 初始化组件  
  function initComponent (vnode, insertedVnodeQueue) {
    // ...
    vnode.elm = vnode.componentInstance.$el // vnode.elm 缓存了 vnode 创建生成的 DOM 节点
    // ...
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    // ...
    // 把缓存的 DOM 对象直接插入到目标元素中，这样就完成了在数据更新的情况下的渲染过程。
    insert(parentElm, vnode.elm, refElm)
  }
```
1. 组件第一次渲染的时候，它的父组件` <keep-alive>` 的 `render` 函数会先执行, 所以 `vnode.componentInstance` 为 `undefined`，`vnode.data.keepAlive` 为 `true`；
2. 组件第一次渲染走完正常的`init hooks`之后，组件实例`vnode.componentInstance`已经创建完成并已挂载；之后在`initComponent`里 `vnode.elm` 会缓存 `vnode` 创建生成的 `DOM` 节点。
> 所以对于组件首次渲染而言，除了会在父组件 `<keep-alive>` 中建立缓存外，和普通组件渲染没什么区别。


- **缓存渲染**

例：`<keep-alive><router-view name="RouterA"/></keep-alive>`,
> 一般我们如果路由`RouterA`首次渲染后，由其他路由再次切回路由`RouterA`，路由`RouterA`就触发了缓存渲染~

**在Vue的编译过程中，当数据发送变化，在 `patch` 的过程中会执行 `patchVnode` 的逻辑，它会对比新旧 `vnode` 节点，甚至对比它们的子节点去做更新逻辑。**

Q: 对于 `<keep-alive>` 组件而言，如何更新它包裹的内容呢？

`patchVnode` 在做各种 diff 之前，会先执行 `prepatch` 的钩子函数:
``` js
// src/core/vdom/create-component.js

// 初始化一个 Component 类型的 VNode 的过程中实现了几个钩子函数
const componentVNodeHooks = {
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    // vnode.componentInstance 有值，设置了 keepAlive 缓存，说明是缓存渲染
    if ( vnode.componentInstance && !vnode.componentInstance._isDestroyed && vnode.data.keepAlive) {
      // kept-alive components, treat as a patch
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode) // 更新
    } else { // 没有设置缓存的首次渲染
      // 通过 createComponentInstanceForVnode 创建一个 Vue 的实例
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      )
      // 然后调用 $mount 方法挂载子组件
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },
  prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    const options = vnode.componentOptions
    const child = vnode.componentInstance = oldVnode.componentInstance
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    )
  },
  insert (vnode: MountedComponentVNode) {
    // ...
  },
  destroy (vnode: MountedComponentVNode) {
    // ...
  }
}


// src/core/instance/lifecycle.js
export function updateChildComponent (...) {
  // ...   
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
  }
  // ...
}

```
> 上面的 `prepatch` 主要是执行 `updateChildComponent` 方法, 该方法主要是去更新组件实例的一些属性, 这里我们重点关注一下 slot 部分；

1. 由于 `<keep-alive>` 组件本质上支持了 `slot`，所以它执行 `prepatch` 的时候，需要对自己的 `children`，也就是这些 `slots` 做重新解析，并触发 `<keep-alive>` 组件实例 `$forceUpdate` 逻辑，也就是重新执行 `<keep-alive>` 的 `render` 方法，这个时候如果它包裹的第一个组件 `vnode` 命中缓存，则直接返回缓存中的 `vnode.componentInstance`;
2. 接着又会执行 patch 过程，再次执行到 `createComponent` 方法，这个时候`vnode.componentInstance`已经通过缓存拿到了，则`isReactivated` 为 `true`; 
3. 接下来在执行 `init` 钩子函数的时候不会再执行组件的 `mount` 过程了；会执行 `reactivateComponent` 方法：把缓存的 DOM 对象直接插入到目标元素中，这样就完成了在数据更新的情况下的渲染过程。
> 这也就是被 `<keep-alive>` 包裹的组件在有缓存的时候就不会在执行组件的 created、mounted 等钩子函数的原因了。



### 生命周期

> 组件一旦被 `<keep-alive>` 缓存，那么再次渲染的时候就不会执行 `created、mounted` 等钩子函数，但是我们很多业务场景都是希望在我们被缓存的组件再次被渲染的时候做一些事情，好在 Vue 提供了 `activated` 钩子函数，它的执行时机是 `<keep-alive>` 包裹的组件渲染的时候，接下来我们从源码角度来分析一下它的实现原理。


在 patch 渲染的最后一步，会执行 vnode 的 `insert` 钩子函数：

``` js
// src/core/vdom/create-component.js

// 初始化一个 Component 类型的 VNode 的过程中实现了几个钩子函数
const componentVNodeHooks = {
    init(){
        // ...
    },
    prepatch() {
        // ...
    },
    insert (vnode: MountedComponentVNode) {
        const { context, componentInstance } = vnode
        if (!componentInstance._isMounted) {
            componentInstance._isMounted = true
            callHook(componentInstance, 'mounted') // 组件在这里执行 mounted 钩子
        }
        if (vnode.data.keepAlive) {
            if (context._isMounted) { // 被 <keep-alive> 包裹的组件已经 mounted
            //  queueActivatedComponent逻辑：
            // 遍历所有的 activatedChildren，执行 activateChildComponent 方法，通过队列调的方式就是把整个 activated 时机延后了。
                queueActivatedComponent(componentInstance)
            } else {
                activateChildComponent(componentInstance, true /* direct */)
            }
        }
    },

  destroy (vnode: MountedComponentVNode) {
    const { componentInstance } = vnode
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy()
      } else {
        deactivateChildComponent(componentInstance, true /* direct */)
      }
    }
  }
}
```
- 钩子函数里针对`keep-alive`组件是否已挂载调了不同的函数，接下来看看这些方法：
``` js
// src/core/instance/lifecycle.js

export function activateChildComponent (vm: Component, direct?: boolean) {
  // ...
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]) // 并且递归去执行它的所有子组件的 activated 钩子函数
    }
    callHook(vm, 'activated') // 添加 activated 生命周期
  }
}


// 和 activateChildComponent 方法类似，就是执行组件的 deacitvated 钩子函数，并且递归去执行它的所有子组件的 deactivated 钩子函数。
export function deactivateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = true
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i])
    }
    callHook(vm, 'deactivated')
  }
}

```





## 总结

1. 在组件首次渲染的时候，它的父组件`<keep-alive>` 的 `render` 函数会先执行，`keep-alive`会将该组件实例缓存起来；
2. 当再次渲染该组件时，在它的父组件`keep-alive`做 `diff` 数据更新的逻辑中，需要对自己的 `children`，也就是这些 `slots` 做重新解析, 并触发 `<keep-alive>` 组件实例 `$forceUpdate` 逻辑，也就是重新执行 `<keep-alive>` 的 `render` 方法；
3. 这时，按道理组件应该会命中`keep-alive`的缓存，那就直接返回缓存的组件实例；
4. 之后组件在执行 `init` 钩子函数的时候，就不会走跟首次渲染一样创建组件实例的逻辑，也不会执行组件的 `created、mounted` 等钩子函数了，而是直接将缓存的 DOM 对象直接插入到目标元素中；
5. 在渲染的最后一步，会执行 vnode 的 `insert` 钩子函数，在这个钩子里会判断：如果是被 `<keep-alive>` 包裹的组件已经渲染完毕,则给所有组件加上`activated`的生命周期；同时在`destroy`钩子函数中，也给所有被`keep-alive`包裹的组件加上`deactivated`生命周期。


> 通过分析我们知道了 `<keep-alive>` 组件是一个抽象组件，它的实现通过自定义 `render` 函数并且利用了插槽，并且知道了 `<keep-alive>` 缓存 vnode，了解组件包裹的子元素——也就是插槽是如何做更新的。且在 patch 过程中对于已缓存的组件不会执行 mounted，所以不会有一般的组件的生命周期函数但是又提供了 activated 和 deactivated 钩子函数。另外我们还知道了 `<keep-alive>` 的 props 除了 include 和 exclude 还有文档中没有提到的 max，它能控制我们缓存的个数。



## 参考

- [Vue.js 技术揭秘:keep-alive](https://ustbhuangyi.github.io/vue-analysis/v2/extend/keep-alive.html)
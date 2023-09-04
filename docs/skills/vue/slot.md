---
title: Vue深入：vue中slot插槽的实现原理
date: 2023-07-20 17:31:15
permalink: false
categories:
  - vue
tags:
  - slot
  - vue
---


# Vue深入：vue中slot插槽的实现原理

Vue 的组件提供了一个非常有用的特性 —— **slot 插槽**，它让组件的实现变的更加灵活。

插槽的具体使用可参考官网：[components-slots](https://v2.cn.vuejs.org/v2/guide/components-slots.html)

插槽分为**普通插槽**和**作用域插槽**，它们可以解决不同的场景，下面从源码的角度来分析插槽的实现原理。
> 注：本文学习的源码为vue2的源码，[vue2源码地址](https://github.com/vuejs/vue)

## 普通插槽

- 一个例子：

``` js
// 子组件
let ChildComp = {
  template: '<div class="container">' +
  '<header><slot name="header"></slot></header>' +
  '<main><slot>默认内容</slot></main>' +
  '<footer><slot name="footer"></slot></footer>' +
  '</div>'
}

// 父组件
let vm = new Vue({
  el: '#app',
  template: '<div>' +
  '<child-comp>' +
  '<h1 slot="header">{{title}}</h1>' +
  '<p>{{msg}}</p>' +
  '<p slot="footer">{{desc}}</p>' +
  '</child-comp>' +
  '</div>',
  data() {
    return {
      title: '我是头部信息',
      msg: '我是内容',
      desc: '我是底部信息'
    }
  },
  components: {
    ChildComp
  }
})
```
定义了 ChildComp 子组件，它内部定义了 3 个插槽，2 个为具名插槽：
1. 一个 name 为 `header`；
2. 一个 name 为 `footer`；
3. 还有一个没有定义 name 的是默认插槽，`<slot>` 和 `</slot>` 之前填写的内容为默认内容；

我们的父组件注册和引用了 ChildComp 的组件，并在组件内部定义了一些元素，用来替换插槽，那么它最终生成的 DOM 如下：

``` html
<div>
  <div class="container">
    <header><h1>我是头部信息</h1></header>
    <main><p>我是内容</p></main>
    <footer><p>我是底部信息</p></footer>
  </div>
</div>
```

接下来从源码编译流程分析下 slot 实现原理~

### init初始化

- 把源码`clone`下来，找到`src`目录，首先找到`Vue`初始化入口：

``` js
// src/core/instance/index.js

// 入口

import { initMixin } from './init'

// Vue实际上就是一个用 Function 实现的类，我们只能通过 new Vue 去实例化它
function Vue (options) {
  // Vue只能通过 new 关键词来实例化
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options) // 初始化
}

export default Vue
```

- 这里主要看下`_init`方法：

``` js
// src/core/instance/init.js


import { initRender } from './render'


export function initMixin (Vue: Class<Component>) {

  // Vue的初始化
  Vue.prototype._init = function (options?: Object) {

    // 初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等等。
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm) // 初始化渲染
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    if (vm.$options.el) {
      vm.$mount(vm.$options.el) // 挂载
    }

  }
}

```
> 这里主要做的是些初始化的操作，slot插槽属于模板渲染里的内容，接着主要看下 `initRender` 方法~

``` js
// src/core/instance/render.js

import { resolveSlots } from './render-helpers/resolve-slots'

export function initRender (vm: Component) {
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject
}
```
子组件的 init 时机是在父组件执行 patch 过程的时候，那这个时候父组件已经编译完成了。并且子组件在 init 过程中会执行 initRender 函数，initRender 的时候获取到 `vm.$slot`


`vm.$slot`有什么用呢？这里先不着急继续往下分析，先看看vue在编译阶段做了什么吧~


### 编译

编译是发生在调用 `vm.$mount` 的时候，所以编译的顺序是先编译父组件，再编译子组件。

- 首先编译父组件，在 `parse` 阶段，会先后执行 `processSlotContent` 和 `processSlotOutlet` 两个方法 处理 slot：


#### processSlotContent
> 该方法主要是对父组件中`<template slot="xxx" slot-scope="scope">、<div slot="xxx" slot-scope="scope">`进行处理~

``` js
// src/compiler/parser/index.js

// e.g. <template slot="xxx">, <div slot-scope="xxx">
function processSlotContent (el) {
  let slotScope
  // 设置scope属性
  if (el.tag === 'template') { // <template slot="xxx" slot-scope="scope">
    slotScope = getAndRemoveAttr(el, 'scope')
    el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
    
  } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) { // <div slot="xxx" slot-scope="scope">
    // 不能用 v-if 属性
    if (process.env.NODE_ENV !== 'production' && el.attrsMap['v-for']) {
      warn(
        `Ambiguous combined usage of slot-scope and v-for on <${el.tag}> ` +
        `(v-for takes higher priority). Use a wrapper <template> for the ` +
        `scoped slot to make it clearer.`,
        el.rawAttrsMap['slot-scope'],
        true
      )
    }
    el.slotScope = slotScope
  }

  // slot="xxx" => vue2.6之前的用法
  const slotTarget = getBindingAttr(el, 'slot') // 获取slot属性
  if (slotTarget) {
    el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget // 没有slotTarget的话，就是default
    el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot']) // 如果是 <div :slot="xxx">，则xxx为动态变量
    // preserve slot as an attribute for native shadow DOM compat
    // only for non-scoped slots.
    if (el.tag !== 'template' && !el.slotScope) { // <div slot="xxx">
      addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'))
    }
  }

  /**
   * 下面这部分主要是兼容vue2.6之后 v-slot:xxx 的写法，可以先不看，不影响整体逻辑~
   */
  // 兼容格式：v-slot:xxx => vue2.6之后引入的用法
  if (process.env.NEW_SLOT_SYNTAX) {
    if (el.tag === 'template') { // <template v-slot:xxx> 或 <template v-slot:[xxx]>
      // 通过正则匹配 v-slot:xxx
      const slotBinding = getAndRemoveAttrByRegex(el, slotRE) // slotRE = /^v-slot(:|$)|^#/
      if (slotBinding) {
        const { name, dynamic } = getSlotName(slotBinding) // 获取xxx名称，及是否是动态变量
        el.slotTarget = name
        el.slotTargetDynamic = dynamic // 是否是动态变量，如v-slot:[xxx]
        el.slotScope = slotBinding.value || emptySlotScopeToken // force it into a scoped slot for perf
      }
    } else { // <div v-slot:xxx>
      // v-slot on component, denotes default slot
      const slotBinding = getAndRemoveAttrByRegex(el, slotRE)
      if (slotBinding) {
        // add the component's children to its default slot
        const slots = el.scopedSlots || (el.scopedSlots = {})
        const { name, dynamic } = getSlotName(slotBinding)
        const slotContainer = slots[name] = createASTElement('template', [], el)
        slotContainer.slotTarget = name
        slotContainer.slotTargetDynamic = dynamic
        slotContainer.children = el.children.filter((c: any) => {
          if (!c.slotScope) {
            c.parent = slotContainer
            return true
          }
        })
        slotContainer.slotScope = slotBinding.value || emptySlotScopeToken
        // remove children as they are returned from scopedSlots now
        el.children = []
        // mark el non-plain so data gets generated
        el.plain = false
      }
    }
  }
}
```
`processSlotContent`方法主要有两个作用：
1. 给带有`slot`属性的`dom`或`template`添加 `slotTarget` 和 `slotTargetDynamic` 属性；
2. 给带有`slot-scope / scope`属性的`dom`或`template`添加 `slotScope`属性；


- 当解析到标签上有 slot 属性的时候，会给对应的 AST 元素节点添加 `slotTarget` 属性，然后在 `codegen` 阶段，在 `genData` 中会处理 slotTarget：

``` js
// src/compiler/codegen/index.js

export function genData (el: ASTElement, state: CodegenState): string {
  let data = '{'

  // slot target
  // only for non-scoped slots
  if (el.slotTarget && !el.slotScope) {
    data += `slot:${el.slotTarget},`
  }
  // scoped slots
  if (el.scopedSlots) {
    data += `${genScopedSlots(el, el.scopedSlots, state)},`
  }

  return data;

}
```
会给 data 添加一个 slot 属性，并指向 slotTarget，之后会用到。

- 在我们的例子中，父组件最终生成的可执行代码如下：

``` js
with(this){
  return _c('div',
    [_c('child-comp',
      [_c('h1',{attrs:{"slot":"header"},slot:"header"},[_v(_s(title))]),
       _c('p',[_v(_s(msg))]),
       _c('p',{attrs:{"slot":"footer"},slot:"footer"},[_v(_s(desc))])
      ])
     ],
   1)}
```


- 上面的`_v,_s,_c`方法在这里有说明：

``` js
// src/core/instance/render-helpers/index.js

export function installRenderHelpers (target: any) {
  target._o = markOnce
  target._n = toNumber
  target._s = toString // 渲染字符串
  target._l = renderList
  target._t = renderSlot // 渲染slot
  target._q = looseEqual
  target._i = looseIndexOf
  target._m = renderStatic
  target._f = resolveFilter
  target._k = checkKeyCodes
  target._b = bindObjectProps
  target._v = createTextVNode // 创建text节点
  target._e = createEmptyVNode
  target._u = resolveScopedSlots // 处理作用域插槽
  target._g = bindObjectListeners
  target._d = bindDynamicKeys
  target._p = prependModifier
}


// src/core/instance/render.js

vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false) // 编译dom，执行 createElement 去创建 VNode

```

#### processSlotOutlet
> 该方法主要是对子组件中`slot`元素进行处理：
``` js
// src/compiler/parser/index.js

// e.g: <slot name="header"></slot>
function processSlotOutlet (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name')
    // slot 不能用 key 属性
    if (process.env.NODE_ENV !== 'production' && el.key) {
      warn(
        `\`key\` does not work on <slot> because slots are abstract outlets ` +
        `and can possibly expand into multiple elements. ` +
        `Use the key on a wrapping element instead.`,
        getRawBindingAttr(el, 'key')
      )
    }
  }
}
```
processSlotOutlet 方法的逻辑比较简单：**给 `slot` 元素添加`slotName`属性**。

- 当遇到 slot 标签的时候会给对应的 AST 元素节点添加 slotName 属性，然后在 codegen 阶段，会判断如果当前 AST 元素节点是 slot 标签，则执行 `genSlot` 函数：

``` js
// src/compiler/codegen/index.js

export function genElement (el: ASTElement, state: CodegenState): string {
  ...
   } else if (el.tag === 'slot') {
    return genSlot(el, state)
   }
   ...
}

function genSlot (el: ASTElement, state: CodegenState): string {
  const slotName = el.slotName || '"default"'
  const children = genChildren(el, state)
  let res = `_t(${slotName}${children ? `,function(){return ${children}}` : ''}` ////// 重要代码!!!
  // slot 标签上有 attrs 以及 v-bind 的情况：
  // 下面的可以先不看：
  const attrs = el.attrs || el.dynamicAttrs
    ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(attr => ({
        // slot props are camelized
        name: camelize(attr.name),
        value: attr.value,
        dynamic: attr.dynamic
      })))
    : null
  const bind = el.attrsMap['v-bind']
  if ((attrs || bind) && !children) {
    res += `,null`
  }
  if (attrs) {
    res += `,${attrs}`
  }
  if (bind) {
    res += `${attrs ? '' : ',null'},${bind}`
  }
  return res + ')'
}
```
- 先不考虑 slot 标签上有 attrs 以及 v-bind 的情况，这里的 slotName 从 AST 元素节点对应的属性上取，默认是 default，而 **children 对应的就是 slot 开始和闭合标签包裹的内容**。
> 来看一下我们例子的子组件最终生成的代码，如下：

``` js
// ChildComp组件

with(this) {
  return _c('div',{
    staticClass:"container"
    },[
      _c('header',[_t("header")],2),
      _c('main',[_t("default",[_v("默认内容")])],2),
      _c('footer',[_t("footer")],2)
      ]
   )
}
```


由上可知，`<slot>`组件在`codegen`阶段生成的可执行性代码里面用到的`_t`方法就是`renderSlot`，接下来看看这个方法里面做了什么~

#### renderSlot

``` js
// src/core/instance/render-heplpers/render-slot.js

/**
 * Runtime helper for rendering <slot>
 */
export function renderSlot (
  name: string, // 代表插槽名称 slotName
  fallbackRender: ?((() => Array<VNode>) | Array<VNode>), // fallback 代表插槽的默认内容生成的 vnode 数组
  props: ?Object,
  bindObject: ?Object
): ?Array<VNode> {
  const scopedSlotFn = this.$scopedSlots[name] // 作用域插槽
  let nodes
  if (scopedSlotFn) { // scoped slot, 这部分是作用域插槽的逻辑，可以先不看~
    props = props || {}
    if (bindObject) {
      if (process.env.NODE_ENV !== 'production' && !isObject(bindObject)) {
        warn('slot v-bind without argument expects an Object', this)
      }
      props = extend(extend({}, bindObject), props)
    }
    nodes =
      scopedSlotFn(props) ||
      (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender)
  } else {
    // 如果 this.$slot[name] 有值，就返回它对应的 vnode 数组，否则返回 fallbackRender 插槽默认内容
    nodes =
      this.$slots[name] ||
      (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender)
  }

  const target = props && props.slot
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    return nodes
  }
}
```
> `renderSlot`方法里先不看关于`scopedSlotFn`的处理，先看`else`里面对默认插槽的处理; 该方法会返回一个`nodes`，如果 `this.$slot[name]` 有值，就返回它对应的 vnode 数组，否则返回 fallbackRender。

那这个`this.$slots`又是什么呢？

到这里就可以回来刚才我们`init`初始化那一小节，在`initRender`中会生成`vm.$slot`:
``` js
// src/core/instance/render.js

import { resolveSlots } from './render-helpers/resolve-slots'

export function initRender (vm: Component) {
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(options._renderChildren, renderContext) // 生成 $slots
  vm.$scopedSlots = emptyObject
}
```
> 原来子组件在init的时候，父组件就已经编译完成了，然后子组件就可以在`initRender`中拿到`$slot`~



#### resolveSlots
> 接下来看看`resolveSlots`方法怎么生成`$slots`的~


``` js
// core/instance/render-helpers/resolve-slots.js

export function resolveSlots (
  children: ?Array<VNode>, // 父 vnode 的 children, 在本文例子中就是<child-comp>...</child-comp>包裹的内容
  context: ?Component // 父 vnode 的上下文，也就是父组件的 vm 实例
): { [key: string]: Array<VNode> } {
  if (!children || !children.length) {
    return {}
  }
  const slots = {}
  // 遍历 chilren
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i]
    // 拿到每一个 child 的 data
    const data = child.data
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot
    }
    // named slots should only be respected if the vnode was rendered in the same context.
    // child.context应该跟父vnode在同一个上下文
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {

      // 然后通过 data.slot 获取到插槽名称，这个 slot 就是我们之前编译父组件在 codegen 阶段设置的 data.slot
      const name = data.slot
      // 接着以插槽名称为 key 把 child 添加到 slots 中
      const slot = (slots[name] || (slots[name] = []))
      if (child.tag === 'template') { // 兼容 <template>...</template>的情况
        slot.push.apply(slot, child.children || [])
      } else {
        slot.push(child)
      }
    } else { // 如果 data.slot 不存在，则是默认插槽的内容，则把对应的 child 添加到 slots.defaults 中。
      (slots.default || (slots.default = [])).push(child)
    }
  }
  // 这样就获取到整个 slots，它是一个对象，key 是插槽名称，value 是一个 vnode 类型的数组，因为它可以有多个同名插槽。
  // ignore slots that contains only whitespace
  for (const name in slots) {
    if (slots[name].every(isWhitespace)) { // 过滤空白slot
      delete slots[name]
    }
  }
  return slots
}

function isWhitespace (node: VNode): boolean {
  return (node.isComment && !node.asyncFactory) || node.text === ' '
}
```
- 最后，我们得到的`vm.$slots`结构如下：
``` js
// 前面已经得到的父组件编译之后生成的代码：
with(this){
  return _c('div',
    [_c('child-comp',
      [_c('h1',{attrs:{"slot":"header"},slot:"header"},[_v(_s(title))]),
       _c('p',[_v(_s(msg))]),
       _c('p',{attrs:{"slot":"footer"},slot:"footer"},[_v(_s(desc))])
      ])
     ],
   1)}


// 上面 resolveSlots 返回的 slots 结构如下：
vm.$slots: {
  header: [_v(_s(title))],
  default: [_v(_s(msg))],
  footer: [_v(_s(desc))]
}


// 子组件ChildComp编译后的代码：
with(this) {
  return _c('div',{
    staticClass:"container"
    },[
      _c('header',[_t("header")],2),
      _c('main',[_t("default",[_v("默认内容")])],2),
      _c('footer',[_t("footer")],2)
      ]
   )
}
```
这样我们就拿到了 vm.$slots 了，回到 `renderSlot` 函数，`const slotNodes = this.$slots[name]`，我们也就能根据插槽名称获取到对应的 vnode 数组了，这个数组里的 vnode 都是在父组件创建的，这样就实现了在父组件替换子组件插槽的内容了。

> 比如子组件在渲染`_t('header')`时，直接就是获取到了`this.$slots['header']`中的`vnode`，也就实现了在子组件中渲染父组件中内容的效果~


### 总结


> Q：当子组件渲染时如何把`<slot></slot>`里面的内容渲染为在外层父组件中传入的dom？


Vue模板到真实DOM渲染的过程都会经历：`编译 =》 生成AST => 生成可执行性代码（codegen）` 的过程；
1. 首先父组件在编译过程中，遇到带有`slot`属性的dom会生成`slotTarget`属性，并给生成的AST元素节点添加该属性；
2. 之后在`codegen`过程中，会给当前父组件 `data` 添加一个 `slot` 属性，并指向 `slotTarget`；

3. 之后子组件在编译时如果遇到`<slot>`模块，则给对应的 AST 元素节点添加 `slotName` 属性；
4. 接着子组件在`codegen`过程中，会通过这个`slotName`生成需要渲染的slot内容，而需要渲染的slot内容则是通过`vm.$slot[slotName]`来获取；
5. 又因为子组件在渲染初始化时其实父组件已经编译完成，那么，子组件在渲染初始化的时候，可以通过`resolveSlots`方法来拿到父组件中已经在`codegen`中生成的所有 children；
6. 通过循环遍历这些 children 就可以拿到父组件里面嵌套的 vnodes，把这些 vnodes 生成 slots，赋值给子组件，这样子组件在渲染时，就可以通过`vm.$slot[slotName]`来获取需要渲染的内容了，从而实现子组件渲染时把`<slot></slot>`里面的内容渲染为在外层父组件中传入的 dom。



## 作用域插槽

> 在普通插槽中，父组件应用到子组件插槽里的数据都是绑定到父组件的，因为它渲染成 vnode 的时机的上下文是父组件的实例。

但是在一些实际开发中，我们想通过子组件的一些数据来决定父组件实现插槽的逻辑，Vue 提供了另一种插槽——**作用域插槽**，接下来我们就来分析一下它的实现原理。


- 一个例子：

``` js
// 子组件
// 有两种写法：<slot :props="props"> 或 <slot v-bind:props="props">
let ChildComp = {
  template: '<div class="child">' +
  '<slot text="Hello " :msg="msg"></slot>' +
  '</div>',
  data() {
    return {
      msg: 'Vue'
    }
  }
}

// 父组件
let vm = new Vue({
  el: '#app',
  // vue2.6.0之前的写法：<template slot="xxx" slot-scope="props"></template>
  // vue2.6.0之后可以这样写：<template v-slot:xxx="props"></template>
  template: '<div>' +
  '<child-comp>' +
  '<template slot-scope="props">' +
  '<p>Hello from parent</p>' +
  '<p>{{ props.text + props.msg}}</p>' +
  '</template>' +
  '</child-comp>' +
  '</div>',
  components: {
    ChildComp
  }
})

// 最终生成的DOM:
<div>
  <div class="child">
    <p>Hello from parent</p>
    <p>Hello Vue</p>
  </div>
</div>
```

### 生成scopedSlots属性
> 同样的也是先从父组件的编译开始，回到刚才我们看过的`processSlotContent`方法：

``` js
// src/compiler/parser/index.js

// e.g. <template slot="xxx">, <div slot-scope="xxx">
function processSlotContent (el) {
  let slotScope
  // 设置scope属性
  if (el.tag === 'template') { // <template slot="xxx" slot-scope="scope">
    slotScope = getAndRemoveAttr(el, 'scope')
    el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
  } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) { // <div slot="xxx" slot-scope="scope">
    el.slotScope = slotScope
  }
  // ...
}
```
这里的逻辑跟`slotTarget`的处理差不多，读取dom的`slot-scope`属性, 并给生成的AST元素节点添加`slotScope`属性~

- 接下来在构造 AST 树的时候，会执行以下逻辑：

``` js
// src/compiler/parser/index.js

function closeElement (element) {
  // ...

  if (element.elseif || element.else) {
    processIfConditions(element, currentParent)
  } else {
    if (element.slotScope) { // 如果有 slotScope 属性
      const name = element.slotTarget || '"default"'
      ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
    }
    currentParent.children.push(element)
    element.parent = currentParent
  }
}

/*
currentParent.scopedSlots = {
  xxx: element
  ...
}
*/
```
> 如果当前 AST 元素节点具有 slotScope 属性，则将它存到父 AST 元素节点的 scopedSlots 属性上，它是一个对象，以插槽名称 name 为 key。


### 处理scopedSlots
> 之后同样也是在 `codegen`生成代码阶段，在 `genData` 中会处理含有 `scopedSlots` 属性的父组件：

``` js
// src/compiler/codegen/index.js

export function genData (el: ASTElement, state: CodegenState): string {
  let data = '{'
  // slot target
  // only for non-scoped slots
  if (el.slotTarget && !el.slotScope) {
    data += `slot:${el.slotTarget},`
  }
  // scoped slots
  if (el.scopedSlots) { // 对具有 scopedSlots 属性的父组件进行处理：
    data += `${genScopedSlots(el, el.scopedSlots, state)},`
  }
  return data;
}

// 对 scopedSlots 对象遍历
function genScopedSlots ( el: ASTElement, slots: { [key: string]: ASTElement },state: CodegenState): string {
  ...

  const generatedSlots = Object.keys(slots)
    .map(key => genScopedSlot(slots[key], state))
    .join(',')

  return `scopedSlots:_u([${generatedSlots}]${
    needsForceUpdate ? `,null,true` : ``
  }${
    !needsForceUpdate && needsKey ? `,null,false,${hash(generatedSlots)}` : ``
  })`
}

// 处理 scopedSlots[name]
function genScopedSlot (el: ASTElement, state: CodegenState): string {
  const isLegacySyntax = el.attrsMap['slot-scope']
  // ...
  const slotScope = el.slotScope === emptySlotScopeToken
    ? ``
    : String(el.slotScope)
  const fn = `function(${slotScope}){` +
    `return ${el.tag === 'template'
      ? el.if && isLegacySyntax
        ? `(${el.if})?${genChildren(el, state) || 'undefined'}:undefined`
        : genChildren(el, state) || 'undefined'
      : genElement(el, state)
    }}`
  // reverse proxy v-slot without scope on this.$slots
  const reverseProxy = slotScope ? `` : `,proxy:true`
  return `{key:${el.slotTarget || `"default"`},fn:${fn}${reverseProxy}}`
}
```
1. genScopedSlots 就是对 scopedSlots 对象遍历，执行 genScopedSlot，并把结果用逗号拼接；
2. 而 genScopedSlot 是先生成一段函数代码，并且函数的参数就是我们的 slotScope，也就是写在标签属性上的 scoped-slot 对应的值，然后再返回一个对象，key 为插槽名称，fn 为生成的函数代码。

- 对于我们这个例子而言，父组件最终生成的代码如下：

``` js
with(this){
  return _c('div',
    [_c('child-comp',
      {scopedSlots:_u([
        {
          key: "default",
          fn: function(props) {
            return [
              _c('p',[_v("Hello from parent")]),
              _c('p',[_v(_s(props.text + props.msg))])
            ]
          }
        }])
      }
    )],
  1)
}
```
可以看到它和普通插槽父组件编译结果的一个很明显的区别就是 data 部分多了一个对象，并且执行了 `_u` 方法~

- 在编译章节我们了解到，_u 函数对的就是 `resolveScopedSlots` 方法：

``` js
// src/core/instance/render-helpers/resolve-scoped-slots.js

export function resolveScopedSlots (
  fns: ScopedSlotsData, // see flow/vnode
  res?: Object,
  // the following are added in 2.6
  hasDynamicKeys?: boolean,
  contentHashKey?: number
): { [key: string]: Function, $stable: boolean } {
  res = res || { $stable: !hasDynamicKeys }
  for (let i = 0; i < fns.length; i++) {
    const slot = fns[i]
    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys)
    } else if (slot) {
      // marker for reverse proxying v-slot without scope on this.$slots
      if (slot.proxy) {
        slot.fn.proxy = true
      }
      res[slot.key] = slot.fn
    }
  }
  if (contentHashKey) {
    (res: any).$key = contentHashKey
  }
  return res
}

/**
 处理完后父组件生成的代码就是这样：
 with(this){
  return _c('div',
    [_c('child-comp',
      {scopedSlots: {
        default: fn
      }
      }
    )],
  1)
}
 */
```
其中，`fns` 是一个数组，每一个数组元素都有一个 `key` 和一个 `fn`，key 对应的是插槽的名称，fn 对应一个函数。

整个逻辑就是遍历这个 `fns` 数组，生成一个对象，对象的 key 就是插槽名称，value 就是函数。这个函数的执行时机稍后会介绍。

### 子组件的编译

> 接着我们再来看一下子组件的编译，和普通插槽的过程基本相同，唯一一点区别是在 `genSlot` 的时候，它会对 `attrs` 和 `v-bind` 做处理：

``` js
// src/compiler/codegen/index.js

function genSlot (el: ASTElement, state: CodegenState): string {
  const slotName = el.slotName || '"default"'
  const children = genChildren(el, state)
  let res = `_t(${slotName}${children ? `,function(){return ${children}}` : ''}`

  // slot 标签上有 attrs 以及 v-bind 的情况：
  const attrs = el.attrs || el.dynamicAttrs
    ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(attr => ({
        // slot props are camelized
        name: camelize(attr.name),
        value: attr.value,
        dynamic: attr.dynamic
      })))
    : null
  const bind = el.attrsMap['v-bind'] // 有 v-bind 属性
  if ((attrs || bind) && !children) {
    res += `,null`
  }
  if (attrs) {
    res += `,${attrs}`
  }
  if (bind) {
    res += `${attrs ? '' : ',null'},${bind}`
  }
  return res + ')'
}
```

- 最终子组件生成的代码如下：
``` js
with(this){
  return _c('div',
    {staticClass:"child"},
    [
      _t("default",null,{text:"Hello ",msg:msg})
    ],
  2)}
```

- `_t` 方法我们之前介绍过，对应的是 `renderSlot` 方法：

``` js
// src/core/instance/render-heplpers/render-slot.js

export function renderSlot (
  name: string, // 代表插槽名称 slotName
  fallbackRender: ?((() => Array<VNode>) | Array<VNode>), // fallback 代表插槽的默认内容生成的 vnode 数组
  props: ?Object,
  bindObject: ?Object
): ?Array<VNode> {
  const scopedSlotFn = this.$scopedSlots[name] // 作用域插槽
  let nodes
  if (scopedSlotFn) { // scoped slot, 这部分就是作用域插槽的逻辑~
    nodes =
      scopedSlotFn(props) ||
      (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender)
  } else {
    // 如果 this.$slot[name] 有值，就返回它对应的 vnode 数组，否则返回 fallbackRender 插槽默认内容
    nodes =
      this.$slots[name] ||
      (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender)
  }
  // ...
}
```
这里可以看到，如果子组件有作用域插槽，先获取`scopedSlotFn`，再传入`props`，执行`scopedSlotFn(props)`~

那么这个 `this.$scopedSlots[name]` 又是在什么地方定义的呢？

原来在子组件的渲染函数执行前，在 `Vue.prototype._render` 方法内，有这么一段逻辑：

``` js
// src/core/instance/render.js

Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      )
    }
}
```
> 这个` _parentVNode.data.scopedSlots` 对应的就是我们在父组件通过执行 `resolveScopedSlots` 返回的对象。

这里用到的`normalizeScopedSlots`方法就不做过多阐述了，大致意思就是把父组件在编译过程中生成的`scopedSlots`属性存到当前子组件，即：`vm.$scopedSlots`；

这样回到上一步`renderSlot`方法中，获取函数`this.$scopedSlots[name]`，然后传入子组件的 props，执行函数，即可实现在渲染过程中向父组件传值。


- 父子组件编译后生成的代码：
``` js
// 前面已经得到的父组件编译生成的代码：
with(this){
  return _c('div',
    [_c('child-comp',
      {scopedSlots: {
        default: function(props) {
            return [
              _c('p',[_v("Hello from parent")]),
              _c('p',[_v(_s(props.text + props.msg))])
            ]
          }
      }
      }
    )],
  1)
}


// 子组件在渲染函数执行之前获取的$scopedSlots：
vm.$scopedSlots = {
  default: function(props) {
    return [
      _c('p',[_v("Hello from parent")]),
      _c('p',[_v(_s(props.text + props.msg))])
    ]
  }
}


// 子组件编译后得到的代码：
with(this){
  return _c('div',
    {staticClass:"child"},
    [
      _t("default",null,{text:"Hello ",msg:msg})
    ],
  2)}
```


### 总结

> Q: 子组件是如何向父组件传值的？

其实作用域插槽和普通插槽编译渲染流程差不多的；
1. 当父组件在编译时，遇到含有`slot-scope`属性的 dom，会给生成的AST元素节点添加`slotScope`属性；
2. 并把当前 element 添加到父组件的`scopedSlots`属性上，即`scopedSlots[name] = element`；
3. 之后在`codegen`过程中，会处理含有`scopedSlots`属性的父组件：先遍历`scopedSlots`对象，每次遍历生成一段函数代码，函数参数就是子组件会传入的`props`，函数内容就是生成上一步 element中 的 vnode；
4. 之后子组件的编译流程跟普通插槽一样，在`codegen`过程中，会添加在`<slot>`标签上传入的值；并在渲染slot时，通过`this.$scopedSlots[name]`拿到保存在父组件`scopedSlots`属性中的函数；
> 这样当父组件渲染时，先不用渲染作用域插槽内的 vnode，先以函数的形式存到父组件的`scopedSlots`属性中，等到子组件渲染时再执行。



## 备注

- **普通插槽 vs 作用域插槽**

它们有一个很大的差别是**数据作用域**，普通插槽是在父组件编译和渲染阶段生成 vnodes，所以数据的作用域是父组件实例；子组件渲染的时候直接拿到这些渲染好的 vnodes；

而对于作用域插槽，父组件在编译和渲染阶段并不会直接生成 vnodes，而是在父节点 vnode 的 data 中保留一个 scopedSlots 对象，存储着不同名称的插槽以及它们对应的渲染函数；只有在编译和渲染子组件阶段才会执行这个渲染函数生成 vnodes，由于是在子组件环境执行的，所以对应的数据作用域是子组件实例。

> 两种插槽的目的都是让子组件 slot 占位符生成的内容由父组件来决定，但数据的作用域会根据它们 vnodes 渲染时机不同而不同。


## 参考

- [Vue.js 技术揭秘-slot](https://ustbhuangyi.github.io/vue-analysis/v2/extend/slot.html)
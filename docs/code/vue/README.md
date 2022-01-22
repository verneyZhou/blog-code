---
title: vue2.x源码学习记录
date: 2021-05-11 00:29:07
permalink: /pages/da28b8/
categories:
  - code
  - vue
tags:
  - 源码
---
# vue2.x源码学习记录


## 准备
- vue2.x版本[源码地址](https://github.com/vuejs/vue)，我学习时最新版本为`v2.6.14`~
- [vue2.x官方中文文档](https://cn.vuejs.org/)


## 开始之前

关于`vue`的使用这里不再赘述，点击上方官方文档即可了解。在开始阅读源码之前，我先整理几个自己对于vue源码的问题，带着问题去阅读源码，看看能不能通过阅读源码，找到这几个问题的答案。
::: warning 问题：
1. vue是如何进行模板编译的？
2. Vue的data和props是如何实现代理的？
3. $nextTick是怎么实现的？
4. $set是怎么实现的？
5. vue的`template`是如何编译成`render`的？
6. 混入`mixins`是怎么实现的？
:::


## 源码阅读

### 源码目录结构分析
首先从`github`上`clone`下来`vue2.x`的源码，然后打开项目，分析下源码目录结构：

<img class="zoom-custom-imgs" :src="$withBase('/images/code/vue01.jpeg')" width="auto"/>

`Vue.js` 的源码的核心部分都在 `src` 目录下，其目录结构如下：
```
src
├── compiler        # 编译相关 
├── core            # 核心代码 
├── platforms       # 不同平台的支持
├── server          # 服务端渲染
├── sfc             # .vue 文件解析
├── shared          # 共享代码
```

- **compiler**
> `compiler` 目录包含 `Vue.js` 所有编译相关的代码。它包括把模板解析成 `ast` 语法树，`ast` 语法树优化，代码生成等功能。

- **core**
> `core` 目录包含了 Vue.js 的核心代码，包括内置组件、全局 `API` 封装，`Vue` 实例化、观察者、虚拟 DOM、工具函数等等。

> 这里的代码可谓是 `Vue.js` 的灵魂，也是需要重点分析的地方。

- **platform**
> `Vue.js` 是一个跨平台的 `MVVM` 框架，它可以跑在 `web` 上，也可以配合 `weex` 跑在 `native` 客户端上。`platform` 是 `Vue.js` 的入口，2 个目录代表 2 个主要入口，分别打包成运行在 `web` 上和 `weex` 上的 `Vue.js`。

- **server**
> `Vue.js 2.0` 支持了服务端渲染，所有服务端渲染相关的逻辑都在这个目录下。注意：这部分代码是跑在服务端的 `Node.js`，不要和跑在浏览器端的 `Vue.js` 混为一谈。

> 服务端渲染主要的工作是把组件渲染为服务器端的 `HTML` 字符串，将它们直接发送到浏览器，最后将静态标记"混合"为客户端上完全交互的应用程序。

- **sfc**
> 通常我们开发 `Vue.js` 都会借助 `webpack` 构建， 然后通过 `.vue` 单文件来编写组件。这个目录下的代码逻辑会把 `.vue` 文件内容解析成一个 `JavaScript` 的对象。

- **shared**
> `Vue.js` 会定义一些工具方法，这里定义的工具方法都是会被浏览器端的 `Vue.js` 和服务端的 `Vue.js` 所共享的。



### Vue.js 源码构建
`Vue.js` 源码是基于[Rollup](https://www.rollupjs.com/)构建的，它的构建相关配置都在 `scripts` 目录下。

- **构建脚本**

通常一个基于 `NPM` 托管的项目都会有一个 `package.json` 文件，它是对项目的描述文件，它的内容实际上是一个标准的 `JSON` 对象。

我们通常会配置 `script` 字段作为 `NPM` 的执行脚本，`Vue.js` 源码构建的脚本如下：
``` json
// package.json
"scripts": {
    "build": "node scripts/build.js",
    "build:ssr": "npm run build -- web-runtime-cjs,web-server-renderer",
    "build:weex": "npm run build -- weex"
    ...
}
```
当在命令行运行 `npm run build` 的时候，实际上就会执行 `node scripts/build.js`，开始构建。

- **构建过程**
> 我们对于构建过程分析是基于源码的，先打开构建的入口 `JS` 文件，在 `scripts/build.js` 中：
``` js
// scripts/build.js

let builds = require('./config').getAllBuilds()

// filter builds via command line arg
// 通过命令行参数对构建配置做过滤
if (process.argv[2]) {
  const filters = process.argv[2].split(',')
  builds = builds.filter(b => {
    return filters.some(f => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1)
  })
} else {
  // filter out weex builds by default
  builds = builds.filter(b => {
    return b.output.file.indexOf('weex') === -1
  })
}

build(builds)
```
这段代码逻辑非常简单，先从配置文件读取配置，再通过命令行参数对构建配置做过滤，这样就可以构建出不同用途的 `Vue.js` 了。接下来我们看一下配置文件，在 `scripts/config.js` 中：
``` js
// scripts/config.js

const builds = {
  // Runtime only (CommonJS). Used by bundlers e.g. Webpack & Browserify
  'web-runtime-cjs-dev': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.common.dev.js'),
    format: 'cjs',
    env: 'development',
    banner
  },
  'web-runtime-cjs-prod': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.common.prod.js'),
    format: 'cjs',
    env: 'production',
    banner
  },
  // Runtime+compiler CommonJS build (CommonJS)
  'web-full-cjs-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.common.dev.js'),
    format: 'cjs',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  'web-full-cjs-prod': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.common.prod.js'),
    format: 'cjs',
    env: 'production',
    alias: { he: './entity-decoder' },
    banner
  }
  ...
}
```
这里列举了一些 `Vue.js` 构建的配置，关于还有一些服务端渲染 `webpack` 插件以及 `weex` 的打包配置就不列举了。

对于单个配置，它是遵循 Rollup 的构建规则的。其中 `entry` 属性表示构建的入口 JS 文件地址，`dest` 属性表示构建后的 JS 文件地址。`format` 属性表示构建的格式，`cjs` 表示构建出来的文件遵循 `CommonJS` 规范，`es` 表示构建出来的文件遵循 `ES Module` 规范。 `umd` 表示构建出来的文件遵循 `UMD` 规范。

以 `web-runtime-cjs-dev` 配置为例，它的 `entry` 是 `resolve('web/entry-runtime.js')`，先来看一下 `resolve` 函数的定义：
``` js
// scripts/config.js

const aliases = require('./alias')
const resolve = p => {
  const base = p.split('/')[0]
  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1))
  } else {
    return path.resolve(__dirname, '../', p)
  }
}
```
这里的 `resolve` 函数实现非常简单，它先把 `resolve` 函数传入的参数 `p` 通过 `/` 做了分割成数组，然后取数组第一个元素设置为 `base`。在我们这个例子中，参数 `p` 是 `web/entry-runtime.js`，那么 `base` 则为 `web`。`base` 并不是实际的路径，它的真实路径借助了别名的配置，我们来看一下别名配置的代码：
``` js
// scripts/alias

const path = require('path')

const resolve = p => path.resolve(__dirname, '../', p)

module.exports = {
  vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
  compiler: resolve('src/compiler'),
  core: resolve('src/core'),
  shared: resolve('src/shared'),
  web: resolve('src/platforms/web'), // 
  weex: resolve('src/platforms/weex'),
  server: resolve('src/server'),
  sfc: resolve('src/sfc')
}
```
很显然，这里 `web` 对应的真实的路径是 `path.resolve(__dirname, '../src/platforms/web')`，这个路径就找到了 `Vue.js` 源码的 `web` 目录。然后 `resolve` 函数通过 `path.resolve(aliases[base], p.slice(base.length + 1))` 找到了最终路径，它就是 `Vue.js` 源码 `web` 目录下的 `entry-runtime.js`。因此，`web-runtime-cjs-dev` 配置对应的入口文件就找到了。

它经过 `Rollup` 的构建打包后，最终会在 `dist` 目录下生成 `dist/vue.runtime.common.dev.js`。


### 从入口开始

#### Runtime Only VS Runtime + Compiler
通常我们利用 `vue-cli` 去初始化我们的 `Vue.js` 项目的时候会询问我们用 `Runtime Only` 版本的还是 `Runtime + Compiler` 版本：

- **Runtime Only**
> 我们在使用 `Runtime Only` 版本的 `Vue.js` 的时候，通常需要借助如 `webpack` 的 `vue-loader` 工具把 `.vue` 文件编译成 `JavaScript`，因为是在编译阶段做的，所以它只包含运行时的 `Vue.js` 代码，因此代码体积也会更轻量。

- **Runtime + Compiler**
> 我们如果没有对代码做预编译，但又使用了 `Vue` 的 `template` 属性并传入一个字符串，则需要在客户端编译模板，如下所示：
``` js
// 需要编译器的版本
new Vue({
  template: '<div>{{ hi }}</div>'
})

// 这种情况不需要
new Vue({
  render (h) {
    return h('div', this.hi)
  }
})
```
因为在 `Vue.js 2.0` 中，最终渲染都是通过 `render` 函数，如果写 `template` 属性，则需要编译成 `render` 函数，那么这个编译过程会发生运行时，所以需要带有编译器的版本。

很显然，这个编译过程对性能会有一定损耗，所以通常我们更推荐使用 Runtime-Only 的 Vue.js。

尽管在实际开发过程中我们会用 Runtime Only 版本开发比较多，但为了分析 Vue 的编译过程，我们这门课重点分析的源码是 `Runtime + Compiler` 的 Vue.js。

#### 入口：Vue的定义

那就接下来直接找到`Runtime + Compiler`模式下的入口：
``` js
// src/platforms/web/entry-runtime-with-compiler.js

/* @flow */
...
import Vue from './runtime/index' // 入口
import { compileToFunctions } from './compiler/index'

...

Vue.compile = compileToFunctions

export default Vue
```
那么，当我们的代码执行 `import Vue from 'vue'` 的时候，就是从这个入口执行代码来初始化 `Vue`，接下来看看它到底是如何初始化的。
``` js
// ./runtime/index

import Vue from 'core/index' // 入口
import config from 'core/config'
import { extend, noop } from 'shared/util'
import { mountComponent } from 'core/instance/lifecycle'
import { devtools, inBrowser } from 'core/util/index'

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}

...
export default Vue
```
这里关键的代码是 `import Vue from 'core/index'`，之后的逻辑都是对 `Vue` 这个对象做一些扩展，可以先不用看，我们来看一下真正初始化 `Vue` 的地方，在 `src/core/index.js` 中：
``` js
// src/core/index.js

import Vue from './instance/index' // 入口
import { initGlobalAPI } from './global-api/index' // 全局API
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'

initGlobalAPI(Vue) // 给 Vue 这个对象本身扩展全局的静态方法

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

Vue.version = '__VERSION__'

export default Vue
```
这里有 2 处关键的代码，`import Vue from './instance/index'` 和 `initGlobalAPI(Vue)`，初始化全局 `Vue API`（我们稍后介绍），我们先来看第一部分，在 `src/core/instance/index.js` 中：

- **Vue的定义**
``` js
// src/core/instance/index.js

import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// Vue实际上就是一个用 Function 实现的类，我们只能通过 new Vue 去实例化它
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

// 初始化
initMixin(Vue) // mixin
stateMixin(Vue) // state
eventsMixin(Vue) // 事件
lifecycleMixin(Vue) // 生命周期
renderMixin(Vue) // render

export default Vue

```
在这里，我们终于看到了 Vue 的庐山真面目，它实际上就是一个用 `Function` 实现的类，我们只能通过 `new Vue` 去实例化它。

为何 `Vue` 不用 `ES6` 的 `Class` 去实现呢？我们往后看这里有很多 `xxxMixin` 的函数调用，并把 Vue 当参数传入，它们的功能都是**给 Vue 的 prototype 上扩展一些方法**，Vue 按功能把这些扩展分散到多个模块中去实现，而不是在一个模块里实现所有，这种方式是用 Class 难以实现的。这么做的好处是非常方便代码的维护和管理，这种编程技巧也非常值得我们去学习。

- **initGlobalAPI**

`Vue.js` 在整个初始化过程中，除了给它的原型 `prototype` 上扩展方法，还会给 `Vue` 这个对象本身扩展全局的静态方法：
``` js
// src/core/global-api/index.js

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  // Vue.observable = <T>(obj: T): T => {
  //   observe(obj)
  //   return obj
  // }

  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  extend(Vue.options.components, builtInComponents)

  // 初始化 
  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}
```
这里就是在 `Vue` 上扩展的一些全局方法的定义，Vue 官网中关于`全局 API` 都可以在这里找到，这里不会介绍细节，会在之后的章节我们具体介绍到某个 API 的时候会详细介绍。有一点要注意的是，Vue.util 暴露的方法最好不要依赖，因为它可能经常会发生变化，是不稳定的。

- **总结**

1. `Runtime + Compiler`模式下的入口查找：

`src/platforms/web/entry-runtime-with-compiler.js` > `src/platforms/web/runtime/index.js` > `src/core/index.js` > `src/core/instance/index.js`。

2. Vue本质上就是一个用 Function 实现的 Class，然后它的原型 prototype 以及它本身都扩展了一系列的方法和属性



### 数据驱动

Vue.js 一个核心思想是数据驱动。所谓数据驱动，是指视图是由数据驱动生成的，我们对视图的修改，不会直接操作 DOM，而是通过修改数据。它相比我们传统的前端开发，如使用 jQuery 等前端库直接修改 DOM，大大简化了代码量。特别是当交互复杂的时候，只关心数据的修改会让代码的逻辑变的非常清晰，因为 DOM 变成了数据的映射，我们所有的逻辑都是对数据的修改，而不用碰触 DOM，这样的代码非常利于维护。

#### `new Vue`的初始化
从入口代码开始分析，我们先来分析 new Vue 背后发生了哪些事情：
``` js
// src/core/instance/index.js

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
```
可以看到 Vue 只能通过 new 关键字初始化，然后会调用 `this._init` 方法， 该方法在 `src/core/instance/init.js` 中定义。
``` js
// src/core/instance/init.js

export function initMixin (Vue: Class<Component>) {
  // Vue的初始化
  Vue.prototype._init = function (options?: Object) {
    
    // merge options
    if (options && options._isComponent) {
      initInternalComponent(vm, options)
    } else {
      // 合并配置
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }

    // 初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等等。
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
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
Vue 初始化主要就干了几件事情，合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等等。

Vue 的初始化逻辑写的非常清楚，把不同的功能逻辑拆成一些单独的函数执行，让主线逻辑一目了然，这样的编程思想是非常值得借鉴和学习的。

在初始化的最后，检测到如果有 el 属性，则调用 `vm.$mount` 方法挂载 vm，挂载的目标就是把模板渲染成最终的 DOM，那么接下来我们来分析 Vue 的挂载过程。

#### Vue 实例挂载
Vue 中我们是通过 `$mount` 实例方法去挂载 vm 的，`$mount` 方法在多个文件中都有定义，如 `src/platform/web/entry-runtime-with-compiler.js、src/platform/web/runtime/index.js、src/platform/weex/runtime/index.js`。因为 `$mount` 这个方法的实现是和平台、构建方式都相关的。

接下来我们重点分析带 compiler 版本的 `$mount` 实现，因为抛开 webpack 的 vue-loader，我们在纯前端浏览器环境分析 Vue 的工作原理，有助于我们对原理理解的深入。


- **$mount**

``` js
// src/platform/web/entry-runtime-with-compiler.js

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// 首先缓存了原型上的 $mount 方法，再重新定义该方法
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  // 它对 el 做了限制，Vue 不能挂载在 body、html 这样的根节点上
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 如果没有定义 render 方法，则会把 el 或者 template 字符串转换成 render 方法
  if (!options.render) {
    let template = options.template
    if (template) { // 获取template信息
      if (typeof template === 'string') { // 是字符串
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
         
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) { // 如果没有template，通过getOuterHTML获取el的html
      template = getOuterHTML(el)
    }
    if (template) {

      // 通过compileToFunctions方法，将template转换成render方法
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

    }
  }
  return mount.call(this, el, hydrating)
}


function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
```
在`$mount`方法中有一段关键逻辑：**如果没有定义 render 方法，则会把 el 或者 template 字符串转换成 render 方法**。

这里我们要牢记，在 `Vue 2.0` 版本中，所有 `Vue` 的组件的渲染最终都需要 `render` 方法，无论我们是用单文件 `.vue` 方式开发组件，还是写了 `el` 或者 `template` 属性，最终都会转换成 `render` 方法，那么这个过程是 `Vue` 的一个“在线编译”的过程，它是调用 `compileToFunctions` 方法实现的。最后，调用原先原型上的 `$mount` 方法挂载。

原先原型上的 `$mount` 方法在 `src/platform/web/runtime/index.js` 中定义，之所以这么设计完全是为了复用，因为它是可以被 `runtime only` 版本的 Vue 直接使用的。
``` js
// src/platform/web/runtime/index.js

// public mount method
// 公共方法， 可以被 runtime only 版本的 Vue 直接使用的
Vue.prototype.$mount = function (
  el?: string | Element, // 表示挂载的元素，可以是字符串，也可以是 DOM 对象
  hydrating?: boolean // 和服务端渲染相关
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating) // 调用 mountComponent 方法
}
```
`$mount` 方法支持传入 `2` 个参数，第一个是 `el`，它表示挂载的元素，可以是字符串，也可以是 `DOM` 对象，如果是字符串在浏览器环境下会调用 `query` 方法转换成 `DOM` 对象的。第二个参数是和服务端渲染相关，在浏览器环境下我们不需要传第二个参数。

`$mount` 方法实际上会去调用 `mountComponent` 方法，这个方法定义在 `src/core/instance/lifecycle.js` 文件中：

- **mountComponent**

``` js
// src/core/instance/lifecycle.js

export function mountComponent (
  vm: Component, // vue实例
  el: ?Element, // 挂载元素
  hydrating?: boolean
): Component {
  vm.$el = el

  callHook(vm, 'beforeMount') // 执行 beforeMount 钩子

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      ...
    }
  } else {
    updateComponent = () => {
      // 调用 vm._render 方法先生成虚拟 Node，最终调用 vm._update 更新 DOM。
      vm._update(vm._render(), hydrating)
    }
  }

  // 先实例化一个渲染Watcher，在它的回调函数中会调用 updateComponent 方法
  // Watcher 在这里起到两个作用：
  // 一个是初始化的时候会执行回调函数，另一个是当 vm 实例中的监测的数据发生变化的时候执行回调函数
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook

  if (vm.$vnode == null) { // vm.$vnode 表示 Vue 实例的父虚拟 Node，所以它为 Null 则表示当前是根 Vue 的实例
    vm._isMounted = true // 表示这个实例已经挂载了
    callHook(vm, 'mounted') // 同时执行 mounted 钩子函数
  }
  return vm
}
```
从上面的代码可以看到，`mountComponent` 核心就是先实例化一个渲染`Watcher`，在它的回调函数中会调用 `updateComponent` 方法，在此方法中调用 `vm._render` 方法先生成虚拟 `Node`，最终调用 `vm._update` 更新 `DOM`。

`Watcher` 在这里起到两个作用，**一个是初始化的时候会执行回调函数，另一个是当 `vm` 实例中的监测的数据发生变化的时候执行回调函数。**

函数最后判断为根节点的时候设置 `vm._isMounted 为 true`， 表示这个实例已经挂载了，同时执行 `mounted` 钩子函数。 这里注意 `vm.$vnode` 表示 `Vue` 实例的父虚拟 `Node`，所以它为 `Null` 则表示当前是根 `Vue` 的实例。


#### render
> 接下来分析`updateComponent`中最核心的 2 个方法：`vm._render 和 vm._update`。

Vue 的 `_render` 方法是实例的一个私有方法，它用来**把实例渲染成一个虚拟 Node**。它的定义在 `src/core/instance/render.js` 文件中：
``` js
// src/core/instance/render.js

Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options

    ...
    vm.$vnode = _parentVnode // 设置父虚拟节点为$vnode

    let vnode
    try {
      // 执行 createElement 方法，生成虚拟dom
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      ...
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode // 返回虚拟节点
  }
```
这段代码最关键的是 `render` 方法的调用，我们在平时的开发工作中手写 `render` 方法的场景比较少，而写的比较多的是 `template` 模板，在之前的`$mount`方法的实现中，会把 `template` 编译成 `render` 方法。

> 在 Vue 的[官方文档](https://cn.vuejs.org/v2/api/#render)中介绍了 `render` 函数的第一个参数是 `createElement`，那么结合之前的例子：
``` html
<div id="app">
  {{ message }}
</div>
```
相当于我们编写如下 render 函数：
``` js
render: function (createElement) {
  return createElement('div', {
     attrs: {
        id: 'app'
      },
  }, this.message)
}
```
再回到 _render 函数中的 render 方法的调用：

`vnode = render.call(vm._renderProxy, vm.$createElement)`

可以看到，render 函数中的 createElement 方法就是 `vm.$createElement` 方法：
``` js
// src/core/instance/render.js

export function initRender (vm: Component) {
  ... 
  // 被模板编译成的 render 函数使用   
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  
  // vm.$createElement 是用户手写 render 方法使用的
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
}
```
实际上，`vm.$createElement` 方法定义是在执行 `initRender` 方法的时候，可以看到除了 `vm.$createElement` 方法，还有一个 `vm._c` 方法，它是被模板编译成的 `render` 函数使用，而 `vm.$createElement` 是用户手写 `render` 方法使用的， 这俩个方法支持的参数相同，并且内部都调用了 `createElement` 方法。

**vm._render 最终是通过执行 createElement 方法并返回的是 vnode，它是一个虚拟 Node。** 

Vue 2.0 相比 Vue 1.0 最大的升级就是利用了 Virtual DOM。Virtual DOM 是对真实 DOM 的一种抽象描述，它的核心定义无非就几个关键属性，标签名、数据、子节点、键值等，其它属性都是用来扩展 VNode 的灵活性以及实现一些特殊 feature 的。由于 VNode 只是用来映射到真实 DOM 的渲染，不需要包含操作 DOM 的方法，因此它是非常轻量和简单的。

**Virtual DOM 除了它的数据结构的定义，映射到真实的 DOM 实际上要经历 VNode 的 create、diff、patch 等过程。** 在 Vue.js 中，VNode 的 create 是通过`createElement`方法创建的。


#### createElement
Vue.js 利用 `createElement` 方法创建 `VNode`，它定义在 `src/core/vdom/create-element.js` 中：
``` js
// src/core/vdom/create-element.js

// createElement 方法实际上是对 _createElement 方法的封装，
// 它允许传入的参数更加灵活，在处理这些参数后，调用真正创建 VNode 的函数 _createElement
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}

// _createElement 创建 VNode
export function _createElement (
  context: Component, //  VNode 的上下文环境，它是 Component 类型
  tag?: string | Class<Component> | Function | Object, // tag 表示标签
  data?: VNodeData, // data 表示 VNode 的数据，它是一个 VNodeData 类型
  children?: any, // 当前 VNode 的子节点， 任意类型
  normalizationType?: number // 子节点规范的类型
): VNode | Array<VNode> {
  
  ...

  // 将children规范为 VNode 类型
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }

  let vnode, ns
  if (typeof tag === 'string') { // 如果是 string 类型
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) { // 判断如果是内置的一些节点，则直接创建一个普通 VNode
      // 创建一个 VNode 的实例
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )

    // 如果是为已注册的组件名
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      // 通过 createComponent 创建一个组件类型的 VNode
      vnode = createComponent(Ctor, data, context, children, tag)
    } else { // 否则创建一个未知的标签的 VNode
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else { // 如果是 tag 一个 Component 类型，则直接调用 createComponent 创建一个组件类型的 VNode 节点
    vnode = createComponent(tag, data, context, children)
  }

  // 返回vnode 或 createEmptyVNode() 
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}
```
由于 `Virtual DOM` 实际上是一个树状结构，每一个 `VNode` 可能会有若干个子节点，这些子节点应该也是 `VNode` 的类型。`_createElement` 接收的第 4 个参数 `children` 是任意类型的，因此我们需要把它们规范成 `VNode` 类型。

这里根据 `normalizationType` 的不同，调用了 `normalizeChildren(children)` 和 `simpleNormalizeChildren(children)` 方法，它们的定义都在 `src/core/vdom/helpers/normalzie-children.js` 中，这里不再阐述。

规范化 `children` 后，接下来会去创建一个 `VNode` 的实例：
- 这里先对 `tag` 做判断，如果是 `string` 类型，则接着判断如果是内置的一些节点，则直接创建一个普通 `VNode`
    - 如果是为已注册的组件名，则通过 `createComponent` 创建一个组件类型的 `VNode`
    - 否则创建一个未知的标签的 `VNode`
- 如果是 `tag` 一个 `Component` 类型，则直接调用 `createComponent` 创建一个组件类型的 `VNode` 节点

**VNode**

在 `Vue.js` 中，`Virtual DOM` 是用 `VNode` 这么一个 `Class` 去描述，它是定义在 `src/core/vdom/vnode.js` 中的：
``` js
// src/core/vdom/vnode.js

export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ...
}
```

**梳理**

那么至此，我们大致了解了 createElement 创建 VNode 的过程，每个 VNode 有 children，children 每个元素也是一个 VNode，这样就形成了一个 VNode Tree，它很好的描述了我们的 DOM Tree。

回到 mountComponent 函数的过程，我们已经知道 vm._render 是如何创建了一个 VNode，接下来就是要把这个 VNode 渲染成一个真实的 DOM 并渲染出来，这个过程是通过 vm._update 完成的，接下来分析一下这个过程。


#### update
Vue 的 `_update` 是实例的一个私有方法，它被调用的时机有 2 个，一个是首次渲染，一个是数据更新的时候。它的作用是把 VNode 渲染成真实的 DOM。
``` js
// src/core/instance/lifecycle.js

Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el // 旧真实dom
    const prevVnode = vm._vnode // 旧虚拟节点
    const restoreActiveInstance = setActiveInstance(vm)
    vm._vnode = vnode

    if (!prevVnode) { // 没有旧虚拟节点，即首次渲染，执行 patch方法，将vnode渲染成真实dom
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode) // 执行 patch 方法，比较差异
    }
    ...
  }
```
_update 的核心就是调用 `vm.__patch__` 方法，这个方法实际上在不同的平台，比如 `web` 和 `weex` 上的定义是不一样的，因此在 `web` 平台中它的定义在`src/platforms/web/runtime/index.js`中：
``` js
// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop
```
可以看到，甚至在 web 平台上，是否是服务端渲染也会对这个方法产生影响。因为在服务端渲染中，没有真实的浏览器 DOM 环境，所以不需要把 VNode 最终转换成 DOM，因此是一个空函数，而在浏览器端渲染中，它指向了 patch 方法，它的定义在 `src/platforms/web/runtime/patch.js`中：
``` js
// src/platforms/web/runtime/patch.js

import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })
```
该方法的定义是调用 `createPatchFunction` 方法的返回值，这里传入了一个对象，包含 `nodeOps` 参数和 `modules`参数。其中，`nodeOps` 封装了一系列 `DOM` 操作的方法，`modules` 定义了一些模块的钩子函数的实现。看一下 `createPatchFunction` 的实现：
``` js
// src/core/vdom/patch.js

const hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

export function createPatchFunction (backend) {
  let i, j
  const cbs = {}

  const { modules, nodeOps } = backend

  //  不同阶段执行的钩子函数
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }

  ...

  /**
   *  oldVnode 表示旧的 VNode 节点，它也可以不存在或者是一个 DOM 对象；
   *  vnode 表示执行 _render 后返回的 VNode 的节点；
   *  hydrating 表示是否是服务端渲染；
   *  removeOnly 是给 transition-group 用的
   */
  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    
    ...

    return vnode.elm // 最终返回vnode渲染后的真实dom
  }

}
```
`createPatchFunction` 内部定义了一系列的辅助方法，最终返回了一个 `patch` 方法，这个方法就赋值给了 `vm._update` 函数里调用的 `vm.__patch__`：

``` js
// src/core/instance/lifecycle.js

Vue.prototype._update = function() {
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false)
}
```

- **patch方法的函数柯里化设计**

> 在介绍 patch 的方法实现之前，我们可以思考一下为何 Vue.js 源码绕了这么一大圈，把相关代码分散到各个目录。因为前面介绍过，patch 是平台相关的，在 Web 和 Weex 环境，它们把虚拟 DOM 映射到 “平台 DOM” 的方法是不同的，并且对 “DOM” 包括的属性模块创建和更新也不尽相同。因此每个平台都有各自的 `nodeOps` 和 `modules`，它们的代码需要托管在 `src/platforms` 这个大目录下。

> 而不同平台的 `patch` 的主要逻辑部分是相同的，所以这部分公共的部分托管在 `core` 这个大目录下。差异化部分只需要通过参数来区别，这里用到了一个**函数柯里化的技巧，通过 `createPatchFunction` 把差异化参数提前固化**，这样不用每次调用 patch 的时候都传递 nodeOps 和 modules 了，这种编程技巧也非常值得学习。

在这里，`nodeOps` 表示对 “平台 DOM” 的一些操作方法，`modules` 表示平台的一些模块，它们会在整个 `patch` 过程的不同阶段执行相应的钩子函数，这里先不介绍。

- **patch 函数的执行过程**

``` js
// src/core/instance/lifecycle.js

Vue.prototype._update = function() {
    if (!prevVnode) { // 没有旧虚拟节点，即首次渲染，执行 patch方法，将vnode渲染成真实dom
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else { // 更新
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode) // 执行 patch 方法，比较差异
    }
}
```
首次渲染时，在执行 patch 函数的时候，传入的 `vm.$el` 对应的是例子中 `id` 为 `app` 的 `DOM` 对象，这个也就是我们在 `index.html` 模板中写的 `<div id="app">`；

`vm.$el` 的赋值是在之前 `mountComponent` 函数做的，`vnode` 对应的是调用 `render` 函数的返回值，`hydrating` 在非服务端渲染情况下为 `false``，removeOnly` 为 `false`。

``` js
// src/core/vdom/patch.js

  /**
   *  oldVnode 表示旧的 VNode 节点，它也可以不存在或者是一个 DOM 对象；
   *  vnode 表示执行 _render 后返回的 VNode 的节点；
   *  hydrating 表示是否是服务端渲染；
   *  removeOnly 是给 transition-group 用的
   */
  return function patch (oldVnode, vnode, hydrating, removeOnly) {

    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
     ...
    } else {
      const isRealElement = isDef(oldVnode.nodeType) // 判断传入的oldVnode是否是一个真实dom
      
      // 不是真实dom,则比较新旧节点是否相同，是则调用patchVnode方法比较新旧节点差异
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
      } else {
        if (isRealElement) { // oldVnode是真实dom
          ...
          oldVnode = emptyNodeAt(oldVnode) // 通过 emptyNodeAt 方法把 oldVnode 转换成 VNode 对象
        }

        // replacing existing element
        const oldElm = oldVnode.elm
        const parentElm = nodeOps.parentNode(oldElm)

        // create new node
        // 创建新元素
        createElm(
          vnode,
          insertedVnodeQueue,
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        )
        ...
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
```
由于我们传入的 `oldVnode` 实际上是一个 `DOM container`，所以 `isRealElement` 为 `true`，接下来又通过 `emptyNodeAt` 方法把 `oldVnode` 转换成 `VNode` 对象，然后再调用 `createElm` 方法，这个方法在这里非常重要，来看一下它的实现：
``` js
// src/core/vdom/patch.js

// createElm 的作用是通过虚拟节点创建真实的 DOM 并插入到它的父节点中
  function createElm (
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
  ) {

    // createComponent 方法目的是尝试创建子组件
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag

    // 判断 vnode 是否包含 tag
    if (isDef(tag)) {
      if (process.env.NODE_ENV !== 'production') {
        // 如果包含，先简单对 tag 的合法性在非生产环境下做校验，看是否是一个合法标签
        if (isUnknownElement(vnode, creatingElmInVPre)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          )
        }
      }

      // 再去调用平台 DOM 的操作去创建一个占位符元素
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);

      setScope(vnode)

      /* istanbul ignore if */
      if (__WEEX__) {
        ...
      } else {
        // 接下来调用 createChildren 方法去创建子元素
        createChildren(vnode, children, insertedVnodeQueue)

        if (isDef(data)) {
          // 接着再调用 invokeCreateHooks 方法执行所有的 create 的钩子并把 vnode push 到 insertedVnodeQueue 中。
          invokeCreateHooks(vnode, insertedVnodeQueue)
        }

        // 最后调用 insert 方法把 DOM 插入到父节点中，因为是递归调用，子元素会优先调用 insert，所以整个 vnode 树节点的插入顺序是先子后父。
        insert(parentElm, vnode.elm, refElm)
      }
    
    // 如果 vnode 节点不包含 tag，则它有可能是一个注释或者纯文本节点，可以直接插入到父元素中 
    } else if (isTrue(vnode.isComment)) { // 是注释节点
      vnode.elm = nodeOps.createComment(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    } else { // 或文本节点
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
  }
```
**`createElm` 的作用是通过虚拟节点创建真实的 DOM 并插入到它的父节点中。**

我们来看一下它的一些关键逻辑：
- `createComponent` 方法目的是尝试创建子组件，在当前这个 `case` 下它的返回值为 `false`；
- 接下来判断 `vnode` 是否包含 `tag`，如果包含，先简单对 tag 的合法性在非生产环境下做校验，看是否是一个合法标签；然后再去调用平台 DOM 的操作去创建一个占位符元素；
- 接下来调用 `createChildren` 方法去创建子元素；
- 接着再调用 `invokeCreateHooks` 方法执行所有的 `create` 的钩子并把 `vnode push` 到 `insertedVnodeQueue` 中；
- 最后调用 `insert` 方法把 `DOM` 插入到父节点中，因为是递归调用，子元素会优先调用 `insert`，所以整个 `vnode` 树节点的插入顺序是先子后父。

``` js
// src/core/vdom/patch.js

// createChildren 的逻辑很简单，实际上是遍历子虚拟节点，递归调用 createElm，这是一种常用的深度优先的遍历算法，
// 这里要注意的一点是在遍历过程中会把 vnode.elm 作为父容器的 DOM 节点占位符传入。
function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
        if (process.env.NODE_ENV !== 'production') {
        checkDuplicateKeys(children)
        }
        for (let i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
        }
    } else if (isPrimitive(vnode.text)) {
        nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
    }
}

 // invokeCreateHooks 方法执行所有的 create 的钩子并把 vnode push 到 insertedVnodeQueue 中。
  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode)
    }
    i = vnode.data.hook // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) i.create(emptyNode, vnode)
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
    }
  }

  // insert 方法把 DOM 插入到父节点中
  function insert (parent, elm, ref) {
    if (isDef(parent)) {
      if (isDef(ref)) {
        if (nodeOps.parentNode(ref) === parent) {
          nodeOps.insertBefore(parent, elm, ref)
        }
      } else {
        nodeOps.appendChild(parent, elm)
      }
    }
  }
```

- **总结**

再回到 `patch` 方法，首次渲染我们调用了 `createElm` 方法，这里传入的 `parentElm` 是 `oldVnode.elm` 的父元素，在我们的例子是 `id` 为 `#app div` 的父元素，也就是 `Body`；

**实际上整个过程就是递归创建了一个完整的 DOM 树并插入到 Body 上；**

最后，我们根据之前递归 `createElm` 生成的 `vnode` 插入顺序队列，执行相关的 `insert` 钩子函数。

> 那么至此我们从主线上把模板和数据如何渲染成最终的 DOM 的过程分析完毕了，我们可以通过下图更直观地看到从初始化 Vue 到最终渲染的整个过程。

<img class="zoom-custom-imgs" :src="$withBase('/images/code/new-vue.png')" width="auto"/>


### 组件化

Vue.js 另一个核心思想是组件化。所谓组件化，就是把页面拆分成多个组件 (component)，每个组件依赖的 CSS、JavaScript、模板、图片等资源放在一起开发和维护。组件是资源独立的，组件在系统内部可复用，组件和组件之间可以嵌套。

我们在用 Vue.js 开发实际项目的时候，就是像搭积木一样，编写一堆组件拼装生成页面。在 Vue.js 的官网中，也是花了大篇幅来介绍什么是组件，如何编写组件以及组件拥有的属性和特性。

那么在这一章节，我们将从源码的角度来分析 Vue 的组件内部是如何工作的，只有了解了内部的工作原理，才能让我们使用它的时候更加得心应手。

接下来我们会用 Vue-cli 初始化的代码为例，来分析一下 Vue 组件初始化的一个过程。

``` js
import Vue from 'vue'
import App from './App.vue'

var app = new Vue({
  el: '#app',
  // 这里的 h 是 createElement 方法
  render: h => h(App)
})
```

这段代码和上一章相同的点也是通过 render 函数去渲染的，不同的这次通过 createElement 传的参数是一个组件而不是一个原生的标签，那么接下来我们就开始分析这一过程。

#### createComponent

上一章我们在分析 `createElement` 的实现的时候，它最终会调用 `_createElement` 方法，其中有一段逻辑是对参数 `tag` 的判断，如果是一个普通的 `html` 标签，像上一章的例子那样是一个普通的 `div`，则会实例化一个普通 `VNode` 节点，否则通过 `createComponent` 方法创建一个组件 `VNode`。

``` js
// src/core/vdom/create-element.js

// _createElement 创建 VNode
export function _createElement () {
  ...
  let vnode, ns
  if (typeof tag === 'string') { // 如果是 string 类型
    ...
  } else { // 如果是 tag 一个 Component 类型，则直接调用 createComponent 创建一个组件类型的 VNode 节点
    vnode = createComponent(tag, data, context, children)
  }

}
```
在我们这一章传入的是一个 `App` 对象，它本质上是一个 `Component` 类型，那么它会走到上述代码的 `else` 逻辑，直接通过 `createComponent` 方法来创建 `vnode`。所以接下来我们来看一下 `createComponent` 方法的实现，它定义在 `src/core/vdom/create-component.js` 文件中：

``` js
// src/core/vdom/create-component.js

// 创建组件vnode
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return
  }

  // 1. 构造子类构造函数
  // 在这里 baseCtor 实际上就是 Vue,通过 vm.$options._base 拿到 Vue 这个构造函数了
  const baseCtor = context.$options._base

  // plain options object: turn it into a constructor
  // Vue.extend 的作用就是构造一个 Vue 的子类，它使用一种非常经典的原型继承的方式把一个纯对象转换一个继承于 Vue 的构造器 Sub 并返回，然后对 Sub 这个对象本身扩展了一些属性，如扩展 options、添加全局 API 等
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  ...

  // install component management hooks onto the placeholder node
  // 2. 安装组件钩子函数
  installComponentHooks(data)

  // return a placeholder vnode
  // 3. 实例化 VNode
  // 通过 new VNode 实例化一个 vnode 并返回。需要注意的是和普通元素节点的 vnode 不同，组件的 vnode 是没有 children 的
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )

  return vnode
}
```
`createComponent` 的逻辑也会有一些复杂，但是分析源码比较推荐的是只分析核心流程，所以这里针对组件渲染这个 `case` 主要就 `3` 个关键步骤：
1. 构造子类构造函数
2. 安装组件钩子函数
3. 实例化 `vnode`

- **构造子类构造函数**

我们在编写一个组件的时候，通常都是创建一个普通对象：`export default {...}`，这里 `export` 的是一个对象，所以 `createComponent` 里的代码逻辑会执行到 `baseCtor.extend(Ctor)`，在这里 `baseCtor` 实际上就是 `Vue`，这个的定义是在最开始初始化 `Vue` 的阶段：
``` js
// src/core/global-api/index.js

// this is used to identify the "base" constructor to extend all plain-object
// components with in Weex's multi-instance scenarios.
Vue.options._base = Vue
```
细心的同学会发现，这里定义的是 `Vue.options`，而我们的 `createComponent` 取的是 `context.$options`，实际上在 `src/core/instance/init.js` 里 `Vue` 原型上的 `_init` 函数中有这么一段逻辑：
``` js
// src/core/instance/init.js

// Vue的初始化
  Vue.prototype._init = function (options?: Object) {
    ...
    // 合并配置
    vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
    )
    ...
  }
```
这样就把 `Vue` 上的一些 `option` 扩展到了 `vm.$options` 上，所以我们也就能通过 `vm.$options._base` 拿到 `Vue` 这个构造函数了。

`mergeOptions` 的功能是把 `Vue` 构造函数的 `options` 和用户传入的 `options` 做一层合并，到 `vm.$options` 上。

在了解了 `baseCtor` 指向了 `Vue` 之后，我们来看一下 `Vue.extend` 函数的定义：
``` js
// src/core/global-api/extend.js

/**
   * Class inheritance
   * 它使用一种非常经典的原型继承的方式把一个纯对象转换一个继承于 Vue 的构造器 Sub 并返回，然后对 Sub 这个对象本身扩展了一些属性，如扩展 options、添加全局 API 等；
   * 并且对配置中的 props 和 computed 做了初始化工作；最后对于这个 Sub 构造函数做了缓存，避免多次执行 Vue.extend 的时候对同一个子组件重复构造
   */
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    const Super = this
    const SuperId = Super.cid
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) { // 取缓存
      return cachedCtors[SuperId]
    }
    ...
    // 这样当我们去实例化 Sub 的时候，就会执行 this._init 逻辑再次走到了 Vue 实例的初始化逻辑
    const Sub = function VueComponent (options) {
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super

    // 初始化
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    ...

    // cache constructor
    // 缓存
    cachedCtors[SuperId] = Sub
    return Sub
  }
```
`Vue.extend` 的作用就是构造一个 `Vue` 的子类，它使用一种非常经典的原型继承的方式把一个纯对象转换一个继承于 `Vue` 的构造器 `Sub` 并返回，然后对 `Sub` 这个对象本身扩展了一些属性，如扩展 options、添加全局 API 等；并且对配置中的 `props` 和 `computed` 做了初始化工作；最后对于这个 `Sub` 构造函数做了缓存，避免多次执行 `Vue.extend` 的时候对同一个子组件重复构造。

这样当我们去实例化 `Sub` 的时候，就会执行 `this._init` 逻辑再次走到了 `Vue` 实例的初始化逻辑。


- **安装组件钩子函数**

`Vue.js` 使用的 `Virtual DOM` 参考的是开源库[snabbdom](https://github.com/snabbdom/snabbdom)，它的一个特点是在 `VNode` 的 `patch` 流程中对外暴露了各种时机的钩子函数，方便我们做一些额外的事情，`Vue.js` 也是充分利用这一点，在初始化一个 `Component` 类型的 `VNode` 的过程中实现了几个钩子函数：
``` js
// src/core/vdom/create-component.js

// 初始化一个 Component 类型的 VNode 的过程中实现了几个钩子函数
const componentVNodeHooks = {
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
   ...
  },

  prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    ...
  },

  insert (vnode: MountedComponentVNode) {
    ...
  },

  destroy (vnode: MountedComponentVNode) {
    ...
  }
}

const hooksToMerge = Object.keys(componentVNodeHooks)

// 整个 installComponentHooks 的过程就是把 componentVNodeHooks 的钩子函数合并到 data.hook 中，
// 在 VNode 执行 patch 的过程中执行相关的钩子函数
function installComponentHooks (data: VNodeData) {
  const hooks = data.hook || (data.hook = {})
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    const existing = hooks[key]
    const toMerge = componentVNodeHooks[key]

    // 在合并过程中，如果某个时机的钩子已经存在 data.hook 中，那么通过执行 mergeHook 函数做合并
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
}

function mergeHook (f1: any, f2: any): Function {
  const merged = (a, b) => {
    // flow complains about extra args which is why we use any
    f1(a, b)
    f2(a, b)
  }
  merged._merged = true
  return merged
}

```
整个 `installComponentHooks` 的过程就是把 `componentVNodeHooks` 的钩子函数合并到 `data.hook` 中，在 `VNode` 执行 `patch` 的过程中执行相关的钩子函数。

这里要注意的是合并策略，在合并过程中，如果某个时机的钩子已经存在 `data.hook` 中，那么通过执行 `mergeHook` 函数做合并，这个逻辑很简单，就是在最终执行的时候，依次执行这两个钩子函数即可。

- **实例化 VNode**

最后一步非常简单，通过 `new VNode` 实例化一个 `vnode` 并返回。需要注意的是和普通元素节点的 `vnode` 不同，组件的 `vnode` 是没有 `children` 的。

> 到这里我们分析了 `createComponent` 的实现，了解到它在渲染一个组件的时候的 3 个关键逻辑：**构造子类构造函数，安装组件钩子函数和实例化 vnode**`。createComponent` 后返回的是组件 `vnode`，它也一样走到 `vm._update` 方法，进而执行了 `patch` 函数。


#### patch

当我们通过 `createComponent` 创建了组件 `VNode`，接下来会走到 `vm._update`，执行 `vm.__patch__` 去把 `VNode` 转换成真正的 `DOM` 节点。这个过程我们在前一章已经分析过了，但是针对一个普通的 `VNode` 节点，接下来我们来看看组件的 `VNode` 会有哪些不一样的地方

patch 的过程会调用 `createElm` 创建元素节点，回顾一下 `createElm` 的实现，它的定义在 `src/core/vdom/patch.js` 中：
``` js
// src/core/vdom/patch.js

function createElm (
  vnode,
  insertedVnodeQueue,
  parentElm,
  refElm,
  nested,
  ownerArray,
  index
) {
  // ...
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return
  }
  // ...
}
```

- **createComponent**

这里会判断 `createComponent(vnode, insertedVnodeQueue, parentElm, refElm)` 的返回值，如果为 `true` 则直接结束，那么接下来看一下 `createComponent` 方法的实现：
``` js
// src/core/vdom/patch.js

function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    let i = vnode.data
    if (isDef(i)) { // 首先对 vnode.data 做了一些判断
      const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
      // 如果 vnode 是一个组件 VNode，那么条件会满足，并且得到 i 就是 init 钩子函数
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */)
      }
      

      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue)
        insert(parentElm, vnode.elm, refElm)
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
        }
        return true
      }
    }
  }

```
如果 vnode 是一个组件 VNode，那么条件会满足，并且得到 i 就是 init 钩子函数，回顾上节我们在创建组件 `VNode` 的时候合并钩子函数中就包含 `init` 钩子函数，定义在 `src/core/vdom/create-component.js` 中：
``` js
// src/core/vdom/create-component.js

const componentVNodeHooks = {
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      // 通过 createComponentInstanceForVnode 创建一个 Vue 的实例
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      )
      // 然后调用 $mount 方法挂载子组件
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },
  ...
}
```
`init` 钩子函数执行也很简单，我们先不考虑 `keepAlive` 的情况，它是通过 `createComponentInstanceForVnode` 创建一个 `Vue` 的实例，然后调用 `$mount` 方法挂载子组件。

`componentVNodeHooks` 的 `init` 钩子函数，在完成实例化的 `_init` 后，接着会执行 `child.$mount(hydrating ? vnode.elm : undefined, hydrating)` 。这里 `hydrating` 为 `true` 一般是服务端渲染的情况，我们只考虑客户端渲染，所以这里 `$mount` 相当于执行 `child.$mount(undefined, false)`，它最终会调用 `mountComponent` 方法，进而执行 `vm._render()` 方法：
``` js
// src/core/instance/render.js

Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement) // 执行 createElement 方法，生成虚拟dom
    } catch (e) {
      
    }
    
    // set parent
    vnode.parent = _parentVnode
    return vnode
  }
```
这里的 `_parentVnode` 就是当前组件的父 `VNode`，而 `render` 函数生成的 `vnode` 当前组件的渲染 `vnode`，`vnode` 的 `parent` 指向了 `_parentVnode`，也就是 `vm.$vnode`，它们是一种父子的关系。

我们知道在执行完 `vm._render` 生成 `VNode` 后，接下来就要执行 `vm._update` 去渲染 `VNode` 了。来看一下组件渲染的过程中有哪些需要注意的，`vm._update` 的定义在：
``` js

```


#### 合并配置

通过之前章节的源码分析我们知道，`new Vue` 的过程通常有 2 种场景，一种是外部我们的代码主动调用 `new Vue(options)` 的方式实例化一个 `Vue` 对象；另一种是我们上一节分析的组件过程中内部通过 `new Vue(options)` 实例化子组件。

无论哪种场景，都会执行实例的 `_init(options)` 方法，它首先会执行一个 `merge options` 的逻辑，相关的代码在 `src/core/instance/init.js` 中：
``` js
// src/core/instance/init.js

Vue.prototype._init = function (options?: Object) {
  // merge options
  if (options && options._isComponent) {
    // optimize internal component instantiation
    // since dynamic options merging is pretty slow, and none of the
    // internal component options needs special treatment.
    initInternalComponent(vm, options)
  } else {
    // 合并配置
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )
  }
  // ...
}
```
可以看到不同场景对于 options 的合并逻辑是不一样的，并且传入的 options 值也有非常大的不同。

**比如**

``` js
import Vue from 'vue'

let childComp = {
  template: '<div>{{msg}}</div>',
  created() {
    console.log('child created')
  },
  mounted() {
    console.log('child mounted')
  },
  data() {
    return {
      msg: 'Hello Vue'
    }
  }
}

Vue.mixin({
  created() {
    console.log('parent created')
  }
})

let app = new Vue({
  el: '#app',
  render: h => h(childComp)
})
```
接下来我会以上面代码为例，分开介绍 2 种场景的 `options` 合并过程。

- **外部调用场景**

当执行 `new Vue` 的时候，在执行 `this._init(options)` 的时候，就会执行如下逻辑去合并 `options`：
``` js
vm.$options = mergeOptions(
  resolveConstructorOptions(vm.constructor),
  options || {},
  vm
)
```
这里通过调用 `mergeOptions` 方法来合并，它实际上就是把 `resolveConstructorOptions(vm.constructor)` 的返回值和 `options`做合并，`resolveConstructorOptions` 的实现先不考虑，在我们这个场景下，它还是简单返回 `vm.constructor.options`，相当于 `Vue.options`，那么这个值又是什么呢，其实在 `initGlobalAPI(Vue)` 的时候定义了这个值，代码在 `src/core/global-api/index.js` 中：
``` js
// src/core/global-api/index.js

// 初始化全局配置
export function initGlobalAPI (Vue: GlobalAPI) {
  // ...
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  // 把一些内置组件扩展到 Vue.options.components 上
  extend(Vue.options.components, builtInComponents)
  // ...
}
```
首先通过 `Vue.options = Object.create(null)` 创建一个空对象，然后遍历 `ASSET_TYPES`，`ASSET_TYPES` 的定义在 `src/shared/constants.js` 中：
``` js
// src/shared/constants.js

export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
```
所以上面遍历 ASSET_TYPES 后的代码相当于：
``` js
Vue.options.components = {}
Vue.options.directives = {}
Vue.options.filters = {}
```
接着执行了 `Vue.options._base = Vue`。

最后通过 `extend(Vue.options.components, builtInComponents)` 把一些内置组件扩展到 `Vue.options.components` 上，Vue 的内置组件目前有 `<keep-alive>、<transition> 和 <transition-group>` 组件，这也就是为什么我们在其它组件中使用 `<keep-alive>` 组件不需要注册的原因。

那么回到 `mergeOptions` 这个函数，它的定义在 `src/core/util/options.js` 中：
``` js
// src/core/util/options.js

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 * 
 * 把 parent 和 child 这两个对象根据一些合并策略，合并成一个新对象并返回
 */
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  }

  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  if (!child._base) {

    // 先递归把 extends 和 mixins 合并到 parent 上
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }


  // 然后遍历 parent，调用 mergeField，然后再遍历 child，如果 key 不在 parent 的自身属性上，则调用 mergeField。
  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
```
`mergeOptions` 主要功能就是把 `parent` 和 `child` 这两个对象根据一些合并策略，合并成一个新对象并返回。比较核心的几步，先递归把 `extends` 和 `mixins` 合并到 `parent` 上，然后遍历 `parent`，调用 `mergeField`，然后再遍历 `child`，如果 `key` 不在 `parent` 的自身属性上，则调用 `mergeField`。

关于其它属性的合并策略的定义都可以在 `src/core/util/options.js` 文件中看到，这里不一一介绍了，感兴趣的同学可以自己看。

通过执行 `mergeField` 函数，把合并后的结果保存到 `options` 对象中，最终返回它。

因此，在我们当前这个 `case` 下，执行完如下合并后：
``` js
vm.$options = mergeOptions(
  resolveConstructorOptions(vm.constructor),
  options || {},
  vm
)
```
`vm.$options` 的值差不多是如下这样：
``` js
vm.$options = {
  components: { },
  created: [
    function created() {
      console.log('parent created')
    }
  ],
  directives: { },
  filters: { },
  _base: function Vue(options) {
    // ...
  },
  el: "#app",
  render: function (h) {
    //...
  }
}

```

- **组件场景**

由于组件的构造函数是通过 `Vue.extend` 继承自 `Vue` 的，先回顾一下这个过程，代码定义在 `src/core/global-api/extend.js` 中：
``` js
// src/core/global-api/extend.js

/**
 * Class inheritance
 */
Vue.extend = function (extendOptions: Object): Function {
  // ...
  Sub.options = mergeOptions(
    Super.options,
    extendOptions // 组件对象
  )

  // ...
  // keep a reference to the super options at extension time.
  // later at instantiation we can check if Super's options have
  // been updated.
  Sub.superOptions = Super.options
  Sub.extendOptions = extendOptions
  Sub.sealedOptions = extend({}, Sub.options)

  // ...
  return Sub
}
```
我们只保留关键逻辑，这里的 `extendOptions` 对应的就是前面定义的组件对象，它会和 `Vue.options` 合并到 `Sub.opitons` 中。

接下来我们再回忆一下子组件的初始化过程，代码定义在 `src/core/vdom/create-component.js` 中：
``` js
// src/core/vdom/create-component.js

// createComponentInstanceForVnode 函数构造的一个内部组件的参数，
// 然后执行 new vnode.componentOptions.Ctor(options)
export function createComponentInstanceForVnode (
  // we know it's MountedComponentVNode but flow doesn't
  vnode: any,
  // activeInstance in lifecycle state
  parent: any
): Component {
  const options: InternalComponentOptions = {
    _isComponent: true,
    _parentVnode: vnode,
    parent
  }
  ...
  // 这里的 vnode.componentOptions.Ctor 对应的就是子组件的构造函数
  return new vnode.componentOptions.Ctor(options)
}
```
这里的 `vnode.componentOptions.Ctor` 就是指向 `Vue.extend` 的返回值 `Sub`， 所以 执行 `new vnode.componentOptions.Ctor(options)`, 接着执行 `this._init(options`)：
``` js
// src/core/instance/init.js

Vue.prototype._init = function (options?: Object) {
  // merge options
  if (options && options._isComponent) { // 组件
    // optimize internal component instantiation
    // since dynamic options merging is pretty slow, and none of the
    // internal component options needs special treatment.
    initInternalComponent(vm, options) // 初始化
  } else {
    // 合并配置
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )
  }
  // ...
}
```
因为 `options._isComponent` 为 `true`，那么合并 `options` 的过程走到了 `initInternalComponent(vm, options)` 逻辑：
``` js
// src/core/instance/init.js

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {

  // 这里的 vm.constructor 就是子组件的构造函数 Sub，相当于 vm.$options = Object.create(Sub.options)
  const opts = vm.$options = Object.create(vm.constructor.options)

  // doing this because it's faster than dynamic enumeration.
  // 接着又把实例化子组件传入的子组件父 VNode 实例 parentVnode、子组件的父 Vue 实例 parent 保存到 vm.$options 中
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  // 另外还保留了 parentVnode 配置中的如 propsData 等其它的属性。
  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}
```
这么看来，`initInternalComponent` 只是做了简单一层对象赋值，并不涉及到递归、合并策略等复杂逻辑。

因此，在我们当前这个 case 下，执行完`initInternalComponent(vm, options)`后，`vm.$options` 的值差不多是如下这样：
``` js
vm.$options = {
  parent: Vue /*父Vue实例*/,
  propsData: undefined,
  _componentTag: undefined,
  _parentVnode: VNode /*父VNode实例*/,
  _renderChildren:undefined,
  __proto__: {
    components: { },
    directives: { },
    filters: { },
    _base: function Vue(options) {
        //...
    },
    _Ctor: {},
    created: [
      function created() {
        console.log('parent created')
      }, function created() {
        console.log('child created')
      }
    ],
    mounted: [
      function mounted() {
        console.log('child mounted')
      }
    ],
    data() {
       return {
         msg: 'Hello Vue'
       }
    },
    template: '<div>{{msg}}</div>'
  }
}
```

- **总结**

那么至此，Vue 初始化阶段对于 `options` 的合并过程就介绍完了，我们需要知道对于 `options` 的合并有 2 种方式，子组件初始化过程通过 `initInternalComponent` 方式要比外部初始化 `Vue` 通过 `mergeOptions` 的过程要快，合并完的结果保留在 `vm.$options` 中。

纵观一些库、框架的设计几乎都是类似的，自身定义了一些默认配置，同时又可以在初始化阶段传入一些定义配置，然后去 merge 默认配置，来达到定制化不同需求的目的。只不过在 Vue 的场景下，会对 merge 的过程做一些精细化控制，虽然我们在开发自己的 JSSDK 的时候并没有 Vue 这么复杂，但这个设计思想是值得我们借鉴的。


#### 生命周期

每个 Vue 实例在被创建之前都要经过一系列的初始化过程。例如需要设置数据监听、编译模板、挂载实例到 DOM、在数据变化时更新 DOM 等。同时在这个过程中也会运行一些叫做生命周期钩子的函数，给予用户机会在一些特定的场景下添加他们自己的代码。

在我们实际项目开发过程中，会非常频繁地和 Vue 组件的生命周期打交道，接下来我们就从源码的角度来看一下这些生命周期的钩子函数是如何被执行的。

源码中最终执行生命周期的函数都是调用 `callHook` 方法，它的定义在 `src/core/instance/lifecycle` 中：
``` js
// src/core/instance/lifecycle.js

/**
 * 执行生命周期的函数
 * callHook 函数的逻辑很简单，根据传入的字符串 hook，去拿到 vm.$options[hook] 对应的回调函数数组，然后遍历执行，执行的时候把 vm 作为函数执行的上下文。
 * @param {*} vm 
 * @param {*} hook 
 */
export function callHook (vm: Component, hook: string) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget()
  const handlers = vm.$options[hook]
  const info = `${hook} hook`
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info)
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  popTarget()
}
```
在上一节中，我们详细地介绍了 Vue.js 合并 options 的过程，各个阶段的生命周期的函数也被合并到 `vm.$options` 里，并且是一个数组。因此 `callhook` 函数的功能就是调用某个生命周期钩子注册的所有回调函数。

- **beforeCreate & created**

`beforeCreate` 和 `created` 函数都是在实例化 `Vue` 的阶段，在 `_init` 方法中执行的，它的定义在 `src/core/instance/init.js` 中：
``` js
// src/core/instance/init.js

Vue.prototype._init = function (options?: Object) {
  // ...
  initLifecycle(vm)
  initEvents(vm)
  initRender(vm)
  callHook(vm, 'beforeCreate')
  initInjections(vm) // resolve injections before data/props
  initState(vm)
  initProvide(vm) // resolve provide after data/props
  callHook(vm, 'created')
  // ...
}
```
可以看到 `beforeCreate` 和 `created` 的钩子调用是在 `initState` 的前后，`initState` 的作用是初始化 `props、data、methods、watch、computed` 等属性，之后我们会详细分析。那么显然 `beforeCreate` 的钩子函数中就不能获取到 `props、data` 中定义的值，也不能调用 `methods` 中定义的函数。
> 在这俩个钩子函数执行的时候，并没有渲染 DOM，所以我们也不能够访问 DOM，一般来说，如果组件在加载的时候需要和后端有交互，放在这俩个钩子函数执行都可以，如果是需要访问 props、data 等数据的话，就需要使用 created 钩子函数。其实 vue-router 和 vuex 都是混合了 beforeCreate 钩子函数。


- **beforeMount & mounted**

顾名思义，`beforeMount` 钩子函数发生在 `mount`，也就是 `DOM` 挂载之前，它的调用时机是在 `mountComponent` 函数中，定义在 `src/core/instance/lifecycle.js` 中：
``` js
// src/core/instance/lifecycle.js

export function mountComponent (
  vm: Component, // vue实例
  el: ?Element, // 挂载元素
  hydrating?: boolean
): Component {
  vm.$el = el
  ...
  callHook(vm, 'beforeMount') // 执行 beforeMount 钩子
  ...
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate') // 执行 beforeUpdate 钩子
      }
    }
  }, true /* isRenderWatcher */)
 

  if (vm.$vnode == null) { // vm.$vnode 表示 Vue 实例的父虚拟 Node，所以它为 Null 则表示当前是根 Vue 的实例
    vm._isMounted = true // 表示这个实例已经挂载了
    callHook(vm, 'mounted') // 同时执行 mounted 钩子函数
  }
  return vm
}
```
在执行 `vm._render()` 函数渲染 VNode 之前，执行了 `beforeMount` 钩子函数，在执行完 `vm._update()` 把 `VNode patch` 到真实 `DOM` 后，执行 `mounted` 钩子。

但这里的`mounted`是通过外部 `new Vue` 初始化过程时会执行，那组件的`mounted`时机在哪呢？

之前我们提到过，组件的 VNode patch 到 DOM 后，会执行 `invokeInsertHook` 函数，把 `insertedVnodeQueue` 里保存的钩子函数依次执行一遍，它的定义在 `src/core/vdom/patch.js` 中：
``` js
// src/core/vdom/patch.js

function invokeInsertHook (vnode, queue, initial) {
  // delay insert hooks for component root nodes, invoke them after the
  // element is really inserted
  if (isTrue(initial) && isDef(vnode.parent)) {
    vnode.parent.data.pendingInsert = queue
  } else {
    for (let i = 0; i < queue.length; ++i) {
      queue[i].data.hook.insert(queue[i])
    }
  }
}
```
该函数会执行 `insert` 这个钩子函数，对于组件而言，`insert` 钩子函数的定义在 `src/core/vdom/create-component.js` 中的 `componentVNodeHooks` 中：
``` js
// src/core/vdom/create-component.js

const componentVNodeHooks = {
  // ...
  insert (vnode: MountedComponentVNode) {
    const { context, componentInstance } = vnode
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true
      callHook(componentInstance, 'mounted') // 执行 mounted 钩子
    }
    // ...
  },
}
```
我们可以看到，每个子组件都是在这个钩子函数中执行 `mounted` 钩子函数，并且我们之前分析过，`insertedVnodeQueue` 的添加顺序是先子后父，所以对于同步渲染的子组件而言，`mounted` 钩子函数的执行顺序也是先子后父。

- **beforeUpdate & updated**

顾名思义，beforeUpdate 和 updated 的钩子函数执行时机都应该是在数据更新的时候。
``` js
// src/core/instance/lifecycle.js

export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  ...
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) { // 组件已经 mounted 并且 没销毁
        callHook(vm, 'beforeUpdate') // 执行 beforeUpdate 钩子
      }
    }
  }, true /* isRenderWatcher */)
  // ...
}
```
注意这里有个判断，也就是在组件`已经 mounted 并且 没销毁`，才会去调用这个钩子函数。

`update` 的执行时机是在 `flushSchedulerQueue` 函数调用的时候，它的定义在 `src/core/observer/scheduler.js` 中：
``` js
// src/core/observer/scheduler.js

function flushSchedulerQueue () {
  // ...
  // 获取到 updatedQueue
  callUpdatedHooks(updatedQueue)
}

function callUpdatedHooks (queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted) {
      callHook(vm, 'updated')  // 执行 updated 钩子
    }
  }
}
```
`updatedQueue` 是更新了的 `watcher` 数组，那么在 `callUpdatedHooks` 函数中，它对这些数组做遍历，只有满足当前 `watcher` 为 `vm._watcher` 以及组件已经 `mounted` 这两个条件，才会执行 `updated` 钩子函数。

我们之前提过，在组件 `mount` 的过程中，会实例化一个渲染的 `Watcher` 去监听 `vm` 上的数据变化重新渲染，这段逻辑发生在 `mountComponent` 函数执行的时候。

那么在实例化 `Watcher` 的过程中，在它的构造函数里会判断 `isRenderWatcher`，接着把当前 `watcher` 的实例赋值给 `vm._watcher`，定义在 `src/core/observer/watcher.js` 中：
``` js
// src/core/observer/watcher.js

export default class Watcher {
  // ...
  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this // 把当前 watcher 的实例赋值给 vm._watcher
    }
    vm._watchers.push(this)
    // ...
  }
}
```
同时，还把当前 watcher 实例 push 到 vm._watchers 中，vm._watcher 是专门用来监听 vm 上数据变化然后重新渲染的，所以它是一个渲染相关的 watcher，因此在 callUpdatedHooks 函数中，只有 vm._watcher 的回调执行完毕后，才会执行 updated 钩子函数。

- **beforeDestroy & destroyed**

顾名思义，`beforeDestroy` 和 `destroyed` 钩子函数的执行时机在组件销毁的阶段，组件的销毁过程之后会详细介绍，最终会调用 `$destroy` 方法，它的定义在 `src/core/instance/lifecycle.js` 中：
``` js
// src/core/instance/lifecycle.js

Vue.prototype.$destroy = function () {
    const vm: Component = this
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy') // 执行 beforeDestroy 钩子

    // 接着执行了一系列的销毁动作，包括从 parent 的 $children 中删掉自身，删除 watcher，当前渲染的 VNode 执行销毁钩子函数等，
    vm._isBeingDestroyed = true
    // remove self from parent
    const parent = vm.$parent
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm)
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown()
    }
    let i = vm._watchers.length
    while (i--) {
      vm._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--
    }
    // call the last hook...
    vm._isDestroyed = true
    // invoke destroy hooks on current rendered tree

    // 执行 vm.__patch__(vm._vnode, null) 触发它子组件的销毁钩子函数，这样一层层的递归调用，所以 destroy 钩子函数执行顺序是先子后父，和 mounted 过程一样。
    vm.__patch__(vm._vnode, null)
    // fire destroyed hook

    // 执行完毕后再调用 destroy 钩子函数。
    callHook(vm, 'destroyed')
    // turn off all instance listeners.
    vm.$off()
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      vm.$vnode.parent = null
    }
  }
}
```

- **activated & deactivated**

`activated` 和 `deactivated` 钩子函数是专门为 keep-alive 组件定制的钩子。


**总结**

这一节主要介绍了 Vue 生命周期中各个钩子函数的执行时机以及顺序，通过分析，我们知道了如在 created 钩子函数中可以访问到数据，在 mounted 钩子函数中可以访问到 DOM，在 destroy 钩子函数中可以做一些定时器销毁工作，了解它们有利于我们在合适的生命周期去做不同的事情。


#### 组件注册

在 Vue.js 中，除了它内置的组件如 `keep-alive、component、transition、transition-group` 等，其它用户自定义组件在使用前必须注册。很多同学在开发过程中可能会遇到如下报错信息：
```
'Unknown custom element: <xxx> - did you register the component correctly?
 For recursive components, make sure to provide the "name" option.'
```
一般报这个错的原因都是我们使用了未注册的组件。Vue.js 提供了 2 种组件的注册方式，全局注册和局部注册。接下来我们从源码分析的角度来分析这两种注册方式。


- **全局注册**

要注册一个全局组件，可以使用 `Vue.component(tagName, options)`。例如：
``` js
Vue.component('my-component', {
  // 选项
})
```
那么，`Vue.component` 函数是在什么时候定义的呢，它的定义过程发生在最开始初始化 `Vue` 的全局函数的时候，代码在 `src/core/global-api/assets.js` 中：
``` js
// `src/core/global-api/assets.js

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }
        // 如果 type 是 component 且 definition 是一个对象的话
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          definition = this.options._base.extend(definition) // 相当于 Vue.extend 把这个对象转换成一个继承于 Vue 的构造函数
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        // 通过 this.options[type + 's'][id] = definition 把它挂载到 Vue.options.components 上
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
```
函数首先遍历 ASSET_TYPES，得到 type 后挂载到 Vue 上 。`ASSET_TYPES` 的定义在 `src/shared/constants.js` 中：
``` js
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
```
所以实际上 Vue 是初始化了 3 个全局函数，并且如果 type 是 `component` 且 `definition` 是一个对象的话，通过 `this.opitons._base.extend`， 相当于 `Vue.extend` 把这个对象转换成一个继承于 `Vue` 的构造函数，最后通过 `this.options[type + 's'][id] = definition` 把它挂载到 `Vue.options.components` 上。

由于我们每个组件的创建都是通过 `Vue.extend` 继承而来，我们之前分析过在继承的过程中有这么一段逻辑：
``` js
// src/core/global-api/extend.js

Sub.options = mergeOptions(
  Super.options,
  extendOptions
)
```
也就是说它会把 `Vue.options` 合并到 `Sub.options`，也就是组件的 `options` 上， 然后在组件的实例化阶段，会执行 `merge options` 逻辑，把 `Sub.options.components` 合并到 `vm.$options.components` 上。

然后在创建 vnode 的过程中，会执行 `_createElement` 方法，我们再来回顾一下这部分的逻辑，它的定义在 `src/core/vdom/create-element.js` 中：
``` js
// src/core/vdom/create-element.js

export function _createElement () {
  ...
  let vnode, ns
  if (typeof tag === 'string') { // 如果是 string 类型
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) { // 判断如果是内置的一些节点，则直接创建一个普通 VNode
      ...
    // 如果是为已注册的组件名
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      // 通过 createComponent 创建一个组件类型的 VNode
      vnode = createComponent(Ctor, data, context, children, tag)
    }
    ...
}
```
这里有一个判断逻辑 `isDef(Ctor = resolveAsset(context.$options, 'components', tag))`，先来看一下 `resolveAsset` 的定义，在 `src/core/utils/options.js` 中：
``` js
// src/core/utils/options.js

export function resolveAsset (
  options: Object,
  type: string,
  id: string,
  warnMissing?: boolean
): any {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  // 先通过 const assets = options[type] 拿到 assets，
  const assets = options[type]
  // check local registration variations first
  // 然后再尝试拿 assets[id]
  if (hasOwn(assets, id)) return assets[id]
  // 如果不存在，则把 id 变成驼峰的形式再拿
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  // 仍然不存在则在驼峰的基础上把首字母再变成大写的形式再拿
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // fallback to prototype chain
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]

  // 如果仍然拿不到则报错
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    )
  }
  return res
}
```
上面方法说明了我们在使用 `Vue.component(id, definition)` 全局注册组件的时候，`id` 可以是**连字符、驼峰或首字母大写**的形式。

那么回到我们的调用 `resolveAsset(context.$options, 'components', tag)`，即拿 `vm.$options.components[tag]`，这样我们就可以在 `resolveAsset` 的时候拿到这个组件的构造函数，并作为 `createComponent` 的钩子的参数。

- **局部注册**

Vue.js 也同样支持局部注册，我们可以在一个组件内部使用 components 选项做组件的局部注册，例如：
``` js
import HelloWorld from './components/HelloWorld'

export default {
  components: {
    HelloWorld
  }
}
```
其实理解了全局注册的过程，局部注册是非常简单的。在组件的 Vue 的实例化阶段有一个合并 `option` 的逻辑，之前我们也分析过，所以就把 `components` 合并到 `vm.$options.components` 上，这样我们就可以在 `resolveAsset` 的时候拿到这个组件的构造函数，并作为 `createComponent` 的钩子的参数。

注意，局部注册和全局注册不同的是，只有该类型的组件才可以访问局部注册的子组件，而全局注册是扩展到 `Vue.options` 下，所以在所有组件创建的过程中，都会从全局的 `Vue.options.components` 扩展到当前组件的 `vm.$options.components` 下，这就是全局注册的组件能被任意使用的原因。


#### 异步组件

在我们平时的开发工作中，为了减少首屏代码体积，往往会把一些非首屏的组件设计成异步组件，按需加载。Vue 也原生支持了异步组件的能力，如下：
``` js
Vue.component('async-example', function (resolve, reject) {
   // 这个特殊的 require 语法告诉 webpack
   // 自动将编译后的代码分割成不同的块，
   // 这些块将通过 Ajax 请求自动下载。
   require(['./my-async-component'], resolve)
})
```
示例中可以看到，Vue 注册的组件不再是一个对象，而是一个工厂函数，函数有两个参数 `resolve` 和 `reject`，函数内部用 `setTimout` 模拟了异步，实际使用可能是通过动态请求异步组件的 JS 地址，最终通过执行 `resolve` 方法，它的参数就是我们的异步组件对象。

在了解了异步组件如何注册后，我们从源码的角度来分析一下它的实现。

上一节我们分析了组件的注册逻辑，由于组件的定义并不是一个普通对象，所以不会执行 `Vue.extend` 的逻辑把它变成一个组件的构造函数，但是它仍然可以执行到 `createComponent` 函数，我们再来对这个函数做回顾，它的定义在 `src/core/vdom/create-component/js` 中：
``` js
// src/core/vdom/create-component/js

export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return
  }

  const baseCtor = context.$options._base

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }
  
  // ...

  // async component 异步组件
  let asyncFactory
  // 由于我们这个时候传入的 Ctor 是一个函数，那么它也并不会执行 Vue.extend 逻辑，因此它的 cid 是 undefined
  // 进入了异步组件创建的逻辑
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context)
    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }
}
```
由于我们这个时候传入的 `Ctor` 是一个函数，那么它也并不会执行 `Vue.extend` 逻辑，因此它的 cid 是 `undefined`，进入了异步组件创建的逻辑。这里首先执行了 `Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context)` 方法，它的定义在 `src/core/vdom/helpers/resolve-async-component.js` 中：
``` js
// src/core/vdom/helpers/resolve-async-component.js


```
`resolveAsyncComponent` 函数的逻辑略复杂，因为它实际上处理了 3 种异步组件的创建方式，除了刚才示例的组件注册方式，还支持 2 种，一种是支持 `Promise` 创建组件的方式，如下：
``` js
Vue.component(
  'async-webpack-example',
  // 该 `import` 函数返回一个 `Promise` 对象。
  () => import('./my-async-component')
)
```
另一种是高级异步组件，如下：
``` js
const AsyncComp = () => ({
  // 需要加载的组件。应当是一个 Promise
  component: import('./MyComp.vue'),
  // 加载中应当渲染的组件
  loading: LoadingComp,
  // 出错时渲染的组件
  error: ErrorComp,
  // 渲染加载中组件前的等待时间。默认：200ms。
  delay: 200,
  // 最长等待时间。超出此时间则渲染错误组件。默认：Infinity
  timeout: 3000
})
Vue.component('async-example', AsyncComp)
```

- **普通函数异步组件**

- **Promise 异步组件**


- **高级异步组件**



**总结**


高级异步组件的实现是非常巧妙的，它实现了 `loading、resolve、reject、timeout`4 种状态。

异步组件实现的本质是 2 次渲染，除了 0 delay 的高级异步组件第一次直接渲染成 loading 组件外，其它都是第一次渲染生成一个注释节点，当异步获取组件成功后，再通过 `forceRender` 强制重新渲染，这样就能正确渲染出我们异步加载的组件了。



### 深入响应式原理

前面都是 Vue 怎么实现数据渲染和组件化的，主要讲的是**初始化**的过程，把原始的数据最终映射到 DOM 中，但并没有涉及到数据变化到 DOM 变化的部分。而 Vue 的数据驱动除了数据渲染 DOM 之外，还有一个很重要的体现就是**数据的变更会触发 DOM 的变化**。

如下示例：
``` vue
<template>
    <div id="app" @click="changeMsg">
        {{ message }}
    </div>
</template>
<script>
export default {
    var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!'
    },
    methods: {
        changeMsg() {
        this.message = 'Hello World!'
        }
    }
    })
}
</script>
```
当我们去修改 this.message 的时候，模板对应的插值也会渲染成新的数据，那么这一切是怎么做到的呢？

在分析前，我们先直观的想一下，如果不用 Vue 的话，我们会通过最简单的方法实现这个需求：监听点击事件，修改数据，手动操作 DOM 重新渲染。这个过程和使用 Vue 的最大区别就是多了一步“手动操作 DOM 重新渲染”。这一步看上去并不多，但它背后又潜在的几个要处理的问题：

1. 我需要修改哪块的 DOM？
2. 我的修改效率和性能是不是最优的？
3. 我需要对数据每一次的修改都去操作 DOM 吗？
4. 我需要 case by case 去写修改 DOM 的逻辑吗？

如果我们使用了 Vue，那么上面几个问题 Vue 内部就帮你做了，那么 Vue 是如何在我们对数据修改后自动做这些事情呢，接下来我们将进入一些 Vue 响应式系统的底层的细节。


#### 响应式对象

`Vue2.x` 实现响应式的核心是利用了 `ES5` 的 `Object.defineProperty`，这也是为什么 `Vue.js` 不能兼容 `IE8` 及以下浏览器的原因，我们先来对它有个直观的认识。


- **Object.defineProperty**

Object.defineProperty 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性， 并返回这个对象，先来看一下它的语法：
``` js
Object.defineProperty(obj, prop, descriptor)
```
`obj` 是要在其上定义属性的对象；`prop` 是要定义或修改的属性的名称；`descriptor` 是将被定义或修改的属性描述符。

比较核心的是 `descriptor`，它有很多可选键值，具体的可以去参阅它的[文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)。这里我们最关心的是 `get` 和 `set`，`get` 是一个给属性提供的 `getter` 方法，当我们访问了该属性的时候会触发 `getter` 方法；`set` 是一个给属性提供的 `setter` 方法，当我们对该属性做修改的时候会触发 `setter` 方法。

一旦对象拥有了 `getter` 和 `setter`，我们可以简单地把这个对象称为响应式对象。那么 `Vue.js` 把哪些对象变成了响应式对象了呢，接下来我们从源码层面分析。


- **initState**

在 Vue 的初始化阶段，`_init` 方法执行的时候，会执行 `initState(vm)` 方法，它的定义在 `src/core/instance/state.js` 中。
``` js
// src/core/instance/state.js

// initState 方法主要是对 props、methods、data、computed 和 wathcer 等属性做了初始化操作。
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

> 这里重点分析下 `props` 和 `data`~

**initProps**

``` js
// src/core/instance/state.js

function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  if (!isRoot) {
    toggleObserving(false)
  }

  // 遍历
  for (const key in propsOptions) {
    keys.push(key)
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      ...
    } else {

      // 调用 defineReactive 方法把每个 prop 对应的值变成响应式
      defineReactive(props, key, value)
    }

    // 可以通过 vm._props.xxx 访问到定义 props 中对应的属性
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}
```
props 的初始化主要过程，就是遍历定义的 props 配置。遍历的过程主要做两件事情：
1. 一个是调用 defineReactive 方法把每个 prop 对应的值变成响应式；
2. 可以通过 vm._props.xxx 访问到定义 props 中对应的属性。


**initData**

``` js
// src/core/instance/state.js

function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  // 遍历
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key) // 代理
    }
  }
  // observe data
  // 响应式
  observe(data, true /* asRootData */)
}
```
data 的初始化主要过程也是做两件事：
1. 一个是对定义 data 函数返回对象的遍历，通过 proxy 把每一个值 vm._data.xxx 都代理到 vm.xxx 上；
2. 另一个是调用 observe 方法观测整个 data 的变化，把 data 也变成响应式，可以通过 vm._data.xxx 访问到定义 data 返回函数中对应的属性。

可以看到，无论是 props 或是 data 的初始化都是把它们变成响应式对象，这个过程我们接触到几个函数，接下来我们来详细分析它们。


- **proxy**

首先介绍一下代理，代理的作用是把 props 和 data 上的属性代理到 vm 实例上，这也就是为什么比如我们定义了如下 props，却可以通过 vm 实例访问到它。
``` js
let comP = {
  props: {
    msg: 'hello'
  },
  methods: {
    say() {
      console.log(this.msg)
    }
  }
}
```
我们可以在 say 函数中通过 this.msg 访问到我们定义在 props 中的 msg，这个过程发生在 proxy 阶段：
``` js
// src/core/instance/state.js

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

// 通过 Object.defineProperty 把 target[sourceKey][key] 的读写变成了对 target[key] 的读写
export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```
proxy 方法的实现很简单，通过 `Object.defineProperty` 把 `target[sourceKey][key]` 的读写变成了对 `target[key]` 的读写。

所以对于 `props` 而言，对 `vm._props.xxx` 的读写变成了 `vm.xxx` 的读写；同理，对于 `data` 而言，对 `vm._data.xxxx` 的读写变成了对 `vm.xxxx` 的读写。

- **observe**

`observe` 的功能就是用来监测数据的变化，它的定义在 `src/core/observer/index.js` 中：
``` js
// src/core/observer/index.js

/**
 * 监测数据的变化：给非 VNode 的对象类型数据添加一个 Observer
 */
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) { // 如果已经添加过则直接返回
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value) // 实例化一个 Observer 对象实例
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```
observe 方法的作用就是给非 `VNode` 的对象类型数据添加一个 `Observer`，如果已经添加过则直接返回，否则在满足一定条件下去实例化一个 `Observer` 对象实例。接下来我们来看一下 `Observer` 的作用。


- **Observer**

Observer 是一个类，它的作用是给对象的属性添加 getter 和 setter，用于依赖收集和派发更新：

``` js
// src/core/observer/index.js

// Observer 是一个类，它的作用是给对象的属性添加 getter 和 setter，用于依赖收集和派发更新
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep() // 首先实例化 Dep 对象
    this.vmCount = 0
    def(value, '__ob__', this) // 接着通过执行 def 函数把自身实例添加到数据对象 value 的 __ob__ 属性上
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```
Observer 的构造函数逻辑很简单：
1. 首先实例化 `Dep` 对象；
2. 接着通过执行 `def` 函数把自身实例添加到数据对象 `value` 的 `__ob__` 属性上；
3. 接下来会对 `value` 做判断，对于数组会调用 `observeArray` 方法，否则对纯对象调用 `walk` 方法。
   > 可以看到 `observeArray` 是遍历数组再次调用 `observe` 方法，而 `walk` 方法是遍历对象的 `key` 调用 `defineReactive` 方法。

`def` 函数是一个非常简单的`Object.defineProperty` 的封装，这就是为什么在开发中输出 `data` 上对象类型的数据，会发现该对象多了一个 `__ob__` 的属性。
``` js
// src/core/util/lang.js

export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}
```

- **defineReactive**

`defineReactive` 的功能就是定义一个响应式对象，给对象动态添加 `getter` 和 `setter`，它的定义在 `src/core/observer/index.js` 中：
``` js
// src/core/observer/index.js

// defineReactive 的功能就是定义一个响应式对象，给对象动态添加 getter 和 setter
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {

  // 初始化 Dep 对象的实例
  const dep = new Dep()

  // 接着拿到 obj 的属性描述符
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  let childOb = !shallow && observe(val) // 对子对象递归调用 observe 方法

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify() // 派发更新
    }
  })
}
```
`defineReactive` 函数最开始初始化 `Dep` 对象的实例，接着拿到 `obj` 的属性描述符，然后对子对象递归调用 `observe` 方法，这样就保证了无论 `obj` 的结构多复杂，它的所有子属性也能变成响应式的对象，这样我们访问或修改 `obj` 中一个嵌套较深的属性，也能触发 `getter` 和 `setter`。最后利用 `Object.defineProperty` 去给 `obj` 的属性 `key` 添加 `getter` 和 `setter`。而关于 `getter` 和 `setter` 的具体实现，在之后介绍。

**总结**

这一节介绍了响应式对象，核心就是利用 `Object.defineProperty` 给数据添加了 `getter` 和 `setter`，目的就是为了在我们访问数据以及写数据的时候能自动执行一些逻辑：`getter` 做的事情是依赖收集，`setter` 做的事情是派发更新，那么在接下来的章节我们会重点对这两个过程分析。


#### 依赖收集

通过上一节的分析我们了解 Vue 会把普通对象变成响应式对象，响应式对象 getter 相关的逻辑就是做依赖收集，这一节我们来详细分析这个过程。

`defineReactive`方法首先是通过`const dep = new Dep()`初始化`dep`实例，`Dep` 是整个 `getter` 依赖收集的核心，它的定义在 `src/core/observer/dep.js` 中：
``` js
// src/core/observer/dep.js

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
```
`Dep` 是一个 Class，它定义了一些属性和方法，这里需要特别注意的是它有一个静态属性 `target`，这是一个全局唯一 `Watcher`，这是一个非常巧妙的设计，因为在同一时间只能有一个全局的 `Watcher` 被计算，另外它的自身属性 `subs` 也是 `Watcher` 的数组。

Dep 实际上就是对 `Watcher` 的一种管理，Dep 脱离 `Watcher` 单独存在是没有意义的，为了完整地讲清楚依赖收集过程，我们有必要看一下 `Watcher` 的一些相关实现，它的定义在 `src/core/observer/watcher.js` 中：
``` js
// src/core/observer/watcher.js

let uid = 0

export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    // 判断 isRenderWatcher，接着把当前 watcher 的实例赋值给 vm._watcher
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers

    // this.deps 和 this.newDeps 表示 Watcher 实例持有的 Dep 实例的数组
    // newDeps 表示新添加的 Dep 实例数组，而 deps 表示上一次添加的 Dep 实例数组。
    this.deps = []
    this.newDeps = []

    // this.depIds 和 this.newDepIds 分别代表 this.deps 和 this.newDeps 的 id Set（这个 Set 是 ES6 的数据结构）
    this.depIds = new Set()
    this.newDepIds = new Set()

    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    pushTarget(this) // 把 Dep.target 赋值为当前的渲染 watcher 并压栈
    let value
    const vm = this.vm
    try {
      // this.getter 对应就是 updateComponent 函数，这实际上就是在执行：
      // vm._update(vm._render(), hydrating) 
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value) // 递归去访问 value，触发它所有子项的 getter
      }
      popTarget() // 把 Dep.target 恢复成上一个状态，因为当前 vm 的数据依赖收集已经完成，那么对应的渲染Dep.target 也需要改变
      this.cleanupDeps() // 清空依赖
    }
    return value
  }
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  /**
   * Clean up for dependency collection.
   * 依赖清空
   * 在执行 cleanupDeps 函数的时候，会首先遍历 deps，移除对 dep.subs 数组中 Wathcer 的订阅，然后把 newDepIds 和 depIds 交换，newDeps 和 deps 交换，并把 newDepIds 和 newDeps 清空。
   */
  cleanupDeps () {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }ill be called by the scheduler.
   */
  run () {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          const info = `callback for watcher "${this.expression}"`
          invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info)
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
  teardown () {
    if (this.active) {
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
}
```
之前我们介绍当对数据对象的访问会触发他们的 `getter` 方法，那么这些对象什么时候被访问呢？还记得之前我们介绍过 Vue 的 mount 过程是通过 `mountComponent` 函数，其中有一段比较重要的逻辑，大致如下：
``` js
// src/core/instance/lifecycle.js

updateComponent = () => {
  vm._update(vm._render(), hydrating)
}
new Watcher(vm, updateComponent, noop, {
  before () {
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */)
```
当我们去实例化一个渲染 `watcher` 的时候，首先进入 `watcher` 的构造函数逻辑，然后会执行它的 `this.get()` 方法，进入 get 函数，首先会执行`pushTarget(this)`，该方法定义在`src/core/observer/dep.js` 中：
``` js
// src/core/observer/dep.js

Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}
```

（待完善...）

**Q：** 为什么需要做 deps 订阅的移除呢，在添加 deps 的订阅过程，已经能通过 id 去重避免重复订阅了？
> 考虑到一种场景，我们的模板会根据 v-if 去渲染不同子模板 a 和 b，当我们满足某种条件的时候渲染 a 的时候，会访问到 a 中的数据，这时候我们对 a 使用的数据添加了 getter，做了依赖收集，那么当我们去修改 a 的数据的时候，理应通知到这些订阅者。那么如果我们一旦改变了条件渲染了 b 模板，又会对 b 使用的数据添加了 getter，如果我们没有依赖移除的过程，那么这时候我去修改 a 模板的数据，会通知 a 数据的订阅的回调，这显然是有浪费的。

> 因此 Vue 设计了在每次添加完新的订阅，会移除掉旧的订阅，这样就保证了在我们刚才的场景中，如果渲染 b 模板的时候去修改 a 模板的数据，a 数据订阅回调已经被移除了，所以不会有任何浪费，真的是非常赞叹 Vue 对一些细节上的处理。

**总结**

收集依赖的目的是为了当这些响应式数据发生变化，触发它们的 setter 的时候，能知道应该通知哪些订阅者去做相应的逻辑处理，我们把这个过程叫派发更新，其实 Watcher 和 Dep 就是一个非常经典的观察者设计模式的实现，下一节我们来详细分析一下派发更新的过程。


#### 派发更新

通过上一节分析我们了解了响应式数据依赖收集过程，收集的目的就是为了当我们修改数据的时候，可以对相关的依赖派发更新，那么这一节我们来详细分析这个过程。

在`defineReactive`方法中，当我们在组件中对响应的数据做了修改，就会触发 `setter` 的逻辑，最后调用 dep.notify() 方法， 它是 Dep 的一个实例方法，定义在 `src/core/observer/dep.js` 中：
``` js
// src/core/observer/dep.js

class Dep {
  // ...
  notify () {
  // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update() // 更新
    }
  }
}
```
这里的逻辑非常简单，遍历所有的 subs，也就是 `Watcher` 的实例数组，然后调用每一个 watcher 的 update 方法，它的定义在 `src/core/observer/watcher.js` 中：
``` js
// src/core/observer/watcher.js

class Watcher {
  // ...
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this) // 
    }
  }
  ...
}  
```
这里对于 Watcher 的不同状态，会执行不同的逻辑，在一般组件数据更新的场景，会走到最后一个 `queueWatcher(this)` 的逻辑，`queueWatcher` 的定义在 `src/core/observer/scheduler.js` 中：
``` js
// src/core/observer/scheduler.js

const queue: Array<Watcher> = []

export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)
    }
  }
}
```
这里引入了一个`队列`的概念，这也是 Vue 在做派发更新的时候的一个优化的点，它并不会每次数据改变都触发 `watcher` 的回调，而是把这些 `watcher` 先添加到一个队列里，然后在 `nextTick` 后执行 `flushSchedulerQueue`。


**总结**

通过这一节的分析，我们对 Vue 数据修改派发更新的过程也有了认识，实际上就是当数据发生变化的时候，触发 setter 逻辑，把在依赖过程中订阅的的所有观察者，也就是 watcher，都触发它们的 update 过程，这个过程又利用了队列做了进一步优化，在 nextTick 后执行所有 watcher 的 run，最后执行它们的回调函数。


#### $nextTick

nextTick 是 Vue 的一个核心实现，在介绍 Vue 的 nextTick 之前，为了方便大家理解，我先简单介绍一下 JS 的运行机制。


- **JS运行机制**

JS 执行是**单线程**的，它是基于**事件循环**的。事件循环大致分为以下几个步骤：
1. 所有同步任务都在主线程上执行，形成一个**执行栈（execution context stack）**。
2. 主线程之外，还存在一个"**任务队列**"（task queue）。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件。
3. 一旦"执行栈"中的所有同步任务执行完毕，系统就会读取"任务队列"，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行。
4. 主线程不断重复上面的第三步。

主线程的执行过程就是一个 tick，而所有的异步结果都是通过 “任务队列” 来调度。 消息队列中存放的是一个个的任务（task）。 **规范中规定 task 分为两大类，分别是 macro task 和 micro task，并且每个 macro task 结束后，都要清空所有的 micro task。**

关于 macro task 和 micro task 的概念，这里不会细讲，简单通过一段代码演示他们的执行顺序：
``` js
for (macroTask of macroTaskQueue) {
    // 1. Handle current MACRO-TASK
    handleMacroTask();
      
    // 2. Handle all MICRO-TASK
    for (microTask of microTaskQueue) {
        handleMicroTask(microTask);
    }
}
```
在浏览器环境中，常见的 `macro task` 有 `setTimeout、MessageChannel、postMessage、setImmediate`；常见的 `micro task` 有 `MutationObsever` 和 `Promise.then`。


- **实现**

在 Vue 源码 2.5+ 后，`nextTick` 的实现单独有一个 `JS` 文件来维护它，它的源码并不多，总共也就 100 多行。接下来我们来看一下它的实现，在 `src/core/util/next-tick.js` 中：
``` js
// src/core/util/next-tick.js

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
`next-tick.js` 对外暴露了一个函数：`nextTick`，它的逻辑也很简单，把传入的回调函数 `cb` 压入 `callbacks` 数组，最后一次性地执行 `timerFunc`，而它们都会在下一个 tick 执行 `flushCallbacks`，`flushCallbacks` 的逻辑非常简单，对 `callbacks` 遍历，然后执行相应的回调函数。

这里使用 `callbacks` 而不是直接在 `nextTick` 中执行回调函数的原因是保证在同一个 `tick` 内多次执行 `nextTick`，不会开启多个异步任务，而把这些异步任务都压成一个同步任务，在下一个 `tick` 执行完毕。

- **总结**

通过这一节对 `nextTick` 的分析，并结合上一节的 `setter` 分析，我们了解到数据的变化到 `DOM` 的重新渲染是一个异步过程，发生在下一个 `tick`。这就是我们平时在开发的过程中，比如从服务端接口去获取数据的时候，数据做了修改，如果我们的某些方法去依赖了数据修改后的 DOM 变化，我们就必须在 nextTick 后执行。比如下面的伪代码：
``` js
getData(res).then(()=>{
  this.xxx = res.data
  this.$nextTick(() => {
    // 这里我们可以获取变化后的 DOM
  })
})
```


#### $set

对于使用 `Object.defineProperty` 实现响应式的对象，当我们去给这个对象添加一个新的属性的时候，是不能够触发它的 `setter` 的，比如：
``` js
var vm = new Vue({
  data:{
    a:1
  }
})
// vm.b 是非响应的
vm.b = 2
```
但是添加新属性的场景我们在平时开发中会经常遇到，那么 Vue 为了解决这个问题，定义了一个全局 API `Vue.set` 方法，它在 `src/core/global-api/index.js` 中初始化：
``` js
// src/core/global-api/index.js

Vue.set = set
```
这个 set 方法的定义在 `src/core/observer/index.js` 中：
``` js
// src/core/observer/index.js

/**
 * 添加响应式
 * target 可能是数组或者是普通对象，
 * key 代表的是数组的下标或者是对象的键值，
 * val 代表添加的值
 */
export function set (target: Array<any> | Object, key: any, val: any): any {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }

  // 首先判断如果 target 是数组且 key 是一个合法的下标，则之前通过 splice 去添加进数组然后返回，
  // 这里的 splice 其实已经不仅仅是原生数组的 splice 了，稍后我会详细介绍数组的逻辑。
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }

  // 接着又判断 key 已经存在于 target 中，则直接赋值返回，因为这样的变化是可以观测到了
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }

  // 接着再获取到 target.__ob__ 并赋值给 ob，之前分析过它是在 Observer 的构造函数执行的时候初始化的，表示 Observer 的一个实例
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }

  // 如果它不存在，则说明 target 不是一个响应式的对象，则直接赋值并返回。
  if (!ob) {
    target[key] = val
    return val
  }

  // 最后通过 defineReactive(ob.value, key, val) 把新添加的属性变成响应式对象
  defineReactive(ob.value, key, val)
  // 然后再通过 ob.dep.notify() 手动的触发依赖通知
  ob.dep.notify()
  return val
}
```
在`defineReactive`函数的 `getter` 过程中判断了 `childOb`，并调用了 `childOb.dep.depend()` 收集了依赖，这就是为什么执行 `Vue.set` 的时候通过 `ob.dep.notify()` 能够通知到 `watcher`，从而让添加新的属性到对象也可以检测到变化。这里如果 `value` 是个数组，那么就通过 `dependArray` 把数组每个元素也去做依赖收集。

#### 数组的响应式处理

接着说一下数组的情况，Vue 也是不能检测到以下变动的数组：
1. 当你利用索引直接设置一个项时，例如：`vm.items[indexOfItem] = newValue`；
2. 当你修改数组的长度时，例如：`vm.items.length = newLength`

对于第一种情况，可以使用：`Vue.set(example1.items, indexOfItem, newValue)`；而对于第二种情况，可以使用 `vm.items.splice(newLength)`。

我们刚才也分析到，对于 `Vue.set` 的实现，当 `target` 是数组的时候，也是通过 `target.splice(key, 1, val)` 来添加的，那么这里的 `splice` 到底有什么黑魔法，能让添加的对象变成响应式的呢？

其实之前我们也分析过，在通过 `observe` 方法去观察对象的时候会实例化 `Observer`，在它的构造函数中是专门对数组做了处理，它的定义在 `src/core/observer/index.js` 中。
``` js
// src/core/observer/index.js

export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep() // 首先实例化 Dep 对象
    this.vmCount = 0
    def(value, '__ob__', this) // 接着通过执行 def 函数把自身实例添加到数据对象 value 的 __ob__ 属性上
    if (Array.isArray(value)) { // value是数组
      if (hasProto) { // 判断对象中是否存在 __proto__
        // 如果存在则执行 protoAugment
        // protoAugment 方法是直接把 target.__proto__ 原型直接修改为 src
        // 对于大部分现代浏览器都会走到 protoAugment，那么它实际上就把 value 的原型指向了 arrayMethods
        protoAugment(value, arrayMethods) 
      } else { 
        // 否则执行 copyAugment
        // copyAugment 方法是遍历 keys，通过 def，也就是 Object.defineProperty 去定义它自身的属性值
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  ...
}

function protoAugment (target, src: Object, keys: any) {
  target.__proto__ = src
}

function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}
```
对于大部分现代浏览器都会走到 `protoAugment`，那么它实际上就把 `value` 的原型指向了 `arrayMethods`，`arrayMethods` 的定义在 `src/core/observer/array.js` 中：
``` js
// src/core/observer/array.js

import { def } from '../util/index'

const arrayProto = Array.prototype
// arrayMethods 首先继承了 Array
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 * 然后对数组中所有能改变数组自身的方法，如 push、pop 等这些方法进行重写。
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args) // 先执行它们本身原有的逻辑
    const ob = this.__ob__ // Observer 实例
    let inserted
    // 并对能增加数组长度的 3 个方法 push、unshift、splice 方法做了判断，获取到插入的值
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted) // 然后把新添加的值变成一个响应式对象
    // notify change
    ob.dep.notify() // 动触发依赖通知
    return result
  })
})

```
可以看到，`arrayMethods` 首先继承了 `Array`，然后对数组中所有能改变数组自身的方法，如 `push、pop` 等这些方法进行重写。重写后的方法会先执行它们本身原有的逻辑，并对能增加数组长度的 3 个方法 `push、unshift、splice` 方法做了判断，获取到插入的值，然后把新添加的值变成一个响应式对象，并且再调用 `ob.dep.notify()` 手动触发依赖通知，这就很好地解释了之前的示例中调用 `vm.items.splice(newLength)` 方法可以检测到变化。


#### 计算属性computed

计算属性的初始化是发生在 Vue 实例初始化阶段的 `initState` 函数中，执行了：
``` js
// src/core/instance/state.js

const computedWatcherOptions = { lazy: true }

export function initState (vm: Component) {
  ...
  if (opts.computed) initComputed(vm, opts.computed)
  ...
}
```
`initComputed` 的定义在 `src/core/instance/state.js` 中：
``` js
// src/core/instance/state.js

// 计算属性的初始化
function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  // 首先创建 vm._computedWatchers 为一个空对象
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  // 接着对 computed 对象做遍历
  for (const key in computed) {
    const userDef = computed[key] // 拿到计算属性的每一个 userDef
    // 然后尝试获取这个 userDef 对应的 getter 函数，拿不到则在开发环境下报警告
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // 接下来为每一个 getter 创建一个 watcher，这个 watcher 和渲染 watcher 有一点很大的不同，它是一个 computed watcher，
      // 因为 const computedWatcherOptions = { lazy: true }。
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // 最后对判断如果 key 不是 vm 的属性，则调用 defineComputed(vm, key, userDef)，
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      // 否则判断计算属性对于的 key 是否已经被 data 或者 prop 所占用，如果是的话则在开发环境报相应的警告。
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      } else if (vm.$options.methods && key in vm.$options.methods) {
        warn(`The computed property "${key}" is already defined as a method.`, vm)
      }
    }
  }
}

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

// 定义计算属性：利用 Object.defineProperty 给计算属性对应的 key 值添加 getter 和 setter，
// setter 通常是计算属性是一个对象，并且拥有 set 方法的时候才有，否则是一个空函数
export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  const shouldCache = !isServerRendering()
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key) // 最终 getter 对应的是 createComputedGetter(key) 的返回值
      : createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

// createComputedGetter 返回一个函数 computedGetter，它就是计算属性对应的 getter。
function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}
```


#### 侦听属性watch

侦听属性的初始化也是发生在 Vue 的实例初始化阶段的 `initState` 函数中，在 `computed` 初始化之后，执行了：
``` js
// src/core/instance/state.js

const computedWatcherOptions = { lazy: true }

export function initState (vm: Component) {
  ...
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```
来看一下 `initWatch` 的实现，它的定义在 `src/core/instance/state.js` 中：
``` js
// src/core/instance/state.js

// watch初始化
function initWatch (vm: Component, watch: Object) {
  // 这里就是对 watch 对象做遍历，拿到每一个 handler
  for (const key in watch) {
    const handler = watch[key]
    // 因为 Vue 是支持 watch 的同一个 key 对应多个 handler，所以如果 handler 是一个数组，则遍历这个数组，调用 createWatcher 方法
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else { // 否则直接调用 createWatcher
      createWatcher(vm, key, handler)
    }
  }
}

// 创建watch
function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) { // 首先对 hanlder 的类型做判断，如果是对象
    options = handler
    handler = handler.handler // 拿到它最终的回调函数
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options) // 最后调用 vm.$watch(keyOrFn, handler, options) 函数
}

export function stateMixin (Vue: Class<Component>) {
  
  ...

  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this
    // 这个方法首先判断 cb 如果是一个对象，则调用 createWatcher 方法，
    // 这是因为 $watch 方法是用户可以直接调用的，它可以传递一个对象，也可以传递函数
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    options.user = true
    // 接着执行 const watcher = new Watcher(vm, expOrFn, cb, options) 实例化了一个 watcher，
    // 这里需要注意一点这是一个 user watcher，因为 options.user = true。
    // 通过实例化 watcher 的方式，一旦我们 watch 的数据发送变化，它最终会执行 watcher 的 run 方法，执行回调函数 cb
    const watcher = new Watcher(vm, expOrFn, cb, options)
    
    // 并且如果我们设置了 immediate 为 true，则直接会执行回调函数 cb。
    if (options.immediate) {
      const info = `callback for immediate watcher "${watcher.expression}"`
      pushTarget()
      invokeWithErrorHandling(cb, vm, [watcher.value], vm, info)
      popTarget()
    }
    // 最后返回了一个 unwatchFn 方法，它会调用 teardown 方法去移除这个 watcher。
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
```
通过实例化 `watcher` 的方式，一旦我们 `watch` 的数据发送变化，它最终会执行 `watcher` 的 `run` 方法，执行回调函数 `cb`，并且如果我们设置了 `immediate` 为 `true`，则直接会执行回调函数 `cb`。最后返回了一个 `unwatchFn` 方法，它会调用 `teardown` 方法去移除这个 `watcher`。

所以本质上侦听属性也是基于 `Watcher` 实现的，它是一个 `user watcher`。其实 Watcher 支持了4种不同的类型：

`deep watcher、user watcher、computed watcher、sync watcher`。


#### 组件更新

在组件化章节，我们介绍了 Vue 的组件化实现过程，不过我们只讲了 Vue 组件的创建过程，并没有涉及到组件数据发生变化，更新组件的过程。而通过我们这一章对数据响应式原理的分析，了解到当数据发生变化的时候，会触发渲染 watcher 的回调函数，进而执行组件的更新过程，接下来我们来详细分析这一过程。
``` js
// src/core/instance/lifecycle.js

export function mountComponent() {
    ...
    updateComponent = () => {
        vm._update(vm._render(), hydrating)
    }
    new Watcher(vm, updateComponent, noop, {
        before () {
            if (vm._isMounted) {
            callHook(vm, 'beforeUpdate')
            }
        }
    }, true /* isRenderWatcher */)
}
```
组件的更新还是调用了 `vm._update` 方法，我们再回顾一下这个方法，它的定义在 `src/core/instance/lifecycle.js` 中：
``` js
// src/core/instance/lifecycle.js

export function lifecycleMixin (Vue: Class<Component>) {
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    ...
    const prevVnode = vm._vnode // 旧虚拟节点
    if (!prevVnode) { // 没有旧虚拟节点，即首次渲染，执行 patch方法，将vnode渲染成真实dom
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode) // 执行 patch 方法，比较差异
    }
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
  }
}
```
组件更新的过程，会执行 `vm.$el = vm.__patch__(prevVnode, vnode)`，它仍然会调用 `patch` 函数，在 `src/core/vdom/patch.js` 中定义。

关于`vue`的组件更新详细分析可见我的另一篇博文[Vue深入：Virtual-DOM与Diff算法](/skills/vue/diff.html)，这里不再赘述~


#### Props

`Props` 作为组件的核心特性之一，也是我们平时开发 `Vue` 项目中接触最多的特性之一，它可以让组件的功能变得丰富，也是父子组件通讯的一个渠道。那么它的实现原理是怎样的，我们来一探究竟。


- **规范化**

在初始化 props 之前，首先会对 props 做一次 `normalize`，它发生在 `mergeOptions` 的时候，在 `src/core/util/options.js` 中：
``` js
// src/core/util/options.js

// 合并配置我们在组件化章节讲过，它主要就是处理我们定义组件的对象 option，然后挂载到组件的实例 this.$options 中。
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  // ...
  normalizeProps(child, vm)
  // ...
}


// 规范化: 把我们编写的 props 转成对象格式，因为实际上 props 除了对象格式，还允许写成数组格式
function normalizeProps (options: Object, vm: ?Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  // 当 props 是一个数组
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') { // 每一个数组元素 prop 只能是一个 string，表示 prop 的 key
        name = camelize(val) // 转成驼峰格式
        res[name] = { type: null } // prop 的类型为空
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) { // 当 props 是一个对象
    for (const key in props) {
      val = props[key]
      name = camelize(key) // 对于 props 中每个 prop 的 key，我们会转驼峰格式
      // 而它的 value，如果不是一个对象，我们就把它规范成一个对象
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') { // 如果 props 既不是数组也不是对象，就抛出一个警告
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}
```
举个例子：
``` js

// a.
export default {
  props: ['name', 'nick-name']
}

// 经过 normalizeProps 后：
options.props = {
  name: { type: null },
  nickName: { type: null }
}

// b.
export default {
  props: {
    name: String,
    nickName: {
      type: Boolean
    }
  }
}

// 经过 normalizeProps 后：
options.props = {
  name: { type: String },
  nickName: { type: Boolean }
}
```
由于对象形式的 props 可以指定每个 prop 的类型和定义其它的一些属性，推荐用对象形式定义 props。


- **初始化**

Props 的初始化主要发生在 new Vue 中的 `initState` 阶段，在 `src/core/instance/state.js` 中：
``` js
// src/core/instance/state.js

export function initState (vm: Component) {
  // ....
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  // ...
}


// 初始化
function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  // root instance props should be converted
  if (!isRoot) { // 当 vm 是非根实例的时候，会先执行 toggleObserving(false)，它的目的是为了响应式的优化
    toggleObserving(false)
  }

  // 第一步：校验
  // 逻辑很简单，遍历 propsOptions，执行 validateProp(key, propsOptions, propsData, vm) 方法
  // 这里的 propsOptions 就是我们定义的 props 在规范后生成的 options.props 对象，
  for (const key in propsOptions) {
    keys.push(key)
    // 校验的目的就是检查一下我们传递的数据是否满足 prop的定义规范
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      // 在开发环境中我们会校验 prop 的 key 是否是 HTML 的保留属性
      const hyphenatedKey = hyphenate(key)
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      // 并且在 defineReactive 的时候会添加一个自定义 setter，当我们直接对 prop 赋值的时候会输出警告
      defineReactive(props, key, value, () => {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {

      // 第二步：调用 defineReactive 方法把每个 prop 对应的值变成响应式
      defineReactive(props, key, value)
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.

    // 第三步：在经过响应式处理后，我们会把 prop 的值添加到 vm._props 中，
    // 比如 key 为 name 的 prop，它的值保存在 vm._props.name 中，但是我们在组件中可以通过 this.name 访问到这个 prop，这就是代理做的事情。
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}
```
`initProps` 主要做 3 件事情：**校验、响应式和代理**。


- **Props 更新**

我们知道，当父组件传递给子组件的 props 值变化，子组件对应的值也会改变，同时会触发子组件的重新渲染。那么接下来我们就从源码角度来分析这两个过程。

首先，prop 数据的值变化在父组件，我们知道在父组件的 render 过程中会访问到这个 prop 数据，所以当 prop 数据变化一定会触发父组件的重新渲染，那么重新渲染是如何更新子组件对应的 prop 的值呢？

``` js
// src/core/instance/lifecycle.js

export function updateChildComponent (
  vm: Component,
  propsData: ?Object,
  listeners: ?Object,
  parentVnode: MountedComponentVNode,
  renderChildren: ?Array<VNode>
) {
  // ...

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false)
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      const propOptions: any = vm.$options.props // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm)
    }
    toggleObserving(true)
    // keep a copy of raw propsData
    vm.$options.propsData = propsData
  }

  //...
}
```
主要逻辑就是遍历 `propKeys`，然后执行 `props[key] = validateProp(key, propOptions, propsData, vm)` 重新验证和计算新的 `prop` 数据，更新 `vm._props`，也就是子组件的 props，这个就是子组件 props 的更新过程。


#### 响应式原理图

<img class="zoom-custom-imgs" :src="$withBase('/images/code/reactive.png')" width="auto"/>



### 编译

之前我们分析过模板到真实 `DOM` 渲染的过程，中间有一个环节是把模板编译成 `render` 函数，这个过程我们把它称作**编译**。

虽然我们可以直接为组件编写 render 函数，但是编写 template 模板更加直观，也更符合我们的开发习惯。

Vue.js 提供了 2 个版本，一个是 Runtime + Compiler 的，一个是 Runtime only 的，前者是包含编译代码的，可以把编译过程放在运行时做，后者是不包含编译代码的，需要借助 webpack 的 vue-loader 事先把模板编译成 render函数。

这一章我们就来分析编译的过程，对编译过程的了解会让我们对 Vue 的指令、内置组件等有更好的理解。不过由于编译的过程是一个相对复杂的过程，我们只要求理解整体的流程、输入和输出即可，对于细节我们不必抠太细。

#### 编译入口

当我们使用 `Runtime + Compiler` 的 Vue.js，它的入口是 `src/platforms/web/entry-runtime-with-compiler.js`，看一下它对 `$mount` 函数的定义：
``` js
// src/platforms/web/entry-runtime-with-compiler.js

Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
    
    ...

    if (template) {
      // 编译的入口
      // 通过compileToFunctions方法，将template转换成render方法
      // compileToFunctions 方法就是把模板 template 编译生成 render 以及 staticRenderFns
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns
    }
  }
  return mount.call(this, el, hydrating)
}
```
`compileToFunctions` 方法就是把模板 `template` 编译生成 `render` 以及 `staticRenderFns`，它的定义在 `src/platforms/web/compiler/index.js` 中：
``` js
// src/platforms/web/compiler/index.js

import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'

// compileToFunctions 方法实际上是 createCompiler 方法的返回值，该方法接收一个编译配置参数
const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
```

接下来我们来看一下 `createCompiler` 方法的定义，在 `src/compiler/index.js` 中
``` js
// src/compiler/index.js

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// createCompiler 方法实际上是通过调用 createCompilerCreator 方法返回的，该方法传入的参数是一个函数，
// 真正的编译过程都在这个 baseCompile 函数里执行
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {

  // 1. 解析模板字符串生成 AST
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    // 2. 优化语法树
    optimize(ast, options)
  }

  // 3. 生成代码
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
```

`createCompilerCreator` 又是什么呢，它的定义在 `src/compiler/create-compiler.js` 中：
``` js
// src/compiler/create-compiler.js

// 该方法返回了一个 createCompiler 的函数，它接收一个 baseOptions 的参数，
// 返回的是一个对象，包括 compile 方法属性和 compileToFunctions 属性，
// 这个 compileToFunctions 对应的就是 $mount 函数调用的 compileToFunctions 方法
export function createCompilerCreator (baseCompile: Function): Function {
  return function createCompiler (baseOptions: CompilerOptions) {
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      ...
      const finalOptions = Object.create(baseOptions)
      // 先处理配置参数
      if (options) {
       
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      // 真正执行编译代码
      // baseCompile 在执行 createCompilerCreator 方法时作为参数传入
      const compiled = baseCompile(template.trim(), finalOptions)

      ...

      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
```

我们接下来看一下 `createCompileToFunctionFn` 方法，它的定义在 `src/compiler/to-function.js` 中：
``` js
// src/compiler/to-function.js

export function createCompileToFunctionFn (compile: Function): Function {
  const cache = Object.create(null)

  // compileToFunctions 接受三个参数
  // 编译模板 template，编译配置 options 和 Vue 实例 vm
  return function compileToFunctions (
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    options = extend({}, options)

    ...

    // compile
    // 编译
    // compile 函数在执行 createCompileToFunctionFn 的时候作为参数传入，它是 createCompiler 函数中定义的 compile 函数
    const compiled = compile(template, options) // 核心代码
    const res = {}
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })

    ...

    return (cache[key] = res)
  }
}
```
有点绕，接下来梳理下：
1. 首先在入口`src/platforms/web/entry-runtime-with-compiler.js`处，会调`compileToFunctions`方法，传入当前实例的`template,options,vm`参数，返回`render`方法；
2. 接着进入`src/platforms/web/compiler/index.js`，发现`compileToFunctions`其实是`createCompiler(baseOptions)`方法的返回值，这里`baseOptions`是基础配置，在不同平台的上各有不同；
3. 然后进到`src/compiler/index.js`，发现`createCompilerCreator`方法里面有个`baseCompile`函数；
   > `baseCompile`是基础编译，跟平台无关，所以单独封装，方便复用；会传入步骤1中的`template,options`参数，然后执行编译：
   ``` js
   // 1. 解析模板字符串生成 AST
    const ast = parse(template.trim(), options)
    if (options.optimize !== false) {
      // 2. 优化语法树
      optimize(ast, options)
    }
    // 3. 生成代码
    const code = generate(ast, options)
    return {
      ast,
      render: code.render,
      staticRenderFns: code.staticRenderFns
    }
   ```
   可以说编译的核心流程就在`baseCompile`里了，但这时候还没有执行；
4. 接着进到`src/compiler/create-compiler.js`，发现`createCompilerCreator`其实返回`createCompiler(baseOptions)`，和步骤2的传参是一样的；步骤3的`baseCompile`方法也作为参数传给`createCompilerCreator`，同时`createCompiler`方法里面封装了一个`compile`：
    > 它主要是一个执行编译的函数，先对`baseOptions`进行处理，然后执行`const compiled = baseCompile(template.trim(), finalOptions)`，调用`baseCompile`，传入当前实例的模板信息和配置参数，编译，返回编译后的信息；

    `createCompiler`会返回`return {compileToFunctions: createCompileToFunctionFn(compile)}`，`compileToFunctions`就是最开始步骤1中调用的方法，看下`createCompileToFunctionFn`方法怎么执行的；
5. 最后进入到`src/compiler/to-function.js`，发现`createCompileToFunctionFn`方法接受步骤4中传入的`compile`方法，同时也是返回`compileToFunctions`方法，该方法接受`template,options,vm`三个参数，刚好是步骤1中传入的参数，在该方法中会调用`compile`开始编译，获取编译后的信息`res = {render,staticRenderFns}`。



> 梳理完，发现编译入口逻辑可以说是相当的绕了，为什么要这个设计呢？
    
是因为 Vue.js 在不同的平台下都会有编译的过程，因此编译过程中的依赖的配置 `baseOptions` 会有所不同。而编译过程会多次执行，但这同一个平台下每一次的编译过程配置又是相同的，为了不让这些配置在每次编译过程都通过参数传入，Vue.js 利用了函数柯里化的技巧很好的实现了 baseOptions 的参数保留。同样，Vue.js 也是利用函数柯里化技巧把基础的编译过程函数抽出来，通过 createCompilerCreator(baseCompile) 的方式把真正编译的过程和其它逻辑如对编译配置处理、缓存处理等剥离开，这样的设计还是非常巧妙的。



#### parse

编译过程首先就是对模板做解析，生成 AST，它是一种抽象语法树，是对源代码的抽象语法结构的树状表现形式。在很多编译技术中，如 babel 编译 ES6 的代码都会先生成 AST。

``` js
// src/compiler/index.js

import { parse } from './parser/index'

// createCompiler 方法实际上是通过调用 createCompilerCreator 方法返回的，该方法传入的参数是一个函数，
// 真正的编译过程都在这个 baseCompile 函数里执行
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {

  // 1. 解析模板字符串生成 AST
  const ast = parse(template.trim(), options)

})
```

parse 的目标是把 template 模板字符串转换成 AST 树，它是一种用 JavaScript 对象的形式来描述整个模板。那么整个 parse 的过程是利用正则表达式顺序解析模板，当解析到开始标签、闭合标签、文本的时候都会分别执行对应的回调函数，来达到构造 AST 树的目的。



#### optimize

当我们的模板 template 经过 parse 过程后，会输出生成 AST 树，那么接下来我们需要对这颗树做优化，optimize 的逻辑是远简单于 parse 的逻辑，所以理解起来会轻松很多。

``` js
optimize(ast, options)
```

为什么要有优化过程，因为我们知道 Vue 是数据驱动，是响应式的，但是我们的模板并不是所有数据都是响应式的，也有很多数据是首次渲染后就永远不会变化的，那么这部分数据生成的 DOM 也不会变化，我们可以在 patch 的过程跳过对他们的比对。

**optimize 的过程，就是深度遍历这个 AST 树，去检测它的每一颗子树是不是静态节点，如果是静态节点则它们生成 DOM 永远不需要改变，这对运行时对模板的更新起到极大的优化作用。**



#### codegen

编译的最后一步就是把优化后的 AST 树转换成可执行的代码。

``` js
const code = generate(ast, options)
```



### 其他

前面几章我们分析了 Vue 的核心以及编译过程，除此之外，Vue 还提供了很多好用的 feature 如 `event、v-model、slot、keep-alive、transition` 等等。对他们的理解有助于我们在平时开发中更好地应用这些 feature，即使出现 bug 我们也可以很从容地应对。


#### event

我们平时开发工作中，处理组件间的通讯，原生的交互，都离不开事件。对于一个组件元素，我们不仅仅可以绑定原生的 DOM 事件，还可以绑定自定义事件，非常灵活和方便。那么接下来我们从源码角度来看看它的实现原理。


#### v-model

在 Vue 中，我们可以通过 `v-model` 来实现双向绑定，`v-model` 即可以作用在普通表单元素上，又可以作用在组件上，它其实是一个语法糖，接下来我们就来分析 `v-model` 的实现原理。


#### slot



#### kee-alive



#### transition



## 总结

### 一些问题






## 收获

1. 模块拆封过程函数柯里化的运用，比如编译部分~






## 参考

- [Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis)


<!-- 2021-10-07 -->

<fix-link label="Back" href="/code/"></fix-link>
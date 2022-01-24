---
title: Vuex源码分析
date: 2021-03-02 21:59:37
# permalink: null
categories: 
  - vue
  - code
  - vuex
tags: 
  - 源码
permalink: false # e2f4db/
---

# Vuex源码分析

<!-- [[toc]] -->

## 前言
在前端项目开发过程当中，[Vuex](https://vuex.vuejs.org/zh/)是一个专为 [Vue.js](https://cn.vuejs.org/) 应用程序开发的状态管理工具。

以下是我的Vuex源码学习记录，也是我第一次比较完整的源码阅读。

从学习到整理，爆肝一月有余，成此篇。

## Vuex的使用
> 这里简单回顾下Vuex的使用，具体可进入[官方文档](https://vuex.vuejs.org/zh/guide/)查询。

1、首先是创建`store`实例对象：
```js
// store.js
import Vue from 'vue'
import Vuex from 'vuex'

/**
 * 使用Vue.use()方法安装Vuex。
 * Vue.use(plugin)：安装插件，如果插件是一个对象，必须提供 install 方法；
 * 如果插件是一个函数，它会被作为 install 方法；install 方法调用时，会将 Vue 作为参数传入。
 * 该方法需要在调用 new Vue() 之前被调用。
 */
Vue.use(Vuex)

// 创建store实例对象，并传入参数
const store = new Vuex.Store({
    strict: process.env.NODE_ENV === 'development', // 判断是否是生产模式，若是则开启严格模式
    state: {...}, // 状态，也就是Vuex核心管理的对象
    getters: {...}, // 派生状态，对state的二次包装
    mutations: {...}, // 更改 Vuex 的 store 中的状态的唯一方法是提交 mutation，必须为同步函数
    actions: {...}, // Action 类似于 mutation，不同在于它可以执行异步操作
    modules: {...} // 传入的子模块，每个模块拥有自己的 state、getter、mutation、action、甚至是嵌套子模块
})

// 将store对象导出
export default store
```

2、然后，为Vue实例提供创建好的`store`对象：
```js
// app.js
new Vue({
  el: '#app',
  store, // 传入store
  ...
})
```

3、组件中进行使用：
```js
methods: {
  increment() {
    this.$store.commit('increment') // 调用store对象中mutations中定义的方法
    console.log(this.$store.state.count) // 获取store对象中state中定义的状态
  }
}
```
Vuex通过对需要用到的`state`状态进行集中式的全局管理，使组件间的通信变得简单清晰；

我们使用时也比较简单，在`state`中初始化状态，在`mutations`或`actions`中定义方法用于更改`state`，在组件中直接调用方法就能更新`state`，用到该`state`的组件也会同步更新。

> 在开始学习源码之前，我先整理了几个有疑惑的问题，以便更有针对性地阅读源码：

::: warning 问题：
**1、vuex中的store是怎么进行全局注入的？**<br/>
**2、vuex是怎么进行状态更改并响应的？**<br/>
**3、`this.$store.dispatch({commit, state}, payload)`调用时的第一个参数是在哪里传入的？**<br/>
**4、state的更改是如何限制的？**<br/>
:::

::: tip 特别说明
以下内容对照源码食用效果更佳，我这里所阅读源码版本为`v3.6.2`，版本更新会有些微差异，但大致逻辑应该都一样。
:::

## 源码阅读

### 源码目录结构分析
首先从github上clone下来vuex的源码：[github地址](https://github.com/vuejs/vuex)，然后打开项目，看下源码目录结构：

```js
// 这里主要分析src目录下的文件

│—— src
    │—— module    // 与模块相关的操作
    │   ├── module-collection.js   // 用于收集并注册根模块以及嵌套模块
    │   └── module.js   // 定义Module类，存储模块内的一些信息，例如: state...
    │
    ├── plugins   // 一些插件
    │   ├── devtool.js   // 开发调试插件
    │   └── logger.js    // 
    │
    ├── helpers.js       // 辅助函数，例如：mapState、mapGetters、mapMutations...
    ├── index.cjs.js     // commonjs 打包入口
    ├── index.js         // 入口文件
    ├── index.mjs        // es6 module 打包入口
    ├── mixin.js         // 将vuex实例挂载到全局Vue的$store上
    ├── store.js         // 核心文件，定义了Store类
    └── util.js          // 提供一些工具函数，例如: deepCopy、isPromise、isObject...
```

#### 入口文件index.js
首先找到入口文件`index.js`，打开：
```js
// index.js

// Store 构造函数和 install 方法
import { Store, install } from './store'
// 辅助函数
import { mapState, mapMutations, mapGetters, mapActions, createNamespacedHelpers } from './helpers'
// 插件
import createLogger from './plugins/logger'

// 默认导出一个对象
export default {
  Store,
  install, // 当执行Vue.use(Vuex)时，会调用install方法，稍后会着重分析这个方法
  version: '__VERSION__', // 版本号
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers,
  createLogger
}
...
```
回想一下，刚才我们在项目中通过`const store = new Vuex.Store({...})`来生成store实例对象，可见源码中的`Store`类应该是包含着Vuex的核心代码，那接下来，我们进入到`store.js`文件，看看里面的`Store`到底是怎样定义的~

### store.js
> 当打开store.js文件的时候，几百行完全看不懂的代码以及全英文的注释确实很容易把人劝退；冷静之后我首先把文件中展开的方法合上，细节逻辑先不看，只是梳理下Store类中代码执行的先后顺序，等到流程大致清晰之后，我再开始挨个阅读各个部分的代码。

整个`Store`类的主要逻辑其实都在它的`constructor`函数中，因此我们就从`constructor`中分步去捋逻辑、看代码。


```js {1-15}
// store.js

// 引入util中方法
import { forEachValue, isObject, isPromise, assert, partial } from './util'
let Vue // 声明Vue变量（会在install方法中赋值）

export class Store {
  // 构造函数
  constructor (options = {}) {
    // 判断是否已安装Vue
    // 若未安装Vue,但Vue已经挂载在window上，自动调用install方法进行安装
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue)
    }

    // 环境判断
    if (__DEV__) { // __DEV__ 是webpack.config.js定义的全局环境变量，有值则为开发环境
      // 断言 
      assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`) // Vue如果未安装，则提示必须先调用Vue.use(Vuex)
      assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`) // 必须提供Promise
      assert(this instanceof Store, `store must be called with the new operator.`) // 必须使用new操作符调用Store函数。
    }
  }
}
```
#### 1、install方法

这里我们先看下`install`方法里是怎么定义的，这个方法当我们在项目中执行`Vue.use(Vuex)`时也会调用：
```js
// 安装Vue，初始化vuex
// 当使用 Vue.use() 必须提供一个 install 方法,第一个参数 是Vue 构造器,所以说可以拿到 vue的一切方法和属性
export function install (_Vue) {
  if (Vue && _Vue === Vue) { // 先判断 Vue是否已安装，如果已安装，则直接提示
    if (__DEV__) {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      )
    }
    return
  }
  Vue = _Vue // 如果Vue未安装，则将传入的_Vue赋给Vue，并调用 applyMixin 方法，初始化Vuex；现在移步到 ./mixin.js 文件：
  applyMixin(Vue)
}

```
打开`mixin.js`文件：

```js
// mixin.js

export default function (Vue) {
  const version = Number(Vue.version.split('.')[0]) // 首先判断Vue版本号

  if (version >= 2) { // 2.x版本直接通过全局混入Vue.mixin的方式在beforeCreate生命周期里执行vuexInit方法
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure  注入vuex初始化流程
    // for 1.x backwards compatibility.  1.x版本向后兼容
    const _init = Vue.prototype._init // Vue原型上挂载_init方法来进行初始化
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options) // 执行_init()方法
    }
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   * vuex初始化
   * 将vuex混入到$options中
   * 通过 Vue.minxin 方法做了一个全局的混入，在每个组件 beforeCreate 生命周期时会调用 vuexInit 方法，该方法处理得非常巧妙，首先获取当前组件的 $options ，判断当前组件的 $options 上是否有 sotre ，
   * 若有则将 store 赋值给当前组件，即 this.$store ，这个一般是判断根组件的，因为只有在初始化 Vue 实例的时候我们才手动传入了 store ;
   *  若 $options 上没有 store ，则代表当前不是根组件，所以我们就去父组件上获取，并赋值给当前组件，即当前组件也可以通过 this.$store 访问到 store 实例了，
   * 这样一层一层传递下去，实现所有组件都有$store属性，这样我们就可以在任何组件中通过this.$store访问到store
   */

  function vuexInit () {
    // 获取当前组件的 $options，$options为当我们new Vue({...})初始化时传入的参数
    const options = this.$options
    // store injection  store注入
    // 若当前组件的$options上已存在store，一般是root节点，则将$options.store赋值给this.$store（一般是用于根组件的）
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    // 当前组件的$options上没有store，则获取父组件上的$store，即$options.parent.$store，并将其赋值给this.$store（一般用于子组件）
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
}
```
以上就是install方法里Vue安装和Vuex初始化的全部逻辑了，接下来继续回到`store.js`中的`constructor`函数中，`install`之后就是环境判断了：

- **环境判断**

```js {16-22}
// store.js

// 引入util中方法
import { forEachValue, isObject, isPromise, assert, partial } from './util'
let Vue // 声明Vue变量（会在install方法中赋值）

export class Store {
  // 构造函数
  constructor (options = {}) {
    // 判断是否已安装Vue
    // 若未安装Vue,但Vue已经挂载在window上，自动调用install方法进行安装
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue)
    }

    // 环境判断
    if (__DEV__) { // __DEV__ 是webpack.config.js定义的全局环境变量，有值则为开发环境
      // 断言 
      assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`) // Vue如果未安装，则提示必须先调用Vue.use(Vuex)
      assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`) // 必须提供Promise
      assert(this instanceof Store, `store must be called with the new operator.`) // 必须使用new操作符调用Store函数。
    }
  }
}
```

> 这里发现用到了`util.js`文件中的`assert`断言方法，它其实原理特别简单，就是判断传入的第一个参数`Boolean`类型是否为`true`，若不是就直接抛出第二个参数的提示文案，阻断代码后续执行；

> 其实在`util.js`里面还封装了一些其他的工具函数，这里先进入到`util.js`文件看看里面封装了哪些方法：

- **util.js**

进入到util.js文文件里面，对里面定义的工具函数加一下注释，方便之后的理解和使用~

```js
// util.js

/**
 * 查看数组中第一个匹配的元素
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */
export function find (list, f) {
  return list.filter(f)[0]
}

/**
 * 深拷贝
 * @param {*} obj 传入的复制对象
 * @param {Array<Object>} cache 缓存
 * @return {*}
 */
export function deepCopy (obj, cache = []) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 对循环嵌套的情况进行处理
  const hit = find(cache, c => c.original === obj)
  if (hit) {
    return hit.copy
  }

  // 判断是对象还是数组
  const copy = Array.isArray(obj) ? [] : {}
  cache.push({
    original: obj, // 保存原始的值
    copy // 保存复制的值
  })

  // 遍历循环数组或对象，继续取值
  Object.keys(obj).forEach(key => {
    copy[key] = deepCopy(obj[key], cache)
  })

  // 返回复制的值
  return copy
}

/**
 * forEach for object
 * 遍历对象方法封装
 */
export function forEachValue (obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key))
}

/**
 * 
 * @param {*} obj
 * 判断是否为对象，排除null 
 */

export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * 
 * @param {*} val
 * 判断是否为Promise对象 
 */

export function isPromise (val) {
  return val && typeof val.then === 'function'
}

/**
 * 断言
 * @param {*} condition 
 * @param {*} msg 
 */

export function assert (condition, msg) {
  if (!condition) throw new Error(`[vuex] ${msg}`)
}


/**
 * 保留原始参数的闭包函数
 * @param {*} fn 
 * @param {*} arg 
 */
export function partial (fn, arg) {
  return function () {
    return fn(arg)
  }
}
```
梳理完发现里面定义的方法也不多，大致包含**数据类型的判断、断言，及对数据遍历的封装**等方法。

梳理完成之后再回到`store.js`文件，继续刚才我们的流程；等到环境判断完成之后，开始进行内部变量初始化：

#### 2、内部变量初始化

```js
import ModuleCollection from './module/module-collection'

const {
      plugins = [],
      strict = false
    } = options // 生成Store类的入参

    // store internal state
    this._committing = false  // 表示提交的状态，当通过mutations方法改变state时，该状态为true，state值改变完后，该状态变为false; 在严格模式下会监听state值的改变，当改变时，_committing为false时，会发出警告，即表明state值的改变不是经过mutations的
    this._actions = Object.create(null)  // // 用于记录所有存在的actions方法名称（包括全局的和命名空间内的，且允许重复定义）
    this._actionSubscribers = []  // 存放actions方法订阅的回调函数
    this._mutations = Object.create(null) // 用于记录所有存在的的mutations方法名称（包括全局的和命名空间内的，且允许重复定义）
    this._wrappedGetters = Object.create(null)  // 收集所有模块包装后的的getters（包括全局的和命名空间内的，但不允许重复定义）
    this._modules = new ModuleCollection(options) // 根据传入的options配置，注册各个模块，此时只是注册、建立好了各个模块的关系，已经定义了各个模块的state状态，但getters、mutations等方法暂未注册
    this._modulesNamespaceMap = Object.create(null) // 存储定义了命名空间的模块
    this._subscribers = []  // 存放mutations方法订阅的回调
    this._watcherVM = new Vue()  // 用于监听state、getters，用于响应式地监测一个 getter 方法的返回值
    this._makeLocalGettersCache = Object.create(null)  // getters的本地缓存

    // bind commit and dispatch to self
    const store = this
```

这里注意到，在进行`_modules`变量初始化的时候是直接`new`一个`ModuleCollection`实例，传入的是`options`参数，这个类里面做了什么呢？带着疑问，我打开了`./module/module-collection.js`文件：

#### 3、module的递归收集

```js
// ./module/module-collection.js

import Module from './module'
import { assert, forEachValue } from '../util'

// ModuleCollection 类的工作就是将保留原来的模块关系，将每个模块封装到一个 Module 类中
// Store中调用：this._modules = new ModuleCollection(options)
export default class ModuleCollection {
  /**
   * rawRootModules为传入的options
   * const options = {
   *    state: {...},
   *    getters: {...},
   *    mutations: {...},
   *    actions: {...},
   *    modules: {
   *        module1: {..., moduleA:{...}},
   *        module2: {..., moduleB:{...}}
   *    }
   * }
   */
  constructor (rawRootModule) {
    // register root module (Vuex.Store options)
    // 注册
    // 前两个参数分别为：[] 、rawRootModule ，此时肯定是从根模块开始注册的，所以 path 里无内容，并且 rawRootModule 指向的是根模块
    this.register([], rawRootModule, false)
  }

  // 根据路径顺序，从根模块开始递归获取到我们准备添加新的模块的父模块
  // 根据传入的 path 路径，获取到我们想要的 Module 类
  get (path) {
    return path.reduce((module, key) => {
      return module.getChild(key) // 获取子模块，例：['son1','son2','son3']，根据嵌套关系，找到son3模块
    }, this.root)
  }

  // 获取模块的命名空间
  /**
  * 根据模块是否有命名空间来设定一个路径名称
  * 例如：A为父模块，B为子模块，C为子孙模块
  * 1. 若B模块命名空间为second,C模块未设定命名空间时; C模块继承了B模块的命名空间，为 second/
  * 2. 若B模块未设定命名空间, C模块命名空间为third; 则此时B模块继承的是A模块的命名空间，而C模块的命名空间路径为 third/
  * 3. 若B模块和C模块命名分别为second,third;则path传['second', 'third']，返回 second/third/
  */
  getNamespace (path) {
    let module = this.root // 默认先取根模块
    return path.reduce((namespace, key) => {
      module = module.getChild(key)
      return namespace + (module.namespaced ? key + '/' : '')
    }, '')
  }

  // 更新模块
  update (rawRootModule) {
    // 直接调用更新函数
    update([], this.root, rawRootModule)
  }

  /**
   * 
   * @param {*} path 表示模块嵌套关系， 例：['module1', 'moduleA']
   * @param {*} rawModule 传入的模块对象
   * @param {*} runtime 表示程序运行时
   */
  // 递归注册模块
  register (path, rawModule, runtime = true) {
    if (__DEV__) { // 入参格式判断
      assertRawModule(path, rawModule)
    }

    const newModule = new Module(rawModule, runtime) // 初始化一个新模块
    if (path.length === 0) { // 通过 if(path.length === 0) 判断是否为根模块，是的话就将 this.root 指向 Module
      this.root = newModule
    } else { // 子模块
      // 取父级路径：[1,2,3].slice(0,-1) = [1,2]
      // 
      const parent = this.get(path.slice(0, -1)) // 获取该模块的父模块
      parent.addChild(path[path.length - 1], newModule) // 将该模块添加到它的父模块上
    }

    // register nested modules
    // 有嵌套模块，继续注册
    if (rawModule.modules) {
       /**
       *  1. 遍历所有的子模块，并进行注册;
       *  2. 在path中存储除了根模块以外所有子模块的名称
       * 例：根模块下modules为: {
       *      moduleA:{state:{...}, getters:{...}, mutations:{...}, actions: {...}, modules: {...}},
       *      moduleB:{...}
       * }
       * 执行forEachValue后，会对modules下的每一个模块进行遍历，以moduleA为例，rawChildModule就是moduleA模块的内容，key就是'moduleA'，moduleA的注册就是 this.register(['moduleA'], rawModule.modules.moduleA, runtime)
       *  */ 
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime)
      })
    }
  }

  // 卸载
  unregister (path) {
    const parent = this.get(path.slice(0, -1))
    const key = path[path.length - 1]
    const child = parent.getChild(key)

    if (!child) {
      if (__DEV__) {
        console.warn(
          `[vuex] trying to unregister module '${key}', which is ` +
          `not registered`
        )
      }
      return
    }

    if (!child.runtime) {
      return
    }

    parent.removeChild(key)
  }

  // 判断是否已注册
  isRegistered (path) {
    const parent = this.get(path.slice(0, -1))
    const key = path[path.length - 1]

    if (parent) {
      return parent.hasChild(key) // 判断其父模块是否有这个子模块
    }

    return false
  }
}

// 更新函数
/**
 * 
 * @param {*} path ['module1', 'moduleA', ...]
 * @param {*} targetModule 根模块
 * @param {*} newModule 当前模块
 */
function update (path, targetModule, newModule) {
  if (__DEV__) {
    assertRawModule(path, newModule) // 判断当前模块参数格式是否正确
  }

  // update target module
  targetModule.update(newModule)

  // update nested modules
  if (newModule.modules) { // 更新嵌入的子模块
    for (const key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        if (__DEV__) {
          console.warn(
            `[vuex] trying to add a new module '${key}' on hot reloading, ` +
            'manual reload is needed'
          )
        }
        return
      }
      update(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      )
    }
  }
}


/**
 * 格式判断
 */
// 判断是否是function
const functionAssert = {
  assert: value => typeof value === 'function',
  expected: 'function'
}

// 判断是否是object
const objectAssert = {
  assert: value => typeof value === 'function' ||
    (typeof value === 'object' && typeof value.handler === 'function'),
  expected: 'function or object with "handler" function'
}

// 格式标准定义
const assertTypes = {
  getters: functionAssert,
  mutations: functionAssert,
  actions: objectAssert
}

// 模块格式判断：判断传入的getters,mutations,actions是否格式正确
function assertRawModule (path, rawModule) {
  Object.keys(assertTypes).forEach(key => {
    if (!rawModule[key]) return

    const assertOptions = assertTypes[key]

    // 循环遍历传入的getters,mutations,actions对象
    // 如actions中传入clearToken方法：actions: { clearToken({dispatch, commit}){...} }
    forEachValue(rawModule[key], (value, type) => {
      assert(
        assertOptions.assert(value), // 判断clearToken类型
        makeAssertionMessage(path, key, type, value, assertOptions.expected)
      )
    })
  })
}

// 格式报错提示
/** 
 *  例：path: [], key: 'actions', type: 'clearToken', value: ({dispatch, commit}) {...}, expected: 'function or object with "handler" function'
 * return 'actions should be function or object with "handler" function but "actions.cleaToken" is  "({dispatch, commit}) {...}"'
 * */ 
function makeAssertionMessage (path, key, type, value, expected) {
  let buf = `${key} should be ${expected} but "${key}.${type}"`
  if (path.length > 0) {
    buf += ` in module "${path.join('.')}"`
  }
  buf += ` is ${JSON.stringify(value)}.`
  return buf
}
```
这里面代码稍微有点多，不要着急，可以先从`constructor`开始，看看里执行了什么，发现里面就执行了一个`register`方法，那就从这个注册方法开始阅读，这里梳理了大致逻辑：
1. 调用`reigister`方法注册根模块，通过`new Module`初始化一个模块，稍后我们看下`Module`这个类里做了什么；
2. 判断是否是根模块，是则将当前模块赋值给`root`；不是则将当前模块添加到它的父模块下；
3. 如果当前模块有子`modules`，则遍历所有子模块，递归进行模块注册，重复上面的1、2步流程。

> 其实这个js里面核心的逻辑就是这个`register`方法，其他的都是自定义的辅助类方法，如：`assertRawModule`参数类型判断、`unregister`卸载，`getNamespace`获取命名空间等等；接下来我们看一下`Module`这个类里做了什么：
```js
// module.js

import { forEachValue } from '../util'

// Base data struct for store's module, package with some attribute and method
// 定义了Vuex中的 Module 类，包含了state、mutations、getters、actions、modules
export default class Module {
  constructor (rawModule, runtime) {
    this.runtime = runtime
    // Store some children item
    this._children = Object.create(null)  // 创建一个空对象，用于存放当前模块的子模块
    // Store the origin module object which passed by programmer
    this._rawModule = rawModule // 当前模块的一些信息，例如：state、mutations、getters、actions、modules
    const rawState = rawModule.state

    // Store the origin module's state
    // 函数类型 => 返回一个obj对象; 2. 直接获取到obj对象
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
  }

  // 判断该模块是否定义了namespaced，定义了则返回true; 否则返回false
  get namespaced () {
    return !!this._rawModule.namespaced
  }

  // 添加子模块，名称为key
  addChild (key, module) {
    this._children[key] = module
  }

  // 移除名称为key的子模块
  removeChild (key) {
    delete this._children[key]
  }

  // 获取名称为key的子模块
  getChild (key) {
    return this._children[key]
  }

  // 是否存在名称为key的子模块
  hasChild (key) {
    return key in this._children
  }

  // 将当前模块的命名空间更新到指定模块的命名空间中，并同时更新一下actions、mutations、getters的调用来源
  update (rawModule) {
    this._rawModule.namespaced = rawModule.namespaced
    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions
    }
    if (rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters
    }
  }

  // 遍历当前模块的所有子模块，并执行回调操作
  forEachChild (fn) {
    forEachValue(this._children, fn)
  }

  // 遍历当前模块的所有getters，并执行回调操作
  forEachGetter (fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn)
    }
  }

  // 遍历当前模块的所有actions，并执行回调操作
  forEachAction (fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn)
    }
  }

  // 遍历当前模块的所有mutations，并执行回调操作
  forEachMutation (fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn)
    }
  }
}
```
这里面定义了Vuex的`Module`类，初始化了`state`属性，提供了一些模块的操作方法。

都这里，已经大致了解了模块的递归收集原理了，现在我们继续回到`store.js`上来：

#### 4、dispath和commit方法的包装

封装替换原型中的dispatch和commit方法，将this指向当前store对象。
```js {5-12}
// bind commit and dispatch to self
    const store = this
    // 将 dispatch 和 commit 方法绑定到 Store 的实例上，避免后续使用dispatch或commit时改变了this指向
    // 这段代码首先对 Store 实例上的 dispatch 和 commit 方法进行了一层包装，即通过 call 将这两个方法的作用对象指向当前的 Store 实例，这样就能防止后续我们操作时，出现 this.$store.dispatch.call(obj, 1) 类似的情况而报错
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch (type, payload) {
      // 这里会将dispath和commit方法的this指针绑定为store
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }

```
`dispatch`是用来派发`actions`事件的，如：`this.$store.dispatch('addCount', payload)`；`commit`是用来执行`mutations`事件的，如：`this.$store.commit('addCount', payload)`；接下来我们看一下这两个方法是怎么定义的：

```js
// commit
  /**
   * @param {*} _type 事件名称
   * @param {*} _payload 载荷
   * @param {*} _options 参数
   */
  commit (_type, _payload, _options) {
    // check object-style commit
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options) // 整合参数

    // 在处理完参数以后，根据 type 从 store._mutations 上获取到 entry
    const mutation = { type, payload }
    const entry = this._mutations[type] // 查找_mutations上是否有对应的方法
    if (!entry) { // 查找不到则不执行任何操作
      if (__DEV__) {
        console.error(`[vuex] unknown mutation type: ${type}`)
      }
      return
    }
    
    
    // 专用修改state方法，其他修改state方法均是非法修改
    // 在 _withCommit 方法中遍历 entry 依次执行 mutations 方法;
    // 这是因为 Vuex 规定 state 的改变都要通过 mutations 方法，store._committing 这个属性就是用来判断当前是否处于正在调用 mutations 方法
    // 当 state 值改变时，会先去判断 store._committing 是否为 true ，若不为 true ，则表示 state 的值改变没有经过 mutations 方法，于是会打印警告⚠️ 信息
    this._withCommit(() => {
      entry.forEach(function commitIterator (handler) {
        handler(payload)
      })
    })

    // Array.slice() 浅复制，以防止订阅者同步调用unsubscribe时迭代器失效
    this._subscribers // _subscribers 存放mutations的订阅回调
      .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
      .forEach(sub => sub(mutation, this.state))

    if (
      __DEV__ &&
      options && options.silent
    ) {
      console.warn(
        `[vuex] mutation type: ${type}. Silent option has been removed. ` +
        'Use the filter functionality in the vue-devtools'
      )
    }
  }
```
`commit`中用到的`unifyObjectStyle`方法，主要是兼容`commit`和`dispatch`的两种提交方式：
```js
// unifyObjectStyle
// 整合对象，参数处理
/**
 * 
 * 使用过 Vuex 的应该都知道，commit 有两种提交方式：
 * // 第一种提交方式
      this.$store.commit('func', {num:1})

      // 第二种提交方式
      this.$store.commit({
        type: 'func',
        num: 1
      })
    其先对第一个参数进行判断是否为对象，是的话就当作对象提交风格处理，否则的话就直接返回
 */
function unifyObjectStyle (type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload
    payload = type
    type = type.type
  }

  if (__DEV__) {
    assert(typeof type === 'string', `expects string as the type, but found ${typeof type}.`)
  }

  return { type, payload, options }
}
```
再看下专门修改`state`的方法`_withCommit`：
```js
// _withCommit
/**  
   * 这个内部api是每次提交状态修改的核心源码，其逻辑很简单，在每次执行状态修改的时候，保证内部属性_committing为true，而这个属性的默认初始值为false。
   * 这样在追踪状态变化当state改变的时候，store._committing如果为false则不是通过_withCommit触发的，一律报错
   */
  _withCommit (fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }
```
最后我们再看下`dispatch`里面是如何定义的，其实和`commit`比较类似：
```js
/** 与上面的commit类似，只是这里是异步函数，需要用Promise作异步处理
   * 通过参数拿到对应注册的actions，然后promise.all执行回调，回调里则是进行commit提交。
   */
  dispatch (_type, _payload) {
    // check object-style dispatch
    const {
      type,
      payload
    } = unifyObjectStyle(_type, _payload) // 整合参数

    const action = { type, payload }
    const entry = this._actions[type] // 查找_actions上是否有对应的方法
    if (!entry) {
      if (__DEV__) {
        console.error(`[vuex] unknown action type: ${type}`)
      }
      return
    }

    try {
      this._actionSubscribers // _actionSubscribers 存放 actions 的订阅回调
        .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
        .filter(sub => sub.before)
        .forEach(sub => sub.before(action, this.state))
    } catch (e) {
      if (__DEV__) {
        console.warn(`[vuex] error in before action subscribers: `)
        console.error(e)
      }
    }

    // 其中变量 result ，先判断 entry 的长度，若大于1，则表示有多个异步方法，所以用 Promise.all 进行包裹 ; 否则直接执行 entry[0]
    const result = entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)

    // 返回Promise异步函数
    return new Promise((resolve, reject) => {
      result.then(res => {
        try {
          this._actionSubscribers
            .filter(sub => sub.after)
            .forEach(sub => sub.after(action, this.state))
        } catch (e) {
          if (__DEV__) {
            console.warn(`[vuex] error in after action subscribers: `)
            console.error(e)
          }
        }
        resolve(res)
      }, error => {
        try {
          this._actionSubscribers
            .filter(sub => sub.error)
            .forEach(sub => sub.error(action, this.state, error))
        } catch (e) {
          if (__DEV__) {
            console.warn(`[vuex] error in error action subscribers: `)
            console.error(e)
          }
        }
        reject(error)
      })
    })
  }
```
关于commit和dispatch里面订阅回调的部分，接触得不多，暂不深入，也不影响对核心源码的理解。

接着继续分析下面的流程，模块初始化已经完成，接下来，就开始比较重要的一步逻辑：**每一个模块的信息注册**。

#### 5、注册模块
```js {}
    // strict mode
    // 判断store是否为严格模式。true: 所有的state都必须经过mutations来改变
    // this.strict 是用于判断是否是严格模式。因为 vuex 中，建议所有的 state 变量的变化都必须经过 mutations 方法，因为这样才能被 devtool 所记录下来，所以在严格模式下，未经过 mutations 而直接改变了 state 的值，开发环境下会发出警告⚠️
    this.strict = strict

    // 将根模块的state赋值给state变量
    const state = this._modules.root.state
    // 1. 从根模块开始，递归注册各个模块的信息
    installModule(this, state, [], this._modules.root)
```
接下来看一下`installModule`方法怎么定义的：
```js
// installModule

/**
 * 注册完善各个模块内的信息
 * @param {*} store store实例对象
 * @param {*} rootState state属性
 * @param {*} path 模块路径
 * @param {*} module 模块
 * @param {*} hot 
 */
function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length // 是否为根模块

  /**
   * const namespace = store._modules.getNamespace(path) 是将路径 path 作为参数， 调用 ModuleCollection 类实例上的 getNamespace 方法来获取当前注册对象的命名空间的
   * 获取当前模块的命名空间，path传入['second', 'third']，返回 second/third/
   */
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  // 如果当前模块设置了namespaced 或 继承了父模块的namespaced，则在modulesNamespaceMap中存储一下当前模块
  if (module.namespaced) {
    if (store._modulesNamespaceMap[namespace] && __DEV__) { // 重复校验
      console.error(`[vuex] duplicate namespace ${namespace} for the namespaced module ${path.join('/')}`)
    }
    store._modulesNamespaceMap[namespace] = module // 存储当前模块
  }

  // set state
  // 如果不是根模块，将当前模块的state注册到其父模块的state上
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1)) // 获取当前path父模块的state
    const moduleName = path[path.length - 1] // 当前模块名称
    // 更改state
    store._withCommit(() => {
      if (__DEV__) {
        if (moduleName in parentState) { // 如果父模块中已经存在当前模块名称，则报错提示
          console.warn(
            `[vuex] state field "${moduleName}" was overridden by a module with the same name at "${path.join('.')}"`
          )
        }
      }
    
      /**
       * Vue.set: 向响应式对象中添加一个 property，并确保这个新 property 同样是响应式的，且触发视图更新。
       * 将当前模块的state注册在父模块的state上，并且是响应式的
       * 调用了 Vue 的 set 方法将当前模块的 state 响应式地添加到了父模块的 state 上，
       * 这是因为在之后我们会看到 state 会被放到一个新的 Vue 实例的 data 中，所以这里不得不使用 Vue 的 set 方法来响应式地添加
       */
      Vue.set(parentState, moduleName, module.state)
    })
  }

  /**
   * 设置当前模块的上下文context
   * 这行代码也可以说是非常核心的一段代码了，它根据命名空间为每个模块创建了一个属于该模块调用的上下文，并将该上下文赋值了给了该模块的 context 属性
   */
  const local = module.context = makeLocalContext(store, namespace, path)

  // 遍历，注册所有mutations
  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key  // 例如：first/second/mutations1
    registerMutation(store, namespacedType, mutation, local)
  })

  // 注册模块的所有actions
  module.forEachAction((action, key) => {

     /**
     * actions有两种写法：
     * 
     * actions: {
     *    AsyncAdd (context, payload) {...},   // 第一种写法
     *    AsyncDelete: {                       // 第二种写法
     *      root: true,
     *      handler: (context, payload) {...}
     *    } 
     * }
     */

    const type = action.root ? key : namespace + key  // 判断是否需要在命名空间里注册一个全局的action
    const handler = action.handler || action // 获取actions对应的函数
    registerAction(store, type, handler, local)
  })

  // 注册模块的所有getters
  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  // 递归注册子模块
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}

```
这里面的代码稍微有点多，我们按照从上往下的流程慢慢梳理，具体逻辑如下：
1. 首先判断是否是根模块，获取当前模块的`namespace`，并在`_modulesNamespaceMap`中存储当前模块；
2. 然后对非根模块进行`state`注册：通过`Vue.set()`方法将当前模块的`state`注册到其父模块的`state`上；
3. 接着是执行`const local = module.context = makeLocalContext(store, namespace, path)`生成模块调用上下文，它根据命名空间为每个模块创建了一个属于该模块调用的上下文，并将该上下文赋值了给了该模块的`context`属性，`local`这个变量存储的就是一个模块的上下文，稍后具体看下这个方法怎么实现的；
4. 模块上下文创建完成后，接下来就是通过遍历注册模块所有的`mutations 、actions 、getters`了；
5. 等到`mutations 、actions 、getters`注册完成，最后就开始遍历所有的子模块，重新调一遍`installModule`，实现对子模块的递归注册。

以上，就是`installModule`这个方法的大致处理逻辑，那接下来对刚才有疑惑的地方再具体展开一下，首先是步骤3中的`makeLocalContext`：

- 生成模块上下文、生成本地缓存
```js
/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 * 获取上下文
 */
function makeLocalContext (store, namespace, path) {
  const noNamespace = namespace === '' // 是否设置了命名空间

  // local 这个变量存储的就是一个模块的上下文,若设置了命名空间则创建一个本地的commit、dispatch方法，否则将使用全局的store
  const local = {
    /**
     * 先来看其第一个属性 dispatch ，当该模块没有设置命名空间时，调用该上下文的 dispatch 方法时会直接调用 sotre.dispatch ，即调用了根模块的 dispatch 方法 ; 
     * 而存在命名空间时，会先判断相应的命名空间，以此来决定调用哪个 dispatch 方法
     */
    dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options) // 整合入参，兼容传值方式
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) { // 判断调用 dispatch 方法时有没有传入第三个参数 {root: true} ，若有则表示调用全局根模块上对应的的 dispatch 方法
        type = namespace + type
        if (__DEV__ && !store._actions[type]) {
          console.error(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
          return
        }
      }

      return store.dispatch(type, payload)
    },

    // 大致判断逻辑同上
    commit: noNamespace ? store.commit : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) { // 若传入了第三个参数设置了root:true，则派发的是全局上对应的的mutations方法
        type = namespace + type
        if (__DEV__ && !store._mutations[type]) {
          console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
          return
        }
      }

      store.commit(type, payload, options)
    }
  }

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
   /**
   * 然后最后通过 Object.defineProperties 方法对 local 的 getters 属性和 state 属性设置了一层获取代理，等后续对其访问时，才会进行处理。
   * 例如，访问 getters 属性时，先判断是否存在命名空间，若没有，则直接返回 store.getters ; 否则的话，根据命名空间创建一个本地的 getters 缓存，根据这个缓存来获取对应的 getters
   * 如：this.$store.
   */
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? () => store.getters
        : () => makeLocalGetters(store, namespace)
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  /**
 * 
 *当存在命名空间时访问 local.getters ，首先会去 store._makeLocalGettersCache 查找是否有对应的 getters 缓存;
 * 若无命令空间，则创建一个 gettersProxy ，在 store.getters 上找到对应的 getters ，然后用 Object.defineProperty 对 gettersProxy 做一层处理;
 * 即当访问 local.getters.func 时，相当于访问了 store.getters['first/func'] ，这样做一层缓存，下一次访问该 getters 时，就不会重新遍历 store.getters 了 ; 若有缓存，则直接从缓存中获取
 */

  return local
}

// 创建本地的getters缓存
function makeLocalGetters (store, namespace) {
  // 若缓存中没有指定的getters，则创建一个新的getters缓存到__makeLocalGettersCache中
  if (!store._makeLocalGettersCache[namespace]) {
    const gettersProxy = {}
    const splitPos = namespace.length
    Object.keys(store.getters).forEach(type => {
      // skip if the target getter is not match this namespace
      // 如果store.getters中没有与namespace匹配的getters，则不进行任何操作
      if (type.slice(0, splitPos) !== namespace) return

      // extract local getter type
      // 获取本地getters名称 ?
      const localType = type.slice(splitPos)

      // Add a port to the getters proxy.
      // Define as getter property because
      // we do not want to evaluate the getters in this time.
      // 对getters添加一层代理
      Object.defineProperty(gettersProxy, localType, {
        get: () => store.getters[type],
        enumerable: true
      })
    })

    // 把代理过的getters缓存到本地
    store._makeLocalGettersCache[namespace] = gettersProxy
  }

  return store._makeLocalGettersCache[namespace]
}
```
之后便是步骤4中对模块的`mutations 、actions 、getters`进行注册：
```js
// 注册mutation
function registerMutation (store, type, handler, local) {
  // 首先根据我们传入的 type 也就是上面的 namespacedType 去 store._mutations 寻找是否有入口 entry ，若有则直接获取 ; 否则就创建一个空数组用于存储 mutations 方法
  const entry = store._mutations[type] || (store._mutations[type] = [])
  // 在获取到 entry 以后，将当前的 mutations 方法添加到 entry 末尾进行存储。其中 mutations 接收的参数有两个，即 上下文中的 state 和 我们传入的参数 payload
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload) // store是this指向，
  })

  /**
   * 从这段代码我们可以看出，整个 store 实例的所有 mutations 方法都是存储在 store._mutations 中的，并且是以键值对的形式存放的，例如：
   * store._mutations = {
        'mutations1': [function handler() {...}],
        'ModuleA/mutations2': [function handler() {...}, function handler() {...}],
        'ModuleA/ModuleB/mutations2': [function handler() {...}]
      }
   */
}


// 注册action
/**
 * 
 * 与 mutations 类似，先从 store._actions 获取入口 entry ，然后将当前的 actions 进行包装处理后添加到 entry 的末尾。 
 * actions 方法接收两个参数，即 context 和我们传入的参数 payload ，其中 context 是一个对象，里面包含了 dispatch 、commit 、getters 、state 、rootGetters 、rootState ，
 * 前4个都是在当前模块的上下文中调用的，后2个是在全局上调用的
 */
function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = []) // 通过store._actions 记录所有注册的actions
  // 接收两个参数：context（包含了上下文中的dispatch方法、commit方法、getters方法、state）、传入的参数payload
  entry.push(function wrappedActionHandler (payload) {
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload)

    /**
     * 最后对于 actions 的返回值还做了一层处理，因为 actions 规定是处理异步任务的，所以我们肯定希望其值是一个 promise 对象，这样方便后续的操作。
     * 所以这里对 actions 方法的返回值做了一个判断，如果本身就是 promise 对象，那么就直接返回 ；
     * 若不是，则包装一层 promise 对象，并将返回值 res 作为参数返回给 .then
     */
    if (!isPromise(res)) {  // 若返回值不是一个promise对象，则包装一层promise，并将返回值作为then的参数
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      return res.catch(err => {
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}

// 注册getter
/**
 * 这里发现 getters 并不像 mutations 和 actions 一样去获取一个 entry ，而是直接查看 store._wrappedGetters[type] 是否有对应的 getters ，若有，则不再重复记录 ; 
 * 否则将 getters 包装一下存在 sotre._wrappedGetters 中，其中经过包装后的 getters 接收4个参数，即 state 、getters 、rootState 、rootGetters ，
 * 前2个分别表示当前上下文中的 state 和 getters ，后2个分别表示根模块的 state 和 getters
 */
function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) { // 若记录过getters了，则不再重复记录
    if (__DEV__) {
      console.error(`[vuex] duplicate getter key: ${type}`)
    }
    return
  }

  // 在store._wrappedGetters中记录getters
  // getters 是不能重名的，并且前一个命名的不会被后一个命名的所覆盖
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}
```
以上，就是对`installModule`方法涉及到的逻辑进行的大致梳理，这应该算是vuex里面比较核心的一段逻辑，里面肯定还有一些值得深究的地方，由于篇幅原因这里不做过多阐述了。

模块注册完成之后，接下来`Vuex`又做了什么呢？我们继续看源码：
```js
    // 注册vm
    resetStoreVM(this, state)
```
#### 6、注册vm
进入到这个方法，看看里面执行了什么：
```js
// 初始化vm
/**
 * 核心内容是store._vm这样一个内部变量，本质上将注册后的state和getters作为新的数据源实例化一个Vue对象传递给store._vm，并且删除旧的store._vm；
 * 与此同时，定义store.getters.xxx=store._vm[xxx]，从而完成使用getters的正确姿势。
 * state的使用是由store内部提供了一个api，调用这个api返回store._vm.data.$$state.xxx，在更新store._vm之后，就可以访问这个模块的state。
 */
function resetStoreVM (store, state, hot) {
  const oldVm = store._vm

  // bind store public getters
  store.getters = {} // 在实例store上设置getters对象
  // reset local getters cache
  store._makeLocalGettersCache = Object.create(null) // 清空本地缓存
  const wrappedGetters = store._wrappedGetters
  const computed = {}

  // 循环所有处理过的getters，并新建computed对象进行存储，通过Object.defineProperty方法为getters对象建立属性，使得我们通过this.$store.getters.xxxgetter能够访问到该getters
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    // direct inline function use will lead to closure preserving oldVm.
    // using partial to return function with only arguments preserved in closure environment.
    computed[key] = partial(fn, store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  const silent = Vue.config.silent
  // 暂时将Vue设为静默模式，避免报出用户加载的某些插件触发的警告
  Vue.config.silent = true
  /**
   * 这个方法里主要做的就是生成一个 Vue 的实例 _vm ，然后将 store._wrappedGetters 里的 getters 以及 store.state 交给一个 _vm 托管，即将 store.state 赋值给 _vm.data.$$state ;
   * 将store._wrappedGetters 通过转化后赋值给 _vm.computed ，这样一来，state 就实现了响应式，getters 实现了类似 computed 的功能
   */
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent

  // enable strict mode for new vm
  // 开启严格模式
  if (store.strict) {
    enableStrictMode(store)
  }

  // 因为生成了新的 _vm ，所以最后通过 oldVm.$destory() 将旧的 _vm 给销毁掉了
  // 值得注意的是，其将 sotre.getters 的操作放在了这个方法里，是因为我们后续访问某个 getters 时，访问的其实是 _vm.computed 中的内容。
  // 因此，通过 Object.defineProperty 对 store.getters 进行了处理
  // 若不是初始化过程执行的该方法，将旧的组件state设置为null，强制更新所有监听者(watchers)，待更新生效，DOM更新完成后，执行vm组件的destroy方法进行销毁，减少内存的占用
  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}

```
这里会重新设置一个新的vue实例，用来保存state和getter，getters保存在计算属性中，会给getters加一层代理，这样可以通过`this.$store.getters.xxx`访问到，而且在执行getters时只传入了store参数，这个在上面的`registerGetter`已经做了处理，也是为什么我们的getters可以拿到`state getters rootState rootGetters`的原因。然后根据用户设置开启`strict`模式，如果存在`oldVm`，解除对state的引用，等dom更新后把旧的vue实例销毁。

里面在严格模式下会执行一个`enableStrictMode`方法，看看具体做了什么：
```js
// 开启严格模式：监听state的改变
// 当state改变的时候，store._committing如果为false则不是通过_withCommit触发的，一律报错
function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, () => {
    if (__DEV__) {
      assert(store._committing, `do not mutate vuex store state outside mutation handlers.`)
    }
  }, { deep: true, sync: true })
}
```
这个比较逻辑简单，就是通过`Vue`的`$watch`方法监听`this._data.$$state`的改变，如果有值改变时`store._committing`不为`true`，则说明不是通过`commit`进行更改的，一律报错。

其实到这里，`Vuex`核心部门的逻辑就已经差不多，我们已经可以通过`store.getter.某个getters` 来使用`getters`了，`mutations`和`actions`的访问其实在**dispath和commit方法的包装**那小节就已经讲过，那我们再看下是怎么访问`state`的：
```js
    // 定义了一个 get 函数，访问state，可以很清楚地看到，当我们访问 store.state 时，就是去访问 store._vm.data.$$state
  get state () {
    return this._vm._data.$$state
  }

  // 如果直接通过this.$store.state.a = 'xxx' 更改state则直接报错，只能通过commit更改
  set state (v) {
    if (__DEV__) {
      assert(false, `use store.replaceState() to explicit replace store state.`)
    }
  }

```

#### 7、插件的使用

如果我们传入自定义的插件，可通过下面的代码实现插件的调用：
```js
    // 插件的注入
    // 首先就是遍历创建 Store 类时传入的参数 Plugins ，依次调用传入的插件函数（比如我们常用的用来固化数据的 persistedState 插件，就是这里注入的）
    plugins.forEach(plugin => plugin(this))
    
    const useDevtools = options.devtools !== undefined ? options.devtools : Vue.config.devtools
    if (useDevtools) {
      // 然后就是调用 devtoolPlugin 方法啦，根据导入的路径我们去到相应的文件
      devtoolPlugin(this)
    }
```
看一下`devtoolPlugin`里面都执行了啥：
```js
const target = typeof window !== 'undefined'
  ? window
  : typeof global !== 'undefined'
    ? global
    : {}
const devtoolHook = target.__VUE_DEVTOOLS_GLOBAL_HOOK__

export default function devtoolPlugin (store) {
  if (!devtoolHook) return

  store._devtoolHook = devtoolHook

  // 1. 触发Vuex组件初始化的hook
  devtoolHook.emit('vuex:init', store)

  // 2. 提供“时空穿梭”功能，即state操作的前进和倒退
  devtoolHook.on('vuex:travel-to-state', targetState => {
    store.replaceState(targetState)
  })

  // 3. mutation被执行时，触发hook，并提供被触发的mutation函数和当前的state状态
  store.subscribe((mutation, state) => {
    devtoolHook.emit('vuex:mutation', mutation, state)
  }, { prepend: true })

  store.subscribeAction((action, state) => {
    devtoolHook.emit('vuex:action', action, state)
  }, { prepend: true })
}
```
大致就是方便开发时调试用的插件；Vuex还内置了一个`logger`插件，可以生成状态快照，有兴趣的可以自行看源码，这里不阐述了。

> 其实到这里`Store`类里面`constructor`里面执行的逻辑也梳理的差不多了，其他就是提供的一些方便使用的`api`和辅助函数。

### 其他方法

#### 1. 一些工具函数

- `mutations`和`actions`的订阅函数
```js
// mutations订阅
subscribe (fn, options) {
    return genericSubscribe(fn, this._subscribers, options)
  }

// actions订阅
  subscribeAction (fn, options) {
    const subs = typeof fn === 'function' ? { before: fn } : fn
    return genericSubscribe(subs, this._actionSubscribers, options)
  }
```

- `watch`监听函数
```js
// 监听 getter值的变化
  watch (getter, cb, options) {
    if (__DEV__) {
      assert(typeof getter === 'function', `store.watch only accepts a function.`)
    }
    return this._watcherVM.$watch(() => getter(this.state, this.getters), cb, options)
  }
```

- 注册模块、卸载模块
```js
// 注册模块
  registerModule (path, rawModule, options = {}) {
    if (typeof path === 'string') path = [path]

    if (__DEV__) {
      assert(Array.isArray(path), `module path must be a string or an Array.`)
      assert(path.length > 0, 'cannot register the root module by using registerModule.')
    }

    this._modules.register(path, rawModule)
    installModule(this, this.state, path, this._modules.get(path), options.preserveState)
    // reset store to update getters...
    resetStoreVM(this, this.state)
  }

  // 卸载模块
  unregisterModule (path) {
    if (typeof path === 'string') path = [path]

    if (__DEV__) {
      assert(Array.isArray(path), `module path must be a string or an Array.`)
    }

    this._modules.unregister(path)
    this._withCommit(() => {
      const parentState = getNestedState(this.state, path.slice(0, -1))
      Vue.delete(parentState, path[path.length - 1])
    })
    resetStore(this)
  }
```
这里简单例举了几个，想看更多的可以自己去看源码。

#### 2. 辅助函数
> 其实我们在使用`Vuex`的时候经常会用到如：`mapState、mapActions`这种辅助函数，看一下它们是在哪里定义的：
```js
// index.js
import { mapState, mapMutations, mapGetters, mapActions, createNamespacedHelpers } from './helpers'
```

找到`helpers.js`文件，这里以`mapState`函数为例：
```js
// 这里的 namespace 是一个字符串，states 是我们刚才处理好的映射变量 map
export const mapState = normalizeNamespace((namespace, states) => {
  // 首先创建一个空对象 res ，这是我们最后处理好要返回的变量;
  const res = {}
  // 然后通过 isValidMap 方法判断 map 是否符合要求，即是否是数组或对象 ;
  if (__DEV__ && !isValidMap(states)) {
    console.error('[vuex] mapState: mapper parameter must be either an Array or an Object')
  }
  // 标准化states以后对其进行 forEach 遍历，将遍历到的每一个对象经过处理后存放在 res 中，
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
      // 获取根模块的 state 、getters
      let state = this.$store.state
      let getters = this.$store.getters
      if (namespace) {
        // 调用 getModuleByNamespace 方法获取到 namespace 对应的模块 module
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        // 然后将刚才声明的变量 state 和 getters 替换成 module 对应上下文中的 state 和 getters
        state = module.context.state
        getters = module.context.getters
      }
      /**这里还做了一层处理是因为要处理两种不同的方式，例如：
       * mapState({
          foo: state => state.foo,
          bar: 'bar'
        })
       */
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})
```

```js
// 标准化命名空间，对入参做兼容处理
function normalizeNamespace (fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    return fn(namespace, map)
  }
}

// 判断是否是Map：即是否是数组或对象
function isValidMap (map) {
  return Array.isArray(map) || isObject(map)
}

// 标准化Map
// normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
// normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
function normalizeMap (map) {
  if (!isValidMap(map)) {
    return []
  }
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}

// 通过namespace获取模块
function getModuleByNamespace (store, helper, namespace) {
  // 可以看到 store._modulesNamespaceMap 终于派上了用场，在生成 Store 实例注册所有模块的时候，将带有命名空间的模块都存储在了该变量上，原来是在这里用上了
  const module = store._modulesNamespaceMap[namespace]
  if (__DEV__ && !module) {
    console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`)
  }
  return module
}
```
其他的`mapMutations、mapGetters、mapActions`跟`mapState`方法类似，这里再看下另一个常用的辅助函数`createNamespacedHelpers`：
```js
// createNamespacedHelpers
export const createNamespacedHelpers = (namespace) => ({
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
})

// 该方法是根据传入的命名空间 namespace 创建一组辅助函数,巧妙之处就是先通过 bind 函数把第一个参数先传入
// 以下为项目中使用的例子：

import { createNamespacedHelpers } from 'vuex'

const { mapState, mapActions } = createNamespacedHelpers('first/second')

export default {
  computed: {
    ...mapState({
      a: 'a',  // 相当于 first/second/a
      b: 'b',  // 相当于 first/second/b
    })
  },
  methods: {
    ...mapActions([
      'foo',      // 相当于 first/second/foo
      'bar',      // 相当于 first/second/bar
    ])
  }
}

```
看到这里，其实`Vuex`的源码学习就已经结束了！！

### 流程回顾及问题解答


::: tip 流程回顾
最后我们来梳理一下`Vuex`的源码主要做了什么：
:::

1. 首先肯定是要定义一个`install`方法，因为我们是通过`Vue.use(Vuex)`进行安装，那这个方法具体都做了什么呢？我们回顾下源码发现：先是初始化全局变量`Vue`,之后获取这个传入的`Vue`的`$options`参数里的store，最后是通过一层层往上查询的方式实现所有组件都挂载了`store`，这样我们就能在所有组件中通过`this.$store`获取生成的`Store`对象了；
> 这个方法其实也就解决了我在阅读源码之前的第一个问题：**vuex中的store是怎么进行全局注入的？**
```js
Vue.mixin({ beforeCreate: vuexInit }) // 每个组件进行混入

function vuexInit () {
    // 获取当前组件的 $options，$options为当我们new Vue({...})初始化时传入的参数
    const options = this.$options
    // store injection
    // 若当前组件的$options上已存在store，一般是root节点，则将$options.store赋值给this.$store（一般是用于根组件的）
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    // 当前组件的$options上没有store，则获取父组件上的$store，即$options.parent.$store，并将其赋值给this.$store（一般用于子组件）
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
```

2. 之后就是`Store`实例的初始化：首先是初始化一些内部变量，然后生成`ModuleCollection`实例`_module`；之后就是调用`installModule`方法，通过递归注册所有模块；
> 在installModule方法中做的内容有很多，主要是：实现子模块state的注册、生成当前模块的context属性，对当前模块的`state、getters`设置代理，并缓存getters；最后遍历注册所有的`mutations、actions、getters`，最后递归注册子模块，重复一遍。

在遍历注册`mutations、actions、getters`，发现会传入当前store作为参数，比如如下actions的注册，这也解决了我的第三个问题：**`this.$store.dispatch({commit, state}, payload)`调用时的第一个参数是在哪里传入的？**
```js
function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrappedActionHandler (payload) {
    let res = handler.call(store, // 第一个参数为this指向
    { // 第二个参数为自定义的对象，这也是为什么我们在使用时可以这样用：this.$store.dispatch({commit, state}, payload)
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload) // 第三个参数，传入的载荷
}
```
3. 之后就是调用`resetStoreVM`方法注册`vm`：对所有已经注册的`getters、state`设置代理监听，通过给store生成一个`Vue`实例`_vm`，来实现数据变化的动态更新，其实说白了还是用了`Vue`的双向数据绑定来实现数据的响应更新，这也解决了我们刚开始的第二个问题：**vuex是怎么进行状态更改并响应的？**

具体代码如下：
```js
function resetStoreVM (store, state, hot) {
  const oldVm = store._vm
  store.getters = {} // 在实例store上设置getters对象
  store._makeLocalGettersCache = Object.create(null) // 清空本地缓存
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  // 循环所有处理过的getters，并新建computed对象进行存储，通过Object.defineProperty方法为getters对象建立属性，使得我们通过this.$store.getters.xxxgetter能够访问到该getters
  forEachValue(wrappedGetters, (fn, key) => {
    computed[key] = partial(fn, store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true
    })
  })

  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
}
```
之后我们想通过`this.$store.state.xxx`访问到数据还需定义这样一个方法：
```js
get state () {
    return this._vm._data.$$state // 这样就能访问到绑定在_vm下的数据
  }
```
4. 到这里，其实主要逻辑就实现的差不多了，之后就是插件的注入，辅助函数的定义...

> 现在回头看看还有哪些问题没有解决：
::: warning state的更改是如何限制的？
答：这里其实是通过定义了一个变量`_committing`来限制state的更改，当执行commit方法时，会调用一个`_withCommit`方法将`_committing`会更改为`true`，等到commit操作完成再将`_committing`设回初始值，这样在严格模式下监听`state`的更新，只要当state变化，且`_committing`不为`true`，就意味着是非法更新，就直接报错，从而限制`state`的更改。
:::
```js
_withCommit (fn) {
    const committing = this._committing // 这个变量其实在刚才内部变量初始化的时候赋值为 false
    this._committing = true
    fn()
    this._committing = committing
  }

  // 开启严格模式：监听state的改变
// 当state改变的时候，store._committing如果为false则不是通过_withCommit触发的，一律报错
function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, () => {
    if (__DEV__) {
      assert(store._committing, `do not mutate vuex store state outside mutation handlers.`)
    }
  }, { deep: true, sync: true })
}
```


## 手写mini-Vuex

现在我们也算是对`Vuex`的源码有了一个完整的梳理，那么接下来我们试着手写一个mini版的Vuex，活学活用一下。

这里我们主要实现`Vuex`的以下两个核心逻辑：
- 数据的全局注入，`state`里面定义的数据在任意组件都能获取到；
- 状态的统一管理，实现`state、getters`数据的响应式更新；

> 这里只是一个极简版的实现，直接上代码了~
```js
// my-vuex-mini.js
let Vue;

// install
function install(_Vue) {
    if (Vue !== _Vue) Vue = _Vue; // 防止重复注册
    Vue.mixin({ // 混入，通过这样在每一个Vue组件中进行混入，就能让每一个组件都能访问到this.$store
        beforeCreate() {
            let opts = this.$options;
            // console.log('====$options',opts);
            if (opts.store) { // 根组件
                this.$store = opts.store; // 兼容函数类型
            } else { // 是子组件，则王上一级父组件找store
                this.$store = opts.parent && opts.parent.$store;
            }
        }
    });
}

// Store
class Store {
    constructor(options = {}) {
        const {
            state = {},
            getters = {},
            mutations = {},
            actions = {}
        } = options;

        // 绑定state
        this._vm = new Vue({
            data() {
                return {
                    $$state: state 
                };
            }
        });

        // 绑定getters
        this.getters = {};
        Object.keys(getters).forEach(key => {
            Object.defineProperty(this.getters, key, { // 响应式绑定getters
                get: () => getters[key](this.state)
            });
        });

        // 定义commit
        this._mutations = mutations;
        this.commit = (type, payload) => {
            this._mutations[type](this.state, payload); // 传入state
        };

        // 定义dispatch
        this._actions = actions;
        this.dispatch = (type, payload) => {
            this._actions[type](this, payload); // 传入当前store
        };
    }

    // 定义state
    get state() {
        return this._vm && this._vm.$data.$$state;
    }
}

export default {
    install,
    Store
};
```
使用：
```js
// index.js

import Vue from 'vue';
import Vuex from './my-vuex-mini';
Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        level: 'root',
        num: 1,
    },
    getters: {
        doubleCount: (state, getters) => {
            return state.num * 2;
        }
    },
    mutations: {
        changeNum(state, payload) {
            state.num = payload.num;
        },
    },
    actions: {
        async changeFn({state, commit, dispatch}, payload) {
            changeNum('updateName', payload);
        },
    },
});
var app = new Vue({
    store,
    el: '#app',
    render: h => h(App)
});

// 最后我们在任意组件中都能通过this.$store.state.xxx访问数据；
// 通过this.$store.dispatch('changeFn',{num: xxx})也能派发事件，实现num的动态响应更新
```
这里暂时未考虑模块的注册，依赖收集等逻辑，这部分我已经完善在我[github](https://github.com/verneyZhou/code-analysis/tree/master/vuex)里了，有兴趣的可以点击进行查看。

## 后记

### 遗留问题
> 在源码阅读的过程中遇到一些问题，由于时间等因素只能暂时先放在一边，这里先记录下来，等以后有时间再做梳理。
1. `commit`和`dispatch`中的订阅回调函数具体是怎么用的？
2. 模块注册中在生成`context`上下文时，有些细节还需要再次阅读熟悉
3. `_wrappedGetters`中getters的注册及本地缓存是怎么处理的？
4. 后续完善mini-vuex中的**根模块与子模块的注册**功能（已完成）。
5. vuex设计上有没有什么缺陷？可参考下这篇文章：[从源码解读 Vuex 的一些缺陷](https://mp.weixin.qq.com/s/RpbcNbLGrMWhCjcr6P4agg)

### 其他收获
> 在阅读源码的过程中，发现一些值得学习的写法：
1. `Array.reduce((pre, cur) => return fn())` 累加器的使用；
2. Vue.mixin混入实现store所有组件的注册
3. 闭包函数的运用
4. 递归实现模块的注册



## 参考
- [https://github.com/zero2one3/Vuex-Analysis](https://github.com/zero2one3/Vuex-Analysis)
- [Vuex框架原理与源码分析](https://tech.meituan.com/2017/04/27/vuex-code-analysis.html)
- [Vuex2.0源码解析](https://zhuanlan.zhihu.com/p/29982815)
- [手写一版自己的 VUEX](https://segmentfault.com/a/1190000020861804)




<!-- <fix-link label="Back" href="/code/"></fix-link> -->


<!-- 2021-03-15 -->


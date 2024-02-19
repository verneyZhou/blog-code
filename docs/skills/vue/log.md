---
title: Vue2使用技巧记录
date: 2021-06-01 23:33:23
# permalink: false # caf74d/
categories: 
  - vue
tags: 
  - vue
permalink: false # d4d7a8/
---

# Vue2使用技巧记录
> 以下用法主要适用于`vue2`项目~


## 小技巧

### Vue中重置data中的数据
``` js
Object.assign(this.$data, this.$option.data());
```
> 在当前组件实例中`$data`属性保存了当前组件的`data`对象，`$options`是当前组件实例初始化时的一些属性，其中`data`方法执行后会返回一个初始化的`data`对象。



### 给对象添加新的 property 也会触发更新
``` js
// `Object.assign(this.someObject, { a: 1, b: 2 })` // 不会触发更新
this.someObject = Object.assign({}, this.someObject, { a: 1, b: 2 }) // 会触发更新
```
> 使用 Object.assign() 添加到对象上的新 property 不会触发更新；可以用原对象与要混合进去的对象的 property 一起创建一个新的对象。

### 通过`hook`监听生命周期函数
``` js
    // 通过hook监听组件销毁钩子函数，并取消监听事件
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', resizeFn)
    })
```

### 通过`@hook`监听子组件生命周期
``` html
<!-- 父组件 -->
<child-comp @hook:created="watchChildCreated"></child-comp>
```
> 可以通过`@hook:钩子函数名`来监听子组件的所有生命周期钩子，执行顺序会在该子组件生命周期之后执行~

### `watch`深度监听
``` js
 watch: {
    formData: {
      handler(newVal, oldVal) {
        //   处理逻辑
      },
      deep: true, // 深度监听
      immediate: true, // 立即触发
    }
```

### `$attrs`和`$listeners`
> `vue2.4.0`新增[API](https://cn.vuejs.org/v2/api/#vm-attrs)
- `$attrs：` 当组件在调用时传入的属性没有在`props`里面定义时，传入的属性将被绑定到`$attrs`属性内（`class`与`style`除外，他们会挂载到组件最外层元素上）。并可通过`v-bind="$attrs"`传入到内部组件中
- `$listeners：` 当组件被调用时，外部监听的这个组件的所有事件都可以通过`$listeners`获取到。并可通过`v-on="$listeners"`传入到内部组件中。
``` vue
<!---root.vue-->
<template>
   <father name="root" @dispatch="val => dispatchFn(val)"></father>
</template>

<!---father.vue-->
<template>
    <!---使用了v-bind与v-on监听属性与事件-->
    <child v-bind="$attrs" v-on="$listeners">
    <!--其他代码不变-->
    </child>
</template>

<!---child.vue-->
<template>
    <span @click="$emit('dispatch',true)">{{name}}</span>
</template>
<script>
  export default {
      props: {
          name: ''
      }
 }
</script>
```

### `provide/inject`
> `vue2.2.0`新增[API](https://cn.vuejs.org/v2/api/#provide-inject)
- `provide`选项应该是一个对象或返回一个对象的函数。该对象包含可注入其子孙的 property。
- `inject`选项应该是一个字符串数组

这对选项需要一起使用，以允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深，并在其上下游关系成立的时间里始终生效。

``` js
// 父级组件提供 'foo'
var Provider = {
  provide: {
    foo: 'bar'
  },
  // ...
}

// 子组件注入 'foo'
var Child = {
  inject: ['foo'],
  created () {
    console.log(this.foo) // => "bar"
  }
  // ...
}
```

### 自定义组件的`v-model`
> `vue2.2.0+`新增[API](https://cn.vuejs.org/v2/guide/components-custom-events.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6%E7%9A%84-v-model)

一个组件上的`v-model`默认会利用名为`value`的`prop`和名为`input`的事件，但是像单选框、复选框等类型的输入控件可能会将`value attribute` 用于不同的目的。`model` 选项可以用来避免这样的冲突：
``` js
Vue.component('base-checkbox', {
  model: { // 通过model自定义属性名和事件名
    prop: 'checked',
    event: 'change'
  },
  props: {
    checked: Boolean
  },
  template: `
    <input
      type="checkbox"
      v-bind:checked="checked"
      v-on:change="$emit('change', $event.target.checked)"
    >
  `
})

// 使用
<base-checkbox v-model="lovingVue"></base-checkbox>
```

### `.sync`实现双向数据绑定
> `vue2.3.0+`新增的[修饰符](https://cn.vuejs.org/v2/guide/components-custom-events.html#sync-%E4%BF%AE%E9%A5%B0%E7%AC%A6)

在`Vue`中，`props`属性是单向数据传输的，有时我们需要对`prop`进行“双向绑定”。`v-model`实现了双向绑定，但有时候我们希望一个组件可以实现多个数据的“双向绑定”，而`v-model`一个组件只能有一个(`Vue3.0`可以有多个)，这时候就需要使用到`.sync`。

``` js
// 父组件
<text-document :title.sync="title"></text-document>

// text-document 组件
export default {
    // 传入title
    props: {
        title: {
            type: String,
            default: ''
        }
    }

    // 更新title
    this.$emit('update:title', newTitle)
}
```
> 注意带有`.sync`修饰符的`v-bind`不能和表达式一起使用。


### 全局注入`utils`中的方法
> 平常我们习惯把一些方法放在`utils`里面，需要时先引入，再使用；可通过全局注入的方法直接挂在到`vue`的`prototype`上，使用的时候直接用就可以~

1. 创建方法
``` js
// utils.js
class Utils {
  // 自定义一个复制文本的方法
  copyToClipboard(text, callback) {
    let copyText = document.createElement('input')
    document.body.appendChild(copyText)
    copyText.value = text
    copyText.select()
    document.execCommand('copy')
    document.body.removeChild(copyText)

    callback && callback(text);
  }
}

export default new Utils()
```
2. 全局注入
``` js
// 入口 main.js
import Utils from './utils.js'

// Init Global Utils
Vue.prototype.$utils = Utils
```

3. 使用
``` js
this.$utils.copyToClipboard(text)
```

### 局部刷新某个组件
虚拟 DOM 在渲染时候通过 key 来对比两个节点是否相同，如果 key 不相同，就会判定组件是一个新节点，从而先销毁组件，然后再重新创建新组件，这样组件内的生命周期会重新触发。
``` vue
<template>
  <component :key="renderKey" />
</template>
<script>
export default { 
  data() { 
    return { 
      renderKey: 0, 
    }
  }; 
  methods: { 
    forceRerender() { 
      this.renderKey = +new Date(); 
    } 
  } 
}
</script>
```
同理，路由也可以通过设置`key`来实现页面切换到同一个路由时页面刷新：`<router-view :key="$route.fullpath"></router-view>`



### 动态的指令参数
> 在 Vue 2.6 中提供了这样一个特性：可以动态的将指令参数传递给组件。假设你有一个组件 `<my-button>`，有时候你需要绑定一个点击事件`click`，有时候需要绑定一个双击事件 `dblclick`，这个时候你可以这么写：
``` vue
<my-button @[someEvent]="handleSomeEvent()"/>

<script>
export default {
  computed: {
    someEvent(){
      return someCondition ? "click" : "dblclick"
    }
  }
}
</script>
```

### v-cloak 解决页面闪烁问题
> 有时页面模板的数据需要异步步获取，网络不好时，会出现页面闪烁的效果；v-cloak 指令保持在元素上直到关联实例结束编译，利用它的特性，结合 CSS 的规则`[v-cloak] { display: none }` 一起可以隐藏掉未编译好的 Mustache 标签，直到实例准备完毕。[官方](https://cn.vuejs.org/v2/api/#v-cloak)

``` js
[v-cloak] {
  display: none;
}

// 不会显示，直到编译结束。
<div v-cloak>
  {{ message }}
</div>
```

### v-once 和 v-pre 提升性能
> Vue 的性能优化很大部分在编译这一块~
- Vue 提供了 v-pre 给我们去决定要不要跳过这个元素和它的子元素的编译过程，跳过大量没有指令的节点会加快编译。[官方](https://cn.vuejs.org/v2/api/#v-pre)
``` html
<span v-pre>{{ this will not be compiled }}</span>   
<!-- 显示的是{{ this will not be compiled }} -->
<span v-pre>{{msg}}</span>    
<!-- 即使data里面定义了msg这里仍然是显示的{{msg}} -->
```
- `v-once`：只渲染元素和组件一次。随后的重新渲染，元素/组件及其所有的子节点将被视为静态内容并跳过。[官方](https://cn.vuejs.org/v2/api/#v-once)
``` html
<!-- 单个元素 -->
<span v-once>This will never change: {{msg}}</span>
<!-- 有子元素 -->
<div v-once>
  <h1>comment</h1>
  <p>{{msg}}</p>
</div>
<!-- 组件 -->
<my-component v-once :comment="msg"></my-component>
<!-- `v-for` 指令-->
<ul>
  <li v-for="i in list" v-once>{{i}}</li>
</ul>
```

### errorCaptured
> 2.5.0+ 新增[生命钩子](https://cn.vuejs.org/v2/api/#errorCaptured)，当捕获一个来自子孙组件的错误时被调用。此钩子会收到三个参数：错误对象、发生错误的组件实例以及一个包含错误来源信息的字符串。此钩子可以返回 false 以阻止该错误继续向上传播。

- child.vue
``` vue
<template>
  <!-- 省略一些无关代码 -->
</template>
<script>
  export default {
    mounted () {
      // 故意把 console 写错
      consol.log('这里会报错！')
    }
  }
</script>
```

- father.vue
``` vue
<template>
  <child></child>
</template>
<script>
  import Child from './Child.vue'
  export default {
    components: [ Child ],
    /**
     * 收到三个参数：
     * 错误对象、发生错误的组件实例
     * 以及一个包含错误来源信息的字符串。
     * 此钩子可以返回 false 以阻止该错误继续向上传播。
     */
    errorCaptured (err, vm, info) {
      console.log(err)
      // -> ReferenceError: consle is not defined ...
      console.log(vm)
      // -> {_uid: 1, _isVue: true, $options: {…}, _renderProxy: o, _self: o,…}
      console.log(info)
      // -> `mounted hook`
      // 告诉我们这个错误是在 vm 组件中的 mounted 钩子中发生的
      
      // 阻止该错误继续向上传播
      return false
    }
  }
</script>
```

### Vue.config.keyCodes
> 场景:自定义按键修饰符别名，[参考](https://cn.vuejs.org/v2/api/#keyCodes)
``` js
// 将键码为 113 定义为 f2
Vue.config.keyCodes.f2 = 113;
<input type="text" @keyup.f2="add"/>
```

### img加载失败
> 有些时候后台返回图片地址不一定能打开,所以这个时候应该加一张默认图片
``` vue
<img :src="imgUrl" @error="handleError" alt="">
<script>
export default{
  data(){
    return{
      imgUrl:''
    }
  },
  methods:{
    handleError(e){
      e.target.src=reqiure('图片路径')
    }
  }
}
</script>
```

### $log 调试 template
> 遇到 template 模板渲染时 JavaScript 变量出错的问题, 可以在开发环境挂载一个 log 函数来进行调试~
``` js
// main.js
Vue.prototype.$log = window.console.log;

// 组件内部
<div>{{$log(info)}}</div>
```

### scrollBehavior管理路由滚动
> 在`SPA`项目开发中，可通过`vue-router`的`scrollBehavior`来管理组件的滚动行为；[vue-router滚动行为](https://router.vuejs.org/zh/guide/advanced/scroll-behavior.html)
``` js
const router = new VueRouter({
  routes: [...],
  scrollBehavior (to, from, savedPosition) {

    // keep-alive 返回缓存页面后记录浏览位置
    if (savedPosition && to.meta.keepAlive) {
      return savedPosition;
    }

    // 异步滚动操作
    return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ x: 0, y: 0 });
    }, 0);
    });

    // 滚动到锚点
    if (to.hash) {
      return {
        selector: to.hash
      }
    }
  }
})
```
> scrollBehavior 方法接收 to 和 from 路由对象。第三个参数 savedPosition 当且仅当 popstate 导航 (通过浏览器的 前进/后退 按钮触发) 时才可用。

### 子组件绑定原生事件
> vue中给子组件自定义一个click事件，需要在子组件通过$emit('click')触发才行。如果想在父组件中触发，那就要用到native修饰符了~

``` vue
<template>
    <div>
        <Child @click.native="test"></Child>
    </div>
</template>
<script>
    methods:{
        test(){}
    }
</script>
```


### v-for的解构

``` vue
<template>
  // 对象解构
  <li v-for="(value, key, index) in {name: 'tom', age: 12, gender: 'boy'}">
    {{index+1}}. {{key}}: {{value}}
  </li>

  // es6解构
  <li v-for="{name, age} in [{name: 'tom', age: 12}, {name: 'rose', age: 24}]">
    {{name}}: {{age}}
  </li>

  // 遍历范围
   <li v-for="n in 5">
    {{n}} // 从1开始，以指定的数字结束
  </li>
</template>
```

###  prop添加validator校验
``` js
export default {
  name: 'Image',
  props: {
    src: {
      type: String,
    },
    style: {
      type: String,
      validator: s => ['square', 'rounded'].includes(s)
    }
  }
};
```
这个验证函数接受一个prop，如果prop有效或无效，则返回true或false。


### 使用一个对象绑定多个 prop

``` vue
const post = {
  id: 1,
  title: 'My Journey with Vue'
}


<BlogPost v-bind="post" />

// 等价于
<BlogPost :id="post.id" :title="post.title" />
```


## 进阶技能


### `slot`插槽
> [官网参考](https://cn.vuejs.org/v2/guide/components-slots.html)

1. 默认插槽
``` js
// 父组件
<link-item url="/profile">
  点击跳转
</link-item>

// link-item组件
<a v-bind:href="url" class="nav-link">
  <slot>默认</slot>
</a>
```

2. 具名插槽

``` html
<!-- child-comp组件 -->
<div>
    <!-- slot 元素有一个特殊的属性：name -->
    <slot name="header"></slot>
    <!-- 不带 name 的 slot 出口会带有隐含的名字“default”。 -->
    <slot></slot> 
    <!--  -->
    <slot name="footer"></slot>

    <!-- 对于需要用容器包裹的slot, 可用$slots[name]加判断,避免渲染无效div -->
    <div v-if="$slots.btn">
      <slot name="btn"></slot>
    </div>
</div>


<!-- 父组件 -->
<child-comp>
    <!-- header插槽：v-slot 是 vue2.6.0 引入的，替代之前的 slot="header" 写法 -->
  <template v-slot:header>
    <h1>Here might be a page header</h1>
  </template>

  <!-- 默认插槽 等同于 v-slot:default -->
  <template>
    <h1>Here might be a page content</h1>
  </template>

  <!-- footer插槽 -->
  <template v-slot:footer>
    <h1>Here might be a page footer</h1>
  </template>
</child-comp>
```
> 现在 `<template>` 元素中的所有内容都将会被传入相应的插槽。任何没有被包裹在带有 `v-slot` 的 `<template>` 中的内容都会被视为默认插槽的内容。

`vue2.6.0`之后可以用`#`缩写具名插槽：
``` html
<!-- 缩写 v-slot:header -->
<template #header>
    <h1>Here might be a page title</h1>
  </template>
```

3. 作用域插槽
> 作用域插槽是为了让父组件中的插槽能够访问到子组件中的数据。

``` html
<!-- child-comp组件 -->
<div>
    <!-- 通过v-bind 可以向外传递参数 -->
    <slot name="header" v-bind:user="{name: 'tom', age: 22}"></slot>
</div>

<!-- 父组件 -->
<child-comp>
    <!-- 通过v-slot="scope"可以获取组件内部通过v-bind传的值 -->
    <!-- 当只有默认插槽时可以直接 v-slot="scope"  -->
    <!-- vue2.6.0之前可以这样写：slot="header" slot-scope="scope" -->
  <template v-slot:header="scope">
    <h1>{{scope.user.name}}</h1>
  </template>
</child-comp>

```
> `v-slot:header="scope"`可进行解构，如：`v-slot="{ user }"`


4. 递归插槽实现v-for组件

- 常规递归v-for组件写法
``` vue
<!-- VFor.vue -->
<template>
    <div>
        <!--  渲染第一项 -->
    {{ list[0] }}
        <!-- 如果我们有更多的项目，继续!但是不要使用我们刚刚渲染的项 -->
    <v-for
      v-if="list.length > 1"
            :list="list.slice(1)"
        />
    </div>
</template>


<!-- 使用 -->
<template>
  <v-for :list="list" />
</template>
```

- 递归插槽实现
``` vue
<!-- VFor.vue -->
<template>
  <div>
    <!-- Pass the item into the slot to be rendered -->
    <slot v-bind:item="list[0]">
      <!-- Default -->
      {{ list[0] }}
    </slot>

    <v-for
      v-if="list.length > 1"
      :list="list.slice(1)"
    >
      <!-- Recursively pass down scoped slot -->
      <template v-slot="{ item }">
        <slot v-bind:item="item" />
      </template>
    </v-for>
  </div>
</template>


<!--使用-->
<template >
     <v-for :list="list">
        <template v-slot="{ item }">
          <strong>{{ item }}</strong>
        </template>
    </v-for>
</template>
```



### 函数式组件
> 函数式组件为没有内部状态，没有生命周期钩子函数，没有this(不需要实例化的组件)。常用于进行纯静态渲染，没有js交互的场景。
- **写法一：**
``` vue
<template functional>
    <div class="topic">
        <span class="mr-r-10">#{{props.item.topicName}}</span>
        <div v-if="props.type === 'comment'" class="time">{{props.item.addTime}}</div>
        <slot></slot>
    </div>
</template>
```

- **写法二：**
``` js
export default {
  // 通过配置functional属性指定组件为函数式组件
  functional: true,
  // 组件接收的外部属性
  props: {
    avatar: {
      type: String
    }
  },
  /**
   * 渲染函数
   * @param {*} h
   * @param {*} context 函数式组件没有this, props, slots等都在context上面挂着
   */
  render(h, context) {
    const { props } = context
    if (props.avatar) {
      return <img src={props.avatar}></img>
    }
    return <img src="default-avatar.png"></img>
  }
}
```
> 函数式组件不需要实例化，无状态，没有生命周期，所以渲染性能要好于普通组件。

::: tip 函数式组件与普通组件的区别
- 函数式组件需要在声明组件是指定`functional`；
- 函数式组件不需要实例化，所以没有`this`,`this`通过`render`函数的第二个参数`context`来代替；
- 函数式组件没有生命周期钩子函数，不能使用计算属性，`watch`等等；
- 函数式组件不能通过`$emit`对外暴露事件，调用事件只能通过`context.listeners.click`的方式调用外部传入的事件；
- 因为函数式组件是没有实例化的，所以在外部通过`ref`去引用组件时，实际引用的是`HTMLElement`
- 函数式组件的`props`可以不用显示声明，所以没有在`props`里面声明的属性都会被自动隐式解析为`prop`,而普通组件所有未声明的属性都被解析到`$attrs`里面，并自动挂载到组件根元素上面(可以通过`inheritAttrs`属性禁止)
:::




### `Vue.extend`开发插件
> 直接上完整代码吧~
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>vue test</title>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
    <style>
        #loading-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,.7);
            color: #fff;
        }
    </style>
</head>
<body>
    <div id="root">
            <p>extend进阶用法</p>
            <button @click="showLoading">显示Loading</button>
    </div>
    <script>

        // 1.通过Vue.extend创建一个组件的构造函数LoadingComponent
        const LoadingComponent = Vue.extend({
            template: '<div id="loading-wrapper">{{msg}}</div>',
            props: {
                msg: {
                type: String,
                default: 'msg'
                }
            }
        }, 'LoadingComponent');

        // 2.定义Loading方法
        function Loading(msg) {
            const div = document.createElement('div');
            div.setAttribute('id', 'loading-wrapper');
            document.body.append(div);

            // 创建LoadingComponent实例，并通过$mount挂载到元素上，直接覆盖原来的loading-wrapper
            new LoadingComponent({
                props: {
                    msg: {
                        type: String,
                        default: msg
                    }
                }
            }).$mount('#loading-wrapper');

            // 执行该方法移除该dom
            return () => {
                document.body.removeChild(document.getElementById('loading-wrapper'))
            }
        }

        // 3.把Loading方法挂载到原型上面
        Vue.prototype.$loading = Loading;


        new Vue({
            el: '#root',
            methods: {
                showLoading() {
                    // 调用$loading方法
                    const hide = this.$loading('正在加载，请稍等...');
                    setTimeout(() => {
                        hide();
                    },3000)

                }
            }
        })
    
    </script>
</body>
</html>
```




### `Vue.observable`进行状态管理
> `Vue.observable`是`vue2.6`提供的新[API](https://cn.vuejs.org/v2/api/?#Vue-observable)，让一个对象可响应；在小型项目中可以用它来代替`Vuex`，实现状态管理。

1. 创建`store.js`
``` js
import Vue from 'vue';

// 通过Vue.observable创建一个可响应的对象
const state = Vue.observable({
    count: 0,
})

// 定义 mutations, 修改属性
const mutations = {
    setState(params) {
        state[params.type] = params.value;
    }
}

export {
    state,
    mutations
}
``` 

2. 组件中引用
``` vue
<template>
  <div>
    {{count}}
    <button @click="change">add</button>
  </div>
</template>
<script>
import { state, mutations } from '../store'
export default {
  computed: {
    count() {
      return state.count
    }
  },
    methods: {
        change() {
            mutation.setState({type: 'count', value: state.count += 1})
        }
    }
}
</script>
```




### `$dispatch`和`$broadcast`通信
> `$dispatch`和`$broadcast`是Vue1.0提供的一种[方式](https://cn.vuejs.org/v2/guide/migration.html#dispatch-%E5%92%8C-broadcast-%E6%9B%BF%E6%8D%A2)，在Vue2.0中废弃了。

- **$dispatch:** `$dispatch`会向上触发一个事件，同时传递要触发的祖先组件的名称与参数，当事件向上传递到对应的组件上时会触发组件上的事件侦听器，同时传播会停止。

- **$broadcast:** `$broadcast`会向所有的后代组件传播一个事件，同时传递要触发的后代组件的名称与参数，当事件传递到对应的后代组件时，会触发组件上的事件侦听器，同时传播会停止（因为向下传递是树形的，所以只会停止其中一个叶子分支的传递）。

这里手动实现下`$dispatch`和`$broadcast`。

1. 创建
``` js
// mixins/emitter.js

/**
 *  broadcast 向下传播事件
 * @param {*} eventName 事件名称
 * @param {*} componentName 要触发组件的名称
 * @param  {...any} params 传递的参数
 */
function broadcast(componentName, eventName, params) {
    // 遍历子组件
    this.$children.forEach(child => {
        var name = child.$options.componentName || child.$options.name;
        if (name === componentName) { // 找到需要触发事件的组件名
            child.$emit.apply(child, [eventName].concat(params));
        } else { // 否则继续在子组件中递归调用broadcast
            broadcast.apply(child, [componentName, eventName].concat([params]));
        }
    });
}


/**
 * dispatch 向上派发事件
 * @param {*} eventName 事件名称
 * @param {*} componentName 接收事件的组件名称
 * @param {...any} params 传递的参数,可以有多个
 */
function dispatch(componentName, eventName, params) {
  // 如果没有$parent, 则取$root
  var parent = this.$parent || this.$root;
  while (parent) {
    // 组件的name存储在组件的$options.componentName 上面
    const name = parent.$options.componentName || parent.$options.name
    // 如果接收事件的组件是当前组件
    if (name === componentName) {
      // 通过当前组件上面的$emit触发事件,传递事件名称与参数，跳出循环
      parent.$emit.apply(parent, [eventName].contat(params))
      break
    } else {
      // 否则继续向上判断
      parent = parent.$parent
    }
  }
}


export default {
    methods: {
        $broadcast(componentName, eventName, params) {
            broadcast.call(this, componentName, eventName, params);
        },
        $dispatch(componentName, eventName, params) {
            dispatch.call(this, componentName, eventName, params);
        },
    }
}
```

2. 应用
``` js
// Child.vue
import emitter from '@/mixins/emitter'
export default {
  name: 'Child',
  mixins: [emitter],
  mounted() {
     // 在组件渲染完之后，将组件通过$dispatch向上注册到Father组件上
    this.$dispatch('register', 'Father', this)
  },
  created() {
    // 监听刷新事件
    this.$on('refresh',(params) => {
        // 
    })
  }
}


// Father.vue
export default {
  name: 'Father',
  created() {
    this.$on('register',(component) => {
      // 处理注册逻辑
    })
  },
  methods: {
        //在需要的时候，刷新组件
        reload(params) {
            // 将refresh事件向下注册到Child组件
            this.$broadcast('refresh', 'Child', params)
        }
  }
}

```
>这种事件流方式不那么容易理解，维护成本高，且没有解决兄弟组件间的通信问题；替代方案就是使用更加简明清晰的`Vuex`和`event bus`。




### 通过`event bus`实现通信
> 通过使用事件中心，允许组件自由交流，无论组件处于组件树的哪一层。可以通过实例化一个空的 Vue 实例来实现这个目的。

1. 创建一个`eventBus`
``` js
// utils/eventBus.js
import Vue from 'vue';
const eventBus = new Vue();
export default eventBus;
```

2. 通过`$emit`分发事件
``` js
// A.vue
import eventBus from '@/utils/eventBus';
methods: {
    handleClick(el) {
        eventBus.$emit('touchClick', el.target); // 分发事件
    }
}
```
> 这样在每次执行`handleClick`事件时，都会在`eventBus`中触发这个名为`touchClick`的事件，并将`el.target`顺着事件传递出去。

3. 通过`$on、$off`实现监听和取消监听
``` js
// B.vue
import eventBus from '@/utils/eventBus';

created() {
    // 监听事件
    eventBus.$on('touchClick', res => {
        console.log(res);
    })

    // 在组件销毁前清除监听
    this.$on('hook:beforeDestroy',() => {
        eventBus.$off('touchClick');
    })
}
```
> 这样，在`A.vue`中每次执行`handleClick`事件时，就会把`el.target`传递到`B.vue`中，并打印出来。


### 使用 require.context 自动引入组件和路由、
> webpack提供的自动获取文件的方法，具体参考[官方文档](https://webpack.docschina.org/guides/dependency-management/#requirecontext)
- 用法
``` js
// 实际上是 webpack 的方法,vue 工程一般基于 webpack,所以可以使用
require.context(directory,useSubdirectories,regExp)
// 接收三个参数:
// directory：说明需要检索的目录
// useSubdirectories：是否检索子目录
// regExp: 匹配文件的正则表达式,一般是文件名
```
- 例子
``` js
///// a、自动遍历router文件夹下的.r.js文件
const allRoutes = [];
const routerContext = require.context('../router', false, /\.r\.js$/);
routerContext.keys().forEach(v => {
    const routerModule = routerContext(v);
    //  兼容 import export 和 require module.export 两种规范
    allRoutes = [...allRoutes, ...(routerModule.default || routerModule)];
});
////


// b、自动注入全局组件:只获取.g.vue类型的子文件
import Vue from 'vue';
const compsCtx = require.context('.', true, /\.g\.vue$/);
compsCtx.keys().forEach(filename => {
    const comp = compsCtx(filename).default;
    Vue.component(comp.name, comp);
});
```





### 渲染函数 & JSX
> `JSX`是一种`Javascript`的语法扩展，`JSX = Javascript + XML`，即在`Javascript`里面写`XML`，因为`JSX`的这个特性，所以他即具备了`Javascript`的灵活性，同时又兼具`html`的语义化和直观性。

[官方](https://cn.vuejs.org/v2/guide/render-function.html)

（待补充...）

### Vue中Pug模板的使用
（待补充...）




## 其他
`动态组件<component/>、混入mixins、过滤filter`等这些都是常用的，不再赘述~




## 备注
暂无~


## 参考
- [实战技巧，Vue原来还可以这样写](https://juejin.cn/post/6844904196626448391)
- [一个合格的中级前端工程师应该掌握的 20 个 Vue 技巧](https://juejin.cn/post/6872128694639394830)
- [25个 Vue 技巧,学了这么久才知道还能这么用](https://juejin.cn/post/7098688018663342111)



<fix-link label="Back" href="/skills/vue"></fix-link>
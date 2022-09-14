---
title: vue3学习笔记吐血整理
date: 2022-08-28 17:53:30
permalink: false
categories:
  - vue
  - vue3
tags:
  - vue3
---


# vue3学习笔记吐血整理

> `vue3`是20年9月左右出来，到现在快2年了，截止到目前版本已经更新到[v3.2.8](https://github.com/vuejs/core)了。前段时间用`vite+ts`做了个项目，算是vue3项目的入门实践，这次带着项目开发中遇到的问题，再次对vue3的相关知识点进行整理，也算是一次温故知新了。

- [vue v2.x官方文档](https://v2.cn.vuejs.org/)
- [vue v3.x官方文档](https://cn.vuejs.org/)


## 例子：计数器


- vue2写法

``` vue
<template>
  <div class="homePage">
    <p>count: {{ count }}</p>   
    <p>倍数： {{ multiple }}</p>        
    <div>
      <button style="margin-right: 10px" @click="increase">+1</button>
      <button @click="decrease">-1</button>    
    </div>      
  </div>
</template>
<script>
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    multiple() {
      return 2 * this.count;
    },
  },
  methods: {
    increase() {
      this.count++;
    },
    decrease() {
      this.count--;
    },
  },
};
</script>
```
> 上面代码只是实现了对count的加减以及显示倍数， 就需要分别在 data、methods、computed 中进行操作。


当这个组件的代码超过几百行时，这时增加或者修改某个需求， 就要在 `data、methods、computed 以及 mounted` 中反复的跳转。

<img class="zoom-custom-imgs" :src="$withBase('/images/vue/vue-diff01.png')" width="auto"/>

vue2.x 版本给出的解决方案就是 Mixin, 但是使用 Mixin 也会遇到让人苦恼的问题：
1. 命名冲突问题
2. 不清楚暴露出来的变量的作用
3. 逻辑重用到其他 component 经常遇到问题

Vue3.x 就推出了`Composition API`主要就是为了解决上面的问题，将零散分布的逻辑组合在一起来维护，并且还可以将单独的功能逻辑拆分成单独的文件：

<img class="zoom-custom-imgs" :src="$withBase('/images/vue/vue-diff02.png')" width="auto"/>



## 组合式API

### 什么是组合式API

**选项式 API** 以“组件实例”的概念为中心 (即上述例子中的 this)，对于有面向对象语言背景的用户来说，这通常与基于类的心智模型更为一致。同时，它将响应性相关的细节抽象出来，并强制按照选项来组织代码，从而对初学者而言更为友好。
> 使用选项式 API，我们可以用包含多个选项的对象来描述组件的逻辑，例如 data、methods 和 mounted。选项所定义的属性都会暴露在函数内部的 this 上，它会指向当前的组件实例。

[Vue2的Options API](https://v2.cn.vuejs.org/v2/api/#data)、[选项式API](https://cn.vuejs.org/api/options-state.html)

::: tip Options API
- data
- methods
- mounted
- watch
- computed
:::


**组合式 API** 的核心思想是直接在函数作用域内定义响应式状态变量，并将从多个函数中得到的状态组合起来处理复杂问题。这种形式更加自由，也需要你对 Vue 的响应式系统有更深的理解才能高效使用。相应的，它的灵活性也使得组织和重用逻辑的模式变得更加强大。
> 组合式 API (Composition API) 是一系列 API 的集合，使我们可以使用函数而不是声明选项的方式书写 Vue 组件。

[组合式API](https://cn.vuejs.org/api/composition-api-setup.html)

::: tip 它是一个概括性的术语，涵盖了以下方面的 API：
- **响应式 API**：例如 ref() 和 reactive()，使我们可以直接创建响应式状态、计算属性和侦听器。
- **生命周期钩子**：例如 onMounted() 和 onUnmounted()，使我们可以在组件各个生命周期阶段添加逻辑。
- **依赖注入**：例如 provide() 和 inject()，使我们可以在使用响应式 API 时，利用 Vue 的依赖注入系统。
:::
> 组合式 API 是 Vue 3 及 Vue 2.7 的内置功能。对于更老的 Vue 2 版本，可以使用官方维护的插件 `@vue/composition-api`。在 Vue 3 中，组合式 API 基本上都会配合 `<script setup>` 语法在单文件组件中使用。


::: tip 为什么要有组合式 API？
- **更好的逻辑复用**: 组合式 API 最基本的优势是它使我们能够通过组合函数来实现更加简洁高效的逻辑复用。
    > 在选项式 API 中我们主要的逻辑复用机制是 mixins，而组合式 API 解决了 mixins 的所有缺陷。
- **更灵活的代码组织**: 组合式 API可以将同一个逻辑关注点相关的代码归为一组：我们无需再为了一个逻辑关注点在不同的选项块间来回滚动切换。
    > 此外，我们现在可以很轻松地将这一组代码移动到一个外部文件中，不再需要为了抽象而重新组织代码，大大降低了重构成本，这在长期维护的大型项目中非常关键。
- **更好的类型推导**: 组合式 API 主要利用基本的变量和函数，它们本身就是类型友好的。用组合式 API 重写的代码可以享受到完整的类型推导，不需要书写太多类型标注。
    > 大多数时候，用 TypeScript 书写的组合式 API 代码和用 JavaScript 写都差不太多！这也让许多纯 JavaScript 用户也能从 IDE 中享受到部分类型推导功能。
- **更小的生产包体积**: 搭配` <script setup>` 使用组合式 API 比等价情况下的选项式 API 更高效，对代码压缩也更友好。
    > 这是由于 `<script setup>` 形式书写的组件模板被编译为了一个内联函数，和 `<script setup>` 中的代码位于同一作用域。不像选项式 API 需要依赖 this 上下文对象访问属性，被编译的模板可以直接访问 `<script setup>` 中定义的变量，无需一个代码实例从中代理。这对代码压缩更友好，因为本地变量的名字可以被压缩，但对象的属性名则不能。
:::


**mixin缺点**
1. 不清晰的数据来源
2. 命名空间冲突
3. 隐式的跨 mixin 交流：多个 mixin 需要依赖共享的属性名来进行相互作用，这使得它们隐性地耦合在一起
> 其实不推荐在 Vue 3 中继续使用 mixin，但还是可以继续用。



- **与选项式 API 的关系**

组合式 API 不像选项式 API 那样会手把手教你该把代码放在哪里。你应该在写组合式 API 的代码时也运用上所有普通 JavaScript 代码组织的最佳实践。如果你可以编写组织良好的 JavaScript，你也应该有能力编写组织良好的组合式 API 代码。
> 选项式 API 确实允许你在编写组件代码时“少思考”，这是许多用户喜欢它的原因。然而，在减少费神思考的同时，它也将你锁定在规定的代码组织模式中，没有摆脱的余地，这会导致在更大规模的项目中难以进行重构或提高代码质量。在这方面，组合式 API 提供了更好的长期可维护性。

选项式 API 也是 Vue 不可分割的一部分，也有很多开发者喜欢它。组合式 API 更适用于大型的项目，而对于中小型项目来说选项式 API 仍然是一个不错的选择。



[组合式 API 常见问答](https://cn.vuejs.org/guide/extras/composition-api-faq.html)


### 和 React Hooks 的对比
> Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

React Hooks 在每次组件渲染时都会调用，通过隐式地将状态挂载在当前的内部组件节点上，在下一次渲染时根据调用顺序取出。而 Vue 的 setup() 每个组件实例只会在初始化时调用一次 ，状态通过引用储存在 setup() 的闭包内。

组合式 API 提供了和 React Hooks 相同级别的逻辑组织能力，但它们之间有着一些重要的区别。

React Hooks 在组件每次更新时都会重新调用。这就产生了一些即使是经验丰富的 React 开发者也会感到困惑的问题。这也带来了一些性能问题，并且相当影响开发体验。

[和 React Hooks 的对比](https://cn.vuejs.org/guide/extras/composition-api-faq.html#comparison-with-react-hooks)






### setup

setup 是 Vue3.x 新增的一个选项， 他是组件内使用 Composition API的入口。

- 基本使用

`defineComponent`: 为了让 TypeScript 正确地推导出组件选项内的类型，我们需要通过 defineComponent() 这个全局 API 来定义组件
> defineComponent() 是在定义 Vue 组件时**提供类型推导的辅助函数**，也支持对纯 JavaScript 编写的组件进行类型推导。

``` ts
function defineComponent(
  component: ComponentOptions | ComponentOptions['setup']
): ComponentConstructor
```
> 第一个参数是一个组件选项对象。返回值将是该选项对象本身，因为该函数实际上在运行时没有任何操作，仅用于提供类型推导。


``` vue
<template>
  <button @click="count++">{{ count }}</button>
</template>

<script>
import { ref, defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)

    // 返回值会暴露给模板和其他的选项式 API 钩子
    return {
      count
    }
  },
  mounted() {
    // 请注意在模板中访问从 setup 返回的 ref 时，它会自动浅层解包，因此你无须再在模板中为它写 .value。当通过 this 访问时也会同样如此解包。
    console.log(this.count) // 0
  }
})
</script>
```
> setup() 自身并不含对组件实例的访问权，即在 setup() 中访问 this 会是 undefined。你可以在选项式 API 中访问组合式 API 暴露的值，但反过来则不行。


- `<script setup>`
> 在 setup() 函数中手动暴露大量的状态和方法非常繁琐。幸运的是，我们可以通过使用构建工具来简化该操作。当使用单文件组件（SFC）时，我们可以使用 `<script setup>` 来大幅度地简化代码。

这个 `setup attribute` 是一个标识，告诉 Vue 需要在编译时进行一些处理，让我们可以更简洁地使用组合式 API。比如，`<script setup>` 中的导入和顶层变量/函数都能够在模板中直接使用。
``` vue
<!-- 写法2 -->
<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)

onMounted(() => {
    console.log(count.value) // 0
})
</script>
```


- 执行顺序

``` vue
<template></template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
  beforeCreate() {
    console.log("----beforeCreate----");
  },
  created() {
    console.log("----created----");
  },
  setup() {
    console.log("----setup----");
  },
});

/**
 * 
----setup----
----beforeCreate----
----created----
 */
</script>
```

[vue3生命周期钩子](https://cn.vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram)


- Setup 上下文
1. setup 函数的第一个参数是组件的 `props`。和标准的组件一致，一个 setup 函数的 props 是响应式的，并且会在传入新的 props 时同步更新
2. 传入 setup 函数的第二个参数是一个 `Setup 上下文对象`。上下文对象暴露了其他一些在 setup 中可能会用到的值

``` js
import { toRefs, toRef } from 'vue'

export default {
  props: {
    title: String
  },
  setup(props, context) {

    /**
     * props
     * 如果你确实需要解构 props 对象，或者需要将某个 prop 传到一个外部函数中并保持响应性，那么你可以使用 toRefs() 和 toRef() 这两个工具函数：
     */
    console.log(props.title)
    // 将 `props` 转为一个其中全是 ref 的对象，然后解构
    const { title } = toRefs(props)
    // `title` 是一个追踪着 `props.title` 的 ref
    console.log(title.value)

    // 或者，将 `props` 的单个属性转为一个 ref
    const title = toRef(props, 'title')


    /**
     * 上下文 context
     */

    // 透传 Attributes（非响应式的对象，等价于 $attrs）
    console.log(context.attrs)

    // 插槽（非响应式的对象，等价于 $slots）
    console.log(context.slots)

    // 触发事件（函数，等价于 $emit）
    console.log(context.emit)

    // 暴露公共属性（函数）
    console.log(context.expose)
  }
}
```

- 暴露公共属性
> `expose` 函数用于显式地限制该组件暴露出的属性，当父组件通过模板引用访问该组件的实例时，将仅能访问 expose 函数暴露出的内容。
``` js
export default {
  setup(props, { expose }) {
    // 让组件实例处于 “关闭状态”
    // 即不向父组件暴露任何东西
    expose()

    const publicCount = ref(0)
    const privateCount = ref(0)
    // 有选择地暴露局部状态
    expose({ count: publicCount })
  }
}
```

使用了 `<script setup>` 的组件是默认私有的：一个父组件无法访问到一个使用了 `<script setup>` 的子组件中的任何东西，除非子组件在其中通过 `defineExpose` 宏显式暴露：
``` vue
<script setup>
import { ref } from 'vue'

const a = 1
const b = ref(2)

defineExpose({
  a,
  b
})
</script>
```
> 当父组件通过模板引用获取到了该组件的实例时，得到的实例类型为 `{ a: number, b: number }` (ref 都会自动解包，和一般的实例一样)。



- 传递Props

`defineProps` 是一个仅 `<script setup>` 中可用的编译宏命令，并不需要显式地导入。声明的 props 会自动暴露给模板。`defineProps` 会返回一个对象，其中包含了可以传递给组件的所有 props：
``` vue
<script setup>
const props = defineProps(['title'])
console.log(props.title)
</script>

<template>
  <h4>{{ title }}</h4>
</template>

<!-- 如果你没有使用 <script setup>，props 必须以 props 选项的方式声明，props 对象会作为 setup() 函数的第一个参数被传入： -->
<script>
export default {
  props: ['title'],
  setup(props) {
    console.log(props.title)
  }
}

</script>
```
传递给 defineProps() 的参数和提供给 props 选项的值是相同的，两种声明方式背后其实使用的都是 prop 选项。

[Prop 校验](https://cn.vuejs.org/guide/components/props.html#prop-validation)


- 监听事件
> 可以通过 defineEmits 宏来声明需要抛出的事件：
``` vue
<!-- 和 defineProps 类似，defineEmits 仅可用于 `<script setup>` 之中，并且不需要导入，它返回一个等同于 $emit 方法的 emit 函数。 -->
<script setup>
const emit = defineEmits(['enlarge-text'])

emit('enlarge-text')
</script>

<!-- 没有在使用 <script setup> -->
<script>
export default {
  emits: ['enlarge-text'],
  setup(props, ctx) {
    ctx.emit('enlarge-text')
  }
}
</script>
```
defineEmits() 宏不能在子函数中使用。如上所示，它必须直接放置在 `<script setup>` 的顶级作用域下。





- 与渲染函数一起使用
> setup 也可以返回一个渲染函数，此时在渲染函数中可以直接使用在同一作用域下声明的响应式状态

``` js
import { h, ref } from 'vue'

export default {
  setup(props, { expose }) {
    const count = ref(0)
    const increment = () => ++count.value

    expose({
      increment
    })

    return () => h('div', count.value)
  }
}
```


### 组合式函数

在 Vue 应用的概念中，“组合式函数”(Composables) 是一个利用 Vue 的组合式 API 来封装和复用有状态逻辑的函数。

[组合式函数](https://cn.vuejs.org/guide/reusability/composables.html)

当构建前端应用时，我们常常需要复用公共任务的逻辑。例如为了在不同地方格式化时间，我们可能会抽取一个可复用的日期格式化函数。这个函数封装了**无状态的逻辑**：它在接收一些输入后立刻返回所期望的输出。复用无状态逻辑的库有很多，比如你可能已经用过的 lodash 或是 date-fns。

- 示例：鼠标跟踪器

``` vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const x = ref(0)
const y = ref(0)

function update(event) {
  x.value = event.pageX
  y.value = event.pageY
}

onMounted(() => window.addEventListener('mousemove', update))
onUnmounted(() => window.removeEventListener('mousemove', update))
</script>

<template>Mouse position is at: {{ x }}, {{ y }}</template>
```
- 封装后：
``` js
// mouse.js
import { ref, onMounted, onUnmounted } from 'vue'

// 按照惯例，组合式函数名以“use”开头
export function useMouse() {
  // 被组合式函数封装和管理的状态
  const x = ref(0)
  const y = ref(0)

  // 组合式函数可以随时更改其状态。
  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  // 一个组合式函数也可以挂靠在所属组件的生命周期上
  // 来启动和卸载副作用
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  // 通过返回值暴露所管理的状态
  return { x, y }
}
```
- 使用：
``` vue
<script setup>
import { useMouse } from './mouse.js'

const { x, y } = useMouse()
</script>

<template>Mouse position is at: {{ x }}, {{ y }}</template>
```





## 响应式


### 响应式原理

- [vue2的响应式原理-深入响应式原理](https://v2.cn.vuejs.org/v2/guide/reactivity.html)
- [vue3的响应式原理-深入响应式系统](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)

::: tip Object.defineProperty 与 Proxy
1. `Object.defineProperty`只能劫持对象的属性， 而 `Proxy` 是直接代理对象
> 由于Object.defineProperty只能劫持对象属性，需要遍历对象的每一个属性，如果属性值也是对象，就需要递归进行深度遍历。但是 Proxy 直接代理对象， 不需要遍历操作
2. `Object.defineProperty`对新增属性需要手动进行`Observe`
> 因为`Object.defineProperty`劫持的是对象的属性，所以新增属性时，需要重新遍历对象， 对其新增属性再次使用`Object.defineProperty`进行劫持。也就是 `Vue2.x` 中给数组和对象新增属性时，需要使用`$set`才能保证新增的属性也是响应式的, `$set`内部也是通过调用`Object.defineProperty`去处理的。
:::


### 响应式API

在 Vue 中，状态都是默认深层响应式的。这意味着即使在更改深层次的对象或数组，你的改动也能被检测到。

[响应式 API：核心](https://cn.vuejs.org/api/reactivity-core.html)


#### reactive,ref



- **reactive**
> 返回一个对象的响应式代理。响应式转换是“深层”的：它会影响到所有嵌套的属性。一个响应式对象也将深层地解包任何 ref 属性，同时保持响应性。

``` js
const count = ref(1)
const obj = reactive({ count })

// ref 会被解包
console.log(obj.count === count.value) // true

// 会更新 `obj.count`
count.value++
console.log(count.value) // 2
console.log(obj.count) // 2

// 也会更新 `count` ref
obj.count++
console.log(obj.count) // 3
console.log(count.value) // 3
```

局限性：
1. 仅对对象类型有效（对象、数组和 Map、Set 这样的集合类型），而对 string、number 和 boolean 这样的 原始类型 无效。
2. 因为 Vue 的响应式系统是通过属性访问进行追踪的，因此我们必须始终保持对该响应式对象的相同引用。这意味着我们不可以随意地“替换”一个响应式对象，因为这将导致对初始引用的响应性连接丢失：
``` js
let state = reactive({ count: 0 })

// 上面的引用 ({ count: 0 }) 将不再被追踪（响应性连接已丢失！）
state = reactive({ count: 1 })
```

- **ref**

`reactive()` 的种种限制归根结底是因为 `JavaScript` 没有可以作用于所有值类型的 “引用” 机制。为此，Vue 提供了一个 `ref()` 方法来允许我们创建可以使用任何值类型的响应式 ref。
> 接受一个内部值，返回一个响应式的、可更改的 ref 对象，此对象只有一个指向其内部值的属性 .value。

> ref 对象是可更改的，也就是说你可以为 .value 赋予新的值。它也是响应式的，即所有对 .value 的操作都将被追踪


``` js
const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```

ref() 让我们能创造一种对任意值的 “引用”，并能够在不丢失响应性的前提下传递这些引用。

**ref 在模板中的解包**: 当 ref 在模板中作为顶层属性被访问时，它们会被自动“解包”，所以不需要使用 .value。
``` vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">
    {{ count }} <!-- 无需 .value -->
  </button>
</template>

```

请注意，仅当 ref 是模板渲染上下文的顶层属性时才适用自动“解包”。 例如， foo 是顶层属性，但 object.foo 不是。
``` js
const object = { foo: ref(1) }

{{ object.foo + 1 }} // [object Object], object.foo 是一个 ref 对象

const { foo } = object // 可以通过将 foo 改成顶层属性来解决这个问题
```




#### isRef,unref,toRef,toRefs

[响应式 API：工具函数](https://cn.vuejs.org/api/reactivity-utilities.html)

- `isRef()`
> 检查某个值是否为 ref。

``` ts
let foo: unknown
if (isRef(foo)) {
  // foo 的类型被收窄为了 Ref<unknown>
  foo.value
}
```

- `unref()`
> 如果参数是 ref，则返回内部值，否则返回参数本身。这是 `val = isRef(val) ? val.value : val` 计算的一个语法糖。
``` ts
function useFoo(x: number | Ref<number>) {
  const unwrapped = unref(x)
  // unwrapped 现在保证为 number 类型
}
```

- `toRef()`
> 基于响应式对象上的一个属性，创建一个对应的 ref。这样创建的 ref 与其源属性保持同步：改变源属性的值将更新 ref 的值，反之亦然。

``` ts
const state = reactive({
  foo: 1,
  bar: 2
})

const fooRef = toRef(state, 'foo')

// 更改该 ref 会更新源属性
fooRef.value++
console.log(state.foo) // 2

// 更改源属性也会更新该 ref
state.foo++
console.log(fooRef.value) // 3


/**
 * 请注意：下面这个 ref 不会和 state.foo 保持同步，因为这个 ref() 接收到的是一个纯数值。
 */
const fooRef = ref(state.foo)
```

toRef() 这个函数在你想把一个 prop 的 ref 传递给一个组合式函数时会很有用：
``` vue
<script setup>
import { toRef } from 'vue'

const props = defineProps(/* ... */)

// 将 `props.foo` 转换为 ref，然后传入
// 一个组合式函数
useSomeFeature(toRef(props, 'foo'))
</script>
```
> 即使源属性当前不存在，toRef() 也会返回一个可用的 ref。这让它在处理可选 props 的时候格外实用



- `toRefs()`
> 将一个响应式对象转换为一个普通对象，这个普通对象的每个属性都是指向源对象相应属性的 ref。每个单独的 ref 都是使用 toRef() 创建的。

``` ts
const state = reactive({
  foo: 1,
  bar: 2
})

const stateAsRefs = toRefs(state)
/*
stateAsRefs 的类型：{
  foo: Ref<number>,
  bar: Ref<number>
}
*/

// 这个 ref 和源属性已经“链接上了”
state.foo++
console.log(stateAsRefs.foo.value) // 2

stateAsRefs.foo.value++
console.log(state.foo) // 3
```

当从组合式函数中返回响应式对象时，toRefs 相当有用。使用它，消费者组件可以解构/展开返回的对象而不会失去响应性：
``` ts
function useFeatureX() {
  const state = reactive({
    foo: 1,
    bar: 2
  })

  // ...基于状态的操作逻辑

  // 在返回时都转为 ref
  return toRefs(state)
}

// 可以解构而不会失去响应性
const { foo, bar } = useFeatureX()
```
> toRefs 在调用时只会为源对象上可以枚举的属性创建 ref。如果要为可能还不存在的属性创建 ref，请改用 toRef。



#### computed,watch,watchEffect

- computed
> 接受一个 getter 函数，返回一个只读的响应式 ref 对象。

``` js
/**
 * 只读
 */
const count = ref(1)
const plusOne = computed(() => count.value + 1)

console.log(plusOne.value) // 2

plusOne.value++ // 错误


/**
 * 可写
 */
const count = ref(1)
const plusOne = computed({
  get: () => count.value + 1,
  set: (val) => {
    count.value = val - 1
  }
})

plusOne.value = 1
console.log(count.value) // 0


/**
 * TS:
 * computed() 会自动从其计算函数的返回值上推导出类型
 */
// 推导得到的类型：ComputedRef<number>
const double = computed(() => count.value * 2)
// => TS Error: Property 'split' does not exist on type 'number'
const result = double.value.split('')

// 可以通过泛型参数显式指定类型
const double = computed<number>(() => {
  // 若返回值不是 number 类型则会报错
})
```

- 计算属性值会基于其**响应式依赖**被缓存。一个计算属性仅会在其响应式依赖更新时才重新计算。
``` js
// 这也解释了为什么下面的计算属性永远不会更新，因为 Date.now() 并不是一个响应式依赖：
const now = computed(() => Date.now())
```

[参考](https://cn.vuejs.org/api/reactivity-core.html#computed)


- watch
> `watch API` 与选项式 `API this.$watch` (以及相应的 `watch` 选项) 完全等效。`watch` 需要侦听特定的数据源，并在单独的回调函数中执行副作用。默认情况下，它也是惰性的——即回调仅在侦听源发生变化时被调用。

watch() 默认是**懒侦听**的，即仅在侦听源发生变化时才执行回调函数。


``` js
const state = reactive({ count: 0 })

// 单个 reactive, 响应式对象
watch(
  () => state,
  (newValue, oldValue) => {
    // newValue === oldValue
  },
  { immediate: true, deep: true }
)

// getter 函数
watch(
  () => x.value + y.value,
  (sum) => {
    console.log(`sum of x + y is: ${sum}`)
  }
)

// 多个来源组成的数组
watch([x, () => y.value], ([newX, newY]) => {
  console.log(`x is ${newX} and y is ${newY}`)
})

/**
 * 第一个参数是侦听器的源: 它可以是一个 ref (包括计算属性)、一个响应式对象、一个 getter 函数、或多个数据源组成的数组
 * 第二个参数是在发生变化时要调用的回调函数
 * 第三个可选的参数是一个对象
 */
```

不能直接侦听响应式对象的属性值: 
``` js
const obj = reactive({ count: 0 })

// 错误，因为 watch() 得到的参数是一个 number
watch(obj.count, (count) => {
  console.log(`count is: ${count}`)
})

// 需要用一个返回该属性的 getter 函数：
watch(
  () => obj.count,
  (count) => {
    console.log(`count is: ${count}`)
  }
)
```



- watchEffect
> 立即执行传入的一个函数，同时响应式追踪其依赖，并在其依赖变更时重新运行该函数。

没有像watch一样需要先传入依赖，watchEffect会自动收集依赖, 只要指定一个回调函数。**在组件初始化时， 会先执行一次来收集依赖，然后当收集到的依赖中数据发生变化时，就会再次执行回调函数。**

``` js
const count = ref(0)

watchEffect(() => console.log(count.value))
// -> logs 0

setTimeout(() => {
  count.value++
  // -> logs 1
}, 100)
```

**停止侦听器**: 在 `setup()` 或 `<script setup>` 中用同步语句创建的侦听器，会自动绑定到宿主组件实例上，并且会在宿主组件卸载时自动停止。但如果用异步回调创建一个侦听器，那么它不会绑定到当前组件上，你必须手动停止它，以防内存泄漏。
``` vue
<script setup>
import { watchEffect } from 'vue'

// 它会自动停止
watchEffect(() => {})

// ...这个则不会！
setTimeout(() => {
  watchEffect(() => {})
}, 100)


// 手动停止一个侦听器: 
const unwatch = watchEffect(() => {})
// ...当该侦听器不再需要时
unwatch()

</script>

```


默认情况下，用户创建的侦听器回调，都会**在 Vue 组件更新之前被调用**。这意味着你在侦听器回调中访问的 DOM 将是被 Vue 更新之前的状态。

如果想在侦听器回调中能访问被 Vue 更新之后的DOM，你需要指明 `flush: 'post'` 选项：

``` ts
watch(source, callback, {
  flush: 'post'
})

watchEffect(callback, {
  flush: 'post'
})

// 后置刷新的 watchEffect() 有个更方便的别名 watchPostEffect()：
import { watchPostEffect } from 'vue'
watchPostEffect(() => {
  /* 在 Vue 更新后执行 */
})
```

[watchEffect()](https://cn.vuejs.org/api/reactivity-core.html#watcheffect)




#### 其他响应式API

[响应式 API：进阶](https://cn.vuejs.org/api/reactivity-advanced.html)

`shallowRef(), shallowReactive(), readonly(), ...`


- `shallowRef()`
> ref() 的浅层作用形式。和 ref() 不同，浅层 ref 的内部值将会原样存储和暴露，并且不会被深层递归地转为响应式。只有对 .value 的访问是响应式的。

``` ts
const state = shallowRef({ count: 1 })

// 不会触发更改
state.value.count = 2

// 会触发更改
state.value = { count: 2 }
```


- `shallowReactive()`
> reactive() 的浅层作用形式。

``` ts
const state = shallowReactive({
  foo: 1,
  nested: {
    bar: 2
  }
})

// 更改状态自身的属性是响应式的
state.foo++

// ...但下层嵌套对象不会被转为响应式
isReactive(state.nested) // false

// 不是响应式的
state.nested.bar++
```


- `readonly()`
> 接受一个对象 (不论是响应式还是普通的) 或是一个 ref，返回一个原值的只读代理。只读代理是深层的：对任何嵌套属性的访问都将是只读的。它的 ref 解包行为与 reactive() 相同，但解包得到的值是只读的。

``` ts
const original = reactive({ count: 0 })

const copy = readonly(original)

watchEffect(() => {
  // 用来做响应性追踪
  console.log(copy.count)
})

// 更改源属性会触发其依赖的侦听器
original.count++

// 更改该只读副本将会失败，并会得到一个警告
copy.count++ // warning!

```



#### 例子

1. `reactive、ref、toRef 与 toRefs`

``` vue
<template>
  <div>
    <p>第 {{ year }} 年</p>
    <p>时间：{{time.minute}} 分 {{time.second}} 秒</p>
    
    <p>姓名： {{ nickname }}</p>
    <p>年龄： {{ age }}</p>
    <p>ageRef: {{ ageRef }}</p>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, toRef, toRefs } from "vue";
export default defineComponent({
  setup() {
    const year = ref(0);
    const time = ref({minute: 0, second: 0})
    const user = reactive({ nickname: "xiaofan", age: 26, gender: "女" });
    const ageRef = toRef(user, 'age');
    setInterval(() => {
      year.value++;
      time.value.second++;
    //   time.value.minute = Math.floor(time.value.second / 60);
      user.age++;
    }, 1000);
    return {
      year,
      time,
      ageRef,
      // 使用reRefs: toRefs 用于将一个 reactive 对象转化为属性全部为 ref 对象的普通对象。
      ...toRefs(user),
    };
  },
});
</script>
```

2. `computed, watch, watchEffect`

``` vue
<template>
<div class=''>
    <p>computedAge: {{computedAge}}</p>
</div>
</template>

<script>
import { defineComponent, ref, reactive, toRefs, watchEffect, computed, watch } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({ nickname: "xiaofan", age: 20 });
    let year = ref(0)

    setInterval(() =>{
        state.age++
        year.value++
    },1000)

    const computedAge = computed(() => {
        return state.age;
    })

    watchEffect(() => {
        console.log('=====watchEffect');
        console.log(state);
        console.log(year);
      }
    );

    watch(
        () => state,
        (newVal, oldVal) => {
            console.log('=====watch', newVal, oldVal);
        },
        {deep: true, immediate: true}
    )

    return {
        ...toRefs(state),
        computedAge
    }
  },
});
</script>
```



#### 例子：计数器封装


1. 封装
``` ts
// useCount.ts

import { ref, Ref, computed } from "vue";

type CountResultProps = {
  count: Ref<number>;
  multiple: Ref<number>;
  increase: (delta?: number) => void;
  decrease: (delta?: number) => void;
};

export default function useCount(initValue = 1): CountResultProps {
  const count = ref(initValue);

  const increase = (delta?: number): void => {
    if (typeof delta !== "undefined") {
      count.value += delta;
    } else {
      count.value += 1;
    }
  };
  const multiple = computed(() => count.value * 2);

  const decrease = (delta?: number): void => {
    if (typeof delta !== "undefined") {
      count.value -= delta;
    } else {
      count.value -= 1;
    }
  };

  return {
    count,
    multiple,
    increase,
    decrease,
  };
}


// app.vue 
```

2. 使用
``` vue
<!-- app.vue -->

<template>
  <p>count: {{ count }}</p>
  <p>倍数： {{ multiple }}</p>
  <div>
    <button @click="increase()">加1</button>
    <button @click="decrease()">减一</button>
  </div>
</template>

<script lang="ts">
import useCount from "../hooks/useCount";
 setup() {
    const { count, multiple, increase, decrease } = useCount(10);
        return {
            count,
            multiple,
            increase,
            decrease,
        };
    },
</script>
```
开篇 Vue2.x 实现，分散在data,method,computed等， 如果刚接手项目，实在无法快速将data字段和method关联起来，而 Vue3 的方式可以很明确的看出，将 count 相关的逻辑聚合在一起， 看起来舒服多了， 而且`useCount`还可以扩展更多的功能。


#### 响应性语法糖

自从引入组合式 API 的概念以来，一个主要的未解决的问题就是 ref 和响应式对象到底用哪个。响应式对象存在解构丢失响应性的问题，而 ref 需要到处使用 `.value` 则感觉很繁琐，并且在没有类型系统的帮助时很容易漏掉 `.value`。

``` vue
<script setup>
// 这里的这个 $ref() 方法是一个编译时的宏命令：它不是一个真实的、在运行时会调用的方法。而是用作 Vue 编译器的标记，表明最终的 count 变量需要是一个响应式变量。
let count = $ref(0)

console.log(count)

function increment() {
  count++
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>



<!-- 编译后 -->
<script setup>
import { ref } from 'vue'

let count = ref(0)

console.log(count.value)

function increment() {
  count.value++
}

</script>
```
> 每一个会返回 ref 的响应式 API 都有一个相对应的、以 $ 为前缀的宏函数。包括以下这些 API：`ref -> $ref、computed -> $computed、shallowRef -> $shallowRef、customRef -> $customRef、toRef -> $toRef`

[响应性语法糖](https://cn.vuejs.org/guide/extras/reactivity-transform.html)



## 生命周期


- [vue2 生命周期](https://v2.cn.vuejs.org/v2/api/#beforeCreate)
- [vue3 生命周期](https://v3.cn.vuejs.org/api/options-lifecycle-hooks.html)

[组合式 API：生命周期钩子](https://cn.vuejs.org/api/composition-api-lifecycle.html)


- beforeDestroy 名称变更成 beforeUnmount; destroyed 表更为 unmounted。

- 当调用 onMounted 时，Vue 会自动将回调函数注册到当前正被初始化的组件实例上。这意味着这些钩子应当在组件初始化时被**同步注册**。例如，请不要这样做：
``` js
setTimeout(() => {
  onMounted(() => {
    // 异步注册时当前组件实例已丢失
    // 这将不会正常工作
  })
}, 100)
```




## 使用

### createApp

新的全局API`createApp`，调用返回一个应用实例, 区别于`new Vue()` 返回的根组件的实例，避免从同一个 `Vue` 构造函数创建的每个根实例共享相同的全局变量。
> 每个 Vue 应用都是通过 createApp 函数创建一个新的 应用实例。


``` js
import App from "./App.vue"; // 从一个单文件组件中导入根组件
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
// 应用实例必须在调用了 .mount() 方法后才会渲染出来,该方法接收一个“容器”参数，可以是一个实际的 DOM 元素或是一个 CSS 选择器字符串
```
> 我们传入 createApp 的对象实际上是一个组件，每个应用都需要一个“根组件”，其他组件将作为其子组件。应用根组件（App）的内容将会被渲染在容器元素里面。容器元素（`#app`）自己将不会被视为应用的一部分。

`.mount()` 方法应该始终在整个应用配置和资源注册完成后被调用。不同于其他资源注册方法，它的返回值是**根组件实例**而非应用实例。

应用实例并不只限于一个。`createApp API` 允许你在同一个页面中创建多个共存的 Vue 应用，而且每个应用都拥有自己的用于配置和全局资源的作用域。

``` js
const app1 = createApp({
  /* ... */
})
app1.mount('#container-1')

const app2 = createApp({
  /* ... */
})
app2.mount('#container-2')

```

- app.config
> 每个应用实例都会暴露一个 config 对象，其中包含了对这个应用的配置设定。[app.config](https://cn.vuejs.org/api/application.html#app-config)


- `app.config.globalProperties`
> 一个用于注册能够被应用内所有组件实例访问到的全局属性的对象。这是对 Vue 2 中 `Vue.prototype` 使用方式的一种替代。

``` js
app.config.globalProperties.msg = 'hello'

// 这使得 msg 在应用的任意组件模板上都可用，并且也可以通过任意组件实例的 this 访问到：
export default {
  mounted() {
    console.log(this.msg) // 'hello'
  }
}
```


### v-model

> 在 `vue 2.x` 中，`v-model` 是 `v-bind:value` 和 `@input="value=$event.target.value"` 的语法糖，需要使用名为 `value` 的`prop`，且一个组件上只能使用一个 `v-model` 绑定；

``` html
<input v-model="searchText" />

<!-- 等价于 -->
<input
  :value="searchText"
  @input="searchText = $event.target.value"
/>
```

`vue 3.x` 中`prop`和事件默认名称已更改，且支持多个`v-model`绑定, `value` 变为 `modelValue`; 事件 `input` 变为 `update:modelValue`：

``` html
<!-- vue2 -->
<comp v-model="value" :title:sync="titleVal" />

<!-- vue3 -->
<comp v-model:title="titleVal" v-model:name="nameVal">

<!-- comp -->
<script setup>
defineProps(['title'])
defineEmits(['update:title'])
</script>

<template>
  <input
    type="text"
    :value="title"
    @input="$emit('update:title', $event.target.value)"
  />
</template>

```

- 当使用在一个组件上时，`v-model` 会被展开为如下的形式：

``` html
<CustomInput v-model="searchText"/>

<!-- 等价于 -->
<CustomInput
  :modelValue="searchText"
  @update:modelValue="newValue => searchText = newValue"
/>


<!-- CustomInput.vue -->
<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
```

在组件内实现 v-model：
``` html
<!-- CustomInput.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <input v-model="value" />
</template>
```

- **自定义修饰符**
> 在学习输入绑定时，我们知道了 v-model 有一些内置的修饰符，例如 .trim，.number 和 .lazy。在某些场景下，你可能想要一个自定义组件的 v-model 支持自定义的修饰符。

例子：自定义的修饰符 `capitalize`: 首字母转为大写
``` html
<MyComponent v-model.capitalize="myText" />


<!-- MyComponent.vue -->
<script setup>
// 组件的 v-model 上所添加的修饰符，可以通过 modelModifiers prop 在组件内访问到
const props = defineProps({
  modelValue: String,
  modelModifiers: { default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

console.log(props.modelModifiers) // { capitalize: true }

function emitValue(e) {
  let value = e.target.value
  if (props.modelModifiers.capitalize) { // 需要大写
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }
  emit('update:modelValue', value)
}
</script>

<template>
  <input type="text" :value="modelValue" @input="emitValue" />
</template>
```

对于又有参数又有修饰符的 v-model 绑定，生成的 prop 名将是 arg + "Modifiers"。举例来说：
``` html
<MyComponent v-model:title.capitalize="myText">

<!-- MyComponent.vue -->
<script setup>
  // 相应的声明应该是：
  const props = defineProps(['title', 'titleModifiers'])
  defineEmits(['update:title'])

  console.log(props.titleModifiers) // { capitalize: true }
</script>
```
[处理 v-model 修饰符](https://cn.vuejs.org/guide/components/events.html#handling-v-model-modifiers)


### 插槽

[插槽 Slots](https://cn.vuejs.org/guide/components/slots.html)


### 依赖注入

[依赖注入](https://cn.vuejs.org/guide/components/provide-inject.html)


### 异步组件

``` vue
<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent({
  // 加载函数
  loader: () => import('./Foo.vue'),

  // 加载异步组件时使用的组件
  loadingComponent: LoadingComponent,
  // 展示加载组件前的延迟时间，默认为 200ms
  delay: 200,

  // 加载失败后展示的组件
  errorComponent: ErrorComponent,
  // 如果提供了一个 timeout 时间限制，并超时了
  // 也会显示这里配置的报错组件，默认值是：Infinity
  timeout: 3000
})
</script>

<template>
  <AsyncComp />
</template>
```

[异步组件](https://cn.vuejs.org/guide/components/async.html)



### 自定义指令

[自定义指令](https://cn.vuejs.org/guide/reusability/custom-directives.html)


### Plugin插件

[插件](https://cn.vuejs.org/guide/reusability/plugins.html)
### Transition

[Transition](https://cn.vuejs.org/guide/built-ins/transition.html)



### KeepAlive

[KeepAlive](https://cn.vuejs.org/guide/built-ins/keep-alive.html)



### 状态管理

[状态管理](https://cn.vuejs.org/guide/scaling-up/state-management.html)

- 用响应式 API 做简单状态管理

``` js
// store.js
import { reactive } from 'vue'

export const store = reactive({
  count: 0,
  increment() {
    this.count++
  }
})


// ComponentA.vue
<script setup>
import { store } from './store.js'
</script>
<template>From A: {{ store.count }}</template>



// ComponentB.vue
<script setup>
import { store } from './store.js'
</script>
<template>From B: {{ store.count }}</template>


// ComponentC.vue
<template>
  <button @click="store.increment()">
    From B: {{ store.count }}
  </button>
</template>

```
> 每当 store 对象被更改时，`<ComponentA>` 与 `<ComponentB>` 都会自动更新它们的视图。现在我们有了单一的数据源。



### 渲染函数 & JSX
> 在绝大多数情况下，Vue 推荐使用模板语法来创建应用。然而在某些使用场景下，我们真的需要用到 JavaScript 完全的编程能力。这时渲染函数就派上用场了。

[渲染函数 & JSX](https://cn.vuejs.org/guide/extras/render-function.html)

[渲染函数 API](https://cn.vuejs.org/api/render-function.html)


- **创建 Vnodes**
> Vue 提供了一个 h() 函数用于创建 vnodes
``` ts
import { h } from 'vue'

const vnode = h(
  'div', // type
  { id: 'foo', class: 'bar' }, // props
  [
    /* children */
  ]
)

vnode.type // 'div'
vnode.props // { id: 'foo', class: 'bar' }
vnode.children // []
vnode.key // null

```
`h()` 是 hyperscript 的简称——意思是“能生成 HTML (超文本标记语言) 的 JavaScript”。

``` js
// 除了类型必填以外，其他的参数都是可选的
h('div')
h('div', { id: 'foo' })

// attribute 和 property 都能在 prop 中书写
// Vue 会自动将它们分配到正确的位置
h('div', { class: 'bar', innerHTML: 'hello' })

// props modifiers such as .prop and .attr can be added
// with '.' and `^' prefixes respectively
h('div', { '.name': 'some-name', '^width': '100' })

// 类与样式可以像在模板中一样
// 用数组或对象的形式书写
h('div', { class: [foo, { bar }], style: { color: 'red' } })

// 事件监听器应以 onXxx 的形式书写
h('div', { onClick: () => {} })

// children 可以是一个字符串
h('div', { id: 'foo' }, 'hello')

// 没有 props 时可以省略不写
h('div', 'hello')
h('div', [h('span', 'hello')])

// children 数组可以同时包含 vnodes 与字符串
h('div', ['hello', h('span', 'hello')])
```

- **声明渲染函数**
> 当组合式 API 与模板一起使用时，setup() 钩子的返回值是用于暴露数据给模板。然而当我们使用渲染函数时，可以直接把渲染函数返回：

``` ts
import { ref, h } from 'vue'

export default {
  props: {
    /* ... */
  },
  setup(props) {
    const count = ref(1)

    // 返回渲染函数
    return () => h('div', props.msg + count.value)
    // 返回字符串
    return () => 'hello world!'
    // 使用数组返回多个根节点
    return () => [
      h('div'),
      h('div'),
      h('div')
    ]
  }
}
```
> 请确保返回的是一个函数而不是一个值！setup() 函数在每个组件中只会被调用一次，而返回的渲染函数将会被调用多次。


``` ts
// 使用一个工厂函数来渲染出 20 个相同的段落
function render() {
  return h(
    'div',
    Array.from({ length: 20 }).map(() => {
      return h('p', 'hi')
    })
  )
}
```


- **JSX / TSX**
> JSX 是 JavaScript 的一个类似 XML 的扩展，有了它，我们可以用以下的方式来书写代码：
``` jsx
const vnode = <div>hello</div>

// 在 JSX 表达式中，使用大括号来嵌入动态值：
const vnode = <div id={dynamicId}>hello, {userName}</div>
```

Vue 的类型定义也提供了 TSX 语法的类型推导支持。当使用 TSX 语法时，确保在 `tsconfig.json` 中配置了 `"jsx": "preserve"`，这样的 TypeScript 就能保证 Vue JSX 语法编译过程中的完整性。


几个例子：
``` html
<div>
  <div v-if="ok">yes</div>
  <span v-else>no</span>
</div>

<!-- 等同于如下渲染函数： -->
h('div', [ok.value ? h('div', 'yes') : h('span', 'no')])

<!-- 等同于如下jsx: -->
<div>{ok.value ? <div>yes</div> : <span>no</span>}</div>



<ul>
  <li v-for="{ id, text } in items" :key="id">
    {{ text }}
  </li>
</ul>
<!-- 渲染函数： -->
h(
  'ul',
  items.value.map(({ id, text }) => {
    return h('li', { key: id }, text)
  })
)
<!-- jsx: -->
<ul>
  {items.value.map(({ id, text }) => {
    return <li key={id}>{text}</li>
  })}
</ul>

```


- **渲染插槽**

``` ts
export default {
  props: ['message'],
  setup(props, { slots }) {
    return () => [
      // 默认插槽：
      // <div><slot /></div>
      h('div', slots.default()),

      // 具名插槽：
      // <div><slot name="footer" :text="message" /></div>
      h(
        'div',
        slots.footer({
          text: props.message
        })
      )
    ]
  }
}

// 等价于
// 默认插槽
<div>{slots.default()}</div>

// 具名插槽
<div>{slots.footer({ text: props.message })}</div>
```



### 函数式组件
> 函数式组件是一种定义自身没有任何状态的组件的方式。它们很像纯函数：接收 props，返回 vnodes。函数式组件在渲染过程中不会创建组件实例 (也就是说，没有 this)，也不会触发常规的组件生命周期钩子。

``` js
// 我们用一个普通的函数而不是一个选项对象来创建函数式组件。该函数实际上就是该组件的渲染函数。
function MyComponent(props, { slots, emit, attrs }) {
  // ...
}
```
大多数常规组件的配置选项在函数式组件中都不可用，除了 props 和 emits。



## Vue3 新特性

### Teleport
> `<Teleport>` 是一个内置组件，它可以将一个组件内部的一部分模板“传送”到该组件的 DOM 结构外层的位置去。

[参考](https://v3.cn.vuejs.org/guide/teleport.html)


``` vue
<!-- modal-button.vue -->
<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <button @click="open = true">Open Modal</button>

  <!-- 之前的写法 -->
  <div v-if="open" class="modal">
    <p>Hello from the modal!</p>
    <button @click="open = false">Close</button>
  </div>

  <!-- Teleport 写法 -->
  <Teleport to="body">
    <div v-if="open" class="modal">
      <p>Hello from the modal!</p>
      <button @click="open = false">Close</button>
    </div>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  z-index: 999;
  top: 20%;
  left: 50%;
  width: 300px;
  margin-left: -150px;
}
</style>
```
`<Teleport>` 接收一个 `to` prop 来指定传送的目标。to 的值可以是一个 CSS 选择器字符串，也可以是一个 DOM 元素对象。这段代码的作用就是告诉 Vue“把以下模板片段传送到 body 标签下”。
> `<Teleport>` 挂载时，传送的 to 目标必须已经存在于 DOM 中。理想情况下，这应该是整个 Vue 应用 DOM 树外部的一个元素。如果目标元素也是由 Vue 渲染的，你需要确保在挂载 `<Teleport>` 之前先挂载该元素。

`<Teleport>` 只改变了渲染的 DOM 结构，它不会影响组件间的逻辑关系。也就是说，如果 `<Teleport>` 包含了一个组件，那么该组件始终和这个使用了 `<teleport>` 的组件保持逻辑上的父子关系。传入的 props 和触发的事件也会照常工作。


### Suspense

`<Suspense>` 是一个内置组件，用来在组件树中协调对异步依赖的处理。它让我们可以在组件树上层等待下层的多个嵌套异步依赖项解析完成，并可以在等待时渲染一个加载状态。

[参考](https://cn.vuejs.org/guide/built-ins/suspense.html)


``` vue
<script>
export default {
  // 组合式 API 中组件的 setup() 钩子可以是异步的
  async setup() {
    const res = await fetch(...)
    const posts = await res.json()
    return {
      posts
    }
  }
}
</script>
<template>
  {{ posts }}
  <Suspense>
    <!-- 具有深层异步依赖的组件 -->
    <Dashboard />

    <!-- 在 #fallback 插槽中显示 “正在加载中” -->
    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```
在初始渲染时，`<Suspense>` 将在内存中渲染其默认的插槽内容。如果在这个过程中遇到任何异步依赖，则会进入挂起状态。在挂起状态期间，展示的是后备内容。当所有遇到的异步依赖都完成后，`<Suspense>` 会进入完成状态，并将展示出默认插槽的内容。

如果在初次渲染时没有遇到异步依赖，`<Suspense>` 会直接进入完成状态。

`<Suspense>` 组件会触发三个事件：`pending、resolve 和 fallback`。pending 事件是在进入挂起状态时触发。resolve 事件是在 default 插槽完成获取新内容时触发。fallback 事件则是在 fallback 插槽的内容显示时触发。



### Fragment
> 在 Vue2.x 中， template中只允许有一个根节点, 但是在 Vue3.x 中，你可以直接写多个根节点

``` vue
<!-- vue2.x -->
<template>
    <div>
        <span></span>
        <span></span>
    </div>
</template>

<!-- vue3.x -->
<template>
    <span></span>
    <span></span>
</template>
```

如果你的组件有多个根元素，你将需要指定哪个根元素来接收这个 class。你可以通过组件的 `$attrs` 属性来实现指定：

``` vue
<!-- MyComponent 模板使用 $attrs 时 -->
<p :class="$attrs.class">Hi!</p>
<span>This is a child component</span>


<!-- 父组件 -->
<MyComponent class="baz" />

<!-- 会被渲染成： -->
<p class="baz">Hi!</p>
<span>This is a child component</span>

```




## 生态


### TypeScirpt
> vue2.x中使用的都是js，vue2是支持类型的，用的是Facebook的Flow做类型检查，但是因为某些情况下推断有问题，所以改为支持ts。一个是为了更好的类型检查，另一个是拥抱ts。

像 TypeScript 这样的类型系统可以在编译时通过静态分析检测出很多常见错误。这减少了生产环境中的运行时错误，也让我们在重构大型项目的时候更有信心。通过 IDE 中基于类型的自动补全，TypeScript 还改善了开发体验和效率。

[搭配 TypeScript 使用 Vue](https://cn.vuejs.org/guide/typescript/overview.html)

[TypeScript 工具类型](https://cn.vuejs.org/api/utility-types.html)


Vue3 本身就是用 TypeScript 编写的，并对 TypeScript 提供了一等公民的支持。所有的 Vue 官方库都自带了类型声明文件，开箱即用。

要在单文件组件中使用 TypeScript，需要在 `<script>` 标签上加上 `lang="ts"` 的 attribute。当 `lang="ts"` 存在时，所有的模板内表达式都将享受到更严格的类型检查。

``` vue
<script setup lang="ts">
let x: string | number = 1
</script>

<template>
  <!-- 出错，因为 x 可能是字符串 -->
  {{ x.toFixed(2) }}
  <!-- 可以使用内联类型强制转换解决此问题： -->
  {{ (x as number).toFixed(2) }}
</template>
```

- vue-tsc
> 对于单文件组件，你可以使用工具 vue-tsc 在命令行检查类型和生成类型声明文件。vue-tsc 是对 TypeScript 自身命令行界面 tsc 的一个封装。它的工作方式基本和 tsc 一致。除了 TypeScript 文件，它还支持 Vue 的单文件组件。



- IDE 支持

强烈推荐 Visual Studio Code (VSCode)，因为它对 TypeScript 有着很好的内置支持。

Volar 是官方的 VSCode 扩展，提供了 Vue 单文件组件中的 TypeScript 支持，还伴随着一些其他非常棒的特性。
> Volar 取代了我们之前为 Vue 2 提供的官方 VSCode 扩展 Vetur。如果你之前已经安装了 Vetur，请确保在 Vue 3 的项目中禁用它。

> WebStorm 对 TypeScript 和 Vue 也都提供了开箱即用的支持。


**Volar Takeover 模式**
> 为了让 Vue 单文件组件和 TypeScript 一起工作，Volar 创建了一个针对 Vue 的 TS 语言服务实例，将其用于 Vue 单文件组件。同时，普通的 TS 文件依然由 VSCode 内置的 TS 语言服务来处理。所以在每个项目里我们都运行了两个语言服务实例：一个来自 Volar，一个来自 VSCode 的内置服务。这在大型项目里可能会带来一些性能问题。

为了优化性能，Volar 提供了一个叫做“Takeover 模式”的功能。在这个模式下，Volar 能够使用一个 TS 语言服务实例同时为 Vue 和 TS 文件提供支持。

如何开启开启 Takeover 模式参考[这里](https://cn.vuejs.org/guide/typescript/overview.html#volar-takeover-mode)





- **为组件的 props 标注类型**

``` vue
<!-- 运行时声明: 当使用 <script setup> 时，defineProps() 宏函数支持从它的参数中推导类型： -->
<script setup lang="ts">
    const props = defineProps({
    foo: { type: String, required: true },
    bar: Number
    })

    props.foo // string
    props.bar // number | undefined
</script>

<!-- 基于类型的声明: 通过泛型参数来定义 props 的类型 -->
<script setup lang="ts">
interface Props {
  foo: string
  bar?: number
}

const props = defineProps<Props>()
</script>

<!-- 非 <script setup> 场景下: 为了开启 props 的类型推导，必须使用 defineComponent()  -->
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    message: String
  },
  setup(props) {
    props.message // <-- 类型：string
  }
})
</script>
```

[为组件的 props 标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-props)


选项式API可以使用 PropType 这个工具类型来标记更复杂的 props 类型：

``` ts
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

interface Book {
  title: string
  author?: string
  year?: number
}

export default defineComponent({
  props: {
    book: {
      // 提供相对 `Object` 更确定的类型
      type: Object as PropType<Book>,
      required: true,
      // 如果你的 TypeScript 版本低于 4.7，确保使用箭头函数
      default: () => ({
        title: 'Arrow Function Expression'
      }),
      validator: (book: Book) => !!book.title
    },
    // 也可以标记函数
    callback: Function as PropType<(id: number) => void>
  },
  mounted() {
    this.book.title // string
    this.book.year // number

    // TS Error: argument of type 'string' is not
    // assignable to parameter of type 'number'
    this.callback?.('123')
  }
})
```

- **为组件的 emits 标注类型**

在 `<script setup>` 中，emit 函数的类型标注也可以通过运行时声明或是类型声明进行：
``` vue
<script setup lang="ts">
// 运行时
const emit = defineEmits(['change', 'update'])

// 基于类型
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()
</script>

<!-- 若没有使用 <script setup>，defineComponent() 也可以根据 emits 选项推导暴露在 setup 上下文中的 emit 函数的类型： -->
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  emits: ['change'],
  setup(props, { emit }) {
    emit('change') // <-- 类型检查 / 自动补全
  }
})
</script>
```


- **为`ref/reactive/computed`标注类型**


ref():
``` ts
import { ref } from 'vue'
import type { Ref } from 'vue'

// 推导出的类型：Ref<number>
const year = ref(2020)
// => TS Error: Type 'string' is not assignable to type 'number'.
year.value = '2020'


// 为 ref 内的值指定一个更复杂的类型，可以通过使用 Ref 这个类型:
const year: Ref<string | number> = ref('2020')
year.value = 2020 // 成功！


// 或者，在调用 ref() 时传入一个泛型参数，来覆盖默认的推导行为：
// 得到的类型：Ref<string | number>
const year = ref<string | number>('2020')
year.value = 2020 // 成功！
```


reactive():
``` ts
import { reactive } from 'vue'

// reactive() 也会隐式地从它的参数中推导类型
// 推导得到的类型：{ title: string }
const book = reactive({ title: 'Vue 3 指引' })


// 显式地标注一个 reactive 变量的类型
interface Book {
  title: string
  year?: number
}
const book: Book = reactive({ title: 'Vue 3 指引' })
```

computed():
``` ts
import { ref, computed } from 'vue'

const count = ref(0)

// computed() 会自动从其计算函数的返回值上推导出类型：
// 推导得到的类型：ComputedRef<number>
const double = computed(() => count.value * 2)
// => TS Error: Property 'split' does not exist on type 'number'
const result = double.value.split('')

// 通过泛型参数显式指定类型: 
const double = computed<number>(() => {
  // 若返回值不是 number 类型则会报错
})
```


- **为 provide / inject 标注类型**
> provide 和 inject 通常会在不同的组件中运行。要正确地为注入的值标记类型，Vue 提供了一个 `InjectionKey` 接口，它是一个继承自 `Symbol` 的泛型类型，可以用来在提供者和消费者之间同步注入值的类型：
``` ts
import { provide, inject } from 'vue'
import type { InjectionKey } from 'vue'

const key = Symbol() as InjectionKey<string>

provide(key, 'foo') // 若提供的是非字符串值会导致错误

const foo = inject(key) // foo 的类型：string | undefined
```
[参考](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-provide-inject)



- **为事件处理函数标注类型**
> 在处理原生 DOM 事件时，应该为我们传递给事件处理函数的参数正确地标注类型
``` vue
<script setup lang="ts">
function handleChange(event) {
  // `event` 隐式地标注为 `any` 类型
  console.log(event.target.value)
}
</script>

<template>
  <input type="text" @change="handleChange" />
</template>
```
有类型标注时，这个 `event` 参数会隐式地标注为 `any` 类型。这也会在 `tsconfig.json` 中配置了 `"strict": true` 或 `"noImplicitAny": true` 时报出一个 `TS` 错误。因此，建议显式地为事件处理函数的参数标注类型。此外，你可能需要显式地强制转换 `event` 上的属性：
``` js
function handleChange(event: Event) {
  console.log((event.target as HTMLInputElement).value)
}
```


- **为组件模板引用标注类型**
> 为了获取模板的类型，我们首先需要通过 typeof 得到其类型，再使用 TypeScript 内置的 InstanceType 工具类型来获取其实例类型：
``` vue
<!-- App.vue -->
<script setup lang="ts">
import MyModal from './MyModal.vue'

const modal = ref<InstanceType<typeof MyModal> | null>(null)

const openModal = () => {
  modal.value?.open()
}
</script>
```



- **扩展全局属性**
> 某些插件会通过 `app.config.globalProperties` 为所有组件都安装全局可用的属性。举例来说，我们可能为了请求数据而安装了 this.$http，或者为了国际化而安装了 this.$translate。为了使 TypeScript 更好地支持这个行为，Vue 暴露了一个被设计为可以通过 TypeScript 模块扩展来扩展的 `ComponentCustomProperties` 接口：

``` ts
import axios from 'axios'

declare module 'vue' {
  interface ComponentCustomProperties {
    $http: typeof axios
    $translate: (key: string) => string
  }
}
```
可以将这些类型扩展放在一个 `.ts` 文件，或是一个影响整个项目的 `*.d.ts` 文件中。无论哪一种，都应确保在 `tsconfig.json` 中包括了此文件。


[扩展全局属性](https://cn.vuejs.org/guide/typescript/options-api.html#augmenting-global-properties)




### Vite

Vue 官方的构建流程是基于 Vite 的，一个现代、轻量、极速的构建工具。[Vite](https://cn.vitejs.dev/)


### Vue CLI

[Vue CLI](https://cli.vuejs.org/zh/) 是官方提供的基于 Webpack 的 Vue 工具链，它现在处于维护模式。我们建议使用 Vite 开始新的项目，除非你依赖特定的 Webpack 的特性。在大多数情况下，Vite 将提供更优秀的开发体验。



### Vue Devtools
> Vue 的浏览器开发者插件使我们可以浏览一个 Vue 应用的组件树，查看各个组件的状态，追踪状态管理的事件，还可以进行组件性能分析。

[Vue Devtools](https://devtools.vuejs.org/)


### Vue-Router, Vuex, Pinia

[Vue-Router](https://router.vuejs.org/zh/)

[](https://www.jb51.net/article/228549.htm)

[Vuex](https://vuex.vuejs.org/zh/)
> 它是 Vue 之前的官方状态管理库。由于 Pinia 在生态系统中能够承担相同的职责且能做得更好，因此 Vuex 现在处于维护模式。它仍然可以工作，但不再接受新的功能。对于新的应用，建议使用 Pinia。

[Pinia](https://pinia.vuejs.org/)
> Pinia 最初正是为了探索 Vuex 的下一个版本而开发的，因此整合了核心团队关于 Vuex 5 的许多想法。最终，我们意识到 Pinia 已经实现了我们想要在 Vuex 5 中提供的大部分内容，因此决定将其作为新的官方推荐。

相比于 Vuex，Pinia 提供了更简洁直接的 API，并提供了组合式风格的 API，最重要的是，在使用 TypeScript 时它提供了更完善的类型推导。



### Vitest
> 由 Vite 提供支持的极速单元测试框架, 一个 Vite 原生的单元测试框架。非常的快！

[Vitest文档](https://cn.vitest.dev/)



### Trois
> [TroisJS](https://troisjs.github.io/) 是一个基于 Three.JS 的 Vue 3 可视化库，它是一个流行的 WebGL 库。Three.JS 对桌面和移动设备都有很好的支持。该库允许我们使用 VueJS 组件轻松为网站创建 3D 效果。







## 进阶



### 工具链

[参考](https://cn.vuejs.org/guide/scaling-up/tooling.html)


- [演练场](https://sfc.vuejs.org/)
> 一个在线的演练场，可以在浏览器中访问, 自动随着 Vue 仓库最新的提交更新, 支持检查编译输出的结果。



- [StackBlitz 中的 Vue + Vite](https://vite.new/vue)
> 类似 IDE 的环境，但实际是在浏览器中运行 Vite 开发服务器; 和本地开发效果更接近


测试，代码规范，格式化...





### 测试


[参考](https://cn.vuejs.org/guide/scaling-up/testing.html)



### 服务端渲染 (SSR)
> SSR 是 Server-Side Rendering，即服务端渲染的英文缩写。

Vue.js 是一个用于构建客户端应用的框架。默认情况下，Vue 组件的职责是在浏览器中生成和操作 DOM。然而，Vue 也支持将组件在服务端直接渲染成 HTML 字符串，作为服务端响应返回给浏览器，最后在浏览器端将静态的 HTML“激活”(hydrate) 为能够交互的客户端应用。

[参考](https://cn.vuejs.org/guide/scaling-up/ssr.html)


- Nuxt
> [Nuxt](https://v3.nuxtjs.org/) 是一个构建于 Vue 生态系统之上的全栈框架，它为编写 Vue SSR 应用提供了丝滑的开发体验。更棒的是，你还可以把它当作一个静态站点生成器来用。


- Quasar
> [Quasar](https://quasar.dev/) 是一个基于 Vue 的完整解决方案，它可以让你用同一套代码库构建不同目标的应用，如 SPA、SSR、PWA、移动端应用、桌面端应用以及浏览器插件。除此之外，它还提供了一整套 Material Design 风格的组件库。


### 静态站点生成 (SSG)

如果所需的数据是静态的，那么服务端渲染可以提前完成。这意味着我们可以将整个应用预渲染为 HTML，并将其作为静态文件部署。这增强了站点的性能表现，也使部署变得更容易，因为我们无需根据请求动态地渲染页面。Vue 仍可通过激活在客户端提供交互。这一技术通常被称为**静态站点生成 (SSG)**，也被称为 JAMStack。

[JAMStack / SSG](https://cn.vuejs.org/guide/extras/ways-of-using-vue.html#jamstack-ssg)



### 监控


``` js
import { createApp } from 'vue'
const app = createApp(...)
app.config.errorHandler = (err, instance, info) => {
  // 向追踪服务报告错误
}
```

[Sentry](https://docs.sentry.io/platforms/javascript/guides/vue/) 和 [Bugsnag](https://docs.bugsnag.com/platforms/javascript/vue/) 等服务也为 Vue 提供了官方集成。



### 性能优化

[参考](https://cn.vuejs.org/guide/best-practices/performance.html)

页面加载性能：首次访问时，应用展示出内容与达到可交互状态的速度。这通常会用 Google 所定义的一系列 Web 指标 (Web Vitals) 来进行衡量，如最大内容绘制 (Largest Contentful Paint，缩写为 LCP) 和首次输入延迟 (First Input Delay，缩写为 FID)。


- 性能分析
> Chrome 开发者工具“性能”面板: `app.config.performance` 将会开启 Vue 特有的性能标记，标记在 Chrome 开发者工具的性能时间线上。


页面加载优化有许多跟框架无关的方面, 这份 [web.dev 指南](https://web.dev/fast/)提供了一个全面的总结。



### 安全

[安全](https://cn.vuejs.org/guide/best-practices/security.html)



### 渲染机制

[渲染机制](https://cn.vuejs.org/guide/extras/rendering-mechanism.html)






## 备注

### 快速上手vue3

- 直接使用html

``` html
<script src="https://unpkg.com/vue@3"></script>

<div id="app">{{ message }}</div>

<script>
  const { createApp, ref } = Vue

  createApp({
    data() {
      return {
        message: 'Hello Vue!'
      }
    },
    setup() {
        const count = ref(0);
    }
  }).mount('#app')
</script>
```
> 上面的例子使用了全局构建版的 Vue，该版本的所有 API 都暴露在了全局变量 Vue 上。


- 通过原生 ES 模块使用 Vue

``` html
<script type="importmap">
  {
    "imports": {
      "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js",
      "square": "./modules/square.js",
      "lodash": "/node_modules/lodash-es/lodash.js"
    }
  }
</script>

<div id="app">{{ message }}</div>

<script type="module">
  import { createApp } from 'vue'

  createApp({
    data() {
      return {
        message: 'Hello Vue!'
      }
    }
  }).mount('#app')
</script>
```
> 可以直接在代码中导入 'vue'——这是因为有代码块 `<script type="importmap">`，使用了一个名为**导入映射表 (Import Maps)** 的浏览器原生功能。目前只有基于 Chromium 的浏览器支持导入映射表，所以我们推荐你在学习过程中使用 Chrome 或 Edge。

在上面的 imports 对象中，每个属性都对应着一个映射。映射的左边是 import 指定器的名称，而右边是指定器应该映射到的相对或绝对URL。

[type=“module“ 你了解，但 type=“importmap“ 你知道吗](https://blog.csdn.net/qq449245884/article/details/126133582)




### Diff算法的提升

vue2.x提供类似于HTML的模板语法，但是，它是将模板编译成渲染函数来返回虚拟DOM树。Vue框架通过递归遍历两个虚拟DOM树，并比较每个节点上的每个属性，来确定实际DOM的哪些部分需要更新。
> 这种有点暴力的算法通常非常快速，但是DOM的更新仍然涉及许多不必要的CPU工作。


- Vue3的优化

静态标记



### 打包体积的优化

在Vue3中，允许现代模式下的module bundler能够静态地分析模块依赖关系，并删除与未使用的module.exports属性相关的代码。尽管增加了许多新特性，但Vue 3被压缩后的基线大小约为10 KB，不到Vue 2的一半。

### 更好的 Tree-Shaking

Vue3.x 在考虑到 tree-shaking的基础上重构了全局和内部 API, 表现结果就是现在的全局 API 需要通过 ES Module的引用方式进行具名引用.

``` js
// vue2.x
import Vue from "vue"

Vue.nextTick(()=>{
    ...
})


// vue3.x
import { nextTick } from "vue"

nextTick(() =>{
    ...
})
```


### React中使用vue3



## 参考

- [vue3-官方指南](https://cn.vuejs.org/guide/introduction.html)
- [Vue3 对比 Vue2.x 差异性、注意点、整体梳理](https://juejin.cn/post/6892295955844956167)
- [Vue3.0 新特性以及使用经验总结](https://juejin.cn/post/6940454764421316644)
- [2021年，让我们手写一个mini版本的vue2.x和vue3.x框架](https://segmentfault.com/a/1190000040236708)
- [阿里妈妈又做了新工具，帮你把 Vue2 代码改成 Vue3 的](https://juejin.cn/post/6977259197566517284)
- [vue2升vue3官方迁移指南](https://v3.cn.vuejs.org/guide/migration/introduction.html)



<fix-link label="Back" href="/skills/vue/"></fix-link>
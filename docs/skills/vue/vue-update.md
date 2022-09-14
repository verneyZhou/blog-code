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

- [vue v2.x官方文档](https://v2.cn.vuejs.org/)
- [vue v3.x官方文档](https://cn.vuejs.org/)


## 原理

### Options API vs Composition API


- [Vue2的Options API](https://v2.cn.vuejs.org/v2/api/#data)

::: tip Options API
- data
- methods
- mounted
- watch
- computed
:::
> 当这个组件的代码超过几百行时，这时增加或者修改某个需求， 就要在` data、methods、computed` 以及 `mounted` 中反复的跳转~


- [Vue3的Composition API](https://v3.cn.vuejs.org/guide/composition-api-introduction.html)
> vue3 借鉴了react hook实现了更自由的编程方式，提出了Composition API，Composition API不需要通过指定一长串选项来定义组件，而是允许用户像编写函数一样自由地表达、组合和重用有状态的组件逻辑。


::: tip Composition API
- **setup**： `setup` 是 `Vue3.x` 新增的一个选项， 他是组件内使用 `Composition API`的入口。[参考](https://cn.vuejs.org/api/composition-api-setup.html)
- **reactive、ref、toRef 与 toRefs**：响应式
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
    - toRef: 基于响应式对象上的一个属性，创建一个对应的 ref。这样创建的 ref 与其源属性保持同步：改变源属性的值将更新 ref 的值，反之亦然。[参考](https://cn.vuejs.org/api/reactivity-utilities.html#toref)
    ``` js
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
    ```
    - toRefs: 将响应式对象转换为普通对象，其中结果对象的每个 `property` 都是指向原始对象相应 `property` 的 `ref`。
:::


### 生命周期

beforeDestroy名称变更成beforeUnmount; destroyed 表更为 unmounted。

- [vue2 生命周期](https://v2.cn.vuejs.org/v2/api/#beforeCreate)
- [vue3 生命周期](https://v3.cn.vuejs.org/api/options-lifecycle-hooks.html)


### 响应式原理

- [vue2的响应式原理-深入响应式原理](https://v2.cn.vuejs.org/v2/guide/reactivity.html)
- [vue3的响应式原理-深入响应式系统](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)

::: tip Object.defineProperty 与 Proxy
1. `Object.defineProperty`只能劫持对象的属性， 而 `Proxy` 是直接代理对象
> 由于Object.defineProperty只能劫持对象属性，需要遍历对象的每一个属性，如果属性值也是对象，就需要递归进行深度遍历。但是 Proxy 直接代理对象， 不需要遍历操作
2. `Object.defineProperty`对新增属性需要手动进行`Observe`
> 因为`Object.defineProperty`劫持的是对象的属性，所以新增属性时，需要重新遍历对象， 对其新增属性再次使用`Object.defineProperty`进行劫持。也就是 `Vue2.x` 中给数组和对象新增属性时，需要使用`$set`才能保证新增的属性也是响应式的, `$set`内部也是通过调用`Object.defineProperty`去处理的。
:::


### Diff算法的提升

vue2.x提供类似于HTML的模板语法，但是，它是将模板编译成渲染函数来返回虚拟DOM树。Vue框架通过递归遍历两个虚拟DOM树，并比较每个节点上的每个属性，来确定实际DOM的哪些部分需要更新。
> 这种有点暴力的算法通常非常快速，但是DOM的更新仍然涉及许多不必要的CPU工作。


- Vue3的优化

静态标记



### TypeScirpt的支持


vue2.x中使用的都是js，vue2是支持类型的，用的是Facebook的Flow做类型检查，但是因为某些情况下推断有问题，所以改为支持ts。一个是为了更好的类型检查，另一个是拥抱ts。[参考](https://cn.vuejs.org/guide/typescript/overview.html)



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


import { nextTick } from "vue"

nextTick(() =>{
    ...
})
```

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


#### 其他

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

## 其他
### Vue3 setup与 React Hooks 的对比

Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

React Hooks 在每次组件渲染时都会调用，通过隐式地将状态挂载在当前的内部组件节点上，在下一次渲染时根据调用顺序取出。而 Vue 的 setup() 每个组件实例只会在初始化时调用一次 ，状态通过引用储存在 setup() 的闭包内。

## 参考

- [Vue3 对比 Vue2.x 差异性、注意点、整体梳理](https://juejin.cn/post/6892295955844956167)
- [Vue3.0 新特性以及使用经验总结](https://juejin.cn/post/6940454764421316644)
- [2021年，让我们手写一个mini版本的vue2.x和vue3.x框架](https://segmentfault.com/a/1190000040236708)
- [阿里妈妈又做了新工具，帮你把 Vue2 代码改成 Vue3 的](https://juejin.cn/post/6977259197566517284)
- [vue2升vue3官方迁移指南](https://v3.cn.vuejs.org/guide/migration/introduction.html)
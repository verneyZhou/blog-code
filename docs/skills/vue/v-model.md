---
title: Vue深入：vue中v-model的实现原理
date: 2023-07-24 23:54:15
permalink: false
categories:
  - vue
tags:
  - v-model
  - vue
---


# Vue深入：vue中v-model的实现原理

v-model 即可以作用在普通表单元素上，又可以作用在组件上，它其实是一个语法糖，接下来我们就来分析 v-model 的实现原理。


- 先看一个最简单的例子：

`<input v-model="msg" placeholder="edit me" />`

它的`v-model`是怎么实现的呢？


## 实现原理
1. 首先在编译阶段，v-model 被当做普通的指令解析到 `el.directives` 中；
2. 接着在 codegen 阶段，会遍历 `el.directives`，然后获取每一个指令对应的方法：
``` js
// src/compiler/codegen/index.js

function genDirectives (el: ASTElement, state: CodegenState): string | void {
    // ...
    for (i = 0, l = dirs.length; i < l; i++) {
        dir = dirs[i]
        needRuntime = true
        const gen: DirectiveFunction = state.directives[dir.name] // dir: {name: 'model', value: 'msg'}
        if (gen) {
            needRuntime = !!gen(el, dir, state.warn)
        }
        if (needRuntime) {
            // ...
        }
    }
}

```
3. 这个指令方法在编译的时候会传入相关配置，vue内置的指令有`v-model,v-html,v-text`，当`dir.name`等于`model`的时候，执行`gen`方法就会执行了vue内置的`model`函数：
``` js
// src/platforms/web/compiler/directives/model.js

// 该方法会根据 AST 元素节点的不同类型去执行不同的逻辑
export default function model ( el: ASTElement, dir: ASTDirective, _warn: Function): ?boolean {
  const value = dir.value
  // ...
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value, modifiers)
  } else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value, modifiers) // 主要看这个方法
  }
  // ...
  return true
}

// 这里只要看下`input`输入框的处理逻辑：
function genDefaultModel ( el: ASTElement, value: string, modifiers: ?ASTModifiers ): ?boolean {
  const { lazy, number, trim } = modifiers || {} // 修饰符
  const event = lazy ? 'change' : 'input' // 事件类型
  let valueExpression = '$event.target.value'
  if (trim) {
    valueExpression = `$event.target.value.trim()`
  }
  if (number) {
    valueExpression = `_n(${valueExpression})`
  }

  // genAssignmentCode 首先对 v-model 对应的 value 做了解析，对我们的例子，value 就是 msg;
  // 最终得到的code为： msg=$event.target.value
  let code = genAssignmentCode(value, valueExpression);

  /**
   * input 实现 v-model 的精髓！！！
   */
  addProp(el, 'value', `(${value})`) // 通过修改 AST 元素，给 el 添加一个 prop，相当于我们在 input 上动态绑定了 value
  addHandler(el, event, code, null, true) // 又给 el 添加了事件处理，相当于在 input 上绑定了 input 事件
  /**
   * 其实转换成模板如下：  
   * <input v-bind:value="msg" v-on:input="msg=$event.target.value" />
   */
}
```
> 其实就是动态绑定了 input 的 value 指向了 msg 变量，并且在触发 input 事件的时候去动态把 msg 设置为目标值，这样实际上就完成了数据双向绑定了，所以说 v-model 实际上就是语法糖。

4. 再回到上面第2步的`genDirectives`方法，`needRuntime`为`true`的话，它会对生成的代码做一些处理，最终生成的render代码为：
``` js
// <input v-model="msg" placeholder="edit me" />

// 生成的可执行代码：
with(this) {
  return _c('input',{
    directives:[{
      name:"model",
      rawName:"v-model",
      value:(msg),
      expression:"msg"
    }],
    attrs:{"placeholder":"edit me"},
    domProps:{"value":(msg)},
    on:{"input":function($event){message=$event.target.value}}
    })
}
```
所以对于 input 的 v-model 而言，完全就是语法糖，并且对于其它表单元素套路都是一样，区别在于生成的事件代码会略有不同。



## 参考

- [Vue.js 技术揭秘:v-model](https://ustbhuangyi.github.io/vue-analysis/v2/extend/v-model.html)
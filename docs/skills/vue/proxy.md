
# Vue：深入响应式原理



## Object.defineProperty与Proxy
> 开始之前先介绍下`Object.defineProperty`和`Proxy`~


### Object.defineProperty
> `Object.defineProperty()` 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。详见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)


- **语法**

`Object.defineProperty(obj, prop, descriptor)`

> - **obj**：要定义属性的对象；
> - **prop**：要定义或修改的属性的名称或 Symbol；
> - **descriptor**：要定义或修改的属性描述符；
> - **返回值**：被传递给函数的对象


- **属性描述符（descriptor）**

对象里目前存在的**属性描述符**有两种主要形式：**数据描述符和存取描述符**。

**数据描述符**是一个具有值的属性，该值可以是可写的，也可以是不可写的。

**存取描述符**是由 getter 函数和 setter 函数所描述的属性。
> 一个描述符只能是这两者其中之一；不能同时是两者。


::: tip 属性描述符的键值
- **共享键值**
    - `configurable`：当且仅当该属性的 configurable 键值为 true 时，该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除，默认为 false；
    -  `enumerable`：当且仅当该属性的 enumerable 键值为 true 时，该属性才会出现在对象的枚举属性中，默认为 false；

- **数据描述符键值**
    - `value`：该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等），默认为 `undefined`；
    - `writable`：当且仅当该属性的 writable 键值为 true 时，属性的值，也就是上面的 value，才能被赋值运算符改变，默认为 false；

- **存取描述符键值**
    - `get`：属性的 getter 函数，如果没有 getter，则为 undefined。当访问该属性时，会调用此函数。执行时不传入任何参数，但是会传入 this 对象（由于继承关系，这里的this并不一定是定义该属性的对象）。该函数的返回值会被用作属性的值。默认为 undefined；
    - `set`：当且仅当该属性的 writable 键值为 true 时，属性的值，也就是上面的 value，才能被赋值运算符改变，默认为 false；
:::
如果一个描述符不具有 value、writable、get 和 set 中的任意一个键，那么它将被认为是一个数据描述符。如果一个描述符同时拥有 value 或 writable 和 get 或 set 键，则会产生一个异常。


- **示例:**

``` js
var o = {}; // 创建一个新对象

o.a = 37;

// 在对象中添加一个属性与数据描述符：
Object.defineProperty(o, "a", {
  value : 37,
  writable : true,
  enumerable : true,
  configurable : true
});

// 在对象中添加一个设置了存取描述符属性：
var bValue = 38;
Object.defineProperty(o, "b", {
  get() { return bValue; },
  set(newValue) { bValue = newValue; },
  enumerable : true,
  configurable : true
});

console.log(o.a,o.b); // 37 38


// 数据描述符和存取描述符不能混合使用
Object.defineProperty(o, "conflict", {
  value: 0x9f91102,
  get() { return 0xdeadbeef; }
});
// 抛出错误 TypeError

```

- **特点：**

1. configurable 特性表示对象的属性是否可以被删除，以及除 value 和 writable 特性外的其他特性是否可以被修改。
    > 如果 configurable 属性设置为false，则该属性被认为是“不可配置的”，当试图改变时（除了 value 和 writable 属性之外）时，会抛出TypeError，除非当前值和新值相同。
2. 当 writable 属性设置为 false 时，该属性被称为“不可写的”。它不能被重新赋值。
3. enumerable 定义了对象的属性是否可以在 for...in 循环和 Object.keys() 中被枚举。
4. 通常，使用点运算符和 Object.defineProperty() 为对象的属性赋值时，数据描述符中的属性默认值是不同的：
``` js
var o = {};

// 点运算符
o.a = 1;
// 等同于：
Object.defineProperty(o, "a", {
  value: 1,
  writable: true,
  configurable: true,
  enumerable: true
});


// 另一方面，
Object.defineProperty(o, "a", { value : 1 });
// 等同于：
Object.defineProperty(o, "a", {
  value: 1,
  writable: false,
  configurable: false,
  enumerable: false
});
```

### Proxy
> 关于`Proxy`的简介我已经在另一篇博客[JS深入：ES6、ES7、ES8...](/frontend/js/js-es6.html#proxy)有过记录，具体可参考阮老师的[Proxy]( https://es6.ruanyifeng.com/#docs/proxy)，这里不再赘述~


### 比较



## 概念

### 数据劫持

### 双向绑定
> 单向绑定非常简单，就是把Model绑定到View，当我们用JavaScript代码更新Model时，View就会自动更新。有单向绑定，就有双向绑定，如果用户更新了View，Model的数据也自动被更新了，这种情况就是双向绑定。
- 发布者-订阅者模式（backbone.js）
- 脏值检查（angular.js）
- 数据劫持（vue.js）



### MVVM



## 原理



## 实现



## 备注


## 参考



https://mp.weixin.qq.com/s/q9PxtmT8hO1o76_IgJ3xyg
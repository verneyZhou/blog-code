
# Vue使用小技巧

1. Vue中重置data中的数据
``` js
Object.assign(this.$data, this.$option.data());
```
> 在当前组件的实例中`$data`属性保存了当前组件的`data`对象，而`$options`是当前组件实例初始化时的一些属性，其中有个`data`方法,即在组件中写的`data`函数,执行后会返回一个初始化的`data`对象,然后将这个初始化的`data`对象合并到当前的`data`来初始化所有数据。


2. 给对象添加新的 property 也会触发更新
``` js
// `Object.assign(this.someObject, { a: 1, b: 2 })` // 不会触发更新
this.someObject = Object.assign({}, this.someObject, { a: 1, b: 2 }) // 会触发更新
```
> 有时需要为已有对象赋值多个新 property，比如使用 Object.assign() 或 _.extend()。但是，这样添加到对象上的新 property 不会触发更新。在这种情况下，可以用原对象与要混合进去的对象的 property 一起创建一个新的对象。
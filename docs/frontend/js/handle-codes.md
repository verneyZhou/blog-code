
# JS手写系列
(持续更新中...)


## 原生js系列
---

### 1. 手写一个new操作符

- 先简单看下new的使用：
```js
// 创建一个构造函数
function Father(name) {
    this.name = name;
    this.sayName = function() {
        console.log(`hello ${this.name}`)
    }
}
// 生成实例
var fa1 = new Father('tom');
// 调用
fa1.sayName(); // hello tom
```
现在要手写一个`myNew`方法，执行`var = myNew(father, 'tom')`能跟`var fa1 = new Father('tom')`一样生成一个实例。

- 实现：
```js
function myNew() {
    // 1. 创建一个空对象
    let obj = Object.create(null);

    // 2.获取构造函数，同时删除arguments的第一个参数
    // [].shift.call([1,2,3]) = 1；shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。
    // arguments 是一个传递给函数的参数的类数组对象，
    // 比如执行 myNew(Father, 'tom') 时，在myNew函数内arguments等于 [Father, 'tom']
    let Conf = [].shift.call(arguments)

    // 3.将 obj 的原型指向构造函数，这样 obj 就可以访问到构造函数原型中的属性(把obj的__proto__指向Conf的prototype,实现继承)
    obj.__proto__ = Conf.prototype;

    // 4.使用 apply，改变构造函数 this 的指向到新建的对象，这样 obj 就可以访问到构造函数中的属性
    // 改变this的指向，执行构造函数、传递参数,fn.apply(obj,) 或者 fn.call()
    let ret = Conf.apply(obj, arguments)

    // 5.返回新的obj对象
    return ret instanceof Object ? res : obj;
}
```
执行一下：
```js
let fa2 = myNew(Father, 'tom');
fa2.sayName(); // hello tom
```

### 2. Function.call的模拟实现
- call语法
> fun.call(thisArg, arg1, arg2, ...)，调用一个函数, 其具有一个指定的this值和分别提供的参数(参数的列表)。

- 使用
```js
var foo = {
    value: 1
};

function bar() {
    console.log(this.value);
}
// 1. call 改变了 this 的指向，指向到 foo
// 2. bar 函数执行了
bar.call(foo); // 1
```
- 分析
::: tip call方法需要实现哪些功能？
1. 将函数设为对象的属性
2. 执行&删除这个函数
3. 指定this到函数并传入给定参数执行函数
4. 如果不传入参数，默认指向为 window
:::
- 简易版实现
```js
Function.prototype.call2 = function(context) {
    // 1. 将函数设为对象的属性
    // 首先要获取调用call的函数，用this可以获取
    /*
     * 以上述使用案例为例，context为传入的foo，this为调用call方法的bar;
     * 设置之后foo就变成：
     * var foo = {
     *     value: 1,
     *     fn: function() {
     *          console.log(this.value);
     *     }
     * }
    */
    context.fn = this;

    // 2.执行该函数，即执行foo的bar方法
    context.fn();

    // 3.删除该函数
    delete context.fn;
}

// 使用 
bar.call2(foo); // 1
```
- 进阶版实现（实现对传参的处理）
```js
// 定义
Function.prototype.call3 = function(context) {
    var context = context || window; // 没传参数的情况下默认指向window
    context.fn = this; // 将函数设为对象的属性
    console.log('===arguments',arguments); 
    /*
     *  0: {value: 1}
        1: "tom"
        2: 24
        callee: (...)
        length: 3
    */
    // 参数处理
    let args = [...arguments].slice(1); // 删除第一个元素，返回新数组
    console.log('===args',...args); // ===args tom 24
    // 执行
    let res = context.fn(...args);
    // 删除该函数
    delete context.fn;
    return res; // 返回res
}


///// 使用
var foo = {
    value: 1
};
function bar(name, age) {
    console.log(this.value,name, age); // 1 "tom" 24
    return {
        name,
        age,
        value: this.value
    }
}
console.log(bar.call3(foo, 'tom', 24)); // {name: "tom", age: 24, value: 1}
```
具体实现可参考[JavaScript深入之call和apply的模拟实现](https://github.com/mqyqingfeng/Blog/issues/11)

### 3. Function.apply的模拟实现
- apply 语法
> func.apply(thisArg, [argsArray])，调用一个函数，以及作为一个数组（或类似数组对象）提供的参数。

- 使用
```js
var foo = {
    value: 1
};

function bar(name, age) {
    console.log(this.value, name, age);
}
// 1. apply 改变了 this 的指向，指向到 foo
// 2. bar 函数执行了
bar.apply(foo, ['tom', 27]); // 1 "tom" 27
```
- 实现：
> 可以发现`apply`和`call`使用方法类似，只是传参形式不一样，这里直接上代码：
```js
// 定义
Function.prototype.apply2 = function(context) {
    context = context || window;
    context.fn = this; // 将函数设为对象的属性
    let res;
    console.log('====arguments',arguments);
    /*
    *   0: {value: 1}
        1: (2) ["tom", 27]
        callee: (...)
        length: 2
    */
    if (arguments.length > 1) { // 有传参
        res = context.fn(...arguments[1]) // 扩展运算符获取传参
    } else {
        res = context.fn()
    }
    delete context.fn;
    return res;
}

// 使用
var foo = {
    value: 1
};
function bar(name, age) {
    console.log(this.value, name, age); // 1 "tom" 27
    return {value: this.value, name, age}
}
console.log(bar.apply2(foo, ['tom', 27])); // {value: 1, name: "tom", age: 27}
```

### 4. Function.bind的模拟实现
- 什么是bind？
> bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数。(来自于 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_objects/Function/bind) )

- 使用
```js
var value = 2;
var foo = {
    value: 1
};
function bar(name, age) {
    this.habit = 'eat';
    console.log(this.value, name, age);
    return {value: this.value, name, age, habit: this.habit, friend: this.friend}
}
bar.prototype.friend = 'rose';


// 1.返回一个新函数
var bindFn = bar.bind(foo, 'tom');

// 2.执行；声明和执行的时候都可以传参，神奇！
console.log(bindFn(27)); // {value: 1, name: "tom", age: 27, habit: "eat", friend: undefined}

// 3.返回的新函数可以作为构造函数使用
let bindObj = new bindFn(30);
// value为undefined，说明指定的this失效（this失效是因为new实例后把this指向了bindObj），但传参生效了（age为30）
// 且 生成实例能获取绑定函数原型中的值, 例：friend: rose
console.log(bindObj); // {value: undefined, name: "tom", age: 30, habit: "eat", friend: "rose"}
```
- 分析
::: tip bind方法需要实现哪些功能？
1. 返回一个新函数
2. 函数在声明和执行的时候都可以传参
3. 返回的函数可以作为构造函数使用
4. 生成实例能获取绑定函数原型中的值
:::

- 实现
```js
// 定义
Function.prototype.bind2 = function(context) {
    // this类型判断
    if (typeof this !== 'function') {
        throw new Error(`${this} is not function.`)
    }

    let self = this;
    let args = [...arguments].slice(1); // 删除第一个元素，返回新数组 
    // let args = Array.prototype.slice.call(arguments, 1);
    // [].slice.call(arguments, 1);

    let fBind = function() {
        console.log(this, arguments, args);

        // 这个时候的arguments是指执行bind()时传入的参数
        let bindArgs = [...arguments].slice();
        let contatArgs = args.concat(bindArgs); // 合并参数
        // ** 获取this指向：如果是作为构造函数生成实例，则指向当前实例，否则指向声明时传入的对象
        let _this = this instanceof fBind ? this : context;
        return self.apply(_this, contatArgs); // 指定this指向
    }

    // ** 修改返回函数的 prototype 为绑定函数的 prototype，实例就可以继承绑定函数的原型中的值
    // 但，如果直接 fBound.prototype = this.prototype的话，在修改 fBound.prototype 的时候，也会直接修改绑定函数的 prototype。
    // 可通过一个空函数来进行中转：
    let tmp = function () {};
    tmp.prototype = this.prototype;
    fBind.prototype = new tmp();

    return fBind;
}

// 使用
var value = 2;
var foo = {
    value: 1
};
function bar(name, age) {
    this.habit = 'eat';
    console.log(this.value, name, age);
    return {value: this.value, name, age, habit: this.habit, friend: this.friend}
}
bar.prototype.friend = 'rose';

var bindFn = bar.bind2(foo, 'tom');
console.log(bindFn(27)); // {value: 1, name: "tom", age: 27, habit: "eat", friend: undefined}
let bindObj = new bindFn(30);
console.log(bindObj); // {value: undefined, name: "tom", age: 30, habit: "eat", friend: "rose"}

```
具体实现可参考[JavaScript深入之bind的模拟实现](https://github.com/mqyqingfeng/Blog/issues/12)



### 5. `instanceof`的模拟实现
> `instanceof`用于判断引用类型是否是某个构造函数的实例
```js
console.log([1,2,3] instanceof Object) // true
```
- 实现：
```js
function myInstanceof(left ,right) {
    // 基本数据类型判断
    if (typeof left !== 'object' || left === null) return false;
    let proto = Object.getPrototypeOf(left); // 获取left指向其构造函数原型的指针，也就是获取其构造函数的原型对象
    // 循环判断
    while(true) {
        console.log(proto);
        if (proto === null) return false; // 查到原型链最顶层null，说明left确实不是right的实例，停止查找，返回false
        // left指向其构造函数原型的指针恰好等于right的原型对象，那就说明left是right的实例，返回true,跳出循环
        if (proto === right.prototype) return true;
        proto = Object.getPrototypeOf(proto); // 上一步如果没有匹配上，则__proto__指针继续沿着原型链往上查找
    }
}

// 测验
console.log(myInstanceof([], Object)) // true
console.log([] instanceof Object) // true
```


### 6. `Object.assign`的模拟实现
> [Object.assign](https://es6.ruanyifeng.com/#docs/object-methods#Object-assign)用于对象的合并，将源对象（source）的所有可枚举属性，复制到目标对象（target）。
```js
Object.assign(target, source1, source2)
```
- 分析：
1. 这是一个浅拷贝；
2. 目标对象跟源对象中有同名属性，后面会覆盖前面的；
3. 如果只有一个参数，Object.assign()会直接返回该参数；
4. 如果目标对象不是对象，则会先转成对象，然后返回；
5. 由于undefined和null无法转成对象，所以如果它们作为参数，就会报错；
6. Object.assign()拷贝的属性是有限制的，只拷贝源对象的自身属性（不拷贝继承属性）;
7. 可以拷贝属性名为 Symbol 值的属性。

- 实现：
```js
Object.defineProperty(Object, 'assign2', {
    value: function(target, ...args) {
        // 对undefined和null类型进行判断
        if (target === null || target === undefined) {
            return new TypeError('Cannot convert undefined or null to object');
        }

        // 自动转换为引用类型
        var res = Object(target);
        if (args.length) {
            var i = 0;
            // 循环遍历传入源对象
            while(i < args.length) {
                var source = args[i];
                if (source !== null && source !== undefined) {
                    // 兼容symbol类型
                    var symKeys = Object.getOwnPropertySymbols(source);
                    if (symKeys.length) symKeys.forEach(key => res[key] = source[key])

                    // 使用for...in和hasOwnProperty双重判断，确保只拿到本身的属性、方法（不包含继承的）
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            res[key] = source[key];
                        }
                    }
                }
                i ++;
            }
        }

        return res;

    },
    configurable: true, // 可配置
    writable: true //  可写的
})

// 测试
console.log(Object.assign2({},undefined, null, '123',123, true, {name: 'tom', [Symbol('b')]: 'bbb'}));
// {0: "a", 1: "b", 2: "c", name: "tom", Symbol(b): "bbb"}
```





### 函数柯里化


## 常用方法
---





## 数组方法
---

### 1.`Array.prototype.reduce`的模拟实现
> 关于`reduce`的模拟实现，具体见[数组的reduce学习笔记](./array-reduce)，这里不再赘述。


### 2. `Array.prototype.sort`的模拟实现
> sort() 方法用原地算法对数组的元素进行排序，并返回数组。默认排序顺序是在将元素转换为字符串，然后比较它们的UTF-16代码单元值序列时构建的，详见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)


[实现](https://mp.weixin.qq.com/s/zrhwCosK4fi3uCA9Gms3Lg)


### 3. `Array.prototype.filter`的模拟实现
> 返回一个满足筛选条件的新数组；具体介绍见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)

- 使用：
```js
var newArray = arr.filter(callback(element, index, array), thisArg)
```
- 实现：
```js
Array.prototype.filter2 = function(callback, thisArgs) {
    // 类型兼容处理
    if (this == undefined) {
        throw new TypeError('this is null or not undefined');
    }
    if (typeof callback !== 'function') {
        throw new TypeError(callback + 'is not a function');
    }

    var res = [],
        _this = thisArgs || this,
        len = this.length >>> 0, // >>> 无符号右移，保证len为数字类型，且为正整数
        i = 0;
    // 循环遍历
    while(i < len) {
        if (i in this) { // 检查是否存在该值
            if (callback.call(_this, this[i], i, this)) { // 如果回调函数返回 true
                res.push(this[i]);
            }
        }
        i ++;
    }
    
    return res; // 返回res

}


// 测试
console.log([1,2,3,4,5].filter2(v => v >= 3)); [3,4,5]
```

### 4. `Array.prototype.map`的模拟实现
> [map()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map)方法返回一个新数组，其结果是该数组中的每个元素是调用一次提供的函数后的返回值。

- 使用：
```js
var new_array = arr.map(callback(currentValue, index, array), thisArg)
```

- 实现：
```js
// 和filter实现类似：
Array.prototype.map2 = function(callback, thisArgs) {
    // 类型兼容处理
    if (this == undefined) {
        throw new TypeError('this is null or not undefined');
    }
    if (typeof callback !== 'function') {
        throw new TypeError(callback + 'is not a function');
    }

    var res = [],
        _this = thisArgs || this,
        len = this.length >>> 0, // >>> 无符号右移，保证len为数字类型，且为正整数
        i = 0;
    // 循环遍历
    while(i < len) {
        if (i in this) { // 检查是否存在该值            
            res[i] = callback.call(_this, this[i], i, this); // 调用回调函数，并传入新数组
        }
        i ++;
    }
    
    return res; // 返回res

}


// 测试
console.log([1,2,3,4,5].map2(v => v * 2)); // [2, 4, 6, 8, 10]
```

### 5. `Array.prototype.forEach`的模拟实现
> [forEach()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)方法与map类似，但没有返回值，常用于对数组的每个元素执行一次给定的函数。

- 使用：
```js
var new_array = arr.forEach(callback(currentValue, index, array), thisArg)
```

- 实现：
```js
// 和filter实现类似：
Array.prototype.forEach2 = function(callback, thisArgs) {
    // 类型兼容处理
    if (this == undefined) {
        throw new TypeError('this is null or not undefined');
    }
    if (typeof callback !== 'function') {
        throw new TypeError(callback + 'is not a function');
    }

    var _this = thisArgs || this,
        len = this.length >>> 0, // >>> 无符号右移，保证len为数字类型，且为正整数
        i = 0;
    // 循环遍历
    while(i < len) {
        if (i in this) { // 检查是否存在该值            
            callback.call(_this, this[i], i, this); // 调用回调函数
        }
        i ++;
    }

}


// 测试
let a = [1,2,3,4,5];
a.forEach2((v,i) => a[i] = v * 3)
console.log(a); // [3, 6, 9, 12, 15]
```


















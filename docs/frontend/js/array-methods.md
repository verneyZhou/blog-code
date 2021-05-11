
# 数组常用方法整理
（持续更新中...）

---
## 数组扁平化
> 数组扁平化，就是将一个多层嵌套的数组变成一个单层数组，如：`[1, [2, [3, [4, [5]]]]]---->[1,2,3,4,5]`。


### 1. `Array.prototype.flat()`
> [flat](https://es6.ruanyifeng.com/#docs/array#%E6%95%B0%E7%BB%84%E5%AE%9E%E4%BE%8B%E7%9A%84-flat%EF%BC%8CflatMap)是ES6提供的新方法，用于将嵌套的数组“拉平”，变成一维的数组。该方法返回一个新数组，对原数据没有影响。
```js
// flat()默认只会“拉平”一层，如果想要“拉平”多层的嵌套数组，可以将flat()方法的参数写成一个整数，表示想要拉平的层数，默认为1。
[1, 2, [3, 4, [5, 6]]].flat() // [1, 2, 3, 4, [5,6]]
// 如果不管有多少层嵌套，都要转成一维数组，可以用Infinity关键字作为参数。
[1, 2, [3, 4, [5, 6, [7, 8]]]].flat(Infinity) // [1, 2, 3, 4, 5, 6, 7, 8]
```

### 2. 正则匹配：`replace + split`
> 将数组先转变为字符串，再使用正则去除所有的中括号，最后将剩下的字符串以逗号为分隔符生成字符串；缺点是生成的每一项都是字符串。
```js
const flatArr = (arr) => JSON.stringify(arr).replace(/\[|\]/g, '').split(',');
flatArr([1, 2, [3, 4, [5, 6, [7, 8]]]]) // ["1", "2", "3", "4", "5", "6", "7", "8"]
```

### 3. 正则匹配2.0：`replace + JSON.parse`
> 同样也是先转化成字符串，去除所有的中括号，但最后再使用两个中括号包围起来，再调用JSON.parse方法自动转化为数组：此方法对上一个方法进行了一点改进，解决了生成的数组都是字符的问题。
```js
const flatArr = (arr) => JSON.parse('[' + JSON.stringify(arr).replace(/\[|\]/g,'') + ']')
flatArr([1, 2, [3, 4, [5, 6, [7, 8]]]]) // [1, 2, 3, 4, 5, 6, 7, 8]
```

### 4. 函数递归
> 递归函数用到了`Array.isArray`方法，如果发现数组中存在数组嵌套就递归调用，并通过concat拼接；不存在就将该项push到新数组中。
```js
const flatArr = (arr) => {
    let temp = [];
    arr.forEach(v => {
        // 如果存在数组，递归调用
        if (Array.isArray(v)) {
            temp = temp.concat(flatArr(v)) // concat() 方法用于连接两个或多个数组，不修改原数组，返回新数组
        } else { // 不存在直接push
            temp.push(v);
        }
    })
    return temp;
}
flatArr([1, 2, [3, 4, [5, 6, [7, 8]]], 9, 0]) // [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
```

### 5. 扩展运算符`...`+`while`循环
> 此方法借用了数组中的Array.isArray和some方法，使用while循环来不断对数组判断里面是否有数组，存在就使用`...`将其展开。
```js
const flatArr = (arr) => {
    while(arr.some(v => Array.isArray(v))) {
        arr = [].concat(...arr);
    }
    return arr;
}
flatArr([1, 2, [3, 4, [5, 6, [7, 8]]], 9, 0]) // [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
```

### 6. `reduce`实现
> 通过 reduce 遍历数组，遇到数组的某个元素仍是数组时，递归调用展开数组；最终使用 concat 方法进行拼接（也可以使用 ES6 的扩展运算符`...`对数组进行降维）。
```js
// 这里添加dep表示需要扁平化的层级:不传默认扁平化全部
const flatArr = (arr, dep) => {    
    if (dep === 0) return arr; // 如果传了dep
    return arr.reduce((pre, cur) => {
        // 判断dep参数
        let _dep = isNaN(dep) ? undefined : dep - 1;
        // 判断是否是数组，是则递归调用，否则使用concat进行拼接
        return pre.concat(Array.isArray(cur) ? flatArr(cur, _dep) : cur)
        // 也可以使用扩展运算符...进行降维
        // return Array.isArray(cur) ? [...pre, ...flatArr(cur, _dep)] : [...pre, cur];
    }, [])
}
flatArr([1, 2, [3, 4, [5, 6, [7, 8]]], 9, 0]) // 扁平化全部：[1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
flatArr([1, 2, [3, 4, [5, 6, [7, 8]]], 9, 0], 2) // 扁平化两层：[1, 2, 3, 4, 5, 6, [7, 8], 9, 0]
```


---
## 数组去重
> 顾明思义，就是对数组中重复的字段进行删除，如：`[1,2,3,2,4,5,1,4] => [1,2,3,4,5]`


### 1. `new Set`去重
> ES6提供了新的数据结构 [Set](https://es6.ruanyifeng.com/#docs/set-map)。它类似于数组，但是成员的值都是唯一的，没有重复的值。
```js
const uniqueArr = (arr) => {
    let res = new Set(arr); // Set本身是一个构造函数，用来生成 Set 数据结构。
    console.log(res);
    return [...res]; // 用...将Set的类数组结构转换成数组
    // return Array.from(res); // Array.from方法用于将类数组转为真正的数组。
}
uniqueArr([1,1,'a','a',undefined,undefined, isNaN, isNaN, NaN, NaN, true, true, null, null, {}, {} ])
// [1, "a", undefined, ƒ, NaN, true, null, {}, {}]
```
缺点：这个方法可以对js的基础数据类型进行去重，但对引用数据类型`{}`无法去重。

### 2. `for`循环嵌套去重
> 利用for嵌套for，然后splice去重（ES5中最常用）。
```js
function uniqueArr(arr) {
    for (var i = 0; i < arr.length; i ++) {
        for (var j = i + 1; j < arr.length; j ++) {
            if (arr[i] === arr [j]) { // 循环遍历，当存在重复项
                arr.splice(j, 1); // 删除
                j --;
            }
        }
    }
    return arr;
}
uniqueArr([1,1,'a','a',undefined,undefined, isNaN, isNaN, NaN, NaN, true, true, null, null, {}, {} ])
// [1, "a", undefined, ƒ, NaN, NaN, true, null, {}, {}]
```
缺点：引用数据类型`{}`和`NaN`无法去重。

### 3. `indexOf`去重
```js
function uniqueArr(arr) {
    var res = [];
    for (var i = 0; i < arr.length; i ++) {
        // res中没有该项，则直接push
        if (res.indexOf(arr[i]) === -1) res.push(arr[i]);
    }
    return res;
}
uniqueArr([1,1,'a','a',undefined,undefined, isNaN, isNaN, NaN, NaN, true, true, null, null, {}, {} ])
// [1, "a", undefined, ƒ, NaN, NaN, true, null, {}, {}]
```
缺点：引用数据类型`{}`和`NaN`无法去重。

### 4. `includes`去重
> Array.prototype.includes方法返回一个布尔值，表示某个数组是否包含给定的值，ES2016 引入了该[方法](https://es6.ruanyifeng.com/?search=include&x=0&y=0#docs/array#%E6%95%B0%E7%BB%84%E5%AE%9E%E4%BE%8B%E7%9A%84-includes)；去重原理和上一个`indexOf`去重大同小异。
```js
const uniqueArr = (arr) => {
    let res = [];
    arr.forEach(v => {
        if (!res.includes(v)) res.push(v); 
    })
    return res;
}
uniqueArr([1,1,'a','a',undefined,undefined, isNaN, isNaN, NaN, NaN, true, true, null, null, {}, {} ])
// [1, "a", undefined, ƒ, NaN, true, null, {…}, {…}]
```
可以对`NaN`进行去重，但还是不能对`{}`进行去重。

### 5. `includes`+`reduce`去重
> 这个是includes结合reduce方法来实现的去重。
```js
const uniqueArr = (arr) => {
    // 用includes判断cur已添加到pre中，是则返回pre,否则将cur添加到pre中
    return arr.reduce((pre, cur) => pre.includes(cur) ? pre : [...pre, cur],[])
}
uniqueArr([1,1,'a','a',undefined,undefined, isNaN, isNaN, NaN, NaN, true, true, null, null, {}, {} ])
// [1, "a", undefined, ƒ, NaN, true, null, {…}, {…}]
```
这种写法比较简洁，但还是不能对`{}`进行去重。

### 6. `filter`去重
> 过滤去重，过滤条件为：当前项的索引是否等于它在数组中的第一个索引。去重原理和`indexOf`去重差不多。
```js
function uniqueArr(arr) {
    return arr.filter((v,i) => arr.indexOf(v) === i)
}
uniqueArr([1,1,'a','a',undefined,undefined, isNaN, isNaN, NaN, NaN, true, true, null, null, {}, {} ])
// [1, "a", undefined, ƒ, true, null, {…}, {…}]
```
但这种方法会把`NaN`给删除了，且`{}`也没有去重。

### 7. `filter`+`hasOwnProperty`去重
> 算是上一个方法的改良版，利用hasOwnProperty 判断是否存在对象属性进行去重。
```js
function uniqueArr(arr) {
    let obj = {};
    return arr.filter((v,i) => {
        let key = typeof v + v; // 生成key
        console.log(obj);
        if (obj.hasOwnProperty(key)) {
            return false; // 如果已经添加该key，返回false
        } else {
            return obj[key] = true; // 如果没有，则在obj中添加该key
        }
    })
}
uniqueArr([1,1,'a','a',undefined,undefined, isNaN, isNaN, NaN, NaN, true, true, null, null, {}, {} ])
// [1, "a", undefined, ƒ, NaN, true, null, {…}]
```
这个方法对`NaN`和`{}`都能实现去重！

### 8. `obj`键值唯一性去重
> 这里是利用对象obj键值的唯一性来去重，和上一个方法利用`hasOwnProperty`进行判断的原理有点类似。
```js
// 这里可以兼容只对每项中某一个字段进行去重的场景,field为需要进行去重判断的字段
function uniqueArr(arr, field) {
    var obj = {};
    var res = [];
    for(var i in arr) {
        // 生成key
        var key = typeof arr[i] === 'object' && field ? // 如果需要对每项中某一个字段进行去重
            typeof arr[i][field] + arr[i][field] : typeof arr[i] + arr[i];
        if (!obj[key]) { // 如果obj中不存在该key,则添加
            obj[key] = true;
            res.push(arr[i]);
        }
    }
    return res;
}
uniqueArr([1,1,'a','a',undefined,undefined, isNaN, isNaN, NaN, NaN, true, true, null, null, {}, {} ])
// [1, "a", undefined, ƒ, NaN, true, null, {…}]

// 对每项中的字段a进行去重
uniqueArr([{a: 1}, {a: 2}, {a: 1}],'a'); // [{a:1}, {a: 2}] 
```
这个方法能对`NaN`和`{}`都能实现去重，也能兼容对每项中某个字段进行去重的场景。

### 9. `Map`去重
> 上面的方法也可以用ES6的[Map](https://es6.ruanyifeng.com/?search=include&x=0&y=0#docs/set-map#Map)数据结构来实现：
```js
const uniqueArr = (arr, field) => {
    let map = new Map();
    let res = [];
    arr.forEach((v,i) => {
        // 生成key
        var key = typeof v === 'object' && field ? // 如果需要对每项中某一个字段进行去重
            typeof v[field] + v[field] : typeof v + v;
        if (!map.has(key)) { // 如果map中不存在该key,则添加
            map.set(key, true);
            res.push(v);
        }
    })
    return res;
}
uniqueArr([1,1,'a','a',undefined,undefined, isNaN, isNaN, NaN, NaN, true, true, null, null, {}, {} ])
// [1, "a", undefined, ƒ, NaN, true, null, {…}]

// 对每项中的字段a进行去重
uniqueArr([{a: 1}, {a: 2}, {a: 1}],'a'); // [{a:1}, {a: 2}]
```

### 其他
1. 判断数组是否重复
```js
function isRepeatArr(arr,field) {
    let hash = {};
    for(let i in arr) {
        let v = arr[i];
        let key = typeof v === 'object' && field ? typeof v[field] + v[field] : typeof v + v;
        if (hash[key]) {
            return true;
        }
        hash[key] = true;
    } 
    return false;
}
isRepeatArr([{a:1},{a: 2},{a: 2}]); // true
```

---
## 将类数组转换成数组
> 类数组是具有length属性，但不具有数组原型上的方法。常见的类数组有arguments、DOM操作方法返回的结果。

1. `Array.from`
> [Array.from](https://es6.ruanyifeng.com/#docs/array#Array-from)方法用于将两类对象转为真正的数组：类似数组的对象（array-like object）和可遍历（iterable）的对象（包括 ES6 新增的数据结构 Set 和 Map）。
```js
Array.from(document.querySelectorAll('.class_name'))
```

2. Array.prototype.slice.call()
```js
Array.prototype.slice.call(document.querySelectorAll('class_name'))
```

3. `...`扩展运算符
```js
[...document.querySelectorAll('class_name')]
```

4. Array.prototype.slice.concat()
```js
Array.prototype.concat.apply([], document.querySelectorAll('class_name'))
```

---
## 排序





<fix-link label="Back" href="/fontend/js/"></fix-link>


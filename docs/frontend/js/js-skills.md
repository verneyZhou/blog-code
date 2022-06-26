---
title: 一些常用的js代码技巧
date: 2021-03-31 23:24:16
# permalink: false # 27acf6/
categories: 
  - js
tags: 
  - utils
permalink: false # 3e85b8/
---




# 一些常用的js代码技巧
这里收集的是日常项目开发中一些比较常用的js代码，短小精悍，方便实用。


## 常用方法

### 判断所有数据类型的typeof

``` js
window.typeof = function (value) {
  return Object.prototype.toString.call(val).slice(8, -1)
}
```

### 实现图片懒加载lazyLoad


``` js
function lazyload() {
  const imgs = document.getElementsByTagName('img');
  const len = imgs.length;
  // 视口的高度
  const viewHeight = document.documentElement.clientHeight;
  // 滚动条高度
  const scrollHeight = document.documentElement.scrollTop || document.body.scrollTop;
  for (let i = 0; i < len; i++) {
    const offsetHeight = imgs[i].offsetTop;
    if (offsetHeight < viewHeight + scrollHeight) {
      const src = imgs[i].dataset.src;
      imgs[i].src = src; // 给img标签统一自定义属性data-src='default.png'，当检测到图片出现在窗口之后再补充src属性，此时才会进行图片资源加载。
    }
  }
}

// 可以使用节流优化一下
window.addEventListener('scroll', lazyload);
```


[参考](https://github.com/yeyan1996/practical-javascript/blob/master/lazyLoad.js)


### cleanObject
> 去除对象中value为空(null,undefined,'')的属性

``` js
export const isVoid = (value) =>
  value === undefined || value === null || value === "";

export const cleanObject = (object) => {
  // Object.assign({}, object)
  if (!object) {
    return {};
  }
  const result = { ...object };
  Object.keys(result).forEach((key) => {
    const value = result[key];
    if (isVoid(value)) {
      delete result[key];
    }
  });
  return result;
};


let res=cleanObject({
    name:'',
    pageSize:10,
    page:1
})
console.log("res", res) //输入{page:1,pageSize:10}
```

### 在浏览器中自定义下载一些内容
``` js
/**
 * 浏览器下载静态文件
 * @param {String} name 文件名
 * @param {String} content 文件内容
 */
function downloadFile(name, content) {
    if (typeof name == 'undefined') {
        throw new Error('The first parameter name is a must')
    }
    if (typeof content == 'undefined') {
        throw new Error('The second parameter content is a must')
    }
    if (!(content instanceof Blob)) {
        content = new Blob([content])
    }
    const link = URL.createObjectURL(content)
    download(link, name)
}
//下载一个链接
function download(link, name) {
    if (!name) {//如果没有提供名字，从给的Link中截取最后一坨
        name =  link.slice(link.lastIndexOf('/') + 1)
    }
    let eleLink = document.createElement('a')
    eleLink.download = name
    eleLink.style.display = 'none'
    eleLink.href = link
    document.body.appendChild(eleLink)
    eleLink.click()
    document.body.removeChild(eleLink)
}



/*
form表单提交
*/
 function downloadFileByForm (downloadUrl, fileName) {
    // 创建表单
    const formObj = document.createElement('form');
    formObj.action = downloadUrl;
    formObj.method = 'get';
    formObj.style.display = 'none';
    // 创建input，主要是起传参作用
    const formItem = document.createElement('input');
    formItem.value = fileName; // 传参的值
    formItem.name = 'fileName'; // 传参的字段名
    // 插入到网页中
    formObj.appendChild(formItem);
    document.body.appendChild(formObj);
    formObj.submit(); // 发送请求
    document.body.removeChild(formObj); // 发送完清除掉
}

//下载excel
download('http://111.229.14.189/file/1.xlsx')

downloadFileByForm('http://111.229.14.189/file/1.xlsx', 'test.xlsx')

// 使用
downloadFile('1.txt','lalalallalalla')
downloadFile('1.json',JSON.stringify({name:'hahahha'}))


```

### 复制内容到剪切板
``` js
export function copyToBoard(value) {
    const element = document.createElement('textarea')
    document.body.appendChild(element)
    element.value = value
    element.select()
    if (document.execCommand('copy')) {
        document.execCommand('copy')
        document.body.removeChild(element)
        return true
    }
    document.body.removeChild(element)
    return false
}
```


### 清除所有 Cookie
``` js
const clearCookies = document.cookie.split(';').forEach(cookie => document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`));

```

### 将 RGB 转换为十六进制
``` js
const rgbToHex = (r, g, b) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
rgbToHex(0, 51, 255); // '#0033ff'
```








## 随机数的应用
`Math.random()`相关

### 1. ID随机生成
```js
// toString(radix): radix，数字基数，2~36之间的整数，默认10；radix为几，就表示输出几进制的字符串；36：1~9 A~Z
let id = Math.random().toString(36).substring(2);
console.log(id); // ol7lr3jaj08
```
### 2. 生成一个范围内随机数
```js
let max = 20
let min = 10
let a = Math.floor(Math.random() * (max - min + 1)) + min;
console.log(a)
```

### 3.数组随机混排
```js
var arr = ['a', 'b','c', 'd', 'e']; 
console.log(arr.slice().sort((a,b) => Math.random() - 0.5))
// ["a", "c", "b", "e", "d"]
```

### 4. 随机布尔值
```js
let randomBoolean = () => Math.random() >= 0.5; 
console.log(randomBoolean()); 
```

### 5. 随机的十六进制代码
可用于随机生成调色板~
```js
// 0xffffff就表示16进制的ffffff，也就是10进制的：15*16^5 + 15*16^4 + 15*16^3 + 15*16^2 + 15*16^1 + 15
// padEnd(minlength, str): ES2017 引入了字符串补全长度的功能。如果某个字符串不够指定长度，会在头部或尾部补全
let a = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padEnd(6, '0');
console.log(a); // #82efaa
```



## if-else的替代方案
> 项目经常会用到`if-else`，但当逻辑比较复杂还继续用`if-else`来判断，代码就会显得很臃肿，而且可读性也很差，不够简洁；这里罗列了几个`if-else`的替代方案，可以使代码的书写更加优雅。

先看个用`if-else`写的例子：
```js
function getInfo(age) {
  if (age < 0) return 'wrong';
  if (age < 10) {
    return 'child'
  } else if (age < 20) {
    return 'younger'
  } else if (age < 30) {
    return 'adult'
  } else {
    ...
  }
}
```

1. 三目运算符
> 当遇到一些简单的判断逻辑时，可以用三目去简化代码：
```js
// if-else写法
if (!!condition) {
  fn1();
} else {
  fn2();
}

// 三目写法
!!condition ? fn1() : fn2();
```

2. `switch-case`
> 写法与`if-else`类似，可以用来处理比较复杂的判断逻辑
```js
switch(age) {
  case < 0:
    return 'wrong';
  case < 10:
    return 'child';
  case < 20:
    return 'younger';
  case < 30:
    return 'adult';
  default:
    return '...'
}
```
`switch/case`的写法其实跟`if-else`的差不多，只是看起来会稍微那么简洁一些~

3. 配置逻辑分离
> 通常需要定义一个用来存放数据配置的对象, 同时要定义一个`flag`作为配置的键, 配置的值则可以是函数、数组等任意类型的值；在执行逻辑的地方, 只需要将判断条件与`flag`进行比对, 就可以获取到当前判断条件下的业务逻辑方法。
```js
const serviceHandler = {
  0: () => {return 'wrong'},
  10: () => {return 'child'},
  20: () => {return 'younger'},
  30: () => {return 'adult'},
  ...
}
serviceHandler[Math.ceil(23/10) * 10]()
```
上面是使用对象进行数据配置，只能用字符串或数字作为属性，不能满足一些复杂场景的需求；这里可以用es6的`Map`来进行数据配置，它允许用正则等复杂数据类型作为属性：
```js
const serviceHandler = new Map([
  [/^(?:0|[0-9]?|9)$/g, () => {return 'child'}], // 0 ~ 9
  [/^(1[0-9]?|9)$/g, () => {return 'younger'}], // 10 ~ 19
  [/^(2[0-9]?|9)$/g, () => {return 'adult'}], // 20 ~ 29
  
])
ageFn = (age) => {
  let res = '';
  serviceHandler.forEach((handler,key) => {
    if (key.test(age)) {
      res = handler();
    }
  })

  return res;
}
console.log(ageFn(23)); // adult

```
- 参考
1. [你本可以少写些 if-else](https://juejin.cn/post/6844903854140735496)
2. [JavaScript复杂判断的更优雅写法](https://zhuanlan.zhihu.com/p/48917912)


## js解构的使用
> ES6[解构](https://es6.ruanyifeng.com/#docs/destructuring)的常见用途~
1. 交换变量
```js
let a = 1;
let b = 2;

[a, b] = [b, a];

console.log(a,b); // 2 1
```
2. 访问数组元素
> 将`colors`数组的第一个元素赋给`firstColor`变量；如果数组在索引`0`处没有任何元素，则分配`white`默认值
```js
const colors = [];
// 访问第一个元素
let [firstColor = 'white'] = colors;
console.log(firstColor); // white

// 访问第二个元素，默认red
let [,secondColor = 'red'] = colors;
console.log(secondColor);
```


## 其他

### 获取页面元素
> 打印出当前网页使用了多少种HTML元素
```js
const getAllTag = () => {
  return [...new Set([...document.querySelectorAll('*')].map(el => el.tagName))];
}
```

### 颜色十六进制转换
>  实现颜色转换：`rgb(255, 255, 255) -> #FFFFFF`
- 方法1：
```js
function rgb2hex(sRGB) {
  // 正则匹配：替换 rgb(255, 255, 255) 的部分字符（ rgb 、 ( 、 ) ）为 ''
    var rgb = sRGB.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',') // [255,255,255]
    // 使用reduce进行累加
    return rgb.reduce((acc, cur) => {
        //  Number(n).toString(16)：转换为16进制；不足16的数字前面自动加0
        var hex = (cur < 16 ? '0':'') + Number(cur).toString(16)
        return acc + hex
    }, '#').toUpperCase()
}

rgb2hex('rgb(200, 235, 13)') // #C8EB0D
```

- 方法2： 
```js
// sRGB = 'rgb(200, 235, 13)'
function rgb2hex(sRGB) {
    // 正则匹配所有数字
    var rgb = sRGB.match(/\d+/g); // ["200", "235", "13"]
    // 获取16进制
    const hex = (n) => {
        return ("0" + (+n).toString(16)).slice(-2);
    }
    // reduce累加
    return rgb.reduce((acc, cur) => acc + hex(cur), '#').toUpperCase()
}

rgb2hex('rgb(200, 235, 13)') // #C8EB0D
```

### URLSearchParams
> [URLSearchParams](https://developer.mozilla.org/zh-CN/docs/Web/API/URLSearchParams)接口定义了一些实用的方法来处理 URL 的查询字符串。
```js
let url = '?name=tom&age=24&gender=boy';
let searchParams = new URLSearchParams(url);

for (let p of searchParams) {
  console.log(p);
}
// ["name", "tom"]
// ["age", "24"]
// ["gender", "boy"]
```


### 实现：`foo(1)(2)(3).getValue()`或`foo(1,2,3).getValue()`等于6
```js
function foo(...args) {
    // target是一个函数，先将传入的参数合并到一起，再递归调用foo函数
    const target = (...arg1s) => foo(...[...args, ...arg1s])
    // reduce实现累加
    target.getValue = () => args.reduce((p, n) => p+ n, 0)
    return target // 返回target
}

var f1 = foo(1,2,3);
console.log(f1.getValue()); // 6

var f2 = foo(1,2)(3);
console.log(f2.getValue()); // 6

var f3 = foo(1)(2)(3);
console.log(f3.getValue()); // 6 
```


### `??`与`?.`的应用

- 空值合并操作符`??`
> 空值合并操作符（??）是一个逻辑操作符，当左侧的操作数为`null`或者`undefined`时，返回其右侧操作数，否则返回左侧操作数。

与逻辑或操作符 `||` 不同，逻辑或操作符会在左侧操作数为假值时返回右侧操作数：
``` js
let a = null ?? 1;
let b = undefined ?? 1;
let c = 0 ?? 1;
let d = '' ?? 1;
console.log(a,b,c,d); // 1 1 0 ""

let cc = 0 || 1;
let dd = '' || 1;
console.log(cc,dd); // 1 1
```

- 可选链操作符`?.`
> 可选链操作符( ?. )允许读取位于连接对象链深处的属性的值，而不必明确验证链中的每个引用是否有效，在引用为空(nullish ) (null 或者 undefined) 的情况下不会引起错误。
``` js
let obj = {
  name: 'tom',
  a: {
    aa: 'rose'
  }
}

console.log(obj?.b?.bb);  // undefined   不会报错
console.log(obj.b.bb) // 直接报错
// 按之前的写法就得这样判断一下：obj.b ? obj.b.bb : ''
```
[参考](https://www.cnblogs.com/zhigu/p/13962661.html)





### requestAnimationFrame的使用

[用js实现一个无限循环的动画](https://www.jianshu.com/p/fa5512dfb4f5)

[考古挖掘：高刷显示器下的 requestAnimationFrame](https://mp.weixin.qq.com/s/lwQ2lTPMceGBrjaByc87DA)



## 收藏


- [关于JS中一些重要的api实现, 巩固你的原生JS功底](https://juejin.cn/post/6844903924520992782)
- [学会这20+个JavaScript单行代码，可以让你的代码更加骚气](https://mp.weixin.qq.com/s/cNLqiSfPNAaXDbLReberag)
- [56个JavaScript 实用工具函数助你提升开发效率！](https://juejin.cn/post/7019090370814279693)
---
title: 2022面试记录
date: 2022-04-17 18:33:18
# permalink: /pages/492fed/
article: false
categories: 
  - null
tags: 
  - null
permalink: false
---




## 第一次面试记录
> 这次是我打算从BOSS直聘离职后开始的面试记录，大概是从2月下旬到三月10号左右，持续了三个星期左右~


###  字节一面 2022.02.18
1. 介绍下项目中印象比较深刻的例子
2. 介绍以往工作中业务的相关信息
3. http1.1和http2之间的区别
    - http2的多路复用为什么会解决队头阻塞的问题
4. 一个手写代码题（题目都没看懂...瞎几把写..）
> 大致就是写个方法，比较下两个版本号的大小，版本号类似于：1.2.3, 1.2.4, 1.2.3.rc.4.



### 蓝湖一面 2022.02.18
1. 自我介绍
2. 介绍项目中遇到的技术难点（webpack打包，代码优化）
3. 实现滚动锚点效果：参考[京东商城](https://www.jd.com/?cu=true&utm_source=baidu-pinzhuan&utm_medium=cpc&utm_campaign=t_288551095_baidupinzhuan&utm_term=0f3d30c8dba7459bb52f2eb5eba8ac7d_0_d602d311361f4c6bb8199b6d8e57b796)
4. 算法题：二分法查找数组下标



### 58同城一面 2022.02.21
1. 自我介绍
2. 知识点: commonJs与esm的区别，http1.1与http2.0的区别，rem的计算规则，webpack打包性能优化,express和koa有什么区别
3. 算法题：[有效的括号](https://leetcode-cn.com/problems/valid-parentheses/)
4. 问下项目



### 度小满一面 2022.02.21
1. 自我介绍，讲一下项目中主要做了哪些
2. 会问一些比较基础的题：bfc，盒模型，px/pt/em/rem的区别，js引用类型与基本类型，
3. 手写题：html画一个圆圈，手写一个filter, 手写一个Promise.race
4. 开放问题：项目中怎么做监控（我答的是埋点，sourceMap定位bug）


### 阿里高德一面 2022.02.21
> 问得比较基础，也比较深，逮住一个问题使劲问你~
1. 自我介绍
2. webpack编译原理
3. ssr项目服务端渲染跟传统spa项目的区别, 为什么选择mpvue开发小程序、和vue的区别，Vue 的父组件和子组件生命周期钩子函数执行顺序,
5. 项目上线后，为了保证项目的稳定性都做了什么
4. 考一些比较基础的js同步异步任务，promise,setTimeOut



### 美团一面 2022.02.21
1. 主要是问项目中做过哪些比较难得业务，举两个例子，会一直问，问得比较细
> 我说了创作者平台的编辑器，说了用正则做md格式匹配，然后让我手写正则，我没写出来，当时想，肯定凉凉了...属于是自己挖坑把自己埋了😌...
2. 问下node的了解，平时有学习什么新技术等等



### 知乎一面 2022.02.22
1. 先问下有没有react相关经验，有没有做过小程序，然后就是做题
2. 
``` js
/**
 * 1.分别使用 React 类组件和函数组件实现一个登录表单，要求：
含有一个名为 username 的输入框，它的值会随着用户输入实时更新
含有一个名为 password 的输入框，它的值会随着用户输入实时更新
含有一个提交按钮，点击此按钮后在控制台打印出已填写的用户名和密码值
 */
// 我好几年没写过react了，就用Object.defineProperty实现了个双向绑定~估计凉凉~

 /**
  * 2.使用原生 JS 实现一个屏幕居中的弹窗。
<button>Click</button>
要求：
点击此按钮后屏幕中央出现一个弹窗
此弹窗水平和垂直方向都居中，弹窗内的文本内容是按钮的文字，即“Click”。
弹窗出现3秒后自动消失
  */
```

``` tsx
// LoginFormClass.jsx 类组件
import React, { Component } from 'react';

class LoginFormClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    };
  }

  handleUsernameChange = (e) => {
    this.setState({ username: e.target.value });
  }

  handlePasswordChange = (e) => {
    this.setState({ password: e.target.value });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log('用户名:', this.state.username);
    console.log('密码:', this.state.password);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <label htmlFor="username">用户名:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={this.state.username}
            onChange={this.handleUsernameChange}
            placeholder="请输入用户名"
          />
        </div>
        <div>
          <label htmlFor="password">密码:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={this.state.password}
            onChange={this.handlePasswordChange}
            placeholder="请输入密码"
          />
        </div>
        <button type="submit">提交</button>
      </form>
    );
  }
}

export default LoginFormClass;
```

``` tsx
// 函数组件
import React, { useState } from 'react';

function OptimizedLoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('表单数据:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">用户名:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="请输入用户名"
        />
      </div>
      <div>
        <label htmlFor="password">密码:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="请输入密码"
        />
      </div>
      <button type="submit">提交</button>
    </form>
  );
}

export default OptimizedLoginForm;
```



### 度小满二面 2022.02.23
1. 自我介绍
2. 项目中怎么进行webpack配置，eslint规范，vue3与vue2的区别，vite与webpack的区别
3. 手写题：
``` js
/**
 * function pollingApi(url:string, sendData:object = {},  flagFn:Function, timeout:number = 30000, throttle:number = 3000)
   @param url 轮询的url接口标识

* @param sendData 查询接口的入参
* @param flagFn 将接口返回的data传入此函数中 return true 后终止轮询，并返回当前res
* @param timeout 轮询多久 默认30s
* @param throttle 两次轮询间隔时间 默认3s
 * /
```


### 蓝湖二面 2022.02.23
1. 主要问项目上的东西，自己都做过什么
2. 会问些偏底层的东西，比如webpack的原理，node原理这些~
3. mixins有什么缺点


### 58同城二面 2022.02.24
1. 问了些项目上的问题，项目做过的性能优化
2. 一道手写题: 一维数组转换成树状结构
``` js
function treeFn(list) {
    function format(arr) {
        if (!arr || !arr.length) return [];
        return arr.map(v => {
            return {
                id: v.id,
                name: v.name,
                pid: v.pid,
                chidren: format(list.filter(_ => _.pid === v.id) || [])
            }
        })
    }
    return format(list.filter(v => !v.pid));
}
let arr = [
    {id: 1, name: '部门1', pid: 0},
    {id: 2, name: '部门2', pid: 1},
    {id: 3, name: '部门3', pid: 1},
    {id: 4, name: '部门4', pid: 3},
    {id: 5, name: '部门5', pid: 4},
]
console.log('=====', treeFn(arr));
```


### 白龙马一面 2022.02.24
1. `flex: 1`是哪几个属性的缩写
2. `flex-direction: column; align-item: center;` 是怎么布局
3. `new Vue()`执行了哪些流程
4. `Promise.all`怎么写，口述
5. 深拷贝怎么拷贝函数的？
6. 平时都怎么学习



### 度小满终面 2022.02.24
1. 问下对于项目线上的稳定性都做过些什么？（我答的是埋点，通过sourceMap来定位错误源码位置）
2. 其他忘了问啥了...



### 58同城hr面 2022.02.25
就问了些工作上的情况，为什么离职，比较下58和boss,等等...



### 欧科云链一面 2022.02.25
1. flex是什么布局，flex:1 是什么的缩写；口述实现子元素宽高等于父元素宽度一半的实现思路；
``` js
flex 实际上是 flex-grow、flex-shrink 和 flex-basis 三个属性的缩写。
flex-grow：定义项目的的放大比例；默认为0，即 即使存在剩余空间，也不会放大；
flex-shrink：定义项目的缩小比例；默认为1，即 如果空间不足，该项目将缩小；
flex-basis： 分配剩余空间时，子元素的默认大小, 默认值为auto；
```
> 实现子元素宽高等于父元素宽度一半
``` css
.outer {
    width: 400px;
    height: 600px;
    background: red;
}
.inner {
    width: 50%;
    height: 0;
    /* 相对父元素的width */
    padding-bottom: 50%; 
    background: #ff0;
}
```
2. 防抖和节流是什么，手写一个节流，手写一个随机乱序的数组
``` js
// 节流
function throttle(fn, wait) {
    let that = this;
    let prev = null;
    let timer = null;
    return function() {
        let cur = +new Date();
        if (!prev) prev = cur;
        if (timer) clearTimeout(timer);
        if (cur - prev > wait) {
            fn.apply(that, arguments);
            prev = cur;
        } else {
            setTimeout(function() {
                fn.apply(that, arguments);
            }, wait)
        }
    }
}


// 随机乱序
function randomArr(arr) {
    let res = new Array(arr.length).fill(undefined);

    const getRandomIndex = () => {
        let index = (Math.random() * arr.length) >> 0;
        if (res[index] !== undefined) {
            return getRandomIndex();
        } else {
            return index;
        }
    }
    for(let v of arr) {
        let index = getRandomIndex();
        res[index] = v;
    }
    return res;
}
console.log('====randomArr',randomArr([1,2,3,4,5]))
```
3. v-for为什么不能和v-if一起使用，vue有什么性能优化方案，虚拟滚动实现原理是什么，vue中data为什么会返回一个函数，而不是一个对象？css中scoped原理
``` js
css加scoped
原理：在标签加上v-data-something属性，再在选择器时加上对应[v-data-something]，即CSS带属性选择器，以此完成类似作用域的选择方式
用途：scoped会在元素上添加唯一的属性（data-v-x形式），css编译后也会加上属性选择器，从而达到限制作用域的目的；防止全局同名CSS污染
```
4. webpack面试题：module,chunk,bundle的区别，resolve有什么用， PostCSS是干什么的
``` js
resolve 配置 webpack 如何寻找模块所对应的文件

postcss 一种对css编译的工具，类似babel对js的处理。常见功能有：自动补全浏览器前缀、使用下一代css语法等等
- 第一个就是前面提到的把 CSS 解析成 JavaScript 可以操作的抽象语法树结构（Abstract Syntax Tree，AST）；
- 第二个就是调用插件来处理 AST 并得到结果。
```
5. react面试题: usememo 和 usecallback 的区别
``` js
useMemo 和 useCallback 接收的参数都是一样,第一个参数为回调 第二个参数为要依赖的数据

共同作用：仅仅 依赖数据 发生变化, 才会重新计算结果，也就是起到缓存的作用。

不同点：
useMemo 计算结果是 return 回来的值, 主要用于 缓存计算结果的值 ，应用场景如： 需要计算的状态
useCallback 计算结果是函数, 主要用于 缓存函数，应用场景如: 需要缓存的函数，因为函数式组件每次任何一个 state 的变化 整个组件 都会被重新刷新，一些函数是没有必要被重新刷新的，此时就应该缓存起来，提高性能，和减少资源浪费。
```




### 京东物流一面 2022.03.01
1. 聊项目，做过哪些项目优化，
2. koa洋葱模型，webpack打包原理，vue原理，ssr项目
3. 在学哪些新技术



### 百度一面 2022.03.02
1. 上来就是两个手写题：深拷贝、如何限制接口请求只能在10个以内
``` js
// 限制接口请求只能在10个以内
async function multiAPI(list, limit = 10) {
    let pendingArr = [];
    let pendingArr =  list.slice(0, limit);
    let waitArr = list.length > limit ? list.slice(limit) : [];
    
    return new Promise((resolve, reject) => {
        let result = [];
        let index = -1;
        pendingArr.forEach((v,i) => {
            Promise.resolve(v).then(res => {
                result.push(res);
                if (waitArr.length) {
                    pendingArr.splice(i,1);
                    pendingArr.push(waitArr.shift());
                }
                index ++;

                if (index >= list.length - 1) {
                    resolve(result);
                }
            }).catch(err => {
                reject(err);
            })
        })
    })
}

multiAPI(list).then(res => {

}).catch(err => {

})
```
2. 聊项目中让自己深刻的地方（我说了动态智能表单、有了社区）



### 快手一面 2022.03.03
1. 问项目，对于项目稳定性做过什么，http的强缓存与协商缓存，页面怎么做强制刷新，vue的生命周期都做了什么，vue中子组件在哪个生命周期中获取props
2. 一道手写题：1000000 => 1,000,000
> 没睡醒，差点没写出来~
``` js
function numFn(num) {
    let res = '';
    let arr = `${num}`.split('').reverse();
    let limit = 0;
    let i = 0;
    while(i < arr.length) {
        limit = Math.min(arr.length, i + 3);
        res += arr.slice(i, limit).join('');
        res += ',';
        i += 3;
    }
    res = res.split('').reverse().join('');
    return res.substring(1);
}
```


### 滴滴出行一面 2022.03.03
1. 聊一下项目（动态智能表单，有了社区）
1. 聊一下this，想到什么就说什么；
2. 说一下闭包，手写一个闭包；
3. 深拷贝与浅拷贝，手写一个深拷贝；
4. 手写一个数组去重的方法，不能使用es6新特性，需要判断类型和值
> [1,'1',2,...]



### 快手二面、三面 2022.03.03
1. 二面问的问题真的算是我这两周面的最难的了，都是偏底层原理的东西，keep-alive实现原理，问得差点想放弃； 
2. 两个手写题，Promise封装，对象扁平化处理

1. 三面先问的项目，对于项目稳定性做了哪些处理，等等
2. 手写一个反转数字的方法，考虑兼容各种异常情况



### 京东物流二面、三面 2022.03.04
主要问些项目上的问题，还有其他一些与技术无关的问题~




### 百度二面 2022.03.07
> 问了很多技术相关的基础知识点
1. http2 下服务器主动推送和WebSocket有什么区别？
>  http2 下服务器主动推送的是静态资源，和 WebSocket 以及使用 SSE 等方式向客户端发送即时数据的推送是不同的。
2. for in 跟 for of 有什么区别，哪个性能更好一些？


### 滴滴二面 2022.03.08
全程没有问技术，都问些项目问题，和其他一些软性的问题，面试下来我感觉没什么问题，但万万没想到的是二面居然没通过...现在也想不通为什么会挂...后来想想可能是在问我离职原因时，我说一直做重复的项目没意思吧...




### 百度三面 2022.03.11
1. 问下印象比较深的两个项目；
2. 问下在项目性能优化这一块做过什么
3. 在公司组件库开发中都做过什么
4. 口述两个算法题的实现思路：无重复字符的最长子串、Promise.all
5. 平时用什么方法在学习





## 第二次面试记录
> 这是我第一次面试结束，入职蓝湖两周后，再次裸辞，又开始的面试，持续时间也是三周左右...总的来讲没有第一次裸辞面试那么顺利...真心建议，没做好准备的话，千万别裸辞找工作，压力会很大的...


### 美团一面 2022.03.28
1. vue2跟vue3的区别: 双向绑定原理，用法，diff算法
2. js event loop；
3. 浏览器渲染流程，重排与重绘，浏览器渲染优化方案
> Q: 用js获取dom宽高会触发重排吗？
4. 前端监控:埋点，性能测试
5. 动画了解吗，requestIframe 
6. 一道算法题
``` js
// 笔试题：
/** 获取 url 中的参数
    1. 指定参数名称，返回该参数的值 或者 空字符串
    2. 不指定参数名称，返回全部的参数对象 或者 {}
    3. 如果存在多个同名参数，则返回数组 
    4. 不支持URLSearchParams方法 
*/

function getUrlParam(sUrl, sKey) {
    let [url, paramStr] = sUrl.split('?');
    if (!paramStr) return [];
    let arr = paramStr.split('&');
    let obj = {};
    arr.forEach(v => {
        let [key, val] = v.split('=');
        obj[key] = val;
    })
    
    if (sKey) {
        if (!obj[key]) return '';
        let res = [];
        Object.keys(obj).forEach(v => {
            if (v === sKey) res.push(obj[v]);
        })
        return res.length === 1 ? res[0] : res;
    }
    return obj;
}

console.log('====getUrlParam', getUrlParam('http://www.nowcoder.com?key=1&key=2&key=3&test=4#hehe key'))
```




### 新浪一面 2022.03.29
1. 线下面试（坐地铁去公司单程就近两个小时...），先是做一个小时的题，五页，都是手写，大多数都是基础题；
2. 然后问下页面性能优化的方案，首屏渲染时间优化方案，
3. 之后问下项目
> 新浪的大楼真漂亮...但他们用的技术比较老，还是jquery，而且他们感觉想找个稳定的，感觉不太适合...



### 字节一面 2022.03.29
1. 先问项目，有什么深刻的地方
2. 之后问ssr项目的渲染原理；
3. 然后是考js基础：基本数据类型，防抖和节流，eventLoop, defer与async的区别...
``` js
没有 defer 或 async，浏览器会立即加载并执行指定的脚本;
async: 当浏览器遇到 script 标签时，文档的解析不会停止，其他线程将下载脚本，脚本下载完成后开始执行脚本，脚本执行的过程中文档将停止解析，直到脚本执行完毕。
defer: 当浏览器遇到 script 标签时，文档的解析不会停止，其他线程将下载脚本，待到文档解析完成，DOMContentLoaded事件触发之前，脚本才会执行。
async和defer的最主要的区别就是async是异步下载并立即执行，然后文档继续解析，defer是异步加载后解析文档，然后再执行脚本，
```
4. css基础：重排与重绘，伪类与伪元素，样式选择器优先级， 哪些样式可以继承，哪些不可以
``` js
伪类：:hover、:first-child、:focus...; 伪元素：:before、:after...;  伪类用于当已有元素处于的某个状态时，为其添加对应的样式；伪元素用于创建一些不在文档树中的元素，并为其添加样式。

重排：添加、删除可见的dom、元素的位置改变、元素的尺寸改变(外边距、内边距、边框厚度、宽高、等几何属性)、浏览器窗口尺寸改变、获取某些属性（当获取一些属性时，浏览器为取得正确的值也会触发重排,它会导致队列刷新，这些属性包括：offsetTop、offsetLeft、 offsetWidth、offsetHeight、scrollTop、scrollLeft、scrollWidth、scrollHeight、clientTop、clientLeft、clientWidth、clientHeight、getComputedStyle() (currentStyle in IE)。所以，在多次使用这些值时应进行缓存。）
重绘：vidibility、color、背景颜色、opacity

无继承性的css属性：display、width/height/margin/padding/border/background/position/
有继承性的css属性：font-famliy/font-size/font-weight/text-align/color/

css选择器优先级：!important > 行内样式 > ID选择器 > 类选择器 > 元素 > 通配符 > 继承 > 浏览器默认属性
```
5. 算法题
``` js
[] == ![] // true
{} == !{} // false
1 + '1' // 11
'a' + + 'b' // aNaN

// 1. 数组去重
// 2. 求最大回文字符串
// 3. 用apply实现bind
```


### 美团二面 2022.03.30
1. 主要问项目上的问题，和一些软性的东西：怎么学习，你的优缺点，等等
2. 一道简单的算法题，去重
3. 问了解哪些测试工具，因为我面试的是主要做测试工具类的部门...平时没关注过，没说出来....结果凉凉了...



### 微软一面 2022.03.31
1. 问印象比较深的项目
2. vue与react的区别，vue2跟vue3的区别，vue2双向绑定原理
3. 手写一个hover弹窗
4. 算法题：判断链表是否有环（居然会考链表...以为前端应该不会的...大意了..说了思路，但没写出来...）
5. 问两个英语问题：a.为什么离职？b.来微软的理由？
> 能听出来是这两个问题，但回答得磕磕绊绊...



### 新浪微博一面 2022.04.01
主要是问些比较基础的问题，js,css,html都问了；也问了些项目上的问题，没有做题，面的时间挺长的，一个多小时...


### 小红书一面 2022.04.01
1. 问项目，印象深刻的难点；
2. 一些常规的八股文知识点
3. 两道算法题：Promise封装一个异步接口请求，手写一个flat方法

### 新浪微博二面 2022.04.02
1. 问项目，性能优化；
2. 平时自己有什么规划，从哪里学新知识，对前端技术未来发展的展望；


### 网易一面 2022.04.06
1. 先问项目，做过哪些让你深刻的项目；
2. vue2与vue3, vite与webpack，seo项目有什么区别，做过哪些打包配置的优化，没做题...


### 新浪微博三面 2022.04.06
电话面，主要是问项目，做过哪些性能优化，等等...
nginx的rewrite和location是什么作用



### 自如一面 2022.04.08
1. 上来先问ES6常用的方法，接着就让手写一个Promise...之后说下Promise怎么实现异步，async/await的实现原理...
2. 之后说下【管道】的怎么实现？
> 函数2接受函数1返回的值，作为入参，以此类推...，没想出来，可以用reduce实现
``` js
function fn1(x) {
    return x+1;
}
function fn2(x) {
    return x+2;
}
function fn3(x) {
    return x+3;
}

const a = compose(fn1, fn2, fn3);
```
3. 说下怎么拉平一个对象？
> 递归
4. 深拷贝中怎么解决循环引用问题？
> 用Map缓存
5. vue2和vue3的有什么差异，vue-router的原理，vuex的原理
6. 印象比较深刻的项目



### 自如二面 2022.04.11
1. 首先上来就让我共享桌面，然后问下了几个软性的问题，自己的优势，在团队中的发挥过哪些作用...问得我一脸懵逼...
2. 然后就马上让我实现个对input输入框中内容排序的功能，还要求必须用Vue来写，而且还必须重新新启一个项目...我代码写出来了，但非得让我跑出来了....我用npm装vue/cli的时候一直装不上...加上这个面试官可能是我面过这么多次感觉最恶心的了，心情极度不爽, 就直接给他说跑不了，结束了面试~
> 后来试了用yarn安装vue/cli，可以在本地跑起来了~




## 重点面试题记录

- webpack编译原理
- node原理，express和koa的区别
- react原理
- 前端项目性能监控

``` js
// 删除对象中空数组和空对象
function filter(obj) {

Object.keys(obj).forEach(v => {
    if (Object.prototype.toString.call(obj[v]) === '[object Object]') {

        Object.keys(obj[v]).length ? filter(obj[v]) : delete obj[v];

    } else if (Object.prototype.toString.call(obj[v]) === '[object Array]' && !obj[v].length) {
        delete obj[v];
    }
})
return obj;
}

const obj = {
    a: 1,
    b: 2,
    c: [],
    d: {
        e: 1,
        f: 2,
        g: [],
        h: {
            i: 'a',
            j: 'b',
            k: [],
            l: 333,
            m: {}
        }
    },
    e: [1,2]
}
// console.log('====1111', filter(obj));
```



## 自我介绍

面试官，你好，我叫周元，我是16年毕业，毕业后先是在成都工作一年；
> Dear interviewer, good afternoon, my name is Zhou Yuan, and have graduated in 2016. After graduation, I worked in Chengdu for almost one year.

17年7月来到北京，先是在vipkid工作，在vipkid工作期间我主要参与了小班课业务相关项目的开发；
> I came to Beijing in July 2017. First, I worked in VIPKID, where I mainly engaged in the development of h5 and PC projects.

然后是19年9月份离职来到boss直聘，就一直在boss直聘工作到现在；在boss直聘工作期间，我主要负责包括后台管理系统、公司内部的办公系统、有了社区等项目的开发；
> Then, in September 2019, I came to Boss Zhipin. During my work in Boss Zhipin, I was mainly responsible for the development of backstage management system and Youle community and so on.

在我从事前端开发这几年里，我参与过的项目其实也有一些，我简历上罗列的是相对比较重要的项目，比如最近一直在负责的有了社区，创作者平台、职业百科SEO，这些都是面向C端的项目；平时也会负责一些其他的项目，比如管理后台系统，内部办公系统，h5项目，等等。之前在vipkid工作期间呢，也是主要负责微信h5端，pc学生端的项目的开发；

总体来讲，平时项目开发中用得最多的技术栈是vue，包括C端的有了社区，B端的管理系统，等等；react用得相对较少，但在管理后台和h5项目中都使用react开发过；之前也使用过node开发过全栈的后台管理系统；平时工作中一些常用的前端技术基本都有涉及。
> Generally speaking, for me, the most commonly used technology stack in project is VUE. Although react is less used, it has been used in the backstage management system and h5 project. I have also used node to develop the full stack backstage management system. In a word, some commonly used FE technologies are basically involved in my daily work.

以上呢，我的个人简介，thank you。
> That is my personal profile, thank you.


## 英语面试
::: tip 词汇
- 简历 resume
- 栈 stack
- 二叉查找树 binary search tree
- 前端工程师 front end engineer
- 离职 dimission, leave office
- 职业规划 career planning
- 技术 technology
:::


Q: 你为什么要离职呢？

A: 一个原因是，在二月份的时候，家里面有点事情需要处理，所以我回去呆了差不多一个月解决家里的事情；另一个原因是，我感觉在boss直聘个人发展到了一定瓶颈，也想换一个环境更有助于自己的成长。
> There were two reasons why I resigned. One reason is that I had to return my hometown to deal with some things, so I stayed at home for almost one month; Another reason is that I encountered some bottlenecks of my personal development in Boss Zhipin. So I would like to switch to a new environment which will be more conducive to my growth.


Q: 你为什么想加入微软？

A: 首先微软作为一个全球来讲比较成熟领先的互联网公司，我希望在给公司贡献我的能力的同时，也能学到一些其他新的技术，新的思维；然后我觉得经过几十年的发展，微软已经成为行业内很优秀的企业，我觉得如果能为公司的发展贡献一点我的微薄力量，也是我的荣幸。
> Microsoft is a well-known and mature internet corporation. I hope I can learn some other new technologies like ssr and new thinking mode there. I will also devote myself to Microsoft. I think it is my honor to contribute my efforts to company. 


Q: 平时都是怎么学习的？

A: 平时周末如果有时间的话，我会学习我感兴趣的技术；比如在GitHub看相关的源码，在B站或掘金等技术社区里面看一些前端技术文章或视频；如果想学习更多的话，我也会通过买网课或买书的方式来进行学习。
> I learn the technology I am interested in during my spare time. For example, I often study the source code on GitHub and watch some articles or videos about front-end technology of technical communities on Bilinili or Juejin. I will also buy some online lessons or books if I want to learn more.


Q: 评价下你自己？

A: 总来来说，我觉得自己不算是一个外向的人，平时在工作中可能比较安静，但我觉得我是一个自驱力还行的人吧，会要求自己持续去学习一些东西，总的来说，算是一个值得信赖的人吧。
> Generally speaking, I don't think I am an extrovert. I may be quiet at work. But I think I am a self-driven person, because I am strict with myself and always keep learning. In a word, I am a trustworthy person.



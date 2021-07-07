# Vue项目性能优化技巧


## 代码层面的优化

### v-if 和 v-show 区分使用场景
> v-if 是真正的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建；

> v-show 不管初始条件是什么，元素总是会被渲染，并且只是简单地基于 CSS 的 display 属性进行切换。

v-if 适用于在运行时很少改变条件，不需要频繁切换条件的场景；v-show 则适用于需要非常频繁切换条件的场景。


### computed 和 watch 区分使用场景
> computed：是计算属性，依赖其它属性值，并且 computed 的值有缓存，只有它依赖的属性值发生改变，才会重新计算；

> watch：更多的是「观察」的作用，类似于某些数据的监听回调 ，每当监听的数据变化时都会执行回调进行后续操作；

1. 当我们需要进行数值计算，并且依赖于其它数据时，应该使用 computed，因为可以利用 computed 的缓存特性，避免每次获取值时，都要重新计算；
2. 当我们需要在数据变化时执行异步或开销较大的操作时，应该使用 watch.

### v-for 遍历必须为 item 添加 key，且避免同时使用 v-if
> 待补充...

[参考](https://cn.vuejs.org/v2/style-guide/#%E9%81%BF%E5%85%8D-v-if-%E5%92%8C-v-for-%E7%94%A8%E5%9C%A8%E4%B8%80%E8%B5%B7%E5%BF%85%E8%A6%81)


### v-once 和 v-pre 提升性能
> 见上一篇博文~


### 长列表性能优化
> Vue 会通过 Object.defineProperty 对数据进行劫持，来实现视图响应数据的变化；但有时对于纯粹展示的数据，就不需要 Vue 来劫持，这能够很明显的减少组件初始化的时间。
``` js
// 可通过 Object.freeze 方法来冻结一个对象，一旦被冻结的对象就再也不能被修改了。
async created() {
    const users = await axios.get("/api/users");
    this.users = Object.freeze(users);
}
```

### 事件的销毁
> Vue 组件销毁时，会自动清理它与其它实例的连接，解绑它的全部指令及事件监听器，但是仅限于组件本身的事件。如果在 js 内使用 addEventListene 等方式是不会自动销毁的，我们需要在组件销毁时手动移除这些事件的监听，以免造成内存泄露。
``` js
created() {
 addEventListener('click', this.click, false)
},
beforeDestroy() {
 removeEventListener('click', this.click, false)
}
```

### 图片资源懒加载
> 使用第三方插件：`vue-lazyload`

### 路由懒加载
> Vue 是单页面应用，很多路由的引入会使 webpcak 打包后的文件很大；当进入首页时，加载的资源过多，页面会出现白屏的情况，不利于用户体验。如果把不同路由对应的组件分割成不同的代码块，当路由访问时才加载对应的组件，就会大大提高首屏显示的速度。
``` js
const router = new VueRouter({
    routes: [
    {
        name: '首页',
        path: '/homepage',
        component: resolve => require.ensure([], () => resolve(require('@/package/views/hompage.vue')), 'hompage'), // 懒加载
        meta:{}
    },
    ]
})
```


### 第三方插件的按需引入
> 我们在项目中经常会需要引入第三方插件，如果我们直接引入整个插件，会导致项目的体积太大，我们可以借助 babel-plugin-component ，然后可以只引入需要的组件，以达到减小项目体积的目的。

以下为项目中引入 element-ui 组件库为例：

1. 首先，安装 babel-plugin-component ：
``` js
npm install babel-plugin-component -D
```

2. 然后，将 .babelrc 修改为：
``` js
{
    "presets": [["es2015", { "modules": false }]],
    "plugins": [
        [
            "component",
            {
                "libraryName": "element-ui",
                "styleLibraryName": "theme-chalk"
            }
        ]
    ]
}
```
3. 在 main.js 中引入部分组件：
``` js
import Vue from 'vue';
import { Button, Select } from 'element-ui';
 Vue.use(Button)
 Vue.use(Select)
```

### 优化无限列表性能
> 对于无限循环列表，可以采用虚拟滚动来实现，参考第三方插件：vue-virtual-scroll-list 和 vue-virtual-scroller 。


## Webpack 层面的优化

### Webpack 对图片进行压缩
> 在 vue 项目中可以在 url-loader 中设置 limit 大小来对图片处理，对小于 limit 的图片转化为 base64 格式；对有些较大的图片资源，可以使用 image-webpack-loader 来压缩图片。
``` js
// webpack.config.js
{
    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
    use:[
        {
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: utils.assetsPath('img/[name].[hash:7].[ext]')
            }
        },
        {
            loader: 'image-webpack-loader', // 压缩图片
            options: {
                bypassOnDebug: true,
            }
        }
    ]
}
```

### 减少 ES6 转为 ES5 的冗余代码
> Babel 插件在将 ES6 代码转换成 ES5 代码时会注入一些辅助函数，在默认情况下， Babel 会在每个输出文件中内嵌这些依赖的辅助函数代码，如果多个源代码文件都依赖这些辅助函数，那么这些辅助函数的代码将会出现很多次，造成代码冗余。

babel-plugin-transform-runtime 插件可以将相关辅助函数进行替换成导入语句，从而减小 babel 编译出来的代码的文件大小。
``` js
// 安装
npm install babel-plugin-transform-runtime --save-dev

// 配置
// .babelrc
"plugins": [    "transform-runtime"]
```

### 提取公共代码
> 如果项目中没有将每个页面的第三方库和公共模块提取出来，则项目会存在`相同的资源被重复加载，浪费用户的流量和服务器的成本；每个页面需要加载的资源太大，导致网页首屏加载缓慢，影响用户体验。`这些问题。

所以我们需要将多个页面的公共代码抽离成单独的文件，来优化以上问题。在 webpack3 中我们使用`webpack.optimize.CommonsChunkPlugin` 插件进行提取，webpack4 中我们可以直接使用`optimization`配置项进行配置。


### 模板预编译
> 可以使用 vue-template-loader，它可以在构建过程中把模板文件转换成为 JavaScript 渲染函数。

（不了解，待完善...）

### 提取组件的 CSS
> 当使用单文件组件时，组件内的 CSS 会以 style 标签的方式通过 JavaScript 动态注入。这有一些小小的运行时开销，如果你使用服务端渲染，这会导致一段 “无样式内容闪烁 (fouc) ” 。将所有组件的 CSS 提取到同一个文件可以避免这个问题，也会让 CSS 更好地进行压缩和缓存。
- webpack + vue-loader ( vue-cli 的 webpack 模板已经预先配置好)

### 优化 SourceMap
> 项目打包后，会将开发中的多个文件代码打包到一个文件中，并且经过压缩、去掉多余的空格、babel编译化后，最终将编译得到的代码会用于线上环境，那么这样处理后的代码和源代码会有很大的差别，当有 bug的时候，我们只能定位到压缩处理后的代码位置，无法定位到开发环境中的代码，对于开发来说不好调式定位问题，因此 sourceMap 出现了，它就是为了解决不好调式代码问题的。

- 开发环境推荐：`cheap-module-eval-source-map`；
- 生产环境推荐：`cheap-module-source-map`；


### 构建结果输出分析
> 可以使用第三方插件：webpack-bundle-analyzer 对构建结果进行分析，能更可视化地比较还有哪些地方需要优化~



## 基础的 Web 技术优化

### 开启 gzip 压缩
> gzip 是 GNUzip 的缩写，最早用于 UNIX 系统的文件压缩。HTTP 协议上的 gzip 编码是一种用来改进 web 应用程序性能的技术，web 服务器和客户端（浏览器）必须共同支持 gzip。目前主流的浏览器，Chrome，firefox，IE等都支持该协议。常见的服务器如 Apache，Nginx，IIS 同样支持，gzip 压缩效率非常高，通常可以达到 70% 的压缩率，也就是说，如果你的网页有 30K，压缩之后就变成了 9K 左右。

（服务端和客户端具体如何压缩，待完善...）

### 浏览器缓存
> 为了提高用户加载页面的速度，对静态资源进行缓存是非常必要的；关于http的缓存机制，可参考[《透视HTTP协议》学习笔记](/tool/http/)~

### CDN 的使用
> 浏览器从服务器上下载 CSS、js 和图片等文件时都要和服务器连接，而大部分服务器的带宽有限，如果超过限制，网页就半天反应不过来。而 CDN 可以通过不同的域名来加载文件，从而使下载文件的并发连接数大大增加，且CDN 具有更好的可用性，更低的网络延迟和丢包率 。

### 使用 Chrome Performance 查找性能瓶颈
> Chrome 的 Performance 面板可以录制一段时间内的 js 执行细节及时间。使用 Chrome 开发者工具分析页面性能的步骤如下。

（待了解..）



## 参考
- [关于 Vue 项目性能优化技巧分享](https://mp.weixin.qq.com/s/qAEHZtwxhV4IAub-j-2yqw)

<fix-link label="Back" href="/skills/"></fix-link>
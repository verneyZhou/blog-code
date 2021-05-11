# 其他功能点

## iconfont
---
[官网](https://www.iconfont.cn/)

[使用参考](https://juejin.cn/post/6844903517564436493)

1. [unicode引入](https://blog.csdn.net/laptoper/article/details/77982738)
    - 进入官网，选择图标库，将自己需要的图标添加购物车，统一添加至某个项目；
    - 进入该项目，可以选择：unicode、font class、symbol 三种方式，也可以下载到本地也可以直接使用cdn外链；
    - 选择unicode方式，并通过cdn外链引入，在项目中添加font-face：
    ``` css
    // fonts.scss
    @font-face {
        font-family: 'iconfont';  /* project id 1742077 */
        src: url('//at.alicdn.com/t/font_1742077_61kn9ba91jy.eot');
        src: url('//at.alicdn.com/t/font_1742077_61kn9ba91jy.eot?#iefix') format('embedded-opentype'),
        url('//at.alicdn.com/t/font_1742077_61kn9ba91jy.woff2') format('woff2'),
        url('//at.alicdn.com/t/font_1742077_61kn9ba91jy.woff') format('woff'),
        url('//at.alicdn.com/t/font_1742077_61kn9ba91jy.ttf') format('truetype'),
        url('//at.alicdn.com/t/font_1742077_61kn9ba91jy.svg#iconfont') format('svg');
    }
    ```

    - 在样式中定义.iconfont
    ``` css
    // index.scss
    @import './fonts.scss';

    .iconfont{
        font-family:"iconfont" !important;
        font-size:16px;font-style:normal;
        -webkit-font-smoothing: antialiased;
        -webkit-text-stroke-width: 0.2px;
        -moz-osx-font-smoothing: grayscale;
    }
    ```

    - 页面中使用
    ``` html
    <i class="iconfont">&#xe6eb;</i>  // 标签内的编码是每个图标对应的编码，可在官网自己的项目中查看~
    ```


2. font-class引入方式
    - 还是在官网的我的项目里，选择font class方式，可以下载到本地，也可以直接cdn引入；
    ``` css
    // styles/index.scss
    @import '//at.alicdn.com/t/font_1742077_61kn9ba91jy.css'; // cdn引入font-class
    ```
    
    - 页面使用
    ``` html
    <i class="iconfont icon-auto"></i> // icon-auto为每个图标对应的class，可在官网项目中查到
    ```

3. symbol方式
``` js
// 引入 iconfont.js
import '@/assets/iconfonts/iconfont.js';

// 定义通用样式
.icon {
   width: 1em;
   height: 1em;
   vertical-align: -0.15em;
   fill: currentColor;
   overflow: hidden;
}

// 使用
<svg class="icon" aria-hidden="true">
    <use xlink:href="#icon-bussiness-man"></use>
</svg>
```


4. svg-sprite的使用

    - 封装svg-icon组件
    ``` js
    // src/components/svg-icon/index.vue
    <template>
    <svg :class="svgClass" aria-hidden="true">
        <use :xlink:href="iconName"></use>
    </svg>
    </template>

    <script>
    export default {
        name: 'svg-icon',
        props: {
            iconClass: {
            type: String,
            required: true
            }
        },
        computed: {
            iconName() {
                return `#icon-${this.iconClass}`
            },
            svgClass() {
                if (this.className) {
                    return 'svg-icon ' + this.className
                } else {
                    return 'svg-icon'
                }
            },
        }
    }
    </script>

    <style scoped>
    .svg-icon {
        width: 1em;
        height: 1em;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
    }
    </style>
    ```

    - 全局注册，导入所有svg图标
    ``` js
    // src/icons/index.js

    import Vue from 'vue'
    import SvgIcon from '@/components/svg-icon'// svg component

    // 全局注册
    Vue.component('svg-icon', SvgIcon)

    // 自动require所有svg图标
    const req = require.context('./svg', false, /\.svg$/)
    const requireAll = requireContext => requireContext.keys().map(requireContext)
    requireAll(req)
    ```

    - 添加svg图标：在官网下载所需图标的svg文件，放在 src/icons/svg/ 目录下；
    
    - 打包优化 svg-sprite-loader；[参考](https://blog.csdn.net/weixin_34120274/article/details/91440129)
        - 下载：`npm install svg-sprite-loader -D`
        - 配置
        ``` js
        // vue.config.js

        // set svg-sprite-loader
            config.module
            .rule('svg')
            .exclude.add(resolve('src/icons'))
            .end()
            config.module
            .rule('icons')
            .test(/\.svg$/)
            .include.add(resolve('src/icons'))
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]'
            })
            .end()
        ```
    - 使用
    ``` html
    <svg-icon icon-class="clipboard"></svg-icon>
    ```



## echarts
---
[官网](https://echarts.apache.org/zh/index.html)



## Excel：导入、导出、压缩
---
导出：xlsx、file-saver、
导入：xlsx
导出zip压缩文件：jzip、file-saver


## PDF打印
---
window.print()



## clipboard：复制
---
第三方：clipboard
方法1：直接用js方法
方法2：指令封装


## 换肤
---


## 权限
---



<fix-link label="Back" href="/project/vue-node-admin/"></fix-link>
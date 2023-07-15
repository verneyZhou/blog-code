---
title: 使用vite开发一个自己的Vue3组件库
date: 2023-07-15 21:59:56
permalink: false
categories:
  - npm
  - 组件库
tags:
  - 组件库
---


# 使用vite开发一个自己的Vue3组件库


Vue3 UI库`VerneyUI`
- [npm地址](https://www.npmjs.com/package/vue3-verney-ui)
- [github地址](https://github.com/verneyZhou/vue3-verney-ui)


## 开发流程

我是使用`vite`来开发这个组件库的，node版本要求`v16+`


### 项目新建

- `pnpm create vite`：按提示操作即可~

[https://cn.vitejs.dev/guide/](https://cn.vitejs.dev/guide/)



- 改造项目

```
├── packages // 组件开发在这里
    ├── waterfall // 组件
        ├── index.vue
        ├── index.ts // 导出文件
    ├── index.ts // 入口
└── src  // 这里跟常规项目一样，开发时可先通过相对路径引入组件，进行调试
    ├── App.vue
    ├── main.ts // 入口
    ├── env.d.ts // ts的.vue文件适配
├── .eslinttrc.js // eslint规范
├── index.html
├── tsconfig.json // TypeScript 配置文件
├── vite.config.ts // Vite 配置文件
└── package.json
```


- 组件开发，本地调试，就跟在常规项目开发组件一样~

``` js
// packages/index.ts


import Waterfall from "./waterfall";

const verneyUI = {
    Waterfall
}

// 导出
export default {
    install(app: any) {
        Object.keys(verneyUI).forEach(comp => {
            app.component(verneyUI[comp].name, verneyUI[comp])
        })
    },
    ...verneyUI
}
```


### 构建

- 配置`vite.config.ts`

参考：[vite lib 构建配置](https://cn.vitejs.dev/guide/build.html#library-mode)

``` js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
	outDir: "dist", //输出文件目录
	lib: { //库编译模式配置
      entry: path.resolve(__dirname, 'packages/index.js'), // 打包入口
      name: 'vue3-verney-ui', // 库名称,设置前需在npm官网查询是否重名
      fileName: (format) => `verney-ui.${format}.js`, // 生成js文件名称
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
        },
      },
    },
	},
})
```


- 打包：`npm run build`

``` shell
➜  verney-ui git:(master) ✗ npm run build

> vue3-verney-ui@1.0.0 build
> vue-tsc && vite build

vite v4.4.2 building for production...
✓ 9 modules transformed.
dist/style.css        0.44 kB │ gzip: 0.20 kB
dist/verney-ui.es.js  4.01 kB │ gzip: 1.43 kB
dist/verney-ui.umd.js  3.07 kB │ gzip: 1.28 kB
```


- 配置`package.json`

``` json
{
    "name": "vue3-verney-ui", // 包名称，设置前需在npm官网查询是否重名
    "private": false, 
    "version": "1.0.0", // 版本号
    "type": "module", // 如果 package.json 不包含 "type": "module"，Vite 会生成不同的文件后缀名以兼容 Node.js。.js 会变为 .mjs 而 .cjs 会变为 .js
    "files": [
        "dist"
    ],
    "main": "./dist/verney-ui.umd.js", // 入口文件，需指向最终编译后的包文件。
    "module": "./dist/verney-ui.es.js",
    "description": "一个简单的 Vue3 UI 库~", // 描述
    "keywords": [ // 关键词
        "verney-ui"
    ],
    "exports": {
        "./dist/style.css": "./dist/style.css", // 子目录别名，方便样式引入
        ".": { // 模块的主入口，优先级高于main字段，利用.这个别名，为 ES6 模块（import）和 CommonJS （require）指定不同的入口
        "import": "./dist/verney-ui.es.js",
        "require": "./dist/verney-ui.umd.js"
        }
    },
}
```


### 发布

- `npm login`,输入账户密码登录，也需要输入邮箱，输入验证码~

- `npm publish`，发布，成功在[npm官网](https://registry.npmjs.org/)输入关键词就能看到刚发布的包~


### 使用

- `pnpm i vue3-verney-ui -S`

- 注册

``` js
// src/main.ts

import VerneyUI from 'vue3-verney-ui';
import "vue3-verney-ui/dist/style.css";

// 全局挂载
createApp(App)
.use(VerneyUI)
.mount('#app')


// 直接使用
<Waterfall>
    <template #card="{ item, index }">
    {/*自定义卡片内容 */}
    </template>
</Waterfall>
```






## 组件目录

- 瀑布流

- toast

- dialog

- 懒加载

- 虚拟滚动列表

- ...


## 收藏

- [vue3水印插件开发：如何在vite上开发vue插件并且发布到npm](https://juejin.cn/post/7165313982926946318)
- [vite开发vue3瀑布流组件：v3-waterfall](https://github.com/gk-shi/v3-waterfall)


## 参考


- [使用vite构建Vue3组件库，发布npm包](https://blog.csdn.net/y227766/article/details/126426546)
- [Vue3+TS+Vite开发组件库并发布到npm](https://blog.csdn.net/Dandrose/article/details/129142403)

- [vue插件开发、文档书写、github发布、npm包发布一波流](https://juejin.cn/post/6844903679162581005)


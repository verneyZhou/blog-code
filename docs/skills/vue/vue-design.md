---
title: 从0到1搭建Monorepo组件库项目
date: 2023-12-03 18:25:40
permalink: false
categories:
  - vue
  - 组件库
  - monorepo
tags:
  - 组件库
  - vitepress
  - monorepo
  - vite
---

# 从0到1搭建Monorepo组件库项目

> 这里是我从0到1搭建Monorepo组件库项目的笔记~



- [源码地址](https://github.com/verneyZhou/verney-vue-design)

- [组件库文档](https://verney-vue-design-verneyzhou.vercel.app/)



## 准备


- **Monorepo**

**单仓库，多项目**。就是指在一个大的项目仓库中，管理多个模块/包（package），这种类型的项目大都在项目根目录下有一个packages文件夹，分多个项目管理。大概结构如下：

```
-- packages
  -- pkg1
    --package.json
  -- pkg2
    --package.json
--package.json
```
> 目前很多我们熟知的项目都是采用这种模式，如[Vant](https://github.com/youzan/vant)，[ElementPlus](https://github.com/element-plus/element-plus)，[Vue3](https://github.com/vuejs/core)等。打造一个Monorepo环境的工具有很多，如：`lerna、pnpm、yarn`等，这里我们将使用`pnpm`来开发我们的UI组件库, 因为它简单高效，它没有太多杂乱的配置。


- **pnpm**

> `pnpm`代表`performance npm`（高性能的`npm`），对于包的管理是很方便的,尤其是对于一个 Monorepo 的项目。因为对于我们即将开发的组件库来说可能会存在多个 package(包),而这些包在我们本地是需要相互关联测试的,刚好 pnpm 就对其天然的支持。

其实像其它包管理工具,比如 yarn、lerna 等也能做到,但是相对来说比较繁琐。而 pnpm 现在已经很成熟了,像 Vant，ElementUI 这些明星组件库都在使用 pnpm,因此本项目也采用 pnpm 作为包管理工具。

[pnpm官方文档](https://www.pnpm.cn/)



- **Vite**
> Vite算是这两年的热门明星脚手架了，这里不做过多介绍了，现在快速搭建`vue3`项目基本都会选择它~

[Vite官方文档](https://cn.vitejs.dev/)



- **Vitepress**
> VitePress与[VuePress](https://vuepress.vuejs.org/)比较类似，都是Vue驱动的静态网站生成器，只是 VuePress 是基于 Webpack 构建的，VirePress 是基于Vite构建的, 在这个项目中我选择用 VitePress 来构建组件库文档~

[VitePress官网](https://vitejs.cn/vitepress/)








## 项目搭建
> 接下来从0到1开始搭建这个项目吧~


### 初始化

- 新建项目：`mkdir verney-vue-design`; `cd verney-vue-design`进入项目目录；

- 安装pnpm: `npm install pnpm -g`
> 安装完成可通过`pnpm -v`查看版本号~

- 初始化`package.json`: `pnpm init`;


- 安装vue3, ts, less: `pnpm i vue@latest typescript less -D -w`
> 开发环境中的依赖一般全部安装在整个项目根目录下，方便下面我们每个包都可以引用,所以在安装的时候需要加个 `-w`; 

> 因为开发的是vue3组件， 所以需要安装vue3；less 是方便写样式，也可以安装 scss...


- ts配置：根目录下新建`tsconfig.json`: `npx tsc --init`, 进行 ts 配置：

``` json
// tsconfig.json

{
  "compilerOptions": {
    "baseUrl": ".",
    "jsx": "preserve",
    "strict": true,
    "target": "ES2015",
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "moduleResolution": "Node",
    "lib": ["esnext", "dom"],
    "rootDirs": ["./", "./packages/components"],
    "paths": {
      "@/*": ["packages/components/src/*"]
    }
  }
}
```


### 包关联配置

> 我们新建一个 `packages` 文件夹用于后续来存放我们的各种包; 假如我们有了 `a` 包和 `b`, 为了方便 a 引用 b 时`pnpm add @xxx/b`不报错，需要先进行包关联配置~

- 项目根目录下新建`pnpm-workspace.yaml`：

``` yml
packages:
    - 'packages/**' # 里面会放组件库，工具库等子项目
    - 'examples' # 组件预览项目，可用于调试组件
    - 'docs' # 组件文档项目
```
> 这样就能将我们项目下的`packages`目录和`examples, docs`目录关联起来了, 之后在组件库中引用工具库时就会看到它的效果~

[pnpm-workspace.yaml](https://pnpm.io/zh/pnpm-workspace_yaml)定义了 工作空间 的根目录，并能够使您从工作空间中包含 / 排除目录 。 默认情况下，包含所有子目录。



### 组件预览项目
> 首先搭建一个组件预览项目，可用于调试`packages/`中开发的组件和工具包；就是搭建一个简单的Vite项目, 用于本地调试开发的组件和函数~


- 项目根目录下新建项目：`mkdir examples`，进入该目录；
> `examples`项目也可以直接在根目录下`pnpm create vite`，根据[Vite脚手架](https://cn.vitejs.dev/guide/#scaffolding-your-first-vite-project)的提示命令快速创建一个Vite项目; 这里记录的是基础的手动配置流程，效果都是一样的~


- `pnpm init`；配置`scripts`脚本启动项目：

``` json
...
"scripts": {
    "dev": "vite"
  },
...
```

- 安装 vite: `pnpm install vite @vitejs/plugin-vue -D -w`
> 上面讲过，`-w`会自动安装到项目根目录下，方便后续其他子项目使用; `@vitejs/plugin-vue`用来支持`.vue`文件的转译~


- 新建`vite.config.ts`, 配置：

``` ts
// examples/vite.config.ts

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 3010, // 设置服务启动端口号
        open: true, // 设置服务启动时是否自动打开浏览器
        cors: true, // 允许跨域
    },
    plugins:[vue()]
})
```

> 简单配置完成后，就可以开始初始化项目了~

- 新建`App.vue, index.html, main.ts, vue-shim.d.ts`文件, 代码比较简单，具体见源码，这里就不展示了~

``` js
// examples/vue-shim.d.ts

// TypeScriptTS默认只认ES 模块
// 如果你要导入.vue文件就要declare module把他们声明出来
declare module '*.vue' {
    import type { DefineComponent } from "vue";
    const component:DefineComponent<{},{},any>
}
```

- 初始化完成后，`pnpm run dev`，如果浏览器访问`http://localhost:3010`访问成功，即表示项目初始化成功~



### 工具库项目
> 接着先搭建一个工具库项目，在这个项目里可以封装一些可以在组件库或其他业务场景中经常用到的方法或函数~

- 新建项目：`packages/verney-utils`, 进入该目录；


- 初始化：`pnpm init`， 让它变成一个包:

``` json
{
  "name": "@verney-design/utils", // 自定义包名称
  "version": "1.0.0", // 版本信息
  "description": "", // 描述
  "main": "index.ts", // 入口
  // ...
}
```

- 新建`index.ts`, 先写个简单的`addFn`方法，并导出：

``` ts
// packages/verney-utils/index.ts

function addFn(a: number, b: number): number {
    return a + b
}

export {
    addFn
}
```

简单初始化之后，如果想添加其他方法可在`packages/verney-util/src/`目录下添加`ts`文件，`packages/verney-util/index.ts`导出即可~

> 之后我们新建组件库项目，试下在该项目中使用`addFn`方法~



### 组件库项目
> 接着我们先搭建最重要的组件库项目，该项目用于开发我们的UI组件~


#### 初始化

- 新建文件夹：`packages/verney-components`, 进入该目录；`pnpm init`；


- 接着安装刚创建的工具库包：`pnpm install @verney-design/utils`；安装成功后，`package.json`中会添加软连，指向本地的`utils`包：

``` json
 "dependencies": {
    "@verney-design/utils": "workspace:^1.0.0"
  }
```
> `pnpm add @verney-design/utils`也可以~

依赖`@verney-design/utils`对应的版本为`：workspace:^1.0.0`；因为`pnpm`是由`workspace`管理的，所以有一个前缀`workspace`可以指向`utils`下的工作空间从而方便本地调试。


- `package.json`:

``` json
{
  "name": "@verney-design/ui", // 组件库名称
  "private": false,
  "version": "1.0.0",
  "description": "vue3组件库~",
  "main": "index.ts", // 入口
  "keywords": [
    "verney-design-ui",
    "vue3组件库"
  ],
  "dependencies": {
    "@verney-design/utils": "workspace:^1.0.0" // 工具包软连接
  }
}
```

> 在 pnpm 中使用 `workspace:` 协议定义某个依赖包版本号时，pnpm 将只解析存在工作空间内的依赖包，不会去下载解析 npm 上的依赖包。


#### 组件开发


- 之后新建`src/`目录，创建`button/`和`input/`两个组件目录，先简单创建两个组件：

> 这里以`button`组件为例：
``` vue
<!-- verney-components/src/button/button.vue -->

<template>
    <button class='verney-ui-button__wrapper'>button 组件</button>
</template>

<script lang='ts'>
export default {
    name: 'vn-button', // 组件名称
};
</script>
<script setup lang='ts'>
import {addFn} from '@verney-design/utils' // 导入工具函数
import { onMounted } from 'vue';
onMounted(() => {
    console.log('==button==mounted', addFn(1, 2)); // 打印工具函数，验证工具函数导入是否生效
});
</script>
<style lang='less' scoped>
// 组件样式
.verney-ui-button__wrapper {
    color: #ccc;
}
</style>
```

- 组件导出：
``` ts
// verney-components/src/button/index.ts

import button from './button.vue';
// 很多时候我们在vue中使用一个组件会用的app.use 将组件挂载到全局。
// 要使用app.use函数的话我们需要让我们的每个组件都提供一个install方法，app.use()的时候就会调用这个方法;
import {withInstall} from '@verney-design/utils'
const Button = withInstall(button) // 添加install方法
export default Button;
```

> 这里调用了一个方法`withInstall`, 直接在工具库项目中添加即可：

``` ts
// packages/verney-utils/src/withinstall.ts

import type { App, Plugin } from "vue"
export type SFCWithInstall<T> = T & Plugin

// 为了解决组件的全局注册，写一个高阶函数:
// 这个函数接收一个组件，然后返回一个新的组件，这个新的组件上有install方法，install方法就是全局注册组件的方法
export default <T>(comp: T) => {
    (comp as SFCWithInstall<T>).install = (app: App) => {
        // 当组件是 script setup 的形式时，会自动以为文件名注册，会挂载到组件的__name 属性上，所以要加上这个条件
        const name = (comp as any).name || (comp as any).__name
        //注册组件
        app.component(name, comp as SFCWithInstall<T>)
    }
    return comp as SFCWithInstall<T>
}

/**
 * 添加完成后，记得导出
 */
// packages/verney-utils/src/index.ts
import withInstall from "./src/withinstall"
export {
    withInstall
}
```

- 定义组件类型声明：

``` ts
// verney-components/src/button/types.ts

import { ExtractPropTypes } from 'vue' // ExtractPropTypes是vue3中内置的类型声明
// 定义属性值
export const ButtonType = ['default', 'primary', 'success', 'warning', 'danger']
export const ButtonSize = ['large', 'normal', 'small', 'mini'];
// 导出属性类型
export const buttonProps = {
    type: {
        type: String,
        validator(value: string) { // 校验属性值
            return ButtonType.includes(value)
        }
    },
    plain: Boolean,
    round: Boolean,
    disabled: Boolean,
    icon: String,
    iconPosition: String,
    size: {
        type: String,
        validator(value: string) {
            return ButtonSize.includes(value)
        }
    }
}
// 导出组件属性配置信息
// ExtractPropTypes会接收一个类型，然后把对应的vue3所接收的props类型提供出来，后面有需要可以直接使用
export type ButtonProps = ExtractPropTypes<typeof buttonProps>
```


- 所有组件导出：

``` ts
// verney-components/src/index.ts

import VnButton from "./button"; // 导入组件
import VnInput from "./input";
// 导出组件
export {
    VnButton,
    VnInput
}
// 默认导出所有组件的数组
export default [VnButton, VnInput] 


// verney-components/index.ts

import { App } from "vue";
import comps from './src/index'; // 获取上面默认导出的组件数组
export * from "./src/index"; // 会把所有的非default导出
// 默认导出install方法
export default {
  install: (app: App) => {
    comps.forEach((c) => app.use(c));
  },
};
```

#### 组件调试


- 接着我们回到`examples`项目，安装刚创建的组件库：`pnpm install @verney-design/ui`;
> 跟上面添加`@verney-design/utils`一样，会在`package.json`中添加软连，指向本地；这样当组件修改后，在`examples`中也会同步更新~


- 之后在`examples/App.vue`中引入 button 和 input 组件：

``` vue
<!-- examples/App.vue -->

<template>
<div class=''>
    <VnButton></VnButton>
    <VnInput></VnInput>
</div>
</template>
<script setup lang='ts'>
import {VnButton, VnInput} from '@verney-design/ui'; // 引入组件库
import { onMounted } from 'vue';
onMounted(() => {
    console.log('==app==mounted', VnButton);
});
</script>
```

- `npm run dev`启动项目测试是否引入组件成功；如果页面展示组件内容，即表示引入成功。
> 正常情况下页面上应该是会展示组件内容的，同时也会看到button组件中调用`addFn`方法的`console`信息，说明在组件库和工具库的调用都是ok的~


组件引入成功后，我们就可以一边在`packages/`中开发组件和工具库，一边在`examples`项目中调试了~ 接下来就可以专注组件开发了~！！


> 之后就是继续其他组件的开发了，这里不再赘述，具体细节可查看代码~




### 组件文档项目

> 如果组件开发完毕，就需要一个组件库使用文档了，这里使用[vitepress](https://vitejs.cn/vitepress/)来进行开发~


#### 初始化

- 首先项目根目录下新建`docs`目录，进入该目录；

- 安装vitepress: `pnpm install vitepress -D -w`

- 初始化：`pnpm init`, 生成`package.json`;

- 创建`index.md`: `echo '# Hello VitePress' > index.md`

- pkg中添加命令：

``` json
"scripts": {
  "dev": "vitepress dev", // 默认启动 index.md
  // "dev": "vitepress dev src/index.md", // 可指定入口文件
  "build": "vitepress build",
  "serve": "vitepress serve"
}
```

- 启动：`pnpm run dev`, 会默认启动一个端口，浏览器打开该服务则可以看到默认的 vitepress 页面；
> 启动之后`docs`目录下会自动生成`.vitepress`配置文件夹~



#### 配置

> 服务启动成功后，接下来就可以开始配置细节了，具体配置规则其实跟`vuepress`挺类似的~

- `docs/index.md`中可以配置首页布局；
> 使用[Frontmatter](https://vitejs.cn/vitepress/guide/frontmatter.html)来进行配置的；

- `.vitepress/config.ts`中配置页面顶部导航`nav`，左侧边栏`sidebar`，顶部`footer`等模块；
> 具体配置信息参考这里[config](https://vitejs.cn/vitepress/config/basics.html)


``` ts
// .vitepress/config.ts

import nav from './configs/nav' // 顶部导航配置信息
import sidebar from './configs/sidebar' // 左侧边栏配置信息
import footer from './configs/footer' // 底部footer配置信息

export default {
  title: 'verney-vue-design', // 站点的标题
  description: 'verney-vue-design前端组件库', // 站点的描述,将作为<meta>标记渲染在页面HTML中
  appearance: true, // 允许默认的颜色主题切换
  base: '/', // base URL; 如果计划将站点部署到https://foo.github.io/bar/,那么需要设置base为'/bar/'
//   lang: 'en-US', // 设置语言, 这个属性将作为<html lang="en-US">标记渲染到页面HTML中。
// head: 额外的需要被注入到当前页面的HTML<head>中的标签,每个标签都可以以 [tagName, { attrName: attrValue }, innerHTML?] 的格式指定
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/logo/favicon.svg'
      }
    ]
  ],
  // 主题配置
  themeConfig: {
    logo: '/logo/favicon.svg', // 导航栏logo
    nav, // 顶部导航
    sidebar, // 侧边栏
    footer // 页脚
  }
}
```

> 具体配置信息见顶部源码，这里不再赘述~

当然也可以新建`vite.config.ts`文件进行打包启动配置，修改默认端口号什么的，就跟普通的`vite`项目一样~
> 如果要配置的话，前面初始化`examples`项目时已经在根目录下安装过`vite`了，所以这里直接在`docs/`下新建`vite.config.ts`即可~





#### 源码预览
> 在`elment-plus`或者其他第三方组件库文档中都会有一个功能，就是组件预览及源码查看，接下来需要创建一个组件来实现这个功能~

- 首先是引入组件：`pnpm install @verney-design/ui`, 下载后会在`pkg`中添加软连：

``` json
// package.json

"dependencies": {
    "@verney-design/ui": "workspace:^1.0.0"
}
```

- 然后在`.vitepress/theme/index.ts`进行全局注册：

``` ts
import VerneyUI from '@verney-design/ui'
export default {
  enhanceApp ({ app }: {app: App}) {
    // 全局注册组件
    app.use(VerneyUI)
  }
}
```

- 之后就可以新建目录`demo/`，用于放置我们的组件代码示例了，如：
``` vue
<!-- demo/button.vue -->
<template>
    <div>
        <vn-button></vn-button>
    </div>
</template>
```
> 同时新建`demo/index.ts`，导出所有的组件代码示例文件~


- 先安装一些会用到的第三方库：`pnpm install @vueuse/core prismjs @element-plus/icons-vue element-plus -S -w`
> `@vueuse/core`会提供一些工具函数，比如复制；`prismjs`可以添加代码高亮；`@element-plus/icons-vue`和`element-plus`在之后写预览组件的时候会用到~


- 接着封装一个用于预览和查看源码的组件`vpDemo.vue`：

 ``` vue
 <!-- components/vp-demo.vue -->

<template>
    <!-- 组件预览 -->
    <ClientOnly>
        <component :is="demoComp" />
    </ClientOnly>

    <!-- 源码查看 -->
    <div class="decode" v-html="decoded" />
</template>
<script>
// 引入所有组件代码示例 
import demos from '../../demo';

// 通过demoName获取当前demo组件
const demoComp = computed(() => {
    return demos[props.demoName]
})

// 获取源码
const decoded = computed(() => {
    return decodeURIComponent(props.sourceCode)
})
</script>
```
> 同时将该组件在上面的`theme/index.ts`中进行注册，之后就可以在项目中直接用了~

**Q：那接下来在`md`文件中，怎么展示我们的 demo 组件，以及怎么展示 demo 源码呢？**
> 组件预览比较简单，拿到`demoComp`直接渲染即可，难的是源码的展示；虽说在`md`文档中可以直接添加demo源码，但不优雅，而且代码很容易重复且累赘；

我们可以约定一个语法规则，在模块加载的时候通过正则匹配拿到`demo`组件的路径和名称，同时也可以拿到`demo`源码；之后就可以通过改写模块属性，把源码内容转成字符串添加到模块中；之后在`vpDemo`组件中拿到源码字符串`sourceCode`，就可以进行展示了~

- 先看下`md`文档中的`vpDemo`组件的调用比较简单：

``` md
<!-- ui/button.md -->

<vp-demo source-code="ui:::button" demo-name="button"></vp-demo>
```
> 这里我约定的语法规则是`source-code="ui:::xxx"`, 注意，这个规则很重要，为避免代码编译冲突，约定之后最好就只用于组件预览场景使用~

- 接着最重要的一步，写一个简单的`vite`插件，用于将所有md模块中的`source-code="ui:::xxx"`提取出来，并通过路径获取源码信息：

``` ts
// build/source-code.ts

import * as path from 'path'
import * as fsPromises from 'fs/promises' // 异步读取文件

const Prism = require('prismjs') // 引入代码高亮插件
const loadLanguages = require('prismjs/components/index')

loadLanguages(['markup', 'css', 'javascript']) // 限制语言类型

// 代码示例目录
const packagesPath = path.resolve(__dirname, '../demo/')

const sourceCode = () => {
  return {
    // 会在每个传入模块请求时被调用
    // src: 源代码字符串，id: 模块的绝对路径
    async transform (src: string, id: string) {
      const mdFile = '.md'
      if (!id.includes(mdFile)) return // 仅处理 .md 文件

      const reg = /source-code="(.*)"/g // 匹配 source-code="xxx"

      if (!src.match(reg)) return

    //   console.log('=====sourceCode',src, id, src.match(reg))
   
      // 封装match方法：读取导入模块的源代码，遍历匹配到的 source-code="xxx"
      // 例：[ 'source-code="ui:::input"','source-code="ui:::button"' ]
      const match = src.match(reg)?.map(_ => {
        let [packageName, compPath] = sourceSplit(_) // 获取组件名称
        // console.log(packageName, compPath)
        // const suffix = packageName.includes('ant') ? 'jsx' : 'vue'
        // return fsPromises.readFile(path.resolve(packagesPath, `${packageName}/demo/${compPath}.${suffix}`), 'utf-8')

        // 获取组件示例路径
        const demoPath = path.resolve(packagesPath, `${compPath}.vue`)
        // 读取组件示例源代码
        return fsPromises.readFile(demoPath, 'utf-8')
      })

      const filesRes = await Promise.all(match) // 异步执行

      let i = 0
      // 将匹配到的 source-code="xxx" 替换为 <pre><code>xxx</code></pre>  
      return src.replace(reg, (str) => {
        console.log('=====replace', str)
        const [packageName, compPath] = sourceSplit(str)
        const compPathStrArr = compPath.split('/')
        const file = filesRes[i]
        i++
        // 返回添加了 source-code 等属性的新的代码字符串，替换原来的 source-code="xxx" 代码片段
        return `source-code="${encodeURIComponent(wrap(Prism.highlight(file, Prism.languages.markup, 'markup')))}"`
      })
    }
  }
}

// 将代码包裹在 <pre><code>xxx</code></pre> 中
const wrap = code => `<pre v-pre><code>${code}</code></pre>`

// source-code="ui:::input" => ['ui', 'input']
function sourceSplit (_: string) {
  const result = /.*?source-code="(.*)"/.exec(_) // 获取匹配参数
//   console.log('=====sourceSplit', result)
    /**
     * 例：result => 
            [
            'source-code="ui:::input"',
            'ui:::input',
            index: 0,
            input: 'source-code="ui:::input"',
            groups: undefined
            ]
    */
  const originPath = (result && result[1]) ?? ''
  return originPath.split(':::')

}

// 导出插件
export default sourceCode
```
> 关于vite插件的开发，可参考[这里](https://cn.vitejs.dev/guide/api-plugin.html#universal-hooks), 这里不再赘述~


- 插件开发完毕，然后就可以直接引用了：

``` ts
// vite.config.ts

import {defineConfig} from 'vite'
import sourceCode from './build/source-code'

export default defineConfig(async ({ command, mode }) => {
  return {
    plugins: [
        sourceCode()
    ]
  }
})
```
> 之后当`npm run dev`后，每次懒加载`md`文件时就会对源码中的`source-code="xxx"`进行匹配，获取源码字符串信息~

这样，也就实现了组件的预览和源码查看的大致逻辑；之后也可以添加源码高亮，源码复制，全屏预览等功能，这里不再阐述，具体可查看代码~




#### 样式隔离
> vitepress有自己的样式控制，同时引入的组件库也有自己的样式，所以在组件库文档项目中就可能存在样式覆盖的情况~



### 脚手架项目

> 项目搭建完成后，直接在`packages/`目录中创建`verney-cli`脚手架项目即可，之后就可以进行脚手架开发了，关于脚手架开发的具体流程放在：[开发一个快速搭建vue3项目的脚手架](/skills/vue/vue3-cli-repo.html)，这里不再赘述~






## 项目目录结构
> 到这里，项目搭建算是大致完成了，目前我们配置了工具库、组件库、组件预览、组件文档四个子项目，已经基本能满足组件开发的需求~

我搭建的`verney-design`组件库项目目录结构如下：

``` js
└── docs // 组件文档项目
    ├── .vitepress  // vitepress配置信息
    ├── build  // 打包配置信息
    ├── demo  // 组件demo
    ├── apps  // 项目目录
    ├── pages  // md文档目录
    ├── public  // 静态资源
    ├── index.md  // 文档首页
    ├── package.json
    ├── vite.config.ts  // vite配置
└── examples // 组件预览项目
    ├── App.vue
    ├── index.html
    ├── main.ts
    ├── package.json
    ├── vite.config.ts  // vite配置
    ├── vue.shim.d.ts  // ts类型声明
└── packages
    ├── verney-components  // 组件库项目
        ├── src  // 组件目录
            ├── input  // input组件
            ├── button  // button组件
            ...
            ├── index.ts // 组件导出
        ├── index.ts  // 入口
        ├── package.json
        ├── vite.config.ts  // vite配置
        ...
    ├── verney-utils  // 工具库项目
        ├── src    // 工具目录
        ├── index.ts   // 入口
        ├── package.json // 组件库配置信息
        ...
    ├── verney-cli  // 脚手架项目
        ...
└── package.json // 脚本配置文件
├── pnpm.workplace.yaml // pnpm配置
├── tsconfig.json // ts配置
```





## 组件库发布

> 当组件开发完毕，准备发布时，需要进行打包配置~

### 组件打包

这里选择的是vite进行打包, 它提供了一个[库模式](https://cn.vitejs.dev/guide/build#library-mode)专门用于打包库组件~


- 前面初始化`examples`项目时已经安装过`vite`了，所以这里直接在`components/`下新建`vite.config.ts`;

> 这里我们选择打包`cjs(CommonJS)`和`esm(ESModule)`两种形式,`cjs`模式主要用于服务端引用(ssr),而`esm`就是我们现在经常使用的方式，它本身自带`treeShaking`而不需要额外配置按需引入~


- 配置完成后，`package.json`中添加`"build": "vite build"`打包命令；直接打包：`pnpm run build`；


- 不出意外打包完成后，会在`components/dist`目录下生成`es`和`lib`两个目录；



- 因为我们这是ts项目，所以还需要在打包的库里加入声明文件(`.d.ts`):
> 到这里打包的组件库只能给`js`项目使用,在`ts`项目下运行会出现一些错误，而且使用的时候还会失去代码提示功能~

1. 安装：`pnpm i vite-plugin-dts -D -w`

2. 修改`vite.config.ts`配置：

``` ts
import dts from 'vite-plugin-dts'

plugins: [
    dts({
      entryRoot: "src",
      outputDir: [
        resolve(__dirname, "./dist/es/src"),
        resolve(__dirname, "./dist/lib/src"),
      ],
      // 指定使用的tsconfig.json为整个项目根目录下的
      // 如果不配置,也可以在components下新建tsconfig.json
      tsConfigFilePath: "../../tsconfig.json",
    }),
]
```

3. 执行打包命令你就会发现你的`es`和`lib`下就有了`d.ts`声明文件;
> 其实现在大部分前端构建脚手架都支持 `esmodule` 了,而 `esmodule` 本身就支持按需加载,所以说组件库打包后的 es 格式它本身自带 `treeShaking`,而不需要额外配置按需引入~


- 发布之前需要修改下`package.json`：

``` json
{
  "name": "@verney-design/ui", // 包名称，设置前需在npm官网查询是否重名
  "version": "1.0.0", // 版本号
  "private": false, // 这是一个公共包
  "description": "vue3组件库~", // 描述
  "main": "dist/lib/index.js", // 组件库入口文件, 默认commonjs入口文件
  "module":"dist/es/index.js", // 如果环境支持ESM，构建工具会优先使用我们的module入口
  "scripts": {
    "build": "vite build"
  },
  "files": [ // files是需要发布到npm上的目录
    "dist"
  ],
  "keywords": [ // 关键词
    "verney-design-ui",
    "vue3组件库"
  ],
  "sideEffects": [ // 忽略 tree shaking 带来副作用的代码
    "**/*.css"
  ],
  "author": "zhou",
  "license": "MIT", // 如果要发公共包，需要将协议改为MIT开源协议
  "typings": "dist/index.d.ts", // 声明文件入口
  "exports": {
    "./dist/style.css": "./dist/style.css", // 子目录别名，方便样式引入
  },
  "dependencies": {
    "@verney-design/utils": "workspace:^1.0.0"
  }
}
```

- `sideEffects`: 忽略 tree shaking 带来副作用的代码
> 比如打包后组件代码中包含了:`import "./xxx.css"`, 这样会使得构建工具无法知道这段代码是否有副作用(也就是会不会用到其它引入的文件中的代码),所以构建的时候就会全量打包代码从而失去 esmodule 的自动按需引入功能。因此加上 sideEffects 字段就可以告诉构建工具这段代码不会产生副作用,可以放心的 `tree shaking`;


**注：** 上面的 pkg 中`main`配置的是库的入口，这里一般指向的是打包后的js文件，但如果组件库不需要打包，可以直接指向其他文件：

``` json
"main": "src/button.vue" // 比如这里可以直接指向某个组件
"files": [
    "src"
    // ...
  ],
```
> 对于某些不需要打包的库可以在`files`里配置需要发布到npm上的其他目录，或者不配置也行，`main`直接指向某个文件；这样其实相当于下载下来的npm包直接是访问的源码~


### 组件发布
> 这里默认发布到npm上，先不考虑发布到私有仓库的情况~

- 首先需要将我们的项目`push`到`github`仓库上；
> 如果不想提交到`github`仓库，可以下面发布的时候执行：`pnpm publish --no-git-checks`，但不建议~

- 之后需要在[npm](https://www.npmjs.com/)上注册一个账号；

- 如果发布像我们这种`@[org]/[child]`命名结构的包，需要先在 npm 上创建一个组织`Organization`，名称就是[org]；


- `npm login`,输入账户密码登录，也需要输入邮箱，输入验证码~

- `npm publish`，发布；成功后在npm官网刚创建的[组织](https://www.npmjs.com/settings/verney-design/packages)下面就能看到刚发布的包了~！
> 如果发布的是公共包的话，需要执行: `pnpm publish --access public`


> 工具库和脚手架的发布跟这个流程差不多，都是先配置pkg文档，然后npm登录，发布~



**注意：组件库打包入口与开发入口不一致**
> 到这里可以发现，pkg文件中的main配置信息在开发和发布是不一样的：

``` json
// "main": "index.ts", // 开发时的入口
// 发布时入口
"main": "dist/lib/index.js", // 组件库入口文件, 默认commonjs入口文件
"module":"dist/es/index.js", // 如果环境支持ESM，构建工具会优先使用我们的module入口
```
> 这里在发布和开发的时候需要注意一下~


**注：如果发布到自己公司的npm库，指定下npm地址即可：**

``` sh
npm --registry=http://xxx login  # 登录

npm --registry=http://xxx publish  # 发布

npm --registry=http://xxx install pkgName  # 下载
```



### 使用

> 组件库发布后，就可以跟其他第三方包一样直接安装使用了~


- 安装：`pnpm install @verney-design/ui -S`

- 使用：

``` js
import {VnButton, VnInput} from '@verney-design/ui';
import "@verney-design/ui/dist/style.css"; // 引入css样式
```




## 组件文档部署


[Vite-部署静态站点](https://cn.vitejs.dev/guide/static-deploy.html)


### 部署Vercel

> vercel支持monorepo项目的部署，我之前总结过一篇关于[vercel使用笔记](/more/vercel-deploy.html)的博文，部署也比较简单，这里就不再赘述了



- github => settings => Applications => Vercel，新增`verney-vue-design`项目；

- 之后进入到[vercel](https://vercel.com/dashboard)个人主页添加项目，按提示部署即可~

> 注意：Settings中需要配置下deploy参数，不然直接部署会报错：

1. `Root Directory`选择`verney-vue-design/docs`;
2. `Framework Preset`选择`VitePress`, `Output Directory`填：`.vitepress/dist`;
3. `Install Command`填`pnpm install --no-frozen-lockfile`


> 部署成功后，直接项目每次`push`提交`vercel`都会自动部署~奈斯~😄

[https://verney-vue-design.vercel.app/](https://verney-vue-design.vercel.app/)



### 部署阿里云
> vercel已经很好用了，这里我就先不部署到自己的阿里云服务器上了~ 其实要部署的话也比较简单，配置一个自动部署的`git actions`工作流就可以，在[Github Actions自动部署](/more/github-actions.html)已经详细记录了自动部署的操作，这里不再赘述了~





## 工程化配置


### 代码提交规范

> 接下来配置代码规范,样式规范以及代码提交规范~


#### Eslint
> ESLint 是一款用于查找并报告代码中问题的工具，并且支持部分问题自动修复。

- 安装：`pnpm add eslint -D -w`

- 配置：`npx eslint --init`:

``` sh
 verney-vue-design git:(main) ✗ npx eslint --init
You can also run this command directly using 'npm init @eslint/config'.
npx: 43 安装成功，用时 7.175 秒
✔ How would you like to use ESLint? · problems
✔ What type of modules does your project use? · esm
✔ Which framework does your project use? · vue
✔ Does your project use TypeScript? · No / Yes
✔ Where does your code run? · browser, node
✔ What format do you want your config file to be in? · JavaScript
The config that you've selected requires the following dependencies:

@typescript-eslint/eslint-plugin@latest eslint-plugin-vue@latest @typescript-eslint/parser@latest
✔ Would you like to install them now? · No / Yes
A config file was generated, but the config file itself may not follow your linting rules.
Successfully created .eslintrc.js file in /Users/zhouyuan10/test-code/verney-vue-design
```
> 因为使用的是 `pnpm`,所以选择安装那些插件的时候我们选择了 `No`,这里我们用 `pnpm` 手动安装一下: 

- 手动安装：`pnpm i eslint-plugin-vue@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest -D -w`


- 可`.eslintrc.js`中添加规则：

``` js
"rules": {
    // 规则
    indent: ['warn', 4, { SwitchCase: 1 }],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    semi: ['warn', 'always'],
    'vue/html-self-closing': [
        'warn',
        {
            html: {
                void: 'any',
                normal: 'any',
                component: 'any',
            },
        },
    ],
    'vue/script-indent': ['error', 4, { baseIndent: 0, switchCase: 1 }],
}
```


- 新建`.eslintignore`，配置忽略校验目录；


- 然后在pkg中添加`lint: eslint --ext .js,.jsx,.vue,.ts,.tsx --quiet examples`命令，执行`pnpm run lint`校验下`examples`目录下代码~
> 按照上面配置的规则，会提示一些不规范的地方~


- 再添加命令：`lint:fix: eslint --ext .js,.jsx,.vue,.ts,.tsx --fix --quiet examples`, 执行`pnpm run lint:fix`会自动修复；


但现在想实现**保存自动格式化**还需要安装`Prettier`, ESLint 经常结合 Prettier 一起使用才能体现它们的能力,Prettier 主要是对代码做格式化~



#### Prettier
> Prettier是一款强大的代码格式化工具。

- 安装：`pnpm add prettier -D -w`

- 新建`.prettierrc.js`， 配置；


- 解决eslint和prettier冲突, 安装：`pnpm add eslint-config-prettier eslint-plugin-prettier -D -w`
> `eslint-config-prettier` 覆盖 eslint 本身规则; `eslint-plugin-prettier` 关闭 ESLint 中与 Prettier 中会发生冲突的规则~


- `.eslintrc.js`的`extends`中添加 `prettier` 插件，也可以在`rules`添加`prettier`的规则；

- 根目录新建`.vscode/settings.json`文件：

``` json
{
    // eslint配置
  "eslint.run": "onSave", // 保存的时候执行校验
  // eslint 自动修复
    "eslint.autoFixOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
}
```

- 之后`vscode`重启项目，代码不规范的部分会高亮提示，`cmd + s`会自动修复~




**StyleLint**
> [Stylelint](https://stylelint.io/) 可以帮助我们规范化 css 的书写，风格统一，减少错误；使用和配置跟 eslint 比较类似~


> 由于Prettier也能格式化css代码，能暂时满足代码规范的需求，所以这里我先不配置stylelint，等以后再配置~




eslint可以对代码进行格式校验，prettier可以对代码进行格式化，但不能保证每个人提交的代码都是按照规范提交的，所以需要约定一些代码提交规范，保证代码提交风格的一致性，提升代码的可维护性~


#### Husky
> Husky 可以在我们提交代码之前校验我们的代码是否符合我们配置的规范~

`Husky`是一种工具, 让我们可以轻松地接入 `Git hooks` ，并在我们需要的某些阶段运行脚本，这些事件包括提交的不同阶段，例如在提交之前（`pre-commit`,提交之后（`post-commit`）。


- 安装：`pnpm i husky -D -w`

- pkg中添加脚本命令：`prepare: husky install`；

- 执行`npx husky install`, 项目根目录下会生成`.husky`目录；

- 添加一个`lint`钩子：`.husky`目录下新建`pre-commit`，写入以下内容：

``` sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm run lint
```
> 这样就能在`pre-commit`阶段，也就是每次commit提交之前先执行eslint校验~



#### CommitLint

> 我们看开源项目的时候会看到它们的提交信息会有诸如`feat: 添加xxx,fix: 修复xxxbug`之类的信息,其实这些就是提交规范；为了利于其他同学分析你提交的代码，所以需要约定commit提交规范~


- 安装：`pnpm install -D @commitlint/config-conventional @commitlint/cli -w`
>  `@commitlint/config-conventional` 是一个规范配置,标识采用什么规范来执行消息校验, 这个默认是 `Angular` 的提交规范; `@commitlint/cli` 是一个使用 `lint` 规则来校验提交记录的命令行工具


- 项目根目录下创建`.commitlintrc`，并写入配置：
``` sh
{
  "extends": [
    "@commitlint/config-conventional"
  ]
}
```


- `.husky`下新建`commit-msg`文件：
``` sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
```

- 之后随便提交一个不符合规范的commit，就会报错了；正确的提交格式是：`<type>(<?scope>): <subject>`, 如：`git commit -am"feat: "新增commitlint提交g规范""`



#### Lint-staged

> Husky 可以在`git-hooks`的代码提交之前阶段执行代码校验，CommitLint 约定了我们的代码commit规范；但每次提交代码的时候 `ESlint` 或 `Stylelint` 都会检查所有文件,而我们需要的是只让它们检测新增的文件,因此我们可以使用`lint-staged`来解决这个问题~


- 安装：`pnpm add lint-staged -D -w`


- pkg中添加命令：

``` json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "eslint --ext .js,.jsx,.vue,.ts,.tsx --fix --quiet ./"
    ]
  },
    "scripts": {
    "lint-staged": "lint-staged"
  },
}
```

- 修改`.husky/pre-commit`中的命令：

``` sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# pnpm run lint
pnpm run lint-staged
```

> 配置完成后，每次`commit`之前就只会检测我们添加到暂存区的文件了~




::: tip 总结
- 通过 `eslint` 完成对规则的限制
- 通过 `prettier` 完成对格式化定义，以及使用 `eslint-config-prettier` 抹平与 `eslint` 自带格式化的冲突问题
- 通过 `stylelint` 完成对 css 的检查和格式化
- 通过 `husky` 添加 `pre-commit` 钩子，在代码提交之前进行校验
- 通过 `commitLint`规范代码提交格式
- 通过 `lint-staged` 完成只对暂存区代码的校验和格式化工作
:::


> 参考：
- [从0搭建Vue3组件库(十一): 集成项目的编程规范工具链(ESlint+Prettier+Stylelint)](https://juejin.cn/post/7207769757571858490)
- [从0搭建Vue3组件库(十三):引入Husky规范git提交](https://juejin.cn/post/7236591682631745594)










### 添加Vitest测试

> [Vitest](https://cn.vitest.dev/guide/) 是个高性能的前端单元测试框架,它的用法其实和 Jest 差不多,但是它的性能要优于 Jest 不少,还提供了很好的 ESM 支持,同时对于使用 vite 作为构建工具的项目来说有一个好处就是可以公用同一个配置文件vite.config.js。因此本项目将会使用 Vitest 作为测试框架。



- 安装：`pnpm add vitest happy-dom c8 @vitest/coverage-v8 @vue/test-utils -D -w`
  - [happy-dom](https://github.com/capricorn86/happy-dom) 通过提供 Browser API 模拟浏览器环境，在测试的运行环境 node 下提供对 web 标准的模拟实现；
  - [c8](https://github.com/bcoe/c8) 工具可以展示测试覆盖率,` @vitest/coverage-v8`是viteset提供的展示测试覆盖率的插件；
  - [@vue/test-utils](https://test-utils.vuejs.org/)是 Vue.js 官方的单元测试实用工具库。


- `vite.config.ts`中添加配置：

``` ts
// packages/verney-components/vite.config.ts

/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue"
...
export default defineConfig(
    {
        ...
        test: {
            environment: "happy-dom"
        },

    }
)
```
> `///`三斜线命令告诉编译器在编译过程中要引入的额外的文件


- pkg中添加测试命令：

``` json
 "scripts": {
    "test": "vitest", // 单元测试
    "coverage": "vitest run --coverage" // 查看测试覆盖率
  }
```

- 然后可以新建`index.test.ts`测试命令是否生效：

``` ts
// packages/verney-components/src/index.test.ts

import { describe, expect, it } from 'vitest';

// describe 和 it 指示了在进行 case test:
// describe 是对 case test 的描述，而 it 则是对 case test 的具体实现。
describe('hello venney-ui-test', () => {
    it('should be hello venney-ui-test', () => {
        // expect用于验证代码的行为和输出是否符合预期的方式
        expect('hello ' + 'venney-ui-test').toBe('hello venney-ui-test');
    });
});
```
> 添加之后执行`pnpm run test`和`pnpm run coverage`，看看测试是否生效~


- 测试命令生效后，接着以`button`组件为例，添加组件测试用例；`button`组件目录下新建`__test__/button.test.ts`:

``` ts
// packages/verney-components/src/button/__tests__/button.test.ts

import { describe, expect, it } from 'vitest';

import { mount } from '@vue/test-utils';
import button from '../button.vue'; // 引入button组件

// 测试组件
describe('test button', () => {
    // case1: 测试组件是否正常渲染
    it('should render slot', () => {
        const wrapper = mount(button, {
            slots: {
                default: 'verney-button-test'
            }
        });
        expect(wrapper.text()).toContain('verney-button-test');
    });
    // case2: 当我们传入的type为primary的时候,期望组件的类名为vn-button__primary
    it('should have class', () => {
        const wrapper = mount(button, {
            props: {
                type: 'primary'
            }
        });
        expect(wrapper.classes()).toContain('vn-button__primary');
    });
});
``` 

- 可以看下`button.vue`组件的代码：

``` vue
<template>
    <button class="verney-ui-button__wrapper" :class="buttonStyle">
        button 组件
        <slot />
    </button>
</template>
<script setup lang="ts">
import { onMounted, computed } from 'vue';

import { buttonProps } from './types'; // 导入组件类型
const props = defineProps(buttonProps); // 定义组件属性

const buttonStyle = computed(() => {
    return props.type ? `vn-button__${props.type}` : '';
});
</script>
```
> 可以看到上面测试用例传了`slot`和`type`属性分别测试了button组件的两种场景~


- 添加完成后，执行`pnpm run test`:

``` js
 ✓ src/index.test.ts (1)
 ✓ src/button/__tests__/button.test.ts (2)

 Test Files  2 passed (2)
      Tests  3 passed (3)
   Start at  15:25:57
   Duration  469ms (transform 130ms, setup 0ms, collect 168ms, tests 16ms, environment 255ms, prepare 135ms)


 PASS  Waiting for file changes...
       press h to show help, press q to quit
```
> 正常情况下，如果测试通过就会出现上面提示信息~

- 接着看下测试覆盖率：`pnpm run coverage`:
``` js
✓ src/index.test.ts (1)
 ✓ src/button/__tests__/button.test.ts (2)

 Test Files  2 passed (2)
      Tests  3 passed (3)
   Start at  15:27:20
   Duration  636ms (transform 164ms, setup 0ms, collect 200ms, tests 18ms, environment 250ms, prepare 196ms)

 % Coverage report from v8
-----------------------|---------|----------|---------|---------|-------------------
File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------------|---------|----------|---------|---------|-------------------
All files              |   46.37 |    45.45 |    12.5 |   46.37 |                   
 verney-components     |       0 |        0 |       0 |       0 |                   
  index.ts             |       0 |        0 |       0 |       0 | 1-12              
 verney-components/src |       0 |        0 |       0 |       0 |                   
  index.ts             |       0 |        0 |       0 |       0 | 1-8               
 ...ponents/src/button |   85.33 |    83.33 |   33.33 |   85.33 |                   
  button.vue           |     100 |      100 |     100 |     100 |                   
  index.ts             |       0 |        0 |       0 |       0 | 1-9               
  types.ts             |   93.54 |      100 |      50 |   93.54 | 24-25             
 ...mponents/src/input |       0 |        0 |       0 |       0 |                   
  index.ts             |       0 |        0 |       0 |       0 | 1-4               
  input.vue            |       0 |        0 |       0 |       0 | 1-16              
  types.ts             |       0 |        0 |       0 |       0 | 1-23              
-----------------------|---------|----------|---------|---------|-------------------
```
- `%stmts` 是语句覆盖率（`statement coverage`）：是不是每个语句都执行了
- `%Branch` 分支覆盖率（`branch coverage`）：是不是每个 `if` 代码块都执行了
- `%Funcs` 函数覆盖率（`function coverage`）：是不是每个函数都调用了
- `%Lines` 行覆盖率（`line coverage`）：是不是每一行都执行了


> 以上就是引入 Vitest 的大致流程，其他组件的测试case写法跟 Button 组件的写法差不多~

> 参考：
- [从0搭建Vue3组件库(十二):引入现代前端测试框架 Vitest](https://juejin.cn/post/7209924355803185209)





## 项目优化

> 上面我们算是完整的走了一遍从项目创建到打包发布的全流程，但对于项目还有很多需要优化的地方，这里记录下优化的case~




### setup语法定义组件名

以前我们在`setup`语法中给组件命名通常这样写：

``` html
<script lang='ts'>
export default {
    name: 'App',
};
</script>
<script setup lang='ts'>
import { onMounted } from 'vue';
onMounted(() => {
});
</script>
```
> 这样写没问题，但需要写两个`<script>`标签，不太优雅，可通过安装插件解决~

- 安装插件：`pnpm add unplugin-vue-define-options  -D -w`


- `vite.config.ts`中配置：

``` ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// @ts-ignore
import DefineOptions from "unplugin-vue-define-options/vite";
export default defineConfig({
  plugins: [vue(), DefineOptions()],
});
```

- 使用：

``` vue
<template>
  <button>测试按钮</button>
</template> 
<script lang="ts" setup>
defineOptions({ name: "vn-button" });
</script>       
```




### Vue版本冲突
> 因为本项目是采用的 `Monorepo` 代码组织方式，所以难免会出现依赖包重合（版本不同）的问题，比如整个项目即安装了`vue2`也安装了`vue3`，起项目时就可能会报错~

- 根目录新建`.npmrc`:

``` sh
shared-workspace-lockfile = false # 默认为true, 启用此选项，pnpm 会在工作空间的根目录中创建一个唯一的 pnpm-lock.yaml 文件
```
> 配置之后，在每一个子项目中都会生成一个`pnpm.lock.yaml`~

[link-workspace-packages](https://pnpm.io/zh/next/npmrc#workspace-settings)





## 组件文档AI对话

现在出了一个叫[documate](https://github.com/AirCodeLabs/documate)的开源库，它可以给doc网站提供AI能力; 

配置的话比较简单，按这个流程操作就行：[【黑科技】让你的 VitePress 文档站支持 AI 对话能力](https://mp.weixin.qq.com/s/rCyPlUUczmk3uF7ut15ZXg)，需要提供自己的`OPEN_AI_KEY`~


[https://documate.site/](https://documate.site/)

[Aircode](https://aircode.io/dashboard)，一个在线编写和部署 Node.js 应用的平台




## TODO
> 这里记录下以后打算做的todo~

### 样式隔离

> 不同UI库间在vitepress项目中会存在样式覆盖的情况~


- 方案1：用`iframe`加载预览demo组件~


- 方案2： shadow dom 的沙箱机制

[完结篇！一步一步实现一个专业的前端组件库～](https://juejin.cn/post/7129805829892472845)




### 跨框架组件库

vitepress 是支持在 markdown 里直接写 vue3 代码，根据官网[Using Vue in Markdown](https://vitepress.dev/guide/using-vue)介绍，md文件最终编译成vue3的组件形式。

> 从大体上看，我们可以简单理解成 `md`文件 即是 `.vue` 文件, 我们可以在里面写`html`、写`vue3`组件、写`script`、写`style`，灵活度非常高; 但目前 vitepress 好像只支持`vue3`

Q: 那如何让 vitepress 支持引入 vue2组件呢？


[组件库——如何实现一个跨框架的组件库文档？](https://juejin.cn/post/7126477752718327839)


- 跨框架方案

1. Web Components：如京东的`Taro UI`

[如何实现跨框架（React、Vue、Solid）的前端组件库？](https://mp.weixin.qq.com/s/pGXN9tEfyu0hCM_KeF2kZg)、[Tiny Vue](https://github.com/opentiny/tiny-vue)、[cross-framework-component](https://github.com/opentiny/cross-framework-component)

2. [想要开发组件库？那你一定要提前了解一下这个神器](https://mp.weixin.qq.com/s/XuEc1TnLuzMokylde4DkhQ)、[Mitosis](https://github.com/BuilderIO/mitosis)


- 封装Element-UI
- 封装Element-Plus
- 封装Ant-Design




### gulp管理组件库打包发布

> 打包一个组件库，我们可能要移除文件、copy文件，打包样式、打包组件、执行一些命令还有一键打包多个package等等都可以由gulp进行自定义流程的控制，非常的方便。

- [使用 gulp 打包组件库并实现按需加载](https://juejin.cn/post/7201132695623335991)
- [使用 release-it 实现自动管理发布组件库](https://juejin.cn/post/7201506099341983801)




### 组件库自动发布
> 现在组件库和工具库都是手动发布的，等有时间写个脚本让它们自动发布~

[https://github.com/MrWeilian/much-more-design/blob/main/scripts/release.ts](https://github.com/MrWeilian/much-more-design/blob/main/scripts/release.ts)

Q: 还有`组件库打包入口与开发入口不一致`,这个问题看是否可以自动配置？


## 备注


- packages内部的库更新后，如何同步更新到其他库？
> 添加`workspace:^1.0.0`后，本地修改就能够自动更新


- 组件库怎么兼容不同项目的版本问题？比如组件库开发的react版本是`v.17+`,但有些项目的react是`v15+`或`v18+`



**部署发布相关：**

1. monorepo项目里面的子项目如果要发布，进到相应子项目目录下，如果是组件库，先`run build`打包，打包完成执行`npm publish`发布命令即可单独发布子项目, 不需要修改依赖配置；
2. 子项目如果要部署，如果是在`verney-vue-design`项目内执行，不需要修改依赖的`workplace`配置，直接`run build`, pnpm 会处理依赖关系；打包完成将 dist 放在相应的服务上即可访问；
3. 比如当组件库和文档都有更新时：
  - `docs`文档项目要上线vercel，首先会把整个项目`verney-vue-design`提交，之后vercel在打包docs项目时，会按照配置好的`workplace`依赖关系直接获取组件项目最新的修改，即不需要将组件发布，即可在文档中看到最新的修改；
  - 但如果是在其他项目中用到了组件库，就需要先将组件库发布，然后在其他项目中重新下载依赖才可以看到最新的修改~


[pnpm命令](https://pnpm.io/zh/pnpm-cli)

``` sh

pnpm run -C packages/element-plus build # -C <path>, --dir <path>: 将 <path> 设置为 pnpm 的运行目录，而不是当前目录。

pnpm add vite --F examples # pnpm add 是 pnpm 中安装依赖包的命令， --F examples 是指定依赖安装到 examples 子工程中
# 注意：examples 是取 examples 子工程中 package.json 中 name 字段的值，而不是 examples 子工程文件夹的名称。
pnpm add react --filter pkg1(项目名) # --filter <package_name>,可以用来对特定的package进行某些操作。 --filter 参数跟着的是package下的 package.json 的 name 字段，并不是目录名。

pnpm add react -w  # 将依赖包安装到工程的根目录下，作为所有 package 的公共依赖。
pnpm add react -wD  # 会装到 pacakage.json 中的 devDependencies
```






## 报错记录

- `pnpm run build`打包组件库时报错: `SyntaxError: Unexpected reserved word`
> node版本问题，升级到`v16+`试试~


- `examples` 项目中全局引入组件后直接使用`VnInput`组件报错：

`Failed to resolve component: VnInput If this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement.`

> 组件`name`为`vn-input`，改为`<vn-input />`使用即可~




- 添加`commitlint`后执行`git commit`提交提示：`The '.husky/commit-msg' hook was ignored because it's not set as executable.`, 代码提交格式校验没生效~
> 执行`chmod ug+x .husky/*`后再提交即可; 参考：[hook was ignored because it's not set as executable](https://github.com/typicode/husky/issues/1177)








## 收藏

- [免费Favicon.ico图标在线生成器](https://www.logosc.cn/logo/favicon)



## 参考


- [使用Vite和TypeScript带你从零打造一个属于自己的Vue3组件库](https://juejin.cn/post/7117886038126624805)
- [Vite+TypeScript从零搭建Vue3组件库](https://juejin.cn/column/7118932817119019015)

- [快上车！从零开始搭建一个属于自己的组件库！](https://juejin.cn/post/7120893568553582622)


项目参考：

- [element-plus](https://github.com/element-plus/element-plus)
- [much-more-design](https://github.com/MrWeilian/much-more-design)
- [easyest](https://github.com/qddidi/easyest)、[kittyui](https://gitee.com/geeksdidi/kittyui)








---
title: 全栈项目开发实践：yiwei-fullstack-web
date: 2025-02-24 20:12:29
permalink: false
categories:
  - project
  - yiwei-fullstack-web
tags:
  - 
---


# 全栈项目开发实践：yiwei-fullstack-web


## 概述
> 这是一个包含前端H5、小程序、后台管理系统、服务端的全栈项目，包含以下子项目：


1. taro+react小程序/5跨端项目：`mini-taro-app`
2. koa2服务端项目：`node-backend`
3. vue3后端admin项目：`vue-admin-web`


- 项目源码地址：[yiwei-fullstack-web](https://github.com/verneyZhou/yiwei-fullstack-web)
- [H5预览地址](https://www.verneyzhou-code.cn/yiwei/taro-mini-app)
- [后台管理系统](https://www.verneyzhou-code.cn/yiwei/vue-admin-web)






## 技术选型

- 这里C端选择用Taro这一个跨端框架来开发，因为我打算C端是一套代码，多端输出，降低开发成本，所以优先考虑跨端框架；而Taro框架是目前比较知名的框架，兼容React和Vue两种语法，可以输出H5，支持微信小程序、支付宝小程序、百度小程序、头条小程序、QQ小程序等；我用的是`Taro+React`来进行开发，因为刚开始Taro就是一个用React来进行开发的跨端框架，所以相较Vue，React可能支持度上会更成熟些；

- B端是用`Vue2+Vite`来搭建的后台管理系统；主要是现在的公司都是用的React，而我之前的公司经常用的却是Vue，而我不想让自己的Vue技术生疏了，这里就选择了Vue；用Vite也是为了保持对现在前端技术发展的关注吧


- 后端服务用的是`koa`搭建的node.js服务，这个目前也没有其他更好的选择吧，毕竟我也不会python或java...



## taro-mini-app

> 跨端小程序/h5：taro/react

> node v20+

- [小程序管理平台](https://mp.weixin.qq.com/wxamp/home/guide?lang=zh_CN&token=310304702)
- [微信开发者平台](https://developers.weixin.qq.com/console)
- UI库：[@antmjs/vantui](https://antmjs.github.io/vantui/main/#/home)



### 小程序初始化

- 登录[微信公众平台](https://mp.weixin.qq.com)，注册，创建小程序，获取到`AppID`；之后可以配置小程序的名称、图标等信息；
- [Taro](https://taro-docs.jd.com/docs/GETTING-STARTED)初始化项目，项目根目录`project.config.json`下填入AppID；
- 下载[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)，打开项目，编译预览，开始进行开发；

- **配置接口访问域名**
1. 的轮毂微信公众平台，进入"开发管理" → "开发设置" → "服务器域名"
2. 在"request合法域名"中添加你的接口域名 `https://xxx.com`；域名必须是 HTTPS，域名不能使用 IP 地址或 localhost，域名必须经过 ICP 备案，一个月内最多可申请修改 5 次
3. `project.config.json`:
``` json
{
  "setting": {
    "urlCheck": true,  // 必须设为 true，用于检查安全域名
    // ... 其他配置
  }
}
```
> 在开发工具中测试时，可以临时关闭 urlCheck；真机调试时必须使用已配置的合法域名；上传代码前必须将 `urlCheck` 设为 `true`


- 开发过程中，微信账号需要在公众平台添加`开发者权限`，才能扫码登录开发者工具；






### 微信小程序登录

[小程序登录](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)


- button:`open-type`，[微信开发能力](https://developers.weixin.qq.com/miniprogram/dev/component/button.html)
  - `getUserInfo`: 获取用户信息，可以从 bindgetuserinfo 回调中获取到用户匿名数据：`encryptedData、iv、signature、userInfo（不包含昵称头像）`
  - `getPhoneNumber`: getPhoneNumber 手机号快速验证，向用户申请，并在用户同意后，快速填写和验证手机；但**需完成企业认证才能用**

- `wx.getUserProfile(Object object)`: 若开发者需要获取用户的个人信息（头像、昵称、性别与地区），可以通过`wx.getUserProfile`接口进行获取，该接口从基础库`2.10.4`版本开始支持，该接口只返回用户个人信息，不包含用户身份标识符; **开发者每次通过该接口获取用户个人信息均需用户确认**。[参考](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/user-info/wx.getUserProfile.html)
  - [小程序登录、用户信息相关接口调整说明官方说明](https://developers.weixin.qq.com/community/develop/doc/000cacfa20ce88df04cb468bc52801)
  - 2021 年 4 月 28 日 24 时后发布的新版本小程序，开发者调用`wx.getUserInfo`或`<button open-type="getUserInfo"/>`将不再弹出弹窗，直接返回匿名的用户个人信息（不会返回用户昵称头像）
  - 自 2022 年 10 月 25 日 24 时起，小程序 `wx.getUserProfile` 接口将被收回：生效期后发布的小程序新版本，通过 wx.getUserProfile 接口获取用户头像将统一返回默认灰色头像，昵称将统一返回 “微信用户”。[参考](https://developers.weixin.qq.com/community/develop/doc/00022c683e8a80b29bed2142b56c01)
  - [chooseAvatar](https://developers.weixin.qq.com/community/develop/doc/00022c683e8a80b29bed2142b56c01)



**名词解释**

服务端调用 `auth.code2Session` 接口会返回：
- `openid`: 服务端调用 `auth.code2Session` 接口，换取 用户唯一标识 `OpenID`
- `unionId`: 用户在微信开放平台账号下的唯一标识 UnionID, `想获取unionId需要在微信开放平台进行绑定`~ https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/union-id.html
- `session_key`: 标识当前用户在微信上使用你的小程序的 session 信息；
- `access_token`: 小程序全局唯一后台接口调用凭据，后端调用绝大多数后台接口时都需使用。开发者可以通过 `getAccessToken` 接口获取并进行妥善保存。；https://developers.weixin.qq.com/miniprogram/dev/framework/server-ability/backend-api.html#access_token



**两种登录方式**

1. openid 登录
  - 静默登录：`wx.login（前端） + jscode2session（后端）`获取`openid、session_key、unionid`
  - 后端：`jwt + openid`生成 token 返回给前端，以 openid 为 key，新增用户；
  - 前端：本地缓存`token`，以后需要鉴权的接口请求带上 token 信息；
  - 前端：调微信提供的`头像昵称填写能力`获取头像昵称（需要弹窗授权），更新用户信息；


2. 手机号快捷登录（需企业认证）
- 通过 button 按钮的`bindgetphonenumber`事件，弹出手机号授权，获取到加密数据后，向后端换取 token





### 其他登录


- **账号+密码+图形验证码登录**
> 登录时，先获取图形验证码，再通过`图形验证码+账户+密码`获取token，最后通过token获取账号密码登录；

参考：[koa2+svg-captcha实现登录验证码以及存储验证功能（非常详细版）](https://blog.csdn.net/m0_46165586/article/details/138971155)


- **手机号+短信验证码登录**

短信验证服务需要选择短信服务商（如阿里云、腾讯云等），然后通过`手机号+短信验证码`获取token，在`node-backend`项目的`cms.js`我已经添加了部分代码，以后有时间再完善，目前账号密码登录已经能满足需求~







### h5/小程序适配

> 项目开发中我们直接使用`px`，h5包会编译成`rem`，小程序会编译成`rpx`，需要做一些适配~


- `config/index.ts`
``` ts
 designWidth(input: any) {
    let file = input?.file?.replace(/\+/g, '/');
    if (file?.indexOf('@antmjs/vantui') > -1) { // vantui 库
      return 750
    }
    return 375
  },
  deviceRatio: { // 设备比例配置
    640: 2.34 / 2,
    750: 1,
    375: 2,
    828: 1.81 / 2
  },
   plugins: [
      [
        "@tarojs/plugin-html", // https://docs.taro.zone/docs/use-h5
        {pxtransformBlackList: [/demo-/, /^body/, /^van-/]} //  包含 `demo-` 的类名选择器中的 px 单位不会被解析
      ],
  ],
```
> 具体配置看源码~


- `postcss.config.js`
``` js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // tailwindcss 里面工具类的长度单位，默认都是 rem, 在 h5 环境下自适应良好。但小程序里面，我们大部分情况都是使用 rpx 这个单位来进行自适应，所以就需要把默认的 rem 单位转化成 rpx。
    "postcss-rem-to-responsive-pixel": {
      // H5环境下1rem = 16px，小程序环境下1rem = 32rpx
      rootValue: process.env.TARO_ENV === "h5" ? 16 : 32,
      // 默认所有属性都转化
      propList: ["*"],
      // 转化的单位,可以变成 px / rpx
      transformUnit: "rpx",
    },
  },
};
```





### 代理配置

- 接口调用：
``` js
export const _aiChat = (params: any) => {
  return postJSON('/api/ai/chat', params);
};
```

- axios配置：
``` js
// src/services/axios.js
const service = axios.create({
  timeout: 20000,
  baseURL: ENV === 'h5' ? '' : process.env.TARO_APP_SERVE_URL
  // h5的baseURL为空，小程序开发走配置的合法域名
});
```


- env配置：
``` sh
# .env.development
TARO_APP_SERVE_URL = "https://www.verneyzhou-code.cn"  # 线上环境, 这个域名需要和微信公众平台设置的合法域名一致（主要给小程序开发时使用）
TARO_APP_PUBLIC_PATH = "" # h5静态资源公共路径，开发环境默认为空


# .env.production
TARO_APP_SERVE_URL = "https://www.verneyzhou-code.cn"  # 线上环境, 这个域名需要和微信公众平台设置的合法域名一致
TARO_APP_PUBLIC_PATH = "/yiwei/taro-mini-app/" # 打包后h5静态资源路径，或路由base
```


- config中配置H5代理：
``` js
// config/index.js
// 上面axios配置中h5的baseURL为空，h5本地接口请求会走到这里：
h5: {
  // 因为taro打包之后的h5项目是个多页面项目，这里静态资源就不按照SPA应用那样配置相对路径了，不然刷新页面会找不到静态资源
  publicPath: process.env.TARO_APP_PUBLIC_PATH || '/', 
  devServer: {
    port: 10087,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:9527', // 代理到本地开发服务器地址
        changeOrigin: true,
      },
    ],
  },
  router: {
    mode: process.env.TARO_ENV === 'harmony-hybrid' ? 'hash' : 'browser', // 路由模式，支持 hash、browser
    basename: process.env.TARO_APP_PUBLIC_PATH || '', // 路由基地址，默认为 '/'
  },
}

/**
 * 这样配置完成后，开发环境下h5:
  * 页面访问url为：http://localhost:10087/pages/welcome/index
  * 接口请求url为：http://localhost:10087/api/ai/chat，代理到本地开发服务器地址 http://localhost:9527/api/ai/chat
  * 页面静态资源访问url为：http://localhost:10087/js/xxx.js
* 生产环境下h5:
  * 页面访问url为：https://www.verneyzhou-code.cn/yiwei/taro-mini-app/pages/welcome/index
  * 接口请求url为：https://www.verneyzhou-code.cn/api/ai/chat
  * 页面静态资源访问url为：https://www.verneyzhou-code.cn/yiwei/taro-mini-app/js/xxx.js
 * 
* /
```


- whistle代理配置：
之后浏览器中通过 whistle 代理转发到本地开发服务器：
``` sh
127.0.0.1:9527 www.verneyzhou-code.cn
```

- 小程序开发环境代理配置：
`微信开发者工具 =》 设置 =》 代理设置 =》 手动设置代理：127.0.0.1:8899`，这个地址是刚才浏览器中whistle本地启动的地址;
> 现在就可以在小程序中使用代理请求本地后端服务了。



- `packageMain/home`中router配置：
``` js
const TARO_ENV = process.env.TARO_ENV;
const prefix = process.env.TARO_APP_PUBLIC_PATH;
const basename =
  TARO_ENV === "h5" ? `${prefix}/packageMain/home` : "packageMain/home";

// 首页入口
export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <HomePage />
    </BrowserRouter>
  );
}
```




### mock

- mockjs：[mock](https://github.com/NervJS/taro-plugin-mock)、[Mock.js 超全 超详细总结 保姆级别的教程](https://blog.csdn.net/Mme061300/article/details/130343270)



### 备注

- taro 里面普通的`div`绑定`addEventListener`事件无效，需要用`ScrollView`组件进行绑定

- 使用 tailwindcss 的样式有时不生效，微信开发者工具`styles`里有，但预览没效果，暂时无解~

- taro 中使用 scrollIntoView 无效，换成`ScrollView`组件的`scrollIntoView`

- 小程序本地调接口：
  1. 添加安全域名：[参考](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)
  - https 域名如果证书过期了，需要`重新购买证书 =》下载证书 =》登录服务器 =》替换服务器原证书 =》重启nginx =》替换node服务的证书 =》重启node服务`
  2. 配置 whistle 代理：
  - whistle 开启，配置：`127.0.0.1:9527 www.verneyzhou-code.cn`
  - 开发者工具 =》设置 =》代理设置 =》手动设置代理 =》输入`127.0.0.1:8899`
  - `开发者工具 =》详情 =》本地设置 =》勾选不校验TLS版本`
  3. 重新编译



### 报错记录

- npm run dev:h5 报错：`Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.`
> https://blog.csdn.net/weixin_68340504/article/details/144019029


- 小程序真机调试报错：
``` sh
Error during evaluating file "pages/home/index.js":
ReferenceError: TextEncoder is not defined
```
> TextDecoder 是浏览器自带的 API，在微信开发者工具中可以使用，在真机小程序环境没有这个方法，所以会报错的。

下载`https://github.com/anonyco/FastestSmallestTextEncoderDecoder/blob/master/EncoderDecoderTogether.min.js`放到目录里，在`app.jsx`文件直接引入；[参考](https://developers.weixin.qq.com/community/develop/doc/000ca85023ce78c8484e0d1d256400)


- 小程序开发报错：
```sh
Error: Minified React error #321; visit https://reactjs.org/docs/error-decoder.html?invariant=321 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
    at Object.N (._node_modules_react-reconciler_cjs_react-reconciler.production.min.js:80)

react-dom.development.js:15408 Uncaught Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
```
> 把 `useLocation`这些 hooks 放在函数组件顶部，不要放在条件语句类


- 提示：`[taro warn] 元素 img 的 src 属性值数据量过大，可能会影响渲染性能。考虑降低图片转为 base64 的阈值或在 CSS 中使用 base64。`

- 小程序开发报错：`TypeError: (0 , _packageMain_home_index__WEBPACK_IMPORTED_MODULE_5__.useHomePageContext) is not a function`

- `TypeError: Cannot read property '__wxWebviewId__' of undefined`
> ` Taro.createSelectorQuery().in(this)`报错


- 报错：`找不到模块“@/types/common”或其相应的类型声明。ts(2307)`, [参考](https://blog.csdn.net/weixin_43801036/article/details/142524266)
> `tsconfig.json`中配置：
```json
"paths": {
      "@/*": [
          "src/*"
      ]
  },
```


- 报错: `TypeError: Cannot read property 'length' of undefined at clearContainer (.._src_reconciler.ts:179)`
> toast 组件初始化需要在页面初始化完成后调用


- 引入@tarojs/plugin-mock 报错：`TypeError: helper.createBabelRegister is not a function`

- 微信开发者工具接口请求报错：`响应异常:>>  TypeError: Cannot read property 'match' of undefined`
> 本地调接口，需要配置代理~


- `Error: MiniProgramError {"errMsg":"request:fail 小程序要求的 TLS 版本必须大于等于 1.2"}`
> [阿里云服务器如何更新 tls1.2](https://worktile.com/kb/ask/1289308.html)





## vue-admin-web
> 就是一个常规的后台管理系统，具体开发不多赘述~

- [Vite](https://cn.vite.dev/guide/)
- [Vue3](https://cn.vuejs.org/guide/quick-start.html)



### 代理配置


- 接口调用：
``` js
export function getLoginCodeApi() {
  return request<Login.LoginCodeResponseData>({
    url: "/auth/code",
    method: "get"
  })
}
```

- axios配置：
``` js
// aixos.js
const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // api 的 base_url
})
```

- env配置：
``` sh
# .env.development（开发环境）
## 后端接口地址base
VITE_BASE_URL = /api/admin
## 开发环境域名和静态资源公共路径（一般 / 或 ./ 都可以）
VITE_PUBLIC_PATH = /

# .env.production（生产环境） 
VITE_BASE_URL = https://www.verneyzhou-code.cn/api/admin
VITE_PUBLIC_PATH = /yiwei/vue-admin-web/ # 打包后静态资源路径，或路由base
```

- vite配置：
``` js
// vite.config.js
defineConfig({
  return {
    base: process.env.VITE_PUBLIC_PATH // 打包后静态资源路径（保险起见，还是配绝对路径稳妥些）
    // 打包之后index.html中js引入为：<script type="module" crossorigin src="/yiwei/vue-admin-web/assets/index-BoAc0P1M.js"></script>
    // 线上访问地址为：https://www.verneyzhou-code.cn/yiwei/vue-admin-web/assets/index-BoAc0P1M.js

    // base: './' // 如果不想单独配置静态资源路径，可以这样写，这样打包后静态资源就跟项目入口模板 index.html 平级
    /////// 打包之后index.html中js引入为：<script type="module" crossorigin src="./assets/index-CUNvPOdi.js"></script>
    // 线上访问地址为：https://www.verneyzhou-code.cn/[项目入口模板所在目录]/assets/index-CUNvPOdi.js

    // 开发环境服务器配置
    server: {
      proxy: {
        "/api/admin": {
          target: "http://localhost:9527", // 代理到本地开发服务器地址
        }
      },
    }
  }
})
```


- router配置：
``` js
// router.js
export const routerConfig = {
  history: createWebHistory(VITE_PUBLIC_PATH), // 路由模式
}

// 开发环境路由：http://localhost:1234/login
// 生产环境路由：https://www.verneyzhou-code.cn/yiwei/vue-admin-web/login
```
> 项目上线后需要在ngnix中配置路由~




## node-backend

- 技术栈：`koa+nodejs`
- ai接口库：`openai`
- token加密：`jsonwebtoken + crypto`
- 接口请求：`axios + cookie`
- 验证码生成：`svg-captcha`
- 服务管理：`pm2`


### MySql

- 安装 本地 mysql， 同时安装数据库客户端 MySQL Workbench，[参考](https://blog.csdn.net/bigge_L/article/details/118766906)
- [MySQL Workbench 使用教程](https://blog.csdn.net/weixin_48131807/article/details/123133538)、[MySQL-Workbench 数据库基本操作](https://blog.csdn.net/jsugs/article/details/124176899)
- [mysql 教程](https://www.runoob.com/mysql/mysql-tutorial.html)


关于Mysql本地安装的流程可参考另一篇博文：[msql的安装与使用](/project/vue-node-admin/mysql.html)



### 开发流程

- 系统偏好配置 => 打开MySQL， 启动服务；
> 需提前安装好MySql，安装流程参考上方连接~

- 打开`MySQL Workbench`,连接本地数据库；看下对应数据table是否正常；

- 打开`node-backend`项目，`npm install && npm run dev`启动项目即可~


### 报错记录

- 运行 mysql 时报错：`Error: getaddrinfo ENOTFOUND http://localhost`
> 连接 mysql 时 `http://localhost` 改成 `localhost` 即可~


- 云服务器上`nvm use v20.18.3`报错：
```sh
[root@iz2zef9ue9eyhqrvjxs3aqz node-backend]# nvm use v20.18.3
node: /lib64/libm.so.6: version `GLIBC_2.27' not found (required by node)
node: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.20' not found (required by node)
node: /lib64/libstdc++.so.6: version `CXXABI_1.3.9' not found (required by node)
node: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.21' not found (required by node)
node: /lib64/libc.so.6: version `GLIBC_2.28' not found (required by node)
node: /lib64/libc.so.6: version `GLIBC_2.25' not found (required by node)


# 报错
[root@iz2zef9ue9eyhqrvjxs3aqz build]# make && make install
make: \*\*\* 没有指明目标并且找不到 makefile。 停止。
```
> 这个错误是因为服务器上的 `GLIBC` 和 `GLIBCXX` 版本过低，无法支持 Node.js v20 版本。我们需要先升级系统库，然后再安装 Node.js:
```sh
# 检查当前 GLIBC 版本
ldd --version

# 下载并安装新版本 GLIBC
cd /usr/local/src
wget http://ftp.gnu.org/gnu/glibc/glibc-2.28.tar.gz
tar xvf glibc-2.28.tar.gz
cd glibc-2.28
mkdir build
cd build
../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin
make
make install
```
> [node: /lib64/libm.so.6: version `GLIBC_2.27‘ not found 问题解决方案](https://blog.csdn.net/u012559967/article/details/136344204)



- 报错：
```sh
# ../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin 时报错：
*** These critical programs are missing or too old: make compiler
*** Check the INSTALL file for required versions.


##### 解决办法：
# 首先安装 CentOS 的 SCL 源
yum install -y centos-release-scl-rh centos-release-scl
# 创建新的 repo 文件
cat > /etc/yum.repos.d/centos-sclo-rh.repo << 'EOF'
[centos-sclo-rh]
name=CentOS-7 - SCLo rh
baseurl=https://mirrors.aliyun.com/centos/7/sclo/x86_64/rh/
gpgcheck=0
enabled=1
EOF
# 清理缓存
yum clean all

# 更新缓存
yum makecache

# 重新尝试安装
yum install -y devtoolset-7-gcc devtoolset-7-gcc-c++ devtoolset-7-binutils

# 启用新版本
scl enable devtoolset-7 bash

```


- 服务器执行`yum install -y bison`报错：`bison-3.0.4-2.el7.x86_64: [Errno 256] No more mirrors to try.`
> 这个错误表明 yum 无法找到可用的镜像源来安装 bison 包。我们可以通过以下步骤解决：
```sh
# 备份原有源
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup

# 下载阿里云源
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

# 清除缓存
yum clean all

# 生成缓存
yum makecache

# 安装 bison
yum install -y bison
```


- 我服务器上的mysql版本是`v5.6`，我往表里插入中文字符时报错：`Incorrect string value: '\\xE6\\x99\\xBA\\xE8\\xB0\\xB1...' for column 'label' at row  1`
> 使用 utf8mb4 而不是 utf8，因为 utf8mb4 支持完整的 Unicode 字符集（包括 emoji）；在`MySQL Workbench`中修改`label`字段的`Charset/Collation`为`utf8mb4 / utf8mb4_unicode_ci`


- 往服务器上数据库插入数据时报错：`ERROR 1064: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'JSON NULL DEFAULT NULL`
> MySQL 5.7.8 及以上版本才支持 JSON 数据类型，而我的服务器mysql版本只有`v5.6`，所以报错了。 可以考虑使用 TEXT 或 `LONGTEXT` 类型来存储 JSON 数据


- 调后台接口报错：`Incorrect integer value: 'obYIF5eMaS5MRNpGsgzk6We36fLM' for column 'openid' at row 1`
> 修改`openid`类型为`VARCHAR(45)即可`


## 部署


### 小程序上线

- 开发完成，上传代码；
- 小程序管理后台进行基础信息配置；
- 进入微信公众平台，版本管理，提交审核，发布版本；
> 小程序第一次上线前需要先去上传个人信息进行`备案`，设置`主营类目`；之后微信小程序运营会给你打电话确认信息；然后工信部发给你发链接，进行ICP审核备案；审核通过后即可提交审核，发布版本；
- 发版，审核，发布


- 绑定多端应用：[小程序绑定多端应用](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/miniapp/handbook/web/bind-mp.html)




### h5、后台管理系统上线
> 这里taro打包后的h5项目和vue-admin-web打包后的后台管理系统都需要部署到nginx服务器上，流程差不多~

- 准备阿里云ECS服务器，安装Node.js环境，安装nginx，安装mysql数据库，安装pm2，具体可参考这里[阿里云centOS服务器搭建](/project/vue-node-admin/aliyun-centos.html)

- 服务器环境配置完成，这里以 taro-mini-app 为例，根目录下创建自动化部署脚本`deploy.sh`:
``` sh
#!/bin/bash

# 定义变量
HOST="123.57.172.182"
USER="root"
PORT="22"
REMOTE_DIR="/root/nginx/upload/yiwei/taro-mini-app"

# 输出部署开始的信息
echo "开始部署H5项目到服务器..."

# 构建H5项目
echo "开始构建H5项目..."
npm run build:h5

if [ $? -ne 0 ]; then
    echo "构建失败，退出部署"
    exit 1
fi

# 检查dist/h5目录是否存在
if [ ! -d "dist/h5" ]; then
    echo "dist/h5目录不存在，请确认构建是否成功"
    exit 1
fi

# 使用rsync上传文件到服务器
echo "开始上传文件到服务器..."
# 使用rsync命令同步文件
# -a: 归档模式，保留所有文件属性
# -v: 显示详细信息
# -z: 传输时进行压缩
# --delete: 删除目标目录中有而源目录中没有的文件
# -e: 指定使用ssh作为远程shell，并设置端口
rsync -avz --delete -e "ssh -p ${PORT}" dist/h5/ ${USER}@${HOST}:${REMOTE_DIR}

if [ $? -ne 0 ]; then
    echo "文件上传失败"
    exit 1
fi

echo "部署完成！"
```

- `package.json`中添加部署脚本命令：`"deploy:h5": "chmod +x deploy.sh && ./deploy.sh"`


- 服务器下的`nginx.conf`更新配置：
``` sh
# nginx.conf

server {
  # taro-mini-app 应用配置
  location /yiwei/taro-mini-app/ {
    # 使用alias指令将/yiwei/taro-mini-app/路径指向正确的静态资源目录
    alias /root/nginx/upload/yiwei/taro-mini-app/;
    index index.html;
    # 添加了try_files指令支持前端路由，防止刷新页面时出现404错误
    try_files $uri /yiwei/taro-mini-app/index.html;

    # 添加一些基本的安全头
    add_header X-Frame-Options "SAMEORIGIN"; # 防止点击劫持
    add_header X-XSS-Protection "1; mode=block"; # 防止XSS攻击
    add_header X-Content-Type-Options "nosniff"; # 防止MIME类型猜测
  }
}
```
> 之后重启nginx服务：`nginx -s reload`

- 最后通过taro-mini-app项目根目录下执行`npm run deploy:h5`命令，即可完成部署~
> 部署过程中会提示让手动输入服务器密码，输入即可~






### 后端部署上线

- 准备阿里云ECS服务器，确定服务器ngnix和数据库已配置完成；

- 打开`MySQL Workbench`，连接服务器数据库（需要输入账号+密码），按照本地开发时数据库新建对应的数据表；

- 服务器根目录下创建自动化部署脚本`deploy.sh`:
``` sh
#!/bin/bash

# 定义服务器相关信息
HOST="123.57.172.182"
USER="root"
PORT="22"
REMOTE_DIR="/root/nginx/upload/yiwei/node-backend"

# 打印部署开始信息
echo "开始部署node-backend项目到生产环境..."

# 构建项目
echo "正在打包项目文件..."

# 创建临时部署目录
DEPLOY_DIR="deploy_tmp"
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

# 复制必要的文件到部署目录
cp -r .env .env.config.js app.js config.js controller error main.js package.json pm2.config.js router service sql utils $DEPLOY_DIR/

# 连接服务器并部署
echo "正在部署到服务器..."

# 创建远程目录（如果不存在）
# ssh -p ${PORT} ${USER}@${HOST} "mkdir -p ${REMOTE_DIR}"

# 上传文件到服务器
echo "正在上传文件..."
# 使用rsync命令进行文件同步
# -a: 归档模式，保留所有文件属性
# -v: 显示详细信息
# -z: 传输时进行压缩
# --checksum: 基于校验和而不是时间戳来决定文件是否需要传输
# --delete: 删除目标目录中有而源目录中没有的文件
# --exclude: 排除node_modules目录
# -e: 指定使用ssh协议并设置端口
rsync -avz --checksum --delete --exclude='node_modules' -e "ssh -p ${PORT}" $DEPLOY_DIR/ ${USER}@${HOST}:${REMOTE_DIR}

# 清理临时部署目录
rm -rf $DEPLOY_DIR

echo "正在启动服务..."
# 在服务器上安装依赖并启动服务（首次或需要重新下载node包）
# ssh -p ${PORT} ${USER}@${HOST} "cd ${REMOTE_DIR} && \
#     npm install && \
#     pm2 update && pm2 start pm2.config.js && pm2 list"

ssh -p ${PORT} ${USER}@${HOST} "cd ${REMOTE_DIR} && pm2 update && pm2 reload YiweiNodeServer && pm2 list"

# 清理临时部署目录
rm -rf $DEPLOY_DIR

echo "部署完成！"
```

- 服务器`nginx.conf`配置更新：
``` sh
# https 配置
server {
    # Node.js API 反向代理配置
    location /api/ {
        proxy_pass http://localhost:9527/;  # 代理转发到本地node服务端口
        proxy_http_version 1.1;  # 使用HTTP 1.1协议
        proxy_set_header Upgrade $http_upgrade;  # WebSocket支持
        proxy_set_header Connection 'upgrade';  # WebSocket连接升级
        proxy_set_header Host $host;  # 设置主机头
        proxy_cache_bypass $http_upgrade;  # 绕过缓存
        proxy_set_header X-Real-IP $remote_addr;  # 传递真实IP
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # 传递代理链路信息

        # 允许跨域请求
        add_header Access-Control-Allow-Origin *;  # 允许所有来源
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE';  # 允许的HTTP方法
        add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';  # 允许的请求头

        # 处理 OPTIONS 请求
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;  # 预检请求跨域支持
            add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE';
            add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
            add_header Access-Control-Max-Age 1728000;  # 预检请求缓存时间
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;  # 返回无内容状态码
        }
    }
}
```

- 服务器根目录下添加`pm2.config.js`文件：
``` js
module.exports = {
    apps: [
        {
            name: 'YiweiNodeServer', // 应用名称
            script: './main.js', // 入口文件
        },
    ],
};
```

- `package.json`中添加命令：`"deploy": "chmod +x deploy.sh && ./deploy.sh"`

- 在服务器根目录下执行`npm run deploy`命令，即可完成部署~
> 部署过程中会提示让手动输入服务器密码，输入即可~




> 如果在`deploy.sh`执行了重新安装包部署，有时服务会启动错误，接口报`502`；这时需要通过ssh登录服务器`nvm use v16`切换node版本，然后`npm install`手动再安装一遍，然后再执行`pm2 start pm2.config.js`启动服务才可以~

> 有时node切到`v16`之后执行`pm2`会报`sh: pm2: 未找到命令`，但重新退出登录服务器就可以了，很奇怪...







## 其他


- **mysql中如何保存数组？**

1. 使用 JSON 类型: 
    - sql： `ALTER TABLE admin.chat_table MODIFY COLUMN messages JSON`
    - js: 
    ``` js
    // 存储时无需 JSON.stringify，直接存储数组
    const statement = `
        INSERT INTO admin.chat_table (chat_id, model, messages, creator, create_time)
        VALUES (?, ?, ?, ?, ?)
    `;
    await connection.execute(statement, [chat_id, model, messages, creator, time]);
    ```


2. 使用字符串分隔（简单场景）
``` sql
-- 定义类型
`ALTER TABLE admin.chat_table MODIFY COLUMN messages TEXT`

-- 存储时用分隔符连接
INSERT INTO chat_table (messages) VALUES ('item1,item2,item3');

-- 查询时用 SUBSTRING_INDEX 分割
SELECT SUBSTRING_INDEX(messages, ',', 1) as first_item FROM chat_table;
```


3. 使用独立的关联表（标准范式）：
``` sql
-- 主表
CREATE TABLE chats (
    chat_id VARCHAR(50) PRIMARY KEY,
    model VARCHAR(50)
);

-- 消息表
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id VARCHAR(50),
    message_content TEXT,
    message_type VARCHAR(20),
    created_at TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(chat_id)
);
```



- **高并发情况下怎么保证生成id的唯一性？**

1. Redis 自增 + 前缀
2. 数据库自增 + 分段锁
3. 雪花算法（Snowflake）


高并发场景下的最佳实践：
1. 使用`分布式 ID 生成器`：雪花算法（推荐）、UidGenerator（百度开源）、Leaf（美团开源）
2. 预分配机制：批量获取 ID 范围、本地缓存部分 ID
3. 多重保障：数据库唯一索引、业务层去重检查、分布式锁
4. 监控告警：ID 生成速率监控、时钟回拨检测、容量预警
5. 容灾方案：多机房部署、快速故障转移、降级策略


选择建议：
1. 并发量不大：`UUID 或时间戳+随机数`
2. 中等并发：`Redis 自增方案`
3. 高并发：`雪花算法或专业的分布式 ID 生成服务`




- **查看ECS服务器上数据库所占内存大小**
``` sh
top -p `pidof mysqld` # 使用top命令
ps aux | grep mysql # 使用ps命令
du -sh /var/lib/mysql/  # 查看数据库文件大小
```


- `nvm alias default 16`：切换默认node版本




## 备注

- 在前端和后端中的数据存储？
  - 比如前端页面中声明一个变量，用户访问，这个变量只在当前页面中存在；
  - node后端中声明一个变量，用户访问，这个变量在当前服务器中存在，其他用户访问，这个变量也存在；需要考虑高并发问题？








## 参考


- 小程序登录：
  - [讨论微信小程序的 session_key 和 access_token 的作用](https://juejin.cn/post/7409704996550459426)
  - [微信小程序登录流程（详细+图解）](https://juejin.cn/post/7212074532340908091)
  - [彻底搞懂小程序登录流程-附小程序和服务端代码](https://github.com/75team/w3c/blob/master/articles/20181001_chunpu_%E5%BD%BB%E5%BA%95%E6%90%9E%E6%87%82%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%99%BB%E5%BD%95%E6%B5%81%E7%A8%8B-%E9%99%84%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%92%8C%E6%9C%8D%E5%8A%A1%E7%AB%AF%E4%BB%A3%E7%A0%81.md)
  - [详解小程序常见的登录方式](https://blog.csdn.net/qq_16593939/article/details/134807040)
  - [微信小程序授权登录三种实现方式](https://blog.csdn.net/weixin_45559449/article/details/129398318)


- [在 Taro 项目上配置 ESLint 和 Git Hooks](https://juejin.cn/post/7095266488361156638)

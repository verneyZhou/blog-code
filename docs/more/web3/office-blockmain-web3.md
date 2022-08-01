---
title: 互爱町项目开发笔记
date: 2022-07-19 19:09:57
permalink: false
categories:
#   - tool
#   - web3
tags:
  - 
---



# 互爱町项目开发笔记

技术栈：`vue3 + typescript + vite + vant + ethers`

- [vue3](https://v3.cn.vuejs.org/)
- [vite](https://vitejs.cn/)
- [vant](https://youzan.github.io/vant/#/zh-CN)
- [typescript](https://www.tslang.cn/docs/home.html)
- [ethers.js 中文文档](https://learnblockchain.cn/docs/ethers.js/index.html)


[MetaMask钱包](https://metamask.io/download/)



## 构建

node v14+


node包管理工具推荐：`pnpm > yarn > npm`

`npm install -g pnpm`
> node v14+


全局安装ts： `npm install -g typescript`


### 项目启动

- `pnpm install` （或 npm install）

- `npm run dev`

- vscode编辑器可以安装[Volar](https://www.imooc.com/article/317810)插件，功能比Vetur更全，对.ts文件有良好支持~





## 备注

- 移动端适配
    postcss-pxtorem
    amfe-flexible

- eslint代码规范
    pnpm add eslint -D
    npm init @eslint/config
    ...
    配置.eslintrc
    
    Volar
    
- 项目结构
- web3调用
    ethers.js

- 打包部署配置

- 引入UI库
    vant




### 页面初始化
1. 入口`App.vue`: 钱包授权，链接钱包，获取钱包账户地址`userAddress`；如果没有安装钱包则弹窗提示安装钱包；
    - 如果不是`/welcome`欢迎页，则执行`pageInit`：调获取合约接口 》用户信息接口 》调新人引导步骤接口；`210003`则跳至注册页；
    - 如果是`/welcome`欢迎页，则无操作；用户点击【进入】，则执行上述`pageInit`逻辑，全部调用成功则跳至`/home/office`页；
2. `/login`页面：注册成功，则执行上述`pageInit`逻辑，更新数据，进入`home/office`页面；
3. `home/office`页面：`layout/index.vue`判断如果还是新人身份，弹窗引导 》 获取盲盒




## 测试部署

- 新建gitlab仓库，`git push`推送代码；

- nginx添加配置；


- `vite.config.ts`中修改配置; 

- `package.json`中添加部署命令`deploy`：

- 接着`npm run build`打包；`npm run deploy`部署，选择测试机器, 部署~

- whistle 中添加代理

- 浏览器访问




## 上线

- npm run build

- npm run publish

- 上线平台操作上线，模板给后端，后端给一个地址


线上访问


## 问题记录


### 配置报错记录

- 链上执行写入操作`writeGreeting`时报错：
``` js
MetaMask - RPC Error: [ethjs-query] while formatting outputs from RPC '{"value":{"code":-32603,"data":{"code":-32000,"message":"Nonce too high. Expected nonce to be 0 but got 4. Note that transactions can't be queued when automining.","data":{"message":"Nonce too high. Expected nonce to be 0 but got 4. Note that transactions can't be queued when automining."}}}}
```
> 钱包换个账户就可以，一会儿又不行了...暂时无解...

解决方案：点击钱包 》点击右上角头像 》设置 》 高级 》 【自定义交易 nonce】打开，这样下次交易时手动输入nonce即可；或者选择【重设账户】

[以太坊nonce详解](https://blog.csdn.net/cljdsc/article/details/118196287)



- `npm run dev`报错：`13:41:15 [vite] Internal server error: node.getIterator is not a function`
> 将 `postcss-px2rem-exclude` 换成 `postcss-px2rem`




- 安装eslint后，保存ts文件编辑器报错：`Invalid Options: 'plugins' doesn't add plugins to configuration to load. Please use the 'overrideConfig.plugins' option instead.`
> 打开vcode的settings.json文件：
``` json
  "eslint.options": {
//     "plugins": [
//       "html"
//     ]
  },
```


- eslint报错：`Parsing error: '>' expected`
> .eslintrc修改如下：
``` json
// 'parserOptions': {
    //     'ecmaVersion': 'latest',
    //     'parser': '@typescript-eslint/parser',
    //     'sourceType': 'module'
    // },
    'parser': 'vue-eslint-parser',
    'parserOptions':{'parser':'@typescript-eslint/parser'},
```




### 开发报错记录

- 项目开发中，提示`Maximum recursive updates exceeded in component <van-dropdown-menu>.....`
> 将组件`:class=`去掉




- `flex: 1`父元素宽度撑开
> 父元素设置`overflow:hidden`，如有溢出隐藏设置`width: 100%`




- 提示: `[@vue/compiler-sfc] the >>> and /deep/ combinators have been deprecated. Use :deep() instead.`
> 是因为在 vue3 中已经弃用了 `/deep/` （深度选择器） 使用: `:deep()`
``` less
// 之前这样写
/deep/ .class {

}

// 现在的写法
:deep(.class) {

}
```


- `vant-list`初始化时一直加载`onLoad`
> 将外层容器高度设置为:`height: 100vh`


### 合约相关问题记录

- 调链上合约方法时报错：
``` shell
code: -32603
message: "execution reverted: ERC20: transfer amount exceeds balance"
```
> 交易金额超出余额，应该是账户余额不够了~


- metamask连接私链错误：`could not fetch chain ID. Is your RPC URL correct?`



### 兼容性问题记录

- ios时间展示问题：`new Date('2022/01/01 00:00:00')`
> 在ios浏览器上不能解析`new Date('2022-01-01 00:00:00')`格式~

- ios中 van-popup 组件 层级遮挡问题
> 设置`teleport="body"`,挂载在 body 上

- iphone12图片只设置`max-width: 100%`会拉伸
> `max-width`设置确定的大小

- ios浏览器中单页面跳转会有缓存








## 记录

- ~~Toast提示位置~~
- 骨架屏
- 图片懒加载占位图
- ~重定向路由~~
- ios刘海屏问题处理
- 代码整理
- 列表滚动加载更多
- ~~【发电厂】滚动渐变效果~~
- 【新手引导】
- 交易详情页面跳转，调起钱包
- 封装接口请求
- h5页面测试
- 点赞数展示优化: 999+
- 列表-详情 跳转位置缓存
- $toast与$dialog交互冲突问题，授权提示优化?




## 总结

- 每一笔链上的交易都会生成一条记录


- 后端把合约部署到链上后，会给一个ip地址，MetaMask钱包上添加该网络，连接，就能在自己的账户下看到还有多少ETH；前端通过`ethers.js`连接上钱包，再通过后端给的一个合约地址和合约ABI，就能生成合约实例，连接上该网络，就可以调用该网络上的合约方法了~


- 后端启动服务后会有一个ip地址，如：`http://10.182.10.193:1234`，MetaMask钱包中添加网络，链id填`9215`，保存，之后就可以通过钱包访问这个网络下的合约了（后端好像可以给该网络添加部分测试ETH，会自动加到当前账户？）；
- 具体怎么访问呢，前端通过`ethers.js`连接上钱包，再通过后端给的一个合约地址和合约ABI，就能生成合约实例，连接上该网络，就可以调用该网络上的合约方法了~

- [remix](https://remix.ethereum.org/)的合约如何部署钱包？
    1. 先找一个有足够余额的账户：启动 Gache 软件，选择 quick start, 会自动生成10个账户，每个账户100ETH；且生成RPC SERVER：`HTTP://127.0.0.1:7545`
    2. 钱包中添加以上网络，链id填1337, 之后导入账户，上面10个选一个就行，导入私钥；
    3. remix中合约开发完成，选择`Inject web3`,会自动加载出MetaMask的当前账户，第一次加载时钱包会弹框：是否确认连接`emix.ethereum.org`？选择当前账户，连接即可；之后点击`Deploy`部署，调起钱包，确认，即完成部署；部署完成后会在remix界面的`Deployed Contracts`看到部署后的详情，能看到部署后的**合约地址**；
    4. 之后前端添加合约地址和合约ABI，即可调用该合约的方法~

    > [Remix开发部署智能合约](https://segmentfault.com/a/1190000040657797)、[使用Ganache，web3js和remix在个人区块链上部署并调用合约](https://blog.csdn.net/qq_40261606/article/details/123249473)



- 以太坊线上网络、Ganache启动后的本地测试网络（http://127.0.0.1:7545）、hardhat项目启动服务后的本地测试网络（http://127.0.0.1:8545）、公司自己的weibo chain测试网络（http://10.182.10.193:4000）;在每个网络下进行的交易只能在该网络下进行查询；Ganache和hardhat启动的本地测试网络都会生成一些有eth的测试账号方便开发使用；



### ethers学习笔记
> Ethers.js 是一个 JavaScript 库，其作用是使开发者可以与以太坊区块链进行交互。该库包含 JavaScript 和 TypeScript 中的实用程序函数，以及以太坊钱包的所有功能。

::: tip ethers.js 有四个模块，构成应用程序编程界面 (API)。
- `Ethers.provider`：封装与以太坊区块链的连接。它可以用于签发查询和发送已签名的交易，这将改变区块链的状态。
- `Ethers.contract`：部署智能合约并与它交互。具体来说，该模块中的函数用于侦听从智能合约发射的事件、调用智能合约提供的函数、获取有关智能合约的信息，以及部署智能合约。
- `Ethers.utils`：提供用于格式化数据和处理用户输入的实用程序函数。
- `Ethers.wallets`：使你可以与现有钱包（以太坊地址）建立连接、创建新钱包以及对交易签名。
:::

- `Provider = new ethers.providers.Web3Provider(window.ethereum)`：Provider（在ethers中）是一个为以太坊网络连接提供抽象的类。它提供对区块链及其状态的只读访问。

- `signer = Provider.getSigner()`: 签名者是一个（通常）以某种方式直接或间接访问私钥的类，它可以签署消息和交易以授权网络向您的帐户收取以太币，执行操作。

- `Contract = new ethers.Contract(contractAddress, abi, signer)`: 合约是一种抽象，表示与以太坊网络上特定合约的连接，因此应用程序可以像使用普通 JavaScript 对象一样使用它。




## TODO
1. 链上接口调用梳理, ethers.js使用熟悉
    - TX HASH, BLOCK HASH, BLOCK, gas, gas limit, GAS USED, eth, wei, USD
    - 每次交易都会生成新的`BLOCK`, 生成新的的交易哈希`TX HASH`，区块哈希`BLOCK HASH`
2. 翻墙
3. 博客笔记，公众号
4. 移动端代理配置
5. eslint强校验取消
6. vue3，ts用法总结，vue3周边生态整理
7. 打包部署
8. whistle



### 第二期

- 交易不走metamask：web3.js 生成账户，私钥，助记词，用户输入密码，加密生成秘钥



<fix-link label="Back" href="/more/web3/"></fix-link>
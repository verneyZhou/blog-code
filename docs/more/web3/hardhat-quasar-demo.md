---
title: hardhat-quasar-demo项目搭建笔记
date: 2022-07-17 10:42:55
permalink: false
categories:
  - web3
tags:
  - dapp
  - hardhat
  - quasar
---


# hardhat-quasar-demo项目搭建笔记

这里是我服务端用 Hadrhat, 客户端用 Quasar 搭建 web3 项目的记录~


## 服务端：hardhat + ts + solidity

- [hardhat官方文档](https://hardhat.org/getting-started/#quick-start)

- [Solidity 最新(0.8.0)中文文档](https://learnblockchain.cn/docs/solidity/)
- [根据例子学习Solidity](https://solidity-cn.readthedocs.io/zh/develop/solidity-by-example.html)


## 客户端：quasar + ts + ethers

- [quasar官方文档](https://quasar.dev/)、[github](https://github.com/quasarframework/quasar)、[quasar中文文档](http://www.quasarchs.com/)
> quasar 是基于 Vue 的前端框架，对于 Typescript 有良好的类型支持

- [Ethers.js](https://learnblockchain.cn/docs/ethers.js/)
> 是 JavaScript 库，允许您的 Web 应用程序从客户端（前端）与以太坊区块链交互。




## HardHat项目构建记录

``` shell
npm init -y
npm install --save-dev hardhat. # 安装hardhat  与相关依赖库
npx hardhat  # 创建hardhat 工程
    Create an advanced sample project that uses TypeScript
    # 之后一路回车
```

- 配置 `hardhat.config.ts`
``` js
const config: HardhatUserConfig = {
  solidity: "0.8.4",
  defaultNetwork:"localhost_8897",  //加入hardhat 自带的ETH 测试网络
  networks: {
    localhost_8897: { // 本地网路
      url:"http://127.0.0.1:8897/"
    },
    hardhat: {     // Hardhat 网络配置     
      chainId: 31338,      // 链 ID，默认 31337      
      gasPrice: "auto"      // gas 价格，默认 auto    
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths:{
    artifacts: "../client/src/artifacts",   //注意此处因为把工程分开，所以 artifacts 生成 目录 改变到quasar 工程目录下。
  }
};

export default config;
```


- `package.json`中添加命令
``` json
"compile": "npx hardhat compile", // 编译，仅编译solidity 文件，用于检查soldiity 语法是否正确
"build": "npx hardhat compile && npm run build2", // 编译hardhat 工程，并将生成的类型文件拷贝到quasar 目录
"deploy": "npx hardhat run scripts/deploy.ts", // 部署，发布合约
"server": "npx hardhat node --port 8897", // 启动服务，开始hardhat 测试网络，供本地开发调用
"test": "npx hardhat test", // 测试
"build2": "rimraf ../client/src/typechain && cp -R ./typechain ../client/src/typechain"
// rimraf 的作用：以包的形式包装rm -rf命令，用来删除文件和文件夹的，不管文件夹是否为空，都可删除
// cp 命令的基本格式：cp [选项] 源文件 目标文件；  cp -R 递归复制
```


- 启动项目: `npm run serve`
> 即：`npx hardhat node --port 8897`，**启动区块链网络一个本地节点**。在每次启动时，默认会提供 20 个钱包账户和私钥，每个钱包提供 10000 个 ETH 做测试。

> 会启动本地服务：`http://127.0.0.1:8897/`，同时打印出20个账户信息的账号和私钥

- 在 metamask 中新增本地网络, 跟 `hardhat.config.ts` 中 `networks` 配置一样~
```
网络名称：localhost_8897
URL: http://localhost:8897
链ID: 31338
货币符号：ETH
```

- 部署合约：`npm run deploy`
> 即：`npx hardhat run scripts/deploy.ts`, 执行 scripts/deploy.ts 中的 main 方法，**把合约部署到了本地网络上**，并且打印出了 Greeter 这个合约的部署地址。**每次部署生成的地址都不同**

``` js
// scripts/deploy.ts

async function main() {
  const Greeter = await ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Hardhat! Hello Web3 hahaha");

  await greeter.deployed();

  console.log("Greeter deployed to:", greeter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

```

> 到这步为止，我们的 Greeter 合约就成功在本地网络上部署好了，也成功使用 MetaMask 钱包，进行了本地网络连接、测试账户导入。

MetaMask 钱包会在每个网页 js 上下文注入一个全局对像，也就是`window.ethereum`，以方便每一个dapp 应用与区块链交互。

- 打包：`npm run build`
> npm run build. 后会生成相应的类型文件到 `client` 目录，这样TS 能直接识别合约的类型，方便开发与错误排除




### 其他常见命令

- `npx hardhat run scripts/deploy.js --network <network-name>`
要指示Hardhat在运行任务时连接到特定的以太坊网络，可以使用--network参数; 要部署到诸如主网或任何测试网之类的远程网络，你需要在hardhat.config.js文件中添加一个network条目，如：
``` js
require("@nomiclabs/hardhat-waffle");
const config = {
    alchemy: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // 测试网络token
    privateKey: "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // 钱包私钥
};
module.exports = {
    solidity: "0.8.4",
    networks: {
        ropsten: {
            url: `https://ropsten.infura.io/v3/${config.alchemy}`,
            accounts: [config.privateKey],
            chainId: 3,
        },
    },
};
```

- `npx hardhat test`
> 用于执行单元测试，在示例中，也就是运行了 test/sample_test.js;
> 当执行 npx hardhat test 命令时，会内置创建 hardhat 网络，并在 hardhat 网络上完成合约部署、方法调用等，不会部署在 localhost 网络上。


- `npx hardhat console`
> 启动一个控制台程序，方便交互式输入输出。例如输入 config 查看配置情况


- `npx hardhat compile`
> 在执行 npx hardhat run scripts/deploy.js --network localhost 部署合约的时候，其实 hardhat 偷偷帮你做了一件事情：**编译**;
> 执行 npx hardhat compile 命令, 会在根目录下生成 artifacts 和 cache 目录；cache 是编译出来的缓存文件夹，artifacts 目录下的文件由源文件编译而来。


- `npx hardhat clean`
> 这个命令和 npx hardhat compile 的作用恰好相反，是把编译出来的文件清理一下.


- `npx hardhat help`
> 这条命令会展示 npx hardhat 系列命令的用法




## Quasar项目构建记录

``` shell
# 进入根目录hardhat-quasar-demo下，先全局安装quasar
npm install -g @quasar/cli # 构建quasar/cli项目， Node 12+
quasar -v # 查看版本


# 初始化
npm init quasar

✔ What would you like to build? › App with Quasar CLI, let's go!
✔ Project folder: … client
✔ Pick Quasar version: › Quasar v2 (Vue 3 | latest and greatest)
✔ Pick script type: › Typescript
✔ Pick Quasar App CLI variant: › Quasar App CLI with Vite
✔ Package name: … client
✔ Project product name: (must start with letter if building mobile apps) … Quasar App
✔ Project description: … A Quasar Project
✔ Author: … xxx <xxxxx@xxxx.com>
✔ Pick a Vue component style: › Composition API
✔ Pick your CSS preprocessor: › Sass with indented syntax
✔ Check the features needed for your project: › ESLint, State Management (Vuex) [DEPRECATED by Vue Team], Axios
? Pick an ESLint preset: › - Use arrow-keys. Return to submit.
❯   Prettier - https://github.com/prettier/prettier
    Standard
    Airbnb
```

``` shell
# 启动服务
cd client
yarn #or: npm install
yarn lint --fix # or: npm run lint -- --fix
quasar dev # or: yarn quasar dev # or: npx quasar dev

yarn add ethers # 安装 ethers 库

```



## 开发流程



### MetaMask钱包的下载和安装
> MetaMask是一个以太坊生态下的钱包，可以管理你的账户，支持多种网络。[官方文档](https://metamask.io/)


可以通过给 Chrome 添加扩展程序 MetaMask，可让您从浏览器连接到以太坊区块链网络。

[下载参考](https://www.csdn.net/tags/NtzaYg4sMzM3NTEtYmxvZwO0O0OO0O0O.html)
1. [下载地址](https://github.com/MetaMask/metamask-extension/releases), 解压
2. chrome浏览器输入：chrome://extensions/, 加载已解压扩展程序


接着**通过助记词的方式，生成一个新账户**；也可以通过粘贴私钥的方式，导入你原有的账户。


- MetaMask App[下载](https://metamask.io/download/)



### 服务端：Hadrhat

- 开发合约：
``` js
// contracts/Greeter.sol

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Greeter {
    string private greeting;

    constructor(string memory _greeting) {
        console.log("=====111111========= Deploying a Greeter with greeting:", _greeting);
        greeting = _greeting;
    }

    function getGreeting() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public {
        console.log("======hahahhaha  ====== I have changed greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }
}

```

- 服务端开发完成，执行`npm run serve`启动本地节点，同时在钱包中添加本地网络，导入账户

- 服务端先执行`npm run build`编译，会将编译后的文件输出到客户端项目client中，同时将生成的类型说明文件复制到client项目中，之后在client中读写合约时会用到~

- 服务端执行`npm run deploy`部署合约到链上，同时生成一个**合约地址（Contract address）**，记住它，之后在client项目中读写合约时会用到~






### MetaMask导入账户

- **导入账户**: 点击右上角图标 》 导入账户 》 粘贴账户私钥 》 导入
> `hardhat`项目在`npx hardhat node`时会自动生成20个测试账户, 选择其中一个私钥导入即可~

- **梳理**
1. 每个钱包下面可以创建多个网络，每个网络下面可以添加多个账户，每个账户上面都有一定数量的ETH可供每次交易使用；同一个账户在不同网络下面ETH金额是相互独立的~
2. 网络主要包括：以太坊 Ethereum 主网络、Ropsten测试网络、Localhost本地网络；每个账户下也可以连接多个客户端服务，一般是前端项目启动后会先选择账户，然后该账户就连接上当前前端服务；

3. 点击账户右边的【...】会看到已连接的网站，这些网站一般是连接到当前账户的客户端链接~






### 客户端：Quasar

- 新建一个读写合约的文件：`components/CompositionComp.vue`
> 在这个文件中会导入刚才在服务端执行`npm run build`时生成的类型文件，和合约结构说明（contractABI）

``` vue
<template>
    <div>
        <q-btn v-if="!userAddress" @click="onLogin" label="登录"></q-btn>
        <div v-else>
            <p>{{userAddress}}</p>
            <p> greeting 值为: {{ greeting }}</p>
            <q-btn @click="readGreeting" label="读取greeting"></q-btn> <br>
            <q-input v-model="new_greeting"></q-input>
            <q-btn @click="writeGreeting" label="写入greeting"></q-btn>
        </div>
        
    </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';

// import { Todo, Meta } from './models';
import { ethers } from 'ethers'
import {Greeter} from "src/typechain/Greeter"
import contractABI from 'src/artifacts/contracts/Greeter.sol/Greeter.json'

declare global {
  interface Window {
    ethereum:{
    isConnected():boolean,
    request(args: { method: string;params?: unknown[] | object;}): Promise<unknown>,
    on(event:string, handler: (para: any) => void):void,
    }
  }
}


export default defineComponent({
    name: "CompositionComp",
    // props: {},
    setup(props) {
        return {
            userAddress: ref(''), // 用户地址
            greeting:ref(""),
            new_greeting:ref(""),
            contractAddress:"0x5FbDB2315678afecb367f032d93F642f64180aa3" // 合约地址，服务端部署后自动生成
        }
    },
    mounted() {
        this.readGreeting();
    },
    methods: {
        // 登录
        async onLogin() {
            const {ethereum} = window;
            console.log(ethereum);
            if (!ethereum) {
                alert('请安装 metamask钱包~')
                return;
            }
            // 调起浏览器的metamask钱包      
            const [account] = await this.Provider().send('eth_requestAccounts', [])
            console.log(account); // 获取到钱包账户地址
            this.userAddress = account;
        },
        Provider() {
            return new ethers.providers.Web3Provider(window.ethereum);
        },
        // 合约
        Contract() {
            const Provider = this.Provider();
            const signer = Provider.getSigner(); // 获取用户
            // 生成合约实例
            const Contract: Greeter = new ethers.Contract(this.contractAddress, contractABI.abi, signer) as Greeter
            return Contract;
        },
        // 读取合约
        async readGreeting() {
            const contract = this.Contract();
            try {
                const greet_str = await contract.getGreeting()
                this.greeting = greet_str
                console.log('greet_str: ', greet_str)
            } catch (err) {
                console.log("Error: ", err)
            }
        },
        // 写入合约
        async writeGreeting() {
            if (!this.new_greeting) return;
            const contract = this.Contract();
            try {
                const tx = await contract.setGreeting(this.new_greeting) // 调用add方法，在metamask中执行交易
                const res = await tx.wait() // 等待tx执行完毕
                await this.readGreeting() // 更新
                console.log('transaction return: ', res)
            } catch (err) {
                console.log("Error: ", err)
            }
        },
    }
})


</script>
```

- 之后在写读写合约的方法时就会用到服务端刚才生成的`Contract address`，具体流程看代码~

- 之后前端页面中引入该组件, 执行`npm run dev`,启动客户端项目，浏览器中就会打开页面，出现【登录】按钮~

- 点击登录，调起钱包，选择账户, 连接即可~
> 引入`ethers.js`库，客户端可以跟区块链发生交互，会在window上生成一个全局的`ethereum`对象；登录操作就是调用`ethers`库的api跟 MetaMask 钱包通信，获取钱包账户地址


- 之后就是执行刚才定义的读写合约方法了~






## 备注

- vue3的使用
- ts的使用
- solidity语法使用
- ethers的使用
- hardhat的配置

## 问题记录

- 没了服务器，部署到链上的数据都保存在哪里？
- hardhat项目开发完成后，怎么部署线上或测试环境？
- vue-game-dapp下的ropsten网络怎么启动连接？
    - `npx hardhat run scripts/deploy.js --network ropsten`报错：`HardhatError: HH110: Invalid JSON-RPC response received: invalid project id`

- `unit, int, long, short, float, double`的区别？
    - 整型：int / uint ：分别表示有符号和无符号的不同位数的整型变量。 支持关键字 uint8 到 uint256 （无符号，从 8 位到 256 位）以及 int8 到 int256，以 8 位为步长递增。 uint 和 int 分别是 uint256 和 int256 的别名。





## 参考

- [HARDHAT 与 QUASAR/VUE/TYPESCRIPT/ETHERS 以太坊开发环境搭建](https://www.it1129.com/2022/03/08/hardhat-%e4%b8%8e-quasar-vue-typescript-ethers-%e4%bb%a5%e5%a4%aa%e5%9d%8a%e5%bc%80%e5%8f%91%e7%8e%af%e5%a2%83%e6%90%ad%e5%bb%ba/)
- [web3开发DApp项目入门教程（2022年最新）](https://baijiahao.baidu.com/s?id=1727989741134662012)




<fix-link label="Back" href="/more/web3/"></fix-link>
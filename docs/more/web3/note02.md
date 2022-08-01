---
title: Web3入门-实践篇
date: 2022-07-14 15:02:51
permalink: false
categories:
  - web3
tags:
  - web3
  - 区块链
---




# Web3入门-实践篇



## 名词解释



### Solidity
> Solidity是最主要的、最常用的智能合约开发语言。Solidity适用于大多数智能合约平台，如Ethereum、Avalanche、Moonbeam、Polygon、BSC，等等。这是由于大多数区块链都采用了以太坊虚拟机（EVM），而solidity就是为其而生的。在目前排名前十的Defi项目中，有九个使用solidity作为他们的主要编程语言。


[Solidity 最新(0.8.0)中文文档](https://learnblockchain.cn/docs/solidity/)

关于Solidity的入门学习笔记已经记录在我的另一篇博客[Solidity入门笔记](./solidity-learn01)里了，这里不再赘述~


### OpenZeppelin
> Openzeppelin是一套已经写好的智能合约，[OpenZeppelin的智能合约代码库](https://www.openzeppelin.com/)是以太坊开发者的宝库，OpenZeppelin代码库包含了经过社区审查的ERC代币标准、安全协议以及很多的辅助工具库，这些代码可以帮助开发者专注业务逻辑的，而无需重新发明轮子。



- [OpenZeppelin 7个最常使用的合约](https://zhuanlan.zhihu.com/p/142240709)




### Remix IDE
> 您可以使用 [Remix IDE](https://remix.ethereum.org/) 使事情变得更容易，尤其是如果您是新手。您可以使用它直接从浏览器创建、修改和执行智能合约。Remix IDE 是编写和玩弄智能合约的完美环境 。如果您使用 Remix IDE，则无需安装 Ganache 和 Truffle。

> Truffle 和  Remix IDE 都允许您测试和部署合约，但 truffle 可以用作项目中的构建依赖项，而 remix 更像是一个编辑器。

目前尝试 Solidity 编程的最好的方式是使用 Remix。Remix 是一个基于 Web 浏览器的 IDE，它可以让你编写 Solidity 智能合约，然后部署并运行该智能合约。

当部署完一个合约时，Remix就会出现与之交互的按钮。选择solidity版本、编译、运行solidity测试等都很容易。


[新版Remix界面使用教程](https://blog.csdn.net/qq_43175651/article/details/120239196)

[使用Remix编译和部署以太坊智能合约](https://juejin.cn/post/6844903593498116104)

::: tip remix的合约如何部署钱包？
1. 先找一个有足够余额的账户：启动 Gache 软件，选择 quick start, 会自动生成10个账户，每个账户100ETH；且生成RPC SERVER：`HTTP://127.0.0.1:7545`
2. 钱包中添加以上网络，链id填1337, 之后导入账户，上面10个选一个就行，导入私钥；
3. remix中合约开发完成，选择`Inject web3`,会自动加载出MetaMask的当前账户，第一次加载时钱包会弹框：是否确认连接`emix.ethereum.org`？选择当前账户，连接即可；之后点击`Deploy`部署，调起钱包，确认，即完成部署；部署完成后会在remix界面的`Deployed Contracts`看到部署后的详情，能看到部署后的**合约地址**；
4. 之后前端添加合约地址和合约`ABI`，即可调用该合约的方法~
> ABI 全称是 Application Binary Interface，它就是合约接口的描述.
:::
[Remix开发部署智能合约](https://segmentfault.com/a/1190000040657797)、[使用Ganache，web3js和remix在个人区块链上部署并调用合约](https://blog.csdn.net/qq_40261606/article/details/123249473)


### Truffle
> 一个使用以太坊虚拟机编译和测试智能合约的开发环境，Truffle 拥有超过 150 万的下载量，是开发区块链应用程序的最受欢迎的工具。

Truffle是最先出现的框架之一，最初是Consensys的一部分，从Consensys剥离出来，然后又合并回Consensys。它是一个基于js的框架，包含了Ganache（甚至像brownie这样的框架也使用它）、Drizzle和现在最新的truffle teams等工具。Truffle是所有框架中历史影响最大的，你可以看到他们对行业的影响，很多框架都采用了Truffle的实践做法。

几年来，Truffle一直都是默认开发框架，这不是没有理由的。它确实是一个十分强大的框架，为许多其他框架树立了行业标准。现在使用这个平台的项目非常多，Truffle还可以很轻松地实现与姊妹工具Drizzle和Ganache集成。

[官方文档](https://trufflesuite.com/ganache/)

[Truffle 中文文档](https://learnblockchain.cn/docs/truffle/)


### Ganache
> [Ganache](https://trufflesuite.com/ganache/) 为您提供了一个本地区块链环境来测试您的智能合约。无论你在这个本地区块链上做什么，都会保留在你的 PC 上。

Ganache是一个运行着区块链的图形应用程序，即提供了一个可用于测试目的区块链。 它默认运行在`127.0.0.1:7545`上。Ganache是一个运行在本地的个人区块链，适用于以太坊的开发者。
> Ganache在内存中模拟了一个区块链，因此每次Ganache关闭之后，区块链会丢失。

下载 Ganache 软件，启动，会生成一个本地的测试区块链网络。



### Hardhat
[Hardhat](https://hardhat.org/)框架，是一个以太坊DApp开发的本地集成开发套件。经常与之对比的是[Truffle](https://trufflesuite.com/)。相比其它作为web3基础设施的开发工具，Hardhat 更加轻量，采用插件化的思想，非常适合作为新手dapp开发入门的工具。

现在，hardhat框架是最主要的智能合约开发框架。Hardhat是一个基于js和solidity的开发框架，可以快速提升你的应用程序的开发速度。


Truffle 和 Hardhat 都是在以太坊区块链上编写智能合约的开发环境，这些工具允许开发者: **编译合约、测试合约、部署合约、调试合约**。

[Hardhat 入门教程](https://learnblockchain.cn/article/1356)

[Hardhat框架官方教程【以太坊开发】](https://cloud.tencent.com/developer/article/1794419)




### MetaMask
MetaMask是一个以太坊生态下的钱包，可以管理你的账户，支持多种网络。

- [官方文档](https://metamask.io/)
- [官方下载地址](https://metamask.io/download/), 可能需要翻墙才能下载~
- [MetaMask Docs](https://docs.metamask.io/guide/)


MetaMask是在浏览器中与dapps进行交互的最简单方法，可以连接到以太坊网络而无需在浏览器的计算机上运行完整节点。 它可以连接到以太坊主网以及任何一个测试网(Ropsten，Kovan和Rinkeby) 或者本地如Ganache或Truffle Develop创建的区块链。


**chrome浏览器中使用**
> 本质上是一个 Chrome 扩展程序，可让您从浏览器连接到以太坊区块链网络。
1. 官方下载需要翻墙，可在github中下载压缩包，[下载地址](https://github.com/MetaMask/metamask-extension/releases), 解压
2. chrome浏览器输入：chrome://extensions/, 加载已解压扩展程序

- [以太坊轻钱包MetaMask详细图文教程](https://zhuanlan.zhihu.com/p/33791793)
- [元宇宙入门攻略：2022年新版MetaMask（小狐狸钱包）安装及注册](https://baijiahao.baidu.com/s?id=1730149256112668052)


- 浏览器中暂时禁用MetaMask
> 点击小狐狸头像 》 管理扩展程序 》 禁用；（重新开启的话需要输入密码）





### Web3.js
> [Web3.js](https://web3.tryblockchain.org/) 是 JavaScript 库，允许您的 Web 应用程序从客户端（前端）与以太坊区块链交互。


[web3.js 中文文档](https://learnblockchain.cn/docs/web3.js/)


### Ethers.js
> [Ethers.js](https://learnblockchain.cn/docs/ethers.js/) 和 Web3.js 是 JavaScript 库，是一个轻量级的web3.js替代品, 允许您的 Web 应用程序从客户端（前端）与以太坊区块链交互。该库包含 JavaScript 和 TypeScript 中的实用程序函数，以及以太坊钱包的所有功能。

ethers.js库旨在为以太坊区块链及其生态系统提供一个小而完整的 JavaScript API 库 它最初是与 ethers.io 一起使用，现在已经扩展为更通用的库。

ethers.js 对比使用 web3.js 代码量更少，接口也更简洁，推荐优先使用 ethers.js 。


::: tip ethers.js 有四个模块，构成应用程序编程界面 (API)。
- `Ethers.provider`：封装与以太坊区块链的连接。它可以用于签发查询和发送已签名的交易，这将改变区块链的状态。
- `Ethers.contract`：部署智能合约并与它交互。具体来说，该模块中的函数用于侦听从智能合约发射的事件、调用智能合约提供的函数、获取有关智能合约的信息，以及部署智能合约。
- `Ethers.utils`：提供用于格式化数据和处理用户输入的实用程序函数。
- `Ethers.wallets`：使你可以与现有钱包（以太坊地址）建立连接、创建新钱包以及对交易签名。
:::

- `Provider = new ethers.providers.Web3Provider(window.ethereum)`：Provider（在ethers中）是一个为以太坊网络连接提供抽象的类。它提供对区块链及其状态的只读访问。

- `signer = Provider.getSigner()`: 签名者是一个（通常）以某种方式直接或间接访问私钥的类，它可以签署消息和交易以授权网络向您的帐户收取以太币，执行操作。

- `Contract = new ethers.Contract(contractAddress, abi, signer)`: 合约是一种抽象，表示与以太坊网络上特定合约的连接，因此应用程序可以像使用普通 JavaScript 对象一样使用它。


[github地址](https://github.com/ethers-io/ethers.js)、[ethers v5 文档](https://docs.ethers.io/v5/api/)


[21个基于ethers的Dapp常用工具函数](https://learnblockchain.cn/article/3675)

[以太坊 JavaScript 库：web3.js 与 ethers.js 比较（第一部分）](https://learnblockchain.cn/article/1851)

[Ethers.js中文教程](https://blog.csdn.net/shebao3333/article/details/102490747)



### Quasar
> [官方文档](https://quasar.dev/)，基于Vue 的前端框架，对于Typescript 有良好的类型支持。



## 实操一：Hardhat开发智能合约
> 实现了用 Hardhat 编写一个简单的读写合约，部署到区块链的本地网络上，并使用 MetaMask 进行交易。

技术栈：`Hardhat + Solidity + MetaMask`

参考：[web3开发DApp项目入门教程（2022年最新）](https://baijiahao.baidu.com/s?id=1727989741134662012)



### 流程


- **初始化**：创建一个目录 `hardhat-demo`, 进到这个目录里，执行`npx hardhat init`,一路回车；
> node版本`v14+`~


- **本地启动**：`npx hardhat node`
> 按照 `hardhat.config.js` 中声明的配置，**启动区块链网络一个本地节点**。在每次启动时，默认会提供 20 个钱包账户和私钥，每个钱包提供 10000 个 ETH 做测试。

``` js
// hardhat.config.js

// 声明依赖
require("dotenv").config();

// 声明 Hardhat 启动时执行的任务，下面这个任务的作用是打印账户的信息
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// 声明配置项
module.exports = {
  solidity: "0.8.4", // solidity 编译器的版本
  networks: { // 网络配置情况，下面可以添加多个网络的配置 
    localhost: {   // 本地网络
      url: "http://127.0.0.1:8545"  // 本地网络的 url    
    },
    hardhat: {     // Hardhat 网络配置     
      chainId: 31337,      // 链 ID，默认 31337      
      gasPrice: "auto"      // gas 价格，默认 auto    
    },
    // rinkeby: {    // rinkeby 网络         
    //   url: "https://eth-rinkeby.alchemyapi.io/v2/123abc123abc123abc123abc123abcde", // rinkeby 结点的 url 
    //   accounts: [privateKey1, privateKey2, ...]  // 使用的账户列表    
    // },
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
  // 配置合约路径
  paths: {
    sources: "contracts"
  },
};

```



- **MetaMask钱包添加本地网络**

1. Chrome浏览器下载安装Metamask插件;
> 具体下载方法上面[名词解释](#metamask)中有说明~

2. 通过助记词生成账户；
> 接下来可以通过助记词的方式，生成一个新账户；也可以通过粘贴私钥的方式，导入你原有的账户；切记：**一定要记住助记词！！！**

3. 添加本地启动的本地区块链网络节点；
``` js
网络名称：LocalHost_8545 // 自定义
RPC_URL: http://127.0.0.1:8545 // 上方启动的本地节点
链ID: 31337 // 
货币符号：ETH
```

4. 通过私钥导入测试账户
> 创建成功后，点击右上角头像，通过私钥导入账户，从生成的20个测试账户中随便导入一个即可~



- **编写一个简单的读写合约**：`Greeter.sol`
``` js
// contracts/Greeter.sol

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0; // 声明 licensepragma solidity ^0.8.0;

import "hardhat/console.sol"; // 导入其它智能合约文件: 是 Hardhat 框架自带的，是一个用于方便调试的合约文件

// 定义一个合约，合约名字叫 Greeter
contract Greeter {
    string private greeting; // 这个合约的一个私有变量

    // 合约的构造函数, 当且仅当合约被部署时，会被执行一次
    // memory：和 storage 关键字相反，代表了变量只会临时放在内存中，不会存储在合约的状态中；
    constructor(string memory _greeting) {
        console.log("Deploying a Greeter with greeting:", _greeting);
        greeting = _greeting;
    }

    // 可以被外部调用的合约方法，view 声明了这是个只读方法, 不会改变合约的状态
    function greet() public view returns (string memory) {
        return greeting;
    }

    // 这是一个写方法，会改变合约的状态，且外部调用时会消耗 gas
    function setGreeting(string memory _greeting) public {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }
}
```


- **部署合约**：`npx hardhat run scripts/deploy.js --network localhost`
> 执行 `scripts/deploy.js` 中的 `main` 方法，**把合约部署到了本地网络上**，并且打印出了 `Greeter` 这个合约的部署地址。**每次部署生成的地址都不同**

到这步为止，我们的 `Greeter` 合约就成功在本地网络上部署好了，也成功使用 `MetaMask` 钱包，进行了本地网络连接、测试账户导入。

``` js
// scripts/deploy.js

/**
 *  作用：是将刚才的 Greeter.sol 智能合约编译并部署到链上。
 */

const hre = require("hardhat"); // 声明依赖库

// 定义 main 函数, 获取合约 
async function main() {

  const Greeter = await hre.ethers.getContractFactory("Greeter"); // 部署合约，并得到一个合约的实例 Greeter

  // Greeter 这个合约像是一个类，而每次部署得到的 greeter 像是 new 了一个类的对象。因此每次部署，都会生成出不同的对象，得到的合约地址也就不同。
  const greeter = await Greeter.deploy("Hello, Hardhat! hello, World! Hello Web3!!!");

  await greeter.deployed(); // 等待合约部署完成

  console.log("Greeter deployed to:", greeter.address); // 打印日志，记录合约的地址
}

// 执行 main 函数
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

```



### 其他命令

- `npx hardhat test`
> 用于执行单元测试，在示例中，也就是运行了 `test/sample_test.js`;

> 当执行 npx hardhat test 命令时，会内置创建 hardhat 网络，并在 hardhat 网络上完成合约部署、方法调用等，不会部署在 localhost 网络上。

``` js
// test/sample_test.js

/**
 * 单元测试文件
 */

const { expect } = require("chai"); // 引入依赖
const { ethers } = require("hardhat");

// describe 和 it 指示了在进行 case test
describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {

    // 这里和 scripts/deploy.js 中的代码一样， 也是获取合约 + 部署合约 + 等待部署完成
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!1111");
    await greeter.deployed();

    // 测试点 1 : greeter.greet()的返回结果应该等于 Hello, world!1111
    expect(await greeter.greet()).to.equal("Hello, world!1111");

    // 执行合约的写方法
    const setGreetingTx = await greeter.setGreeting("Hola, mundo!11111");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    // 测试点 2
    expect(await greeter.greet()).to.equal("Hola, mundo!11111");
  });
});

```


- `npx hardhat console`
> 启动一个控制台程序，方便交互式输入输出。例如输入 config 查看配置情况


- `npx hardhat compile`
> 在执行 `npx hardhat run scripts/deploy.js --network localhost` 部署合约的时候，其实 `hardhat` 偷偷帮你做了一件事情：**编译**;

> 执行 `npx hardhat compile` 命令, 会在根目录下生成 `artifacts` 和 `cache` 目录；`cache` 是编译出来的缓存文件夹，`artifacts`` 目录下的文件由源文件编译而来。


- `npx hardhat clean`
> 这个命令和 `npx hardhat compile` 的作用恰好相反，是把编译出来的文件清理一下.


- `npx hardhat help`
> 这条命令会展示 npx hardhat 系列命令的用法



## 实操二：Vue中调用计数合约
> 继续刚才的实操一项目，在里面添加计数合约；前端新建`vue`项目，实现合约的调用~

技术栈：`@vue/cli + ethers`


学习参考：
- [solidity与vue进行前端交互](https://www.bilibili.com/video/BV1qL4y1M7nZ)
- [前端VUE使用web3调用小狐狸（metamask）和合约（ERC20）交互](https://blog.csdn.net/weixin_42582423/article/details/124402614)

项目参考：[hardhat-vue-demo](https://github.com/kasoqian/hardhat-vue-demo)


### 流程

**vue项目搭建**

- `npm install -g @vue/cli`

- `vue create vue-web3-demo`

- `npm i ethers`



**`Greeter.sol`中添加计数方法**

``` js
// contracts/Greeter.sol

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0; // 声明 licensepragma solidity ^0.8.0;

import "hardhat/console.sol"; // 导入其它智能合约文件: 是 Hardhat 框架自带的，是一个用于方便调试的合约文件

// 定义一个合约，合约名字叫 Greeter
contract Greeter {
    string private greeting; // 这个合约的一个私有变量
    uint256 counts; // 声明了一个名为 counts 的状态变量，其类型为 uint (256位无符号整数）

    // 合约的构造函数, 当且仅当合约被部署时，会被执行一次
    // memory：和 storage 关键字相反，代表了变量只会临时放在内存中，不会存储在合约的状态中；
    constructor(string memory _greeting) {
        console.log("Deploying a Greeter with greeting:", _greeting);
        greeting = _greeting;
        counts = 0;
    }

    // 可以被外部调用的合约方法，view 声明了这是个只读方法, 不会改变合约的状态
    function greet() public view returns (string memory) {
        return greeting;
    }

    // 这是一个写方法，会改变合约的状态，且外部调用时会消耗 gas
    function setGreeting(string memory _greeting) public {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }


    /**
    计数方法
     */
    //  获取计数
     function countGet() public view returns (uint256) {
         return counts;
     }
     function countAdd() public {
         counts ++;
     }
}

```
参照实操一的`npx hardhat run scripts/deploy.js --network localhost`方法，将合约部署到链上~


**引入合约abi**

``` js
// src/contract.js

// 合约编译之后生成的abi结构
export const contractABI = [
    {
        inputs: [],
        name: 'countAdd',
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        inputs: [],
        name: 'countGet',
        outputs: [ // 输出
            {
                internalType: "uint256", // 类型
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type: "function"
    }
]

// 链上地址, hardhat每次部署后都会生成这样一个地址
export const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

```

**合约调用**

``` vue
<!-- scr/App.vue -->

<template>  
  <div>
    <div>
      <button v-if="!userAddress" @click="checkLogin">登录</button>
      <template v-else>
         <span>用户地址：{{userAddress}}</span>
         <p>当前计数：{{count}}</p>
         <button @click="addCount">add</button>
      </template>
     
    </div>
  </div>
</template>

<script>
import {ethers} from 'ethers';
import {contractABI, contractAddress} from './contract';

export default {
  name: 'App',
  data() {
    return {
      userAddress: '',
      count: 0
    }
  },
  created() {
    this.getCount();
  },
  methods: {
    async checkLogin() {
    // 使用Metamask 钱包，metamask 钱包会在每个网页js 上下文注入一个全局对像，也就是window.ethereum，以方便每一个dapp 应用与区块链交互。
      const {ethereum} = window;
      console.log(ethereum);
      if (!ethereum) {
        alert('请安装 metamask钱包~')
        return;
      }
      // 调起浏览器的metamask钱包      
      const [account] = await this.Provider().send('eth_requestAccounts', [])
      console.log(account); // '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' 获取到钱包地址
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
      const Contract = new ethers.Contract(contractAddress, contractABI, signer)
      return Contract;
    },

    // 获取计数
    async getCount() {
      const contract = this.Contract();
      const result = await contract.countGet();
      console.log(result);
      this.count = Number(result);
    },

    // 增加计数
    async addCount() {
      const contract = this.Contract();
      const tx = await contract.countAdd(); // 调用add方法，在metamask中执行交易
      await tx.wait(); // 等待tx执行完毕
      await this.getCount(); // 更新
    }
  }
}
</script>
```

以上就完成了在`vue`项目中一个计数合约的简单调用，每次调用`countAdd`方法时钱包都会弹窗提醒用户手动确认交易，每次交易都会消耗一定金额的eth，可在钱包界面查看到每次的交易记录~

前端启动服务后，项目初始化, 第一次调用钱包实例`ethereum`会弹窗提示是否连接前端服务连接，选择连接即可~


### 总结

实操一和实操二两个例子结合在一起，总结一下，大致流程如下：

1. 服务端使用 `Hardhat` 创建项目，并启动区块链本地网络节点；

2. 通过`MetaMask`钱包连接这个本地网络，通过私钥导入上一步启动本地网络时生成的测试账户；

3. 服务端使用`Solidity`编写合约，并编译部署，每次编译部署会生成合约地址，`abi`等信息；

4. 前端通过`Vue`新建项目，并通过`ethers.js`连接钱包，这样就能连接上钱包上的本地区块链网络；
> MetaMask的优势在于可以管理多个网络，只要我们浏览器上安装该插件，就可以访问区块链的测试、线上、本地等网络~

5. 前端连接上钱包，拿到服务端部署合约后生成的合约地址、`abi`等信息，就可以生成合约实例；

6. 之后就可以调用服务端编写的合约方法了，每次的交易都能在钱包上看到~




## 实操三：Ganache编写计数合约
> 使用 Ganache 启动本地区块链网络；并用 Remix 编写一个简单的计数合约，编译；本地通过 Web3.js 部署合约，并完成调用~

技术栈：`Ganache + Web3.js + Remix IDE`

参考：[使用Ganache，web3js和remix在个人区块链上部署并调用合约](https://blog.csdn.net/qq_40261606/article/details/123249473)


### 流程

- 安装 [Ganache](https://trufflesuite.com/ganache/) 软件
> 启动 Ganache, 选择 quick start, 会自动启动本地网络RPC SERVER：`HTTP://127.0.0.1:7545`，同时生成10个可供使用的测试账号，每个有100ETH;

- 创建项目，项目根目录下安装web3: `npm --registry http://registry.npm.taobao.org install web3`

- 项目初始化：`npm init -y`


- 项目根目录下新建`index.js`，先尝试连接 Ganache 启动的本地网络，获取测试账号
``` js
var localhost = "http://127.0.0.1:7545"
var Web3 = require("web3")
var web3 = new Web3(new Web3.providers.HttpProvider(localhost))
web3.eth.getAccounts(function (error, result) {
    console.log("账户列表地址：");
    console.log(result);
});
```
终端输入`node index.js`，可看到10个地址都被打印出来了~


- 编写合约：浏览器打开[remix IDE](https://remix.ethereum.org)，写一个简单的计数合约`Count.sol`，编译；编辑成功后可以在 `Compilation Details` 中查看合约`ABI、WEB3DEPLOY`等详细信息；
> 关于 remix 的使用可以参考上面名词解释中的说明~
``` js
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0; // 声明 licensepragma solidity ^0.8.0;

import "hardhat/console.sol"; // 导入其它智能合约文件: 是 Hardhat 框架自带的，是一个用于方便调试的合约文件


contract Count {
    uint256 counts; // 声明了一个名为 counts 的状态变量，其类型为 uint (256位无符号整数）

    // 合约的构造函数, 当且仅当合约被部署时，会被执行一次
    // memory：和 storage 关键字相反，代表了变量只会临时放在内存中，不会存储在合约的状态中；
    constructor() {
        counts = 0;
        console.log("Deploying a Count with counts:", counts);
    }


    /**
    计数方法
     */
    //  获取计数
     function countGet() public view returns (uint256) {
         console.log("======counts get", counts);
         return counts;
     }
     function countAdd() public {
         console.log("======countAdd", counts);
         counts ++;
     }
}


```

- 将`WEB3DEPLOY`里面的代码复制到`index.js`中，把里面的`web3.eth.accounts[0]`替换为我们自己的地址`account_1`(在Ganache给我们的十个账户中随便选一个就行):
``` js
// index.js

/**
 * 尝试一下获取Ganache中给予我们的十个账户地址
 */
var localhost = "http://127.0.0.1:7545"
var Web3 = require("web3")
var web3 = new Web3(new Web3.providers.HttpProvider(localhost))
web3.eth.getAccounts(function (error, result) {
    console.log("账户列表地址：");
    console.log(result); // 打印出 Ganache 中生成的地址
});


var account_1 = '0x02E4b829695efaa8026b558B9f97a9ff38923A53'; // 在Ganache给我们的十个账户中随便选一个就行

/**
 * 
 * 以下代码为remix上编译Count.sol后 WEB3DEPLOY 中的代码~
 * 执行 node index.js 可将 Count.sol 部署到 Ganache 上
 */
var storageContract = new web3.eth.Contract([{"inputs":[],"name":"retrieve","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"num","type":"uint256"}],"name":"store","outputs":[],"stateMutability":"nonpayable","type":"function"}]);
var storage = storageContract.deploy({
     data: '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100d9565b60405180910390f35b610073600480360381019061006e919061009d565b61007e565b005b60008054905090565b8060008190555050565b60008135905061009781610103565b92915050565b6000602082840312156100b3576100b26100fe565b5b60006100c184828501610088565b91505092915050565b6100d3816100f4565b82525050565b60006020820190506100ee60008301846100ca565b92915050565b6000819050919050565b600080fd5b61010c816100f4565b811461011757600080fd5b5056fea26469706673582212209a159a4f3847890f10bfb87871a61eba91c5dbf5ee3cf6398207e292eee22a1664736f6c63430008070033', 
     arguments: [
     ]
}).send({
    //  from: web3.eth.accounts[0], 
    from: account_1, // 替换为account_1 
     gas: '4700000'
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })

```
> 执行 `node index.js`后终端打印出交易地址，即表示部署成功~

- 这时点击 `Ganache` 点击最上方的`BLOCKS`再点最上方生成的块即可看到交易的信息，可以看到`TX HASH`的地址和我们输出的地址一样，说明我们的合约已经在`Ganache`上部署成功了，接下来我们就可以拿到上面的合约地址调用合约了~


- 调用合约：根目录下新建`main.js`, 将我们刚刚部署号的合约地址`contractAddress`，`data`(从`WEB3DEPLOY`中复制出来的代码里面)以及`ABI`加到我们的代码里:
> 合约地址可在 Ganache 的交易信息里看到: `CREATED CONTRACT ADDRESS`~
``` js
// main.js


var localhost = "http://127.0.0.1:7545" // Ganache启动后的地址

var account_1 = '0x02E4b829695efaa8026b558B9f97a9ff38923A53'; // 在Ganache给我们的十个账户中随便选一个就行

var contractAddress = "0xc2543D152826eCC8D5372d91558b26dFB6cB8eaf"; // 部署合约后在Ganache中生成的合约地址

// 可在remix上编译后复制
var contractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "countAdd",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "countGet",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];


// 可在remix上编译后复制
var data = "0x608060405234801561001057600080fd5b50600080819055506100636040518060400160405280601e81526020017f4465706c6f79696e67206120436f756e74207769746820636f756e74733a000081525060005461006860201b6100851760201c565b610215565b610106828260405160240161007e92919061017b565b6040516020818303038152906040527f9710a9d0000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505061010a60201b60201c565b5050565b60008151905060006a636f6e736f6c652e6c6f679050602083016000808483855afa5050505050565b600061013e826101ab565b61014881856101b6565b93506101588185602086016101d1565b61016181610204565b840191505092915050565b610175816101c7565b82525050565b600060408201905081810360008301526101958185610133565b90506101a4602083018461016c565b9392505050565b600081519050919050565b600082825260208201905092915050565b6000819050919050565b60005b838110156101ef5780820151818401526020810190506101d4565b838111156101fe576000848401525b50505050565b6000601f19601f8301169050919050565b6102f5806102246000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806310cfb2b41461003b578063b62d26e914610045575b600080fd5b610043610063565b005b61004d61007c565b60405161005a91906101c2565b60405180910390f35b60008081548092919061007590610236565b9190505550565b60008054905090565b61011d828260405160240161009b929190610192565b6040516020818303038152906040527f9710a9d0000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050610121565b5050565b60008151905060006a636f6e736f6c652e6c6f679050602083016000808483855afa5050505050565b6000610155826101dd565b61015f81856101e8565b935061016f818560208601610203565b610178816102ae565b840191505092915050565b61018c816101f9565b82525050565b600060408201905081810360008301526101ac818561014a565b90506101bb6020830184610183565b9392505050565b60006020820190506101d76000830184610183565b92915050565b600081519050919050565b600082825260208201905092915050565b6000819050919050565b60005b83811015610221578082015181840152602081019050610206565b83811115610230576000848401525b50505050565b6000610241826101f9565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8214156102745761027361027f565b5b600182019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000601f19601f830116905091905056fea26469706673582212204ec17c557a47d14a36b6bdf98911d991ced44306502500b4ea2d7614e192278364736f6c63430008070033"



var Web3 = require("web3")

// 连接 Ganache 上的本地区块链
var web3 = new Web3(new Web3.providers.HttpProvider(localhost))

// 连接部署到 Ganache 上的合约地址, 生成合约实例
var Storage_Contract = new web3.eth.Contract(contractABI, contractAddress)

// 传入参数
Storage_Contract.options.data = data;



// 调用合约的 countAdd 方法
Storage_Contract.methods.countAdd().call({ from : account_1}, function(error, result) {
    console.log("=====countAdd " + result);
})

// 调用合约的 countGet 方法
Storage_Contract.methods.countGet().send({ from : account_1}, function (error, result) {
    console.log("=====countGet" + result);
})

```
> 执行 `node main.js`，打印出正确结果，则表示合约调用成功~

### 总结 

总结一下，大致流程就是：
1. 使用`Ganache`启动本地区块链网络；
2. 使用`Remix`编写合约，并编译；
3. 项目中通过`Web3.js`连接`Ganache`启动的本地网络，拿到`Remix`中合约编译后的`ABI`等信息，生成合约实例；
4. 然后就可以在项目中调用合约方法了，并能在 `Ganache` 上看到交易信息~




## 实操四：Truffle开发智能合约
> 使用 truffle 框架开发智能合约，前端通过 vue 实现对合约的调用~

技术栈：`Truffle + Solidity + @vue/cli + Web3.js + MetaMask`

参考： [如何使用Vue.js 开发以太坊DApp](https://learnblockchain.cn/2019/12/20/vue-dapp)

### 流程


**创建 Vue 项目**

- `npm install -g @vue/cli`

- `vue create truffle-vue-dapp`

- `cd truffle-vue-dapp`

- ` npm run serve`



**初始化 truffle**

- `npm install -g truffle`

- `truffle init`


**与众筹合约交互**
> 现在来编写JavaScript逻辑部分，前端界面与合约进行交互时，需要使用到 truffle-contract 及 web3

- `npm install --save truffle-contract web3`

MetaMask 和 Ganache 搭配使用: 探测 MetaMask 注入的 web3
``` js
import Web3 from "web3";

// 检查新版MetaMask
  if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // 请求用户账号授权
      await window.ethereum.enable();
    } catch (error) {
      // 用户拒绝了访问
      console.error("User denied account access")
    }
  }
  // 老版 MetaMask
  else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
  }
 // 如果没有注入的web3实例，回退到使用 Ganache
  else {
    App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
  }
  web3 = new Web3(App.web3Provider);
  web3.eth.getAccounts().then(accs  => {
    this.account = accs[0] // 获取账户
  })

```

关于项目实践的其他细节，这里不再赘述，具体可看上方参考链接~

这里有另一个的实践项目[truffle_start_kit](https://www.it1129.com/2022/03/09/truffle-ganache-%e4%b8%8e-quasar-vue-typescript-web3-js-%e4%bb%a5%e5%a4%aa%e5%9d%8a%e5%bc%80%e5%8f%91%e7%8e%af%e5%a2%83%e6%90%ad%e5%bb%ba/)可供参考，使用技术栈：`Truffle + Solidity + web3.js + Ganache + Quasar + ts`，Quasar其实就是 Vue 的框架，这里用的是 Vue3~ 大致实现原理都比较类似~




### 总结
大致流程和实操一、二类似，就是这里是使用 Truffle 框架搭建的项目：
1. 首先服务端使用 Truffle 搭建项目，使用 Solidity 编写合约;
2. Truffle 本身并没有以太坊测试环境，需要下载 ganache 以太访本地测试网络: `http://127.0.0.0.1:7545`, 之后在 MetaMask 钱包中添加该测试网络，导入测试账户私钥；
3. 之后就可以在服务端通过编译合约，生成合约 abi 与 类型声明文件；部署合约到上述测试网络上；
4. 前端通过 `Web.js` 钱包，并调用合约方法，交易信息可以在钱包上看到~



## 实操五：hardhat-quasar-demo
> 这是一个服务端用 Hardhat, 客户端使用 Quasar 搭建的 web3 项目，相关笔记放在另一篇博文[hardhat-quasar-demo项目搭建笔记](./hardhat-quasar-demo)了，这里不再赘述~







## 收藏

- [登链社区](https://learnblockchain.cn/)
- [https://faucet.metamask.io/](https://faucet.metamask.io/)
- [Solidity 中文文档](https://learnblockchain.cn/docs/solidity/)
- [2022十大智能合约开发工具](https://zhuanlan.zhihu.com/p/459165804)
- [cn.etherscan.com](https://cn.etherscan.com/)
- [专注区块链开发与应用](https://www.it1129.com/)




## 项目收藏

- [vue-game-dapp](https://github.com/QuintionTang/vue-game-dapp)



<fix-link label="Back" href="/more/web3/"></fix-link>


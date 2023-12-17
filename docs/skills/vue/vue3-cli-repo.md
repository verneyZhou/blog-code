---
title: 开发一个快速搭建vue3项目的脚手架
date: 2023-12-13 00:37:47
permalink: false
categories:
  - vue3
  - 脚手架
tags:
  - 脚手架
---

# 开发一个快速搭建vue3项目的脚手架

> 最近在项目开发中经常使用vite搭建vue3项目，在项目初始化搭建阶段我会根据业务场景再自定义一些配置，为了方便以后搭建新项目能快速复用这些配置，我决定搭建一个脚手架，用于之后快速搭建vue3项目~

这篇博文主要记录了如何从0到1搭建一个创建vue3项目的脚手架`verney-vite-cli`，该脚手架源码放在[verney-vue-design](https://github.com/verneyZhou/verney-vue-design)项目中了；`verney-vue-design`是一个 `momorepo` 项目，里面包含组件库，工具库，脚手架等子项目，关于该项目的搭建不是这篇博文的重点，这里不再赘述，具体可参考这里[从0到1搭建vue组件库](/skills/vue/vue-design.html)

这里将脚手架项目放在`verney-design`中主要是为了代码管理，其实重新新建一个项目也可以搭建~



## 使用

- [verney-vite-cli](https://www.npmjs.com/package/verney-vite-cli)

- [使用文档](https://verney-vue-design-verneyzhou.vercel.app/pages/guide/cli.html)

使用比较简单，先node版本切换到`v16+`:

- **方式一**：直接在需要创建项目的目录执行 `npx verney-vite-cli create [name]` 即可，name为项目名，可不输入，按提示操作即可
> npx 会将 `verney-vite-cli` 下载到一个临时目录，使用以后再删除

``` sh
npx verney-vite-cli create
---------------- 欢迎使用 verney-vite-cli 脚手架工具 ----------------
? 模板名称 vueProjectDemo
✔ 🚀🚀🚀🚀🚀项目创建成功🚀🚀🚀🚀🚀
```


- **方式二**：
1. 先`npm i verney-vite-cli`下载`cli`包到本地，或者`-g`下载到全局也行；
2. 再`verney-vite-cli`按提示操作即可~







## 搭建

- 首先新建一个项目，我这叫`verney-vite-cli`, node版本切到`v16+`, 我使用的包管理工具是`pnpm`;

- 初始化`package.json`: `pnpm init`;


- 搭建项目目录结构如下：

``` js
└── verney-vite-cli
    ├── bin/
        ├── cli.js  // 脚手架执行js
        ├── inquirer.js  // 命令行交互
    ├── index.js  // 入口
    ├── package.json
```
> 其实项目目录结构很简单，一般脚手架都是用户输入命令，会提示用户选择哪些配置，最后根据这些配置生成相应的项目模板，接下来简单实现以下~


- 首先在`package.json`中添加`bin`命令：

``` json
{
  "name": "verney-vite-cli",
  "private": false,
  "version": "1.0.0",
  "description": "快速搭建vite+vue3项目脚手架~",
  "main": "index.js",
  "bin": {
    "verney-vite-cli": "./index.js"
  }
}
```

- 根目录下`index.js`：

``` js
#! /usr/bin/env node

console.log('hello  cli')
```
> `#! /usr/bin/env node`: 这句代码解决了不同的用户 `node` 路径不同的问题，可以让系统动态的去查找 `node` 来执行你的脚本文件。


- 将当前命令链接到全局，即可测试是否正常：`npm link`


- 启动：`verney-vite-cli`,如果终端打印`hello  cli`即表示`bin`命令配置成功；
> 这样就完成了一个最基础的脚手架工程，接下来在命令行窗口输入 `verney-vite-cli` 命令，就能执行`index.js`中的代码了~


- 接下来开始完善脚手架逻辑，首先是`index.js`:

``` js
#! /usr/bin/env node

// 文件以#!开头代表这个文件被当做一个执行文件来执行，可以当做脚本运行。后面的/usr/bin/env node代表这个文件用node执行，node基于用户安装根目录下的环境变量中查找

const { cli } = require('./bin/cli.js');
cli();
```


- 接着看下`cli.js`:

``` js
// bin/cli.js

const path = require('path');
const program = require('commander'); // 命令行交互工具
// 扩展一下输出的样式
const chalk = require('chalk');
const ora = require('ora'); // 用于输出loading样式

const fsExtra = require('fs-extra'); // fs-extra 是对 fs 模块的扩展，支持 promise 语法
const { exec } = require('child_process'); // 子进程

const pkg = require('../package.json'); // 引入package.json
const { inquirerPrompt } = require('./inquirer'); // 引入用户配置信息
const { install } = require('./install');
const remoteUrl = 'https://github.com/verneyZhou/vue3-vite-admin.git'; // 模板地址
const remoteTempName = 'vue3-vite-admin'; // 远程模板名称

//定义logs样式
const defaultLog = (log) => console.log(chalk.blue(`---------------- ${log} ----------------`));
const errorLog = (log) => console.log(chalk.red(`---------------- ${log} ----------------`));
const successLog = (log) => console.log(chalk.green(`---------------- ${log} ----------------`));

// 初始化
const init = () => {
    defaultLog(`欢迎使用 ${pkg.name} 脚手架工具`);
    program
        .name(pkg.name)
        .usage('<command> [options]') // 定义命令的使用方法
        .description(chalk.greenBright('🚀🚀🚀🚀🚀一个快速生成Vue3项目的脚手架🚀🚀🚀🚀🚀'))
        .version(pkg.version)
        .option('-V, --version', '版本号')
        .option('-h, --help', '帮助');
};

// 帮助命令: verney-vite-cli --help 时的输出
const help = () => {
    program.on('--help', () => {
        console.log('\r\n' + chalk.white.bgBlueBright.bold(pkg.name));
        console.log(`\r\nRun ${chalk.cyan(`${pkg.name} create [name]`)} 创建新项目\r\n`);
    });
};

// 创建命令: verney-vite-cli create <name>
// 参数可为必选的（尖括号表示，例如<required>）或可选的（方括号表示，例如[optional]）。
const create = () => {
    program
        .command('create [name]')
        .description('创建一个新项目')
        .action(async (name) => {
            try {
                // 提示用户输入
                const opts = await inquirerPrompt(name);
                // 直接先直接clone固定模板, 以后再兼容多模板
                cloneTemp(opts);
            } catch (error) {
                errorLog(error);
            }
        });
};

// 克隆模板
const cloneTemp = (opts = {}) => {
    const cmdPath = path.resolve(process.cwd(), opts.projectName); // 项目路径
    if (fsExtra.existsSync(cmdPath)) {
        errorLog('文件夹已存在，请重新输入');
        return;
    }
    fsExtra.mkdirSync(cmdPath); // 创建项目
    // 先进入创建目录，然后git clone 模板
    const cmd = `cd ${opts.projectName} && git clone ${remoteUrl}`;
    const spinner = ora();
    spinner.start(`正在创建中，请稍等...`);
    exec(
        cmd,
        {
            cwd: process.cwd()
        },
        function (error) {
            if (error) {
                spinner.fail(`项目创建失败：`, error);
                fsExtra.removeSync(cmdPath); // 删除文件
                return;
            }
            const copyDir = path.resolve(process.cwd(), `./${opts.projectName}/${remoteTempName}`);
            if (!fsExtra.existsSync(copyDir)) {
                errorLog('项目创建失败，请重试');
                return;
            }
            // clone完成后，将创建目录下的模板复制到创建目录下
            fsExtra.copySync(copyDir, cmdPath); // 复制文件
            fsExtra.removeSync(copyDir); // 删除文件
            spinner.succeed(`🚀🚀🚀🚀🚀项目创建成功🚀🚀🚀🚀🚀`);
        }
    );
};

// 执行脚本
const cli = () => {
    init(); // 初始化
    help(); // 定义help命令
    create(); // 创建项目
    program.parse(process.argv); // 这一步必不可少，否则上面的定义都不会生效
};

module.exports = {
    cli
};

```
> 上面的代码比较简单，就是先初始化脚手架提示命令，然后获取用户输入的项目名称，之后就直接本地创建项目，clone模板，复制替换即可~



[Commander.js](https://github.com/tj/commander.js/blob/master/Readme_zh-CN.md): Commander.js 是 Node.js 下优秀的命令行交互工具，编写代码来描述你的命令行界面。 Commander 负责将参数解析为选项和命令参数

`fx-extra`: [nodejs文件操作扩展fs-extra](https://cloud.tencent.com/developer/article/1499011)


- `inquirer.js`:

``` js
/**
 * 安装工具：npm yarn pnpm
 * 脚手架：vite vue-cli webpack
 * js / ts
 * css / scss / less
 * eslint / prettier
 * h5 / pc
 * ui库：element-plus ant-design-vue vant-ui
 * 状态管理工具：vuex / pinia
 * 是否使用 axios
 * 是否使用 mock
 * 是否全局引入svg-icons
 * husky / lint-staged / commitlint
 */
const inquirer = require('inquirer');

function inquirerPrompt(name) {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'projectName',
                    message: '模板名称',
                    default: name || '',
                    validate: function (val) {
                        if (!val) {
                            return '模板名称不能为空';
                        }
                        if (!/^[a-zA-Z]+$/.test(val)) {
                            return '模板名称只能含有英文';
                        }
                        // if (!/^[A-Z]/.test(val)) {
                        //     return '模板名称首字母必须大写';
                        // }
                        return true;
                    }
                }
                // {
                //     type: 'list',
                //     name: 'pkg',
                //     message: '选择包管理工具',
                //     choices: ['pnpm', 'yarn', 'npm'],
                //     default: 'pnpm'
                // },
                // {
                //     type: 'list',
                //     name: 'language',
                //     message: 'JS or TS',
                //     choices: ['TypeScript', 'JavaScript'],
                //     default: 'TypeScript',
                //     filter: function (value) {
                //         return {
                //             JavaScript: 'js',
                //             TypeScript: 'ts'
                //         }[value];
                //     }
                // },
                // {
                //     type: 'list',
                //     name: 'css',
                //     message: '选择css预处理器',
                //     choices: ['less', 'scss', 'stylus', 'none'],
                //     default: 'less',
                //     filter: function (value) {
                //         return value === 'none' ? '' : value;
                //     }
                // },
                // {
                //     type: 'confirm',
                //     name: 'vuex',
                //     message: '是否使用vuex'
                // },
                // {
                //     type: 'confirm',
                //     name: 'h5',
                //     message: '是否是移动端项目'
                // },
                // {
                //     type: 'checkbox',
                //     name: 'codeRule',
                //     message: '是否配置代码规范',
                //     choices: ['eslint', 'prettier'],
                //     default: ['eslint', 'prettier']
                // },
                // // {
                // //     type: 'checkbox',
                // //     name: 'commitRule',
                // //     message: '是否配置代码提交规范',
                // //     choices: ['husky', 'lint-staged', 'commitlint'],
                // //     default: ['']
                // // },
                // {
                //     type: 'confirm',
                //     name: 'axios',
                //     message: '是否安装axios'
                // },
                // {
                //     type: 'confirm',
                //     name: 'mock',
                //     message: '是否配置mock'
                // },
                // {
                //     type: 'confirm',
                //     name: 'svgIcons',
                //     message: '是否配置全局svg-icons组件'
                // },
                // {
                //     type: 'confirm',
                //     name: 'h5',
                //     message: '是否是移动端项目'
                // }
            ])
            .then((answers) => {
                // console.log('answers', answers);
                resolve(answers);
                // const { h5 } = answers;
                // const choices = !h5 ? ['Ant Design Vue', 'Element Plus', 'none'] : ['Vant', 'none'];
                // inquirer
                //     .prompt([
                //         {
                //             type: 'list',
                //             message: '选择UI库',
                //             choices,
                //             name: 'library'
                //         }
                //     ])
                //     .then((answers2) => {
                //         resolve({
                //             ...answers,
                //             ...answers2
                //         });
                //     })
                //     .catch((error) => {
                //         reject(error);
                //     });
            })
            .catch((error) => {
                console.log('error', error);
                reject(error);
            });
    });
}
exports.inquirerPrompt = inquirerPrompt;
```

> `inquirer`是一个命令行交互工具，这里我原本打算让用户自定义选择配置，但那样对于模板的开发工作量有点大，这里我就先输入项目名，等以后再扩展；

[inquirer.js —— 一个用户与命令行交互的工具](https://blog.csdn.net/qq_26733915/article/details/80461257)



## 发布

- 先配置pkg信息：

``` json
{
  "name": "verney-vite-cli", // 包名称
  "private": false, // 公共包
  "version": "1.0.1", // 版本
  "description": "快速搭建vite+vue3项目脚手架~",
  "bin": { // bin命令
    "verney-vite-cli": "./index.js"
  },
  "keywords": [
    "vite",
    "vue3"
  ],
  "author": "zhou",
  "license": "MIT",
  "repository": { // 源码仓库地址
    "type": "git",
    "url": "https://github.com/verneyZhou/verney-vue-design"
  },
  "dependencies": { // 依赖
    "chalk": "^4.1.2",
    "commander": "^11.1.0",
    "fs-extra": "^11.2.0",
    "inquirer": "^8.2.6",
    "ora": "^4.1.1"
  }
}

```

- 先将代码提交到github远程仓库；

- 未登录时`npm login`先登录；

- 登录后直接`npm publish`即可，发布成功后即可在npm官网上看到了；





## 备注


- **npm 与 npx 的区别？**

1. `npm` 全称`Node Package Manager`，它是`Node.js`的软件包管理器；`npm` 本身不能够执行任何包，对于本地项目的包，如果想要执行，则需要写入到 `package.json` 里面，然后通过 `npm` 来解析 `package.json` 文件，解析到包的 `bin` 文件路径，在 `bash` 中执行；

2. `npx`是一个工具，npm v5.2.0引入的一条命令（npx），一个npm包执行器，旨在提高从npm注册表使用软件包时的体验 ; npx 是一个简单的 cli 工具，让我们更加方便的执行一些 npm 包，而不用通过 npm 来将包安装到开发者的电脑上面。
> 临时安装可执行依赖包，不用全局安装，不用担心长期的污染; 可以执行依赖包中的命令，安装完成自动运行; 自动加载`node_modules`中依赖包，不用指定`$PATH`; 可以指定`node`版本、命令的版本，解决了不同项目使用不同版本的命令的问题。


npx 能避免全局安装的模块。比如，create-react-app 这个模块是全局安装，npx 可以运行它，而且不进行全局安装。

`npx create-react-app my-react-app`

> 上面代码运行时，npx 将create-react-app下载到一个临时目录，使用以后再删除。所以，以后再次执行上面的命令，会重新下载create-react-app。




- **命令行交互工具：**

1. [prompts](https://github.com/terkelg/prompts)

``` js
const prompts = require('prompts');

(async () => {
  const response = await prompts({
    type: 'number',
    name: 'value',
    message: 'How old are you?',
    validate: value => value < 18 ? `Nightclub is 18+ only` : true
  });

  console.log(response); // => { value: 24 }
})();
```

2. [inquirer](https://github.com/SBoudrias/Inquirer.js)

[inquirer.js —— 一个用户与命令行交互的工具](https://blog.csdn.net/qq_26733915/article/details/80461257)


``` js
import inquirer from 'inquirer';

inquirer
  .prompt([
    /* Pass your questions in here */
  ])
  .then((answers) => {
    // Use user feedback for... whatever!!
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
```


- **获取用户参数：**

1. `process`:
``` js
/**
 * 脚手架提供的 verney-cli 命令后面还可以设置参数，标准的脚手架命令参数需要支持两种格式:
verney-cli --name=orderPage
verney-cli --name orderPage
 */

const process = require('process');
// 获取命令参数
console.log(process.argv); 
```

2. `yargs`:

``` js
const yargs = require('yargs');
console.log('name', yargs.argv.name);
```

3. [command-line-args](https://github.com/75lb/command-line-args)



- **version**

作用：定义命令程序的版本号；

用法示例：`.version('0.0.1', '-v, --version')`

参数解析：
1. 第一个参数，版本号 <必须>；
2. 第二个参数，自定义标志 <可省略>，默认为 `-V` 和 `--version`。


执行：`verney-vite-cli --version`



- **option**

作用：用于定义命令选项；

用法示例：`.option('-n, --name  ', 'edit your name', 'vortesnail')`

参数解析：
1. 第一个参数，自定义标志 <必须>，分为长短标识，中间用逗号、竖线或者空格分割；
> 标志后面可跟参数，可以用 `<>` 或者 `[]` 修饰，前者意为必须参数，后者意为可选参数
2. 第二个参数，选项描述 <省略不报错>，在使用 `--help` 命令时显示标志描述；
3. 第三个参数，选项参数默认值，可选。

执行：`verney-vite-cli --help`


- 在其他项目中执行脚手架时传参：`pnpm verney-cli -- --name=xxxx`
> 在 `pnpm verney-cli` 后面需要加上两个连字符（`--`），这是为了告诉 `pnpm` 后面的参数是传递给命令`verney-cli`本身的，而不是传递给`pnpm`的。



## 报错记录


- `npm publish`发布时报错：
```
npm ERR! code E402
npm ERR! 402 Payment Required - PUT https://registry.npmjs.org/@verney-design%2fverney-vite-cli - You must sign up for private packages
```
> 发布公共包需要加上`--access public`, 改为：`pnpm publish --access public --no-git-checks`, 当`本地代码有修改但未提交到github仓库`发布会时会有警告，加上`--no-git-checks`就没有~

[https://github.com/lerna/lerna/issues/1821](https://github.com/lerna/lerna/issues/1821)





## 参考

- [写给5年前端妹子的三万字脚手架教程](https://juejin.cn/post/7260144602471776311)、[mortal-cli](https://github.com/532pyh/mortal)
- [从0搭建vue3组件库: 如何完整搭建一个前端脚手架?](https://juejin.cn/post/7158043921895915557)、[create-kitty](https://gitee.com/geeksdidi/kittyui/tree/dev/packages/create-kitty)
- [「记录篇」我是如何一步步为公司搭建react项目脚手架的](https://juejin.cn/post/7235547967112806437)
---
title: VSCode插件开发笔记
date: 2024-01-08 14:42:19
permalink: false
categories:
  - tool
  - vscode
tags:
  - vscode
---



# VSCode插件开发笔记

> [VSCode](https://code.visualstudio.com/)应该算是目前使用率最高的代码编辑器了吧，它给我们开放了一些API方便进行插件开发，方便我们解决开发中的一些问题，提高生产效率。



## 代码自动补全插件
> 项目开发中，经常会遇到代码补全的功能~

VsCode本身就有很多内置的代码片段，例如：JavaScript、TypeScript、Markdown 和 PHP；代码片段也可以帮助我们进行快速的输入，一般的代码片段都不止一行代码，可以帮我们省略很多输入。除了内置的代码片段，我们也可以配置自己的代码片段


[Snippets in Visual Studio Code](https://code.visualstudio.com/docs/editor/userdefinedsnippets)


前端常用的代码补全插件有：[antd-snippets](https://marketplace.visualstudio.com/items?itemName=bang.antd-snippets), [vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur), [Vue 3 Snippets](https://marketplace.visualstudio.com/items?itemName=hollowtree.vue-snippets)等，这里从0到1实现一个我自己的代码补全插件~



### 创建项目


- 首先全局安装开发插件的脚手架：`npm install -g yo generator-code`
    1. `yo`模块全局安装后就安装了`Yeoman`，`Yeoman`是通用型项目脚手架工具，可以根据一套模板，生成一个对应的项目结构; 
    2. `generator-code`模块是`VS Code`扩展生成器，与`yo`配合使用才能构建项目。

- 安装完成后执行：`yo code`, 初始化项目：

``` sh
? What type of extension do you want to create? New Code Snippets # 选择代码片段
Folder location that contains Text Mate (.tmSnippet) and Sublime snippets (.sublime-snippet) or press ENTER to start with a new snippet file.
? Folder name for import or none for new: 
? What's the name of your extension? code-snippets 
? What's the identifier of your extension? code-snippets
? What's the description of your extension? ui code snippets
Enter the language for which the snippets should appear. The id is an identifier and is single, lower-case name such as 'php', 'javascript'
? Language id: javascript
? Initialize a git repository? Yes
```
> 输入一些基础信息后项目就创建成功了~


项目目录结构：

```
├── .vscode/
├── snippets/
    ├── snippets.json // 配置代码片段
└── package.json
```


`package.json`:

``` json
"engines": {
    "vscode": "^1.85.0" // 最低支持的vscode版本，使用的vscode需在此版本之上
  },
  "categories": [ // 分类
    "Snippets"
  ],
  "contributes": {
    "snippets": [ // 代码片段
      {
        "language": "javascript", // 支持js
        "path": "./snippets/snippets.json"
      },
      // ...
    ]
  }
```
> 具体参考[extension-manifest](https://code.visualstudio.com/api/references/extension-manifest)



- 添加代码片段

有一个网站可以帮助我们快速的创建`code snippet`: [snippet-generator](https://snippet-generator.app/)
> 在这个网站里，左边输入代码，右侧就会生成 `snippet` 模板，拷贝到项目中的 `snippets.json` 文件下的 `JSON` 对象中即可~



``` json
// snippets/snippets.json

{
  "fn snippets": { // 名称
    "prefix": ["fn"], //  触发字符，可模糊匹配
    "body": [ // 实际插入的代码片段
            "function fn(${1:val}: number, ${2:val2}: string) {", // 每一项表示换行
            "    console.log ($CURRENT_YEAR: val, val2);",
            "}"
    ],
    "description":[ // 描述说明
      "快速写一个fn函数",
      "",
      "调用fn方法",
      "@param val — 参数1",
      "@param val2 — 参数2."
    ]
  }
}
```

- 使用`$1, $2`标识`tab`定位，使用`tab`可快速切换
- 使用`${1:val}`标识`tab`定位，且有默认值
- 一些内置变量，比如`CURRENT_YEAR`，可用于自定义注释头

[snippet语法](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax)



### 本地调试

- 点击VSCode左侧菜单`Run and Debug` => 顶部`Extension`，运行，会新开一个vscode窗口；
> 顶部的调试信息可以在`.vscode/launch.json`中进行配置~



- 新建一个 js 文件夹，输入`fn`: 

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/vscode01.jpeg')" width="auto"/>

> 如有上图提示，即表示新添加代码片段生效，点击即会添加配置的代码片段~


> 这里只是添加一个`fn`作为示例，其他的代码片段跟这个一样，添加到 `json` 中即可, 这里不再赘述~

### 添加到本地

> 如果只是自己使用，可直接在VSCode本地中新建代码片段~

- `文件-->首选项-->用户代码片段-->点击新建代码片段`, 如：取名`vue.json`, 确定~
> 这是会在`~/Library/Application Support/Code/User/snippets/`目录下生成一个`vue.json.code-snippets`文件~

- 之后直接在里面添加想要的代码片段即可，保存后，重新打开项目即可使用~

> 参考：[VSCode 初次写vue项目并一键生成.vue模版](https://www.jianshu.com/p/8610215a8a84)


这里如果想把上面的代码片段添加到本地，也是添加到这里即可~

- 也可以通过`cmd + shift + P` => 输入`user snippets` => `新加代码片段` 进行添加，将 `json` 拷贝进去就可以在 `vscode` 中使用了, 效果是一样的~



### 发布
> 如果是想给团队使用，就可以将该代码片段封装成插件发布，这样别人直接下载对应的插件就可以多个编辑器通用，比存在本地好很多~


- 发布之前首先得访问[login.live.com](https://login.live.com/)登录`Microsoft`账号, 可以用 `google` 邮箱账号，没有注册一个即可；

- 然后访问[Azure DevOps](https://aka.ms/SignupAzureDevOps)，也是用相同的账号登录；
> 第一次访问需要先创建一个`Azure DevOps`组织，默认会创建一个以邮箱前缀为名的组织~

- 组织创建成功后，点击右上角的个人头像 => `Personal access tokens`，创建个人访问令牌；
> 注意: 这里的 `organizations` 必须要选择 `all accessible organizations`; `Scopes` 要选择 `full access`，否则后面发布会失败。


**创建 `token` 成功后将`token`复制，先本地进行保存，之后会用到~！！！**


- 之后需要创建一个发布者：发布者是 [visualstudio](https://marketplace.visualstudio.com/) 代码市场的扩展的唯一身份标识。每个插件都需要在 `package.json` 文件中指定一个 `publisher` 字段。

具体创建点击[发布者管理](https://marketplace.visualstudio.com/manage)，按提示创建即可~
> 其中`Name`和`ID`是唯一且必填的，可配置`Logo`和其他自定义信息~

发布者创建成功后，接下来就可以开始正式发布插件了~！

- 首先全局安装`vsce`: `npm install vsce -g`

- 输入刚才创建的 publisher 进行登录：`vsce login <publisher name>`; 再输入刚复制的个人令牌`token`，即可登录成功；

- 登录成功之后，就可以发布了；在发布前检查下`packge.json`信息：

``` json
{
  "name": "vn-code-snippets", // name
  "displayName": "vn-code-snippets", // 显示名称
  "description": "ui code snippets", // 描述
  "version": "0.0.1", // 版本号
  "publisher": "verneyzhou", // 发布者id
  "engines": {
    "vscode": "^1.85.0" // 兼容的vscode版本号
  },
  "categories": [ // 分类
    "Snippets"
  ],
  "contributes": {
    "snippets": [ // 代码片段
      {
        "language": "javascript", // 支持的语言
        "path": "./snippets/snippets.json" // json路径
      },
      {
        "language": "javascriptreact",
        "path": "./snippets/snippets.json"
      },
      {
        "language": "typescript",
        "path": "./snippets/snippets.json"
      },
      {
        "language": "typescriptreact",
        "path": "./snippets/snippets.json"
      }
    ]
  },
  "author": "zhou",
  "license": "MIT", // 开源协议
  "repository": { // 代码仓库地址
    "type": "git",
    "url": "*****"
  }
}
```

- 之后直接执行`vsce publish`，即可进行发布~
> 如果不出意外，应该就会发布成功；如果报错可能是`pkg`脚本配置不全，按报错提示检查下吧~

``` sh
➜  code-snippets git:(master) ✗ vsce publish
 WARNING  LICENSE.md, LICENSE.txt or LICENSE not found
Do you want to continue? [y/N] y
 INFO  Publishing 'verneyzhou.vn-code-snippets v0.0.1'...
 INFO  Extension URL (might take a few minutes): https://marketplace.visualstudio.com/items?itemName=verneyzhou.vn-code-snippets
 INFO  Hub URL: https://marketplace.visualstudio.com/manage/publishers/verneyzhou/extensions/vn-code-snippets/hub
 DONE  Published verneyzhou.vn-code-snippets v0.0.1.
```


- 发布成功之后，在vscode扩展市场应该就可以搜索到该插件了：

[https://marketplace.visualstudio.com/items?itemName=verneyzhou.vn-code-snippets](https://marketplace.visualstudio.com/items?itemName=verneyzhou.vn-code-snippets)
> 注意，`itemName`应该为`${publisher}.${name}`~



### 使用


之后就跟一般的插件一样，`install`安装，即可使用了：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/vscode02.jpeg')" width="auto"/>


发布之后也可以取消发布，或删除扩展，更多关于发布的操作可以参考VSCode发布插件官方文档：[publishing-extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)





### 打包扩展
> 对于某些打算给团队使用，但又不想发布到线上的情况，可以将插件打包，私下分享给别人~


[包装扩展](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions)


- 首先执行打包命令：`vsce package`
> 此命令将在扩展的根文件夹下生成一个`.vsix`文件，如：`vn-code-snippets-0.0.1.vsix`


- 安装：
    - 方法1：点击vscode左侧`扩展`菜单 => 右上角`...` => `从 VSIX 安装`，选择刚打包生成的文件即可~
    - 方法2：打包完成后，终端执行：`code --install-extension vn-code-snippets-0.0.1.vsix`

``` sh
➜  code-snippets git:(master) ✗ code --install-extension vn-code-snippets-0.0.1.vsix
Installing extensions...
(node:85301) [DEP0005] DeprecationWarning: Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
(Use `Electron --trace-deprecation ...` to show where the warning was created)
Extension 'vn-code-snippets-0.0.1.vsix' was successfully installed.
➜  code-snippets git:(master) ✗ 
```

- 安装完成后即可在扩展中搜到了~，然后直接在代码中使用即可~~~！！！
> 如果不生效，重启 vscode 试试~~




## VSCode翻译插件
> 在平时项目开发中经常会遇到不认识的英文单词，这里开发一个翻译插件，方便在`vscode`中直接进行翻译~

### 初始化项目

- 由于上面已经全局安装了`yo`，这里直接执行：`yo code`:

``` sh
? What type of extension do you want to create? New Extension (TypeScript) # 选择ts
? What's the name of your extension? translate
? What's the identifier of your extension? translate # 项目名称
? What's the description of your extension? translate extension
? Initialize a git repository? Yes
? Bundle the source code with webpack? No
? Which package manager to use? npm
```
> 初始化完成后会生成一个项目，接下来看看这个项目默认生成哪些内容~

项目目录结构：

```
├── .vscode/
├── src/
    ├── extension.ts // 初始项目时的入口文件
└── package.json
└── tsconfig.json // ts配置
```


`package.json`:

``` json
{
    "engines": {
        "vscode": "^1.85.0"
    },
    "contributes": {
        "commands": [ // 命令列表
        {
            "command": "translate.helloWorld", // 命令的id
            "title": "Hello World" // 命名语句
        }
        ]
    },
}
```

初始项目时的入口文件：`src/extension.ts`:

``` ts
import * as vscode from 'vscode';

// 这里执行插件被激活时的操作
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "translate" is now active!');

	// 注册命令：translate.helloWorld，该命令需在 pkg 已经被定义
	// 当执行 translate.helloWorld 命令时，会触发后面的回调函数
	let disposable = vscode.commands.registerCommand('translate.helloWorld', () => {
		// 触发了一个弹出框
		vscode.window.showInformationMessage('Hello World from translate!');
	});
	// 把这个对象放入上下文中, 使其生效
	context.subscriptions.push(disposable);
}

// 插件被销毁时调用的方法, 比如可以清除一些缓存, 释放一些内存
export function deactivate() {}
```
> 接下来我们试着调试下这个插件，看看是否能调试成功~

- 打开`translate`项目，点击`VSCode`左侧菜单`Run and Debug` => `顶部Extension`，运行，会新开一个`vscode`调试窗口，这个窗口默认集成了我们当前开发的这个插件工程；
> 或者`fn + F5`也可以新开调试窗口~


- 然后`cmd + shift + P`，输入：`Hello World`，不出意外的话，项目调试控制台会打印：`Congratulations, your extension "translate" is now active!`，调试窗口右下角会弹窗展示：`Hello World from translate!`
> 这样就表示我们的插件初始化成功~~🎉🎉



### 接入翻译API

- 翻译API这里选择有道云：首先进入[有道智能云服务平台](https://ai.youdao.com/)，注册，添加微信客服，填写问卷会送50体验金，个人开发够用了；


- 注册成功后进入到[有道智云控制台](https://ai.youdao.com/console)，首先创建一个应用，选择服务为`自然语言翻译服务`，接入方式为`API`；应用创建成功后会获得`应用ID`和`应用秘钥`；同时也可以在应用控制台看到js接入实例；

[有道云文本翻译 API](https://ai.youdao.com/DOCSIRMA/html/trans/api/wbfy/index.html)



### 翻译API秘钥本地配置
> 之后在我们的插件中会用到生成的应用ID和应用秘钥；但如果直接在代码中暴露appSecret，有被盗用造成损失的风险，所以这里需要先将`appSecret`配置在`VSCode`本地~


- `package.json`中添加配置信息:

``` json
"contributes": {
    "configuration": { // 添加配置
      "title": "vscodeVnTranslate", // 自定义字段名称
      "type": "object", // 类型
      "properties": { // 属性
        "vscodeVnTranslate.youdaoAppkey": { // 子属性 应用ID
          "type": "string", // 类型
          "description": "youdao appKey" // 描述
        },
        "vscodeVnTranslate.youdaoAppSecret": { // 应用秘钥
          "type": "string",
          "description": "youdao appSecret"
        }
      }
    }  
  },
```

- 然后打开调试窗口，`右上角 Code => 首选项 => 设置`，展开左侧`Extensions`菜单，滑到最底部就会看到刚刚新增的`vscodeVnTranslate`字段；之后将刚创建的应用ID和应用秘钥保存在这里就可以了~


### 插件开发
> `src`目录下新建`index.ts`，添加插件核心逻辑，这里直接看代码吧~

``` js
import * as vscode from "vscode";
import CryptoJS from "crypto-js"; // crypto加密
import axios from "axios"; // 接口请求
import querystring from "querystring";

export interface Word {
  key: string;
  value: string[];
}

// 字符串截取前10位和后10位
function truncate(q: string): string {
  var len = q.length;
  if (len <= 20) {
    return q;
  }
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}

// 驼峰文本格式化: 例如：将helloWorld转换为hello World
function changeWord(text: string): string {
  if (!text.includes(" ") && text.match(/[A-Z]/)) {
    const str = text.replace(/([A-Z])/g, " $1");
    let value = str.substr(0, 1).toUpperCase() + str.substr(1);
    return value;
  }
  return text;
}


// 封装有道翻译接口，具体参数参考下方文档
// https://ai.youdao.com/DOCSIRMA/html/trans/api/wbfy/index.html
async function youdao(query: string, appKey: string, appSecret: string) {
  var appKey = appKey;
  var key = appSecret; //注意：暴露appSecret，有被盗用造成损失的风险
  var salt = new Date().getTime();
  var curtime = Math.round(new Date().getTime() / 1000);
  // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
  var from = "auto";
  var to = "auto";
  var str1 = appKey + truncate(query) + salt + curtime + key;
  //  生成加密签名
  var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);

  const res = await axios.post(
    "http://openapi.youdao.com/api",
    querystring.stringify({
      q: changeWord(query), // 待翻译文本
      appKey, // 应用id
      salt, // 盐，随机字符串
      from, // 语言
      to, // 目标语言
      sign, // 签名
      signType: "v3", // 签名类型
      curtime,
    })
  );

  return res.data;
}

// 这里执行插件被激活时的操作
export function activate(context: vscode.ExtensionContext) {

  vscode.window.showInformationMessage('翻译插件成功激活!!!🎉🎉🎉');

  // 拿到配置文件中的有道翻译的appkey和appSecret
  const config = vscode.workspace.getConfiguration("vscodeVnTranslate");
  const appKey = config.get("youdaoAppkey") as string;
  const appSecret = config.get("youdaoAppSecret") as string;
  // 是否开启自动翻译
  const autoTranslate = config.get("openAutoTranslate") as boolean;

  console.log('====appSecret', appSecret, appKey, autoTranslate);

  // 划词hover翻译
  // registerHoverProvider：注册hover事件 
  autoTranslate === true && vscode.languages.registerHoverProvider("*", {
    // VS code 提供一个 provideHover 当鼠标移动在上面的时候就可以根据当前的单词做一些具体操作
    async provideHover(document, position, token) {
     // 获取当前选中的单词  
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }

      if (!appKey || !appSecret) {
        vscode.window.showWarningMessage('请配置有道翻译的appkey和appSecret');
        return;
      }

      // 获取选取文本   
      const selection = editor.selection;
      const text = document.getText(selection);
      console.log('text', text);
      if (!text || !text.length) {
        // vscode.window.showWarningMessage('请选中需要翻译的单词');
        return;
      }

      const res = await youdao(text, appKey, appSecret);
      console.log('res', res);
      if (res.errorCode !== "0") {
        vscode.window.showErrorMessage('翻译失败：', res.errorCode, res.msg);
        return;
      }

      // md格式
      const markdownString = new vscode.MarkdownString();

      markdownString.appendMarkdown(
        `#### 翻译: \n\n ${res.translation[0]} \n\n`
      );
      if (res.basic) {
        // 添加音标展示
        if (res.basic["us-phonetic"]) {
          markdownString.appendMarkdown(
            `**美** ${res.basic["us-phonetic"]}　　　　**英** ${res.basic["uk-phonetic"]}　\n\n`
          );
        }

        // 添加解释
        if (res.basic.explains) {
          res.basic.explains.forEach((w: string) => {
            markdownString.appendMarkdown(`${w} \n\n`);
          });
        }
      }
      // 添加网络释义
      if (res.web) {
        markdownString.appendMarkdown(`#### 网络释义 \n\n`);
        res.web.forEach((w: Word) => {
          markdownString.appendMarkdown(
            `**${w.key}:** ${String(w.value).toString()} \n\n`
          );
        });
      }
      markdownString.supportHtml = true; // 支持html标签 
      markdownString.isTrusted = true;

      return new vscode.Hover(markdownString); // hover展示
    },
  });

  // 划词翻译替换
  context.subscriptions.push(
    // 注册命令： vscode.translate.replace
    vscode.commands.registerCommand("vscode.translate.replace", async () => {
      // 获取当前选中的单词
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
      }

      if (!appKey || !appSecret) {
        vscode.window.showWarningMessage('请配置有道翻译的appkey和appSecret');
        return;
      }

      let selection = editor.selection;
      let text = editor.document.getText(selection);
      if (!text || !text.length) {
        vscode.window.showWarningMessage('请选中需要翻译的单词');
        return;
      }

      //有选中翻译选中的词
      if (text.length) {
        const res = await youdao(text, appKey, appSecret);
        console.log(res);

        //vscode.window.showInformationMessage(res.translation[0]);
        // 替换选中的文本
        editor.edit((builder) => {
          builder.replace(selection, res.translation[0]);
        });
      }
    })
  );
}

// 插件被销毁时调用的方法, 比如可以清除一些缓存, 释放一些内存
export function deactivate() {}
```
> 这里需要用到三个库，直接`npm install crypto-js axios querystring`即可，如果是`ts`可能还需要`npm install -D @types/crypto-js`~


1. 上方代码实现了一个翻译替换命令`vscode.translate.replace`，选中需要替换的文本，`cmd + shift + p`，输入`翻译替换即可；
> 下方也配置了右侧菜单和快捷键可执行该命令~

2. 同时也实现了鼠标选中文本后，自动翻译文本的功能，该功能可通过配置`openAutoTranslate=true`来开启;



### 快捷键和菜单配置
> 可以在`package.json`中配置快捷键和菜单命令~

``` json
{
  "name": "vn-translate-extension", // 插件名称
  "displayName": "vn-translate-extension", // 插件
  "description": "一个简单的翻译插件~", // 描述
  "publisher": "verneyzhou", // 发布者id
  "version": "0.0.1", // 版本
  "engines": {
    "vscode": "^1.85.0" // vscode版本
  },
  "categories": [ // 分类
    "Other"
  ],
  "activationEvents": [ // 指明该插件在何种情况下才会被激活，因为只有激活后插件才能被正常使用
    "onStartupFinished", // 插件启动完成后就会被激活
    // "*", // 只要一启动vscode，插件就会被激活
    // "onCommand:extension.sayHello", // 每当调用命令时，都会激活
  ],
  "main": "src/index.js", // 入口
  "contributes": { // 贡献点，通过扩展注册contributes用来扩展Visual Studio Code中的各项技能，其有多个配置
    "commands": [ // 命令列表
      {
        "command": "vscode.translate.replace", // 命令id
        "title": "翻译替换" // 命令名称
      },
      {
        "command": "translate.helloWorld",
        "title": "hello translate"
      }
    ],
    "keybindings": [ // 绑定快捷键
      {
        "command": "vscode.translate.replace", // 执行命令id
        "key": "ctrl+t", // window快捷键
        "mac": "cmd+t", // mac快键键
        "when": "editorTextFocus" // 触发时机，当文本聚焦的时候
      }
    ],
    "menus": { // 菜单配置
      "editor/context": [ // 编辑器上下文菜单
        {
          "when": "editorTextFocus", // 触发时机，当文本聚焦的时候
          "command": "vscode.translate.replace", // 执行命令id
          "group": "navigation" // 菜单分组，navigation 会排序到菜单顶部
        }
      ]
    },
    "configuration": { // 字段配置信息
      "title": "vscodeVnTranslate",
      "type": "object",
      "properties": {
        "vscodeVnTranslate.youdaoAppkey": {
          "type": "string",
          "description": "有道 appKey"
        },
        "vscodeVnTranslate.youdaoAppSecret": {
          "type": "string",
          "description": "有道 appSecret"
        },
        "vscodeVnTranslate.openAutoTranslate": {
          "type": "boolean",
          "description": "是否开启自动翻译"
        }
      }
    }  
  },
}
```

上方具体配置信息参考下方官方文档：

[激活事件 activationEvents](https://code.visualstudio.com/api/references/activation-events)

[贡献点 contributes](https://code.visualstudio.com/api/references/contribution-points)

[menus group 菜单排序参考](https://code.visualstudio.com/api/references/contribution-points#Sorting-of-groups)





### 使用

- 本地打开调试窗口时，如果`openAutoTranslate`配置为`true`，即可使用文本聚焦自动翻译功能：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/vscode03.jpeg')" width="auto"/>

- 选中文本，双击呼起右侧菜单时，可看到`翻译替换`按钮，点击即可替换；也可通过`cmd + T`快捷键替换：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/vscode04.jpeg')" width="auto"/>


### 上线
> 上线流程跟`vn-code-snippets`插件差不多~

- 不想上线的话，直接`vsce package`打包扩展生成`.vsix`文件，然后安装到本地即可使用~


- 要发布到线上的话，先`vsce login`登录，再`vsce publish`发布，参考上方`vn-code-snippets`的发布即可~
> 发布成功后等个一两分钟就可以在[官方市场](https://marketplace.visualstudio.com/items?itemName=verneyzhou.vn-translate-extension)搜到了~


- 发布成功后，扩展市场直接搜索即可使用了~~~！！！🎉🎉🎉



## 查看文件信息插件
> 接下来趁热打铁，再封装一个查看文件信息的插件，大致效果如下：


<img class="zoom-custom-imgs" :src="$withBase('/images/tool/vscode101.gif')" width="auto"/>


### 开发

- 开发流程跟上面的翻译插件类似，这里不再赘述了，直接`yo code` 初始化插件项目；


- 项目创建完成后，先看下`package.json`中的配置：

``` json
{
  "activationEvents": [ // 在执行 getFileState 指令时激活
    "onCommand:getFileState"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
        {
            "command": "getFileState", // 定义命令id
            "title": "查看文件信息"
        }
    ],
    "menus": { // 菜单项
        "editor/context": [ // 右侧编辑上下文菜单
            {
                "when": "editorFocus",
                "command": "getFileState",
                "group": "navigation" // 菜单顶部展示
            }
        ],
        "explorer/context": [  // 左侧资源管理器上下文菜单
            {
                "command": "getFileState",
                "group": "navigation"
            }
        ]
    }
  },
}
```

- 再看下核心js逻辑，比翻译插件简单多了：

``` js

import * as vscode from 'vscode';
import fs from 'fs';

// 插件激活时触发，所有代码总入口
export function activate(context: vscode.ExtensionContext) {

	console.log('file state 插件已经被激活');

    // 注册命令
    let commandOfGetFileState = vscode.commands.registerCommand('getFileState', uri => {

        console.log('uri', uri);
        // 文件路径
        const filePath = uri.path.substring(1);
        fs.stat(filePath, (err, stats) => {
            console.log('====fs.stat', err, stats.isFile(), stats.isDirectory());
            if (err) {
                vscode.window.showErrorMessage(`获取文件时遇到错误了${err}!!!`);
            }

            if (stats.isDirectory()) {
                vscode.window.showWarningMessage(`检测的是文件夹，不是文件，请重新选择！！！`);
            }

            if (stats.isFile()) {
                const size = stats.size;
                const createTime = stats.birthtime.toLocaleString();
                const modifyTime = stats.mtime.toLocaleString();

                vscode.window.showInformationMessage(`
                    Hi, 上午好！
                    今天是：${getDate()}
                    又是元气满满的一天呢~~！！！💪🏻💪🏻😄😄🎉🎉

                    您选择的文件路径为:
                    ${filePath}
                    文件大小为: ${size}字节
                    文件创建时间为: ${createTime}
                    文件修改时间为: ${modifyTime}
                `, { modal: true });
            }
        });
    });

    // 将命令放入其上下文对象中，使其生效
    context.subscriptions.push(commandOfGetFileState);
}

// 获取时间
function getDate() {
    let day = new Date();
    // day.setTime(day.getTime() + 24 * 60 * 60 * 1000);
    const weekMap: any = {1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6:'六', 0: '日', 7: '日'};
    const week = weekMap[day.getDay()];
    let date = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()} ${day.getHours()}:${day.getMinutes()}:${day.getSeconds()} 周${week}`;
    return date;
}

```

**注意：** 上面的`showInformationMessage`方法添加的`{modal: true}`参数，需要在`首选项 => Settings` 中添加: 

`"window.dialogStyle": "custom"` 

弹窗样式才能生效哦~


### 发布
> 本地调试完成后就可以进行发布了~

可以选择打包扩展，也可以直接发布线上；具体流程参考上面翻译插件，不细讲了~






## Chat问答插件
> 这里开发一个Chat插件，主要会用到 VSCode 的 Webview 功能~


[VSCode-WebviewAPI](https://code.visualstudio.com/api/extension-guides/webview), `Webview API` 允许扩展在 visualstudio 代码中创建完全可定制的视图，可以将 webview 看作是 VS Code 中的 iframe。



### 初始化项目

- 这里直接`yo code`创建项目，跟上面的翻译插件一样的，这里就不展示了~
> 初始化项目完成后，可以先本地调试下，试下是否调通~



### 前端项目初始化
> 因为VSCode可以用`iframe`展示线上web网页, 所以这里新起一个前端项目，用于展示视图~

[vite](https://vitejs.cn/)

- 这里是用 vite 快速启了一个vue3项目，`npm run dev`后本地服务地址为`http://localhost:5173/`，之后会用到~



### 嵌入前端页面
> 接下来将web页面展示在vscode侧边栏~

vscode 提供了两种创建iframe的方法，`WebviewViewProvider` 和 `createWebviewPanel`，选其一即可，这里我们介绍一下`WebviewViewProvider`如何使用



- 首先需要在 pkg 中配置视图信息：

``` json
"contributes": {
    "commands": [],
    "viewsContainers": { // 自定义视图的视图容器, 必须指定视图容器的标识符、标题和图标
      "activitybar": [ // 活动栏
        {
          "id": "chat-sidebar-view", // 容器id, 确保在下方views中有对应的视图
          "title": "聊一下", // 标题
          "icon": "images/chat-icon.png" // 图标
        }
      ]
    },
    "views": {// 定义视图
      "chat-sidebar-view": [
        {
          "type": "webview", // 类型为webview
          "id": "chat-sidebar-view", // 容器id
          "name": " 聊一下",
          "icon": "images/chat-icon.png",
          "contextualTitle": "聊一下"
        }
      ]
    }
  },
```
> `views` 是配置视图列表,`activitybar` 是定义下显示在侧边导航上的视图。


- 然后在`extention.ts`注册视图模块，同时引入侧边栏视图`ChatWebview`：

``` ts
import * as vscode from 'vscode';
import { ChatWebview } from "./chatWebview";

// 插件的入口函数, 当插件第一次加载时会执行activate
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "chat" is now active!');
	// 实现侧边栏的初始化
	// 实例化一个chatWebview
	const chatWebview = new ChatWebview();
	// 注册webview 到id为 chat-sidebar-view 的views中，这个id为 chat-sidebar-view 的视图我们稍后会在
	// package.json 中声明，先理解为我们要把iframe渲染在那个地方（侧边栏还是标签页）需要在 package.json 中控制
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("chat-sidebar-view", chatWebview)
	);

  // 这里实现了一个简单的功能，在vscode打开的文件中，选中代码时会实时展示在web页面上
	// 监听用户选中文本事件
	vscode.window.onDidChangeTextEditorSelection((event) => {
		const editor = event.textEditor;
		let document = editor.document;
		let selection = editor.selection;
	// 获取当前窗口的文本
		let text = document.getText(selection);
		console.log('===onDidChangeTextEditorSelection', text);
		// 上文提到chatWebview可能为null 因此需要可选链写法，所以这里存在不稳定性，不过测试没问题~
		chatWebview?.webview?.webview.postMessage({
		// 第一次postMessage，下一次在chatWebview文件的iframe中
		command: "vscodeSendMesToWeb",
		data: text,
		});
	});
}
```


- 接着就是最重要的，新建`chatWebView.ts`文件，实现页面的展示:

``` ts
// src/chatWebView.ts

import { window, Position, WebviewView, WebviewViewProvider } from "vscode";
export class ChatWebview implements WebviewViewProvider {
  // 写一个public变量，方便对象引用创建后的webview实例，但是可能存在还未完全解析完成时，访问值为null
  // 看了vscode api发现，resolveWebView 返回一个 Thenable，可以在解析完成后拿到webview实例
  // 但是这个函数是在webview容器第一次显示时自动执行，不需要手动调用，不知道怎么拿到Thenable
  public webview: WebviewView | null = null;
  resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    this.webview = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };
    // 监听web端传来的消息
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "WebSendMesToVscode":
          // 实现一个简单的功能，将web端传递过来的消息插入到当前活动编辑器中
          let editor = window.activeTextEditor;
          editor?.edit((edit) => {
            let position = editor?.selection
              ? editor?.selection.start
              : new Position(0, 0);
            edit.insert(position, message.data);
          });
          return;
      }
    }, undefined);
    // webview 展示的内容本身就是嵌套在一个iframe中，因此在此html中再嵌套一个iframe时，需要传递两次postMessage
    webviewView.webview.html = `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
        html,
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color:#000000;
            overflow:hidden;
        }
        .webView_iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        .outer{
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      </style>
    </head>
    <body>
      <script>
      
      console.log('Hello from the webview!');
      // 向vscode 传递消息的固定写法, vscode 为我们封装好了postMessage
      const vscode = acquireVsCodeApi();
      // 接收来自web页面的消息
      window.addEventListener('message', event => {
          const message = event.data;
          switch (message.command) {
               // 插件传递消息给web端
              case 'vscodeSendMesToWeb':
                  let iframe = document.getElementById('WebviewIframe')
                  WebviewIframe.contentWindow.postMessage(message, "*")
                  console.log("fromWebViewIframe: "+message.data)
                  break;
              // web端发送消息给插件
              case 'WebSendMesToVscode':
                    vscode.postMessage(message);
                    break;
          }
      });

     </script>
        <div class="outer">
           <iframe id='WebviewIframe' class="webView_iframe" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads" allow="cross-origin-isolated; clipboard-read; clipboard-write;" src="http://localhost:5173/"></iframe>
        </div>
    </body>
    </html>
    `;
  }
}
```
> 我们刚启动的前端服务`http://localhost:5173/`会被嵌套在`iframe`中~

`webviewView.webview.onDidReceiveMessage`就是监听 web 端向 vscode 发的消息；

`webviewView.webview.html`里面的内容会被 `webview` 嵌套在一个`父iframe`中，而我们的前端页面`http://localhost:5173/`会嵌套到`父iframe`的`子iframe`中，所以需要在`父iframe`中通过`window.addEventListener('message', ...)`监听 vscode 和 web 之间的通信，并作为通道将双方的通信信息传递过去；



- 这时打开左上角的`Run Extension`按钮，会新开一个调试窗口；这时会看到左侧多了一个图标按钮，点击就可以看到我们启动的页面了~~~！！！

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/vscode201.jpeg')" width="auto"/>

> 如果想像`Chrome`浏览器中打开调试控制台，点击顶部`Help => Toggle Developer Tools`即可开始调试了~


### 前端项目与插件通信

> 上面是实现前端页面嵌入的核心js代码了，接下来解析 web 跟 vscode 是如何通信的：


<img class="zoom-custom-imgs" :src="$withBase('/images/tool/vscode202.jpeg')" width="auto"/>

如上图所示，首先是 `web => vscode` 通信：
1. 首先在页面中的`click`事件中，点击会通过`window.parent.postMessage`向 vscode 发送信息；
2. 之后在 `chatWebview.ts`的`webviewView.webview.onDidReceiveMessage`中就会监听到 web 传过来的信息；

`vscode => web` 通信：
1. 代码中通过`vscode.window.onDidChangeTextEditorSelection`事件监听用户选中文本事件，同时通过`chatWebview?.webview?.webview.postMessage`向 web 传递信息；
2. 在前端代码中，通过 `window.addEventListener("message", ...)`监听 vscode 传过来的信息，从而实现通信。



### 接入文心一言API

> 这里接入的大语言模型看你自己选择，国外的[OpenAI](https://platform.openai.com/docs/overview)和[Gemini](https://ai.google.dev/docs?hl=zh-cn)，国内的文心一言等等，都可以；为了方便，我这边选择的是百度的文心一言~

[百度智能云千帆大模型平台](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html)

- 首先登录[百度智能云](https://cloud.baidu.com)，注册开发者账号，实名认证，流程比较简单，这里不再赘述了；

- 接着进入[ERNIE-Bot API文档](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/jlil56u11)，查看调用它的API需要怎么做；
> ERNIE-Bot是百度自行研发的大语言模型，覆盖海量中文数据，具有更强的对话问答、内容创作生成等能力。


- 接下来创建应用：进入[应用接入](https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application), 点击【创建应用】，输入应用名称，描述即可；创建成功后即会生成`API Key`和`Secret Key`；

- 然后进入[调试API](https://console.bce.baidu.com/tools/?u=bce-head#/api?product=AI&project=%E5%8D%83%E5%B8%86%E5%A4%A7%E6%A8%A1%E5%9E%8B%E5%B9%B3%E5%8F%B0&parent=ERNIE-Bot&api=rpc%2F2.0%2Fai_custom%2Fv1%2Fwenxinworkshop%2Fchat%2Fcompletions&method=post)页面，如图选择自己创建的应用，输入`body`信息，开始调试：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/vscode203.jpeg')" width="auto"/>



- 接下来就可以在项目中新建一个文件夹，用`Node.js`接入文心一言的API了，具体接入传参什么的参考官方文档就行；
> 这里node后端项目的搭建这里不再赘述了，我用的是express搭建的，接下来主要展示核心代码~


- `chat.js`:

``` js
// server/chat.js

const ERNIEB ="https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions";

// 获取token
async getAccessToken() {
        return new Promise(async (resolve, reject) => {
            const res = await axios.post('https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + AK + '&client_secret=' + SK);
            const { data } = res;
            resolve(data.access_token);

        });

    }

// 封装聊天接口
async ask(prompt) {
  // 问句push进去
  this.messages.push({ role: "user", content: prompt });
  console.log("message" + this.messages[0]);
  try {
    const res = await axios.post(
      ERNIEB,
      { messages: this.messages },
      { params: { access_token: await this.getAccessToken() } }
    );
    const { data } = res;
    console.log(data);
    // 答案也放进去
    this.messages.push({ role: "assistant", content: data.result });
    return data.result;
  } catch (error) {
    console.log("调用模型失败" + error);
  }
}
```
> 大致逻辑就是按API文档直接调用接口，然后用node封装一层，之后前端直接调用即可~ 具体实现逻辑见源码~



- 本地启动前端服务，node服务，再`Run Extension`, 就可以开始本地调试了：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/vscode204.png')" width="auto"/>



> 其实这个插件的client目录就是一个完全的前端web项目了，只是通过 vscode 的 webview 将前端的url通过iframe的形式嵌入进来；client就算单独作为一个引入大模型的项目也是成立的，这个插件只是加了跟web页面的通信~



### 本地调试

- 进入client项目，`npm run vercel`启动项目；

- 然后回到`chat`目录，将`chatWebview.ts`中的`webUrl`设置为 client 的本地启动地址，`Run Extension`打开调试窗口，点击左侧【聊】图标即可开始调试；

- `client`中有修改，点击vscode的刷新按钮即可刷新；





### 发布

- 首先将client前端项目部署vercel: 进入到 vercel 目录，`vercel --prod`；

- 将 `chatWebview.ts`下的`webUrl`改为vercel线上地址，回到`chat`目录: 
  1. `vsce package` 打包扩展；
  2. `vsce publish` 发布到线上；

> 关于插件的发布配置上面已经讲过了，这里不再赘述，参考上面就可以了~


- 发布成功后直接搜索`vn-chat-extension`即可使用了~


[插件地址](https://marketplace.visualstudio.com/items?itemName=verneyzhou.vn-chat-extension)



### 其他

- 聊天界面UI优化

- 聊天接口token获取优化，appKey在vscode本地存储
> 这里appKey的存储可以参考上方翻译插件，存储在vscode本地，然后通过`postMessage`传给前端web项目~

- client和server部署
> 这里用 vercel 的 `serverless functions` 来部署后端接口，具体参考之前的[Vercel部署笔记](/more/vercel-deploy.html)

- 增加连续对话能力

- 引入其他API,比如openAI, Gemini等等





## 源码

上面的实战项目的完整代码都在[vscode-plugins-project](https://github.com/verneyZhou/vscode-plugins-project)~



## 报错记录


- 翻译插件本地调试时报错：`Activating extension 'verneyzhou.vn-translate-extension' failed: Cannot use import statement outside a module.`
> 调试时，pkg中的`main`指向打包后的js文件就暂时好了~


- chat插件，client项目 `vercel dev` 本地调试的时候，`api/`下的接口没生效，但部署到vercel上生效的？
> 我这边重新新创建一个vite项目，重新配置vercel，重新添加接口后就可以了？！...暂时无解，，，可能是之前的client项目配置vercel哪里有问题吧...





## 收藏

- [VSCode插件开发官方文档: Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)
- [VSCode插件开发中文文档](https://liiked.github.io/VS-Code-Extension-Doc-ZH)
- [VS Code Extension Samples](https://github.com/microsoft/vscode-extension-samples)

- [VSCode插件开发（韭菜盒子），做最好用的股票和基金插件](https://zhuanlan.zhihu.com/p/166683895)
- [一起来写 VS Code 插件：VS Code 版 CNode 已上线](https://juejin.cn/post/7033631156616888328)






## 参考


- [一起来写 VS Code 插件:为你的团队提供常用代码片段](https://juejin.cn/post/7030250953215311908)
- [一起来写 VS Code 插件：实现一个翻译插件](https://juejin.cn/post/7031878482367873037)
- [从0到1开发一款自己的vscode插件](https://segmentfault.com/a/1190000040720760)
- [发布自己的 vscode 大模型问答插件，vue+nodejs 接入文心一言api](https://juejin.cn/post/7298160530291376140)

- [记一次前端"vscode插件编写实战"超详细的分享会(建议收藏哦)(上篇)](https://segmentfault.com/a/1190000038553748)、[记一次前端"vscode插件编写实战"超详细的分享会(建议收藏哦)(下篇)](https://segmentfault.com/a/1190000038617902)
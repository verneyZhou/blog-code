---
title: 新机配置（mac）
date: 2021-04-28 21:12:04
# permalink: false # c3d445/
categories: 
  - null
tags: 
  - null
permalink: false # 67ff26/
---



# 新机配置（mac）


## 1.注册APPID
开机，按照提示步骤操作即可。


## 安装工具

### 常用工具

- 浏览器：谷歌浏览器、Safari(mac自带)、Firefox
>设置搜索引擎为百度，安装扩展程序（[FeHelper](https://www.baidufe.com/fehelper/index/index.html)、）[chrome导入书签](https://jingyan.baidu.com/article/a378c960ed561fb32828309d.html)

- 笔记：有道云笔记、xmind
- 网盘：百度云网盘
- host代理：switchHost!
- vpn：easy connect
- 会议：Team Viewer、腾讯会议
- 词典：网易有道云词典
- photo shop
> 百度云网盘中的三个下载包下载，解压，断网，安装，用TNT破解，重新打开即可
- office办公软件：ppt、excel、word
- 聊天工具：钉钉、微信、qq、
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 终端工具：[iTerm2](http://www.iterm2.com/)
- 终端提示工具：[oh-my-zsh](https://ohmyz.sh)
- api调试工具：postMan
- 抓包工具：[Charles](https://xclient.info/s/charles.html) （或 百度云下载）
- 代码编辑工具：[WebStorm](https://www.jetbrains.com/zh-cn/webstorm/)、[VSCode](https://code.visualstudio.com/)
- 搭梯子：v2Ray
- 娱乐工具：网易云、qq音乐、B站、youtube...


### 工作涉及
- 项目工具：shimo+jira(项目管理)、wiki(需求文档)
- UI 设计工具：[蓝湖](https://lanhuapp.com/)
- 技术社区：[掘金](https://juejin.im/timeline)、极客时间

- mysql客户端：Navicat Premium
- 静态资源上传远程服务器：FileZilla


## 配置开发环境

- **安装xcode命令行开发工具**
> 首先打开终端，输入：`xcode-select --install`；出现弹框，点击安装

> 如果安装提示网络问题参照此[链接](https://blog.csdn.net/ccmedu/article/details/86682645)手动安装；[Mac安装Xcode](https://blog.csdn.net/qq_32284189/article/details/109682641)、[Developer Apple](https://developer.apple.com/download/all/)

``` shell
# 显示当前Xcode版本，如果已安装，会出现如下提示
xcode-select --version 
xcode-select version 2354.

# 如果未安装，可通过下方命令安装；如果已安装会出现下面提示
xcode-select --install
xcode-select: error: command line tools are already installed, use "Software Update" to install updates

# 查看当前xcode的版本目录
xcode-select -p
/Library/Developer/CommandLineTools

# 查看版本信息
gcc --version
Configured with: --prefix=/Library/Developer/CommandLineTools/usr --with-gxx-include-dir=/Library/Developer/CommandLineTools/SDKs/MacOSX10.14.sdk/usr/include/c++/4.2.1
Apple LLVM version 10.0.1 (clang-1001.0.46.4)
Target: x86_64-apple-darwin18.2.0
Thread model: posix
InstalledDir: /Library/Developer/CommandLineTools/usr/bin
```


- **安装Homebrew**
> `Homebrew`是一款Mac OS平台下的软件包管理工具；安装 Apple（或您的 Linux 系统）没有预装但你需要的东西。
::: tip 流程：
1. 参照[官网](https://brew.sh/index_zh-cn)进行安装；然后enter，输入密码，等待...
2. 安装完成后输入：`brew --version`，出现版本号即表示安装成功；
3. 接着安装`wget、curl、git`；一般mac终端默认已安装`curl、git`；输入：`git --verison/curl --version`出现版本号即可验证；若无则安装；以wget为例：`brew install wget`；安装成功，输入：`wget --version`即可验证是否安装成功
:::

``` shell
# 查看配置
brew config 
HOMEBREW_VERSION: 2.2.16
ORIGIN: https://github.com/Homebrew/brew
HEAD: c0f5a52d85d3606e7600162a9d38936ab4b46f4f
Last commit: 1 year, 10 months ago
Core tap ORIGIN: https://github.com/Homebrew/homebrew-core
Core tap HEAD: d7102825baf8116da0e12de7155427f6626cb700
Core tap last commit: 1 year, 10 months ago
HOMEBREW_PREFIX: /usr/local
HOMEBREW_MAKE_JOBS: 8
CPU: octa-core 64-bit kabylake
Homebrew Ruby: 2.6.3 => /usr/local/Homebrew/Library/Homebrew/vendor/portable-ruby/2.6.3/bin/ruby
Clang: 10.0 build 1001
Git: 2.20.1 => /Library/Developer/CommandLineTools/usr/bin/git
Curl: 7.54.0 => /usr/bin/curl
macOS: 10.14.1-x86_64
CLT: 10.3.0.0.1.1562985497
Xcode: N/A
```


- **安装`iTerm2 + oh-my-zsh`**
> 下载iTerm2，下载链接见终端工具
::: tip 流程：
1. 首先打开终端，输入：`echo $SHELL`；查看当前shell；一般mac默认为bash;
2. 输入：`cat /etc/shells`；查看支持的shell列表；查看是否含有/bin/zsh；输入`zsh --version`；查看zsh版本号；
3. 输入：`chsh -s /bin/zsh`；输入密码，切换到zsh；切换之后要重新打开终端，输入：`echo $SHELL`；验证是否切换成功；
4. 安装oh-my-zsh，参照上方官网
5. 安装zsh插件：`brew install autojump`
:::


- **安装`node + npm`**
> 参照[官网](http://nodejs.cn/download/)下载node.js安装包
::: tip 流程：
1. 安装，一路同意....，安装成功后在终端输入：`node --version`；出来版本号即安装成功
2. 安装node的同时也安装了npm，输入：`npm --version`即可见版本号
3. 这时我们试着用npm安装一个插件看看能否安装成功；或者输入：`npm install -g npm` 更新npm 版本；
4. 如果更新失败，报错：`npm WARN checkPermissions Missing write access to /usr/local/lib/node_modules`，是因为默认的安装位置是/usr/local/lib所在的文件夹，这是系统的文件夹所在地，所以可能会出现一些读写问题。将module的安装根目录设置在一般的文件夹下则没有这么多问题；[解决方法](https://www.jianshu.com/p/31744aa44824)如下：
:::
``` shell
# 第一步：在你的用户文件下新建一个文件夹，这个.npm-global 名字可以用你自己喜欢的名字替换，推荐直接使用这个名字。
mkdir ~/.npm-global
#第二步：更改node的安装连接
npm config set prefix '~/.npm-global'
#第三步：在用户的profile下增加path，为的是系统能够找到可执行文件的目录
 export PATH=~/.npm-global/bin:$PATH
#第四步：update profile。使其生效
source ~/.profile
```
重新`npm install  -g npm`；即更新npm版本成功


- **安装[cnpm淘宝镜像](https://npm.taobao.org)**
> 使用cnpm来安装的方便在于比npm安装速度更快（相对国内而言），淘宝镜像cnpm在国内可以代替npm安装其可以安装的插件等。

> 根据官网介绍安装：`npm install -g cnpm -registry=https://registry.npm.taobao.org`


- **安装[yarn](https://yarn.bootcss.com/)**
> Yarn是由Facebook、Google、Exponent 和 Tilde 联合推出了一个新的 JS 包管理工具 ，是为了弥补 npm 的一些缺陷而出现的。
> `brew install yarn`；安装完成后按照提示修改path


- **安装nvm**
> nvm 是 Tim Caswell 开发的一款 Mac 系统中使用的通过命令方式管理多版本 Node.js 的软件。

[github地址](https://github.com/nvm-sh/nvm)
[安装说明](https://segmentfault.com/a/1190000007998600)


- **配置git环境**  
    - `git -version`  查看git是否安装，否则`brew install git`或者通过官网安装；
    - 配置用户名和用户邮箱，以后每次与Git的交互都会使用该信息。
    ``` shell
    git config --global user.name "your_name"  
    git config --global user.email "your_email@gmail.com"
    ```
    - Git关联远端仓库时候需要提供公钥，本地保存私钥，每次与远端仓库交互时候，远端仓库会用公钥来验证交互者身份。使用以下指令生成密钥：
    ``` shell
    ssh-keygen -t rsa -C "your_email@youremail.com" # 输入之后一路回车
    ```
    - 生成密钥后，在本地的/Users/当前电脑用户/.ssh目录下会生成两个文件id_rsa、id_rsa.pub，id_rsa文件保存的是私钥，保存于本地，id_rsa.pub文件保存的是公钥，需要将里面内容上传到远端仓库
    ``` shell
    cat ~/.ssh/id_rsa.pub # 复制内容，粘贴到github账号的SSH keys中
    ```
    - 配置密钥成功，就可以clone项目了



    [参考](https://blog.csdn.net/xiaohanluo/article/details/53214933)




## VSCode配置

- **设置中文**
> `command+shift+p`；输入`config`,选择`language`，点击其他语言选项，安装中文简体扩展包，按照提示操作即可。
[参考](https://jingyan.baidu.com/album/7e44095377c9d12fc1e2ef5b.html?picindex=1)



- **eslint配置**
> code ==> 首选项 ===> 设置 ===> `serting.json` 中添加配置；[参考](https://www.jianshu.com/p/23a5d6194a4b)


- **扩展工具**
``` shell
GitLens   # git提交记录
Chinese (Simplified) Language Pack for Visual Studio Code  # 中文语言包
ESLint # 代码规范
HTML Snippets   # 自动帮你输入HTML标签
Image preview    # 图片资源预览
Debugger for Chrome    # 在vs中启动chrome控制台
小程序助手、Live HTML Previewer、open in browser、SVG viewer、View in Browser、VS Color Picker、vscode-icons、Vetur、Live Server
any-rule(正则大全)
```

## 常见问题
> 暂无~


<!-- 2021-04-29 -->




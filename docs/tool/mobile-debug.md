---
title: 移动端远程真机调试
date: 2023-02-20 19:45:05
permalink: false
categories:
  - 移动端
  - 真机调试
tags:
  - 真机调试
---


# 移动端远程调试
> 我们在进行移动端开发的过程中经常会遇到一些不同设备的兼容性问题，这些问题只有在真机上才能复现，这时移动端真机调试就显得尤为重要；这里主要记录一些我在开发过程中用到的真机调试经验~





## vConsole
> [vConsole](https://github.com/Tencent/vConsole/blob/dev/README_CN.md)是腾讯出的一个轻量、可拓展、针对手机网页的前端开发者调试面板；是一个可以在移动端页面上展示调试信息的工具，可以帮助开发者在移动端实现更加便捷的调试和开发。

vConsole 是一款专门为移动端 Web 开发者提供的一个轻量级的前端调试工具，提供了控制台、日志、网络、元素等多种调试功能，能够帮助我们更方便地进行移动端网页开发和调试。

vConsole 与框架无关的，可以在 Vue、React 或其他任何框架中使用；现在 vConsole 是微信小程序的官方调试工具。


### 使用
> 详细使用方法参考这里：[使用教程](https://github.com/Tencent/vConsole/blob/dev/doc/tutorial_CN.md)

- **安装**
> 主要有npm安装和CDN引入两种方式，都可以使用~

1. npm安装：`npm install vconsole`

``` js
import VConsole from 'vconsole';

// 创建一个vConsole的实例
const vConsole = new VConsole();
// 或者使用配置参数进行初始化
const vConsole = new VConsole({ theme: 'dark' });

// 调用 console 方法输出日志
console.log('Hello world');

// 完成调试后，可销毁 vConsole
vConsole.destroy();
```

2. CDN引入：
``` html
<script src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js"></script>
<script>
  // VConsole 会自动挂载到 `window.VConsole`
  var vConsole = new window.VConsole();
</script>
```


- **调试**

引入`vconsole`之后，在移动端设备上重新加载网页，创建vConsole实例，此时 vConsole 控制台会自动弹出，就可以在移动端页面上展示它了。

在 vConsole 控制台中，可以查看控制台输出、网络请求、设备信息、页面元素等信息，并进行相关的调试操作。

> 默认情况下，在移动端页面上进行双击操作即可展示vConsole。如果需要更改展示vConsole的手势操作，可以在创建vConsole实例时指定相应的配置参数。


vConsole 提供一些公共属性字段、函数方法，以便开发插件。[公共属性及方法](https://github.com/Tencent/vConsole/blob/dev/doc/public_properties_methods_CN.md)

``` js
var vConsole = new VConsole({
    defaultPlugins: ['system', 'network', 'element', 'storage'], // 内置插件
    maxLogNumber: 5000, // 超出数量上限的日志会被自动清除
    onReady: function() {
        console.log('vConsole is ready.');
    },
    onClearLog: function() {
        console.log('on clearLog');
    }
});

// 更改配置
vConsole.setOption({maxLogNumber: 1000});
```


`vConsole`有内置插件，可抓取 `Network` 网络请求，所有 `XMLHttpRequest | fetch | sendBeacon` 请求都会被显示到 `Network` 面板中。

若不希望一个请求显示在面板中，可添加属性 `_noVConsole = true` 到 `XHR` 对象中：
``` js
var xhr = new XMLHttpRequest();
xhr._noVConsole = true; // 不会显示到 tab 中
xhr.open('GET', 'http://example.com/');
xhr.send();
```

[内置插件：属性及方法](https://github.com/Tencent/vConsole/blob/dev/doc/plugin_properties_methods_CN.md)







## Chrome浏览器真机调试
> 如果你使用的是Android系统的手机，那么可以使用Chrome浏览器自带的远程调试功能进行真机调试~


1. 手机开启USB调试模式（以小米12为例）
  - 设置 》 我的设备 》 全部参数 》 MIUI版本，不停双击，直到提示“已进入开发者模式”为止
  - 设置 》更多设置 》开发者选项 》 打开【USB模式】

2. 之后手机下载最新版的Chrome浏览器（有些在应用商店可能下载不了，可以在手机自带浏览器中输入`https://www.google.cn/intl/zh-CN/chrome/`进行下载）;同样PC电脑上也需要下载最新版本浏览器；
3. 下载完成后，用USB数据线连接电脑和手机，PC和手机都连上同一个WIFI，在PC的Chrome浏览器中输入：`chrome://inspect`，在`Devices`下面选中`Discover USB devices`；同时手机也打开Chrome浏览器，随便访问一个页面，即可在PC的页面上看到访问记录，如下图所示：

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/debug01.jpeg')" width="auto"/>

4. 之后点击相应页面下的【inspect】，就会弹出如右侧所示的控制台窗口；在这里就可以看到控制台打印的数据和`Network`下的接口请求，就跟平时在PC开发页面一样，只不过这里是实时展示手机访问的信息；
> 更神奇的是，在PC上点击跳转也会在手机上执行同样的操作，反过来在手机上操作也是，交互都是同步更新的！在PC控制台上调点样式啥的也能在手机上同步，这样就可以在PC控制台远程调试手机的页面了~

> 有时手机端访问的url在PC上更新不及时，可能是usb数据线接触不良，重新插入usb，或重新开启【USB模式】试下~ 有时调试页面无法正常展示，可能是需要翻墙~

> 发现不只在Chrome浏览器中访问能抓到，在手机其他浏览器上访问的页面也能抓到...


参考：[移动前端调试方案（Android + Chrome 实现远程调试）](https://www.cnblogs.com/alantao/p/5220392.html)
##  IOS系统手机真机调试
> IOS系统的手机可以通过Safari浏览器进行真机调试。具体步骤如下：

1. IOS手机设置：设置 》 Safari 》 高级 》 【Web 检查器】打开；

2. PC端设置：Safari浏览器 》 偏好设置 》 高级 》 勾选【在菜单栏中显示“开发”菜单】，之后就会在`Safari`浏览器顶部菜单栏多出【开发】选项；

3. 设置完后，用数据线将手机与电脑连接，然后在手机`Safari`浏览器中打开需要调试的网址，然后在PC的`Safari`浏览器的【开发】菜单里就可以看到已连接的设置，和手机打开的网址。

4. 选择对应的设备和应用程序，在浏览器中打开调试工具。

5. 在调试工具中可以进行调试，包括查看和修改`DOM、CSS、JavaScript`等。

> 需要注意的是，在进行真机调试时，需要将iOS设备和电脑连接在同一局域网下，且需要保证iOS设备的网络连接稳定。同时，需要注意iOS系统的版本和Safari浏览器的版本之间的兼容性。



## 本地开发项目真机调试
> 上面讲的主要是远程调试手机端直接访问线上链接，而且都需要使用USB数据线链接才能调试；有时候我们在本地开发H5页面时，需要看一下在手机上的兼容性问题，但如果每次都是上线之后再看就很麻烦；那如果想在本地开发的时候就可以直接远程调试页面应该怎么做呢？

### IP调试

这个方法是最简单粗暴的，一般现在本地的`vue-cli`、`vite`项目启动后都会同时启动一个如下所示的IP地址，这个IP地址一般就是你电脑IP+端口号
> 查询自己电脑ip地址（以mac为例）：系统偏好设置 》 网络 》 高级 》 TCP/IP 》IPv4地址

``` shell
office_blockchain_web3 git:(master) npm run dev

  vite v2.9.12 dev server running at:

  > Local:    http://localhost:8099/
  > Network:  http://10.222.96.147:8099/
```

启动项目后，之后就直接在手机上访问这个ip地址就可以了~ 前提是手机和PC得在同一个wifi下~！之后本地的修改也会同步在手机上更新~
> 但这个方法也不是所有浏览器都适用，我试了在微信浏览器中访问有时候可以，在其他浏览器中就是白页，加载不出来...可能是有网络限制...


## Whistle代理真机调试
>  关于Whistle具体的安装启动，代理和证书的配置[whistle官网](http://wproxy.org/whistle/)已经讲得很详细了，我在[常用代理工具整理](/tool/proxy.html#whistle)这篇博文里也有介绍，这里不再赘述~下面主要记录下如何通过Whistle实现h5页面的远程调试~

1. 配置好Whislte后，我们可以在PC端抓到网络请求；现在在本地启动项目后在`whislte`里添加一条`rules`:
```shell
127.0.0.1:8099 i.ob.e.weibo.com # 将域名指向本地服务
```
2. 手机和电脑在同一局域网下，手机添加代理后，手机端直接访问`i.ob.e.weibo.com`也就可以访问到本地项目，同时也能在Whistle中抓到网络请求~
> 现在已经可以在手机端实现查看开发中的H5页面，有什么样式兼容性问题，也可以在开发阶段暴露出来~

### Weinre真机调试
> 如果想查看手机端访问本地H5页面的console打印情况，页面DOM样式等信息，可以用`Whislte`内置的`Weinre`模块来实现~（Whistle确实功能挺强大的~~）

1. 在`Whislte`中添加一条`rules`：
``` shell
# 前面是手机上需要访问的地址，后面的huaiding_local是自定义的名称~
i.ob.e.weibo.com weinre://huaiding_local
```

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/debug02.jpeg')" width="auto"/>

2. 添加之后就会在`Whislte`的顶部菜单`Weinre`中增加一条记录，点击它，会就开如下页面，手机访问`i.ob.e.weibo.com`，不出意外`Targets`下就会出现一条访问记录，代表连接成功，之后就可在这个页面查看手机访问时的各种信息了~

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/debug04.jpeg')" width="auto"/>

3. 下图就是在PC上查看手机端访问页面的DOM元素，当鼠标悬浮到DOM上时，会发现手机上相应DOM也会高亮~

<img class="zoom-custom-imgs" :src="$withBase('/images/tool/debug003.jpeg')" width="auto"/>


> 这样当本地开发H5项目时，就可以通过`Whislte + Weinre`实现本地真机调试，提前在开发阶段暴露样式兼容问题，通过查看console信息发现真机上的报错问题~


> 但好像debugger的时候在手机上不会生效，PC上查看的DOM的样式不全...


这里是用`Whistle`内置的`weinre`来真机调试的，其实可以直接用`weinre`来进行调试，只是这里`Whistle`已经集成了`weinre`，就不用单独介绍了，用法其实都差不多，具体使用可参考这里[wenire真机调试](https://blog.csdn.net/Chenming_321/article/details/98190588)


## 其他

- [前端人必须掌握的抓包技能](https://juejin.cn/post/7140040425129115684)
- [Hybrid 远程调试的前世今生](https://mp.weixin.qq.com/s/rm_7vNNhd4WukjHRW0cl0w)
- [Remote debug Android devices](https://developer.chrome.com/docs/devtools/remote-debugging/)
(window.webpackJsonp=window.webpackJsonp||[]).push([[174],{776:function(e,t,r){"use strict";r.r(t);var o=r(8),a=Object(o.a)({},(function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[r("h1",{attrs:{id:"常用代理工具整理"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#常用代理工具整理"}},[e._v("#")]),e._v(" 常用代理工具整理")]),e._v(" "),r("blockquote",[r("p",[e._v("工欲善其事，必先利其器。前端开发中好用的代理工具对于开发和调试来讲往往能起到事半功倍的效果~这里会收集整理一些常用的代理工具，也会记录些如远程真机调试的玩法，以便日后工作中会用到~")])]),e._v(" "),r("h2",{attrs:{id:"charles"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#charles"}},[e._v("#")]),e._v(" Charles")]),e._v(" "),r("blockquote",[r("p",[e._v("Charles 是在 PC 端常用的网络封包截取工具，在做移动开发时，我们为了调试与服务器端的网络通讯协议，常常需要截取网络封包来分析。Charles 通过将自己设置成系统的网络访问代理服务器，使得所有的网络访问请求都通过它来完成，从而实现了网络封包的截取和分析。"),r("a",{attrs:{href:"https://www.charlesproxy.com/",target:"_blank",rel:"noopener noreferrer"}},[e._v("Charles官网"),r("OutboundLink")],1)])]),e._v(" "),r("p",[e._v("关于Charles的介绍和使用这篇博文已经介绍得很详细的，具体见这里："),r("a",{attrs:{href:"https://juejin.cn/post/6844903665304600589",target:"_blank",rel:"noopener noreferrer"}},[e._v("Charles 功能介绍和使用教程"),r("OutboundLink")],1)]),e._v(" "),r("p",[e._v("官方版本有时可能因为墙的原因下载不了，"),r("a",{attrs:{href:"https://xclient.info/s/charles.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("Charles 4.6.1 Mac上的抓包工具"),r("OutboundLink")],1),e._v("上面有破解版可以下载；")]),e._v(" "),r("p",[e._v("下载安装具体流程可参照这里："),r("a",{attrs:{href:"https://www.jianshu.com/p/0bc767840e42",target:"_blank",rel:"noopener noreferrer"}},[e._v("CharlesMac破解版安装以及使用"),r("OutboundLink")],1)]),e._v(" "),r("h3",{attrs:{id:"https代理"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#https代理"}},[e._v("#")]),e._v(" https代理")]),e._v(" "),r("ul",[r("li",[r("strong",[e._v("CA证书安装")])])]),e._v(" "),r("blockquote",[r("p",[e._v("安装 CA 证书的目的是为了抓包 https 请求，完成 SSL 证书校验~")])]),e._v(" "),r("p",[r("strong",[e._v("mac端：")])]),e._v(" "),r("ol",[r("li",[e._v("打开Charles > help > SSL Proxying > Install Charles Root Certifacate，进行添加；")]),e._v(" "),r("li",[e._v("设置证书为始终信任：\n"),r("img",{staticClass:"zoom-custom-imgs",attrs:{src:e.$withBase("/images/tool/charles01.png"),width:"auto"}})])]),e._v(" "),r("p",[r("strong",[e._v("安卓端：")])]),e._v(" "),r("blockquote",[r("p",[e._v("安装端的抓包配置可以参照这篇博文："),r("a",{attrs:{href:"https://blog.csdn.net/barnett_xxf/article/details/91126255",target:"_blank",rel:"noopener noreferrer"}},[e._v("使用Charles和小米手机MIX3进行手机HTTPS抓包"),r("OutboundLink")],1)])]),e._v(" "),r("ul",[r("li",[r("strong",[e._v("SSL Proxying设置")])])]),e._v(" "),r("p",[e._v("Charles > Proxy > SSL Proxying Settings：")]),e._v(" "),r("img",{staticClass:"zoom-custom-imgs",attrs:{src:e.$withBase("/images/tool/charles02.png"),width:"auto"}}),e._v(" "),r("blockquote",[r("p",[e._v("设置完毕，重新启动即可~")])]),e._v(" "),r("p",[e._v("具体的https代理、移动端抓包配置可以参考这里："),r("a",{attrs:{href:"https://juejin.cn/post/7121496066591031310",target:"_blank",rel:"noopener noreferrer"}},[e._v("前端工程师应该掌握的抓包神器工具—Charles，会了真香"),r("OutboundLink")],1)]),e._v(" "),r("ul",[r("li",[r("strong",[e._v("Breakpoint Settings(断点设置)")])])]),e._v(" "),r("p",[e._v("Proxy > Breakpoints Settings：")]),e._v(" "),r("img",{staticClass:"zoom-custom-imgs",attrs:{src:e.$withBase("/images/tool/charles03.png"),width:"auto"}}),e._v(" "),r("blockquote",[r("p",[e._v("参考："),r("a",{attrs:{href:"https://www.jianshu.com/p/7479866a1d8e",target:"_blank",rel:"noopener noreferrer"}},[e._v("抓包工具：Charles-断点"),r("OutboundLink")],1)])]),e._v(" "),r("p",[e._v("抓包的时候如果出现的unknown问题，应该是没有安装ssl证书，安装并添加后就可以了~")]),e._v(" "),r("h2",{attrs:{id:"whistle"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#whistle"}},[e._v("#")]),e._v(" Whistle")]),e._v(" "),r("blockquote",[r("p",[e._v("whistle是基于Node实现的跨平台web调试代理工具，类似的工具有Windows平台上的Fiddler，主要用于查看、修改HTTP、HTTPS、Websocket的请求、响应，也可以作为HTTP代理服务器使用，不同于Fiddler通过断点修改请求响应的方式，whistle采用的是类似配置系统hosts的方式，一切操作都可以通过配置实现。"),r("a",{attrs:{href:"http://wproxy.org/whistle/",target:"_blank",rel:"noopener noreferrer"}},[e._v("whistle官网"),r("OutboundLink")],1)])]),e._v(" "),r("p",[e._v("具体的安装启动，代理和https证书的配置上方官网已经很详细了")]),e._v(" "),r("p",[e._v("也可参考这篇博文进行学习，也讲得很详细："),r("a",{attrs:{href:"https://cloud.tencent.com/developer/article/1704552",target:"_blank",rel:"noopener noreferrer"}},[e._v("前端应该知道的web调试工具——whistle"),r("OutboundLink")],1)]),e._v(" "),r("p",[e._v("下面简单记录下安装配置过程~")]),e._v(" "),r("h3",{attrs:{id:"安装启动"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#安装启动"}},[e._v("#")]),e._v(" 安装启动")]),e._v(" "),r("blockquote",[r("p",[e._v("参考："),r("a",{attrs:{href:"http://wproxy.org/whistle/install.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("安装启动"),r("OutboundLink")],1)])]),e._v(" "),r("ol",[r("li",[r("code",[e._v("npm install -g whistle")])]),e._v(" "),r("li",[r("code",[e._v("w2 start")])]),e._v(" "),r("li",[e._v("浏览器打开："),r("code",[e._v("http://127.0.0.1:8899/")])])]),e._v(" "),r("h3",{attrs:{id:"switchyomega"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#switchyomega"}},[e._v("#")]),e._v(" SwitchyOmega")]),e._v(" "),r("blockquote",[r("p",[r("a",{attrs:{href:"https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif",target:"_blank",rel:"noopener noreferrer"}},[e._v("SwitchyOmega"),r("OutboundLink")],1),e._v("是chrome的插件，通过它我们可以很方便的切换chrome的代理。")])]),e._v(" "),r("p",[e._v("上方链接是chrome应用商店官方下载链接，如果我们没有翻墙工具可能访问不了，可直接下载SwitchyOmega的安装包进行安装，参考："),r("a",{attrs:{href:"https://blog.csdn.net/weixin_42940480/article/details/107567262",target:"_blank",rel:"noopener noreferrer"}},[e._v("SwitchyOmega安装与使用"),r("OutboundLink")],1),e._v("、"),r("a",{attrs:{href:"https://github.com/FelisCatus/SwitchyOmega/releases/tag/v2.5.20",target:"_blank",rel:"noopener noreferrer"}},[e._v("SwitchyOmega Github地址"),r("OutboundLink")],1)]),e._v(" "),r("ol",[r("li",[e._v("下载"),r("code",[e._v(".crx")]),e._v("文件，并将后缀改成"),r("code",[e._v(".zip")])]),e._v(" "),r("li",[e._v("chrome浏览器输入："),r("code",[e._v("chrome:/extensions/")])]),e._v(" "),r("li",[e._v("将"),r("code",[e._v(".zip")]),e._v("文件拖入浏览器即可")]),e._v(" "),r("li",[e._v("配置"),r("code",[e._v("proxy：127.0.0.1:8899")]),e._v(", 并选中打开（浏览器插件"),r("code",[e._v("SwitchyOmega")]),e._v("中"),r("code",[e._v("proxy")]),e._v("应为高亮状态～）")])]),e._v(" "),r("h3",{attrs:{id:"添加ca证书"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#添加ca证书"}},[e._v("#")]),e._v(" 添加CA证书")]),e._v(" "),r("blockquote",[r("p",[e._v("如果需要代理https链接，还需要安装CA证书，参考："),r("a",{attrs:{href:"http://wproxy.org/whistle/webui/https.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("安装根证书"),r("OutboundLink")],1)])]),e._v(" "),r("ol",[r("li",[e._v("下载证书 》 双击打开 》 添加到钥匙串中")]),e._v(" "),r("li",[e._v("启动台 》 其他 》 钥匙串访问 》 输入"),r("code",[e._v("whistle")]),e._v("搜索 》 双击 》 【信任】改为“始终信任” 》 关闭")])]),e._v(" "),r("h3",{attrs:{id:"访问"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#访问"}},[e._v("#")]),e._v(" 访问")]),e._v(" "),r("p",[e._v("配置完成后，这时在浏览器中随便访问一个网页，即可在"),r("code",[e._v("http://127.0.0.1:8899/")]),e._v("的"),r("code",[e._v("network")]),e._v("中可以看到拦截的"),r("code",[e._v("http")]),e._v("和"),r("code",[e._v("https")]),e._v("（如果安装了CA证书）请求~")]),e._v(" "),r("p",[e._v("接着在"),r("code",[e._v("rules")]),e._v("中添加一条配置："),r("code",[e._v("www.baidu.com 127.0.0.1:8081")]),e._v("，访问"),r("code",[e._v("https://www.baidu.com")]),e._v("，即可访问到你本地的服务了~")]),e._v(" "),r("blockquote",[r("p",[e._v("关于"),r("code",[e._v("Whistle")]),e._v("中"),r("code",[e._v("rules")]),e._v("的具体配置模式可参考这里："),r("a",{attrs:{href:"http://wproxy.org/whistle/mode.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("配置方式"),r("OutboundLink")],1)])]),e._v(" "),r("h3",{attrs:{id:"移动端代理"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#移动端代理"}},[e._v("#")]),e._v(" 移动端代理")]),e._v(" "),r("blockquote",[r("p",[e._v("这里主要记录安卓机的配置~")])]),e._v(" "),r("ol",[r("li",[e._v("手机连上跟电脑同一个WIFI，在这个wifi下代理切换为【手动】，配置主机名：xx.xx.xx.xx（自己电脑ip地址）、端口：8899，保存；")]),e._v(" "),r("li",[e._v("手机下载"),r("code",[e._v("chrome")]),e._v("浏览器，地址输入："),r("code",[e._v("rootca.pro")]),e._v(" 下载"),r("code",[e._v("CA")]),e._v("证书；下载完成，进入手机【设置】，搜索【证书】，可进行安装；")]),e._v(" "),r("li",[e._v("安装完成，即可访问测试链接，在"),r("code",[e._v("PC whistle")]),e._v("控制台即可抓到网络请求~")])]),e._v(" "),r("h3",{attrs:{id:"问题记录"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#问题记录"}},[e._v("#")]),e._v(" 问题记录")]),e._v(" "),r("ul",[r("li",[e._v("重启电脑后会连不上网，应该是chrome插件"),r("code",[e._v("Proxy SwitchyOmega")]),e._v("的问题，找到它的"),r("code",[e._v(".zip")]),e._v("文件，重新拖入 "),r("code",[e._v("chrome://extensions")]),e._v("，由 【proxy】切换为【直接连接】即可~")]),e._v(" "),r("li",[e._v("重启电脑后，终端输入"),r("code",[e._v("w2 start")]),e._v("不生效，应该是"),r("code",[e._v("whistle")]),e._v("没了，全局重装下就可以~")])]),e._v(" "),r("h3",{attrs:{id:"其他"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#其他"}},[e._v("#")]),e._v(" 其他")]),e._v(" "),r("ul",[r("li",[e._v("关于switchhost和whistle用法区别："),r("a",{attrs:{href:"https://www.jianshu.com/p/c9c30bba3b90",target:"_blank",rel:"noopener noreferrer"}},[e._v("关于代理的理解"),r("OutboundLink")],1)]),e._v(" "),r("li",[r("a",{attrs:{href:"https://blog.csdn.net/qq_38217940/article/details/123611058",target:"_blank",rel:"noopener noreferrer"}},[e._v("前端代理浅析"),r("OutboundLink")],1)])]),e._v(" "),r("h2",{attrs:{id:"fiddler"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#fiddler"}},[e._v("#")]),e._v(" Fiddler")]),e._v(" "),r("blockquote",[r("p",[e._v("Fiddler是一款常用的免费代理工具，用于调试Web应用程序和HTTP API。它能够监控和分析网络流量，并提供许多有用的功能，如请求和响应分析、断点调试、修改请求和响应、重定向、缓存等；")])]),e._v(" "),r("p",[e._v("Fiddler最初是为Windows操作系统设计的，但是现在也有Mac和Linux版本。它提供了一个易于使用的用户界面，允许用户通过HTTP/HTTPS代理来查看请求和响应的详细信息，包括头部信息、响应体、Cookie、SSL信息等等。此外，它还提供了一个强大的脚本编辑器，允许用户编写自定义的脚本来扩展其功能。")]),e._v(" "),r("p",[e._v("Fiddler广泛应用于Web开发和测试中，可用于调试前端页面、API、移动应用程序等。它也被广泛用于网络安全领域，用于网络流量分析、漏洞测试等。")]),e._v(" "),r("p",[r("a",{attrs:{href:"https://www.telerik.com/fiddler",target:"_blank",rel:"noopener noreferrer"}},[e._v("Fiddler官网"),r("OutboundLink")],1)]),e._v(" "),r("p",[r("a",{attrs:{href:"https://juejin.cn/post/6844904042422861831",target:"_blank",rel:"noopener noreferrer"}},[e._v("Fiddler “抓包“最新详细教程"),r("OutboundLink")],1)])])}),[],!1,null,null,null);t.default=a.exports}}]);
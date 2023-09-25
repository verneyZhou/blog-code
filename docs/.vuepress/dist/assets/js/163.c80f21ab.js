(window.webpackJsonp=window.webpackJsonp||[]).push([[163],{760:function(t,v,_){"use strict";_.r(v);var e=_(8),s=Object(e.a)({},(function(){var t=this,v=t.$createElement,_=t._self._c||v;return _("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[_("h1",{attrs:{id:"http世界全览"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http世界全览"}},[t._v("#")]),t._v(" HTTP世界全览")]),t._v(" "),_("h2",{attrs:{id:"与http相关的各种概念"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#与http相关的各种概念"}},[t._v("#")]),t._v(" 与HTTP相关的各种概念")]),t._v(" "),_("h3",{attrs:{id:"网络世界"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#网络世界"}},[t._v("#")]),t._v(" 网络世界")]),t._v(" "),_("blockquote",[_("p",[t._v("实际的互联网是由许许多多个规模略小的网络连接而成的，这些“小网络”可能是只有几百台电脑的局域网，可能是有几万、几十万台电脑的广域网，可能是用电缆、光纤构成的固定网络，也可能是用基站、热点构成的移动网络……")])]),t._v(" "),_("blockquote",[_("p",[t._v("互联网世界更像是由数不清的大小岛屿组成的“千岛之国”。")])]),t._v(" "),_("p",[t._v("互联网的正式名称是 Internet，里面存储着无穷无尽的信息资源，我们通常所说的“上网”实际上访问的只是互联网的一个子集“万维网”（World Wide Web），它基于 HTTP 协议，传输 HTML 等超文本资源，能力也就被限制在 HTTP 协议之内。")]),t._v(" "),_("p",[t._v("互联网上还有许多万维网之外的资源，例如常用的电子邮件、BT 和 Magnet 点对点下载、FTP 文件下载、SSH 安全登录、各种即时通信服务等等，它们需要用各自的专有协议来访问。")]),t._v(" "),_("blockquote",[_("p",[t._v("不过由于 HTTP 协议非常灵活、易于扩展，而且“超文本”的表述能力很强，所以很多其他原本不属于 HTTP 的资源也可以“包装”成 HTTP 来访问，这就是我们为什么能够总看到各种“网页应用”——例如“微信网页版”“邮箱网页版”——的原因。")])]),t._v(" "),_("p",[t._v("现在的互联网 90% 以上的部分都被万维网，也就是 HTTP 所覆盖。")]),t._v(" "),_("h3",{attrs:{id:"浏览器"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#浏览器"}},[t._v("#")]),t._v(" 浏览器")]),t._v(" "),_("blockquote",[_("p",[t._v("上网就要用到浏览器，常见的浏览器有 Google 的 Chrome、Mozilla 的 Firefox、Apple 的 Safari、Microsoft 的 IE 和 Edge，还有小众的 Opera 以及国内的各种“换壳”的“极速”“安全”浏览器。")])]),t._v(" "),_("p",[t._v("浏览器的正式名字叫“Web Browser”，顾名思义，就是检索、查看互联网上网页资源的应用程序，名字里的 Web，实际上指的就是“World Wide Web”，也就是万维网。")]),t._v(" "),_("p",[t._v("浏览器本质上是一个 HTTP 协议中的"),_("strong",[t._v("请求方")]),t._v("，使用 HTTP 协议获取网络上的各种资源。")]),t._v(" "),_("p",[t._v("在 HTTP 协议里，浏览器的角色被称为“User Agent”即“用户代理”，意思是作为访问者的“代理”来发起 HTTP 请求。不过在不引起混淆的情况下，我们通常都简单地称之为"),_("strong",[t._v("客户端")]),t._v("。")]),t._v(" "),_("h3",{attrs:{id:"web-服务器"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#web-服务器"}},[t._v("#")]),t._v(" Web 服务器")]),t._v(" "),_("blockquote",[_("p",[t._v("刚才说的浏览器是 HTTP 里的请求方，那么在协议另一端的应答方（响应方）又是什么呢？答案就是服务器，"),_("strong",[t._v("Web Server")]),t._v("。")])]),t._v(" "),_("p",[t._v("Web 服务器是一个很大也很重要的概念，它是 HTTP 协议里响应请求的主体，通常也把控着绝大多数的网络资源，在网络世界里处于强势地位。")]),t._v(" "),_("p",[t._v("当我们谈到“Web 服务器”时有两个层面的含义：硬件和软件。")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",{staticClass:"custom-block-title"},[t._v("提示")]),t._v(" "),_("ul",[_("li",[_("strong",[t._v("硬件")]),t._v("含义就是物理形式或“云”形式的机器，在大多数情况下它可能不是一台服务器，而是利用反向代理、负载均衡等技术组成的庞大集群。但从外界看来，它仍然表现为一台机器，但这个形象是“虚拟的”。")]),t._v(" "),_("li",[_("strong",[t._v("软件")]),t._v("含义的 Web 服务器可能我们更为关心，它就是提供 Web 服务的应用程序，通常会运行在硬件含义的服务器上。它利用强大的硬件能力响应海量的客户端 HTTP 请求，处理磁盘上的网页、图片等静态文件，或者把请求转发给后面的 Tomcat、Node.js 等业务应用，返回动态的信息。")])])]),t._v(" "),_("p",[t._v("常见的Web服务器有：Apache、Nginx；此外，还有 Windows 上的 IIS、Java 的 Jetty/Tomcat 等，因为性能不是很高，所以在互联网上应用得较少。")]),t._v(" "),_("h3",{attrs:{id:"cdn"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#cdn"}},[t._v("#")]),t._v(" CDN")]),t._v(" "),_("blockquote",[_("p",[t._v("浏览器和服务器是 HTTP 协议的两个端点，那么，在这两者之间还有别的什么东西吗？")])]),t._v(" "),_("p",[t._v("浏览器通常不会直接连到服务器，中间会经过“重重关卡”，其中的一个重要角色就叫做 CDN。")]),t._v(" "),_("p",[_("strong",[t._v("CDN，全称是"),_("code",[t._v("Content Delivery Network")]),t._v("，翻译过来就是内容分发网络")]),t._v("。它应用了 HTTP 协议里的缓存和代理技术，代替源站响应客户端的请求。")]),t._v(" "),_("blockquote",[_("p",[t._v("它可以缓存源站的数据，让浏览器的请求不用“千里迢迢”地到达源站服务器，直接在“半路”就可以获取响应。如果 CDN 的调度算法很优秀，更可以找到离用户最近的节点，大幅度缩短响应时间。")])]),t._v(" "),_("h3",{attrs:{id:"爬虫"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#爬虫"}},[t._v("#")]),t._v(" 爬虫")]),t._v(" "),_("blockquote",[_("p",[t._v("前面说到过浏览器，它是一种用户代理，代替我们访问互联网。")])]),t._v(" "),_("p",[t._v("但HTTP 协议并没有规定用户代理后面必须是“真正的人类”，它也完全可以是“机器人”，这些“机器人”的正式名称就叫做“爬虫”（Crawler），实际上是一种"),_("strong",[t._v("可以自动访问 Web 资源的应用程序")]),t._v("。")]),t._v(" "),_("blockquote",[_("p",[t._v("“爬虫”这个名字非常形象，它们就像是一只只不知疲倦的、辛勤的蚂蚁，在无边无际的网络上爬来爬去，不停地在网站间奔走，搜集抓取各种信息。")])]),t._v(" "),_("p",[t._v("绝大多数爬虫是由各大搜索引擎“放”出来的，抓取网页存入庞大的数据库，再建立关键字索引，这样我们才能够在搜索引擎中快速地搜索到互联网角落里的页面。")]),t._v(" "),_("p",[t._v("但它会过度消耗网络资源，占用服务器和带宽，影响网站对真实数据的分析，甚至导致敏感信息泄漏。所以，又出现了“反爬虫”技术，通过各种手段来限制爬虫。")]),t._v(" "),_("h3",{attrs:{id:"html-webservice-waf"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#html-webservice-waf"}},[t._v("#")]),t._v(" HTML/WebService/WAF")]),t._v(" "),_("ul",[_("li",[t._v("HTML")])]),t._v(" "),_("blockquote",[_("p",[t._v("HTML（HyperText Markup Language），超文本标记语言，是一种用于创建网页的标准标记语言。它是 HTTP 协议传输的主要内容之一，它描述了超文本页面，用各种“标签”定义文字、图片等资源和排版布局，最终由浏览器“渲染”出可视化页面。")])]),t._v(" "),_("blockquote",[_("p",[t._v("HTML 目前有两个主要的标准，HTML4 和 HTML5。广义上的 HTML 通常是指 HTML、JavaScript、CSS 等前端技术的组合，能够实现比传统静态页面更丰富的动态页面。")])]),t._v(" "),_("ul",[_("li",[t._v("Web Service")])]),t._v(" "),_("blockquote",[_("p",[t._v("Web Service 是一种由 W3C 定义的应用服务开发规范，使用 client-server 主从架构，通常使用 WSDL 定义服务接口，使用 HTTP 协议传输 XML 或 SOAP 消息，也就是说，它是一个基于 Web（HTTP）的服务架构技术，既可以运行在内网，也可以在适当保护后运行在外网。")])]),t._v(" "),_("ul",[_("li",[t._v("WAF")])]),t._v(" "),_("blockquote",[_("p",[t._v("WAF 是近几年比较“火”的一个词，意思是“网络应用防火墙”。与硬件“防火墙”类似，它是应用层面的“防火墙”，专门检测 HTTP 流量，是防护 Web 应用的安全技术。")])]),t._v(" "),_("blockquote",[_("p",[t._v("WAF 通常位于 Web 服务器之前，可以阻止如 SQL 注入、跨站脚本等攻击，目前应用较多的一个开源项目是 ModSecurity，它能够完全集成进 Apache 或 Nginx。")])]),t._v(" "),_("h3",{attrs:{id:"rfc"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#rfc"}},[t._v("#")]),t._v(" RFC")]),t._v(" "),_("p",[t._v("有一些用来制定 HTTP 协议技术标准的文档，它们被称为 "),_("strong",[t._v("RFC（Request for Comments，征求修正意见书）")]),t._v("。")]),t._v(" "),_("p",[t._v("由于不遵照 RFC 标准实现就无法进行 HTTP 协议通信，所以基本 上客户端和服务器端都会以 RFC 为标准来实现 HTTP 协议。")]),t._v(" "),_("h2",{attrs:{id:"与http相关的各种协议"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#与http相关的各种协议"}},[t._v("#")]),t._v(" 与HTTP相关的各种协议")]),t._v(" "),_("h3",{attrs:{id:"tcp-ip"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#tcp-ip"}},[t._v("#")]),t._v(" TCP/IP")]),t._v(" "),_("p",[t._v("TCP/IP 协议实际上是一系列网络通信协议的统称，其中最核心的两个协议是 TCP 和 IP，其他的还有 UDP、ICMP、ARP 等等，共同构成了一个复杂但有层次的协议栈。")]),t._v(" "),_("p",[t._v("这个协议栈有四层，最上层是“应用层”，最下层是“链接层”，TCP 和 IP 则在中间：TCP 属于"),_("strong",[t._v("传输层")]),t._v("，IP 属于"),_("strong",[t._v("网际层")]),t._v("。")]),t._v(" "),_("p",[_("strong",[t._v("IP 协议是“Internet Protocol”的缩写，主要目的是解决寻址和路由问题，以及如何在两点间传送数据包")]),t._v("。IP 协议使用“IP 地址”的概念来定位互联网上的每一台计算机。可以对比一下现实中的电话系统，你拿着的手机相当于互联网上的计算机，而要打电话就必须接入电话网，由通信公司给你分配一个号码，这个号码就相当于 IP 地址。")]),t._v(" "),_("blockquote",[_("p",[t._v("现在我们使用的 IP 协议大多数是 v4 版，地址是四个用“.”分隔的数字，例如“192.168.0.1”，总共有 2^32，大约 42 亿个可以分配的地址。看上去好像很多，但互联网的快速发展让地址的分配管理很快就“捉襟见肘”。所以，就又出现了 v6 版，使用 8 组“:”分隔的数字作为地址，容量扩大了很多，有 2^128 个，在未来的几十年里应该是足够用了。")])]),t._v(" "),_("p",[_("strong",[t._v("TCP 协议是“Transmission Control Protocol”的缩写，意思是“传输控制协议”，它位于 IP 协议之上，基于 IP 协议提供可靠的、字节流形式的通信，是 HTTP 协议得以实现的基础。")])]),t._v(" "),_("blockquote",[_("p",[t._v('HTTP 是一个"传输协议"，但它不关心寻址、路由、数据完整性等传输细节，而要求这些工作都由下层来处理。因为互联网上最流行的是 TCP/IP 协议，而它刚好满足 HTTP 的要求，所以互联网上的 HTTP 协议就运行在了 TCP/IP 上，HTTP 也就可以更准确地称为'),_("strong",[t._v("HTTP over TCP/IP")]),t._v("。")])]),t._v(" "),_("h4",{attrs:{id:"tcp-ip-网络分层模型"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#tcp-ip-网络分层模型"}},[t._v("#")]),t._v(" TCP/IP 网络分层模型")]),t._v(" "),_("p",[t._v("TCP/IP 当初的设计者真的是非常聪明，创造性地提出了“分层”的概念，把复杂的网络通信划分出多个层次，再给每一个层次分配不同的职责，层次内只专心做自己的事情就好，用“分而治之”的思想把一个“大麻烦”拆分成了数个“小麻烦”，从而解决了网络通信的难题。")]),t._v(" "),_("ul",[_("li",[t._v("TCP/IP 的协议栈的层级图")])]),t._v(" "),_("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/tcp-ip.png"),width:"auto"}}),t._v(" "),_("blockquote",[_("p",[t._v("TCP/IP 协议总共有四层，就像搭积木一样，每一层需要下层的支撑，同时又支撑着上层，任何一层被抽掉都可能会导致整个协议栈坍塌。")])]),t._v(" "),_("p",[t._v("它的层次顺序是"),_("strong",[t._v("从下往上")]),t._v("数的：")]),t._v(" "),_("ol",[_("li",[t._v("第一层叫"),_("strong",[t._v("链接层（link layer）")]),t._v("，负责在以太网、WiFi 这样的底层网络上发送原始数据包，工作在网卡这个层次，使用 MAC 地址来标记网络上的设备，所以有时候也叫 MAC 层。")])]),t._v(" "),_("blockquote",[_("p",[t._v("MAC 地址（Media Access Control Address）也称为局域网地址，可以唯一的标识一个网卡，也就同时标识了此网卡所属的设备。")])]),t._v(" "),_("ol",{attrs:{start:"2"}},[_("li",[_("p",[t._v("第二层叫"),_("strong",[t._v("网际层")]),t._v("或者"),_("strong",[t._v("网络互连层（internet layer）")]),t._v("，IP 协议就处在这一层。因为 IP 协议定义了“IP 地址”的概念，所以就可以在“链接层”的基础上，用 IP 地址取代 MAC 地址，把许许多多的局域网、广域网连接成一个虚拟的巨大网络，在这个网络里找设备时只要把 IP 地址再“翻译”成 MAC 地址就可以了。")])]),t._v(" "),_("li",[_("p",[t._v("第三层叫"),_("strong",[t._v("传输层（transport layer）")]),t._v("，这个层次协议的职责是保证数据在 IP 地址标记的两点之间“可靠”地传输，是 TCP 协议工作的层次，另外还有它的一个“小伙伴”UDP。")])])]),t._v(" "),_("blockquote",[_("p",[t._v("TCP 是一个有状态的协议，需要先与对方建立连接然后才能发送数据，而且保证数据不丢失不重复。而 UDP 则比较简单，它无状态，不用事先建立连接就可以任意发送数据，但不保证数据一定会发到对方。"),_("strong",[t._v("两个协议的另一个重要区别在于数据的形式。TCP 的数据是连续的字节流，有先后顺序，而 UDP 则是分散的小数据包，是顺序发，乱序收")]),t._v("。")])]),t._v(" "),_("ol",{attrs:{start:"4"}},[_("li",[t._v("协议栈的第四层叫"),_("strong",[t._v("应用层（application layer）")]),t._v("，由于下面的三层把基础打得非常好，所以在这一层就“百花齐放”了，有各种面向具体应用的协议。例如 Telnet、SSH、FTP、SMTP 等等，当然还有我们的 HTTP。")])]),t._v(" "),_("p",[t._v("MAC 层的传输单位是帧（frame），IP 层的传输单位是包（packet），TCP 层的传输单位是段（segment），HTTP 的传输单位则是消息或报文（message）。但这些名词并没有什么本质的区分，可以统称为数据包。")]),t._v(" "),_("h4",{attrs:{id:"osi-网络分层模型"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#osi-网络分层模型"}},[t._v("#")]),t._v(" OSI 网络分层模型")]),t._v(" "),_("blockquote",[_("p",[t._v("TCP/IP 发明于 1970 年代，当时除了它还有很多其他的网络协议，整个网络世界比较混乱。这个时候国际标准组织（ISO）注意到了这种现象，就想要来个“大一统”。于是设计出了一个新的网络分层模型，想用这个新框架来统一既存的各种网络协议。")])]),t._v(" "),_("p",[t._v("OSI，全称是"),_("strong",[t._v("开放式系统互联通信参考模型")]),t._v("（Open System Interconnection Reference Model）。")]),t._v(" "),_("p",[t._v("OSI 模型分成了七层，部分层次与 TCP/IP 很像：")]),t._v(" "),_("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/osi.png"),width:"auto"}}),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",{staticClass:"custom-block-title"},[t._v("从下到上分别是：")]),t._v(" "),_("ol",[_("li",[t._v("第一层：物理层，网络的物理形式，例如电缆、光纤、网卡、集线器等等；")]),t._v(" "),_("li",[t._v("第二层：数据链路层，它基本相当于 TCP/IP 的链接层；")]),t._v(" "),_("li",[t._v("第三层：网络层，相当于 TCP/IP 里的网际层；")]),t._v(" "),_("li",[t._v("第四层：传输层，相当于 TCP/IP 里的传输层；")]),t._v(" "),_("li",[t._v("第五层：会话层，维护网络中的连接状态，即保持会话和同步；")]),t._v(" "),_("li",[t._v("第六层：表示层，把数据转换为合适、可理解的语法和语义；")]),t._v(" "),_("li",[t._v("第七层：应用层，面向具体的应用传输数据。")])])]),t._v(" "),_("h4",{attrs:{id:"两个分层模型的映射关系"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#两个分层模型的映射关系"}},[t._v("#")]),t._v(" 两个分层模型的映射关系")]),t._v(" "),_("blockquote",[_("p",[t._v("现在有了两个网络分层模型：TCP/IP 和 OSI，新的问题又出现了，一个是四层模型，一个是七层模型，这两者应该如何互相映射或者说互相解释呢？")])]),t._v(" "),_("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/tcp-osi.png"),width:"auto"}}),t._v(" "),_("ol",[_("li",[t._v("第一层：物理层，TCP/IP 里无对应；")]),t._v(" "),_("li",[t._v("第二层：数据链路层，对应 TCP/IP 的链接层；")]),t._v(" "),_("li",[t._v("第三层：网络层，对应 TCP/IP 的网际层；")]),t._v(" "),_("li",[t._v("第四层：传输层，对应 TCP/IP 的传输层；")]),t._v(" "),_("li",[t._v("第五、六、七层：统一对应到 TCP/IP 的应用层。")])]),t._v(" "),_("blockquote",[_("p",[t._v("OSI 的分层模型在四层以上分的太细，而 TCP/IP 实际应用时的会话管理、编码转换、压缩等和具体应用经常联系的很紧密，很难分开。例如，HTTP 协议就同时包含了连接管理和数据格式定义。")])]),t._v(" "),_("p",[t._v("所谓的"),_("strong",[t._v("四层负载均衡")]),t._v("就是指工作在传输层上，基于 TCP/IP 协议的特性，例如 IP 地址、端口号等实现对后端服务器的负载均衡。")]),t._v(" "),_("p",[t._v("所谓的"),_("strong",[t._v("七层负载均衡")]),t._v("就是指工作在应用层上，看到的是 HTTP 协议，解析 HTTP 报文里的 URI、主机名、资源类型等数据，再用适当的策略转发给后端服务器。")]),t._v(" "),_("h4",{attrs:{id:"tcp-ip-协议栈的工作方式"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#tcp-ip-协议栈的工作方式"}},[t._v("#")]),t._v(" TCP/IP 协议栈的工作方式")]),t._v(" "),_("blockquote",[_("p",[t._v("TCP/IP 协议栈是如何工作的呢？")])]),t._v(" "),_("p",[_("strong",[t._v("HTTP 协议的传输过程通过协议栈逐层向下，每一层都添加本层的专有数据，层层打包，然后通过下层发送出去。")])]),t._v(" "),_("p",[_("strong",[t._v("接收数据则是相反的操作，从下往上穿过协议栈，逐层拆包，每层去掉本层的专有头，上层就会拿到自己的数据。")])]),t._v(" "),_("p",[t._v("但下层的传输过程对于上层是完全“透明”的，上层也不需要关心下层的具体实现细节，所以就 HTTP 层次来看，它不管下层是不是 TCP/IP 协议，看到的只是一个可靠的传输链路，只要把数据加上自己的头，对方就能原样收到。")]),t._v(" "),_("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/tcp001.png"),width:"auto"}}),t._v(" "),_("h3",{attrs:{id:"dns"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#dns"}},[t._v("#")]),t._v(" DNS")]),t._v(" "),_("blockquote",[_("p",[t._v("在 TCP/IP 协议中使用 IP 地址来标识计算机，数字形式的地址对于计算机来说是方便了，但对于人类来说却既难以记忆又难以输入。")])]),t._v(" "),_("p",[t._v("于是域名系统（"),_("strong",[t._v("Domain Name System")]),t._v("）出现了，用有意义的名字来作为 IP 地址的等价替代。")]),t._v(" "),_("p",[t._v("在 DNS 中，“域名”（Domain Name）又称为“主机名”（Host）。"),_("strong",[t._v("域名用“.”分隔成多个单词，级别从左到右逐级升高，最右边的被称为“顶级域名”")]),t._v("。顶级域名有表示商业公司的“com”、表示教育机构的“edu”，表示国家的“cn”“uk”等。")]),t._v(" "),_("p",[t._v("但想要使用 TCP/IP 协议来通信仍然要使用 IP 地址，所以需要把域名做一个转换，“映射”到它的真实 IP，这就是所谓的"),_("strong",[t._v("域名解析")]),t._v("。")]),t._v(" "),_("blockquote",[_("p",[t._v("HTTP 协议中并没有明确要求必须使用 DNS，但实际上为了方便访问互联网上的 Web 服务器，通常都会使用 DNS 来定位或标记主机名，间接地把 DNS 与 HTTP 绑在了一起。")])]),t._v(" "),_("h4",{attrs:{id:"域名的形式"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#域名的形式"}},[t._v("#")]),t._v(" 域名的形式")]),t._v(" "),_("blockquote",[_("p",[t._v("域名是一个有层次的结构，是一串用“.”分隔的多个单词，最右边的被称为“顶级域名”，然后是“二级域名”，层级关系向左依次降低。")])]),t._v(" "),_("p",[t._v("最左边的是主机名，通常用来表明主机的用途，比如“www”表示提供万维网服务、“mail”表示提供邮件服务，不过这也不是绝对的，名字的关键是要让我们容易记忆。")]),t._v(" "),_("blockquote",[_("p",[t._v("看一下极客时间的域名"),_("code",[t._v("time.geekbang.org")]),t._v("，这里的"),_("code",[t._v("org")]),t._v("就是顶级域名，"),_("code",[t._v("geekbang")]),t._v("是二级域名，"),_("code",[t._v("time")]),t._v("则是主机名。使用这个域名，DNS 就会把它转换成相应的 IP 地址，你就可以访问极客时间的网站了。")])]),t._v(" "),_("blockquote",[_("p",[t._v("在 Apache、Nginx 这样的 Web 服务器里，域名可以用来标识虚拟主机，决定由哪个虚拟主机来对外提供服务，比如在 Nginx 里就会使用“server_name”指令：")])]),t._v(" "),_("div",{staticClass:"language-shell extra-class"},[_("pre",{pre:!0,attrs:{class:"language-shell"}},[_("code",[t._v("server "),_("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    listen "),_("span",{pre:!0,attrs:{class:"token number"}},[t._v("80")]),_("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("                       "),_("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#监听80端口")]),t._v("\n    server_name  time.geekbang.org"),_("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  "),_("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#主机名是time.geekbang.org")]),t._v("\n    "),_("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("..")]),t._v(".\n"),_("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),_("p",[t._v("域名本质上还是个名字空间系统，使用多级域名就可以划分出不同的国家、地区、组织、公司、部门，每个域名都是独一无二的，可以作为一种身份的标识。")]),t._v(" "),_("h4",{attrs:{id:"域名的解析"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#域名的解析"}},[t._v("#")]),t._v(" 域名的解析")]),t._v(" "),_("p",[t._v("就像 IP 地址必须转换成 MAC 地址才能访问主机一样，域名也必须要转换成 IP 地址，这个过程就是"),_("strong",[t._v("域名解析")]),t._v("。")]),t._v(" "),_("p",[t._v("DNS 的核心系统是一个三层的树状、分布式服务，基本对应域名的结构：")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",{staticClass:"custom-block-title"},[t._v("提示")]),t._v(" "),_("ol",[_("li",[t._v("根域名服务器（Root DNS Server）：管理顶级域名服务器，返回“com”“net”“cn”等顶级域名服务器的 IP 地址；")]),t._v(" "),_("li",[t._v("顶级域名服务器（Top-level DNS Server）：管理各自域名下的权威域名服务器，比如 com 顶级域名服务器可以返回 apple.com 域名服务器的 IP 地址；")]),t._v(" "),_("li",[t._v("权威域名服务器（Authoritative DNS Server）：管理自己域名下主机的 IP 地址，比如 apple.com 权威域名服务器可以返回 www.apple.com 的 IP 地址。")])])]),t._v(" "),_("p",[t._v("例如，你要访问“www.apple.com”，就要进行下面的三次查询：")]),t._v(" "),_("ol",[_("li",[t._v("访问根域名服务器，它会告诉你“com”顶级域名服务器的地址；")]),t._v(" "),_("li",[t._v("访问“com”顶级域名服务器，它再告诉你“apple.com”域名服务器的地址；")]),t._v(" "),_("li",[t._v("最后访问“apple.com”域名服务器，就得到了“www.apple.com”的地址。")])]),t._v(" "),_("blockquote",[_("p",[t._v("虽然核心的 DNS 系统遍布全球，服务能力很强也很稳定，但如果全世界的网民都往这个系统里挤，即使不挤瘫痪了，访问速度也会很慢。所以在核心 DNS 系统之外，还有两种手段用来减轻域名解析的压力，并且能够更快地获取结果，基本思路就是“缓存”。")])]),t._v(" "),_("ul",[_("li",[t._v("非权威域名服务器缓存")])]),t._v(" "),_("p",[t._v("许多大公司、网络运行商都会建立自己的 DNS 服务器，作为用户 DNS 查询的代理，代替用户访问核心 DNS 系统。这些“野生”服务器被称为“非权威域名服务器”，可以缓存之前的查询结果，如果已经有了记录，就无需再向根服务器发起查询，直接返回对应的 IP 地址。")]),t._v(" "),_("blockquote",[_("p",[t._v("这些 DNS 服务器的数量要比核心系统的服务器多很多，而且大多部署在离用户很近的地方。比较知名的 DNS 有 Google 的“8.8.8.8”，Microsoft 的“4.2.2.1”，还有 CloudFlare 的“1.1.1.1”等等。")])]),t._v(" "),_("ul",[_("li",[t._v("操作系统缓存")])]),t._v(" "),_("p",[t._v("操作系统里也会对 DNS 解析结果做缓存，如果你之前访问过“www.apple.com”，那么下一次在浏览器里再输入这个网址的时候就不会再跑到 DNS 那里去问了，直接在操作系统里就可以拿到 IP 地址。")]),t._v(" "),_("blockquote",[_("p",[t._v("另外，操作系统里还有一个特殊的“主机映射”文件，通常是一个可编辑的文本，在 Linux 里是“/etc/hosts”，在 Windows 里是“C:\\WINDOWS\\system32\\drivers\\etc\\hosts”，如果操作系统在缓存里找不到 DNS 记录，就会找这个文件。")])]),t._v(" "),_("p",[t._v("浏览器输入一个域名，完整的解析流程：")]),t._v(" "),_("p",[_("strong",[t._v("浏览器缓存 -> 操作系统缓存 -> hosts文件 -> 非权威域名服务器 -> 根域名服务器 -> 顶级域名服务器 -> 二级域名服务器 -> 权威域名服务器。")])]),t._v(" "),_("blockquote",[_("p",[t._v("其中非权威域名服务器还包括LDNS（企业内网DNS服务器），三大营运商DNS，谷歌公开的DNS，微软公开的DNS等。")])]),t._v(" "),_("blockquote",[_("p",[t._v("DNS请求有两种方式：递归查询和迭代查询。LDNS往后面查询一般是递归查询，因为公司内网是有防火墙的，全部请求通过LDNS来递归查询然后把结果给内网用户。")])]),t._v(" "),_("h4",{attrs:{id:"域名的-新玩法"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#域名的-新玩法"}},[t._v("#")]),t._v(" 域名的“新玩法”")]),t._v(" "),_("ul",[_("li",[_("p",[t._v("重定向：因为域名代替了 IP 地址，所以可以让对外服务的域名不变，而主机的 IP 地址任意变动。当主机有情况需要下线、迁移时，可以更改 DNS 记录，让域名指向其他的机器；这样就可以保证业务服务不中断。")])]),t._v(" "),_("li",[_("p",[t._v("因为域名是一个名字空间，所以可以使用 bind9 等开源软件搭建一个在内部使用的 DNS，作为名字服务器。这样我们开发的各种内部服务就都用域名来标记，比如数据库服务都用域名“mysql.inner.app”，商品服务都用“goods.inner.app”，发起网络通信时也就不必再使用写死的 IP 地址了，可以直接用域名。")])]),t._v(" "),_("li",[_("p",[t._v("基于域名实现的负载均衡")]),t._v(" "),_("ul",[_("li",[t._v("因为域名解析可以返回多个 IP 地址，所以一个域名可以对应多台主机，客户端收到多个 IP 地址后，就可以自己使用轮询算法依次向服务器发起请求，实现负载均衡。")]),t._v(" "),_("li",[t._v("域名解析可以配置内部的策略，返回离客户端最近的主机，或者返回当前服务质量最好的主机，这样在 DNS 端把请求分发到不同的服务器，实现负载均衡。")])])])]),t._v(" "),_("blockquote",[_("p",[t._v("一些恶意的DNS:")])]),t._v(" "),_("ul",[_("li",[t._v("“域名屏蔽”，对域名直接不解析，返回错误，让你无法拿到 IP 地址，也就无法访问网站；")]),t._v(" "),_("li",[t._v("“域名劫持”，也叫“域名污染”，你要访问 A 网站，但 DNS 给了你 B 网站")])]),t._v(" "),_("h3",{attrs:{id:"uri-url"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#uri-url"}},[t._v("#")]),t._v(" URI/URL")]),t._v(" "),_("blockquote",[_("p",[t._v("DNS 和 IP 地址只是标记了互联网上的主机，但主机上有那么多文本、图片、页面，到底要找哪一个呢？")])]),t._v(" "),_("p",[t._v("所以就出现了 "),_("strong",[t._v("URI（Uniform Resource Identifier）")]),t._v("，中文名称是"),_("strong",[t._v("统一资源标识符")]),t._v("，使用它就能够唯一地标记互联网上资源。")]),t._v(" "),_("h4",{attrs:{id:"url-uri-urn三者区别"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#url-uri-urn三者区别"}},[t._v("#")]),t._v(" URL/URI/URN三者区别")]),t._v(" "),_("p",[t._v("URI 另一个更常用的表现形式是"),_("strong",[t._v("URL（Uniform Resource Locator）， 统一资源定位符")]),t._v("，也就是我们俗称的“网址”，"),_("strong",[t._v("它实际上是 URI 的一个子集")]),t._v("，不过因为这两者几乎是相同的，差异不大，所以通常不会做严格的区分。")]),t._v(" "),_("p",[t._v("URI 它包含有 URL 和 "),_("strong",[t._v("URN")]),t._v(" 两个部分，URN（Uniform Resource Name），"),_("strong",[t._v("统一资源名称")]),t._v("，用特定命名空间的名字标识资源。使用 URN 可以在不知道其网络位置及访问方式的情况下讨论资源。")]),t._v(" "),_("blockquote",[_("p",[t._v("URI 不仅能够标记万维网的资源，也可以标记其他的，如邮件系统、本地文件系统等任意资源。而“资源”既可以是存在磁盘上的静态文本、页面数据，也可以是由 Java、PHP 提供的动态服务。")])]),t._v(" "),_("ul",[_("li",[t._v("区别：")])]),t._v(" "),_("div",{staticClass:"language-shell extra-class"},[_("pre",{pre:!0,attrs:{class:"language-shell"}},[_("code",[t._v("http://bitpoetry.io/posts/hello.html"),_("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#intro")]),t._v("\n")])])]),_("blockquote",[_("p",[_("code",[t._v("http://")]),t._v("：定义如何访问资源的方式；"),_("code",[t._v("bitpoetry.io/posts/hello.html")]),t._v("：资源存放的位置；"),_("code",[t._v("#intro")]),t._v("：资源")])]),t._v(" "),_("p",[_("code",[t._v("http://bitpoetry.io/posts/hello.html")]),t._v("：URL，告诉我们访问网络位置的方式。")]),t._v(" "),_("p",[_("code",[t._v("bitpoetry.io/posts/hello.html#intro")]),t._v("：URN，包括名字（给定的命名空间内），但是不包括访问方式。")]),t._v(" "),_("h4",{attrs:{id:"uri-的格式"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#uri-的格式"}},[t._v("#")]),t._v(" URI 的格式")]),t._v(" "),_("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/http104.png"),width:"auto"}}),t._v(" "),_("ul",[_("li",[_("strong",[t._v("scheme")])])]),t._v(" "),_("p",[t._v("URI 第一个组成部分叫"),_("strong",[t._v("scheme")]),t._v("，翻译成中文叫方案名或者"),_("strong",[t._v("协议名")]),t._v("，表示资源应该使用哪种协议来访问。")]),t._v(" "),_("blockquote",[_("p",[t._v("最常见的当然就是“http”了，表示使用 HTTP 协议。另外还有“https”，表示使用经过加密、安全的 HTTPS 协议。此外还有其他不是很常见的 scheme，例如 ftp、ldap、file、news 等。")])]),t._v(" "),_("p",[t._v("在 scheme 之后，必须是三个特定的字符"),_("code",[t._v("://")]),t._v("，它把 scheme 和后面的部分分离开。")]),t._v(" "),_("ul",[_("li",[_("code",[t._v("user:passwd@")])])]),t._v(" "),_("blockquote",[_("p",[t._v("身份信息，表示登录主机时的用户名和密码，但现在已经不推荐使用这种形式了（RFC7230），因为它把敏感信息以明文形式暴露出来，存在严重的安全隐患。")])]),t._v(" "),_("ul",[_("li",[_("strong",[_("code",[t._v("host:port")])])])]),t._v(" "),_("p",[t._v("在"),_("code",[t._v("://")]),t._v("之后，是被称为 authority 的部分，表示资源所在的主机名，通常的形式是"),_("code",[t._v("host:port")]),t._v("，即主机名加端口号。")]),t._v(" "),_("blockquote",[_("p",[t._v("主机名可以是 IP 地址或者域名的形式，必须要有，否则浏览器就会找不到服务器。但端口号有时可以省略，浏览器等客户端会依据 scheme 使用默认的端口号，例如 HTTP 的默认端口号是 80，HTTPS 的默认端口号是 443。")])]),t._v(" "),_("ul",[_("li",[_("strong",[t._v("path")])])]),t._v(" "),_("blockquote",[_("p",[t._v("path，用于标记资源所在位置。")])]),t._v(" "),_("p",[t._v("URI 里 path 采用了类似文件系统“目录”“路径”的表示方式，因为早期互联网上的计算机多是 UNIX 系统，所以采用了 UNIX 的"),_("code",[t._v("/")]),t._v("风格。URI 的 path 部分必须以"),_("code",[t._v("/")]),t._v("开始，也就是必须包含"),_("code",[t._v("/")]),t._v("。")]),t._v(" "),_("ul",[_("li",[_("strong",[t._v("URI 的查询参数："),_("code",[t._v("query")])])])]),t._v(" "),_("blockquote",[_("p",[t._v("使用“协议名 + 主机名 + 路径”的方式，已经可以精确定位网络上的任何资源了。但这还不够，很多时候我们还想在操作资源的时候附加一些额外的修饰参数。")])]),t._v(" "),_("p",[t._v("URI 后面还有一个"),_("strong",[t._v("query")]),t._v("部分，它在 path 之后，用一个"),_("code",[t._v("?")]),t._v("开始，但不包含?，表示对资源附加的额外要求。")]),t._v(" "),_("blockquote",[_("p",[t._v("查询参数 query 有一套自己的格式，是多个“key=value”的字符串，这些 KV 值用字符“&”连接，浏览器和服务器都可以按照这个格式把长串的查询参数解析成可理解的字典或关联数组形式。")])]),t._v(" "),_("ul",[_("li",[_("code",[t._v("#fragment")])])]),t._v(" "),_("p",[t._v("查询参数后的"),_("strong",[t._v("片段标识符")]),t._v("，它是 URI 所定位的资源内部的一个“锚点”或者说是“标签”，浏览器可以在获取资源后直接跳转到它指示的位置。")]),t._v(" "),_("p",[_("strong",[t._v("看个例子：")])]),t._v(" "),_("div",{staticClass:"language-shell extra-class"},[_("pre",{pre:!0,attrs:{class:"language-shell"}},[_("code",[t._v("http://www.chrono.com:8080/file/url?uid"),_("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),_("span",{pre:!0,attrs:{class:"token number"}},[t._v("1234")]),_("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&")]),_("span",{pre:!0,attrs:{class:"token assign-left variable"}},[t._v("name")]),_("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v("mario"),_("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&")]),_("span",{pre:!0,attrs:{class:"token assign-left variable"}},[t._v("referer")]),_("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v("xxx"),_("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#head")]),t._v("\n"),_("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# http:// 协议名")]),t._v("\n"),_("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# www.chrono.com:8080   主机名+端口号")]),t._v("\n"),_("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# /file/url  路径")]),t._v("\n"),_("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# ?uid=1234&name=mario&referer=xxx  查询参数")]),t._v("\n"),_("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# #head   片段标识符")]),t._v("\n")])])]),_("h4",{attrs:{id:"uri的编码"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#uri的编码"}},[t._v("#")]),t._v(" URI的编码")]),t._v(" "),_("p",[t._v("URI 引入了编码机制，对于 ASCII 码以外的字符集和特殊字符做一个特殊的操作，把它们转换成与 URI 语义不冲突的形式。")]),t._v(" "),_("p",[t._v("URI 转义的规则："),_("strong",[t._v("把字符（unicode）编码成utf-8，utf-8是用1-4个字节表示的，所以每个字节转换成16进制并在前面用百分号（%）连接，最后并把每个字节转换的结果连接起来")]),t._v("。")]),t._v(" "),_("blockquote",[_("p",[t._v("例如，空格被转义成“%20”，“?”被转义成“%3F”。而中文、日文等则通常使用 UTF-8 编码后再转义，例如“银河”会被转义成“%E9%93%B6%E6%B2%B3”。")])]),t._v(" "),_("h3",{attrs:{id:"https"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#https"}},[t._v("#")]),t._v(" HTTPS")]),t._v(" "),_("blockquote",[_("p",[t._v("在 TCP/IP、DNS 和 URI 的“加持”之下，HTTP 协议终于可以自由地穿梭在互联网世界里，顺利地访问任意的网页了；但还存在传输内容会被窃听的风险。")])]),t._v(" "),_("p",[t._v("HTTPS 的全称是“HTTP over SSL/TLS”，也就是"),_("strong",[t._v("运行在 SSL/TLS 协议上的 HTTP")]),t._v("。HTTPS 相当于"),_("strong",[t._v("HTTP+SSL/TLS+TCP/IP")]),t._v("。")]),t._v(" "),_("p",[t._v("SSL/TLS 是一个负责加密通信的安全协议，建立在 TCP/IP 之上，所以也是个可靠的传输协议，可以被用作 HTTP 的下层。")]),t._v(" "),_("p",[t._v("SSL 的全称是"),_("strong",[t._v("Secure Socket Layer")]),t._v("，由网景公司发明，当发展到 3.0 时被标准化，改名为 TLS，即“Transport Layer Security”，但由于历史的原因还是有很多人称之为 SSL/TLS，或者直接简称为 SSL。")]),t._v(" "),_("blockquote",[_("p",[t._v("SSL 使用了许多密码学最先进的研究成果，综合了对称加密、非对称加密、摘要算法、数字签名、数字证书等技术，能够在不安全的环境中为通信的双方创建出一个秘密的、安全的传输通道，为 HTTP 套上一副坚固的盔甲。")])]),t._v(" "),_("h3",{attrs:{id:"代理"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#代理"}},[t._v("#")]),t._v(" 代理")]),t._v(" "),_("p",[t._v("代理（Proxy）是 HTTP 协议中请求方和应答方中间的一个环节，作为“中转站”，既可以转发客户端的请求，也可以转发服务器的应答。")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",{staticClass:"custom-block-title"},[t._v("分类：")]),t._v(" "),_("ol",[_("li",[t._v("匿名代理：完全“隐匿”了被代理的机器，外界看到的只是代理服务器；")]),t._v(" "),_("li",[t._v("透明代理：顾名思义，它在传输过程中是“透明开放”的，外界既知道代理，也知道客户端；")]),t._v(" "),_("li",[t._v("正向代理：靠近客户端，代表客户端向服务器发送请求；")]),t._v(" "),_("li",[t._v("反向代理：靠近服务器端，代表服务器响应客户端的请求；")])])]),t._v(" "),_("blockquote",[_("p",[t._v("CDN 实际上就是一种代理，它代替源站服务器响应客户端的请求，通常扮演着透明代理和反向代理的角色。")])]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",{staticClass:"custom-block-title"},[t._v("代理可以实现：")]),t._v(" "),_("ul",[_("li",[t._v("负载均衡：把访问请求均匀分散到多台机器，实现访问集群化；")]),t._v(" "),_("li",[t._v("内容缓存：暂存上下行的数据，减轻后端的压力；")]),t._v(" "),_("li",[t._v("安全防护：隐匿 IP, 使用 WAF 等工具抵御网络攻击，保护被代理的机器；")]),t._v(" "),_("li",[t._v("数据处理：提供压缩、加密等额外的功能。")])])]),t._v(" "),_("h2",{attrs:{id:"问题记录"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#问题记录"}},[t._v("#")]),t._v(" 问题记录")]),t._v(" "),_("ol",[_("li",[t._v("你能用自己的话解释一下“二层转发”“三层路由”吗？")])]),t._v(" "),_("ul",[_("li",[t._v("二层转发：二层应该指数据链路层，工作在二层的设备，通过查找到目标MAC地址，进行数据转发")]),t._v(" "),_("li",[t._v("三层路由：三层应该指网络层，设备工作在ip层，报文经过有路由功能的设备时，设备分析报文中的头部信息，拿到ip地址，根据网段范围，进行本地转发或选择下一个网关")])]),t._v(" "),_("ol",{attrs:{start:"2"}},[_("li",[t._v("DNS 与 URI 有什么关系？")])]),t._v(" "),_("blockquote",[_("p",[t._v("DNS 是将域名解析出真实IP地址的系统；URI 是统一资源标识符，标定了客户端需要访问的资源所处的位置，如果URI中的主机名使用域名，则需要使用DNS来将域名解析为IP。")])]),t._v(" "),_("ol",{attrs:{start:"3"}},[_("li",[t._v("在讲代理时我特意没有举例说明，你能够用引入一个“小明”的角色，通过打电话来比喻一下吗？")])]),t._v(" "),_("ul",[_("li",[t._v("小强给小明打电话要小红的照片：小明是正向代理；")]),t._v(" "),_("li",[t._v("小强找小红要她的照片，小明负责给：小明是反向代理")])]),t._v(" "),_("ol",{attrs:{start:"4"}},[_("li",[t._v("你觉得 CDN 在对待浏览器和爬虫时会有差异吗？为什么？")])]),t._v(" "),_("blockquote",[_("p",[t._v("CDN 应当是不区分的，因为爬虫本身也是对 Web 资源的访问，且对于爬虫识别并不是 100% 准确的，因此 CDN 只会去计算实际使用了多少资源而不管其中多少来自爬虫；")])]),t._v(" "),_("ol",{attrs:{start:"5"}},[_("li",[t._v("你怎么理解 Web Service 与 Web Server 这两个非常相似的词？")])]),t._v(" "),_("blockquote",[_("p",[t._v("Web Service 是网络服务实体，而 Web Server 是网络服务器；WebService是基于Web（HTTP）的服务器架构技术，基于HTTP协议传输xml或soap数据。WebServer分硬件和软件，硬件指服务器、云之类，软件如Nginx、Apache等")])]),t._v(" "),_("fix-link",{attrs:{label:"Back",href:"/tool/http/"}})],1)}),[],!1,null,null,null);v.default=s.exports}}]);
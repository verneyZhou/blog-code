(window.webpackJsonp=window.webpackJsonp||[]).push([[166],{755:function(t,v,_){"use strict";_.r(v);var T=_(8),s=Object(T.a)({},(function(){var t=this,v=t.$createElement,_=t._self._c||v;return _("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[_("h1",{attrs:{id:"什么是http"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#什么是http"}},[t._v("#")]),t._v(" 什么是HTTP?")]),t._v(" "),_("blockquote",[_("p",[t._v("HTTP（HyperText Transfer Protocol），"),_("strong",[t._v("超文本传输协议")]),t._v("。")])]),t._v(" "),_("h2",{attrs:{id:"协议"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#协议"}},[t._v("#")]),t._v(" 协议")]),t._v(" "),_("blockquote",[_("p",[t._v("首先，HTTP 是一个协议。不过，协议又是什么呢？")])]),t._v(" "),_("p",[t._v("其实“协议”并不仅限于计算机世界，现实生活中也随处可见。例如，你在刚毕业时会签一个“三方协议”，找房子时会签一个“租房协议”，公司入职时还可能会签一个“保密协议”，工作中使用的各种软件也都带着各自的“许可协议”。")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",{staticClass:"custom-block-title"},[t._v("协议的特点：")]),t._v(" "),_("ol",[_("li",[t._v("协议必须要有两个或多个参与者，也就是“协”。")]),t._v(" "),_("li",[t._v("协议是对参与者的一种行为约定和规范，也就是“议”。")])])]),t._v(" "),_("blockquote",[_("p",[t._v("协议意味着有多个参与者为了达成某个共同的目的而站在了一起，除了要无疑义地沟通交流之外，还必须明确地规定各方的“责、权、利”，约定该做什么不该做什么，先做什么后做什么，做错了怎么办，有没有补救措施等等。")])]),t._v(" "),_("p",[_("strong",[t._v("HTTP的第一层含义")]),t._v("：HTTP 是一个用在计算机世界里的协议。它使用计算机能够理解的语言确立了一种计算机之间交流通信的规范，以及相关的各种控制和错误处理方式。")]),t._v(" "),_("h2",{attrs:{id:"传输"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#传输"}},[t._v("#")]),t._v(" 传输")]),t._v(" "),_("blockquote",[_("p",[t._v("接下来我们看 HTTP 字面里的第二部分：“传输”。")])]),t._v(" "),_("blockquote",[_("p",[t._v("计算机和网络世界里有数不清的各种角色：CPU、内存、总线、磁盘、操作系统、浏览器、网关、服务器……这些角色之间相互通信也必然会有各式各样、五花八门的协议，用处也各不相同，例如广播协议、寻址协议、路由协议、隧道协议、选举协议等等。")])]),t._v(" "),_("p",[t._v("HTTP 是一个“传输协议”，所谓的“传输”（Transfer）其实很好理解，就是把一堆东西从 A 点搬到 B 点，或者从 B 点搬到 A 点，即“A<===>B”。")]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",{staticClass:"custom-block-title"},[t._v("特点")]),t._v(" "),_("ol",[_("li",[_("strong",[t._v("HTTP 协议是一个“双向协议”")]),t._v("：通常我们把先发起传输动作的 A 叫做"),_("strong",[t._v("请求方")]),t._v("，把后接到传输的 B 叫做应答方或者"),_("strong",[t._v("响应方")]),t._v("，数据在 A 和 B 之间双向而不是单向流动。")]),t._v(" "),_("li",[_("strong",[t._v("数据虽然是在 A 和 B 之间传输，但并没有限制只有 A 和 B 这两个角色，允许中间有“中转”或者“接力”")]),t._v("：A 到 B 的传输过程中可以存在任意多个“中间人”，而这些中间人也都遵从 HTTP 协议，只要不打扰基本的数据传输，就可以添加任意的额外功能，例如安全认证、数据压缩、编码转换等等，优化整个传输过程。")])])]),t._v(" "),_("p",[_("strong",[t._v("HTTP的第二层含义")]),t._v("：HTTP 是一个在计算机世界里专门用来在两点之间传输数据的约定和规范。")]),t._v(" "),_("h2",{attrs:{id:"超文本"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#超文本"}},[t._v("#")]),t._v(" 超文本")]),t._v(" "),_("blockquote",[_("p",[t._v("讲完了“协议”和“传输”，现在，我们终于到 HTTP 字面里的第三部分：“超文本”。")])]),t._v(" "),_("p",[t._v("所谓“文本”（Text），就表示 HTTP 传输的不是 TCP/UDP 这些底层协议里被切分的杂乱无章的二进制包（datagram），而是完整的、有意义的数据，可以被浏览器、服务器这样的上层应用程序处理。")]),t._v(" "),_("blockquote",[_("p",[t._v("在互联网早期，“文本”只是简单的字符文字，但发展到现在，“文本”的涵义已经被大大地扩展了，图片、音频、视频、甚至是压缩包，在 HTTP 眼里都可以算做是“文本”。")])]),t._v(" "),_("p",[t._v("所谓“超文本”，就是“超越了普通文本的文本”，它是文字、图片、音频和视频等的混合体，最关键的是含有“超链接”，能够从一个“超文本”跳跃到另一个“超文本”，形成复杂的非线性、网状的结构关系。")]),t._v(" "),_("blockquote",[_("p",[t._v("对于“超文本”，我们最熟悉的就应该是 HTML 了，它本身只是纯文字文件，但内部用很多标签定义了对图片、音频、视频等的链接，再经过浏览器的解释，呈现在我们面前的就是一个含有多种视听信息的页面。")])]),t._v(" "),_("div",{staticClass:"custom-block tip"},[_("p",{staticClass:"custom-block-title"},[t._v("总结：HTTP是什么？")]),t._v(" "),_("p",[t._v("HTTP 是一个在计算机世界里专门在两点之间传输文字、图片、音频、视频等超文本数据的约定和规范。")])]),t._v(" "),_("h2",{attrs:{id:"http不是什么"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http不是什么"}},[t._v("#")]),t._v(" HTTP不是什么？")]),t._v(" "),_("ul",[_("li",[t._v("HTTP 不是互联网")])]),t._v(" "),_("blockquote",[_("p",[t._v("互联网（Internet）是遍布于全球的许多网络互相连接而形成的一个巨大的国际网络，在它上面存放着各式各样的资源，也对应着各式各样的协议，例如超文本资源使用 HTTP，普通文件使用 FTP，电子邮件使用 SMTP 和 POP3 等。但 HTTP 是构建互联网的一块重要拼图，而且是占比最大的那一块。")])]),t._v(" "),_("ul",[_("li",[t._v("HTTP 不是编程语言")])]),t._v(" "),_("blockquote",[_("p",[_("strong",[t._v("编程语言是人与计算机沟通交流所使用的语言，而 HTTP 是计算机与计算机沟通交流的语言")]),t._v("。我们无法使用 HTTP 来编程，但可以反过来，用编程语言去实现 HTTP，告诉计算机如何用 HTTP 来与外界通信。")])]),t._v(" "),_("blockquote",[_("p",[t._v("很多流行的编程语言都支持编写 HTTP 相关的服务或应用，例如使用 Java 在 Tomcat 里编写 Web 服务，使用 PHP 在后端实现页面模板渲染，使用 JavaScript 在前端实现动态页面更新。")])]),t._v(" "),_("ul",[_("li",[t._v("HTTP 不是 HTML")])]),t._v(" "),_("blockquote",[_("p",[t._v("HTML 是超文本的载体，是一种标记语言，使用各种标签描述文字、图片、超链接等资源，并且可以嵌入 CSS、JavaScript 等技术实现复杂的动态效果。单论次数，在互联网上 HTTP 传输最多的可能就是 HTML，但要是论数据量，HTML 可能要往后排了，图片、音频、视频这些类型的资源显然更大。")])]),t._v(" "),_("ul",[_("li",[t._v("HTTP 不是一个孤立的协议")])]),t._v(" "),_("blockquote",[_("p",[t._v("在互联网世界里，HTTP 通常跑在 TCP/IP 协议栈之上，依靠 IP 协议实现寻址和路由、TCP 协议实现可靠数据传输、DNS 协议实现域名查找、SSL/TLS 协议实现安全通信。此外，还有一些协议依赖于 HTTP，例如 WebSocket、HTTPDNS 等。这些协议相互交织，构成了一个协议网，而 HTTP 则处于中心地位。")])]),t._v(" "),_("fix-link",{attrs:{label:"Back",href:"/tool/http/"}})],1)}),[],!1,null,null,null);v.default=s.exports}}]);
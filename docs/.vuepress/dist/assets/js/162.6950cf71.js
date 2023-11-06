(window.webpackJsonp=window.webpackJsonp||[]).push([[162],{766:function(t,s,a){"use strict";a.r(s);var e=a(8),_=Object(e.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"https"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#https"}},[t._v("#")]),t._v(" HTTPS")]),t._v(" "),a("p",[a("a",{attrs:{href:"./detail"}},[t._v("HTTP详解")]),t._v("讲过 HTTP 的一些缺点，其中的“无状态”在加入 Cookie 后得到了解决，而另两个缺点——“明文”和“不安全”仅凭 HTTP 自身是无力解决的，需要引入新的 HTTPS 协议。")]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("什么样的通信过程才是安全的呢？")])])]),t._v(" "),a("p",[t._v("如果通信过程具备了四个特性，就可以认为是“安全”的，这四个特性是："),a("strong",[t._v("机密性、完整性，身份认证和不可否认")]),t._v("。")]),t._v(" "),a("div",{staticClass:"custom-block tip"},[a("p",{staticClass:"custom-block-title"},[t._v("提示")]),t._v(" "),a("ul",[a("li",[t._v("机密性（Secrecy/Confidentiality）是指对数据的“保密”，只能由可信的人访问，对其他人是不可见的“秘密”。")]),t._v(" "),a("li",[t._v("完整性（Integrity，也叫一致性）是指数据在传输过程中没有被篡改，“完完整整”地保持着原状。")]),t._v(" "),a("li",[t._v("身份认证（Authentication）是指确认对方的真实身份，也就是“证明你真的是你”，保证消息只能发送给可信的人。")]),t._v(" "),a("li",[t._v("不可否认（Non-repudiation/Undeniable），也叫不可抵赖，意思是不能否认已经发生过的行为。")])])]),t._v(" "),a("h2",{attrs:{id:"https介绍"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#https介绍"}},[t._v("#")]),t._v(" HTTPS介绍")]),t._v(" "),a("p",[t._v("HTTPS 其实是一个“非常简单”的协议，RFC 文档很小，只有短短的 7 页，里面规定了新的协议名“https”，默认端口号 443，至于其他的什么请求 - 应答模式、报文结构、请求方法、URI、头字段、连接管理等等都完全沿用 HTTP，没有任何新的东西。")]),t._v(" "),a("p",[t._v("HTTPS 与 HTTP 最大的区别，它能够鉴别危险的网站，并且尽最大可能保证你的上网安全，防御黑客对信息的窃听、篡改或者“钓鱼”、伪造。")]),t._v(" "),a("p",[t._v("HTTPS 名字里的“S”，它把 HTTP 下层的传输协议由 TCP/IP 换成了 "),a("strong",[t._v("SSL/TLS")]),t._v("，由“HTTP over TCP/IP”变成了 "),a("strong",[t._v("HTTP over SSL/TLS")]),t._v(" ，让 HTTP 运行在了安全的 SSL/TLS 协议上。")]),t._v(" "),a("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/https101.png"),width:"auto"}}),t._v(" "),a("h3",{attrs:{id:"加密"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#加密"}},[t._v("#")]),t._v(" 加密")]),t._v(" "),a("p",[t._v("实现机密性最常用的手段是"),a("strong",[t._v("加密")]),t._v("（encrypt），就是把消息用某种方式转换成谁也看不懂的乱码，只有掌握特殊“钥匙”的人才能再转换出原始文本。")]),t._v(" "),a("p",[t._v("这里的“钥匙”就叫做"),a("strong",[t._v("密钥")]),t._v("（key），加密前的消息叫"),a("strong",[t._v("明文")]),t._v("（plain text/clear text），加密后的乱码叫"),a("strong",[t._v("密文")]),t._v("（cipher text），使用密钥还原明文的过程叫"),a("strong",[t._v("解密")]),t._v("（decrypt），是加密的反操作，加密解密的操作过程就是"),a("strong",[t._v("加密算法")]),t._v("。")]),t._v(" "),a("h4",{attrs:{id:"对称加密"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#对称加密"}},[t._v("#")]),t._v(" 对称加密")]),t._v(" "),a("p",[t._v("指加密和解密时使用的密钥都是同一个，是“对称”的。只要保证了密钥的安全，那整个通信过程就可以说具有了机密性。")]),t._v(" "),a("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/https102.png"),width:"auto"}}),t._v(" "),a("p",[t._v("TLS 里常用的对称加密算法有 AES 和 ChaCha20：")]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("AES")]),t._v(" 的意思是"),a("strong",[t._v("高级加密标准")]),t._v("（Advanced Encryption Standard），密钥长度可以是 128、192 或 256。它安全强度很高，性能也很好，而且有的硬件还会做特殊优化，所以非常流行，是应用最广泛的对称加密算法。")]),t._v(" "),a("li",[a("strong",[t._v("ChaCha20")]),t._v(" 是 Google 设计的另一种加密算法，密钥长度固定为 256 位，纯软件运行性能要超过 AES，曾经在移动客户端上比较流行，算得上是一个不错的算法。")])]),t._v(" "),a("p",[a("strong",[t._v("加密分组模式")])]),t._v(" "),a("p",[t._v("对称算法还有一个“分组模式”的概念，它可以让算法用固定长度的密钥加密任意长度的明文，把小秘密（即密钥）转化为大秘密（即密文）。")]),t._v(" "),a("blockquote",[a("p",[t._v("最新的分组模式被称为 AEAD（Authenticated Encryption with Associated Data），在加密的同时增加了认证的功能，常用的是 GCM、CCM 和 Poly1305。")])]),t._v(" "),a("p",[t._v("把上面这些组合起来，就可以得到 TLS 密码套件中定义的对称加密算法：")]),t._v(" "),a("blockquote",[a("p",[t._v("AES128-GCM，意思是密钥长度为 128 位的 AES 算法，使用的分组模式是 GCM；ChaCha20-Poly1305 的意思是 ChaCha20 算法，使用的分组模式是 Poly1305。")])]),t._v(" "),a("h4",{attrs:{id:"非对称加密"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#非对称加密"}},[t._v("#")]),t._v(" 非对称加密")]),t._v(" "),a("blockquote",[a("p",[t._v("对称加密看上去好像完美地实现了机密性，但其中有一个很大的问题：如何把密钥安全地传递给对方，术语叫“密钥交换”。")])]),t._v(" "),a("blockquote",[a("p",[t._v("因为在对称加密算法中只要持有密钥就可以解密。如果你和网站约定的密钥在传递途中被黑客窃取，那他就可以在之后随意解密收发的数据，通信过程也就没有机密性可言了。")])]),t._v(" "),a("p",[a("strong",[t._v("非对称加密")]),t._v("（也叫公钥加密算法），它有两个密钥，一个叫"),a("strong",[t._v("公钥")]),t._v("（public key），一个叫"),a("strong",[t._v("私钥")]),t._v("（private key）。两个密钥是不同的，“不对称”，公钥可以公开给任何人使用，而私钥必须严格保密。")]),t._v(" "),a("p",[t._v("公钥和私钥有个特别的“单向”性，虽然都可以用来加密解密，但公钥加密后只能用私钥解密，反过来，私钥加密后也只能用公钥解密。")]),t._v(" "),a("p",[t._v("非对称加密可以解决“密钥交换”的问题。网站秘密保管私钥，在网上任意分发公钥，你想要登录网站只要用公钥加密就行了，密文只能由私钥持有者才能解密。而黑客因为没有私钥，所以就无法破解密文。")]),t._v(" "),a("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/https103.png"),width:"auto"}}),t._v(" "),a("p",[t._v("非对称加密算法的设计要比对称算法难得多，在 TLS 里只有很少的几种，比如 DH、DSA、RSA、ECC 等。")]),t._v(" "),a("ul",[a("li",[a("p",[a("strong",[t._v("RSA")]),t._v(" 可能是其中最著名的一个，几乎可以说是非对称加密的代名词，它的安全性基于“整数分解”的数学难题，使用两个超大素数的乘积作为生成密钥的材料，想要从公钥推算出私钥是非常困难的。")])]),t._v(" "),a("li",[a("p",[a("strong",[t._v("ECC")]),t._v("（Elliptic Curve Cryptography）是非对称加密里的“后起之秀”，它基于“椭圆曲线离散对数”的数学难题，使用特定的曲线方程和基点生成公钥和私钥，子算法 ECDHE 用于密钥交换，ECDSA 用于数字签名。")])])]),t._v(" "),a("h4",{attrs:{id:"混合加密"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#混合加密"}},[t._v("#")]),t._v(" 混合加密")]),t._v(" "),a("p",[t._v("虽然非对称加密没有“密钥交换”的问题，但因为它们都是基于复杂的数学难题，运算速度很慢。")]),t._v(" "),a("p",[t._v("现在 TLS 里使用"),a("strong",[t._v("混合加密")]),t._v("方式：")]),t._v(" "),a("ol",[a("li",[t._v("在通信刚开始的时候使用非对称算法，比如 RSA、ECDHE，首先解决密钥交换的问题。")]),t._v(" "),a("li",[t._v("然后用随机数产生对称算法使用的“会话密钥”（session key），再用公钥加密。因为会话密钥很短，通常只有 16 字节或 32 字节，所以慢一点也无所谓。")]),t._v(" "),a("li",[t._v("对方拿到密文后用私钥解密，取出会话密钥。这样，双方就实现了对称密钥的安全交换，后续就不再使用非对称加密，全都使用对称加密。")])]),t._v(" "),a("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/https104.png"),width:"auto"}}),t._v(" "),a("h3",{attrs:{id:"数字签名与证书"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#数字签名与证书"}},[t._v("#")]),t._v(" 数字签名与证书")]),t._v(" "),a("p",[t._v("在机密性的基础上还必须加上完整性、身份认证等特性，才能实现真正的安全。")]),t._v(" "),a("h4",{attrs:{id:"摘要算法"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#摘要算法"}},[t._v("#")]),t._v(" 摘要算法")]),t._v(" "),a("p",[t._v("实现完整性的手段主要是"),a("strong",[t._v("摘要算法")]),t._v("（Digest Algorithm），也就是常说的散列函数、哈希函数（Hash Function）。")]),t._v(" "),a("p",[t._v("可以把摘要算法近似地理解成一种特殊的压缩算法，它能够把任意长度的数据“压缩”成固定长度、而且独一无二的“摘要”字符串，就好像是给这段数据生成了一个数字“指纹”；这也是一种特殊的“单向”加密算法，它只有算法，没有密钥，加密后的数据无法解密，不能从摘要逆推出原文。")]),t._v(" "),a("blockquote",[a("p",[t._v("MD5（Message-Digest 5）、SHA-1（Secure Hash Algorithm 1），它们就是最常用的两个摘要算法，能够生成 16 字节和 20 字节长度的数字摘要。但这两个算法的安全强度比较低，不够安全，在 TLS 里已经被禁止使用。")])]),t._v(" "),a("p",[t._v("目前 TLS 推荐使用的是 SHA-1 的后继者："),a("strong",[t._v("SHA-2")]),t._v("。SHA-2 实际上是一系列摘要算法的统称，总共有 6 种，常用的有 SHA224、SHA256、SHA384，分别能够生成 28 字节、32 字节、48 字节的摘要。")]),t._v(" "),a("p",[t._v("摘要算法对输入具有“单向性”和“雪崩效应”，输入的微小不同会导致输出的剧烈变化，所以也被 TLS 用来生成伪随机数（PRF，pseudo random function）。如果黑客在中间哪怕改动了一个标点符号，摘要也会完全不同，网站计算比对就会发现消息被窜改，是不可信的。")]),t._v(" "),a("p",[t._v("真正的完整性必须要建立在机密性之上，在混合加密系统里"),a("strong",[t._v("用会话密钥加密消息和摘要")]),t._v("，这样黑客无法得知明文，也就没有办法动手脚了。")]),t._v(" "),a("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/https105.png"),width:"auto"}}),t._v(" "),a("h4",{attrs:{id:"数字签名"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#数字签名"}},[t._v("#")]),t._v(" 数字签名")]),t._v(" "),a("blockquote",[a("p",[t._v("加密算法结合摘要算法，我们的通信过程可以说是比较安全了。但这里还有漏洞，就是通信的两个端点（endpoint）。黑客可以伪装成网站来窃取信息。而反过来，他也可以伪装成你，向网站发送支付、转账等消息，网站没有办法确认你的身份，钱可能就这么被偷走了。")])]),t._v(" "),a("p",[t._v("使用私钥再加上摘要算法，就能够实现"),a("strong",[t._v("数字签名")]),t._v("，同时实现"),a("strong",[t._v("身份认证")]),t._v("和"),a("strong",[t._v("不可否认")]),t._v("。")]),t._v(" "),a("p",[t._v("数字签名的原理其实很简单，就是把公钥私钥的用法反过来，之前是公钥加密、私钥解密，现在是"),a("strong",[t._v("私钥加密、公钥解密")]),t._v("。")]),t._v(" "),a("blockquote",[a("p",[t._v("但又因为非对称加密效率太低，所以"),a("strong",[t._v("私钥只加密原文的摘要")]),t._v("，这样运算量就小的多，而且得到的数字签名也很小，方便保管和传输。")])]),t._v(" "),a("p",[t._v("签名和公钥一样完全公开，任何人都可以获取。但这个签名只有用私钥对应的公钥才能解开，拿到摘要后，再比对原文验证完整性，就可以像签署文件一样证明消息确实是你发的。")]),t._v(" "),a("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/https107.png"),width:"auto"}}),t._v(" "),a("blockquote",[a("p",[t._v("只要你和网站互相交换公钥，就可以用“签名”和“验签”来确认消息的真实性，因为私钥保密，黑客不能伪造签名，就能够保证通信双方的身份。")])]),t._v(" "),a("h4",{attrs:{id:"数字证书和-ca"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#数字证书和-ca"}},[t._v("#")]),t._v(" 数字证书和 CA")]),t._v(" "),a("blockquote",[a("p",[t._v("到现在，综合使用对称加密、非对称加密和摘要算法，已经实现了安全的四大特性，但这里还有一个“公钥的信任”问题。因为谁都可以发布公钥，还缺少防止黑客伪造公钥的手段。")])]),t._v(" "),a("p",[a("strong",[t._v("CA")]),t._v("（Certificate Authority，证书认证机构）。它就像网络世界里的公安局、教育部、公证中心，具有极高的可信度，由它来给各个公钥签名，用自身的信誉来保证公钥无法伪造，是可信的。")]),t._v(" "),a("p",[t._v("CA 对公钥的签名认证也是有格式的，不是简单地把公钥绑定在持有者身份上就完事了，还要包含序列号、用途、颁发者、有效时间等等，把这些打成一个包再签名，完整地证明公钥关联的各种信息，形成"),a("strong",[t._v("数字证书")]),t._v("（Certificate）。")]),t._v(" "),a("blockquote",[a("p",[t._v("知名的 CA 全世界就那么几家，比如 DigiCert、VeriSign、Entrust、Let’s Encrypt 等，它们签发的证书分 DV、OV、EV 三种，区别在于可信程度。DV 是最低的，只是域名级别的可信，背后是谁不知道。EV 是最高的，经过了法律和审计的严格核查，可以证明网站拥有者的身份（在浏览器地址栏会显示出公司的名字，例如 Apple、GitHub 的网站）。")])]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("CA的信任链")])])]),t._v(" "),a("p",[t._v("小一点的 CA 可以让大 CA 签名认证，但链条的最后，也就是 Root CA，就只能自己证明自己了，这个就叫“自签名证书”（Self-Signed Certificate）或者“根证书”（Root Certificate）。")]),t._v(" "),a("p",[t._v("操作系统和浏览器都内置了各大 CA 的根证书，上网的时候只要服务器发过来它的证书，就可以验证证书里的签名，顺着证书链（Certificate Chain）一层层地验证，直到找到根证书，就能够确定证书是可信的，从而里面的公钥也是可信的。")]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("证书体系的弱点")])])]),t._v(" "),a("p",[t._v("证书体系（PKI，Public Key Infrastructure）虽然是目前整个网络世界的安全基础设施，但：")]),t._v(" "),a("ol",[a("li",[t._v("如果 CA 失误或者被欺骗，签发了错误的证书，虽然证书是真的，可它代表的网站却是假的；")]),t._v(" "),a("li",[t._v("还有如果 CA 被黑客攻陷，或者 CA 有恶意，因为它（即根证书）是信任的源头，整个信任链里的所有证书也就都不可信了。")])]),t._v(" "),a("p",[t._v("针对第一种，开发出了 CRL（证书吊销列表，Certificate revocation list）和 OCSP（在线证书状态协议，Online Certificate Status Protocol），及时废止有问题的证书。")]),t._v(" "),a("p",[t._v("对于第二种，因为涉及的证书太多，就只能操作系统或者浏览器从根上“下狠手”了，撤销对 CA 的信任，列入“黑名单”，这样它颁发的所有证书就都会被认为是不安全的。")]),t._v(" "),a("h4",{attrs:{id:"总结"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#总结"}},[t._v("#")]),t._v(" 总结")]),t._v(" "),a("ol",[a("li",[t._v("摘要算法用来实现完整性，能够为数据生成独一无二的“指纹”，常用的算法是 SHA-2；")]),t._v(" "),a("li",[t._v("数字签名是私钥对摘要的加密，可以由公钥解密后验证，实现身份认证和不可否认；")]),t._v(" "),a("li",[t._v("公钥的分发需要使用数字证书，必须由 CA 的信任链来验证，否则就是不可信的；")]),t._v(" "),a("li",[t._v("作为信任链的源头 CA 有时也会不可信，解决办法有 CRL、OCSP，还有终止信任。")])]),t._v(" "),a("blockquote",[a("p",[t._v("参考："),a("a",{attrs:{href:"https://time.geekbang.org/column/article/109503",target:"_blank",rel:"noopener noreferrer"}},[t._v("数字签名与证书"),a("OutboundLink")],1)])]),t._v(" "),a("h2",{attrs:{id:"ssl-tls"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#ssl-tls"}},[t._v("#")]),t._v(" SSL/TLS")]),t._v(" "),a("p",[t._v("SSL 即"),a("strong",[t._v("安全套接层")]),t._v("（Secure Sockets Layer），在 OSI 模型中处于第 5 层（会话层），由网景公司于 1994 年发明，有 v2 和 v3 两个版本，而 v1 因为有严重的缺陷从未公开过。")]),t._v(" "),a("p",[t._v("SSL 发展到 v3 时已经证明了它自身是一个非常好的安全通信协议，于是互联网工程组 IETF 在 1999 年把它改名为 "),a("strong",[t._v("TLS")]),t._v("（传输层安全，Transport Layer Security），正式标准化，版本号从 1.0 重新算起，所以 TLS1.0 实际上就是 SSLv3.1。")]),t._v(" "),a("p",[t._v("到今天 TLS 已经发展出了三个版本，分别是 2006 年的 1.1、2008 年的 1.2 和2018年的 1.3，每个新版本都紧跟密码学的发展和互联网的现状，持续强化安全和性能，已经成为了信息安全领域中的权威标准。")]),t._v(" "),a("blockquote",[a("p",[t._v("目前应用的最广泛的 TLS 是 1.2，所以接下来的讲解都针对的是 TLS1.2。")])]),t._v(" "),a("p",[t._v("TLS 由"),a("strong",[t._v("记录协议、握手协议、警告协议、变更密码规范协议、扩展协议")]),t._v("等几个子协议组成，综合使用了"),a("strong",[t._v("对称加密、非对称加密、身份认证")]),t._v("等许多密码学前沿技术。")]),t._v(" "),a("p",[t._v("浏览器和服务器在使用 TLS 建立连接时需要选择一组恰当的加密算法来实现安全通信，这些算法的组合被称为"),a("strong",[t._v("密码套件")]),t._v("（cipher suite，也叫加密套件）。")]),t._v(" "),a("blockquote",[a("p",[t._v("TLS 的密码套件命名非常规范，格式很固定。基本的形式是“密钥交换算法 + 签名算法 + 对称加密算法 + 摘要算法”。")])]),t._v(" "),a("p",[t._v("如："),a("code",[t._v("ECDHE-RSA-AES256-GCM-SHA384")]),t._v("的意思就是：握手时使用 ECDHE 算法进行密钥交换，用 RSA 签名和身份认证，握手后的通信使用 AES 对称算法，密钥长度 256 位，分组模式是 GCM，摘要算法 SHA384 用于消息认证和产生随机数。")]),t._v(" "),a("h3",{attrs:{id:"tls-协议的组成"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#tls-协议的组成"}},[t._v("#")]),t._v(" TLS 协议的组成")]),t._v(" "),a("ul",[a("li",[a("p",[a("strong",[t._v("记录协议")]),t._v("（Record Protocol）规定了 TLS 收发数据的基本单位：记录（record）。它有点像是 TCP 里的 segment，所有的其他子协议都需要通过记录协议发出。但多个记录数据可以在一个 TCP 包里一次性发出，也并不需要像 TCP 那样返回 ACK。")])]),t._v(" "),a("li",[a("p",[a("strong",[t._v("警报协议")]),t._v("（Alert Protocol）的职责是向对方发出警报信息，有点像是 HTTP 协议里的状态码。比如，protocol_version 就是不支持旧版本，bad_certificate 就是证书有问题，收到警报后另一方可以选择继续，也可以立即终止连接。")])]),t._v(" "),a("li",[a("p",[a("strong",[t._v("握手协议")]),t._v("（Handshake Protocol）是 TLS 里最复杂的子协议，要比 TCP 的 SYN/ACK 复杂的多，浏览器和服务器会在握手过程中协商 TLS 版本号、随机数、密码套件等信息，然后交换证书和密钥参数，最终双方协商得到会话密钥，用于后续的混合加密系统。")])]),t._v(" "),a("li",[a("p",[a("strong",[t._v("变更密码规范协议")]),t._v("（Change Cipher Spec Protocol），它非常简单，就是一个“通知”，告诉对方，后续的数据都将使用加密保护。那么反过来，在它之前，数据都是明文的。")])])]),t._v(" "),a("h3",{attrs:{id:"tls-的握手过程"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#tls-的握手过程"}},[t._v("#")]),t._v(" TLS 的握手过程")]),t._v(" "),a("blockquote",[a("p",[t._v("在 HTTP 协议里，建立连接后，浏览器会立即发送请求报文。但现在是 HTTPS 协议，它需要再有另外一个“握手”过程，在 TCP 上建立安全连接，之后才是收发 HTTP 报文。这个“握手”过程与 TCP 有些类似，是 HTTPS 和 TLS 协议里最重要、最核心的部分。")])]),t._v(" "),a("h4",{attrs:{id:"ecdhe-握手过程"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#ecdhe-握手过程"}},[t._v("#")]),t._v(" ECDHE 握手过程")]),t._v(" "),a("p",[t._v("先看图：")]),t._v(" "),a("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/https106.png"),width:"auto"}}),t._v(" "),a("ul",[a("li",[a("strong",[t._v("流程分析：")])])]),t._v(" "),a("ol",[a("li",[t._v("在 TCP 建立连接之后，浏览器会首先发一个“Client Hello”消息，也就是跟服务器“打招呼”。里面有客户端的版本号、支持的密码套件，还有一个随机数（Client Random），用于后续生成会话密钥。")])]),t._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 握手协议")]),t._v("\nHandshake Protocol: Client Hello\n    Version: TLS "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1.2")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("0x0303"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 客户端TLS版本号")]),t._v("\n    Random: 1cbf803321fd2623408dfe… "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 随机数")]),t._v("\n    Cipher Suites "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("17")]),t._v(" suites"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 支持的密码套件")]),t._v("\n        Cipher Suite: TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("0xc02f"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n        Cipher Suite: TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("0xc030"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])])]),a("ol",{attrs:{start:"2"}},[a("li",[t._v("服务器收到“Client Hello”后，会返回一个“Server Hello”消息。把版本号对一下，也给出一个"),a("strong",[t._v("随机数")]),t._v("（Server Random），然后从客户端的列表里选一个作为本次通信使用的密码套件。")])]),t._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[t._v("Handshake Protocol: Server Hello\n    Version: TLS "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1.2")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("0x0303"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 确认客户端版本号")]),t._v("\n    Random: 0e6320f21bae50842e96…  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 生成随机数")]),t._v("\n    Cipher Suite: TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("0xc030"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 从客户端的列表里选一个作为本次通信使用的密码套件")]),t._v("\n")])])]),a("ol",{attrs:{start:"3"}},[a("li",[a("p",[t._v("然后服务器为了证明自己的身份，就把证书也发给了客户端（Server Certificate）。")])]),t._v(" "),a("li",[a("p",[t._v("接下来是一个关键的操作，因为服务器选择了 ECDHE 算法，所以它会在证书后发送“Server Key Exchange”消息，里面是"),a("strong",[t._v("椭圆曲线的公钥")]),t._v("（Server Params），用来实现密钥交换算法，再加上自己的私钥签名认证。")])])]),t._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[t._v("Handshake Protocol: Server Key Exchange\n    EC Diffie-Hellman Server Params "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 椭圆曲线的公钥")]),t._v("\n        Curve Type: named_curve "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("0x03"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n        Named Curve: x25519 "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("0x001d"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n        Pubkey: 3b39deaf00217894e"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("..")]),t._v(".\n        Signature Algorithm: rsa_pkcs1_sha512 "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("0x0601"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n        Signature: 37141adac38ea4"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("..")]),t._v(".\n")])])]),a("blockquote",[a("p",[t._v("这相当于说：“刚才我选的密码套件有点复杂，所以再给你个算法的参数，和刚才的随机数一样有用，别丢了。为了防止别人冒充，我又盖了个章。”")])]),t._v(" "),a("ol",{attrs:{start:"5"}},[a("li",[t._v("之后是“Server Hello Done”消息，服务器说：“我的信息就是这些，打招呼完毕。”")])]),t._v(" "),a("p",[t._v("这样"),a("strong",[t._v("第一个消息往返")]),t._v("就结束了（两个 TCP 包），结果是客户端和服务器通过明文共享了三个信息："),a("strong",[t._v("Client Random、Server Random 和 Server Params")]),t._v("。")]),t._v(" "),a("ol",{attrs:{start:"6"}},[a("li",[a("p",[t._v("客户端这时也拿到了服务器的证书，接着开始走证书链逐级验证，确认证书的真实性，再用证书公钥验证签名，就确认了服务器的身份：“刚才跟我打招呼的不是骗子，可以接着往下走。”")])]),t._v(" "),a("li",[a("p",[t._v("然后，客户端按照密码套件的要求，也生成一个"),a("strong",[t._v("椭圆曲线的公钥")]),t._v("（Client Params），用“Client Key Exchange”消息发给服务器。")])])]),t._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 握手协议")]),t._v("\nHandshake Protocol: Client Key Exchange\n    EC Diffie-Hellman Client Params\n        Pubkey: 8c674d0e08dc27b5eaa…\n")])])]),a("ol",{attrs:{start:"8"}},[a("li",[t._v("现在客户端和服务器手里都拿到了密钥交换算法的两个参数（Client Params、Server Params），就用 ECDHE 算法一阵算，算出了一个新的东西，叫"),a("strong",[t._v("Pre-Master")]),t._v("，其实也是一个随机数。")])]),t._v(" "),a("blockquote",[a("p",[t._v("至于具体的计算原理和过程，因为太复杂就不细说了，但算法可以保证即使黑客截获了之前的参数，也是绝对算不出这个随机数的。")])]),t._v(" "),a("ol",{attrs:{start:"9"}},[a("li",[t._v("现在客户端和服务器手里有了三个随机数："),a("strong",[t._v("Client Random、Server Random 和 Pre-Master")]),t._v("。用这三个作为原始材料，就可以生成用于加密会话的主密钥，叫 "),a("strong",[t._v("Master Secret")]),t._v(" 。而黑客因为拿不到“Pre-Master”，所以也就得不到主密钥。")])]),t._v(" "),a("blockquote",[a("p",[t._v("TLS 的设计者考虑得非常周到，他们不信任客户端或服务器伪随机数的可靠性，为了保证真正的“完全随机”“不可预测”，把三个不可靠的随机数混合起来，那么“随机”的程度就非常高了，足够让黑客难以猜测。")])]),t._v(" "),a("blockquote",[a("p",[t._v("主密钥有 48 字节，但它也不是最终用于通信的会话密钥，还会再用 PRF 扩展出更多的密钥，比如客户端发送用的会话密钥（client_write_key）、服务器发送用的会话密钥（server_write_key）等等，避免只用一个密钥带来的安全隐患。")])]),t._v(" "),a("ol",{attrs:{start:"10"}},[a("li",[t._v("有了主密钥和派生的会话密钥，握手就快结束了。客户端发一个 "),a("strong",[t._v("Change Cipher Spec")]),t._v(" ，然后再发一个 "),a("strong",[t._v("Finished")]),t._v(" 消息，把之前所有发送的数据做个摘要，再加密一下，让服务器做个验证。")])]),t._v(" "),a("blockquote",[a("p",[t._v("意思就是告诉服务器：“后面都改用对称算法加密通信了啊，用的就是打招呼时说的 AES，加密对不对还得你测一下。”")])]),t._v(" "),a("ol",{attrs:{start:"11"}},[a("li",[t._v("服务器也是同样的操作，发“Change Cipher Spec”和“Finished”消息，双方都验证加密解密 OK，握手正式结束，后面就收发被加密的 HTTP 请求和响应了。")])]),t._v(" "),a("h4",{attrs:{id:"rsa-握手过程"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#rsa-握手过程"}},[t._v("#")]),t._v(" RSA 握手过程")]),t._v(" "),a("p",[t._v("刚才说的其实是如今主流的 TLS 握手过程，这与传统的握手有两点不同：")]),t._v(" "),a("ul",[a("li",[t._v("第一个，使用 ECDHE 实现密钥交换，而不是 RSA，所以会在服务器端发出“Server Key Exchange”消息。")]),t._v(" "),a("li",[t._v("第二个，因为使用了 ECDHE，客户端可以不用等到服务器发回“Finished”确认握手完毕，立即就发出 HTTP 报文，省去了一个消息往返的时间浪费。这个叫“TLS False Start”，意思就是“抢跑”，和“TCP Fast Open”有点像，都是不等连接完全建立就提前发应用数据，提高传输的效率。")])]),t._v(" "),a("p",[t._v("接下来看下 RSA 的握手过程：")]),t._v(" "),a("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/https108.png"),width:"auto"}}),t._v(" "),a("p",[t._v("大体的流程没有变，只是“Pre-Master”不再需要用算法生成，而是客户端直接生成随机数，然后用服务器的公钥加密，通过“Client Key Exchange”消息发给服务器。服务器再用私钥解密，这样双方也实现了共享三个随机数，就可以生成主密钥。")]),t._v(" "),a("h4",{attrs:{id:"总结-2"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#总结-2"}},[t._v("#")]),t._v(" 总结")]),t._v(" "),a("ol",[a("li",[t._v("HTTPS 协议会先与服务器执行 TCP 握手，然后执行 TLS 握手，才能建立安全连接；")]),t._v(" "),a("li",[t._v("握手的目标是安全地交换对称密钥，需要三个随机数，第三个随机数“Pre-Master”必须加密传输，绝对不能让黑客破解；")]),t._v(" "),a("li",[t._v("“Hello”消息交换随机数，“Key Exchange”消息交换“Pre-Master”；")]),t._v(" "),a("li",[t._v("“Change Cipher Spec”之前传输的都是明文，之后都是对称密钥加密的密文。")])]),t._v(" "),a("h4",{attrs:{id:"备注"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#备注"}},[t._v("#")]),t._v(" 备注")]),t._v(" "),a("ol",[a("li",[t._v("Chrome 开发者工具的 Security 面板可以看到 HTTPS 握手时选择的版本号、密码套件、椭圆曲线")]),t._v(" "),a("li",[t._v("ECDHE 算法，使用椭圆曲线增强了 DH 算法的安全性和性能，公钥和私钥都是临时生成的")]),t._v(" "),a("li",[t._v("这一部分确实有点复杂，详见"),a("a",{attrs:{href:"https://time.geekbang.org/column/article/110354",target:"_blank",rel:"noopener noreferrer"}},[t._v("TLS1.2连接过程解析"),a("OutboundLink")],1)])]),t._v(" "),a("h3",{attrs:{id:"双向认证"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#双向认证"}},[t._v("#")]),t._v(" 双向认证")]),t._v(" "),a("p",[t._v("上面说的是“单向认证”握手过程，只认证了服务器的身份，而没有认证客户端的身份。这是因为通常单向认证通过后已经建立了安全通信，用账号、密码等简单的手段就能够确认用户的真实身份。")]),t._v(" "),a("p",[t._v("但为了防止账号、密码被盗，有的时候（比如网上银行）还会使用 U 盾给用户颁发客户端证书，实现“双向认证”，这样会更加安全。")]),t._v(" "),a("p",[t._v("双向认证的流程也没有太多变化，只是在“Server Hello Done”之后，“Client Key Exchange”之前，客户端要发送“Client Certificate”消息，服务器收到后也把证书链走一遍，验证客户端的身份。")]),t._v(" "),a("h3",{attrs:{id:"tls1-3特性解析"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#tls1-3特性解析"}},[t._v("#")]),t._v(" TLS1.3特性解析")]),t._v(" "),a("blockquote",[a("p",[t._v("前面讲的握手、认证都是TLS1.2的，接下来看一下TLS1.3")])]),t._v(" "),a("p",[t._v("TLS1.2 已经是 2008 年的“老”协议了，虽然历经考验，但毕竟“岁月不饶人”，在安全、性能等方面已经跟不上如今的互联网了。")]),t._v(" "),a("p",[t._v("于是经过四年、近 30 个草案的反复打磨，TLS1.3 终于在 2018 年 “粉墨登场”，再次确立了信息安全领域的新标准。")]),t._v(" "),a("p",[t._v("TLS1.3 的三个主要改进目标："),a("strong",[t._v("兼容、安全与性能")]),t._v("。")]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("最大化兼容性")])])]),t._v(" "),a("p",[t._v("TLS1.3 会用到一个新的"),a("strong",[t._v("扩展协议")]),t._v("（Extension Protocol），它有点“补充条款”的意思，通过在记录末尾添加一系列的“扩展字段”来增加新的功能，老版本的 TLS 不认识它可以直接忽略，这就实现了“后向兼容”。")]),t._v(" "),a("blockquote",[a("p",[t._v("在记录头的 Version 字段被兼容性“固定”的情况下，只要是 TLS1.3 协议，握手的“Hello”消息后面就必须有“supported_versions”扩展，它标记了 TLS 的版本号，使用它就能区分新旧协议。")])]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("强化安全")])])]),t._v(" "),a("blockquote",[a("p",[t._v("TLS1.2 在十来年的应用中获得了许多宝贵的经验，陆续发现了很多的漏洞和加密算法的弱点，所以 TLS1.3 就在协议里修补了这些不安全因素。")])]),t._v(" "),a("div",{staticClass:"custom-block tip"},[a("p",{staticClass:"custom-block-title"},[t._v("比如：")]),t._v(" "),a("ul",[a("li",[t._v("伪随机数函数由 PRF 升级为 HKDF（HMAC-based Extract-and-Expand Key Derivation Function）；")]),t._v(" "),a("li",[t._v("明确禁止在记录协议里使用压缩；")]),t._v(" "),a("li",[t._v("废除了 RC4、DES 对称加密算法；")]),t._v(" "),a("li",[t._v("废除了 ECB、CBC 等传统分组模式；")]),t._v(" "),a("li",[t._v("废除了 MD5、SHA1、SHA-224 摘要算法；")]),t._v(" "),a("li",[t._v("废除了 RSA、DH 密钥交换算法和许多命名曲线。")])])]),t._v(" "),a("p",[t._v("经过这一番“减肥瘦身”之后，TLS1.3 里只保留了 AES、ChaCha20 对称加密算法，分组模式只能用 AEAD 的 GCM、CCM 和 Poly1305，摘要算法只能用 SHA256、SHA384，密钥交换算法只有 ECDHE 和 DHE，椭圆曲线也被“砍”到只剩 P-256 和 x25519 等 5 种。")]),t._v(" "),a("p",[t._v("Q：废除 RSA 和 DH 密钥交换算法的原因？")]),t._v(" "),a("blockquote",[a("p",[t._v("RSA 不具有“前向安全”（Forward Secrecy）。假设黑客一直在长期收集混合加密系统收发的所有报文，如果加密系统使用服务器证书里的 RSA 做密钥交换，一旦私钥泄露或被破解，那么黑客就能够使用私钥解密出之前所有报文的“Pre-Master”，再算出会话密钥，破解所有密文。而 ECDHE 算法在每次握手时都会生成一对临时的公钥和私钥，每次通信的密钥对都是不同的，也就是“一次一密”，即使黑客花大力气破解了这一次的会话密钥，也只是这次通信被攻击，之前的历史消息不会受到影响，仍然是安全的。")])]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("提升性能")])])]),t._v(" "),a("blockquote",[a("p",[t._v("HTTPS 建立连接时除了要做 TCP 握手，还要做 TLS 握手，在 TLS1.2 中会多花两个消息往返（2-RTT），可能导致几十毫秒甚至上百毫秒的延迟，在移动网络中延迟还会更严重。")])]),t._v(" "),a("p",[t._v("现在因为密码套件大幅度简化，也就没有必要再像以前那样走复杂的协商流程了。TLS1.3 压缩了以前的“Hello”协商过程，删除了“Key Exchange”消息，把握手时间减少到了“1-RTT”，效率提高了一倍。")]),t._v(" "),a("p",[t._v("具体的做法还是利用了扩展。客户端在“Client Hello”消息里直接用“supported_groups”带上支持的曲线，比如 P-256、x25519，用“key_share”带上曲线对应的客户端公钥参数，用“signature_algorithms”带上签名算法。")]),t._v(" "),a("p",[t._v("流程如图：")]),t._v(" "),a("img",{staticClass:"zoom-custom-imgs",attrs:{src:t.$withBase("/images/https/https109.png"),width:"auto"}}),t._v(" "),a("h4",{attrs:{id:"总结-3"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#总结-3"}},[t._v("#")]),t._v(" 总结")]),t._v(" "),a("ol",[a("li",[t._v("为了兼容 1.1、1.2 等“老”协议，TLS1.3 会“伪装”成 TLS1.2，新特性在“扩展”里实现；")]),t._v(" "),a("li",[t._v("1.1、1.2 在实践中发现了很多安全隐患，所以 TLS1.3 大幅度删减了加密算法，只保留了 ECDHE、AES、ChaCha20、SHA-2 等极少数算法，强化了安全；")]),t._v(" "),a("li",[t._v("TLS1.3 也简化了握手过程，完全握手只需要一个消息往返，提升了性能。")])]),t._v(" "),a("blockquote",[a("p",[t._v("参考："),a("a",{attrs:{href:"https://time.geekbang.org/column/article/110718",target:"_blank",rel:"noopener noreferrer"}},[t._v("TLS1.3特性解析"),a("OutboundLink")],1)])]),t._v(" "),a("h2",{attrs:{id:"openssl"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#openssl"}},[t._v("#")]),t._v(" OpenSSL")]),t._v(" "),a("p",[t._v("OpenSSL是一个著名的开源密码学程序库和工具包，是 SSL/TLS 的具体实现。")]),t._v(" "),a("blockquote",[a("p",[t._v("几乎支持所有公开的加密算法和协议，已经成为了事实上的标准，许多应用软件都会使用它作为底层库来实现 TLS 功能，包括常用的 Web 服务器 Apache、Nginx 等。")])]),t._v(" "),a("blockquote",[a("p",[t._v("OpenSSL 是从另一个开源库 SSLeay 发展出来的，曾经考虑命名为“OpenTLS”，但当时（1998 年）TLS 还未正式确立，而 SSL 早已广为人知，所以最终使用了“OpenSSL”的名字。")])]),t._v(" "),a("h2",{attrs:{id:"https的优化"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#https的优化"}},[t._v("#")]),t._v(" HTTPS的优化")]),t._v(" "),a("p",[t._v("HTTPS 连接大致上可以划分为两个部分：第一个是建立连接时的"),a("strong",[t._v("非对称加密握手")]),t._v("，第二个是握手后的"),a("strong",[t._v("对称加密报文传输")]),t._v("。")]),t._v(" "),a("p",[t._v("由于目前流行的 AES、ChaCha20 性能都很好，还有硬件优化，报文传输的性能损耗可以说是非常地小，小到几乎可以忽略不计了。所以，通常所说的“HTTPS 连接慢”指的就是刚开始建立连接的那段时间。")]),t._v(" "),a("p",[t._v("在 TCP 建连之后，正式数据传输之前，HTTPS 比 HTTP 增加了一个 TLS 握手的步骤，这个步骤最长可以花费两个消息往返，也就是 2-RTT。而且在握手消息的网络耗时之外，还会有其他的一些“隐形”消耗，比如：")]),t._v(" "),a("ul",[a("li",[t._v("产生用于密钥交换的临时公私钥对（ECDHE）；")]),t._v(" "),a("li",[t._v("验证证书时访问 CA 获取 CRL 或者 OCSP；")]),t._v(" "),a("li",[t._v("非对称加密解密处理“Pre-Master”。")])]),t._v(" "),a("h3",{attrs:{id:"硬件优化"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#硬件优化"}},[t._v("#")]),t._v(" 硬件优化")]),t._v(" "),a("ul",[a("li",[t._v("首先，你可以选择"),a("strong",[t._v("更快的 CPU")]),t._v("，最好还内建 AES 优化，这样即可以加速握手，也可以加速传输。")]),t._v(" "),a("li",[t._v("其次，你可以选择"),a("strong",[t._v("SSL 加速卡")]),t._v("，加解密时调用它的 API，让专门的硬件来做非对称加解密，分担 CPU 的计算压力。")])]),t._v(" "),a("blockquote",[a("p",[t._v("不过“SSL 加速卡”也有一些缺点，比如升级慢、支持算法有限，不能灵活定制解决方案等。")])]),t._v(" "),a("ul",[a("li",[t._v("第三种硬件加速方式："),a("strong",[t._v("SSL 加速服务器")]),t._v("，用专门的服务器集群来彻底“卸载”TLS 握手时的加密解密计算，性能自然要比单纯的“加速卡”要强大的多。")])]),t._v(" "),a("h3",{attrs:{id:"软件优化"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#软件优化"}},[t._v("#")]),t._v(" 软件优化")]),t._v(" "),a("blockquote",[a("p",[t._v("硬件优化方式中除了 CPU，其他的通常可不是靠简单花钱就能买到的，还要有一些开发适配工作，有一定的实施难度。比如，“加速服务器”中关键的一点是通信必须是“异步”的，不能阻塞应用服务器，否则加速就没有意义了。")])]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("软件升级")])])]),t._v(" "),a("p",[t._v("软件升级实施起来比较简单，就是把现在正在使用的软件尽量升级到最新版本，比如把 Linux 内核由 2.x 升级到 4.x，把 Nginx 由 1.6 升级到 1.16，把 OpenSSL 由 1.0.1 升级到 1.1.0/1.1.1。")]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("协议优化")])])]),t._v(" "),a("ol",[a("li",[t._v("如果有可能，应当尽量采用 TLS1.3，它大幅度简化了握手的过程，完全握手只要 1-RTT，而且更加安全。")]),t._v(" "),a("li",[t._v("如果暂时不能升级到 1.3，只能用 1.2，那么握手时使用的密钥交换协议应当尽量选用椭圆曲线的 ECDHE 算法。它不仅运算速度快，安全性高，还支持“False Start”，能够把握手的消息往返由 2-RTT 减少到 1-RTT，达到与 TLS1.3 类似的效果。")]),t._v(" "),a("li",[t._v("另外，椭圆曲线也要选择高性能的曲线，最好是 x25519，次优选择是 P-256。对称加密算法方面，也可以选用“AES_128_GCM”，它能比“AES_256_GCM”略快一点点。")])]),t._v(" "),a("h3",{attrs:{id:"证书优化"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#证书优化"}},[t._v("#")]),t._v(" 证书优化")]),t._v(" "),a("blockquote",[a("p",[t._v("除了密钥交换，握手过程中的证书验证也是一个比较耗时的操作，服务器需要把自己的证书链全发给客户端，然后客户端接收后再逐一验证。")])]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("证书传输")])])]),t._v(" "),a("p",[t._v("服务器的证书可以选择椭圆曲线（ECDSA）证书而不是 RSA 证书，因为 224 位的 ECC 相当于 2048 位的 RSA，所以椭圆曲线证书的“个头”要比 RSA 小很多，即能够节约带宽也能减少客户端的运算量，可谓“一举两得”。")]),t._v(" "),a("ul",[a("li",[a("strong",[t._v("证书验证")])])]),t._v(" "),a("p",[t._v("客户端的证书验证其实是个很复杂的操作，会产生 DNS 查询、建立连接、收发数据等一系列网络通信，比较耗时；可以使用 OCSP（在线证书状态协议，Online Certificate Status Protocol），向 CA 发送查询请求，让 CA 返回证书的有效状态。")]),t._v(" "),a("blockquote",[a("p",[t._v("还有“OCSP Stapling”（OCSP 装订），它可以让服务器预先访问 CA 获取 OCSP 响应，然后在握手时随着证书一起发给客户端，免去了客户端连接 CA 服务器查询的时间。")])]),t._v(" "),a("h3",{attrs:{id:"会话复用"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#会话复用"}},[t._v("#")]),t._v(" 会话复用")]),t._v(" "),a("blockquote",[a("p",[t._v("HTTPS 建立连接的过程：先是 TCP 三次握手，然后是 TLS 一次握手。这后一次握手的重点是算出主密钥“Master Secret”，而主密钥每次连接都要重新计算，未免有点太浪费了，如果能够把“辛辛苦苦”算出来的主密钥缓存一下“重用”，不就可以免去了握手和计算的成本了吗？")])]),t._v(" "),a("p",[t._v("这种做法就叫"),a("strong",[t._v("会话复用")]),t._v("（TLS session resumption），和 HTTP Cache 一样，也是提高 HTTPS 性能的“大杀器”，被浏览器和服务器广泛应用。")]),t._v(" "),a("ul",[a("li",[a("p",[t._v("会话复用分两种，第一种叫"),a("strong",[t._v("Session ID")]),t._v("，就是客户端和服务器首次连接后各自保存一个会话的 ID 号，内存里存储主密钥和其他相关的信息。当客户端再次连接时发一个 ID 过来，服务器就在内存里找，找到就直接用主密钥恢复会话状态，跳过证书验证和密钥交换，只用一个消息往返就可以建立安全通信。")])]),t._v(" "),a("li",[a("p",[t._v("第二种 "),a("strong",[t._v("Session Ticket（会话票证）")]),t._v(" 方案，它有点类似 HTTP 的 Cookie，存储的责任由服务器转移到了客户端，服务器加密会话信息，用“New Session Ticket”消息发给客户端，让客户端保存。")])])]),t._v(" "),a("blockquote",[a("p",[t._v("参考："),a("a",{attrs:{href:"https://time.geekbang.org/column/article/111287",target:"_blank",rel:"noopener noreferrer"}},[t._v("HTTPS的优化"),a("OutboundLink")],1)])]),t._v(" "),a("h2",{attrs:{id:"https迁移"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#https迁移"}},[t._v("#")]),t._v(" HTTPS迁移")]),t._v(" "),a("ol",[a("li",[a("strong",[t._v("申请证书")])])]),t._v(" "),a("p",[t._v("要把网站从 HTTP 切换到 HTTPS，首先要做的就是为网站申请一张证书。")]),t._v(" "),a("blockquote",[a("p",[t._v("大型网站出于信誉、公司形象的考虑，通常会选择向传统的 CA 申请证书。")])]),t._v(" "),a("blockquote",[a("p",[t._v("“Let’s Encrypt”一直在推动证书的自动化部署，为此还实现了专门的 ACME 协议（RFC8555）。")])]),t._v(" "),a("ul",[a("li",[t._v("第一，申请证书时应当同时申请 RSA 和 ECDSA 两种证书，在 Nginx 里配置成双证书验证，这样服务器可以自动选择快速的椭圆曲线证书，同时也兼容只支持 RSA 的客户端。")]),t._v(" "),a("li",[t._v("第二，如果申请 RSA 证书，私钥至少要 2048 位，摘要算法应该选用 SHA-2，例如 SHA256、SHA384 等。")]),t._v(" "),a("li",[t._v("第三，出于安全的考虑，“Let’s Encrypt”证书的有效期很短，只有 90 天，时间一到就会过期失效，所以必须要定期更新。")])]),t._v(" "),a("ol",{attrs:{start:"2"}},[a("li",[a("strong",[t._v("配置 HTTPS")])])]),t._v(" "),a("ul",[a("li",[t._v("Nginx配置")])]),t._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[t._v("listen                "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("443")]),t._v(" ssl"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\nssl_certificate       xxx_rsa.crt"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#rsa2048 cert")]),t._v("\nssl_certificate_key   xxx_rsa.key"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#rsa2048 private key")]),t._v("\n\nssl_certificate       xxx_ecc.crt"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#ecdsa cert")]),t._v("\nssl_certificate_key   xxx_ecc.key"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#ecdsa private ke")]),t._v("\n")])])]),a("ul",[a("li",[t._v("为了提高 HTTPS 的安全系数和性能，你还可以强制 Nginx 只支持 TLS1.2 以上的协议；")]),t._v(" "),a("li",[t._v("密码套件的选择方面，以服务器的套件优先。")]),t._v(" "),a("li",[t._v("如果你的服务器上使用了 OpenSSL 的分支 BorringSSL，那么还可以使用一个特殊的“等价密码组”（Equal preference cipher groups）特性。")])]),t._v(" "),a("ol",{attrs:{start:"3"}},[a("li",[a("strong",[t._v("服务器名称指示")])])]),t._v(" "),a("p",[t._v("在 HTTP 协议里，多个域名可以同时在一个 IP 地址上运行，这就是“虚拟主机”，Web 服务器会使用请求头里的 Host 字段来选择。")]),t._v(" "),a("blockquote",[a("p",[t._v("但在 HTTPS 里，因为请求头只有在 TLS 握手之后才能发送，在握手时就必须选择“虚拟主机”对应的证书，TLS 无法得知域名的信息，就只能用 IP 地址来区分。所以，最早的时候每个 HTTPS 域名必须使用独立的 IP 地址，非常不方便。")])]),t._v(" "),a("p",[t._v("这还是得用到 TLS 的“扩展”，给协议加个 SNI（Server Name Indication）的“补充条款”。它的作用和 Host 字段差不多，客户端会在“Client Hello”时带上域名信息，这样服务器就可以根据名字而不是 IP 地址来选择证书。")]),t._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[t._v("Extension: server_name "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("len"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("19")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    Server Name Indication extension\n        Server Name Type: host_name "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n        Server Name: www.chrono.com\n")])])]),a("ol",{attrs:{start:"4"}},[a("li",[a("strong",[t._v("重定向跳转")])])]),t._v(" "),a("blockquote",[a("p",[t._v("现在有了 HTTPS 服务，但原来的 HTTP 站点也不能马上弃用，还是会有很多网民习惯在地址栏里直接敲域名（或者是旧的书签、超链接），默认使用 HTTP 协议访问。")])]),t._v(" "),a("p",[t._v("把不安全的 HTTP 网址用 301 或 302“重定向”到新的 HTTPS 网站，这在 Nginx 里也很容易做到，使用“return”或“rewrite”都可以。")]),t._v(" "),a("div",{staticClass:"language-shell extra-class"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[t._v("return")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("301")]),t._v(" https://"),a("span",{pre:!0,attrs:{class:"token variable"}},[t._v("$host")]),a("span",{pre:!0,attrs:{class:"token variable"}},[t._v("$request_uri")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("             "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#永久重定向")]),t._v("\nrewrite ^  https://"),a("span",{pre:!0,attrs:{class:"token variable"}},[t._v("$host")]),a("span",{pre:!0,attrs:{class:"token variable"}},[t._v("$request_uri")]),t._v(" permanent"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("   "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("#永久重定向")]),t._v("\n")])])]),a("blockquote",[a("p",[t._v("但这种方式有两个问题。一个是重定向增加了网络成本，多出了一次请求；另一个是存在安全隐患，重定向的响应可能会被“中间人”窜改，实现“会话劫持”，跳转到恶意网站")])]),t._v(" "),a("p",[t._v("不过有一种叫“HSTS”（HTTP 严格传输安全，HTTP Strict Transport Security）的技术可以消除这种安全隐患。")]),t._v(" "),a("p",[t._v("HTTPS 服务器需要在发出的响应头里添加一个“Strict-Transport-Security”的字段，再设定一个有效期，例如："),a("code",[t._v("Strict-Transport-Security: max-age=15768000; includeSubDomains")]),t._v("；")]),t._v(" "),a("blockquote",[a("p",[t._v("这相当于告诉浏览器：我这个网站必须严格使用 HTTPS 协议，在半年之内（182.5 天）都不允许用 HTTP，你以后就自己做转换吧，不要再来麻烦我了。")])]),t._v(" "),a("p",[t._v("有了“HSTS”的指示，以后浏览器再访问同样的域名的时候就会自动把 URI 里的“http”改成“https”，直接访问安全的 HTTPS 网站。这样“中间人”就失去了攻击的机会，而且对于客户端来说也免去了一次跳转，加快了连接速度。")]),t._v(" "),a("fix-link",{attrs:{label:"Back",href:"/tool/http/"}})],1)}),[],!1,null,null,null);s.default=_.exports}}]);
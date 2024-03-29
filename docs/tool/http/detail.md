---
title: HTTP详解
date: 2021-05-03 15:35:51
# permalink: false # 6a7fee/
categories: 
  - http
tags: 
  - http
permalink: false # 504007/
---



# HTTP详解


## HTTP 协议请求 - 应答的全过程
1. **浏览器从地址栏的输入中获得服务器的 IP 地址和端口号；**
> 如果输入的是域名，会首先进行域名解析，前面概览篇已经讲过，通过访问一系列的域名解析服务器，试图把这个域名翻译成 TCP/IP 协议里的 IP 地址。
::: tip
**DNS 解析可能会给出 CDN 服务器的 IP 地址**，这样你拿到的就会是 CDN 服务器而不是目标网站的实际地址；CDN 会缓存网站的大部分资源，比如图片、CSS 样式表，所以有的 HTTP 请求不需再发到服务器，CDN 可以直接响应你的请求。
:::

2. **浏览器用 TCP 的三次握手与服务器建立连接；**
> 前面概览篇讲过，HTTP 协议是运行在 TCP/IP 基础上的，依靠 TCP/IP 协议来实现数据的可靠传输。所以浏览器要用 HTTP 协议收发数据，首先要做的就是建立 TCP 连接；

> 浏览器要依照 TCP 协议的规范，使用**三次握手**（SYN、SYN/ACK、ACK）建立与 Web 服务器的连接。

3. **浏览器向服务器发送拼好的请求报文；**
> 连接建立起来，有了可靠的 TCP 连接通道后，HTTP 协议就可以开始工作了。于是，浏览器按照 HTTP 协议规定的格式，通过 TCP 发送了一个“GET / HTTP/1.1”请求报文。

> 随后，Web 服务器进行回复，在 TCP 协议层面确认：“刚才的报文我已经收到了”，不过这个 TCP 包 HTTP 协议是看不见的。

::: tip
- 发出的 HTTP 请求经过无数的路由器、网关、代理，最后到达服务器；目标网站的服务器对外表现的是一个 IP 地址，但为了能够扛住高并发，在内部也是一套复杂的架构。
- 通常在入口是**负载均衡设备**，它会先访问系统里的缓存服务器，它们的作用与 CDN 类似，减轻后端应用服务器的压力；
- 如果缓存服务器里也没有，那么负载均衡设备就要把请求转发给**应用服务器**，它们又会再访问后面的 MySQL、MongoDB 等数据库服务，然后把执行的结果返给负载均衡设备，同时也可能给缓存服务器里也放一份。
- 应用服务器的输出到了负载均衡设备这里，请求的处理就算是完成了；按原路返回，还是要经过路由器、网关、代理。如果这个资源允许缓存，经过 CDN 的时候会进行缓存。
:::

4. **服务器收到报文后处理请求，同样拼好报文再发给浏览器；**
> Web 服务器收到报文后在内部就要处理这个请求，同样也是依据 HTTP 协议的规定，解析报文，看看浏览器发送这个请求想要干什么。

> 处理完成后，服务器会生成一个符合 HTTP 格式的响应报文，发给浏览器，底层走的还是 TCP 协议。

> 同样的，浏览器也要给服务器回复一个 TCP 的 ACK 确认，“你的响应报文收到了，多谢”。

5. **浏览器解析报文，渲染输出页面。**


### 三次握手
> 上面第二步中，在真正的读写操作之前，客户端与服务器端之间必须建立一个连接，连接的建立依靠三次握手。

TCP 位于传输层，提供可靠的字节流服务。所谓的字节流服务（Byte Stream Service）是指，为了方便传输，将大块数据分割成以**报文段**（segment）为单位的数据包进行管理。

为了准确无误地将数据送达目标处，TCP 协议采用了**三次握手** （three-way handshaking）策略。

握手过程中使用了 TCP 的标志（flag）：**SYN（synchronize:同步）** 和 **ACK（acknowledgement:承认）**。

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http1101.jpeg')" width="auto"/>


- **第一次握手**

起初两端都处于**CLOSED**关闭状态，客户端将标志位SYN置为1，随机产生一个值seq=J，并将该数据包发送给服务端，客户端进入**SYN-SENT**（syn package has been sent，同步已发送）状态，等待服务端确认；
> 客户端主动打开连接，服务端被动打开连接，处于**LISTEN**状态；

- **第二次握手**

服务端收到连接请求报文段后，如同意建立连接，则向客户端发送确认，在确认报文段中（SYN=1，ACK=1，确认号ack=J+1，初始序号seq=K），服务端进程进入**SYN-RCVD**（syn package has been received，同步已收到）状态；

- **第三次握手**

客户端收到服务端的确认后，要向服务端给出确认报文段（ACK=1，确认号ack=K+1，序号seq=J+1）（初始为seq=J，第二个报文段所以要+1），ACK报文段可以携带数据，不携带数据则不消耗序号。TCP连接已经建立，A进入**ESTABLISHED**（已建立连接）。

当B收到A的确认后，也进入**ESTABLISHED**状态。
> 若在握手过程中某个阶段莫名中断，TCP 协议会再次以相同的顺序发 送相同的数据包。


#### 常见问题
- **为什么服务端还要发送一次确认呢？可以二次握手吗？**
1. 确认双方的接收与发送能力是否正常：
    - 第一次握手：客户端发送网络包，服务端收到了。这样服务端就能得出结论：客户端的发送能力、服务端的接收能力是正常的。
    - 第二次握手：服务端发包，客户端收到了。这样客户端就能得出结论：服务端的接收、发送能力，客户端的接收、发送能力是正常的。不过此时服务器并不能确认客户端的接收能力是否正常。
    - 第三次握手：客户端发包，服务端收到了。这样服务端就能得出结论：客户端的接收、发送能力正常，服务器自己的发送、接收能力也正常。

    **因此，需要三次握手才能确认双方的接收与发送能力是否正常。**

2. 指定自己的初始化序列号seq(Initial Sequence Number)，为后面的可靠传送做准备。
3. 如果是 https 协议的话，三次握手这个过程，还会进行数字证书的验证以及加密密钥的生成。


- **什么是半连接队列？**
> 服务器第一次收到客户端的 SYN 之后，就会处于 SYN_RCVD 状态，此时双方还没有完全建立其连接，服务器会把此种状态下请求连接放在一个队列里，我们把这种队列称之为**半连接队列**。当然还有一个**全连接队列**，就是已经完成三次握手，建立起连接的就会放在全连接队列中。



- **三次握手过程中可以携带数据吗？**

第一次、第二次握手不可以携带数据，而第三次握手是可以携带数据的。
> 假如第一次握手可以携带数据的话，如果有人要恶意攻击服务器，那他每次都在第一次握手中的 SYN 报文中放入大量的数据，因为攻击者根本就不理服务器的接收、发送能力是否正常，然后疯狂着重复发 SYN 报文的话，这会让服务器花费很多时间、内存空间来接收这些报文。




### 四次挥手
> 当读写操作完成后，双方不再需要这个连接时可以释放这个连接，而释放则需要**四次握手**。

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http1102.jpeg')" width="auto"/>

- **第一次挥手**

刚开始双方都处于 **establised** 状态，若客户端 A 认为数据发送完成，则它需要向服务端 B 发送连接释放请求；随后客户端发送一个 FIN 报文，报文中会指定一个序列号；此时客户端处于 **FIN_WAIT1** 状态。

- **第二次挥手**

服务端收到 FIN 之后，会发送 ACK 报文，且把客户端的序列号值 + 1 作为 ACK 报文的序列号值，表明已经收到客户端的报文了，此时服务端处于 **CLOSE_WAIT** 状态。
> 此时表明 A 到 B 的连接已经释放，不再接收 A 发的数据了。但是因为 TCP 连接是双向的，所以 B 仍旧可以发送数据给 A。

- **第三次挥手**

如果服务端也想断开连接了，和客户端的第一次挥手一样，发给 FIN 报文，且指定一个序列号。此时服务端处于 **LAST_ACK**（最后确认）状态。


- **第四次挥手**

客户端收到 FIN 之后，一样发送一个 ACK 报文作为应答，且把服务端的序列号值 + 1 作为自己 ACK 报文的序列号值，此时客户端处于 **TIME_WAIT**（时间等待） 状态。需要过一阵子以确保服务端收到自己的 ACK 报文之后才会进入 **CLOSED** 状态；

服务端收到 ACK 报文之后，就关闭连接了，处于 **CLOSED** 状态。


#### 常见问题

- **第四次挥手客户端有一个 TIME_WAIT 状态，为什么客户端发送 ACK 之后不直接关闭，而是要等一阵子才关闭？**
> 要确保服务器是否已经收到了我们的 ACK 报文，如果没有收到的话，服务器会重新发 FIN 报文给客户端，客户端再次收到 ACK 报文之后，就知道之前的 ACK 报文丢失了，然后再次发送 ACK 报文。

至于 TIME_WAIT 持续的时间至少是一个报文的来回时间：**2MSL**（MSL 最长报文段寿命Maximum Segment Lifetime）。如果过了 2MSL 没有再次收到 FIN 报文，则代表对方成功就是 ACK 报文，此时处于 CLOSED 状态。

- **为什么连接的时候是三次握手，关闭的时候却是四次握手？**
> 因为当Server端收到Client端的SYN连接请求报文后，可以直接发送SYN+ACK报文。其中ACK报文是用来应答的，SYN报文是用来同步的。但是关闭连接时，当Server端收到FIN报文时，很可能并不会立即关闭SOCKET，所以只能先回复一个ACK报文，告诉Client端，"你发的FIN报文我收到了"。只有等到我Server端所有的报文都发送完了，我才能发送FIN报文，因此不能一起发送。故需要四步握手。

- [参考1](https://juejin.cn/post/6844903834708344840)、[参考2](https://juejin.cn/post/6844903625513238541)、[参考3](https://juejin.cn/post/6844903618911404045)




## HTTP报文结构
> HTTP 协议在规范文档里详细定义了报文的格式，规定了组成部分，解析规则，还有处理策略，所以可以在 TCP/IP 层之上实现更灵活丰富的功能，例如连接控制，缓存管理、数据编码、内容协商等等。

它是一个“纯文本”的协议，所以头数据都是 ASCII 码的文本，可以很容易地用肉眼阅读，不用借助程序解析也能够看懂。

::: tip HTTP 协议的请求报文和响应报文的结构:
1. 起始行（start line）：描述请求或响应的基本信息；
2. 头部字段集合（header）：使用 key-value 形式更详细地说明报文；
3. 消息正文（entity）：实际传输的数据，它不一定是纯文本，可以是图片、视频等二进制数据。
:::
> 这其中前两部分起始行和头部字段经常又合称为**请求头**或**响应头**，消息正文又称为**实体**，但与“header”对应，很多时候就直接称为**body**。

- HTTP 协议规定报文必须有 header，但可以没有 body，而且在 header 之后必须要有一个“空行”，也就是“CRLF”，十六进制的“0D0A”：

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http101.png')" width="auto"/>

- 在如下浏览器发出的请求报文里，第一行“GET / HTTP/1.1”就是请求行，而后面的“Host”“Connection”等等都属于 header，报文的最后是一个空白行结束，没有 body：
<img class="zoom-custom-imgs" :src="$withBase('/images/https/http102.png')" width="auto"/>

### 请求行
请求报文里的起始行也就是请求行（request line），它简要地描述了**客户端想要如何操作服务器端的资源**。
::: tip 请求行由三部分构成：
- 请求方法：是一个动词，如 GET/POST，表示对资源的操作；
- 请求目标：通常是一个 URI，标记了请求方法要操作的资源；
- 版本号：表示报文使用的 HTTP 协议版本。
:::
> 这三个部分通常使用空格（space）来分隔，最后要用 CRLF 换行表示结束。

例：
``` shell
GET / HTTP/1.1
```
> 在这个请求行里，“GET”是请求方法，“/”是请求目标，“HTTP/1.1”是版本号，把这三部分连起来，意思就是“服务器你好，我想获取网站根目录下的默认文件，我用的协议版本号是 1.1，请不要用 1.0 或者 2.0 回复我。”


### 状态行
看完了请求行，我们再看响应报文里的起始行，在这里它不叫“响应行”，而是叫**状态行**（status line），意思是**服务器响应的状态**。
::: tip 状态行由三部分构成：
- 版本号：表示报文使用的 HTTP 协议版本；
- 状态码：一个三位数，用代码的形式表示处理的结果，比如 200 是成功，500 是服务器错误；
- 原因：作为数字状态码补充，是更详细的解释文字，帮助人理解原因。
:::
例：
``` shell
HTTP/1.1 200 OK
```
> 意思就是：“浏览器你好，我已经处理完了你的请求，这个报文使用的协议版本号是 1.1，状态码是 200，一切 OK。”


#### 状态码（Status Code）
> 它是一个十进制数字，以代码的形式表示服务器对请求的处理结果。

::: tip RFC 标准把状态码分成了五类:
- 1××：提示信息，表示目前是协议处理的中间状态，还需要后续的操作；
- 2××：成功，报文已经收到并被正确处理；
- 3××：重定向，资源位置发生变动，需要客户端重新发送请求；
- 4××：客户端错误，请求报文有误，服务器无法处理；
- 5××：服务器错误，服务器在处理请求时内部发生了错误。
:::

- **1xx**

1××类状态码属于提示信息，是协议处理的中间状态，实际能够用到的时候很少。
> 偶尔见到的是“101 Switching Protocols”，意思是客户端使用 Upgrade 头字段，要求在 HTTP 协议的基础上改成其他的协议继续通信，比如 WebSocket。而如果服务器也同意变更协议，就会发送状态码 101，但这之后的数据传输就不会再使用 HTTP 了。

- **2xx**

2××类状态码表示**服务器收到并成功处理了客户端的请求**。

::: tip 分类：
- “200 OK”是最常见的成功状态码，表示一切正常。如果是非 HEAD 请求，通常在响应头后都会有 body 数据。
- “204 No Content”是另一个很常见的成功状态码，它的含义与“200 OK”基本相同，但响应头后没有 body 数据。
- “206 Partial Content”是 HTTP 分块下载或断点续传的基础，在客户端发送“范围请求”、要求获取资源的部分数据时出现。状态码 206 通常还会伴随着头字段“Content-Range”，表示响应报文里 body 数据的具体范围，例如“Content-Range: bytes 0-99/2000”，意思是总计 2000 个字节的前 100 个字节。
:::


- **3xx**

3××类状态码表示客户端请求的资源发生了变动，客户端必须用新的 URI 重新发送请求获取资源，也就是通常所说的**重定向**，包括著名的 301、302 跳转。


::: tip 分类：
- “301 Moved Permanently”俗称“永久重定向”，含义是此次请求的资源已经不存在了，需要改用新的 URI 再次访问。
- “302 Moved Temporarily”，俗称“临时重定向”，意思是请求的资源还在，但需要暂时用另一个 URI 来访问。
    > 301 和 302 都会在响应头里使用字段 Location 指明后续要跳转的 URI，最终的效果很相似，浏览器都会重定向到新的 URI。两者的根本区别在于语义，一个是“永久”，一个是“临时”。
- “304 Not Modified” 用于 If-Modified-Since 等条件请求，表示资源未修改，用于缓存控制。它不具有通常的跳转含义，但可以理解成“重定向到已缓存的文件”（即“缓存重定向”）。
:::


- **4xx**

4××类状态码表示**客户端发送的请求报文有误**，服务器无法处理，它就是真正的“错误码”含义了。

::: tip 分类：
- “400 Bad Request”是一个通用的错误码，表示请求报文有错误，但具体是数据格式错误、缺少请求头还是 URI 超长它没有明确说，只是一个笼统的错误。
- 401 Unauthorized 该状态码表示发送的请求需要有通过 HTTP 认证（BASIC 认证、 DIGEST 认证）的认证信息。
- “403 Forbidden”实际上不是客户端的请求出错，而是表示服务器禁止访问资源，原因可能多种多样，例如信息敏感、法律禁止等。
- “404 Not Found”它的原意是资源在本服务器上未找到，所以无法提供给客户端。
- 405 Method Not Allowed：不允许使用某些方法操作资源，例如不允许 POST 只能 GET；
- 406 Not Acceptable：资源无法满足客户端请求的条件，例如请求中文但只有英文；
- 408 Request Timeout：请求超时，服务器等待了过长的时间；
- 409 Conflict：多个请求发生了冲突，可以理解为多线程并发时的竞态；
- 413 Request Entity Too Large：请求报文里的 body 太大；
- 414 Request-URI Too Long：请求行里的 URI 太大；
- 429 Too Many Requests：客户端发送了太多的请求，通常是由于服务器的限连策略；
- 431 Request Header Fields Too Large：请求头某个字段或总体太大；
:::


- **5xx**

5××类状态码表示客户端请求报文正确，但**服务器在处理时内部发生了错误**，无法返回应有的响应数据，是服务器端的“错误码”。

::: tip 分类：
- “500 Internal Server Error”与 400 类似，也是一个通用的错误码。
- “501 Not Implemented”表示客户端请求的功能还不支持。
- “502 Bad Gateway”通常是服务器作为网关或者代理时返回的错误码，表示服务器自身工作正常，访问后端服务器时发生了错误，但具体的错误原因也是不知道的。
- “503 Service Unavailable”表示服务器当前很忙，暂时无法响应服务，我们上网时有时候遇到的“网络服务正忙，请稍后重试”的提示信息就是状态码 503。
    > 503 是一个“临时”的状态，很可能过几秒钟后服务器就不那么忙了，可以继续提供服务，所以 503 响应报文里通常还会有一个“Retry-After”字段，指示客户端可以在多久以后再次尝试发送请求。
:::



#### 3xx 重定向
> 跳转动作是由浏览器的使用者主动发起的，可以称为**主动跳转**，但还有一类跳转是由服务器来发起的，浏览器使用者无法控制，相对地就可以称为“被动跳转”，这在 HTTP 协议里有个专门的名词，叫做**重定向**（Redirection）

> 在介绍 HTTP 报文状态码时讲过，301 是“永久重定向”，302 是“临时重定向”，浏览器收到这两个状态码就会跳转到新的 URI。

浏览器收到 301/302 报文，会检查响应头里有没有**Location**字段。如果有，就从字段值里提取出 URI，发出新的 HTTP 请求，相当于自动替我们点击了这个链接。

**Location**字段属于响应字段，必须出现在响应报文里。但只有配合 301/302 状态码才有意义，它**标记了服务器要求重定向的 URI**。
> 在“Location”里的 URI 既可以使用绝对 URI，也可以使用相对 URI；在重定向时如果只是在站内跳转，你可以放心地使用相对 URI。但如果要跳转到站外，就必须用绝对 URI。

> 重定向报文里还可以用 Refresh 字段，实现延时重定向；例如：`Refresh:5; url=xxx`告诉浏览器5秒后再跳转。

> 与跳转有关的还有一个"Referer"和“Referrer-Policy”，表示浏览器跳转的来源。

> 

- 301 俗称“永久重定向”（Moved Permanently），意思是原 URI 已经“永久”性地不存在了，今后的所有请求都必须改用新的 URI。
- 302 俗称“临时重定向”（“Moved Temporarily”），意思是原 URI 处于“临时维护”状态，新的 URI 是起“顶包”作用的“临时工”。

- **重定向的相关问题**
1. 性能损耗：重定向的机制决定了一个跳转会有两次请求 - 应答，比正常的访问多了一次。
2. 循环跳转：如果重定向的策略设置欠考虑，可能会出现“A=>B=>C=>A”的无限循环，不停地在这个链路里转圈圈，后果可想而知。
    > HTTP 协议特别规定，浏览器必须具有检测“循环跳转”的能力，在发现这种情况时应当停止发送请求并给出错误提示。

- **外部重定向和内部重定向的区别：**
1. 外部重定向，服务器会把重定向的地址给浏览器，然后浏览器再次的发起请求，地址栏的地址变化了。
2. 内部重定向，直接在服务器内跳转URI，不需要再次在浏览器发起请求，没有额外的性能损失。





### 头部字段
请求行或状态行再加上头部字段集合就构成了 HTTP 报文里完整的请求头或响应头。

> 请求头和响应头的结构是基本一样的，唯一的区别是起始行。

> 头部字段是 key-value 的形式，key 和 value 之间用“:”分隔，最后用 CRLF 换行表示字段结束。比如在“Host: 127.0.0.1”这一行里 key 就是“Host”，value 就是“127.0.0.1”。
::: tip 使用头部字段需注意：
1. 字段名不区分大小写，例如“Host”也可以写成“host”，但首字母大写的可读性更好；
2. 字段名里不允许出现空格，可以使用连字符“-”，但不能使用下划线“_”。例如，“test-name”是合法的字段名，而“test name”“test_name”是不正确的字段名；
3. 字段名后面必须紧接着“:”，不能有空格，而“:”后的字段值前可以有多个空格；
4. 字段的顺序是没有意义的，可以任意排列不影响语义；
5. 字段原则上不能重复，除非这个字段本身的语义允许，例如 Set-Cookie。
:::

#### 常用头部字段
HTTP 协议规定了非常多的头部字段，实现各种各样的功能，但基本上可以分为四大类：
1. 通用字段：在请求头和响应头里都可以出现；
2. 请求字段：仅能出现在请求头里，进一步说明请求信息或者额外的附加条件；
3. 响应字段：仅能出现在响应头里，补充说明响应报文的信息；
4. 实体字段：它实际上属于通用字段，但专门描述 body 的额外信息。
> 对 HTTP 报文的解析和处理实际上主要就是对头字段的处理，理解了头字段也就理解了 HTTP 报文。

- **Host**
> Host 属于请求字段，只能出现在请求头里，它同时也是唯一一个 HTTP/1.1 规范里要求必须出现的字段，也就是说，如果请求头里没有 Host，那这就是一个错误的报文。

> Host 字段告诉服务器这个请求应该由哪个主机来处理，当一台计算机上托管了多个虚拟主机的时候，服务器端就需要用 Host 字段来选择，有点像是一个简单的“路由重定向”。

- **User-Agent**
> User-Agent属于请求字段，只出现在请求头里。它使用一个字符串来描述发起 HTTP 请求的客户端，服务器可以依据它来返回最合适此浏览器显示的页面。

- **Date**
> Date 字段是一个通用字段，但通常出现在响应头里，表示 HTTP 报文创建的时间，客户端可以使用这个时间再搭配其他字段决定缓存策略。

- **Server**
> Server 字段是响应字段，只能出现在响应头里。它告诉客户端当前正在提供 Web 服务的软件名称和版本号，例如在我们的实验环境里它就是“Server: openresty/1.15.8.1”，即使用的是 OpenResty 1.15.8.1。

- **Content-Length**
> Content-Length是一个实体字段，它表示报文里 body 的长度，也就是请求头或响应头空行后面数据的长度。服务器看到这个字段，就知道了后续有多少数据，可以直接接收。如果没有这个字段，那么 body 就是不定长的，需要使用 chunked 方式分段传输。


### 实体

#### 数据类型与编码
> 早在 HTTP 协议诞生之前电子邮件系统可以发送 ASCII 码以外的任意数据；这种技术叫**多用途互联网邮件扩展（Multipurpose Internet Mail Extensions）**，简称为**MIME**；

MIME 是一个很大的标准规范，HTTP 只取了其中的一部分，用来标记 body 的数据类型，这就是我们平常总能听到的**MIME type**。
::: tip MIME type 常用类别：
1. **text**：即文本格式的可读数据，我们最熟悉的应该就是 text/html 了，表示超文本文档，此外还有纯文本 text/plain、样式表 text/css 等。
2. **image**：即图像文件，有 image/gif、image/jpeg、image/png 等。
3. **audio/video**：音频和视频数据，例如 audio/mpeg、video/mp4 等。
4. **application**：数据格式不固定，可能是文本也可能是二进制，必须由上层应用程序来解释。常见的有 application/json，application/javascript、application/pdf 等；如果不知道是什么类型，就会是 application/octet-stream，即不透明的二进制数据。
:::

因为 HTTP 在传输时为了节约带宽，有时候还会压缩数据，所以还有一个**Encoding type**，告诉数据是用的什么编码格式，这样对方才能正确解压缩，还原出原始的数据。
::: tip Encoding type 常用类别：
1. **gzip**：GNU zip 压缩格式，也是互联网上最流行的压缩格式；
2. **deflate**：zlib（deflate）压缩格式，流行程度仅次于 gzip；
3. **br**：一种专门为 HTTP 优化的新压缩算法（Brotli）。
:::


- **数据类型使用的头字段**

HTTP 协议定义了两个 **Accept 请求头字段**和两个 **Content 实体头字段**，用于客户端和服务器进行“内容协商”。
> 客户端用 Accept 头告诉服务器希望接收什么样的数据，而服务器用 Content 头告诉客户端实际发送了什么样的数据。

1. Accept

Accept 字段标记的是客户端可理解的 MIME type，可以用“,”做分隔符列出多个类型，让服务器有更多的选择余地：
``` shell
Accept: text/html,application/xml,image/webp,image/png
```
> 这就是告诉服务器：“我能够看懂 HTML、XML 的文本，还有 webp 和 png 的图片，请给我这四类格式的数据”。

2. Content-Type

相应的，服务器会在响应报文里用头字段 Content-Type 告诉实体数据的真实类型：
``` shell
Content-Type: text/html
Content-Type: image/png
```
> 这样浏览器看到报文里的类型是“text/html”就知道是 HTML 文件，会调用排版引擎渲染出页面，看到“image/png”就知道是一个 PNG 文件，就会在页面上显示出图像。

3. Accept-Encoding / Content-Encoding

**Accept-Encoding** 字段标记的是客户端支持的压缩格式，例如上面说的 gzip、deflate 等，同样也可以用“,”列出多个，服务器可以选择其中一种来压缩数据，实际使用的压缩格式放在响应头字段 **Content-Encoding** 里：
``` shell
Accept-Encoding: gzip, deflate, br
Content-Encoding: gzip
```
> 这两个字段可以省略，如果请求报文里没有 Accept-Encoding 字段，就表示客户端不支持压缩数据；如果响应报文里没有 Content-Encoding 字段，就表示响应数据没有被压缩。

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http201.png')" width="auto"/>

#### 语言类型与编码
> MIME type 和 Encoding type 解决了计算机理解 body 数据的问题，接下来该解决“国际化”的问题。

HTTP 采用了与数据类型相似的解决方案，又引入了两个概念：**语言类型与字符集**。

所谓的**语言类型**就是人类使用的自然语言，例如英语、汉语、日语等，而这些自然语言可能还有下属的地区性方言，所以在需要明确区分的时候也要使用“type-subtype”的形式，不过这里的格式与数据类型不同，**分隔符不是“/”，而是“-”**。
> 举几个例子：en 表示任意的英语，en-US 表示美式英语，en-GB 表示英式英语，而 zh-CN 就表示我们最常使用的汉语。

在计算机发展的早期，各个国家和地区发明了许多字符编码方式来处理文字，比如英语世界用的 ASCII、汉语世界用的 GBK、BIG5；后来就出现了**Unicode**和**UTF-8**，把世界上所有的语言都容纳在一种编码方案里，**遵循 UTF-8 字符编码方式的 Unicode 字符集也成为了互联网上的标准字符集**。

- **语言类型使用的头字段**

同样的，HTTP 协议也使用 **Accept 请求头字段**和**Content实体头字段**，用于客户端和服务器就语言与编码进行“内容协商”。

1. Accept-Language

Accept-Language 字段标记了客户端可理解的自然语言，也允许用“,”做分隔符列出多个类型，例如：
``` shell
Accept-Language: zh-CN, zh, en
```
> 这个请求头会告诉服务器：“最好给我 zh-CN 的汉语文字，如果没有就用其他的汉语方言，如果还没有就给英文”。

2. Content-Language

相应的，服务器应该在响应报文里用头字段 Content-Language 告诉客户端实体数据使用的实际语言类型：
``` shell
Content-Language: zh-CN
```

3. Accept-Charset

字符集在 HTTP 里使用的请求头字段是 Accept-Charset，但响应头里却没有对应的 Content-Charset，而是在 Content-Type 字段的数据类型后面用 **charset=xxx** 来表示，这点需要特别注意。
``` shell
Accept-Charset: gbk, utf-8
Content-Type: text/html; charset=utf-8
```
> 浏览器请求 GBK 或 UTF-8 的字符集，然后服务器返回的是 UTF-8 编码。

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http202.png')" width="auto"/>

> 不过现在的浏览器都支持多种字符集，通常不会发送 Accept-Charset，而服务器也不会发送 Content-Language，因为使用的语言完全可以由字符集推断出来，所以在请求头里一般只会有 Accept-Language 字段，响应头里只会有 Content-Type 字段。

#### 内容协商的质量值
> 在 HTTP 协议里用 Accept、Accept-Encoding、Accept-Language 等请求头字段进行内容协商的时候，还可以用一种特殊的“q”参数表示权重来设定优先级，这里的“q”是**quality factor**的意思。

权重的最大值是 1，最小值是 0.01，默认值是 1，如果值是 0 就表示拒绝。具体的形式是在数据类型或语言代码后面加一个“;”，然后是“q=value”。

例：
``` shell
Accept: text/html,application/xml;q=0.9,*/*;q=0.8
```
> 它表示浏览器最希望使用的是 HTML 文件，权重是 1，其次是 XML 文件，权重是 0.9，最后是任意数据类型，权重是 0.8。服务器收到请求头后，就会计算权重，再根据自己的实际情况优先输出 HTML 或者 XML。

#### 内容协商的结果

内容协商的过程是不透明的，有时服务器会在响应头里多加一个 Vary 字段，记录服务器在内容协商时参考的请求头字段，例如：
``` shell
Vary: Accept-Encoding,User-Agent,Accept
```
> 这个 Vary 字段表示服务器依据了 Accept-Encoding、User-Agent 和 Accept 这三个头字段，然后决定了发回的响应报文。

> Vary 字段可以认为是响应报文的一个特殊的“版本标记”。每当 Accept 等请求头变化时，Vary 也会随着响应报文一起变化。也就是说，同一个 URI 可能会有多个不同的“版本”，主要用在传输链路中间的代理服务器实现缓存服务，这个在“HTTP 缓存”时会用到。


#### 备注
> content-type 和 Content-Language 是实体字段，所以请求和响应里都可以用，作用是指明body数据的类型；比如在 post 请求中就可以加这两个字段。




## HTTP的请求方法
> 请求方法的实际含义就是客户端发出了一个“动作指令”，要求服务器端对 URI 定位的资源执行这个动作。

目前 HTTP/1.1 规定了八种方法，单词都**必须是大写的形式**。
::: tip 分类
- GET：获取资源，可以理解为读取或者下载数据；
- HEAD：获取资源的元信息；
- POST：向资源提交数据，相当于写入或上传数据；
- PUT：类似 POST；
- DELETE：删除资源；
- CONNECT：建立特殊的连接隧道；
- OPTIONS：列出可对资源实行的方法；
- TRACE：追踪请求 - 响应的传输路径。
:::

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http103.jpeg')" width="auto"/>


### GET/HEAD
> GET 方法应该是 HTTP 协议里最知名的请求方法了，也应该是用的最多的，自 0.9 版出现并一直被保留至今，是名副其实的“元老”。

它的含义是请求**从服务器获取资源**，这个资源既可以是静态的文本、页面、图片、视频，也可以是由 PHP、Java 动态生成的页面或者其他格式的数据。

**HEAD** 方法与 GET 方法类似，也是请求从服务器获取资源，服务器的处理机制也是一样的，但服务器不会返回请求的实体数据，只会传回响应头，也就是资源的“元信息”。
> HEAD 方法可以看做是 GET 方法的一个“简化版”或者“轻量版”。因为它的响应头与 GET 完全相同，所以可以用在很多并不真正需要资源的场合，避免传输 body 数据的浪费。


### POST/PUT
> GET 和 HEAD 方法是从服务器获取数据，而 POST 和 PUT 方法则是相反操作，向 URI 指定的资源提交数据，数据就放在报文的 body 里。

**POST** 也是一个经常用到的请求方法，使用频率应该是仅次于 GET，应用的场景也非常多，只要向服务器发送数据，用的大多数都是 POST。

**PUT** 的作用与 POST 类似，也可以向服务器提交数据，但与 POST 存在微妙的不同，通常 POST 表示的是“新建”“create”的含义，而 PUT 则是“修改”“update”的含义。


### 其他方法

- **DELETE** 方法指示服务器删除资源，因为这个动作危险性太大，所以通常服务器不会执行真正的删除操作，而是对资源做一个删除标记。当然，更多的时候服务器就直接不处理 DELETE 请求。

- **CONNECT** 是一个比较特殊的方法，要求服务器为客户端和另一台远程服务器建立一条特殊的连接隧道，这时 Web 服务器在中间充当了代理的角色。

- **OPTIONS** 方法要求服务器列出可对资源实行的操作方法，在响应头的 Allow 字段里返回。它的功能很有限，用处也不大，有的服务器（例如 Nginx）干脆就没有实现对它的支持。
> 对那些可能对服务器数据产生副作用的 HTTP 请求方法（特别是 GET 以外的 HTTP 请求，或者搭配某些 MIME 类型的 POST 请求），浏览器必须首先使用 OPTIONS 方法发起一个预检请求（preflight request），从而获知服务端是否允许该跨域请求。服务器确认允许之后，才发起实际的 HTTP 请求。

- **TRACE** 方法多用于对 HTTP 链路的测试或诊断，可以显示出请求 - 响应的传输路径。它的本意是好的，但存在漏洞，会泄漏网站的信息，所以 Web 服务器通常也是禁止使用。

### 扩展方法
> 虽然 HTTP/1.1 里规定了八种请求方法，但它并没有限制我们只能用这八种方法，这也体现了 HTTP 协议良好的扩展性，我们可以任意添加请求动作，只要请求方和响应方都能理解就行。





## HTTP的特点

- **灵活可扩展**
> 首先， HTTP 协议是一个“灵活可扩展”的传输协议。

HTTP 协议最初诞生的时候就比较简单，只规定了报文的基本格式，比如用空格分隔单词，用换行分隔字段，“header+body”等，报文里的各个组成部分都没有做严格的语法语义限制，可以由开发者任意定制。

后来 HTTP 协议逐渐增加了请求方法、版本号、状态码、头字段等特性。而 body 也不再限于文本形式的 TXT 或 HTML，而是能够传输图片、音频视频等任意数据，这些都是源于它的“灵活可扩展”的特点。

- **可靠传输**
> 第二个特点， HTTP 协议是一个“可靠”的传输协议。

因为 HTTP 协议是基于 TCP/IP 的，而 TCP 本身是一个“可靠”的传输协议，所以 HTTP 自然也就继承了这个特性，能够在请求方和应答方之间“可靠”地传输数据。

“可靠”只是向使用者提供了一个“承诺”，会在下层用多种手段“尽量”保证数据的完整送达。

- **应用层协议**
> 第三个特点，HTTP 协议是一个应用层的协议。

在 TCP/IP 诞生后的几十年里，虽然出现了许多的应用层协议，但它们都仅关注很小的应用领域。例如 FTP 只能传输文件、SMTP 只能发送邮件、SSH 只能远程登录等。

HTTP 凭借着可携带任意头字段和实体数据的报文结构，以及连接控制、缓存代理等方便易用的特性，迅速成为了应用层里的“明星”协议。

- **请求 - 应答**
> 第四个特点，HTTP 协议使用的是 请求 - 应答 通信模式。

这个请求 - 应答模式是 HTTP 协议最根本的通信模型，通俗来讲就是“一发一收”“有来有去”。请求 - 应答模式也明确了 HTTP 协议里通信双方的定位，永远是请求方先发起连接和请求，是主动的，而应答方只有在收到请求后才能答复，是被动的，如果没有请求时不会有任何动作。

HTTP 的请求 - 应答模式也恰好契合了传统的 C/S（Client/Server）系统架构，请求方作为客户端、应答方作为服务器。所以，随着互联网的发展就出现了 B/S（Browser/Server）架构，用轻量级的浏览器代替笨重的客户端应用，实现零维护的“瘦”客户端，而服务器则摈弃私有通信协议转而使用 HTTP 协议。


- **无状态**
> 第五个特点，HTTP 协议是无状态的。

“状态”其实就是客户端或者服务器里保存的一些数据或者标志，记录了通信过程中的一些变化信息。


TCP 协议是有状态的，一开始处于 CLOSED 状态，连接成功后是 ESTABLISHED 状态，断开连接后是 FIN-WAIT 状态，最后又是 CLOSED 状态。

对比 TCP ，HTTP 在整个协议里没有规定任何的“状态”，客户端和服务器永远是处在一种“无知”的状态。建立连接前两者互不知情，每次收发的报文也都是互相独立的，没有任何的联系。收发报文也不会对客户端或服务器产生任何影响，连接后也不会要求保存任何信息。
> 对比一下 **UDP** 协议，不过它是无连接也无状态的，**顺序发包乱序收包**，数据包发出去后就不管了，收到后也不会顺序整理。而 HTTP 是**有连接无状态，顺序发包顺序收包**，按照收发的顺序管理报文。

- **其他特点**
> 除了以上的五大特点，其实 HTTP 协议还可以列出非常多的特点，例如**传输的实体数据可缓存可压缩、可分段获取数据、支持身份认证、支持国际化语言**等。但这些并不能算是 HTTP 的基本特点，因为这都是由第一个“灵活可扩展”的特点所衍生出来的。


### HTTP的优缺点
> 注：这里讨论范围仅限于 HTTP/1.1，所说的优点和缺点也仅针对 HTTP/1.1。

::: tip 优点：
- **简单、灵活、易于扩展**
- **应用广泛、环境成熟**
- **无状态**
    - 因为服务器没有“记忆能力”，所以就不需要额外的资源来记录状态信息，能减轻服务器的负担，能够把更多的 CPU 和内存用来对外提供服务。
    - “无状态”也表示服务器都是相同的，没有“状态”的差异，所以可以很容易地组成集群，让负载均衡把请求转发到任意一台服务器，不会因为状态不一致导致处理出错。
- **明文**
    - 不需要借助任何外部工具，用浏览器、Wireshark 或者 tcpdump 抓包后，直接用肉眼就可以很容易地查看或者修改，为我们的开发调试工作带来极大的便利。
:::

::: tip 缺点：
- **无状态**
    - 既然服务器没有“记忆能力”，它就无法支持需要连续多个步骤的“事务”操作。例如电商购物，首先要登录，然后添加购物车，再下单、结算、支付，这一系列操作都需要知道用户的身份才行，但“无状态”服务器是不知道这些请求是相互关联的，每次都得问一遍身份信息，不仅麻烦，而且还增加了不必要的数据传输量。
- **明文**
    - HTTP 报文的所有信息都会暴露在“光天化日之下”，在漫长的传输链路的每一个环节上都毫无隐私可言，不怀好意的人只要侵入了这个链路里的某个设备，就可以实现对通信的窥视。
    > **免费 WiFi 陷阱**：黑客就是利用了 HTTP 明文传输的缺点，在公共场所架设一个 WiFi 热点开始“钓鱼”，诱骗网民上网。一旦你连上了这个 WiFi 热点，所有的流量都会被截获保存，里面如果有银行卡号、网站密码等敏感信息的话那就危险了，黑客拿到了这些数据就可以冒充你为所欲为。
- **不安全**
    > 安全有很多的方面，在“身份认证”和“完整性校验”这两方面 HTTP 也是欠缺的；信息在传输过程中很容易被篡改。为了解决 HTTP 不安全的缺点，所以就出现了 HTTPS。

- **性能**
    > 现在互联网的特点是移动和高并发，而“请求 - 应答”模式则加剧了 HTTP 的性能问题，这就是著名的“队头阻塞”（Head-of-line blocking），当顺序发送的请求序列中的一个请求因为某种原因被阻塞时，在后面排队的所有请求也一并被阻塞，会导致客户端迟迟收不到数据。为了解决这个问题，HTTP 官方标准里就有“缓存”一章，后面也出现了 HTTP/2 和 HTTP/3。
:::


## HTTP传输大文件的方法

### 数据压缩
通常浏览器在发送请求时都会带着“Accept-Encoding”头字段，里面是浏览器支持的压缩格式列表，例如 gzip、deflate、br 等，这样服务器就可以从中选择一种压缩算法，放进“Content-Encoding”响应头里，再把原数据压缩后发给浏览器。
> gzip 等压缩算法通常只对文本文件有较好的压缩率，而图片、音频视频等多媒体数据本身就已经是高度压缩的，再用 gzip 处理也不会变小（甚至还有可能会增大一点）。

### 分块传输
在响应报文里用头字段“Transfer-Encoding: chunked”来表示分块传输，意思是报文里的 body 部分不是一次性发过来的，而是分成了许多的块（chunk）逐个发送。

分块传输也可以用于“流式数据”，例如由数据库动态生成的表单页面，这种情况下 body 数据的长度是未知的，无法在头字段“Content-Length”里给出确切的长度，所以也只能用 chunked 方式分块发送。
> “Transfer-Encoding: chunked”和“Content-Length”这两个字段是互斥的，也就是说响应报文里这两个字段不能同时出现，一个响应报文的传输要么是长度已知，要么是长度未知（chunked）。

::: tip 分块传输的编码规则:
1. 每个分块包含两个部分，长度头和数据块；
2. 长度头是以 CRLF（回车换行，即\r\n）结尾的一行明文，用 16 进制数字表示长度；
3. 数据块紧跟在长度头后，最后也用 CRLF 结尾，但数据不包含 CRLF；
4. 最后用一个长度为 0 的块表示结束，即“0\r\n\r\n”。
:::
如图：
<img class="zoom-custom-imgs" :src="$withBase('/images/https/http204.png')" width="auto"/>


### 范围请求
> 有了分块传输编码，服务器就可以轻松地收发大文件了，但想获取一个大文件其中的片段数据，分块传输并没有这个能力。

HTTP 协议为了满足这样的需求，提出了**范围请求**（range requests）的概念，允许客户端在请求头里使用专用字段来表示只获取文件的一部分。

服务器在响应头里使用字段**Accept-Ranges: bytes**则表示支持范围请求。如果服务器发送**Accept-Ranges: none**，或**不发送“Accept-Ranges”字段**，就表示不支持范围请求。

请求头 **Range** 是 HTTP 范围请求的专用字段，格式是**bytes=x-y**，其中的 x 和 y 是以字节为单位的数据范围。
::: tip 假设文件是 100 个字节，那么：
- "0-9"表示前 10 个字节；
- “10-19”表示第二个10字节；
- “0-”表示从文档起点到文档终点，相当于“0-99”，即整个文件；
- “10-”是从第 10 个字节开始到文档末尾，相当于“10-99”；
- “-1”是文档的最后一个字节，相当于“99-99”；
- “-10”是从文档末尾倒数 10 个字节，相当于“90-99”。
:::

服务器收到 Range 字段后，需要做四件事：
1. 第一，它必须检查范围是否合法，比如文件只有 100 个字节，但请求“200-300”，这就是范围越界了。服务器就会返回状态码 416，意思是“范围请求有误，再检查一下”。
2. 第二，如果范围正确，服务器就可以根据 Range 头计算偏移量，读取文件的片段了，返回状态码“206 Partial Content”。
3. 第三，服务器要添加一个响应头字段 **Content-Range**，告诉片段的实际偏移量和资源的总大小，格式是**bytes x-y/length**。
4. 最后直接把片段用 TCP 发给客户端，一个范围请求就算是处理完了。

例：
``` shell
###### 发送的请求报文 ########
GET /16-2 HTTP/1.1
Host: www.chrono.com
Range: bytes=0-31 # 获取了文件的前 32 个字节


###### 返回的响应报文 ########
HTTP/1.1 206 Partial Content
Content-Length: 32
Accept-Ranges: bytes
Content-Range: bytes 0-31/96 # 返回文件的前 32 个字节，并返回文件总长度 96 字节
```
> 有了范围请求之后，HTTP 处理大文件就更加轻松了，看视频时可以根据时间点计算出文件的 Range，不用下载整个文件，直接精确获取片段所在的数据内容。

常用的下载工具里的**多段下载、断点续传**也是基于它实现的：
::: tip 要点：
1. 先发个 HEAD，看服务器是否支持范围请求，同时获取文件的大小；
2. 开 N 个线程，每个线程使用 Range 字段划分出各自负责下载的片段，发请求传输数据；
3. 下载意外中断也不怕，不必重头再来一遍，只要根据上次的下载记录，用 Range 请求剩下的那一部分就可以了。
:::


### 多段数据
> 刚才说的范围请求一次只获取一个片段，其实它还支持在 Range 头里使用多个“x-y”，一次性获取多个片段数据。

这种情况需要使用一种特殊的 **MIME** 类型：**multipart/byteranges**，表示报文的 body 是由多段字节序列组成的，并且还要用一个参数**boundary=xxx**给出段之间的分隔标记。

多段数据的格式与分块传输也比较类似，但它需要用分隔标记 boundary 来区分不同的片段，可以通过图来对比一下：

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http404.png')" width="auto"/>

> 每一个分段必须以“- -boundary”开始（前面加两个“-”），之后要用“Content-Type”和“Content-Range”标记这段数据的类型和所在范围，然后就像普通的响应头一样以回车换行结束，再加上分段数据，最后用一个“- -boundary- -”（前后各有两个“-”）表示所有的分段结束。

例：
``` shell
GET /16-2 HTTP/1.1
Host: www.chrono.com
Range: bytes=0-9, 20-29  # 发出两个范围的请求
```
返回结果：
``` shell
HTTP/1.1 206 Partial Content
Content-Type: multipart/byteranges; boundary=00000000001
Content-Length: 189
Connection: keep-alive
Accept-Ranges: bytes


--00000000001
Content-Type: text/plain
Content-Range: bytes 0-9/96

// this is
--00000000001
Content-Type: text/plain
Content-Range: bytes 20-29/96

ext json d
--00000000001--
```
> 报文里的“- -00000000001”就是多段的分隔符，使用它客户端就可以很容易地区分出多段 Range 数据。



## HTTP的连接管理

### 短连接
> HTTP 协议最初（0.9/1.0）是个非常简单的协议，通信过程也采用了简单的“请求 - 应答”方式。

它底层的数据传输基于 TCP/IP，每次发送请求前需要先与服务器建立连接，收到响应报文后会立即关闭连接。

因为客户端与服务器的整个连接过程很短暂，不会与服务器保持长时间的连接状态，所以就被称为**短连接**（short-lived connections）。早期的 HTTP 协议也被称为是**无连接**的协议。

短连接的缺点相当严重，因为在 TCP 协议里，建立连接和关闭连接都是非常“昂贵”的操作。


### 长连接
> 针对短连接暴露出的缺点，HTTP 协议就提出了“长连接”的通信方式，也叫“持久连接”（persistent connections）、“连接保活”（keep alive）、“连接复用”（connection reuse）。

其实解决办法也很简单，用的就是**成本均摊**的思路，既然 TCP 的连接和关闭非常耗时间，那么就把这个时间成本由原来的一个“请求 - 应答”均摊到多个“请求 - 应答”上。

- **短连接 vs 长连接**：

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http402.png')" width="auto"/>

- **连接相关的头字段**

可以在请求头里明确地要求使用长连接机制，使用的字段是 **Connection**，值是 **keep-alive**。

但如果 TCP 连接长时间不关闭，服务器必须在内存里保存它的状态，这就占用了服务器的资源。在客户端，可以在请求头里加上**Connection: close**字段，告诉服务器：“这次通信后就关闭连接”。

服务器端通常不会主动关闭连接，但也可以使用一些策略。拿 Nginx 来举例，它有两种方式：
1. 使用**keepalive_timeout**指令，设置长连接的超时时间，如果在一段时间内连接上没有任何数据收发就主动断开连接，避免空闲连接占用系统资源。
2. 使用**keepalive_requests**指令，设置长连接上可发送的最大请求次数。比如设置成 1000，那么当 Nginx 在这个连接上处理了 1000 个请求后，也会主动断开连接。

### 队头阻塞
“队头阻塞”（Head-of-line blocking），也叫“队首阻塞”。

因为 HTTP 规定报文必须是“一发一收”，这就形成了一个先进先出的“串行”队列。队列里的请求没有轻重缓急的优先级，只有入队的先后顺序，排在最前面的请求被最优先处理。

如果队首的请求因为处理的太慢耽误了时间，那么队列里后面的所有请求也不得不跟着一起等待，结果就是其他的请求承担了不应有的时间成本。

因为“请求 - 应答”模型不能变，所以“队头阻塞”问题在 HTTP/1.1 里无法解决，只能缓解，有什么办法呢？

- **并发连接（concurrent connections）**

同时对一个域名发起多个长连接，用数量来解决质量的问题。
> 但这种方式也存在缺陷。如果每个客户端都想自己快，建立很多个连接，用户数×并发数就会是个天文数字。服务器的资源根本就扛不住，或者被服务器认为是恶意攻击，反而会造成“拒绝服务”。

- **域名分片（domain sharding）**

HTTP 协议和浏览器会限制并发连接数量，那就多开几个域名，这些域名都指向同一台服务器，这样实际长连接的数量就又上去了。还是用数量来解决质量的思路。


### 备注
1. 利用 HTTP 长连接特性对服务器发起大量请求，导致服务器最终耗尽资源“拒绝服务”，这就是常说的**DDoS**。





## HTTP的Cookie机制

> HTTP 协议是可扩展的，Cookie 技术给 HTTP 增加了“记忆能力”。

Cookie 就是服务器委托浏览器存储在客户端里的一些数据，而这些数据通常都会记录用户的关键识别信息。

### Cookie 的工作过程

1. 当用户通过浏览器第一次访问服务器的时候，服务器肯定是不知道他的身份的。所以，就要创建一个独特的身份标识数据，格式是**key=value**，然后放进 **Set-Cookie** 字段里，随着响应报文一同发给浏览器。
2. 浏览器收到响应报文，看到里面有 Set-Cookie，知道这是服务器给的身份标识，于是就保存起来，下次再请求的时候就自动把这个值放进 **Cookie** 字段里发给服务器。
> 服务器有时会在响应头里添加多个 Set-Cookie，存储多个“key=value”。但浏览器这边发送时不需要用多个 Cookie 字段，只要在一行里用“;”隔开就行。

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http401.png')" width="auto"/>

### Cookie 的属性

- **Cookie 的生存周期**
> Cookie 的生存周期可以使用 Expires 和 Max-Age 两个属性来设置。
1. **Expires** 俗称“过期时间”，用的是绝对时间点，可以理解为“截止日期”（deadline）。
2. **Max-Age** 用的是相对时间，单位是秒，浏览器用收到报文的时间点再加上 Max-Age，就可以得到失效的绝对时间。

浏览器会优先采用 Max-Age 计算失效期。


- **Cookie 的作用域**
> 让浏览器仅发送给特定的服务器和 URI，避免被其他网站盗用。

**Domain**和**Path**指定了 Cookie 所属的域名和路径，浏览器在发送 Cookie 前会从 URI 中提取出 host 和 path 部分，对比 Cookie 的属性。如果不满足条件，就不会在请求头里发送 Cookie。


- **Cookie 的安全性**
> 在 JS 脚本里可以用 document.cookie 来读写 Cookie 数据，这就带来了安全隐患，有可能会导致“跨站脚本”（XSS）攻击窃取数据。

1. 属性**HttpOnly**会告诉浏览器，此 Cookie 只能通过浏览器 HTTP 协议传输，禁止其他方式访问，浏览器的 JS 引擎就会禁用 document.cookie 等一切相关的 API。
2. 另一个属性**SameSite**可以防范“跨站请求伪造”（XSRF）攻击，设置成**SameSite=Strict**可以严格限定 Cookie 不能随着跳转链接跨站发送，而**SameSite=Lax**则略宽松一点，允许 GET/HEAD 等安全方法，但禁止 POST 跨站发送。
3. 还有一个属性叫**Secure**，表示这个 Cookie 仅能用 HTTPS 协议加密传输，明文的 HTTP 协议会禁止发送。但 Cookie 本身不是加密的，浏览器里还是以明文的形式存在。


### Cookie 的应用

- 身份识别
> 保存用户的登录信息，实现会话事务。

- 广告跟踪
> 上网的时候肯定看过很多的广告图片，这些图片背后都是广告商网站（例如 Google），它会“偷偷地”给你贴上 Cookie，这样你上其他的网站，别的广告就能用 Cookie 读出你的身份，然后做行为分析，再推给你广告。

这种 Cookie 不是由访问的主站存储的，所以又叫“第三方 Cookie”（third-party cookie）。




## HTTP的缓存控制
缓存（Cache）是计算机领域里的一个重要概念，是优化系统性能的利器。
> 由于链路漫长，网络时延不可控，浏览器使用 HTTP 获取资源的成本较高。所以，非常有必要把“来之不易”的数据缓存起来，下次再请求的时候尽可能地复用。这样，就可以避免多次请求 - 应答的通信成本，节约网络带宽，也可以加快响应速度。

实际上，HTTP 传输的每一个环节基本上都会有缓存，基于“请求 - 应答”模式的特点，可以大致分为**客户端缓存**和**服务器端缓存**。

### 服务器的缓存控制

::: tip 流程：
1. 浏览器发现缓存无数据，于是发送请求，向服务器获取资源；
2. 服务器响应请求，返回资源，同时标记资源的有效期；
3. 浏览器缓存资源，等待下次重用。
:::

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http501.png')" width="auto"/>

服务器标记资源有效期使用的头字段是**Cache-Control**，里面的值**max-age=30**就是资源的**有效时间**，相当于告诉浏览器，“这个页面只能缓存 30 秒，之后就算是过期，不能用。”
> 这里的 max-age 是“生存时间”（又叫“新鲜度”“缓存寿命”，类似 TTL，Time-To-Live），时间的计算起点是响应报文的创建时刻（即 Date 字段，也就是离开服务器的时刻），而不是客户端收到报文的时刻，也就是说包含了在链路传输过程中所有节点所停留的时间。

“max-age”是 HTTP 缓存控制最常用的属性，此外在响应报文里还可以用其他的属性来更精确地指示浏览器应该如何使用缓存：
- **no-store**：**不允许缓存**，用于某些变化非常频繁的数据，例如秒杀页面；
- **no-cache**：它的字面含义容易与 no-store 搞混，实际的意思并不是不允许缓存，而是**可以缓存，但在使用之前必须要去服务器验证是否过期**，是否有最新的版本；
- **must-revalidate**：又是一个和 no-cache 相似的词，它的意思是**如果缓存不过期就可以继续使用，但过期了如果还想用就必须去服务器验证**。

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http502.png')" width="auto"/>


### 客户端的缓存控制
>其实不止服务器可以发“Cache-Control”头，浏览器也可以发“Cache-Control”，也就是说请求 - 应答的双方都可以用这个字段进行缓存控制，互相协商缓存的使用策略。

- 浏览器进行**刷新**时，会在请求头里加一个“Cache-Control: max-age=0”。本地缓存里的数据至少保存了几秒钟，所以浏览器就不会使用缓存，而是向服务器发请求。服务器看到 max-age=0，也就会用一个最新生成的报文回应浏览器。

- 浏览器在进行**前进、后退、跳转**这些重定向动作时，只用最基本的请求头，没有“Cache-Control”，所以就会检查缓存，直接利用之前的资源，不再进行网络通信。

#### 条件请求
> 浏览器用“Cache-Control”做缓存控制只能是刷新数据，不能很好地利用缓存数据，又因为缓存会失效，使用前还必须要去服务器验证是否是最新版。

HTTP 协议定义了一系列“If”开头的“条件请求”字段，专门用来检查验证资源是否过期，把两个请求才能完成的工作合并在一个请求里做。而且，验证的责任也交给服务器。

- **if-Modified-Since/Last-modified 和 If-None-Match/ETag**
1. 条件请求一共有 5 个头字段，我们最常用的是 **if-Modified-Since** 和 **If-None-Match** 这两个。需要第一次的响应报文预先提供**Last-modified**和**ETag**，然后第二次请求时就可以带上缓存里的原值，验证资源是否是最新的。
2. 如果资源没有变，服务器就回应一个**304 Not Modified**，表示缓存依然有效，浏览器就可以更新一下有效期，然后放心大胆地使用缓存了。

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http503.png')" width="auto"/>

- **Last-modified** 就是文件的最后修改时间。

 - **ETag** 是“实体标签”（Entity Tag）的缩写，是**资源的一个唯一标识**，主要是用来解决修改时间无法准确区分文件变化的问题。
    > 比如，一个文件在一秒内修改了多次，但因为修改时间是秒级，所以这一秒内的新版本无法区分。
    
    > 再比如，一个文件定期更新，但有时会是同样的内容，实际上没有变化，用修改时间就会误以为发生了变化，传送给浏览器就会浪费带宽。

    ETag 还有“强”“弱”之分；强 ETag 要求资源在字节级别必须完全相符，弱 ETag 在值前有个“W/”标记，只要求资源在语义上没有变化，但内部可能会有部分发生了改变（例如 HTML 里的标签顺序调整，或者多了几个空格）。

    使用 ETag 就可以精确地识别资源的变动情况，让浏览器能够更有效地利用缓存。

- **其他**
> 条件请求里其他的三个头字段是“If-Unmodified-Since”“If-Match”和“If-Range”，其实只要你掌握了“if-Modified-Since”和“If-None-Match”，可以轻易地“举一反三”。


### 备注

1. Cache 和 Cookie 都是服务器发给客户端并存储的数据，你能比较一下两者的异同吗？
- 相同点：都会保存到浏览器中，并可以设置过期时间。
- 不同点：
    - Cookie 会随请求报文发送到服务器，而 Cache 不会，但可能会携带 if-Modified-Since（保存资源的最后修改时间）和 If-None-Match（保存资源唯一标识） 字段来验证资源是否过期。
    - Cookie 在浏览器可以通过脚本获取（如果 cookie 没有设置 HttpOnly），Cache 则无法在浏览器中获取（出于安全原因）。
    - Cookie 通过响应报文的 Set-Cookie 字段获得，cache 缓存的是完整的报文。
    - 用途不同。Cookie 常用于身份识别，Cache 则是由浏览器管理，用于节省带宽和加快响应速度。
    - Cookie 的 max-age 是从浏览器拿到响应报文时开始计算的，而 Cache 的 max-age 是从响应报文的生成时间（Date 头字段）开始计算。

2. 即使有“Last-modified”和“ETag”，强制刷新（Ctrl+F5）也能够从服务器获取最新数据（返回 200 而不是 304），观察请求头和响应头，解释原因。
> 强制刷新后请求头中 没有了 If-None-Match ，而且 Cache-Control: no-cache；没有条件请求头，那么服务器就无法处理缓存，就只能返回最新的数据。


## HTTP的代理服务
链条的起点还是客户端（也就是浏览器），中间的角色被称为代理服务器（proxy server），链条的终点被称为源服务器（origin server），意思是数据的“源头”“起源”。

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http504.png')" width="auto"/>

### 代理服务
所谓的“代理服务”就是指**服务本身不生产内容，而是处于中间位置转发上下游的请求和响应，具有双重身份**：面向下游的用户时，表现为服务器，代表源服务器响应客户端的请求；而面向上游的源服务器时，又表现为客户端，代表客户端发送请求。

概览篇中讲过代理有很多种类，如匿名代理、正向代理、反向代理，这里主要讲的是反向代理。

### 代理的作用

- **负载均衡**

因为在面向客户端时屏蔽了源服务器，客户端看到的只是代理服务器，源服务器究竟有多少台、是哪些 IP 地址都不知道。于是代理服务器就可以掌握请求分发的“大权”，决定由后面的哪台服务器来响应请求。
> 代理中常用的负载均衡算法有轮询、一致性哈希等等，这些算法的目标都是尽量把外部的流量合理地分散到多台源服务器，提高系统的整体资源利用率和性能。

- **健康检查**：使用“心跳”等机制监控后端服务器，发现有故障就及时“踢出”集群，保证服务高可用；
- **安全防护**：保护被代理的后端服务器，限制 IP 地址或流量，抵御网络攻击和过载；
- **加密卸载**：对外网使用 SSL/TLS 加密通信认证，而在安全的内网不加密，消除加解密成本；
- **数据过滤**：拦截上下行的数据，任意指定策略修改请求或者响应；
- **内容缓存**：暂存、复用服务器响应。


### 代理相关头字段

1. 代理服务器需要用字段**Via**标明代理的身份
    
    Via 是一个通用字段，请求头或响应头里都可以出现。每当报文经过一个代理节点，代理服务器就会把自身的信息追加到字段的末尾，就像是经手人盖了一个章。
    > 如果通信链路中有很多中间代理，就会在 Via 里形成一个链表，这样就可以知道报文究竟走过了多少个环节才到达了目的地。

2. **X-Forwarded-For**和**X-Real-IP**
    > Via 字段只解决了客户端和源服务器判断是否存在代理的问题，还不能知道对方的真实信息。
    - **X-Forwarded-For**的字面意思是“为谁而转发”，形式上和“Via”差不多，也是每经过一个代理节点就会在字段里追加一个信息。但“Via”追加的是代理主机名（或者域名），而“X-Forwarded-For”追加的是请求方的 IP 地址。所以，在字段里最左边的 IP 地址就是客户端的地址。
    - **X-Real-IP**是另一种获取客户端真实 IP 的手段，它的作用很简单，就是记录客户端 IP 地址，没有中间的代理信息，相当于是“X-Forwarded-For”的简化版。如果客户端和源服务器之间只有一个代理，那么这两个字段的值就是相同的。

### 代理协议
> 通过“X-Forwarded-For”操作代理信息必须要解析 HTTP 报文头，这对于代理来说成本比较高，必须要解析数据再修改数据，会降低代理的转发性能；如果 HTTPS 通信被加密时，则不能修改原始报文获取 X-Forwarded-For 等头字段。

所以就出现了一个专门的**代理协议**（The PROXY protocol），它由知名的代理软件 HAProxy 所定义，也是一个“事实标准”，被广泛采用（注意并不是 RFC）。

“代理协议”有 v1 和 v2 两个版本，v1 和 HTTP 差不多，也是明文，而 v2 是二进制格式。今天只介绍比较好理解的 v1，它在 HTTP 报文前增加了一行 ASCII 码文本，相当于又多了一个头。
> 这一行文本开头必须是“PROXY”五个大写字母，然后是“TCP4”或者“TCP6”，表示客户端的 IP 地址类型，再后面是请求方地址、应答方地址、请求方端口号、应答方端口号，最后用一个回车换行（\r\n）结束。

例：
``` shell
PROXY TCP4 1.1.1.1 2.2.2.2 55555 80\r\n
GET / HTTP/1.1\r\n
Host: www.xxx.com\r\n
\r\n
```
> 在 GET 请求行前多出了 PROXY 信息行，客户端的真实 IP 地址是“1.1.1.1”，端口号是 55555:

服务器看到这样的报文，只要解析第一行就可以拿到客户端地址，不需要再去理会后面的 HTTP 数据，省了很多事情。


### 缓存代理服务
> HTTP 传输链路上，不只是客户端有缓存，服务器上的缓存也是非常有价值的，可以让请求不必走完整个后续处理流程，“就近”获得响应结果。

HTTP 的**服务器缓存**功能主要由代理服务器来实现（即**缓存代理**），而源服务器系统内部虽然也经常有各种缓存，但与 HTTP 没有太多关系。

- 代理服务收到源服务器发来的响应数据后先把报文转发给客户端，再把报文存入自己的 Cache 里。
- 下一次再有相同的请求，代理服务器就可以直接发送304和缓存数据，不必再从源服务器那里获取。

它“即是客户端又是服务器”，是因为它面向源服务器时是客户端，在面向客户端时又是服务器，所以它即可以用客户端的缓存控制策略也可以用服务器端的缓存控制策略。


#### 源服务器的缓存控制
> 前面讲过 4 种服务器端的“Cache-Control”属性：max-age、no-store、no-cache 和 must-revalidate，除此之外，还需要一些限制条件：
1. 首先，我们要区分客户端上的缓存和代理上的缓存，可以使用两个新属性 **private** 和 **public** 。
    - “private”表示缓存只能在客户端保存，是用户“私有”的，不能放在代理上与别人共享。而“public”的意思就是缓存完全开放，谁都可以存，谁都可以用。
2. 其次，缓存失效后的重新验证也要区分开（即使用条件请求“Last-modified”和“ETag”），“must-revalidate”是只要过期就必须回源服务器验证，而新的 **proxy-revalidate** 只要求代理的缓存过期后必须验证，客户端不必回源，只验证到代理这个环节就行了。
3. 再次，缓存的生存时间可以使用新的 **s-maxage** （s 是 share 的意思），只限定在代理上能够存多久，而客户端仍然使用“max-age”。
4. 还有一个代理专用的属性 **no-transform** 。代理有时候会对缓存下来的数据做一些优化，比如把图片生成 png、webp 等几种格式，方便今后的请求处理，而“no-transform”就会禁止这样做。

下面的流程图是完整的服务器端缓存控制策略，可以同时控制客户端和代理：

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http505.png')" width="auto"/>

> 源服务器在设置完“Cache-Control”后必须要为报文加上“Last-modified”或“ETag”字段。否则，客户端和代理后面就无法使用条件请求来验证缓存是否有效，也就不会有 304 缓存重定向。


#### 客户端的缓存控制
客户端在 HTTP 缓存体系里要面对的是代理和源服务器，也必须区别对待，这里直接上图：

<img class="zoom-custom-imgs" :src="$withBase('/images/https/http406.png')" width="auto"/>

> max-age、no-store、no-cache 这三个属性已经介绍过了，它们也是同样作用于代理和源服务器；关于缓存的生存时间，多了两个新属性“max-stale”和“min-fresh”。

**max-stale**的意思是如果代理上的缓存过期了也可以接受，但不能过期太多，超过 x 秒也会不要。**min-fresh**的意思是缓存必须有效，而且必须在 x 秒后依然有效。
> 比如，草莓上贴着标签“max-age=5”，现在已经在冰柜里存了 7 天。如果有请求“max-stale=2”，意思是过期两天也能接受，所以刚好能卖出去。但要是“min-fresh=1”，这是绝对不允许过期的，就不会买走。这时如果有另外一个菠萝是“max-age=10”，那么“7+1<10”，在一天之后还是新鲜的，所以就能卖出去。

有的时候客户端还会发出一个特别的**only-if-cached**属性，表示只接受代理缓存的数据，不接受源服务器的响应。如果代理上没有缓存或者缓存过期，就应该给客户端返回一个 **504**（Gateway Timeout）。


#### 缓存清理
**Purge**，也就是“缓存清理”，它对于代理也是非常重要的功能，例如：
- 过期的数据应该及时淘汰，避免占用空间；
- 源站的资源有更新，需要删除旧版本，主动换成最新版（即刷新）；
- 有时候会缓存了一些本不该存储的信息，例如网络谣言或者危险链接，必须尽快把它们删除。

清理缓存的方法有很多，比较常用的一种做法是使用自定义请求方法“PURGE”，发给代理服务器，要求删除 URI 对应的缓存数据。


## 其他
### 安全与幂等
> 关于HTTP请求方法还有两个面试时有可能会问到、比较重要的概念：安全与幂等。

在 HTTP 协议里，所谓的**安全**是指请求方法不会“破坏”服务器上的资源，即不会对服务器上的资源造成实质的修改。
>  GET 和 HEAD 方法是“安全”的，因为它们是“只读”操作，无论 GET 和 HEAD 操作多少次，服务器上的数据都是“安全的”。而 POST/PUT/DELETE 操作会修改服务器上的资源，增加或删除数据，所以是“不安全”的。

所谓的**幂等**实际上是一个数学用语，被借用到了 HTTP 协议里，意思是多次执行相同的操作，结果也都是相同的，即多次“幂”后结果“相等”。
> GET 和 HEAD 既是安全的也是幂等的，DELETE 可以多次删除同一个资源，效果都是“资源不存在”，所以也是幂等的。POST 是“新增或提交数据”，多次提交数据会创建多个资源，所以不是幂等的；而 PUT 是“替换或更新数据”，多次更新一个资源，资源还是第一次更新的状态，所以是幂等的。





## 问题记录
1. 如果拼 HTTP 报文的时候，在头字段后多加了一个 CRLF，导致出现了一个空行，会发生什么？
> 在header 下面第一个空行以后都会被当作body 体

2. 讲头字段时说“:”后的空格可以有多个，那为什么绝大多数情况下都只使用一个空格呢？
> 头部多一个空格就会多一个传输的字节，去掉无用的信息，保证传输的头部字节数尽量小


<fix-link label="Back" href="/tool/http/"></fix-link>

<!-- 2021-05-04 -->
---
title: JS深入：js的跨域解决方案
date: 2021-05-18 22:19:54
permalink: /pages/870d2f/
categories:
  - js
tags:
  - js基础
---

# JS深入：js的跨域解决方案

这里是我的JS跨域解决方案学习笔记，以下例子均来自优秀网友们的智慧，我只是个搬运工~



## 跨域

### 同源策略
同源策略是一个重要的安全策略，它用于限制一个origin的文档或者它加载的脚本如何能与另一个源的资源进行交互。它能帮助阻隔恶意文档，减少可能被攻击的媒介。[MDN](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)

同源策略是一种约定，它是浏览器最核心也最基本的安全功能，如果缺少了同源策略，浏览器很容易受到XSS、CSRF等攻击。所谓同源是指**协议+域名+端口**三者相同，即便两个不同的域名指向同一个ip地址，也非同源。
> 当协议、子域名、主域名、端口号中任意一个不相同时，都算作不同域。不同域之间相互请求资源，就算作“跨域”。

**同源策略限制内容有**
- Cookie、LocalStorage、IndexedDB 等存储性内容
- DOM 节点
- AJAX 请求发送后，结果被浏览器拦截了

但有三个标签是允许跨域加载资源：`<img src=XXX>、<link href=XXX>、<script src=XXX>`

**跨域并不是请求发不出去，请求能发出去，服务端能收到请求并正常返回结果，只是结果被浏览器拦截了。** 跨域是为了阻止用户读取到另一个域名下的内容，Ajax 可以获取响应，浏览器认为这不安全，所以拦截了响应。



## 跨域解决方案


### JSONP
利用 `<script>` 标签没有跨域限制的漏洞，网页可以得到从其他来源动态产生的 JSON 数据。JSONP请求一定需要对方的服务器做支持才可以。


- **JSONP和AJAX对比**
> JSONP和AJAX相同，都是客户端向服务器端发送请求，从服务器端获取数据的方式。但AJAX属于同源策略，JSONP属于非同源策略（跨域请求）。


JSONP优点是简单兼容性好，可用于解决主流浏览器的跨域数据访问的问题。**缺点是仅支持get方法具有局限性,不安全可能会遭受XSS攻击。**



**JSONP的实现流程**

- 客户端
``` js
////// index.html

// 封装一个jsonp方法
function jsonp({ url, params, callback }) {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script')
    window[callback] = function(data) {
      resolve(data)
      document.body.removeChild(script)
    }
    params = { ...params, callback } // wd=b&callback=show
    let arrs = []
    for (let key in params) {
      arrs.push(`${key}=${params[key]}`)
    }
    script.src = `${url}?${arrs.join('&')}`
    document.body.appendChild(script)
  })
}
jsonp({
  url: 'http://localhost:3000/say',
  params: { wd: 'Iloveyou' },
  callback: 'show'
}).then(data => { // 回调
  console.log(data)
})
```
上面这段代码相当于向`http://localhost:3000/say?wd=Iloveyou&callback=show`这个地址请求数据，然后后台返回`show('我不爱你')`，最后会运行`show()`这个函数，打印出`'我不爱你'`。

- 服务端
``` js
// server.js
let express = require('express')
let app = express()
app.get('/say', function(req, res) {
  let { wd, callback } = req.query
  console.log(wd) // Iloveyou
  console.log(callback) // show
  res.end(`${callback}('我不爱你')`)
})
app.listen(3000)

```

- JQuery的jsonp形式

JSONP都是GET和异步请求的，不存在其他的请求方式和同步请求，且jQuery默认就会给JSONP的请求清除缓存：
``` js
$.ajax({
    url:"http://crossdomain.com/jsonServerResponse",
    dataType:"jsonp",
    type:"get",//可以省略
    jsonpCallback:"show",//->自定义传递给服务器的函数名，而不是使用jQuery自动生成的，可省略
    jsonp:"callback",//->把传递函数名的那个形参callback，可省略
    success:function (data){
    console.log(data);}
});

```


### CORS
**跨源资源共享 (CORS)**（或通俗地译为跨域资源共享）是一种基于HTTP 头的机制，该机制通过允许服务器标示除了它自己以外的其它origin（域，协议和端口），这样浏览器可以访问加载这些资源。[MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)。
> 出于安全性，浏览器限制脚本内发起的跨源HTTP请求。 例如，XMLHttpRequest和Fetch API遵循同源策略。 这意味着使用这些API的Web应用程序只能从加载应用程序的同一个域请求HTTP资源，除非响应报文包含了正确CORS响应头。

跨源域资源共享（ CORS ）机制允许 Web 应用服务器进行跨源访问控制，从而使跨源数据传输得以安全进行。现代浏览器支持在 API 容器中（例如 XMLHttpRequest 或 Fetch ）使用 CORS，以降低跨源 HTTP 请求所带来的风险。

**跨源资源共享标准新增了一组 HTTP 首部字段，允许服务器声明哪些源站通过浏览器有权限访问哪些资源：**
- 对那些可能对服务器数据产生副作用的 HTTP 请求方法（特别是 GET 以外的 HTTP 请求，或者搭配某些 MIME 类型的 POST 请求），浏览器必须首先使用 OPTIONS 方法发起一个预检请求（preflight request），从而获知服务端是否允许该跨源请求。
- 服务器确认允许之后，才发起实际的 HTTP 请求。在预检请求的返回中，服务器端也可以通知客户端，是否需要携带身份凭证（包括 Cookies 和 HTTP 认证相关数据）。

**服务端设置 Access-Control-Allow-Origin 就可以开启 CORS。 该属性表示哪些域名可以访问资源，如果设置通配符则表示所有网站都可以访问资源。**

::: tip HTTP 响应首部字段
- `Access-Control-Allow-Origin: <origin> | *`: origin 参数的值指定了允许访问该资源的外域 URI。对于不需要携带身份凭证的请求，服务器可以指定该字段的值为通配符，表示允许来自所有域的请求。 
- `Access-Control-Expose-Headers: `: 在跨源访问时，XMLHttpRequest对象的getResponseHeader()方法只能拿到一些最基本的响应头，Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma，如果要访问其他头，则需要服务器设置本响应头。
    > Access-Control-Expose-Headers 头让服务器把允许浏览器访问的头放入白名单。
- `Access-Control-Max-Age`: Access-Control-Max-Age 头指定了预检请求的结果能够被缓存多久。
- `Access-Control-Allow-Credentials`: Access-Control-Allow-Credentials 头指定了当浏览器的credentials设置为true时是否允许浏览器读取response的内容。
:::

> 整个CORS通信过程，都是浏览器自动完成，不需要用户参与。对于开发者来说，CORS通信与同源的AJAX通信没有差别，代码完全一样。浏览器一旦发现AJAX请求跨源，就会自动添加一些附加的头信息，有时还会多出一次附加的请求，但用户不会有感觉。因此，实现CORS通信的关键是服务器。只要服务器实现了CORS接口，就可以跨源通信。

> 通过设置CORS解决跨域问题的话，会在发送请求时出现两种情况，分别为简单请求和复杂请求。

- **简单请求**

某些请求不会触发 CORS 预检请求，这样的请求为“简单请求”。

::: tip 若请求满足所有下述条件，则该请求可视为“简单请求”：
- 使用下列方法之一：GET、HEAD、POST
- 除了被用户代理自动设置的首部字段（例如 Connection ，User-Agent）和在 Fetch 规范中定义为 禁用首部名称 的其他首部，允许人为设置的字段为 Fetch 规范定义的 对 CORS 安全的首部字段集合。该集合为：Accept、Accept-Language、Content-Language、Content-Type （需要注意额外的限制）
    > WebKit Nightly 和 Safari Technology Preview 为Accept, Accept-Language, 和 Content-Language 首部字段的值添加了额外的限制。如果这些首部字段的值是“非标准”的，WebKit/Safari 就不会将这些请求视为“简单请求”。
- Content-Type 的值仅限于下列三者之一：text/plain、multipart/form-data、application/x-www-form-urlencoded
- 请求中的任意XMLHttpRequestUpload 对象均没有注册任何事件监听器；XMLHttpRequestUpload 对象可以使用 XMLHttpRequest.upload 属性访问。
- 请求中没有使用 ReadableStream 对象。
:::
这些跨站点请求与浏览器发出的其他跨站点请求并无二致。如果服务器未返回正确的响应首部，则请求方不会收到任何数据。



- **预检请求**

与前述简单请求不同，“需预检的请求”要求必须首先使用 OPTIONS 方法发起一个预检请求到服务器，以获知服务器是否允许该实际请求。"预检请求“的使用，可以避免跨域请求对服务器的用户数据产生未预期的影响。

- 例子：
``` js
// index.html
let xhr = new XMLHttpRequest()
document.cookie = 'name=xiamen' // cookie不能跨域
xhr.withCredentials = true // 前端设置是否带cookie
xhr.open('PUT', 'http://localhost:4000/getData', true)
xhr.setRequestHeader('name', 'xiamen')
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4) {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
      console.log(xhr.response)
      //得到响应头，后台需设置Access-Control-Expose-Headers
      console.log(xhr.getResponseHeader('name'))
    }
  }
}
xhr.send()
```

``` js
//server2.js
let express = require('express')
let app = express()
let whitList = ['http://localhost:3000'] //设置白名单
app.use(function(req, res, next) {
  let origin = req.headers.origin
  if (whitList.includes(origin)) {
    // 设置哪个源可以访问我
    res.setHeader('Access-Control-Allow-Origin', origin)
    // 允许携带哪个头访问我
    res.setHeader('Access-Control-Allow-Headers', 'name')
    // 允许哪个方法访问我
    res.setHeader('Access-Control-Allow-Methods', 'PUT')
    // 允许携带cookie
    res.setHeader('Access-Control-Allow-Credentials', true)
    // 预检的存活时间
    res.setHeader('Access-Control-Max-Age', 6)
    // 允许返回的头
    res.setHeader('Access-Control-Expose-Headers', 'name')
    if (req.method === 'OPTIONS') {
      res.end() // OPTIONS请求不做任何处理
    }
  }
  next()
})
app.put('/getData', function(req, res) {
  console.log(req.headers)
  res.setHeader('name', 'jw') //返回一个响应头，后台需设置
  res.end('我不爱你')
})
app.get('/getData', function(req, res) {
  console.log(req.headers)
  res.end('我不爱你')
})
app.use(express.static(__dirname))
app.listen(4000)

```

**浏览器支持情况**
> 当你使用 IE<=9, Opera<12, or Firefox<3.5 或者更加老的浏览器，这个时候请使用 JSONP 。




### postMessage
window.postMessage() 方法可以安全地实现跨源通信。通常，对于两个不同页面的脚本，只有当执行它们的页面位于具有相同的协议（通常为https），端口号（443为https的默认值），以及主机  (两个页面的模数 Document.domain设置为相同的值) 时，这两个脚本才能相互通信。window.postMessage() 方法提供了一种受控机制来规避此限制，只要正确的使用，这种方法就很安全。[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)

postMessage()方法允许来自不同源的脚本采用异步方式进行有限的通信，可以实现跨文本档、多窗口、跨域消息传递。

**例子**
> `http://localhost:3000/a.html`页面向`http://localhost:4000/b.html`传递`“我爱你”`,然后后者传回`"我不爱你"`

``` html
<!-- a.html -->

  <iframe src="http://localhost:4000/b.html" frameborder="0" id="frame" onload="load()"></iframe> 
  <!-- 等它加载完触发一个事件 -->
  <!-- 内嵌在http://localhost:3000/a.html -->
    <script>
      function load() {
        let frame = document.getElementById('frame')
        frame.contentWindow.postMessage('我爱你', 'http://localhost:4000') //发送数据
        window.onmessage = function(e) { //接受返回数据
          console.log(e.data) //我不爱你
        }
      }
    </script>

```

``` js
// b.html
  window.onmessage = function(e) {
    console.log(e.data) //我爱你
    e.source.postMessage('我不爱你', e.origin)
 }

```


### websocket
> Websocket是HTML5的一个持久化的协议，它实现了浏览器与服务器的全双工通信，同时也是跨域的一种解决方案。WebSocket和HTTP都是应用层协议，都基于 TCP 协议。

**WebSocket 是一种双向通信协议，在建立连接之后，WebSocket 的 server 与 client 都能主动向对方发送或接收数据。** 同时，WebSocket 在建立连接时需要借助 HTTP 协议，连接建立好了之后 client 与 server 之间的双向通信就与 HTTP 无关了。

> 关于websocket的具体介绍可以参考阮一峰的[WebSocket 教程](https://www.ruanyifeng.com/blog/2017/05/websocket.html)

- 例子：本地文件socket.html向localhost:3000发生数据和接受数据

``` js
// socket.html
<script>
    let socket = new WebSocket('ws://localhost:3000');
    socket.onopen = function () {
      socket.send('我爱你');//向服务器发送数据
    }
    socket.onmessage = function (e) {
      console.log(e.data);//接收服务器返回的数据
    }
</script>
```

``` js
// server.js
let express = require('express');
let app = express();
let WebSocket = require('ws');//记得安装ws
let wss = new WebSocket.Server({port:3000});
wss.on('connection',function(ws) {
  ws.on('message', function (data) {
    console.log(data);
    ws.send('我不爱你')
  });
})

```

### Node正向代理
同源策略是浏览器需要遵循的标准，而如果是服务器向服务器请求就无需遵循同源策略。 

代理服务器，需要做以下几个步骤：**接受客户端请求、将请求转发给服务器、拿到服务器响应数据、将响应转发给客户端。**

- 例子：本地文件`index.html`文件，通过代理服务器`http://localhost:3000`向目标服务器`http://localhost:4000`请求数据。
``` js
// index.html(http://127.0.0.1:5500)

 <script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
    <script>
      $.ajax({
        url: 'http://localhost:3000',
        type: 'post',
        data: { name: 'xiamen', password: '123456' },
        contentType: 'application/json;charset=utf-8',
        success: function(result) {
          console.log(result) // {"title":"fontend","password":"123456"}
        },
        error: function(msg) {
          console.log(msg)
        }
      })
     </script>
```
``` js
// server1.js 代理服务器(http://localhost:3000)

const http = require('http')
// 第一步：接受客户端请求
const server = http.createServer((request, response) => {
  // 代理服务器，直接和浏览器直接交互，需要设置CORS 的首部字段
  response.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  // 第二步：将请求转发给服务器
  const proxyRequest = http
    .request(
      {
        host: '127.0.0.1',
        port: 4000,
        url: '/',
        method: request.method,
        headers: request.headers
      },
      serverResponse => {
        // 第三步：收到服务器的响应
        var body = ''
        serverResponse.on('data', chunk => {
          body += chunk
        })
        serverResponse.on('end', () => {
          console.log('The data is ' + body)
          // 第四步：将响应结果转发给浏览器
          response.end(body)
        })
      }
    )
    .end()
})
server.listen(3000, () => {
  console.log('The proxyServer is running at http://localhost:3000')
})

```
``` js
// server2.js(http://localhost:4000)
const http = require('http')
const data = { title: 'fontend', password: '123456' }
const server = http.createServer((request, response) => {
  if (request.url === '/') {
    response.end(JSON.stringify(data))
  }
})
server.listen(4000, () => {
  console.log('The server is running at http://localhost:4000')
})

```
上述代码经过两次跨域，值得注意的是浏览器向代理服务器发送请求，也遵循同源策略，最后在`index.html`文件打印出`{"title":"fontend","password":"123456"}`


- 在webpack中可以配置proxy来快速获得接口代理的能力：
``` js
devServer: {
    port: 8000,
    proxy: {
      "/api": {
        target: "http://localhost:8080"
      }
    }
  },
```
> 比如在`vue-cli`项目中也会在`vue-config.js`中配置proxy，它们都是基于[http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)来实现代理配置的~



### Nginx反向代理
> 实现原理类似于Node正向代理，需要你搭建一个中转nginx服务器，用于转发请求。

使用nginx反向代理实现跨域，是最简单的跨域方式。只需要修改nginx的配置即可解决跨域问题，支持所有浏览器，支持session，不需要修改任何代码，并且不会影响服务器性能。

- 例子
> 实现思路：通过nginx配置一个代理服务器（域名与domain1相同，端口不同）做跳板机，反向代理访问domain2接口，并且可以顺便修改cookie中domain信息，方便当前域cookie写入，实现跨域登录。

1. 先下载[nginx](http://nginx.org/en/download.html)，然后将nginx目录下的nginx.conf修改如下:
> [Nginx安装(Mac+Windows)](https://blog.csdn.net/diaojw090/article/details/89135073)
``` shell
# proxy服务器
server {
    listen       81;
    server_name  www.domain1.com;
    location / {
        proxy_pass   http://www.domain2.com:8080;  #反向代理
        proxy_cookie_domain www.domain2.com www.domain1.com; #修改cookie里域名
        index  index.html index.htm;

        # 当用webpack-dev-server等中间件代理接口访问nignx时，此时无浏览器参与，故没有同源限制，下面的跨域配置可不启用
        add_header Access-Control-Allow-Origin http://www.domain1.com;  #当前端只跨域不带cookie时，可为*
        add_header Access-Control-Allow-Credentials true;
    }
}
```
2. 最后通过命令行nginx -s reload启动nginx
``` js
// index.html
var xhr = new XMLHttpRequest();
// 前端开关：浏览器是否读写cookie
xhr.withCredentials = true;
// 访问nginx中的代理服务器
xhr.open('get', 'http://www.domain1.com:81/?user=admin', true);
xhr.send();
```
``` js
// server.js
var http = require('http');
var server = http.createServer();
var qs = require('querystring');
server.on('request', function(req, res) {
    var params = qs.parse(req.url.substring(2));
    // 向前台写cookie
    res.writeHead(200, {
        'Set-Cookie': 'l=a123456;Path=/;Domain=www.domain2.com;HttpOnly'   // HttpOnly:脚本无法读取
    });
    res.write(JSON.stringify(params));
    res.end();
});
server.listen('8080');
console.log('Server is running at port 8080...');

```



### window.name + iframe
window 对象的 name 属性是一个很特别的属性，当该 window 的 location 变化，然后重新加载，它的 name 属性可以依然保持不变。
> window.name属性的独特之处：name值在不同的页面（甚至不同域名）加载后依旧存在，并且可以支持非常长的 name 值（2MB）。

**例子**：其中 a.html 和 b.html 是同域的，都是`http://localhost:8000`，而 c.html 是`http://localhost:8080`

``` html
<!-- a.html -->

<iframe  src="http://localhost:8080/name/c.html"  frameborder="0"  onload="load()"  id="iframe"></iframe>
<script>  
let first = true;  // onload事件会触发2次，第1次加载跨域页，并留存数据于window.name  
function load() {    
    if (first) {      // 第1次onload(跨域页)成功后，切换到同域代理页面      
        iframe.src = "http://localhost:8000/name/b.html";      
        first = false;    
    } else {      // 第2次onload(同域b.html页)成功后，读取同域window.name中数据      
        console.log(iframe.contentWindow.name);    
    }  
}
</script>
```
b.html 为中间代理页，与 a.html 同域，内容为空。
``` html
<!-- b.html -->
<div></div>
```
``` html
<!-- c.html -->
<script>  
window.name = "秋风的笔记";
</script>
```
> 通过 iframe 的 src 属性由外域转向本地域，跨域数据即由 iframe 的 window.name 从外域传递到本地域。这个就巧妙地绕过了浏览器的跨域访问限制，但同时它又是安全操作。


### window.location.hash + Iframe
> 原理就是通过 url 带 hash ，通过一个非跨域的中间页面来传递数据。

**例子**：一开始a.html给c.html传一个hash值，然后c.html收到hash值后，再把hash值传递给b.html，最后b.html将结果放到a.html的hash值中。
同样的，a.html和b.html是同域的，都是`http://localhost:3000`;而c.html是`http://localhost:4000`
``` html
 <!-- a.html -->
  <iframe src="http://localhost:4000/c.html#iloveyou"></iframe>
  <script>
    window.onhashchange = function () { //检测hash的变化
      console.log(location.hash);
    }
  </script>

```
``` js
 // c.html
 console.log(location.hash);
  let iframe = document.createElement('iframe');
  iframe.src = 'http://localhost:3000/b.html#idontloveyou';
  document.body.appendChild(iframe);

```
``` html
 <!-- b.html -->
  <script>
    window.parent.parent.location.hash = location.hash 
    //b.html将结果放到a.html的hash值中，b.html可通过parent.parent访问a.html页面
  </script>

```


### document.domain + iframe
该方式只能用于**二级域名相同**的情况下，比如 a.test.com 和 b.test.com 适用于该方式。 只需要给页面添加 document.domain ='test.com' 表示二级域名都相同就可以实现跨域。

实现原理：两个页面都通过js强制设置document.domain为基础主域，就实现了同域。

```
www.   baidu.  com     .
三级域  二级域   顶级域   根域
```

例子：页面`a.zf1.cn:3000/a.html`获取页面`b.zf1.cn:3000/b.html`中a的值

``` html
<!--  a.html -->
<body>
 hello a
  <iframe src="http://b.zf1.cn:3000/b.html" frameborder="0" onload="load()" id="frame"></iframe>
  <script>
    document.domain = 'zf1.cn'
    function load() {
      console.log(frame.contentWindow.a);
    }
  </script>
</body>

```
``` html
<!-- b.html -->
<body>
   hello b
   <script>
     document.domain = 'zf1.cn'
     var a = 100;
   </script>
</body>

```








## 参考

- [跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)
- [九种跨域方式实现原理（完整版）](https://juejin.cn/post/6844903767226351623)
- [10种跨域解决方案（附终极大招）](https://juejin.cn/post/6844904126246027278)


<fix-link label="Back" href="/frontend/js/depth.html"></fix-link>

<!-- 2021-08-29 -->
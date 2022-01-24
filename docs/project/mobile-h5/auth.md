---
title: 微信授权及jssdk初始化
date: 2021-04-28 11:38:47
# permalink: false # 8adeb3/
categories: 
  - h5
tags: 
  - 微信h5
permalink: false # 5c55de/
---


# 微信授权及jssdk初始化

## 流程

### 注册邮箱
[注册微信公众号](https://mp.weixin.qq.com/)
> 注册成功可在：开发 》基本配置 》 公众号开发信息 里面查看appID

### 填写服务器配置
> （主要是后端配置，前端做了解~）

[参考](https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Getting_Started_Guide.html)

- 申请服务器
- 搭建服务（phython）
- [开发者基本配置](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html)
    1. 进入微信公众平台：开发 》 基本配置 》 修改配置（服务器配置） 》填写信息
        > URL
        <br/>- 填入申请的外网服务器地址，如：http://外网IP/wx，外网IP请到腾讯云购买成功处查询。 http的端口号固定使用80，不可填写其他。
        <br/>- 一般为后端接口服务器的ip地址~

        > token
        <br/>- 自主设置，这个token与公众平台wiki中常提的access_token不是一回事；
        <br/>- 这个token只用于验证开发者服务器；
        <br/>- 可由开发者可以任意填写，用作生成签名（该Token会和接口URL中包含的Token进行比对，从而验证安全性。

        > EncodingAESKey：由开发者手动填写或随机生成，将用作消息体加解密密钥。

    2. 验证消息的确来自微信服务器
        > 开发者提交信息后，微信服务器将发送GET请求到填写的服务器地址URL上，

        > GET会携带微信加密签名(signature)、时间戳(timestamp)等参数

        > 开发者通过检验signature对请求进行校验，若确认此次GET请求来自微信服务器，请原样返回echostr参数内容，则接入生效，成为开发者成功，否则接入失败。

        > 具体校验规则由后端在php中书写。

    3. 依据接口文档实现业务逻辑
        > 验证URL有效性成功后即接入生效，成为开发者。你可以在公众平台网站中申请微信认证，认证成功后，将获得更多接口权限，满足更多业务需求.

        > 成为开发者后，用户每次向公众号发送消息、或者产生自定义菜单、或产生微信支付订单等情况时，开发者填写的服务器配置URL将得到微信服务器推送过来的消息和事件，开发者可以依据自身业务逻辑进行响应，如回复消息。

        > 请注意，微信公众号接口必须以http://或https://开头，分别支持80端口和443端口。

    4. [获取accessToken](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)
        > 建议公众号开发者使用中控服务器统一获取和刷新access_token,

        > 目前access_token的有效期通过返回的expire_in来传达，目前是7200秒之内的值。中控服务器需要根据这个有效时间提前去刷新新access_token,

        > 公众号和小程序均可以使用AppID和AppSecret调用下面的接口来获取access_token。

        > AppID和AppSecret可在“微信公众平台-开发-基本配置”页中获得（需要已经成为开发者，且帐号没有异常状态）。

        > 调用接口时，请登录“微信公众平台-开发-基本配置”提前将服务器IP地址添加到IP白名单中，点击查看设置方法，否则将无法调用成功。

        > 小程序无需配置IP白名单。

        ``` js
        // https请求方式
        GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
        // 一般情况下，后端会包装一下这个接口供前端调用...?
        // 正常情况下，微信会返回下述JSON数据包给公众号：
        {"access_token":"ACCESS_TOKEN","expires_in":7200}
        ```

    5. [接口测试号申请](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Requesting_an_API_Test_Account.html)
    6. [接口在线测试](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Online_API_calls.html)
    7. 微信提供了报警、获取微信服务器ip等接口，[详情查看](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_the_WeChat_server_IP_address.html)


### 微信授权
（一般进入页面，首先进行授权）
> 如果用户在微信客户端中访问第三方网页，公众号可以通过微信网页授权机制，来获取用户基本信息，进而实现业务逻辑。[参考](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)


1. 修改授权回调域名

> 公众平台官网：“开发 - 接口权限 - 网页服务 - 网页帐号 - 网页授权获取用户基本信息”的配置选项中，修改授权回调域名。

请注意，这里填写的是域名（是一个字符串），而不是URL，**因此请勿加 http:// 等协议头**；

用户在网页授权页同意授权给公众号后，微信会将授权数据传给一个回调页面，回调页面需在此域名下，以确保安全可靠。

::: tip
授权回调域名配置规范为全域名，比如需要网页授权的域名为：www.qq.com，配置以后此域名下面的页面http://www.qq.com/music.html 、 http://www.qq.com/login.html 都可以进行OAuth2.0鉴权。但http://pay.qq.com 、 http://music.qq.com 、 http://qq.com 无法进行OAuth2.0鉴权
:::

2. 知识点

- **网页授权的两种scope**
> 以snsapi_base为scope发起的网页授权，是用来获取进入页面的用户的openid的，并且是静默授权并自动跳转到回调页的。

> 以snsapi_userinfo为scope发起的网页授权，是用来获取用户的基本信息的。但这种授权需要用户手动同意，并且由于用户同意过，所以无须关注，就可在授权后获取该用户的基本信息。

- **网页授权access_token和普通access_token**
> 微信网页授权是通过OAuth2.0机制实现的，在用户授权给公众号后，公众号可以获取到一个网页授权特有的接口调用凭证（网页授权access_token），通过网页授权access_token可以进行授权后接口调用，如获取用户基本信息；

> 其他微信接口，需要通过基础支持中的“获取access_token”接口来获取到的普通access_token调用。

- **特殊场景下的静默授权**
> 以snsapi_base为scope的网页授权

>对于已关注公众号的用户，如果用户从公众号的会话或者自定义菜单进入本公众号的网页授权页，即使是scope为snsapi_userinfo，也是静默授权


3. [授权流程](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#0)

- 第一步：用户同意授权，获取code
> 引导关注者打开[此页面](https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect)；参数：appid、redirect_uri、scope、state...

> 如果用户同意授权，页面将跳转至 redirect_uri/?code=CODE&state=STATE；

> code说明 ： code作为换取access_token的票据，每次用户授权带上的code将不一样，code只能使用一次，5分钟未被使用自动过期。

- 第二步：通过code换取网页授权access_token

> 获取code后，请求[此链接](https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code)获取access_token：

> 这里通过code换取的是一个特殊的网页授权access_token,与基础支持中的access_token（该access_token用于调用其他接口）不同。

正常情况下返回以下json:
``` json
{
  "access_token":"ACCESS_TOKEN", // 网页授权接口调用凭证,注意：此access_token与基础支持的access_token不同
  "expires_in":7200,
  "refresh_token":"REFRESH_TOKEN",
  "openid":"OPENID", // 用户唯一标识，请注意，在未关注公众号时，用户访问公众号的网页，也会产生一个用户和公众号唯一的OpenID
  "scope":"SCOPE" 
}
```

- 第三步：刷新access_token（如果需要）
> 具体看文档~

- 第四步：拉取用户信息(需scope为 snsapi_userinfo)
> 如果网页授权作用域为snsapi_userinfo，则此时开发者可以通过access_token和openid拉取用户信息了：

> 获取到access_token后，请求[接口](https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN)

正常情况，返回以下json:
``` json
{   
  "openid":" OPENID",
  "nickname": NICKNAME,
  "sex":"1",
  "province":"PROVINCE",
  "city":"CITY",
  "country":"COUNTRY",
  "headimgurl":       "http://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
  "privilege":[ "PRIVILEGE1" "PRIVILEGE2"     ],
  "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"
}
```

::: tip 
- 由于公众号的secret和获取到的access_token安全级别都非常高，必须只保存在服务器，不允许传给客户端。
- 后续刷新access_token、通过access_token获取用户信息等步骤，也必须从服务器发起，**所以一般前端只需要发起第一步授权后，后面的操作就只需要在后端完成了**~
- 后端获取到用户信息后，可封装一个接口保存用户信息供前端调用~
:::


### JSSDK使用
> 微信JS-SDK是微信公众平台 面向网页开发者提供的基于微信内的网页开发工具包。[参考](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html)

- **步骤一：绑定域名**

先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。

> 设置JS接口安全域名后，公众号开发者可在该域名下调用微信开放的JS接口

> 备注：登录后可在 开发者 > 接口权限 查看对应的接口权限。

- **步骤二：引入JS文件**
> 在前端项目中有引入js

在需要调用JS接口的页面引入如下JS文件，（支持https）：http://res.wx.qq.com/open/js/jweixin-1.6.0.js

如需进一步提升服务稳定性，当上述资源不可访问时，可改访问：http://res2.wx.qq.com/open/js/jweixin-1.6.0.js （支持https）。


- **步骤三：通过config接口注入权限验证配置**
> 所有需要使用JS-SDK的页面必须先注入配置信息，否则将无法调用
``` js
wx.config({
  debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
  appId: '', // 必填，公众号的唯一标识
  timestamp: , // 必填，生成签名的时间戳
  nonceStr: '', // 必填，生成签名的随机串
  signature: '',// 必填，签名
  jsApiList: [] // 必填，需要使用的JS接口列表
});
```

- **步骤四：通过ready接口处理成功验证**
``` js
wx.ready(function(){
  // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
  // config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。
  // 对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
});
```
[接口调用说明](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#7)

初始化完成之后就可以在项目里调用分享朋友圈、上传图片等api了~





## 名词解释

### appID
> 是公众号开发识别码，配合开发者密码可调用公众号的接口能力。

### openID
> 为了识别用户，每个用户针对每个公众号会产生一个安全的OpenID；

> 即加密后的微信号，每个用户对每个公众号的OpenID是唯一的。对于不同公众号，同一用户的openid不同。

> 在关注者与公众号产生消息交互后，公众号可获得关注者的OpenID，公众号可通过OpenID获取用户基本信息。

### UnionID
> 由于开发者经常有需在多个平台（移动应用、网站、公众帐号）之间共通用户帐号，统一帐号体系的需求，微信开放平台（open.weixin.qq.com）提供了UnionID机制。开发者可通过OpenID来获取用户基本信息，而如果开发者拥有多个应用（移动应用、网站应用和公众帐号，公众帐号只有在被绑定到微信开放平台帐号下后，才会获取UnionID），可通过获取用户基本信息中的UnionID来区分用户的唯一性，因为只要是同一个微信开放平台帐号下的移动应用、网站应用和公众帐号，用户的UnionID是唯一的。换句话说，同一用户，对同一个微信开放平台帐号下的不同应用，UnionID是相同的。

[参考](https://developers.weixin.qq.com/doc/offiaccount/User_Management/Get_users_basic_information_UnionID.html#UinonId)

### 微信开发平台
> 微信公众平台是给编辑的，微信开放平台是给技术的。包含移动应用开发、网站应用开发、公众账号开发，第三方平台开发。

> 微信公众平台主要是给微信开发平台下的公众账号开发用的。

[官网](https://open.weixin.qq.com/cgi-bin/index?t=home/index&lang=zh_CN)


### 微信公众平台
> 微信公众平台主要是给公众号、小程序、服务号开发编辑用的；

> 微信公众平台开发是指为微信公众号进行业务开发，为移动应用、PC端网站、公众号第三方平台（为各行各业公众号运营者提供服务）的开发，请前往微信开放平台接入。

[官网](https://mp.weixin.qq.com/)


### accessToken
> access_token是公众号的全局唯一接口调用凭据，公众号调用各接口时都需使用access_token，开发者需要进行妥善保存。

> access_token的有效期目前为2个小时，需定时刷新，重复获取将导致上次获取的access_token失效。

[参考](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)


<fix-link label="Back" href="/project/mobile-h5/"></fix-link>

<!-- 2021-04-28 -->

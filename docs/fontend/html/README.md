

# html概览

## 二级标题

### 三级标题
1.mpvue项目启动时，通过微信开发者工具打开项目报错：
Q:

A:app.json是小程序的入口配置文件，项目中丢失可能打包过程中未生成该文件。
Q:微信开发者工具添加mpvue项目时报错：

A:mpvue项目通过npm run dev 命令启动，并将项目打包到dist文件夹中，再通过微信开发者工具打开项目dist目录，可运行小程序；报错是因为打包没有生成小程序的app.json文件，打开项目package.json，作如下修改：
"mpvue-loader": "^1.0.13", => "mpvue-loader": "1.0.13",
再删除node包，npm install ,  npm run dev  重新打包生成dist文件即可。
https://segmentfault.com/a/1190000015812634?utm_source=tag-newest
http://blog.sina.com.cn/s/blog_60cf05130102xz1v.html
注：‘1.0.13’ 表示安装指定的版本号，也就是安装1.0.13版本。
‘~1.0.13’ 表示安装1.0.x的最新版本。
‘^1.0.13’ 表示安装1.x.x的最新版本。

2.用vue-cli构建vue项目报错

A:install下载的有文件丢失,可能是在用npm 安装过程中文件丢失，用淘宝镜像重新安装一下：
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install -g webpack webpack
cnpm install -g vue-cli
vue init webpack [name]
https://blog.csdn.net/wulala_hei/article/details/80488674

3.设置不合法的调用
微信开发者工具  ==>   设置  ==>   项目设置   ==>   不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书 打钩

4.账户授权（以mini-point-mall项目为例）
    进入页面
    1.获取临时凭证code(五分钟)
    wx.login({
//调用成功，拿到code
    })
   2.判断是否有token
    wx.getStorageSync('abc-token') && wx.navigateTo({ url: '.....' })//有token跳至指定页

   微信登录
    1.
点击按钮
      <button open-type="getUserInfo" @getuserinfo="wxLogin"></button>
定义点击事件
      wxLogin(payload) {
      // 允许才进入
      console.log('wxlogin payload', payload)
      if (payload.target.errMsg.indexOf('ok') > -1) {//判断小程序的getUserInfo事件是否触发
        this.handlelogin(payload)
      }
      },
调小程序登录授权接口
handleLogin(payload){
wx.setStorageSync('userInfo', payload)  //  存值
....
const data = {
appid:....,  //  小程序的appid
code:....., //  通过wx.login拿到的code
encryptedData: payload.target.encryptedData,
iv: payload.target.iv,
userInfo: payload.target.userInfo,
.....
}
wxloginAPi(data).then(res =>{   //  调接口  传值  成功则存各种值，token
....
if (res.code === '2000') {   //   微信登录失败   去手机登录页面
          wx.setStorageSync('unionId', res.data.unionId)
          wx.navigateTo({ url: '/pages/banding/main' })
        } else if (res.code === '200') {   //  存值,  token   ,去首页
          // 正常登陆
          wx.setStorageSync('loginInfo', res.data)
          wx.setStorageSync('abc-token', res.data.tokenType + ' ' + res.data.accessToken)
          wx.navigateTo({ url: '/pages/center/main' })
})
.....
}

手机号登录
1.同微信登录类似
点击按钮
<button class="btn-phone" open-type="getUserInfo" @getuserinfo="phoneLogin">手机号登录</button>
phoneLogin(payload) {
      if (payload.target.errMsg.indexOf('ok') > -1) {
        wx.setStorageSync('userInfo', payload)
        wx.removeStorageSync('unionId')
        wx.navigateTo({ url: '/pages/banding/main' })  // 跳至手机登录页面  通过获取验证码登录
      }
    },
....
用手机号登录成功后同样存值
.....
wx.setStorageSync('loginInfo', res.data)
          wx.setStorageSync('abc-token', res.data.tokenType + ' ' + res.data.accessToken)
          wx.navigateTo({ url: '/pages/center/main' })
.......


5.Vue项目npm run start 报错

A:localhost没有指向127.0.0.1,可在switchhost里面将localhost指向127.0.0.1


https://segmentfault.com/q/1010000012749441
 
6.

如下：


7.用vue.extend构造实例时报错

报错原因：自定义vue组件中css里面背景图片路径引入方式错误，如下：

8.微信小程序button组件去除边框
Q:微信小程序button组件如果自定义css{border:none}去不掉边框，用伪类去除：
button::after{border:none}
附：button使用disabled属性时，用&::disabled自定义样式好像不行~
9.vue项目npm run start报错

报错原因:node版本改变了。
使用nvm use v1.1.1切换node版本，再重新run一下。
--------------------------------------------------------------------------------
vue转mpvue问题：
1.样式  border-box
使用padding时...

2. class样式写法
vue写法：

mpvue这样写class会有报错：

可改成class与style结合的写法：


3.属性  :name


4.v-text报错

错误写法:

正确写法：

或者在标签内用{{}}表达式
注：在mpvue中template里面谨慎使用`${name}`这种格式

5.template报错

div里面套组件，慎用box-sizing: border-box;

6.npm run start报错

删掉node包和dist，重新install,再run一下~
tip:mpvue的小程序项目，如果增加新页面，也得重新run一下才能跑起来~

7.import组件报错

Q:新建一个header.vue组件，导入时报错
A:换一个组件名字~

8.text-overflow:ellipsis;失效
Q:在mpvue中给p标签添加v-html属性时失效
A:v-html改为v-text就可以了

--------------------------------------------------------------------------------
小程序问题：
1.picker组件选择地区报错

Q:使用picker组件进行地区选择时，第一次选择正常，能选上；第二次选择是报错，不能选上；之后选择不报错，但一直选不上；
A:在手机上也会有问题，表现为前两次会选上，但之后滚动之后又会跳回"北京市 北京市 东城区",然后一直选不上； 我改变属性value格式为字符串，这样可以选上，但没有回显，每次打开都是默认"北京市 北京市 东城区"选中，我估计是滑动或回显的时候映射地区的code出问题了，所以报错~ 
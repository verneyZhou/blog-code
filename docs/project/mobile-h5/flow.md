

# 微信H5项目开发流程


## 项目搭建

1. `vue+webpack`搭建项目
    - 适配：amfe-flexible + postcss-px2rem-exclude
    - ui库：vant
> 具体搭建流程见另一篇博客：[vue+webpack搭建项目流程梳理](/tool/webpack/vue-use.html);

2. `jenkins`配置
> 新建的项目需要配置它的测试环境和线上环境，这里我是用jenkins进行配置；配置成功后可以在不同环境通过域名访问~

> 接下来就可以开始开发项目了~


## 开发

这部分就是日常`src`里面的内容，不再赘述~

等到项目开发完毕，就可以进入测试了~

## 测试

> 开发微信h5页面最主要两点是：**微信授权、jssdk的初始化及使用**；关于微信授权流程和jssdk的流程这里不详述了，具体可看另一篇博文：[微信授权及jssdk初始化](./auth)~

1. [申请测试公众号]( https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index)
> 在这个页面添加js安全域名：qa测试环境域名，不用带https://；扫描二维码添加测试号开发者，不添加的话jssdk初始化会报错，不能使用wx的分享、上传图片等api~

2. 添加授权回调域名：体验接口权限表/网页服务/网页账号/网页授权获取用户基本信息，输入域名，和上面的测试域名一样
> 添加授权回调域名，不用添加https://，之后在项目中授权回调的路径需在此域名下~

3. 之后便可以在项目里面进行auth授权，jssdk的初始化；测试时，将代码部署到测试环境，可直接在微信里访问链接进行测试~
> 测试时，微信得先关注测试公众号成为开发者才能访问正常授权，线上公众号不需要~



## 部署

jenkins上新建一个项目，用于部署dev和qa环境，并添加shell脚本；同时再新建一个项目，用于部署上线，同样添加shell脚本~

之后就可以通过jenkins进行部署了~

## 上线

1. gitlub新建一个项目，提工单，申请一个新域名
> 申请域名步骤应该只有leader才有权限~
2. 正式公众号配置js安全域名，回调域名，ip白名单，业务域名...（一般前端申请域名后，由后端配置这些..）
3. 部署
    - jenkins部署
    - 在jenkins没有配置打包命令之前，可通过手动打包上线~
>  打包之后会生成dist文件夹，然后将该文件夹里的内容拷贝到线上项目；一般拷贝之后，push到gitlab上就已经上线了，可通过线上链接进行访问



## 其他

### 功能点
- 提示框方式
- 上传接口？chooseImage上传图片怎么传字段？
- 搜索弹出键盘？
- 路由？vue-router-sync?
- 滚动分页？
- vuex 固化
- 下拉刷新
- 骨架屏
- 懒加载
- 公众测试号配置的url地址？端口号80?
- 分享api更改？
- touchmove事件 节流
- eslint格式， 保存自动fix
- 身份判断 底部菜单显隐


### 流程
1. 首次进入页面，判断url后面是否带有weixin_token参数，有则将这个参数保存，并添加到接口的请求头里~
2. 如果接口返回root:{code:302,redirectUrl: '......'}，则需要重新授权，手动跳转返回的rediectUrl~
3. 后端完成授权，会重定向到带有weixin_token参数的url，前端重复步骤1操作~
> 这个url是前端授权时当前页面的url~
4. 完成授权之后，取到weixin_token参数，调获取用户信息接口，判断是否是员工~调职位列表接口~


## bug记录
1. Vue中img图像src变成"[object Module]"无法正确加载的问题
> [参考](https://www.jianshu.com/p/0877ce441561)

2. 警告：`Second Autoprefixer control comment was ignored. Autoprefixer applies control comment to whole block, not to next rules.`

<img class="zoom-custom-imgs" :src="$withBase('/images/mobile/mobile003.png')" width="auto"/>

``` css
.ellipse-3{
    display: -webkit-box;
    /* 单独写-webkit-box-orient这个属性wepack打包会被过滤掉 */
    // /*! autoprefixer: off */
    // 注释掉，改用下面的写法
    /*! autoprefixer: ignore next */
    -webkit-box-orient: vertical;
    /* autoprefixer: on */
    -webkit-line-clamp: 3;
    overflow: hidden;
    word-wrap: break-word;
}
```
3. 微信jssdk初始化的时候，报：63002；

<img class="zoom-custom-imgs" :src="$withBase('/images/mobile/mobile004.png')" width="auto"/>

jssdk初始化的时候传参url为当前页面url，因为获取签名的url必须与当前页面的url一致（也有可能是后端对url的某些特殊字符进行加密处理后导致url前后不一致，导致签名失效）~

[参考](https://developers.weixin.qq.com/community/develop/doc/0000e2f5d0cdc02c0a391aedd58c00?jumpto=comment&commentid=000e44fc9c43680c0b3924ae15b0)


<fix-link label="Back" href="/project/mobile-h5/"></fix-link>

<!-- 2021-04-28 -->
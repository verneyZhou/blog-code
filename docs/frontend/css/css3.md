# css3使用笔记


## 特性

### filter
可通过`filter`实现滤镜效果，如：修改所有图片的颜色为黑白、图片模糊处理等等，filter的具体定义与使用可参考[菜鸟教程](https://www.runoob.com/cssref/css3-pr-filter.html)，这里只记录几个比较有意思的使用实例。


- **网页置灰**
``` css
html {
    -webkit-filter: grayscale(100%); // 非ie浏览器
    filter: progid:DXImageTransform.Microsoft.BasicImage(grayscale=1); // 兼容ie
}
```

- **融合效果**



- **毛玻璃效果**



- **给透明元素添加阴影效果**


- **元素置灰**




参考：[1](https://mp.weixin.qq.com/s/8CH8oUIIPF8yivnYPOPpFQ)

[参考](https://mp.weixin.qq.com/s/Bg2H2QKj1ZPHZNNhFro9TQ)

[codeopen](https://codepen.io/verneyzhou/pen/RwpBGbb)
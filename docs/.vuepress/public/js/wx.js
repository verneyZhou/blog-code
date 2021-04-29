(function() {

//    getScript('//res.wx.qq.com/open/js/jweixin-1.4.0.js', '//res2.wx.qq.com/open/js/jweixin-1.4.0.js', function () {
//         console.log('====wx');

//         var url = encodeURIComponent(window.location.href);
//         var href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx154e925eb1f54c86&redirect_uri=' + url + '&response_type=code&scope=snsapi_base&state=' + +new Date() + '#wechat_redirect';
        
//         // window.location.href = href;
//    })
   
})()



// 动态加载 Script
function getScript(src, errorSrc, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onerror = function () {
        script.src = errorSrc;
    };
    document.head.appendChild(script);
    script.onload = function () {
        callback && callback();
    };
}



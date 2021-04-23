# js正则学习笔记
> 这里是我的js正则学习笔记。






## 例子

### 判断 url 中只包含 qq.com
```js
function check(url){
  return /^https?:\/\/w+\.qq\.com[^.]*$/.test(url);
}
```


# msql的安装与使用


## 安装MySql
---
[安装](https://dev.mysql.com/downloads/mysql/)
> 选择自己适合电脑系统的版本进行安装即可~




## 安装MySql客户端Navicat
---
[官网](http://www.navicat.com.cn/products/navicat-for-mysql)

[破解版](http://www.pc6.com/mac/111878.html)


## 使用
---
1. **启动mysql服务**：[参考](https://blog.csdn.net/qq_25628891/article/details/88431942)

    - 打开系统偏好设置，点击最下面的mysql，出来如下界面：

    <img :src="$withBase('/images/project/mysql001.png')" width="auto"/>


    - 初始化数据库：点击上图的Initialize Database：

    <img :src="$withBase('/images/project/mysql002.png')" width="auto"/>

    设置密码，注意：这里有两个密码，都设置一下~

    > Strong Password有要求的，(mini length is 8 characters,and a fix of letter,number and other character),意思就是说，密码的最小的长度为8位，而且是字母，数字和其他字符的混合，一定要三者都包括（你输入的密码不符合要求，mysql安装时不会提醒，但是密码登陆时不会通过）


    - 设置完成后，回到mysql界面，点击 Start Mysql Server，当该按钮文案变为【Stop Mysql Server】时即表示mysql服务启动成功~

    - 接下来启动客户端，连接mysql~


2. **启动客户端Navicat（这里以连接本地数据库为例）**

    - 新建本地连接：点击左上角的 连接，选择 mySql，出现弹窗，填写信息：

    <img :src="$withBase('/images/project/mysql003.png')" width="auto"/>

    > 连接本地数据库，用户名：root；密码：输入的密码是在mySql里面设置的 Legacy password,输入完成先点击 测试连接，成功后，保存~

    - 新建数据库
        1. 新建

        <img :src="$withBase('/images/project/mysql004.png')" width="auto"/>

        2. 填写

        <img :src="$withBase('/images/project/mysql005.png')" width="auto"/>

    - 导入.sql文件
    > book > 运行SQL文件，选择book.sql文件进入导入：

    <img :src="$withBase('/images/project/mysql006.png')" width="auto"/>

    > 导入过程中可能会报错，解决方法见下面【常见问题】~

    - 导入成功后点击左侧book数据库的 【刷新】，即导入成功，接下来就可以进行一系列操作了~

    - 这里演示的是连接本地mySql服务器，如果需要连接阿里云服务器的mySql操作流程差不多，具体见[阿里云centOS服务器搭建](./aliyun-centos)中mysql环境安装~



## 后端引入mySql
---
数据库连接上之后，接下来我们试着通过后端请求查询mySql~

1. 安装
``` shell
npm i -S mysql
```

2. 后端项目根目录下新建db文件夹，新建index.js，config.js
```js
/////// db/config.js
const env = require('../utils/env');
let host,user,password;
if (env === 'env') { // 开发环境  本地mysql
  host = 'localhost';
  user = 'root';
  password = '*******'; // 本地mysql密码
} else { // 线上环境  阿里云服务器mysql
  host = '123.57.172.182';
  user = 'root';
  password = '******' // 阿里云服务器mysql密码
}
module.exports = {
    host, // 数据库主机的ip地址或域名
    user, // 用户名
    password, // 密码
    database: 'book' // 数据库
}
```

`db/index.js`：
```js 
/////// db/index.js
const mysql = require('mysql');
const {host, user, password, database} = require('./config');

// 连接数据库
function connect() {
    return mysql.createConnection({
      host,
      user,
      password,
      database,
      multipleStatements: true
    })
  }
  
  // 查询多个，返回数据
function querySql(sql) {
    const conn = connect();
    return new Promise((resolve, reject) => {
        try {
            conn.query(sql, (err, results) => {
                if (err) {
                    debug && console.log('查询失败，原因:' + JSON.stringify(err))
                    reject(err);
                } else {
                    debug && console.log('查询成功', JSON.stringify(results))
                    resolve(results);
                }
            })
        } catch(e) {
            reject(e)
        } finally {
            conn.end() // 释放连接，避免造成内存泄露
        }
    })
}


// 插入单条数据
function insertSql() {...}

// 更新
function updateSql() {...}

//  and 精确查询
function andSql() {...}

//  andLike 模糊查询
function andLikeSql() {...}
```

3. 最后，调用index.js中封装的方法，传入命令，进行操作~



## 常用指令
---
``` js
select * from book where title='abc'  // 查询book中title='abc'的数据
select * from book where title='abc' and author='123'  // 查询book中title='abc'且author='123'的数据
delete from book where fileName='abc'  // 删除book表中fileName='abc'的数据
select * from book order by id asc // 按照id正序排列
select * from book limit 20 offset 2 // 从第二条数据开始，返回20条数据~
```


## 常见问题
---
1. 导入.sql文件时报错：`1115 - Unknown character set: 'utf8mb4'`
```
低版本的mysql数据库没有 'utf8mb4'这个字符集，
方案一：升级mysql数据库则可。
方案二：一般情况下，可将字符集可更改为'utf8'：
.sql文件中设置：SET NAMES utf8;
```

2. 创建站点是报错：`1130 - Host '103.90.188.234' is not allowed to connect to this MySQL server`
> mysql连接ip地址时没有权限，需要先在服务器端创建root用户，并赋予所有权限，才能连接上；具体见[阿里云centOS服务器搭建](./aliyun-centos)中mysql环境安装~

3. 安装Navicat的时候提示安装失败怎么办？
> [http://www.pc6.com/edu/168719.html](http://www.pc6.com/edu/168719.html)



<fix-link label="Back" href="/project/vue-node-admin/"></fix-link>


<!-- 2021-04-26 -->




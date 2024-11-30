---
title: 公司记录
date: 2024-11-11 19:51:21
# permalink: false # 0b758e/
article: false
categories: 
  - null
tags: 
  - null
permalink: false # e82559/
---

# 公司记录


## Vipkid






## Boss直聘





## 新浪微博


### 后台管理系统登录及权限校验（vue项目）

- 首先后端需要提供获取用户信息的接口，接口返回用户信息及角色权限；

- 前端项目初始化的时候，会在`main.js`中引入`permission.js`，该js主要处理具体登录校验逻辑：
    - 会在 `router.beforeEach` 中进行登录校验，首先获取`token`：
        - 如果`token不存在`，判断当前路由是否在`免登录白名单`中，否，则跳转到登录页；
        - 如果`存在token`，则会具体判断当前路由：
            - 如果是`注册页`，是则查询用户是否已注册过，是则退出登录，清空token信息，跳转到登录页；
            - 如果是`登录页`，则直接跳转首页；
            - 如果是`其他页面`，会先判断是否已获取菜单：
                - `否（一般项目初始化会走这个逻辑，即页面刷新）`，则首先获取用户信息，获取用户角色权限，根据用户角色筛选路由list；同时判断用户信息是否过期，然后根据情况判断是否跳转至登录页；
                    - 如果项目初始化时有多个弹窗处理，在这里会校验用户角色type，以及本地是否有缓存（是否已经弹过）；如果需要展示弹窗，则往`弹窗队列noticeQueue`中添加一个弹窗事件；等到所有弹窗事件添加完毕，再循环遍历执行`noticeQueue`中弹窗事件；往往项目中前一个弹窗如果点击确认了，就不执行后面的弹窗了，这里只要点击确认后把`noticeQueue`清空即可；
                - `如果已获取菜单（一般是路由跳转会走这个逻辑）`，则根据用户信息接口返回的角色权限跟前端routes中写死的`meta.permission`比较，进行`checkPermission`逻辑：如果有权限则执行`next()`，直接进入页面；如果无权限则则跳转至首页；

- 前端在进行菜单渲染的时候，也需要进行上面的`checkPermission`权限校验，同时结合`meta.isHide`进行菜单渲染显隐处理;

- 目前是后端直接在接口返回对应的权限字段，比如如果后端返回的`retailer_seckill_white_privilege`为true,则表示该用户有秒杀菜单权限，然后前端自行进行判断:
``` js
// 前端路由配置：
{
  path: 'seckill/list',
  name: 'SeckillList',
  component: () => import(/* webpackChunkName: "seckillList" */ '@/views/marketing/SeckillList'),
  meta: { title: '限时秒杀', keepAlive: true, permission: ['marketing', 'retailerSeckill'] }
},


// permission.js
const checkPermission = () => {
  return (
    to.meta.permission &&
    !to.meta.permission.some(p => {
      return (
        // ...
        checkSeckillPermission(p, store.getters.userinfo) ||
        checkShopDecorationPermission(p, store.getters.userinfo)
      )
    })
  )
}

// 限时秒杀白名单校验
const checkSeckillPermission = (permissionName = '', userInfo = {}) => {
  return permissionName === 'retailerSeckill' && userInfo.retailer_seckill_white_privilege
}

// 如果有权限则执行next()，进入页面；如果无权限则跳转到首页
if (checkPermission()) {
  next({
    path: '/'
  })
} else {
  next()
}
```
> 感觉现在是后端直接在接口返回对应的权限字段（有数字类型，也有字符串类型），然后前端自行判断，感觉不太规范；而且`checkPermission`里需要兼容判断`包含、不包含、数字、字符串、数组`的情况，感觉不太优雅；










## 百度


### 后台管理系统权限

- **菜单管理**：添加菜单，设置路径，名称，所属目录，排序...

- **能力管理**：
  - 找到刚创建的新菜单，添加不同的能力（读写），比如 View / Write，查看手机号...
  - 能力可设置 所属菜单、标识符（比如，showMobile, 配置完成后在前端通过接口获取菜单时，该菜单会返回配置的能力）、类型（页面/按钮）、级别（只读/读写）
  - 能力配置完成后，可添加接口，配置后端接口访问权限
  - `一个菜单可配置多个能力`，一个能力可配置多个接口

- **角色管理**：
  - 添加角色，设置名称、描述，配置角色拥有的能力（比如超管，它就应该拥有所有菜单的所有能力；其他的根据具体业务场景创建不同角色，然后添加对应的能力）
  - 常见角色有：超管、rd只读、test测试、订单专用...
  - 【成员】中可以查看有哪些用户拥有当前角色
  - `角色跟能力是一对多的关系，一个角色可配置多个能力`

- **用户管理**：
    - 这里就是添加每个具体用户了，一般是以 `公司邮箱/密码` 为准
    - 用户添加完成后，可分配角色；一个用户可分配多个角色；
    - 用户也可区分内部用户（公司内部员工）和外部用户
    - `用户跟角色是多对多的关系`

- **前端初始化处理（react项目）**：
    - 上面配置完成后，之后就是前端在页面初始化需要做一些处理；
    - 如果当前用户所对应的角色，有某个菜单的某个能力，则会页面初始化拉取menu接口时，在菜单的 `permissions` 字段中返回该能力；
    - 前端会拿本地的router中添加的路由跟menu接口返回的routes进行对比，`过滤掉没有权限（permissions）的路由`；子路由递归处理；
    - 最后将过滤后的路由添加到router中，完成权限控制，渲染菜单栏；前端菜单可通过配置 `hideInMenu` 属性，控制是否在菜单栏显示；
    - 之后其他权限的控制，比如按钮权限，可拿到当前路由，判断当前路由的permissions中是否有该按钮能力，没有则隐藏该按钮
    - 切换页面的时候，会根据当前路由的`permissions`中是否有该页面能力，没有则跳转到403页面



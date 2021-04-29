# 中后台项目梳理


## 项目搭建
---

### 目录结构


### webpack配置

- eslint代码规范
    - git hooks
- 环境配置
- 跨域配置 proxy
- 打包优化



### src

- 基础配置
    - axios封装
    - 接口：mock、swagger
    - 字体 图标：iconfont
    - 路由：vue-router
    - 登录
        - 第三方登录：微信，qq
    - 权限：动态路由：addRoute
        - 按钮级别权限控制：v-if、后端通过token判断
    - 换肤
    - 错误处理
    - 国际化
- 布局 layout
    - 导航 navbar
    - 侧边栏 sidebar
        - 路由懒加载：import()、require.ensure()
        - 模式：hash模式、history模式
        - 点击相同路由刷新方案：添加时间戳、重定向路由
        - 滚动、定位、高亮、默认展开
        - 路由守卫：router.beforeEach....
    - 面包屑导航 breadcrumb、
    - 标签式导航 tag views
    - 内容 content
- 功能
    - 转场动画 transition
    - 富文本
    - markdown
    - 图表 Echarts
    - 表格：编辑，筛选，排序，搜索，动态字段，拖拽，固定头部
    - 上传
        - 图片裁剪：ImgCropper
        - 拖拽上传
        - 复制粘贴上传
    - 拖拽
    - 选择器
        - 级联选择器
        - 树形选择器
        - 单选、多选
    - excel
        - 导出（xlsx/csv/txt）：多级表头
        - 导入：导入excel，自动生成表格预览
        - 导出zip压缩文件
    - pdf：打印
    - clipboard（指令实现、js方法）
    - UI效果
        - 点击水纹效果（指令实现）
        - 滑至顶部
        - dropdown menu
        - dialog拖拽效果（指令实现）
- 文件夹/入口文件划分
    - services
        - 接口请求
    - assets
        - 静态资源
    - components
        - 公共组件
        - 公共插件
    - directive
        - 指令
    - router
        - 路由
    - icons
        - 图标
    - layout
        - 布局
    - store
        - 全局状态管理
    - styles
        - 样式
    - utils
        - 工具
    - views
        - 页面
    - App.vue
        - 入口页面
    - index.js
        - 入口js

### 单元测试



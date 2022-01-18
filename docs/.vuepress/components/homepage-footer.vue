
<template>
  <div>
    <p>
      <span>MIT Licensed | Copyright © 2021-present</span>
      <a href="/blog/about/">一苇</a>
      <a href="https://beian.miit.gov.cn/" target="_blank">
        <img
          src="/blog/images/icp.png"
          width="20"
          height="20"
          alt="公网备案"
        />京ICP备2021006935号-2
      </a>
    </p>
    <div v-html="html" />
  </div>
</template>
<style lang="stylus" scoped>
p {
  text-align: center;
  font-size: 16px;

  span {
    display: block;
  }

  a {
    margin-right: 3px;

    img {
      display: inline-block;
      vertical-align: middle;
      margin-right: 2px;
      margin-left: 2px;
    }
  }
}
</style>
<script>
export default {
  name: 'homepage-footer',
  props: ['html'],

  created() {
  },
};
</script>

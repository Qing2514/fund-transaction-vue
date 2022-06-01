<template>
  <div class="content">
    <div class="content-title">
      <h1>欢迎使用理财销售系统</h1>
    </div>
    <div class="swiper-content">
      <SlideSwiper />
    </div>
    <div class="header">
      <router-link to="/product">
        <span role="link" class="link">
          <i class="iconfont icon-android-list"></i>产品列表</span
        >
      </router-link>

      <router-link to="/user">
        <span role="link" class="link">
          <i class="iconfont icon-android-list"></i>用户列表</span
        >
      </router-link>
    </div>
  </div>
</template>

<script>
import SlideSwiper from "../components/SlideSwiper.vue";
export default {
  components: {
    SlideSwiper,
  },
};
</script>

<style lang="less" scoped>
.content-title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}
.swiper-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 360px;
  padding-right: 75px;
  overflow: hidden;
}
.header {
  display: flex;
  font-size: 24px;
  align-items: center;
  justify-content: space-around;
  margin-top: 10vh;
}

.link {
  display: flex;
  align-items: center;
  font-weight: 700;
}
</style>

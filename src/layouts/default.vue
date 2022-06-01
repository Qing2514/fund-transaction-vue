<template>
  <div class="layout">
    <h-row name="flex">
      <h-col span="4" class="layout-menu-left">
        <h-menu
          active-name="1-2"
          theme="light"
          width="auto"
          :open-names="['1']"
        >
          <div class="layout-logo-left"></div>

          <router-link to="/">
            <h-menu-item name="home" class="home-title">
              理财销售系统
            </h-menu-item>
          </router-link>

          <h-submenu name="userMenu" class="submenu">
            <template v-slot:title>
              <h-icon name="android-person"></h-icon>
              客户管理
            </template>
            <router-link to="/user">
              <h-menu-item name="user">
                <h-icon name="businesscard"></h-icon>客户信息维护
              </h-menu-item>
            </router-link>
            <router-link to="/user/createAccount">
              <h-menu-item name="createAccount">
                <h-icon name="addpeople"></h-icon>开户
              </h-menu-item>
            </router-link>
            <router-link to="/user/riskAssess">
              <h-menu-item name="riskAssess">
                <h-icon name="android-alert"></h-icon>风险评估
              </h-menu-item>
            </router-link>
          </h-submenu>

          <h-submenu name="productMenu" class="submenu">
            <template v-slot:title>
              <h-icon name="qrcode_fill"></h-icon>
              产品管理
            </template>
            <router-link to="/product">
              <h-menu-item name="product">
                <h-icon name="brush"></h-icon>产品列表维护
              </h-menu-item>
            </router-link>
            <router-link to="/product/trend">
              <h-menu-item name="productTrend">
                <h-icon name="dynamic"></h-icon>净值走势
              </h-menu-item>
            </router-link>
          </h-submenu>

          <h-submenu name="purchaseMenu" class="submenu">
            <template v-slot:title>
              <h-icon name="android-cart"></h-icon>
              申购
            </template>
            <router-link to="/purchase">
              <h-menu-item name="purchase">
                <h-icon name="activity"></h-icon>买入
              </h-menu-item>
            </router-link>
            <router-link to="/purchase/transInquiry">
              <h-menu-item name="purchase">
                <h-icon name="coupons_fill"></h-icon>撤单
              </h-menu-item>
            </router-link>
          </h-submenu>

          <h-submenu name="redemptionMenu" class="submenu">
            <template v-slot:title>
              <h-icon name="coupons_fill"></h-icon>
              赎回
            </template>
            <router-link to="/redemption">
              <h-menu-item name="redemption">
                <h-icon name="activity"></h-icon>卖出
              </h-menu-item>
            </router-link>
            <router-link to="/redemption/transInquiry">
              <h-menu-item name="redemption">
                <h-icon name="activity_fill"></h-icon>撤单
              </h-menu-item>
            </router-link>
          </h-submenu>

          <h-submenu name="liquidateMenu" class="submenu">
            <template v-slot:title>
              <h-icon name="social-buffer"></h-icon>
              业务清算
            </template>
            <router-link to="/liquidate/initialize">
              <h-menu-item name="initialize">
                <h-icon name="android-sunny"></h-icon>日初始化
              </h-menu-item>
            </router-link>
            <router-link to="/liquidate/update">
              <h-menu-item name="update">
                <h-icon name="android-sync"></h-icon>行情更新
              </h-menu-item>
            </router-link>
            <router-link to="/liquidate/calculate">
              <h-menu-item name="calculate">
                <h-icon name="financial_fill"></h-icon>金额&份额清算
              </h-menu-item>
            </router-link>
          </h-submenu>

          <h-submenu name="queryMenu" class="submenu">
            <template v-slot:title>
              <h-icon name="search1"></h-icon>
              业务查询
            </template>
            <!-- <router-link to="/business/getUnconfirmed">
              <h-menu-item name="getUnconfirmed">
                <h-icon name="android-send"></h-icon>未确认交易查询
              </h-menu-item>
            </router-link> -->
            <router-link to="/business/transInquiry">
              <h-menu-item name="getConfirmed">
                <h-icon name="android-document"></h-icon>交易查询
              </h-menu-item>
            </router-link>
            <router-link to="/business/assert">
              <h-menu-item name="getEstate">
                <h-icon name="card"></h-icon>资产查询
              </h-menu-item>
            </router-link>
            <router-link to="/business/flowQuery">
              <h-menu-item name="flowQuery">
                <h-icon name="android-list"></h-icon>流水查询
              </h-menu-item>
            </router-link>
          </h-submenu>
        </h-menu>
      </h-col>

      <h-col span="20">
        <div class="layout-content">
          <div class="layout-header">
            <div class="header-logo">
              <img src="../assets/hslogo.png" alt="恒生电子" />
            </div>

            <div class="header-items">
              <!-- 登出 -->
              <logout />
            </div>
          </div>
          <div class="layout-breadcrumb">
            <h-breadcrumb>
              <h-breadcrumb-item v-for="item in lists" :key="item.path">
                <router-link :to="item.path">{{
                  item.meta.title
                }}</router-link></h-breadcrumb-item
              >
            </h-breadcrumb>
          </div>
          <div class="layout-content-main">
            <router-view />
          </div>
        </div>
      </h-col>
    </h-row>
  </div>
</template>

<script>
import logout from "@/components/logout";
export default {
  components: {
    logout,
  },
  data() {
    return {
      lists: [], //定义一个数组 用于接收路由信息
    };
  },
  methods: {
    logout() {
      this.isActive = !this.isActive;
    },
  },
  created() {
    let matched = this.$route.matched;
    matched[0].path = "/";
    this.lists = matched; //获取路由内的全部信息
  },
  watch: {
    $route(to, from) {
      this.lists = to.matched;
    },
  },
};
</script>

<style lang="less">
.h-menu-vertical {
  height: 100vh;
}

.h-menu-item-active {
  > a {
    color: rgb(57, 123, 199);
  }
}

.submenu {
  font-size: 20px;
  color: #424656;
}

.layout-content {
  height: calc(100vh - 30px);
}

.layout-content-main {
  padding: 12px 24px;
}

.home-title {
  font-weight: bold;
  font-size: 30px;
  color: rgb(57, 123, 199);
  text-align: center;
}
.home-title:before {
  content: "理财销售系统";
  position: absolute;
  z-index: 10;
  color: pink;
  -webkit-mask: linear-gradient(to left, rgb(255, 255, 255), transparent);
}

.layout-header {
  height: 8vh;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgb(215, 221, 228);
  overflow: hidden;
}

.header-logo {
  width: 10%;
  margin-left: 25px;
}
.header-items {
  border: 1px solid #ccc;
}

.layout-breadcrumb {
  margin-top: 10px;
  padding-left: 25px;
}
</style>

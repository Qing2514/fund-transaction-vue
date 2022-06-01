<template>
  <h-row name="flex">
    <h-col span="20">
      <h-card :bordered="false" dis-hover>
        <h-row>
          <h-button-group class="button-group">
            <h-button :type="type1" @click="getPurchasePage"> 申购 </h-button>
            <h-button :type="type2" @click="getRedemptionPage"> 赎回 </h-button>
          </h-button-group>
        </h-row>

        <h-table
          :columns="title"
          :data="transList"
          :loading="transLoading"
          stripe
          no-data-text="没有数据"
        >
        </h-table>
        <!-- 分页 -->
        <!-- <div v-show="pagination.total > 0" class="pagination-wrap">
          <h-page v-bind="pagination" @on-change="changePagination"></h-page>
        </div> -->
        <div class="pagination-wrap">
          <h-page v-bind="pagination" @on-change="changePagination"></h-page>
        </div>
        <h-form>
          <h-form-item>
            <h-button
              type="success"
              @click="handleSubmit"
              icon="android-bulb"
              shape="circle"
              size="large"
              style="width: 200px"
              v-if="!isRollback"
            >
              <span v-if="!isLoading">一键清算</span>
              <span v-else>清算中...</span>
            </h-button>

            <h-button
              type="warning"
              @click="handleSubmit"
              icon="android-sync"
              shape="circle"
              size="large"
              style="width: 200px"
              v-else
            >
              <span v-if="!isLoading">一键重算</span>
              <span v-else>重算中...</span>
            </h-button>
          </h-form-item>
        </h-form>
      </h-card>
    </h-col>
    <h-col span="4">
      <!--步骤条-->
      <stepbar v-if="refresh"></stepbar>
    </h-col>
  </h-row>
</template>

<script>
import stepbar from "../../components/stepbar.vue";
import core from "@hsui/core";
const dayjs = require("dayjs");
export default {
  components: {
    stepbar,
  },
  data() {
    return {
      pagination: {
        current: 1,
        "page-size": 10,
        total: 0,
      },
      isLoading: false,
      refresh: true,
      transLoading: true,
      transList: [],
      date: new Date(),
      queryProductId: "",
      searchResultProducts: [],
      //标记当前在哪个页面，1->申购 0->赎回
      pageSignal: 1,
      // 按钮样式
      type1: "primary",
      type2: null,
    };
  },
  computed: {
    title() {
      // 列表表头
      let amountTitle =
        this.pageSignal == 1 ? "申购金额 / 元" : "赎回份额 / 份";
      let calAmountTitle =
        this.pageSignal == 0 ? "清算后金额 / 元" : "清算后份额 / 份";
      return [
        {
          title: "用 户 账 号",
          key: "user_id",
          align: "center",
          //render渲染
          render: (h, { row: { user_id } }) =>
            h("span", {}, user_id.slice(-10)),
        },
        {
          title: "用 户 名 称",
          key: "user_name",
          align: "center",
          //render渲染
          render: (h, { row: { user_name } }) => h("span", {}, user_name),
        },
        {
          title: "产 品 代 码",
          key: "product_id",
          align: "center",
          //render渲染
          render: (h, { row: { product_id } }) => h("span", {}, product_id),
        },

        {
          title: "产 品 名 称",
          key: "product_name",

          align: "center",
          //render渲染
          render: (h, { row: { product_name } }) => h("span", {}, product_name),
        },
        {
          // 标题根据当前选中的按钮确定
          title: amountTitle,
          key: "amount",
          align: "center",
          sortable: true,
          render: (h, { row: { amount, count } }) =>
            this.pageSignal == 1
              ? h("span", { style: { color: "#d35400" } }, amount)
              : h("span", { style: { color: "#d35400" } }, count),
        },
        {
          title: calAmountTitle,
          key: "count",
          align: "center",
          sortable: true,
          render: (h, { row: { amount, count } }) => {
            if (this.pageSignal === 1) {
              if (count == null) {
                return h("span", { style: { color: "#bbbec4" } }, "待清算");
              } else {
                return h("span", { style: { color: "#2980b9" } }, count);
              }
            } else {
              if (amount == null) {
                return h("span", { style: { color: "#bbbec4" } }, "待清算");
              } else {
                return h("span", { style: { color: "#2980b9" } }, amount);
              }
            }
          },
        },
      ];
    },
    // day() {
    //   // 这里还没有设置工作日 后台传过来，然后显示
    //   return this.date.getDate();
    // },
    // month() {
    //   return this.date.getMonth() + 1;
    // },
    // year() {
    //   return this.date.getFullYear();
    // },
    isRollback() {
      return (
        dayjs().format("YYYY-MM-DD") > this.$store.state.workday.slice(0, 10)
      );
    },
    index() {
      return (this.pagination.current - 1) * this.pagination["page-size"];
    },
  },
  mounted() {
    if (this.steps.stat[2] == 0) this.steps.stat[2] = 1;
    // 刷新步骤条
    this.refreshStepBar();
    this.getTransList();
  },
  beforeDestroy() {
    // 如果没有处理完成，那么在结束时变回待处理状态
    if (this.steps.stat[2] == 1) this.steps.stat[2] = 0;
  },
  methods: {
    getPurchasePage() {
      // 切换页面
      this.pageSignal = 1;
      // 切换按钮样式
      this.type1 = "primary";
      this.type2 = null;
      this.getTransList();
    },
    getRedemptionPage() {
      this.pageSignal = 0;
      this.type1 = null;
      this.type2 = "primary";
      this.getTransList();
    },
    // remoteSearchProduct(query) {
    //   if (query !== "") {
    //     this.isLoading = true;
    //     setTimeout(() => {
    //       core
    //         .fetch({
    //           method: "get",
    //           url: "http://127.0.0.1:2022/api/product",
    //           data: {
    //             current: 1,
    //             pageSize: 99,
    //           },
    //         })
    //         .then((res) => {
    //           const { code, data } = res;
    //           if (code === 1) {
    //             this.isLoading = false;
    //             this.searchResultProducts = data.filter((product) =>
    //               product.id.includes(query)
    //             );
    //           }
    //         });
    //     }, 200);
    //   } else {
    //     this.searchResultProducts = [];
    //   }
    // },
    handleSubmit() {
      this.isLoading = true;
      if (this.isRollback) {
        this.calculateTrans();
      } else {
        this.checkTrans();
      }
      if (this.steps.stat[2] == 1) this.steps.stat[2] = 2;
      // 刷新步骤条
      this.refreshStepBar();
    },
    calculateTrans() {
      if (this.pageSignal === 1) {
        core
          .fetch({
            method: "post",
            url: `/apiLiq/purchase/updatePurchaseByDate/${this.$store.state.workday}`,
          })
          .then((res) => {
            if (res.code === 200) {
              this.transList = res.obj;
              this.isLoading = false;
              this.$hMessage.success("重算申购成功！");
            }
          });
      } else {
        core
          .fetch({
            method: "post",
            url: `/apiLiq/redemption/updateRedemptionByDate/${this.$store.state.workday}`,
          })
          .then((res) => {
            if (res.code === 200) {
              this.transList = res.obj;
              this.isLoading = false;
              this.$hMessage.success("重算赎回成功！");
            }
          });
      }
    },
    checkTrans() {
      if (this.pageSignal === 1) {
        core
          .fetch({
            method: "post",
            url: `/apiPtrans/purchase/doPurchase/${this.$store.state.workday}`,
          })
          .then((res) => {
            const { obj } = res;
            if (res.code === 200) {
              if (obj.length > 0) {
                this.transList = obj;
                this.$hMessage.success("清算申购成功！");
              } else {
                this.$hMessage.error("清算申购失败！");
                this.getTransList();
              }
              this.isLoading = false;
            }
          });
      } else {
        core
          .fetch({
            method: "get",
            url: `/apiRtrans/redemption/doRedemption/${this.$store.state.workday}`,
          })
          .then((res) => {
            if (res.code === 200) {
              this.isLoading = false;
              if (obj.length > 0) {
                this.transList = obj;
                this.$hMessage.success("清算赎回成功！");
              } else {
                this.$hMessage.error("清算赎回失败！");
                this.getTransList();
              }
            }
          });
      }
    },
    getCertainProduct(value) {},
    refreshStepBar() {
      this.refresh = false;
      this.$nextTick(() => (this.refresh = true));
    },
    getTransList() {
      this.transLoading = true;
      //申购列表
      if (this.pageSignal === 1) {
        core
          .fetch({
            method: "post",
            url: `/apiPtrans/ptrans/findByAll`,
            data: { state: 0 },
          })
          .then((res) => {
            const { code, obj } = res;
            if (code === 200) {
              this.transList = obj;
              this.transLoading = false;
            }
          });
      } else {
        //赎回列表
        core
          .fetch({
            method: "post",
            url: `/apiRtrans/rtrans/findByAll`,
            data: { state: 0 },
          })
          .then((res) => {
            const { code, obj } = res;
            if (code === 200) {
              this.transList = obj;
              this.transLoading = false;
            }
          });
      }
    },
    changePagination(page) {
      core
        .fetch({
          method: "get",
          url: `/api/product/findAllProduct/${this.index}/10`,
        })
        .then((res) => {
          const { code, data } = res;
          if (code === 1) {
            this.transList = data;
          }
        });
    },
  },
};
</script>

<style scoped>
.button-group {
  margin-left: 44%;
  padding-bottom: 10px;
}

form {
  text-align: center;
}

.dataDate {
  font-size: 115%;
  font-weight: bold;
}

.product-search {
  margin-right: 4.5vw;
  margin-bottom: 15px;
}

.pagination-wrap {
  margin-top: 12px;
  text-align: center;
}
</style>
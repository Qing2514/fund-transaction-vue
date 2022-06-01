<template>
  <div>
    <div class="content">
      <!-- 表格操作 -->
      <div class="content-left">
        <div class="product-search">
          <!-- 输入框 -->
          <div class="search-content">
            <h-select
              placeholder="请选择产品代码"
              ref="product_id"
              :maxlength="6"
              remote
              remoteIcon="search"
              filterable
              :remote-method="remoteSearchProduct"
              @on-change="getCertainProduct"
            >
              <h-option
                v-for="product in searchResultProducts"
                :key="product.id"
                :value="product.id"
                :label="product.id.slice(-10)"
              >
                <span>{{ product.id.slice(-10) }}</span>
                <span
                  style="
                    float: right;
                    color: #ccc;
                    position: absolute;
                    right: 15px;
                  "
                  >{{ product.name }}</span
                >
              </h-option>
            </h-select>
          </div>
        </div>
        <!-- 表格 -->
        <h-table
          :loading="productLoading"
          :columns="productColumns"
          :data="productList"
          :highlight-row="true"
          @on-current-change="handleCurrentChange"
        ></h-table>
        <h-button
          type="success"
          shape="circle"
          @click="getLatestWorth"
          :disabled="isDisabled"
          icon="order"
          class="btn-update"
        >
          <span v-if="!isLoading">更新行情</span>
          <span v-else>更新中...</span>
        </h-button>

        <!-- 分页 -->
        <!-- <div v-show="pagination.total > 0" class="pagination-wrap">
          <h-page v-bind="pagination" @on-change="changePagination"></h-page>
        </div> -->
        <div class="pagination-wrap">
          <h-page v-bind="pagination" @on-change="changePagination"></h-page>
        </div>
      </div>
      <div class="content-right">
        <div class="detail-content shadow">
          <h2>产品详情</h2>
          <ul>
            <li>产品名称：{{ data.name }}</li>
            <li>产品类型：{{ data.type }}</li>
            <li>风险等级：{{ data.security }}</li>
            <li v-if="data.detail">产品描述：{{ data.detail }}</li>
          </ul>
          <stepbar v-if="refresh" class="stepBar"></stepbar>
          <div id="Echart" class="myEchart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import core from "@hsui/core";
import { PRODUCT_TYPE_ORM, PRODUCT_SECURITY_ORM } from "../../constant/orm";
import stepbar from "../../components/stepbar.vue";
const dayjs = require("dayjs");

export default {
  components: {
    stepbar,
  },
  data() {
    this.productTypeOrm = PRODUCT_TYPE_ORM;
    this.productSecurityOrm = PRODUCT_SECURITY_ORM;

    return {
      data: {},
      trendData: [],
      productLoading: true,
      productMsgBoxVisible: false,
      productFormData: {},
      productColumns: [
        {
          title: "产品代码",
          key: "id",
          render: (h, { row: { id } }) => h("span", {}, id.slice(-10)),
        },
        {
          title: "产品名称",
          key: "name",
          render: (h, { row: { name } }) => h("span", {}, name),
        },
        {
          title: "产品净值/元",
          key: "networth",
          align: "center",
          render: (h, { row: { networth } }) => {
            return h("span", {}, networth);
          },
        },
        {
          title: "涨跌幅 / %",
          key: "prange",
          align: "center",
          sortable: true,
          //如果涨跌幅>0，则显示绿色，否则显示红色
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    color: params.row.prange >= 0 ? "#f5222d" : "#52c41a",
                  },
                },
                [
                  params.row.range > 0
                    ? "+" + params.row.prange + "%"
                    : params.row.prange + "%",
                ]
              ),
            ]);
          },
        },
      ],
      productList: [],
      pagination: {
        current: 1,
        "page-size": 10,
        total: 0,
      },
      id: "",
      searchResultProducts: [],
      refresh: true,
      isLoading: false,
      checkLoading: false,
      isDisabled: false,
    };
  },
  created() {
    this.getProductList();
  },
  mounted() {
    // 刷新步骤条
    if (this.steps.stat[1] == 0) this.steps.stat[1] = 1;
    this.refreshStepBar();
    // if (this.steps.stat[1] == 2) this.isDisabled = true;
    // 初始化
    this.echart = this.$echarts.init(document.getElementById("Echart"));
  },
  beforeDestroy() {
    if (this.steps.stat[1] == 1) this.steps.stat[1] = 0;
  },
  computed: {
    index() {
      return (this.pagination.current - 1) * this.pagination["page-size"];
    },
  },
  methods: {
    remoteSearchProduct(query) {
      if (query !== "" && query.length >= 4) {
        this.isLoading = true;
        setTimeout(() => {
          core
            .fetch({
              method: "get",
              url: `/apiProduct/product/findProductByIdBubble/${query}`,
            })
            .then((res) => {
              const { code, obj } = res;
              if (code === 200) {
                this.isLoading = false;
                this.searchResultProducts = obj;
              }
            });
        }, 200);
      } else {
        this.getProductList();
        this.searchResultProducts = [];
      }
    },
    getCertainProduct(value) {
      this.isLoading = true;
      core
        .fetch({
          method: "get",
          url: `/apiProduct/product/findProductByIdBubble/${value}`,
        })
        .then((res) => {
          const { code, obj } = res;
          if (code === 200) {
            this.isLoading = false;
            this.productList = obj;
          }
        });
    },
    //发送请求得到产品列表
    getProductList() {
      core
        .fetch({
          method: "get",
          url: `/apiProduct/product/findAllProduct/${this.index}/10`,
        })
        .then((res) => {
          const { code, obj } = res; // response中传回数据
          if (code === 200) {
            this.productLoading = false;
            this.productList = obj; // 得到数据
          }
          this.id = this.productList[0].id;
          this.getDetail();
          this.getTrendData();
        });
    },
    // 当点击某个产品时发送请求得到数据，显示其走势图
    getDetail() {
      core
        .fetch({
          method: "get",
          url: `/apiProduct/product/findProductById/${this.id}`,
        })
        .then((res) => {
          this.data = {
            ...this.data,
            ...res.obj,
          };
        });
    },
    getTrendData() {
      core
        .fetch({
          method: "get",
          url: `/apiProduct/trend/findTrendById/${this.id}`,
        })
        .then((res) => {
          this.trendData = [...res.obj];
          this.drawEchart();
        });
    },
    // 切换产品
    handleCurrentChange(currentRow) {
      this.id = currentRow.id;
      this.getDetail();
      this.getTrendData();
    },
    // 分页
    changePagination(page) {
      this.pagination.current = page;
      core
        .fetch({
          method: "get",
          url: `/apiProduct/product/findAllProduct/${this.index}/10`,
        })
        .then((res) => {
          const { code, obj } = res;
          if (code === 200) {
            this.productLoading = false;
            this.productList = obj;
          }
        });
    },
    drawEchart() {
      const dateList = this.trendData.map(function (item) {
        return item["id"];
      });
      const valueList = this.trendData.map(function (item) {
        return item["price"];
      });

      // 指定图表的配置项和数据

      const option = {
        // Make gradient line here
        visualMap: {
          show: false,
          type: "continuous",
          seriesIndex: 0,
          min: 0,
          max: 3,
        },
        title: {
          text: "历史净值",
        },
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          data: dateList,
        },
        yAxis: {
          type: "value",
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        series: {
          type: "line",
          showSymbol: false,
          data: valueList,
        },
      };
      // 使用刚指定的配置项和数据显示图表。
      this.echart.setOption(option);
    },
    // 点击按钮计算净值
    getLatestWorth() {
      this.isLoading = true;
      core
        .fetch({
          method: "post",
          url: `apiLiq/clearing/updateNetWorth/${this.$store.state.workday}`,
        })
        .then((res) => {
          const { code } = res;
          if (code === 200) {
            this.isLoading = false;
            this.$hMessage.success("更新成功！");
            this.getProductList();
            this.getTrendData();
          }
        });
      // 刷新步骤条
      if (this.steps.stat[1] == 1) this.steps.stat[1] = 2;
      this.refreshStepBar();

      this.isLoading = false;
      // this.isDisabled = true;
    },
    refreshStepBar() {
      this.refresh = false;
      this.$nextTick(() => {
        this.refresh = true;
      });
    },
  },
};
</script>

<style lang="less" scoped>
.content {
  display: flex;
  height: 80vh;
}
.content-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.pagination-wrap {
  margin-top: 12px;
  text-align: center;
}

.product-search {
  position: relative;
  margin-left: 1vw;
}

.search-content {
  display: flex;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 6px;
  margin-right: 40px;
}

.search-input {
  flex: 1;
  overflow: hidden;
  padding-right: 8px;
  border: none;
  background-color: transparent;
  box-shadow: none;
  color: #666;
  font-size: 14px;
  line-height: 20px;
  padding-right: 3px;
}
.search-btn {
  position: absolute;
  top: 9px;
  right: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  color: #666;
  line-height: 32px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #e3e5e7;
}

.btn-update {
  margin-top: 10px;
}

.content-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-left: 10px;

  h2 {
    font-size: 18px;
    margin: 15px;
  }

  ul {
    margin-bottom: 24px;
  }

  li {
    line-height: 30px;
  }
}
.detail-content {
  position: relative;
  padding-left: 10px;
}

.myEchart {
  width: 500px;
  height: 300px;
}

.stepBar {
  position: absolute;
  top: -40%;
  right: 10px;
}

.shadow {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 2px rgba(0, 0, 0, 0.12),
    0 4px 4px rgba(0, 0, 0, 0.12), 0 8px 8px rgba(0, 0, 0, 0.12),
    0 16px 16px rgba(0, 0, 0, 0.12);
}
</style>

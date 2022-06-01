<template>
  <div>
    <div class="content">
      <!-- 表格操作 -->
      <div class="content-left">
        <div class="product-search">
          <div class="search-content">
            <h-input
              v-model="searchValue"
              icon="close"
              placeholder="请输入您要查询的产品代码或名称..."
              style="width: 200px"
              class="search-input"
              @on-click="clearSearch"
              @on-change="querySearch"
            >
            </h-input>
          </div>
          <button class="search-btn" @click="querySearch">
            <h-icon name="android-search"></h-icon>
          </button>
        </div>
        <!-- 表格 -->
        <h-table
          :loading="productLoading"
          :columns="productColumns"
          :data="productList"
          :highlight-row="true"
          @on-current-change="handleCurrentChange"
        ></h-table>
        <!-- 分页 -->
        <div v-show="pagination.total > 0" class="pagination-wrap">
          <h-page v-bind="pagination" @on-change="changePagination"></h-page>
        </div>
      </div>
      <div class="content-right">
        <div class="detail-content shadow">
          <h-row>
            <h-col span="18"><h2>产品详情</h2></h-col>
            <h-col span="6"
              ><h-button
                class="pastTrendBtn"
                type="primary"
                shape="circle"
                @click="getPastTrend"
                >查看详情<h-icon name="enter"></h-icon></h-button
            ></h-col>
          </h-row>

          <ul>
            <li>产品代码：{{ data.id }}</li>
            <li>产品名称：{{ data.name }}</li>
            <li>产品类型：{{ data.type }}</li>
            <li>风险等级：{{ data.security }}</li>
            <!-- <li v-if="data.productDetail">
              产品描述：{{ data.productDetail }}
            </li> -->
          </ul>
          <div id="Echart" class="myEchart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import core from "@hsui/core";
import { PRODUCT_TYPE_ORM, PRODUCT_SECURITY_ORM } from "../../constant";

export default {
  data() {
    this.typeOrm = PRODUCT_TYPE_ORM;
    this.securityOrm = PRODUCT_SECURITY_ORM;
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
          title: "产品类型",
          key: "type",
          render: (h, { row: { type } }) => {
            return h("span", {}, type);
          },
        },
        {
          title: "产品风险等级",
          key: "security",
          render: (h, { row: { security } }) => {
            return h("span", {}, security);
          },
        },
      ],
      productList: [],
      pagination: {
        current: 1,
        "page-size": 10,
        total: 0,
      },
      searchValue: "",
      id: "",
      echart: null,
    };
  },
  created() {
    // 获取产品列表;
    this.getProductList();
  },

  mounted() {
    // 基于准备好的dom，初始化echarts实例
    this.echart = this.$echarts.init(document.getElementById("Echart"));
  },
  computed: {
    index() {
      return (this.pagination.current - 1) * this.pagination["page-size"];
    },
  },
  methods: {
    //搜索框清空
    clearSearch() {
      this.searchValue = "";
      this.getProductList();
    },
    //搜索框模糊搜索
    querySearch() {
      this.getProductList();
    },

    getProductList() {
      core
        .fetch({
          method: "get",
          url: `/apiProduct//product/findAllProduct/${this.index}/10`,
        })
        .then((res) => {
          const { code, obj } = res;
          if (code === 200) {
            this.productLoading = false;
            this.productList = obj;
          }
          if (this.searchValue != "") {
            this.productList = this.productList.filter(
              (item) =>
                //判断id是否包含搜索值
                item.name.includes(this.searchValue) ||
                item.id.slice(-10).includes(this.searchValue)
            );
          }
          this.id = this.productList[0].id;
          this.getDetail();
          this.getTrendData();
        });
    },

    getDetail() {
      core
        .fetch({
          method: "get",
          url: `/apiProduct//product/findProductById/${this.id}`,
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

    handleCurrentChange(currentRow) {
      this.id = currentRow.id;
      this.getDetail();
      this.getTrendData();
      this.drawEchart();
    },

    // 分页
    changePagination(page) {
       this.pagination.current = page;
      core
        .fetch({
          method: "get",
          url: `/apiProduct/product/${this.index}/10`,
          data: {
            current: page,
            pageSize: 10,
          },
        })
        .then((res) => {
          const { code, data, pagination } = res;
          if (code === 1) {
            this.productLoading = false;
            this.productList = data;
            this.pagination = {
              ...pagination,
            };
          }
        });
    },
    getPastTrend() {
      this.$router.push({
        path: `/product/${this.id}`,
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
  },
};
</script>

<style lang="less" scoped>
.content {
  display: flex;
  height: 80vh;
}
.content-left {
  width: 100%;
  flex: 1;
  width: 50%;
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
  padding-left: 30px;
}
.pastTrendBtn {
  margin-top: 20px;
}

.myEchart {
  width: 500px;
  height: 300px;
}

.shadow {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 2px rgba(0, 0, 0, 0.12),
    0 4px 4px rgba(0, 0, 0, 0.12), 0 8px 8px rgba(0, 0, 0, 0.12),
    0 16px 16px rgba(0, 0, 0, 0.12);
}
</style>

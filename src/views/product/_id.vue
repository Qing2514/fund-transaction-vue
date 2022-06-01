<template>
  <div class="product-detail">
    <div class="detail-content">
      <h2>产品详情页</h2>
      <ul>
        <li>产品代码：{{ data.id }}</li>
        <li>产品名称：{{ data.name }}</li>
        <li>产品类型：{{ data.type }}</li>
        <li>风险等级：{{ data.security }}</li>
        <li v-if="data.detail">产品描述：{{ data.detail }}</li>
      </ul>
      <div id="lineEchart" class="line-echart"></div>
    </div>
  </div>
</template>

<script>
import core from "@hsui/core";
import { PRODUCT_TYPE_ORM, PRODUCT_SECURITY_ORM } from "../../constant";

export default {
  data() {
    this.productTypeOrm = PRODUCT_TYPE_ORM;
    this.productSecurityOrm = PRODUCT_SECURITY_ORM;
    return {
      data: {},
      trendData: [],
    };
  },
  created() {
    const { params: { id } = {} } = this.$route;
    //产品信息查询
    core
      .fetch({
        method: "get",
        url: `/apiProduct//product/findProductById/${id}`,
      })
      .then((res) => {
        this.data = {
          ...this.data,
          ...res.obj,
        };
      });
    //净值走势
    core
      .fetch({
        method: "get",
        url: `/apiProduct//trend/findTrendById/${id}`,
      })
      .then((res) => {
        this.trendData = [...this.trendData, ...res.obj];
        this.drawLineEchart();
      });
  },
  mounted() {},
  methods: {
    drawLineEchart() {
      const dateList = this.trendData.map((item) => item["id"]);
      const valueList = this.trendData.map((item) => item["price"]);
      // 基于准备好的dom，初始化echarts实例
      var echart = this.$echarts.init(document.getElementById("lineEchart"));

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
          left: "center",
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
      echart.setOption(option);
    },
  },
};
</script>

<style lang="less" scoped>
.product-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h2 {
    font-size: 18px;
    margin-bottom: 24px;
  }

  ul {
    margin-bottom: 24px;
  }

  li {
    line-height: 30px;
  }
}

.line-echart {
  width: 600px;
  height: 400px;
}
</style>
